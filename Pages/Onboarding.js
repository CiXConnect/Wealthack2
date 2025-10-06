
import React, { useState, useEffect } from "react";
import { User } from "@/entities/User";
import { Account } from "@/entities/Account";
import { UploadFile } from "@/integrations/Core";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useNavigate, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { User as UserIcon, Building, ArrowRight, Loader2, Upload as UploadIcon, File as FileIcon } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function Onboarding() {
  const [step, setStep] = useState(0); // Start at step 0 for pre-checks
  const [accountType, setAccountType] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // Start loading true for checks
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);

  const [personalDetails, setPersonalDetails] = useState({ id_number: '', tax_number: '' });
  const [businessDetails, setBusinessDetails] = useState({ company_name: '', company_email: '', company_registration: '', tax_number: '', vat_number: '' });
  const [cipcFile, setCipcFile] = useState(null);
  const [taxFile, setTaxFile] = useState(null);

  useEffect(() => {
    const preOnboardingChecks = async () => {
      setIsLoading(true);
      try {
        const currentUser = await User.me();
        setUser(currentUser);

        const params = new URLSearchParams(location.search);
        const typeFromUrl = params.get('type');

        const existingAccounts = await Account.filter({ owner_email: currentUser.email });

        if (typeFromUrl) {
          const accountExists = existingAccounts.some(acc => acc.account_type === typeFromUrl);
          if (accountExists) {
            // User tried to create an account type they already have, redirect them.
            navigate(createPageUrl("Dashboard"));
            return;
          }
          // User doesn't have this account type, proceed to creation.
          setAccountType(typeFromUrl);
          setStep(2);
        } else {
           // No type in URL, let them choose.
           setStep(1);
        }

      } catch (error) {
        navigate(createPageUrl("Landing"));
      }
      setIsLoading(false);
    };
    preOnboardingChecks();
  }, [navigate, location.search]);

  const validateEmail = (email) => {
    if (!email) return true;
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  };

  const handleBusinessDetailsSubmit = () => {
    if (!businessDetails.company_name || !businessDetails.company_registration) {
      setError("Company Name and Registration Number are required to proceed.");
      return;
    }
    if (businessDetails.company_email && !validateEmail(businessDetails.company_email)) {
      setError("Please enter a valid company email address.");
      return;
    }
    setError(null);
    setStep(3);
  };
  
  const createAccountAndNavigate = async (data) => {
    try {
        const newAccount = await Account.create(data);
        await User.updateMyUserData({ profile_completed: true });
        localStorage.setItem('activeAccountId', newAccount.id);
        navigate(createPageUrl("Dashboard"));
        window.location.reload();
    } catch(e) {
        console.error("Failed to create account:", e);
        setError("Something went wrong while creating your account. Please try again.");
        setIsLoading(false);
    }
  };

  const handleFinishOnboarding = async (skipDetails = false) => {
    if (!user) return;
    
    if (accountType === 'business' && !skipDetails) {
        if (!cipcFile || !taxFile) {
            setError("Both CIPC document and Tax Clearance Certificate are required.");
            return;
        }
    }

    setIsLoading(true);
    setError(null);

    let accountData = {
        owner_email: user.email,
        account_type: accountType,
        account_name: accountType === 'personal' ? 'Personal' : (businessDetails.company_name || 'Business'),
    };

    if (skipDetails) {
        await createAccountAndNavigate(accountData);
        return;
    }

    try {
        if (accountType === 'personal') {
            accountData = { ...accountData, ...personalDetails };
        } else { // Business
            let cipc_document_url = null;
            let tax_clearance_url = null;
            
            if (cipcFile) {
                const { file_url } = await UploadFile({ file: cipcFile });
                cipc_document_url = file_url;
            }
            if (taxFile) {
                const { file_url } = await UploadFile({ file: taxFile });
                tax_clearance_url = file_url;
            }
            
            accountData = {
                ...accountData,
                ...businessDetails,
                cipc_document_url,
                tax_clearance_url,
            };
        }
        await createAccountAndNavigate(accountData);
    } catch (e) {
        console.error("Failed to complete onboarding:", e);
        setError("Failed to upload documents or create account. Please try again.");
        setIsLoading(false);
    }
  };

  const renderFileUploader = (label, file, setFile) => (
    <div className="space-y-2">
      <Label>{label} *</Label>
        <div className="border-2 border-dashed border-slate-300 rounded-xl p-4 text-center hover:border-blue-500 transition-colors">
            <Input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => setFile(e.target.files[0])}
              className="hidden"
              id={`${label.toLowerCase().replace(/ /g, '-')}-upload`}
              disabled={isLoading}
            />
            <label htmlFor={`${label.toLowerCase().replace(/ /g, '-')}-upload`} className="cursor-pointer flex flex-col items-center">
              <UploadIcon className="w-8 h-8 text-slate-400 mb-2" />
              <p className="font-medium text-slate-700 mb-1 text-sm">
                {file ? file.name : "Click to upload"}
              </p>
              <p className="text-xs text-slate-500">PDF, JPG, PNG</p>
            </label>
        </div>
    </div>
  );

  const renderStep = () => {
    switch (step) {
      case 0: // Pre-check loading state
        return (
            <div className="flex items-center justify-center">
                <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
            </div>
        );
      case 1:
        return (
          <Card className="w-full max-w-lg">
            <CardHeader>
              <CardTitle>Welcome to WealthHack!</CardTitle>
              <CardDescription>Let's get your first account set up. Are you using this for personal or business finances?</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => { setAccountType("personal"); setStep(2); }}
                className="flex flex-col items-center justify-center p-8 border-2 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all"
              >
                <UserIcon className="w-12 h-12 mb-4 text-blue-600" />
                <span className="font-semibold text-lg">Personal</span>
              </button>
              <button
                onClick={() => { setAccountType("business"); setStep(2); }}
                className="flex flex-col items-center justify-center p-8 border-2 rounded-lg hover:border-emerald-500 hover:bg-emerald-50 transition-all"
              >
                <Building className="w-12 h-12 mb-4 text-emerald-600" />
                <span className="font-semibold text-lg">Business</span>
              </button>
            </CardContent>
          </Card>
        );
      case 2:
        return (
          <Card className="w-full max-w-lg">
            <CardHeader>
              <CardTitle>Tell us about your {accountType} finances</CardTitle>
              <CardDescription>This information helps us generate compliant reports. You can skip and add it later in Settings.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}
              {accountType === 'personal' ? (
                <>
                  <div className="space-y-1">
                    <Label htmlFor="id_number">SA ID Number</Label>
                    <Input id="id_number" value={personalDetails.id_number} onChange={(e) => setPersonalDetails({...personalDetails, id_number: e.target.value})} placeholder="Your ID number" />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="tax_number_personal">SARS Tax Number</Label>
                    <Input id="tax_number_personal" value={personalDetails.tax_number} onChange={(e) => setPersonalDetails({...personalDetails, tax_number: e.target.value})} placeholder="Your income tax number" />
                  </div>
                   <Button onClick={() => handleFinishOnboarding(false)} className="w-full" disabled={isLoading}>
                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <>Finish Setup <ArrowRight className="ml-2 h-4 w-4" /></>}
                   </Button>
                </>
              ) : ( // Business
                <>
                  <div className="space-y-1">
                    <Label htmlFor="company_name">Company Name *</Label>
                    <Input id="company_name" value={businessDetails.company_name} onChange={(e) => setBusinessDetails({...businessDetails, company_name: e.target.value})} placeholder="Your Company (Pty) Ltd" />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="company_email">Company Email Address</Label>
                    <Input id="company_email" type="email" value={businessDetails.company_email} onChange={(e) => setBusinessDetails({...businessDetails, company_email: e.target.value})} placeholder="contact@yourcompany.co.za" />
                  </div>
                   <div className="space-y-1">
                    <Label htmlFor="company_registration">Company Registration Number *</Label>
                    <Input id="company_registration" value={businessDetails.company_registration} onChange={(e) => setBusinessDetails({...businessDetails, company_registration: e.target.value})} placeholder="e.g., 2024/123456/07" />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="tax_number_business">Company Tax Number</Label>
                    <Input id="tax_number_business" value={businessDetails.tax_number} onChange={(e) => setBusinessDetails({...businessDetails, tax_number: e.target.value})} placeholder="Company's income tax number" />
                  </div>
                   <Button onClick={handleBusinessDetailsSubmit} className="w-full">
                        Next: Upload Documents <ArrowRight className="ml-2 h-4 w-4" />
                   </Button>
                </>
              )}
               <Button variant="link" onClick={() => handleFinishOnboarding(true)} className="w-full" disabled={isLoading}>
                I'll do this later
              </Button>
            </CardContent>
          </Card>
        );
    case 3: // Business document upload
        return (
             <Card className="w-full max-w-lg">
                <CardHeader>
                    <CardTitle>Upload Required Documents</CardTitle>
                    <CardDescription>To complete your business account setup, please upload your CIPC registration document and a valid SARS Tax Clearance Certificate.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}
                    
                    {renderFileUploader("CIPC Document", cipcFile, setCipcFile)}
                    {renderFileUploader("Tax Clearance Certificate", taxFile, setTaxFile)}
                    
                    <Button onClick={() => handleFinishOnboarding(false)} className="w-full" disabled={isLoading}>
                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <>Finish Setup <ArrowRight className="ml-2 h-4 w-4" /></>}
                    </Button>
                    <Button variant="link" onClick={() => setStep(2)} className="w-full" disabled={isLoading}>
                        Back
                    </Button>
                </CardContent>
            </Card>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 p-4">
      {renderStep()}
    </div>
  );
}
