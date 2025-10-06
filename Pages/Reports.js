
import React, { useState, useEffect } from "react";
import { FinancialReport } from "@/entities/FinancialReport";
import { BankStatement } from "@/entities/BankStatement";
import { User } from "@/entities/User";
import { Subscription } from "@/entities/Subscription";
import { Account } from "@/entities/Account";
import { SharedReport } from "@/entities/SharedReport";
import { InvokeLLM, SendEmail } from "@/integrations/Core";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  FileText,
  Download,
  Plus,
  TrendingUp,
  AlertCircle,
  Sparkles,
  FileSpreadsheet,
  Loader2,
  CheckCircle,
  RotateCw,
  Mail,
  MessageSquare,
  Calendar as CalendarIcon,
} from "lucide-react";
import { downloadPDF } from "../components/reports/PDFGenerator";
import { format, add } from "date-fns";
import { useAlert } from "@/components/AlertProvider";

const REPORT_TYPES = [
  { value: "cashflow", label: "Cashflow Statement", icon: TrendingUp, accountType: "both" },
  { value: "balance_sheet", label: "Balance Sheet", icon: FileText, accountType: "both" },
  { value: "income_statement", label: "Income Statement", icon: FileText, accountType: "both" },
  { value: "trial_balance", label: "Trial Balance", icon: FileText, accountType: "business" },
  { value: "sars_personal_tax", label: "SARS Personal Tax Summary (IT12)", icon: FileText, accountType: "personal" },
  { value: "sars_it14", label: "SARS IT14 Corporate Tax", icon: FileText, accountType: "business" },
  { value: "sars_vat201", label: "SARS VAT201 Return", icon: FileText, accountType: "business" },
  { value: "sars_emp201", label: "SARS EMP201 (PAYE, UIF, SDL)", icon: FileText, accountType: "business" },
  { value: "annual_financial_statements", label: "Annual Financial Statements", icon: FileText, accountType: "business" },
];

const TIER_FEATURES = {
  personal_basic: { can_download: true, budgeting_tools: true, expenditure_analysis: false, cashflow_statements: false, sars_reporting: false, full_access: false },
  personal_standard: { can_download: true, budgeting_tools: true, expenditure_analysis: true, cashflow_statements: false, sars_reporting: false, full_access: false },
  personal_premium: { can_download: true, budgeting_tools: true, expenditure_analysis: true, cashflow_statements: true, sars_reporting: true, full_access: false },
  personal_enterprise: { can_download: true, budgeting_tools: true, expenditure_analysis: true, cashflow_statements: true, sars_reporting: true, full_access: true },
  business_basic: { can_download: true, budgeting_tools: true, expenditure_analysis: false, cashflow_statements: false, sars_reporting: false, full_access: false },
  business_standard: { can_download: true, budgeting_tools: true, expenditure_analysis: true, cashflow_statements: false, sars_reporting: false, full_access: false },
  business_premium: { can_download: true, budgeting_tools: true, expenditure_analysis: true, cashflow_statements: true, sars_reporting: true, full_access: false },
  business_enterprise: { can_download: true, budgeting_tools: true, expenditure_analysis: true, cashflow_statements: true, sars_reporting: true, full_access: true },
};

export default function Reports() {
  const [reports, setReports] = useState([]);
  const [statements, setStatements] = useState([]);
  const [subscription, setSubscription] = useState(null);
  const [user, setUser] = useState(null);
  const [activeAccount, setActiveAccount] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDownloading, setIsDownloading] = useState(null);
  const [isSendingEmail, setIsSendingEmail] = useState(null);
  const [isSendingWhatsApp, setIsSendingWhatsApp] = useState(null);
  const [selectedType, setSelectedType] = useState("");
  const [selectedPeriod, setSelectedPeriod] = useState("");
  const [selectedDate, setSelectedDate] = useState(null);
  const { showAlert } = useAlert();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const activeAccountId = localStorage.getItem('activeAccountId');
      if (!activeAccountId) {
          setIsLoading(false);
          return;
      }
      const currentUser = await User.me();
      setUser(currentUser);
      
      const [subs, userReports, userStatements, account] = await Promise.all([
        Subscription.filter({ account_id: activeAccountId }, "-created_date", 1),
        FinancialReport.filter({ account_id: activeAccountId }, "-created_date"),
        BankStatement.filter({ account_id: activeAccountId, processing_status: "completed" }, "-created_date"),
        Account.get(activeAccountId)
      ]);

      if (subs.length > 0) {
        setSubscription(subs[0]);
      } else {
        setSubscription(null);
      }
      setReports(userReports);
      setStatements(userStatements);
      setActiveAccount(account);
    } catch (error) {
      console.error("Error loading data:", error);
    }
    setIsLoading(false);
  };

  const canGenerateReport = (reportType) => {
    if (!subscription) return false;
    
    const features = subscription.features || TIER_FEATURES[subscription.tier];
    if (!features) return false;
    
    if (features.full_access) return true;

    if (reportType.startsWith("sars_")) {
      return features.sars_reporting;
    }
    
    switch (reportType) {
      case "cashflow":
      case "balance_sheet":
      case "income_statement":
        return features.cashflow_statements;
      case "trial_balance":
      case "annual_financial_statements":
        return features.sars_reporting;
      default:
        return features.expenditure_analysis;
    }
  };

  const canDownload = () => {
    if (!subscription) return false;
    
    const features = subscription.features || TIER_FEATURES[subscription.tier];
    if (!features) return false;
    
    return features.can_download || features.full_access;
  };

  const getAvailableReportTypes = () => {
    if (!activeAccount) return REPORT_TYPES;
    
    return REPORT_TYPES.filter(type => {
      if (type.accountType === "both") return true;
      return type.accountType === activeAccount.account_type;
    });
  };

  const calculateSARSTax = (income) => {
    const brackets = [
      { min: 0, max: 237100, rate: 0.18, base: 0 },
      { min: 237101, max: 370500, rate: 0.26, base: 42678 },
      { min: 370501, max: 512800, rate: 0.31, base: 77362 },
      { min: 512801, max: 673000, rate: 0.36, base: 121475 },
      { min: 673001, max: 857900, rate: 0.39, base: 179147 },
      { min: 857901, max: 1817000, rate: 0.41, base: 251258 },
      { min: 1817001, max: Infinity, rate: 0.45, base: 644489 }
    ];

    let totalCalculatedTax = 0;
    const applicableBrackets = [];

    for (const bracket of brackets) {
      if (income > bracket.min) {
        const taxableInBracket = Math.min(income, bracket.max) - bracket.min;
        const taxForThisTier = taxableInBracket * bracket.rate;
        
        totalCalculatedTax = bracket.base + taxForThisTier;
        
        applicableBrackets.push({
          bracket_range: `R${bracket.min.toLocaleString('en-ZA', {minimumFractionDigits: 0, maximumFractionDigits: 0})} - R${bracket.max === Infinity ? '∞' : bracket.max.toLocaleString('en-ZA', {minimumFractionDigits: 0, maximumFractionDigits: 0})}`,
          rate: `${(bracket.rate * 100).toFixed(0)}%`,
          taxable_amount_in_tier: taxableInBracket,
          tax_for_this_tier: taxForThisTier,
          cumulative_tax_up_to_this_tier: totalCalculatedTax
        });

        if (income <= bracket.max) {
          break;
        }
      }
    }
    
    const primaryRebate = 17235; 
    let netTaxPayable = Math.max(0, totalCalculatedTax - primaryRebate);

    return { tax: netTaxPayable, applicableBrackets: applicableBrackets };
  };

  const handleGenerateReport = async () => {
    const activeAccountId = localStorage.getItem('activeAccountId');
    if (!selectedType || !selectedPeriod || !activeAccount) {
      return;
    }

    if (!canGenerateReport(selectedType)) {
      showAlert("Upgrade Required", "Please upgrade your subscription to generate this report type", "error");
      return;
    }

    setIsGenerating(true);

    try {
      const relevantStatements = statements.filter(s => 
        s.statement_period === selectedPeriod
      );

      if (relevantStatements.length === 0) {
        showAlert("No Data", "No statements found for this period. Please upload statements first.", "error");
        setIsGenerating(false);
        return;
      }

      const combinedData = relevantStatements.map(s => s.extracted_data);
      const isSARSReport = selectedType.startsWith("sars_");
      const isBusinessAccount = activeAccount?.account_type === 'business';
      
      let totalIncome = 0;
      let totalExpenses = 0;
      let vatCollected = 0;
      let vatPaid = 0;
      let paye = 0;
      let uif = 0;
      let sdl = 0;

      relevantStatements.forEach(s => {
        if (s.ai_insights) {
          totalIncome += s.ai_insights.total_income || 0;
          totalExpenses += s.ai_insights.total_expenses || 0;
          vatCollected += s.ai_insights.total_vat_collected || 0;
          vatPaid += s.ai_insights.total_vat_paid || 0;
          paye += s.ai_insights.total_paye || 0;
          uif += s.ai_insights.total_uif || 0;
          sdl += s.ai_insights.total_sdl || 0;
        }
      });

      const taxableIncomeForPersonal = totalIncome - totalExpenses; 
      
      let reportPrompt = `Generate a professional ${selectedType.replace(/_/g, ' ')} for the period ${selectedPeriod}.`;
      
      if (selectedType === "sars_it14" && isBusinessAccount) {
        // New, more detailed prompt for Business ITR14
        reportPrompt = `Act as a South African Chartered Accountant. Generate a comprehensive data summary formatted for a SARS ITR14 (Income Tax Return for Companies) for the period ${selectedPeriod}.
        
        Company Details:
        - Company Name: ${activeAccount?.company_name || 'N/A'}
        - Registration No: ${activeAccount?.company_registration || 'N/A'}
        - Tax Number: ${activeAccount?.tax_number || 'N/A'}
        - VAT Number: ${activeAccount?.vat_number || 'N/A'}

        Based on the provided bank statement data, structure the output into the main components of an ITR14 form. Use this high-level summary:
        - Total Credits (Income/Turnover): R ${totalIncome.toLocaleString('en-ZA', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
        - Total Debits (Expenditure): R ${totalExpenses.toLocaleString('en-ZA', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
        
        Full Transaction Data: ${JSON.stringify(combinedData)}

        Your Task is to generate a structured JSON object with the following sections:
        1.  **Income Statement:**
            - Calculate 'Turnover/Sales'.
            - Estimate 'Cost of Sales' if possible from the data, otherwise state as R0.
            - Calculate 'Gross Profit'.
            - List all 'Expense Items' categorized from transactions (e.g., Salaries, Rent, Bank Charges, Repairs, Marketing, Legal Fees).
            - Calculate 'Net Profit / (Loss)' before tax.
        2.  **Tax Computation:**
            - Start with the 'Net Profit / (Loss)'.
            - List 'Adjustments: Added Back' (identify non-deductible items like Depreciation, Entertainment, Donations).
            - List 'Adjustments: Allowable' (if any can be determined).
            - Calculate the 'Taxable Income'.
            - Calculate the 'Estimated Corporate Income Tax (CIT)' payable based on the taxable income (use the standard CIT rate for the period, e.g., 27% for most SA companies).
        3. **SARS-Specific Liabilities (from bank data):**
            - Net VAT Payable: R ${(vatCollected - vatPaid).toLocaleString('en-ZA', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
            - Total EMP201 Liability: R ${(paye + uif + sdl).toLocaleString('en-ZA', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
        
        Provide a clear, well-structured JSON output. All financial figures must be in ZAR.`;
      } else if (isSARSReport) {
        // Existing SARS report logic for other SARS types (VAT, EMP201) and personal tax
        const { tax: calculatedPersonalTax, applicableBrackets } = 
          selectedType === "sars_personal_tax" ? calculateSARSTax(taxableIncomeForPersonal) : { tax: 0, applicableBrackets: [] };
        
        reportPrompt += `\n\nThis is a SARS-compliant report for South African Revenue Service (SARS).
        Account Type: ${activeAccount?.account_type}
        Taxpayer Details:
        ${activeAccount?.account_type === "personal" ? `  - Full Name: ${user?.full_name || 'N/A'}\n  - ID Number: ${activeAccount?.id_number || 'N/A'}` : `  - Company Name: ${activeAccount?.company_name || 'N/A'}\n  - Registration No.: ${activeAccount?.company_registration || 'N/A'}`}
        - Tax Number: ${activeAccount?.tax_number || "N/A"}
        ${activeAccount?.vat_number ? `- VAT Number: ${activeAccount?.vat_number || 'N/A'}` : ""}
        
        Report Period (Tax Year): ${selectedPeriod}
        
        Financial Summary for SARS:
        - Total Gross Income: R ${totalIncome.toLocaleString('en-ZA', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
        - Total Allowable Expenses/Deductions: R ${totalExpenses.toLocaleString('en-ZA', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
        - Net Taxable Income: R ${taxableIncomeForPersonal.toLocaleString('en-ZA', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
        ${selectedType === "sars_personal_tax" ? `- Estimated Income Tax Payable: R ${calculatedPersonalTax.toLocaleString('en-ZA', {minimumFractionDigits: 2, maximumFractionDigits: 2})}` : ""}
        
        ${activeAccount?.vat_number && (selectedType === "sars_vat201" || selectedType === "sars_it14") ? `
        VAT Summary (if registered for VAT):
        - Output Tax (VAT Collected): R ${vatCollected.toLocaleString('en-ZA', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
        - Input Tax (VAT Paid): R ${vatPaid.toLocaleString('en-ZA', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
        - Net VAT Payable (or Refundable): R ${(vatCollected - vatPaid).toLocaleString('en-ZA', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
        ` : ""}
        
        ${activeAccount?.account_type === "business" && selectedType === "sars_emp201" ? `
        EMP201 Summary:
        - PAYE (Pay As You Earn): R ${paye.toLocaleString('en-ZA', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
        - UIF (Unemployment Insurance Fund): R ${uif.toLocaleString('en-ZA', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
        - SDL (Skills Development Levy): R ${sdl.toLocaleString('en-ZA', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
        - Total EMP201 Liability: R ${(paye + uif + sdl).toLocaleString('en-ZA', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
        ` : ""}

        Tax Brackets Applied (for personal income tax): ${JSON.stringify(applicableBrackets)}
        
        Instructions for AI:
        1. Structure the report as an official SARS document (e.g., IT12, IT14, VAT201, EMP201).
        2. Include a prominent SARS header (logo placeholder, document title, tax year).
        3. Detail all taxpayer information as provided.
        4. Provide a clear breakdown of income sources and allowable deductions based on the bank statement data, categorized for SARS compliance.
        5. Include official SARS forms sections where appropriate (e.g., Declaration, Payment Details, Banking Details).
        ${selectedType === "sars_personal_tax" ? "6. Clearly show the income tax calculation with applicable brackets and rebates." : ""}
        ${selectedType === "sars_it14" ? "6. Provide a detailed corporate income statement and balance sheet summary for IT14." : ""}
        ${selectedType === "sars_vat201" ? "6. Populate a mock VAT201 form with output tax, input tax, and net VAT due." : ""}
        ${selectedType === "sars_emp201" ? "6. Detail PAYE, UIF, and SDL contributions for an EMP201 return." : ""}
        7. Use official SARS terminology and formatting standards (e.g., ZAR currency, decimal places).
        8. Advise on any missing information or potential compliance issues.
        9. Ensure all figures are accurate based on the provided data.
        `;
      } else {
        reportPrompt += `\n\nUse this bank statement data: ${JSON.stringify(combinedData)}
        
        Create a detailed financial report with:
        1. All relevant financial metrics in South African Rands (ZAR)
        2. Clear categorization
        3. Opening and closing balances
        4. Period-over-period comparisons if applicable
        5. Key insights and recommendations
        
        Format the output as a structured financial document.`;
      }

      const aiResponse = await InvokeLLM({
        prompt: reportPrompt,
        response_json_schema: {
          type: "object",
          properties: {
            report_title: { type: "string" },
            period: { type: "string" },
            summary: { type: "string" },
            line_items: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  category: { type: "string" },
                  amount: { type: "number" },
                  notes: { type: "string" }
                }
              }
            },
            totals: {
              type: "object",
              properties: {
                total_assets: { type: "number" },
                total_liabilities: { type: "number" },
                net_position: { type: "number" }
              }
            },
            recommendations: {
              type: "array",
              items: { type: "string" }
            },
            sars_specific_sections: { // This will be used for general SARS reports
              type: "array",
              items: {
                type: "object",
                properties: {
                  section_title: { type: "string" },
                  content: { type: "string" }
                }
              }
            },
            "Income Statement": { // For ITR14
                type: "object",
                properties: {
                    "Turnover/Sales": { type: "number" },
                    "Cost of Sales": { type: "number" },
                    "Gross Profit": { type: "number" },
                    "Expense Items": { type: "object", additionalProperties: { type: "number" } },
                    "Net Profit / (Loss) before tax": { type: "number" },
                }
            },
            "Tax Computation": { // For ITR14
                type: "object",
                properties: {
                    "Net Profit / (Loss)": { type: "number" },
                    "Adjustments: Added Back": { type: "object", additionalProperties: { type: "number" } },
                    "Adjustments: Allowable": { type: "object", additionalProperties: { type: "number" } },
                    "Taxable Income": { type: "number" },
                    "Estimated Corporate Income Tax (CIT)": { type: "number" },
                }
            },
            "SARS-Specific Liabilities": { // For ITR14
                type: "object",
                properties: {
                    "Net VAT Payable": { type: "number" },
                    "Total EMP201 Liability": { type: "number" },
                }
            }
          }
        }
      });

      let sarsCompliance = null;

      if (isSARSReport) {
          if (selectedType === "sars_it14" && isBusinessAccount) {
              // Specific structure for ITR14 business report
              sarsCompliance = {
                  taxpayer_details: {
                      account_type: activeAccount?.account_type,
                      company_name: activeAccount?.company_name,
                      company_registration: activeAccount?.company_registration,
                      tax_number: activeAccount?.tax_number,
                      vat_number: activeAccount?.vat_number,
                  },
                  sars_ready: true,
                  // For ITR14, the AI response itself contains the structured sections like Income Statement, Tax Computation
                  report_type_specific: aiResponse, 
                  // We can still add a high-level financial summary for consistency
                  financial_summary: {
                      gross_income: totalIncome,
                      allowable_expenses: totalExpenses,
                      net_taxable_income: taxableIncomeForPersonal, // This might be refined by the AI's tax computation
                  },
                  tax_calculations: {
                      vat_collected: vatCollected,
                      vat_paid: vatPaid,
                      net_vat_payable: vatCollected - vatPaid,
                      paye: paye,
                      uif: uif,
                      sdl: sdl,
                      total_emp201: paye + uif + sdl
                  },
              };
          } else {
              // Existing SARS report logic for other SARS types (VAT, EMP201) and personal tax
              const { tax: calculatedPersonalTax, applicableBrackets } = 
                  selectedType === "sars_personal_tax" ? calculateSARSTax(taxableIncomeForPersonal) : { tax: 0, applicableBrackets: [] };
              
              sarsCompliance = {
                  taxpayer_details: {
                      account_type: activeAccount?.account_type,
                      full_name: user?.full_name,
                      id_number: activeAccount?.id_number,
                      company_name: activeAccount?.company_name,
                      company_registration: activeAccount?.company_registration,
                      tax_number: activeAccount?.tax_number,
                      vat_number: activeAccount?.vat_number,
                  },
                  financial_summary: {
                      gross_income: totalIncome,
