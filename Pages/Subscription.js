
import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Subscription } from "@/entities/Subscription";
import { User } from "@/entities/User";
import { Account } from "@/entities/Account";
import { PlatformSettings } from "@/entities/PlatformSettings";
import { UploadFile } from "@/integrations/Core";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Check, Crown, Star, Building, User as UserIcon, Landmark, Copy, AlertCircle, RefreshCw, Upload, Loader2, Wallet, Home, ArrowUp } from "lucide-react";
import { format, addDays, addMonths } from "date-fns";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useAlert } from "@/components/AlertProvider";

// Centralized and secured tier prices, removing the need for PlatformSettings call by non-admins
const TIER_PRICES = {
    personal_basic: 190,
    personal_standard: 390,
    personal_premium: 690,
    personal_enterprise: 1290,
    business_basic: 220,
    business_standard: 450,
    business_premium: 795,
    business_enterprise: 1890,
    business_payroll: 2490,
};

const PERSONAL_TIERS = [
  { id: "personal_basic", name: "Basic", benefits: ["Download PDFs", "5 statement uploads/month", "Basic budgeting tools", "Email support"] },
  { id: "personal_standard", name: "Standard", benefits: ["Everything in Basic", "Unlimited uploads", "Expenditure analysis", "AI-powered insights", "Priority support"] },
  { id: "personal_premium", highlight: true, name: "Premium", benefits: ["Everything in Standard", "Cashflow statements", "Balance sheets", "Income statements", "Advanced analytics", "Full SARS-compliant reporting"] },
  { id: "personal_enterprise", name: "Enterprise", benefits: [
      "Dedicated SARS Personal Tax Filing Module", 
      "AI-assisted data preparation for your return",
      "Consolidates IRP5, medical, RA & logbook data",
      "Download a step-by-step guide (PDF/HTML) for manual eFiling",
      "Submission of IT Return",
      "Dedicated support for tax filing"
    ] 
  }
];

const BUSINESS_TIERS = [
  { id: "business_basic", name: "Business Basic", benefits: ["All Personal Basic features", "10 statement uploads/month", "Multi-user access (2 users)"] },
  { id: "business_standard", name: "Business Standard", benefits: ["All Personal Standard features", "VAT & PAYE tracking", "Invoice matching"] },
  { id: "business_premium", highlight: true, name: "Business Premium", benefits: ["All Personal Premium features", "Full SARS-compliant reporting (ITR14, VAT201, EMP201)", "Management accounts"] },
  { id: "business_enterprise", name: "Enterprise", benefits: [
      "Dedicated Business Tax Filing Module (ITR14)",
      "AI prepares your Income Statement & Balance Sheet for SARS",
      "Consolidates data from bank statements & invoices",
      "Download a summary for easy capture on eFiling",
      "Submission of IT Return",
      "Dedicated accountant support for tax preparation"
    ] 
  },
  { id: "business_payroll", name: "Payroll", icon: Wallet, benefits: [
      "Full SARS-Compliant Payslip Generation",
      "Automated PAYE, UIF, and SDL calculations",
      "Generates PDF payslips with company logo",
      "UIF submission-ready reports",
      "Employee self-service portal (coming soon)",
      "Requires one-time company vetting"
    ] 
  }
];

const DURATIONS = [
  { id: "1_day", label: "1 Day", add: (d) => addDays(d, 1), months: 0 },
  { id: "2_weeks", label: "2 Weeks", add: (d) => addDays(d, 14), months: 0.5 },
  { id: "1_month", label: "1 Month", add: (d) => addMonths(d, 1), months: 1 },
  { id: "3_months", add: (d) => addMonths(d, 3), months: 3, discount: 0.1, label: "3 Months" },
  { id: "6_months", add: (d) => addMonths(d, 6), months: 6, discount: 0.15, label: "6 Months" },
  { id: "9_months", add: (d) => addMonths(d, 9), months: 9, discount: 0.2, label: "9 Months" },
  { id: "12_months", add: (d) => addMonths(d, 12), months: 12, discount: 0.25, label: "12 Months" }
];

const BANK_DETAILS = [
    { bankName: "STANDARD BANK", accountName: "CIX CONNECT (Pty) Ltd", accountNo: "10200349927", branchCode: "051001" },
    { bankName: "CAPITEC BUSINESS", accountName: "CIX CONNECT (Pty) Ltd", accountNo: "1051396964", branchCode: "450105" },
    { bankName: "FIRST NATIONAL BANK", accountName: "CIX CONNECT (Pty) Ltd", accountNo: "63104954309", branchCode: "250655" },
];

const TIER_FEATURES = {
    // Personal Tiers
    personal_basic: { can_download: true, budgeting_tools: true, expenditure_analysis: false, cashflow_statements: false, sars_reporting: false, full_access: false },
    personal_standard: { can_download: true, budgeting_tools: true, expenditure_analysis: true, cashflow_statements: false, sars_reporting: false, full_access: false },
    personal_premium: { can_download: true, budgeting_tools: true, expenditure_analysis: true, cashflow_statements: true, sars_reporting: true, full_access: false },
    personal_enterprise: { can_download: true, budgeting_tools: true, expenditure_analysis: true, cashflow_statements: true, sars_reporting: true, full_access: true },
    // Business Tiers
    business_basic: { can_download: true, budgeting_tools: true, expenditure_analysis: false, cashflow_statements: false, sars_reporting: false, full_access: false, can_generate_payslips: false },
    business_standard: { can_download: true, budgeting_tools: true, expenditure_analysis: true, cashflow_statements: false, sars_reporting: false, full_access: false, can_generate_payslips: false },
    business_premium: { can_download: true, budgeting_tools: true, expenditure_analysis: true, cashflow_statements: true, sars_reporting: true, full_access: false, can_generate_payslips: false },
    business_enterprise: { can_download: true, budgeting_tools: true, expenditure_analysis: true, cashflow_statements: true, sars_reporting: true, full_access: true, can_generate_payslips: false },
    business_payroll: { can_download: true, budgeting_tools: true, expenditure_analysis: true, cashflow_statements: true, sars_reporting: true, full_access: true, can_generate_payslips: true },
};


export default function SubscriptionPage() {
  const [currentSubscription, setCurrentSubscription] = useState(null);
  const [user, setUser] = useState(null);
  const [activeAccount, setActiveAccount] = useState(null);
  const [accountType, setAccountType] = useState('personal');
  const [settings, setSettings] = useState(null);
  const [selectedDuration, setSelectedDuration] = useState("1_month");
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [showPaymentFlow, setShowPaymentFlow] = useState(false);
  const [pendingSubscription, setPendingSubscription] = useState(null);
  const [popFile, setPopFile] = useState(null);
  const { showAlert } = useAlert();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const loadSubscriptionData = useCallback(async () => {
    setIsLoading(true);
    let currentUser = null;
    try {
        currentUser = await User.me(); // This should return null if unauthenticated
        setUser(currentUser);

        // If user is not logged in, we can stop here and just display plans.
        if (!currentUser) {
            setIsLoading(false);
            return;
        }

        const activeAccountId = localStorage.getItem('activeAccountId');
        if (!activeAccountId) {
            // Logged in, but no account selected. Display plans without current sub info.
            showAlert("Info", "No active account selected. Displaying plans without current subscription info.", "info");
            setIsLoading(false);
            return;
        }

        const [account, subs] = await Promise.all([
            Account.get(activeAccountId),
            Subscription.filter({ account_id: activeAccountId }, "-created_date", 1),
        ]);
        
        setActiveAccount(account);
        setAccountType(account.account_type || 'personal');

        if (subs.length > 0) {
            setCurrentSubscription(subs[0]);
        }
        
        if (currentUser.role === 'admin') {
            const platformSettings = await PlatformSettings.list(null, 1);
            if (platformSettings.length > 0) {
                setSettings(platformSettings[0]);
            }
        }

    } catch (error) {
        // This catch block will primarily handle errors related to fetching account/subscription
        // for *authenticated* users, or other unexpected errors from User.me() (if it throws instead of returning null).
        if (error.message && error.message.includes('not found')) {
            localStorage.removeItem('activeAccountId');
            setActiveAccount(null);
            setCurrentSubscription(null);
            showAlert("Error", "Active account not found or accessible. Please select an account from the dashboard.", "error");
        } else {
             console.error("Error loading data:", error);
             showAlert("Error", "Failed to load subscription data. Please try again.", "error");
        }
    } finally {
      setIsLoading(false);
    }
  }, [showAlert]);

  useEffect(() => {
    loadSubscriptionData();
  }, [loadSubscriptionData]);

  const calculatePrice = (basePrice, durationId) => {
    const duration = DURATIONS.find(d => d.id === durationId);
    if (!duration || !basePrice) return basePrice || 0;
    
    let totalPrice;
    if (duration.months > 0) {
      totalPrice = basePrice * duration.months;
    } else if (duration.id === '2_weeks') {
      totalPrice = basePrice / 2;
    } else { // 1 day
      totalPrice = basePrice / 30; // Approximation
    }

    if (duration.discount) {
      totalPrice *= (1 - duration.discount);
    }
    return Math.round(totalPrice);
  };

  const handleCopyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    showAlert("Copied!", `"${text}" has been copied to your clipboard.`, "success");
  };

  const handleSubscribe = async (tier) => {
    if (!user) {
        await User.login(); // Redirect to login if not authenticated
        return;
    }
    if (!activeAccount) {
        // If logged in but no active account, this is an edge case. 
        // For now, alert and ask user to select/create an account.
        showAlert("Error", "Please select or create an account before subscribing.", "error");
        return;
    }
    if (!tier) return;

    if (tier.id === 'business_payroll' && activeAccount.payroll_vetting_status !== 'verified') {
        showAlert("Company Verification Required", "To subscribe to the Payroll package, your company must be vetted by our admin team. Please go to your settings to submit your company for verification.", "error");
        return;
    }

    const startDate = new Date();
    const durationConf = DURATIONS.find(d => d.id === selectedDuration);
    const endDate = durationConf.add(startDate);
    const price = calculatePrice(TIER_PRICES[tier.id], selectedDuration); // Using TIER_PRICES constant
    const features = TIER_FEATURES[tier.id] || {};

    try {
      const sub = await Subscription.create({
        account_id: activeAccount.id,
        tier: tier.id,
        duration: selectedDuration,
        start_date: format(startDate, "yyyy-MM-dd"),
        end_date: format(endDate, "yyyy-MM-dd"),
        status: "pending_payment",
        price_paid: price,
        features: features
      });

      const paymentReference = `WH-${sub.id.slice(-6).toUpperCase()}`;
      const updatedSub = await Subscription.update(sub.id, { payment_reference: paymentReference });
      
      setPendingSubscription(updatedSub);
      setShowPaymentFlow(true);

    } catch (error) {
      console.error("Error creating subscription:", error);
      showAlert("Error", "Failed to create subscription. Please try again.", "error");
    }
  };

  const handleConfirmPayment = async () => {
    if (!popFile || !pendingSubscription) {
        showAlert("Error", "Please upload your proof of payment file.", "error");
        return;
    }
    setIsProcessingPayment(true);
    try {
        const { file_url } = await UploadFile({ file: popFile });

        await Subscription.update(pendingSubscription.id, {
            proof_of_payment_url: file_url,
            status: 'pending_approval' 
        });
        
        showAlert("Upload Successful!", "Your Proof of Payment has been submitted for verification. Your account will be activated shortly. Activation takes 30 mins - 2 hours for immediate payments, or up to 2 business days for inter-bank transfers.", "success");
        setShowPaymentFlow(false);
        setPendingSubscription(null);
        setPopFile(null);
        await loadSubscriptionData(); // Call the updated load function

    } catch (error) {
        console.error("Payment confirmation failed:", error);
        showAlert("Error", "Failed to process your payment. Please contact support.", "error");
    }
    setIsProcessingPayment(false);
  };

  const renderTierCard = (tier) => {
    const pricePerMonth = TIER_PRICES[tier.id] || 0; // Using TIER_PRICES constant
    const finalPrice = calculatePrice(pricePerMonth, selectedDuration);
    const duration = DURATIONS.find(d => d.id === selectedDuration);
    const isCurrentPlan = currentSubscription?.tier === tier.id && currentSubscription?.status === "active";
    const hasActiveSubscription = currentSubscription && currentSubscription.status === 'active';
    const isPayrollAndNotVetted = tier.id === 'business_payroll' && activeAccount?.payroll_vetting_status !== 'verified';
    
    const buttonText = isCurrentPlan
      ? "Current Plan"
      : isPayrollAndNotVetted
      ? "Verification Required"
      : !user
      ? "Get Started"
      : hasActiveSubscription
      ? "Upgrade"
      : "Subscribe Now";


    return (
      <Card
        key={tier.id}
        className={`border-2 flex flex-col ${
          tier.highlight
            ? "border-amber-500 shadow-2xl scale-105"
            : "border-slate-200 shadow-lg"
        } relative overflow-hidden`}
      >
        {tier.highlight && (
          <div className="absolute top-0 right-0 bg-gradient-to-r from-amber-500 to-amber-600 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
            POPULAR
          </div>
        )}
        <CardHeader className="text-center">
          <div className={`w-16 h-16 mx-auto bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg`}>
            {tier.icon ? <tier.icon className="w-8 h-8 text-white" /> : <Star className="w-8 h-8 text-white" />}
          </div>
          <CardTitle className="text-2xl mb-2">{tier.name}</CardTitle>
          <div className="text-4xl font-bold text-slate-900 mb-1">
            R {finalPrice}
          </div>
          <p className="text-sm text-slate-600 font-semibold">
            {duration?.months === 12 ? "Once-off for 1 Year" : `Once-off for ${duration?.label}`}
          </p>
          <p className="text-xs text-slate-500">
            Billed once for the full period.
          </p>
          {duration.months > 1 && (
            <p className="text-xs text-slate-500 mt-1">
              (Equivalent to R {pricePerMonth}/month)
            </p>
          )}
        </CardHeader>
        <CardContent className="flex-1 flex flex-col justify-between space-y-4">
          <ul className="space-y-3">
            {tier.benefits.map((benefit, i) => (
              <li key={i} className="flex items-start gap-3">
                <Check className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span className="text-slate-700 text-sm">{benefit}</span>
              </li>
            ))}
          </ul>
          <Button
            className={`w-full bg-gradient-to-r from-blue-800 to-purple-800 hover:opacity-90 text-white font-semibold mt-6`}
            onClick={() => handleSubscribe(tier)}
            disabled={isCurrentPlan || isPayrollAndNotVetted}
          >
            {buttonText}
          </Button>
        </CardContent>
      </Card>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900"></div>
      </div>
    );
  }

  // Use the fetched accountType for the default tab
  const defaultTab = activeAccount?.account_type || "personal";
  
  // Conditional rendering for the payment flow
  if (showPaymentFlow) {
    return (
        <div className="p-6 md:p-8 max-w-4xl mx-auto">
            <Card className="border-0 shadow-2xl bg-gradient-to-br from-emerald-50 to-green-100">
                <CardHeader>
                    <CardTitle className="text-2xl text-emerald-900">Complete Your Payment</CardTitle>
                    <CardDescription className="text-slate-600">To activate your subscription, please make a bank deposit/EFT and upload the proof of payment below.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <Alert variant="destructive" className="bg-amber-100 border-amber-300">
                        <AlertCircle className="h-4 w-4 text-amber-800" />
                        <AlertTitle className="text-amber-900 font-bold">CRITICAL: Use Your Unique Payment Reference</AlertTitle>
                        <AlertDescription className="text-amber-800">
                            Please use the unique reference number below for your payment.
                            <div className="flex items-center gap-2 mt-2 p-2 bg-amber-200 rounded-md">
                                <strong className="font-mono text-lg">{pendingSubscription?.payment_reference}</strong>
                                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleCopyToClipboard(pendingSubscription?.payment_reference)}>
                                    <Copy className="h-4 w-4 text-slate-500" />
                                </Button>
                            </div>
                        </AlertDescription>
                    </Alert>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                        {BANK_DETAILS.map((bank, index) => (
                            <div key={index} className="p-4 border rounded-lg bg-white">
                                <h3 className="font-bold text-lg text-blue-900 mb-2">{bank.bankName}</h3>
                                <div className="space-y-2 text-sm">
                                    {[
                                        { label: "Account Name", value: bank.accountName },
                                        { label: "Account No", value: bank.accountNo },
                                        { label: "Branch Code", value: bank.branchCode }
                                    ].map(detail => (
                                        <div key={detail.label} className="flex justify-between items-center">
                                            <span className="text-slate-600">{detail.label}:</span>
                                            <div className="flex items-center gap-2">
                                                <strong className="font-mono text-slate-800">{detail.value}</strong>
                                                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleCopyToClipboard(detail.value)}>
                                                    <Copy className="h-4 w-4 text-slate-500" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    <Alert>
                        <AlertCircle className="h-4 w-4"/>
                        <AlertTitle>Activation Times</AlertTitle>
                        <AlertDescription>
                            <ul className="list-disc pl-5 text-sm">
                                <li><strong>Immediate Payments (e.g., FNB to FNB):</strong> 30 minutes to 2 hours.</li>
                                <li><strong>Inter-Bank Payments (e.g., Absa to FNB):</strong> Up to 2 business days.</li>
                            </ul>
                        </AlertDescription>
                    </Alert>

                    <div className="space-y-2 pt-4 border-t">
                        <Label htmlFor="pop-upload" className="font-semibold text-lg">Upload Proof of Payment *</Label>
                        <Input 
                            id="pop-upload" 
                            type="file" 
                            accept=".pdf,.png,.jpg,.jpeg" 
                            onChange={(e) => setPopFile(e.target.files[0])} 
                            disabled={isProcessingPayment}
                        />
                        {popFile && <p className="text-sm text-slate-600">Selected file: {popFile.name}</p>}
                    </div>

                    <div className="flex justify-between items-center pt-4">
                        <Button variant="outline" onClick={() => setShowPaymentFlow(false)} disabled={isProcessingPayment}>Cancel</Button>
                        <Button onClick={handleConfirmPayment} disabled={isProcessingPayment || !popFile} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                            {isProcessingPayment ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
                            {isProcessingPayment ? "Submitting..." : "Upload & Submit for Approval"}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
  }

  return (
    <div className="bg-slate-50">
      <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
        <header className="flex justify-end -mb-4">
          <Link to={createPageUrl('Landing')}>
            <Button variant="outline">
              <Home className="w-4 h-4 mr-2" />
              Return to Home
            </Button>
          </Link>
        </header>

        {/* The AlertDialog for alertInfo state is removed as useAlert now handles displaying notifications. */}

        <div className="flex justify-between items-center">
