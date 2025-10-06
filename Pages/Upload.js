
import React, { useState, useEffect } from "react";
import { BankStatement } from "@/entities/BankStatement";
import { Subscription } from "@/entities/Subscription";
import { User } from "@/entities/User";
import { Account } from "@/entities/Account";
import { UploadFile, ExtractDataFromUploadedFile, InvokeLLM } from "@/integrations/Core";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Upload as UploadIcon, FileText, Lock, CheckCircle, AlertCircle, Trash2, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { PasswordInput } from "@/components/ui/PasswordInput";

const SA_BANKS = [
  "Standard Bank",
  "FNB",
  "ABSA",
  "Nedbank",
  "Capitec",
  "Discovery Bank",
  "TymeBank",
  "African Bank",
  "Other"
];

export default function Upload() {
  const navigate = useNavigate();
  // State for multiple files
  const [files, setFiles] = useState([]);
  // Global statement period for the batch
  const [statementPeriod, setStatementPeriod] = useState("");
  // State for overall batch processing
  const [isProcessingBatch, setIsProcessingBatch] = useState(false);
  // Global error for the page
  const [error, setError] = useState(null);
  const [activeAccount, setActiveAccount] = useState(null);
  // State to indicate if the entire batch processing is complete
  const [batchComplete, setBatchComplete] = useState(false);

  useEffect(() => {
    loadAccountData();
  }, []);

  const loadAccountData = async () => {
    try {
      const activeAccountId = localStorage.getItem('activeAccountId');
      if (!activeAccountId) {
        setError("No active account selected. Please select an account from the dashboard.");
        return;
      }
      const account = await Account.get(activeAccountId);
      setActiveAccount(account);
    } catch (error) {
      if (error.message && error.message.includes('not found')) {
          localStorage.removeItem('activeAccountId');
          window.location.reload();
          return;
      }
      console.error("Error loading account:", error);
      setError("Failed to load account details. Please try again.");
    }
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    
    // Enforce file limit
    if (files.length + selectedFiles.length > 100) {
        setError("You can upload a maximum of 100 files at a time.");
        return;
    }

    const newFiles = selectedFiles.map((file, index) => ({
      id: Date.now() + index, // Unique ID for each file object
      file,
      bankName: "",
      isPasswordProtected: false,
      password: "",
      progress: 0,
      status: "pre-analyzing", // New status for initial check
      error: null,
      file_url: null, // To store uploaded URL
    }));

    // Filter out non-PDF files if any were selected
    const pdfFiles = newFiles.filter(f => f.file.type === "application/pdf");
    if (pdfFiles.length !== newFiles.length) {
        setError("Some selected files were not PDFs and have been ignored.");
    }

    setFiles(prev => [...prev, ...pdfFiles]);
    pdfFiles.forEach(fileData => preAnalyzeFile(fileData.id));
  };
  
  // Helper to update state for a specific file in the array
  const updateFileState = (id, updates) => {
    setFiles(prev => prev.map(f => f.id === id ? { ...f, ...updates } : f));
  };

  // Helper to remove a file from the list
  const removeFile = (id) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  const preAnalyzeFile = async (id) => {
    // This hacky way of getting fileData is to ensure we have the latest state,
    // as setFiles is async and `files` might not be updated immediately after setFiles is called.
    const fileData = files.find(f => f.id === id) || (await new Promise(resolve => setTimeout(() => resolve(files.find(f => f.id === id)), 0)));
    if (!fileData) return;

    try {
        // 1. Upload file to get URL
        const { file_url } = await UploadFile({ file: fileData.file });
        updateFileState(id, { file_url: file_url, progress: 25 });

        // 2. Attempt to extract minimal data to check for password and bank
        const preAnalysisResult = await ExtractDataFromUploadedFile({
            file_url,
            json_schema: {
                type: "object",
                properties: { bank_name: { type: "string" } }
            }
        });

        if (preAnalysisResult.status === "error") {
            // Check if it's a password error
            if (preAnalysisResult.details && preAnalysisResult.details.toLowerCase().includes("password")) {
                updateFileState(id, { status: "needs_password", isPasswordProtected: true, progress: 50, error: "Password required" });
            } else {
                // Other extraction error, let user select manually
                updateFileState(id, { status: "pending", progress: 100, error: "Couldn't auto-detect bank." });
            }
        } else {
            // Success! We might have a bank name.
            const detectedBank = SA_BANKS.find(b => preAnalysisResult.output?.bank_name?.toLowerCase().includes(b.toLowerCase()));
            updateFileState(id, { 
                status: "pending", 
                progress: 100, 
                bankName: detectedBank || "" 
            });
        }
    } catch (e) {
        console.error(`Pre-analysis failed for ${fileData.file.name}:`, e);
        updateFileState(id, { status: "pending", error: "Pre-analysis failed. Please select bank manually." });
    }
  };

  // Function to process a single file (extracted from the original handleUpload logic)
  const processSingleFile = async (fileData) => {
    const { id, file, bankName, isPasswordProtected, password, file_url } = fileData;
    const activeAccountId = localStorage.getItem('activeAccountId');

    if (!bankName) {
        updateFileState(id, { status: "error", error: "Bank name is required." });
        return; // Stop processing this file
    }
    if (isPasswordProtected && !password) {
        updateFileState(id, { status: "error", error: "Password is required for this file." });
        return; // Stop processing this file
    }
    // Ensure file_url is available from pre-analysis
    if (!file_url) {
        updateFileState(id, { status: "error", error: "File URL not available. Please try re-uploading." });
        return;
    }


    updateFileState(id, { status: "processing", progress: 10, error: null }); // Clear previous error

    try {
        // File is already uploaded during pre-analysis, use the stored file_url
        // No need to call UploadFile again
        updateFileState(id, { progress: 30 }); // Adjust progress as upload is already done

        // 2. Create statement record
        const statement = await BankStatement.create({
            account_id: activeAccountId,
            file_url,
            file_name: file.name,
            bank_name: bankName,
            statement_period: statementPeriod, // Use global statement period for all files in batch
            is_password_protected: isPasswordProtected,
            processing_status: "processing"
        });
        updateFileState(id, { progress: 40 });

        // 3. Extract and analyze data
        const extractedData = await ExtractDataFromUploadedFile({
            file_url,
            password: isPasswordProtected ? password : undefined, // Pass password if file is protected
            json_schema: {
                type: "object",
                properties: {
                    transactions: {
                        type: "array",
                        items: {
                            type: "object",
                            properties: {
                                date: { type: "string" },
                                description: { type: "string" },
                                amount: { type: "number" },
                                balance: { type: "number" },
                                type: { type: "string", enum: ["debit", "credit"] }
                            }
                        }
                    },
                    opening_balance: { type: "number" },
                    closing_balance: { type: "number" }
                }
            }
        });

        if (extractedData.status === "error") {
            throw new Error(extractedData.details || "Failed to extract data from PDF");
        }
        updateFileState(id, { progress: 60 });
        
        // 4. Generate AI insights
        const insights = await InvokeLLM({
            prompt: `Analyze this South African bank statement data and provide:
1. Total income (sum of all credit transactions) in ZAR
2. Total expenses (sum of all debit transactions) in ZAR
3. Spending by category (categorize expenses into: groceries, transport, utilities, entertainment, healthcare, shopping, dining, insurance, loans, savings, other)
4. Top 5 recommendations for better budgeting specific to South African context
5. Unusual spending patterns or alerts

Bank: ${bankName}
Period: ${statementPeriod}
Data: ${JSON.stringify(extractedData.output)}`,
            response_json_schema: {
                type: "object",
                properties: {
                    total_income: { type: "number" },
                    total_expenses: { type: "number" },
                    categories: { type: "object" },
                    recommendations: { type: "array", items: { type: "string" } },
                    alerts: { type: "array", items: { type: "string" } }
                }
            }
        });
        updateFileState(id, { progress: 80 });

        // 5. Update statement with insights
        await BankStatement.update(statement.id, {
            processing_status: "completed",
            extracted_data: extractedData.output,
            ai_insights: insights
        });
        updateFileState(id, { progress: 100, status: "completed" });

    } catch (e) {
        console.error(`Error processing file ${file.name}:`, e);
        updateFileState(id, { status: "error", error: e.message || "An unknown error occurred." });
    }
  };

  const handleProcessBatch = async () => {
    // Basic validation before starting the batch
    if (!statementPeriod) {
      setError("Please specify the statement period for this batch.");
      return;
    }
    if (files.length === 0) {
        setError("Please select at least one file to upload.");
        return;
    }
    if (!activeAccount) {
        setError("No active account selected. Please refresh the page or select an account.");
        return;
    }
    if (files.some(f => f.status === 'pre-analyzing')) {
        setError("Please wait for all files to be pre-analyzed before processing the batch.");
        return;
    }

    // Reset general error, set batch processing flag
    setError(null);
    setIsProcessingBatch(true);
    setBatchComplete(false);

    // Process each file concurrently
    // Using Promise.allSettled to ensure all promises resolve/reject,
    // allowing us to continue even if one file fails.
    await Promise.allSettled(files.map(fileData => processSingleFile(fileData)));
    
    setIsProcessingBatch(false);
    setBatchComplete(true);
  };
  
  const handleRetryWithPassword = async (id) => {
      const fileToRetry = files.find(f => f.id === id);
      if (fileToRetry && fileToRetry.password) {
          // Clear any previous error and set status to processing, then re-process this single file
          await processSingleFile({ ...fileToRetry, status: 'processing', error: null });
      } else {
          updateFileState(id, { error: "Please enter a password before retrying." });
      }
  };

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Upload Bank Statements
        </h1>
        <p className="text-muted-foreground">
          Upload one or more PDF statements for AI-powered analysis. Secure and encrypted.
        </p>
      </div>

      {batchComplete ? (
        <Card className="text-center shadow-xl">
          <CardContent className="py-12">
            <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-foreground mb-2">
              Batch Processed!
            </h3>
            <p className="text-muted-foreground mb-6">
              All statements have been processed. Check your dashboard for updated insights.
            </p>
            <Button onClick={() => navigate(createPageUrl("Dashboard"))}>Go to Dashboard</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="w-4 h-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Batch Controls */}
            <Card className="shadow-xl">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-primary" />
                    Batch Details
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label>Statement Period for all uploads *</Label>
                        <Input
                            type="text"
                            placeholder="e.g., January 2024"
                            value={statementPeriod}
                            onChange={(e) => setStatementPeriod(e.target.value)}
                            disabled={isProcessingBatch}
                        />
                    </div>
                    <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary transition-colors">
                        <Input
                        type="file"
                        accept=".pdf"
                        onChange={handleFileChange}
                        className="hidden"
                        id="file-upload"
                        multiple // Allow multiple file selection
                        disabled={isProcessingBatch}
                        />
                        <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center">
                        <UploadIcon className="w-12 h-12 text-muted-foreground mb-3" />
                        <p className="font-medium text-foreground mb-1">
                            Click to upload or drag and drop statements
                        </p>
                        <p className="text-sm text-muted-foreground">PDF files only (Max 100 files)</p>
                        </label>
                    </div>
                </CardContent>
            </Card>
            
            {/* Files List */}
            {files.length > 0 && (
