
import React, { useState, useEffect } from "react";
import { User } from "@/entities/User";
import { Account } from "@/entities/Account";
import { EmailVerificationToken } from "@/entities/EmailVerificationToken";
import { BankStatement } from "@/entities/BankStatement";
import { FinancialReport } from "@/entities/FinancialReport";
import { Subscription } from "@/entities/Subscription";
import { TaxDocument } from "@/entities/TaxDocument";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Settings as SettingsIcon, User as UserIcon, Save, Phone, MessageCircle, Building, Info, ShieldCheck, Send, Loader2, Upload, MailCheck, Trash2, AlertTriangle } from "lucide-react";
import { format } from "date-fns";
import { UploadFile, SendEmail } from "@/integrations/Core";
import { useAlert } from "@/components/AlertProvider";
import { createPageUrl } from "@/utils";
import { useNavigate } from "react-router-dom";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";


const isProfessionalEmail = (email) => {
    if (!email) return true; // Allow saving if empty, but admin will see it's missing.
    const freeProviders = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'aol.com', 'icloud.com'];
    const domain = email.split('@')[1];
    return !freeProviders.includes(domain?.toLowerCase());
};

export default function Settings() {
  const [user, setUser] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [activeAccount, setActiveAccount] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [submittingForVetting, setSubmittingForVetting] = useState(false);
  const [isSendingVerification, setIsSendingVerification] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  
  const [userContact, setUserContact] = useState({ phone: "", whatsapp: "", address: "" });
  const [accountDetails, setAccountDetails] = useState({});

  const { showAlert } = useAlert();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await User.me();
        setUser(currentUser);
        setUserContact({ phone: currentUser.phone || "", whatsapp: currentUser.whatsapp || "", address: currentUser.address || "" });
      } catch (error) {
        console.error("Error fetching user on mount:", error);
        navigate(createPageUrl("Landing")); // Redirect to landing if user cannot be fetched (e.g., not logged in)
      }
    };
    fetchUser();
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    let selectedActiveAccount = null; // Temporary variable to hold the account object that will be set as active

    try {
      const currentUser = await User.me(); // Re-fetch user to ensure latest data for filtering accounts
      const userAccounts = await Account.filter({ owner_email: currentUser.email });
      setAccounts(userAccounts);

      const activeAccountId = localStorage.getItem('activeAccountId');
      
      if (activeAccountId) {
        try {
          const accountById = await Account.get(activeAccountId);
          selectedActiveAccount = accountById;
        } catch (error) {
          if (error.message && error.message.toLowerCase().includes('not found')) {
            console.warn(`Stale activeAccountId: ${activeAccountId} not found. Removing from localStorage.`);
            localStorage.removeItem('activeAccountId');
            window.location.reload(); // Force a full page reload to clear stale state and re-evaluate
            return; // Stop further execution of this loadData call
          }
          console.error("Error fetching active account by ID:", error);
          showAlert("Error", "Failed to load active account details. Please try again.", "error");
          // If any other error occurs during Account.get, treat the activeAccountId as problematic
          localStorage.removeItem('activeAccountId');
        }
      }

      // If no account was explicitly selected by ID (either localStorage was empty or ID was stale/error),
      // then try to select the first available account or clear everything.
      if (!selectedActiveAccount && userAccounts.length > 0) {
          selectedActiveAccount = userAccounts[0];
          localStorage.setItem('activeAccountId', userAccounts[0].id);
      } else if (!selectedActiveAccount && userAccounts.length === 0) {
          // If no accounts exist for the user at all, ensure active state is clear
          localStorage.removeItem('activeAccountId');
      }

      setActiveAccount(selectedActiveAccount);
      if (selectedActiveAccount) {
        setAccountDetails({
            id_number: selectedActiveAccount.id_number || "",
            tax_number: selectedActiveAccount.tax_number || "",
            company_name: selectedActiveAccount.company_name || "",
            company_email: selectedActiveAccount.company_email || "",
            company_registration: selectedActiveAccount.company_registration || "",
            vat_number: selectedActiveAccount.vat_number || "",
            uif_number: selectedActiveAccount.uif_number || "",
            company_logo_url: selectedActiveAccount.company_logo_url || "", // Explicitly include logo URL
        });
      } else {
        setAccountDetails({});
      }
    } catch (error) {
      console.error("Error loading settings data:", error);
      showAlert("Error", "Failed to load settings data. Please try again.", "error");
    }
    setIsLoading(false);
  };
  
  useEffect(() => {
    // This effect ensures accountDetails is updated if the activeAccount changes from outside
    // (e.g., if accounts are reloaded and the activeAccount object reference changes but ID is same)
    // Or if the active account is switched.
    if (accounts.length > 0) {
        const activeAccountId = localStorage.getItem('activeAccountId');
        const currentActiveAccount = accounts.find(acc => acc.id === activeAccountId);
        if (currentActiveAccount) {
          // Only update if the object reference or critical IDs differ to avoid unnecessary re-renders
          if (!activeAccount || activeAccount.id !== currentActiveAccount.id) {
            setActiveAccount(currentActiveAccount);
            // Ensure accountDetails is fully hydrated from the found account
            setAccountDetails({
                id_number: currentActiveAccount.id_number || "",
                tax_number: currentActiveAccount.tax_number || "",
                company_name: currentActiveAccount.company_name || "",
                company_email: currentActiveAccount.company_email || "",
                company_registration: currentActiveAccount.company_registration || "",
                vat_number: currentActiveAccount.vat_number || "",
                uif_number: currentActiveAccount.uif_number || "",
                company_logo_url: currentActiveAccount.company_logo_url || "",
            });
          }
        } else if (activeAccount && !currentActiveAccount) {
            // If activeAccount was set but no longer found in fetched accounts
            // (e.g., the active account was deleted or its visibility changed)
            setActiveAccount(null);
            setAccountDetails({});
            localStorage.removeItem('activeAccountId'); // Clean up invalid ID
        }
    } else if (accounts.length === 0 && activeAccount) {
        // If accounts become empty (e.g., all accounts deleted), clear active account details
        setActiveAccount(null);
        setAccountDetails({});
        localStorage.removeItem('activeAccountId');
    }
  }, [accounts, activeAccount]); // Added activeAccount to dependencies to react to its changes

  const handleSave = async () => {
    setSaving(true);
    
    if (activeAccount && activeAccount.account_type === 'business' && accountDetails.company_email && !isProfessionalEmail(accountDetails.company_email)) {
        showAlert("Invalid Email", "Please use a professional company email address for your business account. Free email providers like Gmail or Yahoo are not permitted for business verification.", "error");
        setSaving(false);
        return;
    }

    try {
      await User.updateMyUserData(userContact);
      if (activeAccount) {
          // If company email is changed, reset verification status
          const updatedAccountDetails = { ...accountDetails };
          if (activeAccount.account_type === 'business' && accountDetails.company_email !== activeAccount.company_email) {
            updatedAccountDetails.company_email_verified = false;
          }
          const { owner_email, account_type, payroll_vetting_status, ...updatableDetails } = updatedAccountDetails;
          await Account.update(activeAccount.id, updatableDetails);
      }
      showAlert("Success", "Settings saved successfully!", "success");
      await loadData();
    } catch (error) {
      console.error("Error saving settings:", error);
      showAlert("Error", "Failed to save settings. Please try again.", "error");
    }
    setSaving(false);
  };

  const handleSendVerification = async () => {
    if (!activeAccount || !accountDetails.company_email) return;
    if (!isProfessionalEmail(accountDetails.company_email)) {
      showAlert("Invalid Email", "Please use a professional company email address before sending a verification link.", "error");
      return;
    }

    setIsSendingVerification(true);
    showAlert("Sending...", "Sending verification email.", "info");

    try {
        const token = [...Array(32)].map(() => Math.random().toString(36)[2]).join('');
        const expires_at = new Date(new Date().getTime() + 60 * 60 * 1000).toISOString(); // 1 hour expiration
        
        await EmailVerificationToken.create({
            account_id: activeAccount.id,
            token: token,
            expires_at: expires_at,
        });

        const verificationUrl = `${window.location.origin}${createPageUrl(`VerifyEmail?token=${token}`)}`;

        await SendEmail({
            to: accountDetails.company_email,
            from_name: "WealthHack Verification",
            subject: "Verify Your Company Email Address",
            body: `
                <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; line-height: 1.6;">
                    <h2 style="color: #1e3a8a;">Welcome to WealthHack!</h2>
                    <p>Please verify your company email address by clicking the link below. This is required to enable features like Payroll.</p>
                    <p style="margin: 25px 0;">
                        <a href="${verificationUrl}" style="background-color: #2563eb; color: white; padding: 12px 22px; text-decoration: none; border-radius: 8px; font-weight: bold;">Verify Email Address</a>
                    </p>
                    <p>If you did not request this, please ignore this email.</p>
                    <p style="font-size: 0.9em; color: #666;">This link will expire in 1 hour.</p>
                    <hr style="border: none; border-top: 1px solid #e5e7eb; margin-top: 20px;" />
                    <p style="font-size: 0.9em; color: #666;">Thanks,<br/>The WealthHack Team</p>
                </div>
            `
        });

        showAlert("Success", "Verification email sent! Please check your inbox.", "success");
        
    } catch (error) {
        console.error("Error sending verification email:", error);
        showAlert("Error", "Failed to send verification email. Please try again.", "error");
    }

    setIsSendingVerification(false);
  };


  // New function for logo upload
  const handleLogoUpload = async (event) => {
    const file = event.target.files[0];
    if (!file || !activeAccount || activeAccount.account_type !== 'business') {
        showAlert("Warning", "Please select a business account to upload a logo.", "warning");
        return;
    }

    if (!file.type.startsWith('image/')) {
        showAlert("Error", "Only image files are allowed for company logo.", "error");
        return;
    }
    // Limit file size to 2MB (2 * 1024 * 1024 bytes)
    if (file.size > 2 * 1024 * 1024) { 
        showAlert("Error", "File size exceeds 2MB limit. Please choose a smaller image.", "error");
        return;
    }

    try {
      const { file_url } = await UploadFile({ file }); // Assuming UploadFile correctly handles the upload
      await Account.update(activeAccount.id, { company_logo_url: file_url });
      
      // Update local state and activeAccount state to reflect the new logo immediately
      setAccountDetails(prev => ({ ...prev, company_logo_url: file_url }));
      setActiveAccount(prev => prev ? ({ ...prev, company_logo_url: file_url }) : null);

      showAlert("Success", "Company logo updated successfully!", "success");
    } catch (error) {
      console.error("Error uploading logo:", error);
      showAlert("Error", "Failed to upload logo. Please try again.", "error");
    }
    // Clear file input value to allow re-uploading the same file if needed
    event.target.value = '';
  };
  
  const submitForVetting = async () => {
    if (!activeAccount || activeAccount.account_type !== 'business') return;
    
    if (!accountDetails.company_email_verified) {
      showAlert("Email Not Verified", "Please verify your company email address before submitting for payroll vetting.", "warning");
      return;
    }

    // Simple validation for required fields
    if (!accountDetails.company_name || !accountDetails.company_registration || !accountDetails.tax_number || !accountDetails.company_email) {
      showAlert("Warning", "Please ensure Company Name, Registration Number, Tax Number, and Company Email are filled in before submitting for vetting.", "warning");
      return;
    }
    if (!user?.email) {
      showAlert("Error", "User email is missing. Please ensure your profile has an email address.", "error");
      return;
    }

    setSubmittingForVetting(true);
    try {
      // Temporarily save account details before submitting for vetting (preserves original functionality)
      // handleSave will show its own success/error notifications.
      await handleSave(); 

      await Account.update(activeAccount.id, { payroll_vetting_status: 'pending' });
      // Update local state immediately for better UX
      setActiveAccount(prev => prev ? ({ ...prev, payroll_vetting_status: 'pending' }) : null);
      setAccountDetails(prev => ({ ...prev, payroll_vetting_status: 'pending' }));

      showAlert("Success", "Your company has been submitted for payroll verification. Our team will review your details and you will be notified upon approval.", "success");
      await loadData(); // Reload to get the new status and ensure full data consistency
    } catch (error) {
      console.error("Error submitting for vetting:", error);
      showAlert("Error", "Failed to submit for vetting. Please try again.", "error");
    }
    setSubmittingForVetting(false);
  };

  const handleDeleteProfile = async () => {
    setIsDeleting(true);
    try {
      showAlert("Deleting...", "Your profile and all associated data are being permanently deleted. Please wait. You will be logged out.", "info");

      const currentUser = await User.me();
      const accountsToDelete = await Account.filter({ owner_email: currentUser.email });

      for (const account of accountsToDelete) {
        // Delete all data associated with this account
        const [statements, reports, taxDocs, subscriptions] = await Promise.all([
          BankStatement.filter({ account_id: account.id }),
          FinancialReport.filter({ account_id: account.id }),
          TaxDocument.filter({ account_id: account.id }),
          Subscription.filter({ account_id: account.id }),
        ]);

        const deletePromises = [
          ...statements.map(s => BankStatement.delete(s.id)),
          ...reports.map(r => FinancialReport.delete(r.id)),
          ...taxDocs.map(t => TaxDocument.delete(t.id)),
          ...subscriptions.map(sub => Subscription.delete(sub.id)),
        ];
        
        await Promise.all(deletePromises);
        
        // After all associated data is gone, delete the account itself
        await Account.delete(account.id);
      }

      // After all accounts and their data are deleted, log out and redirect
      localStorage.removeItem('activeAccountId');
      await User.logout();
      
      // The alert will close on navigation, so this is just for the console
      console.log("Profile and all data deleted successfully.");
      
      navigate(createPageUrl('Landing'));
      window.location.reload(); // Force a full refresh to clear all state

    } catch (error) {
      console.error("Error deleting profile:", error);
      showAlert("Error", "Failed to delete your profile. Please contact support.", "error");
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900"></div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Settings</h1>
        <p className="text-slate-600">
          Manage your account settings and preferences
        </p>
      </div>

      {/* User Info */}
      <Card className="border-0 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserIcon className="w-5 h-5 text-blue-700" />
            Your Profile
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
           <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input value={user?.full_name || ""} disabled className="bg-slate-50"/>
            </div>
            <div className="space-y-2">
              <Label>Email Address</Label>
              <Input value={user?.email || ""} disabled className="bg-slate-50"/>
            </div>
          </div>
           <div className="border-t pt-6 grid md:grid-cols-2 gap-4">
             <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" type="tel" placeholder="+27 XX XXX XXXX" value={userContact.phone} onChange={(e) => setUserContact({ ...userContact, phone: e.target.value })}/>
              </div>
              <div className="space-y-2">
                <Label htmlFor="whatsapp" className="flex items-center gap-2">
                  <MessageCircle className="w-4 h-4 text-green-600" />
                  WhatsApp Number
                </Label>
                <Input id="whatsapp" type="tel" placeholder="+27 XX XXX XXXX" value={userContact.whatsapp} onChange={(e) => setUserContact({ ...userContact, whatsapp: e.target.value })}/>
              </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Active Account Info */}
      {activeAccount && (
        <Card className="border-0 shadow-xl">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    {activeAccount.account_type === 'business' ? <Building className="w-5 h-5 text-emerald-700" /> : <Info className="w-5 h-5 text-blue-700" />}
                    {activeAccount.account_name} Account Details
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                 {activeAccount.account_type === 'personal' ? (
                <>
                  <div className="space-y-1">
                    <Label htmlFor="id_number">SA ID Number</Label>
                    <Input id="id_number" value={accountDetails.id_number || ''} onChange={(e) => setAccountDetails({...accountDetails, id_number: e.target.value})} placeholder="Your ID number" />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="tax_number_personal">SARS Tax Number</Label>
                    <Input id="tax_number_personal" value={accountDetails.tax_number || ''} onChange={(e) => setAccountDetails({...accountDetails, tax_number: e.target.value})} placeholder="Your income tax number" />
                  </div>
                </>
              ) : (
                <>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label htmlFor="company_name">Company Name</Label>
                      <Input id="company_name" value={accountDetails.company_name || ''} onChange={(e) => setAccountDetails({...accountDetails, company_name: e.target.value})} placeholder="Your Company (Pty) Ltd" />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="company_email">Company Email Address</Label>
                      <div className="flex items-center gap-2">
                        <Input id="company_email" type="email" value={accountDetails.company_email || ''} onChange={(e) => setAccountDetails({...accountDetails, company_email: e.target.value})} placeholder="contact@yourcompany.co.za" />
                        {accountDetails.company_email_verified ? (
                            <Badge className="bg-emerald-100 text-emerald-800 whitespace-nowrap flex items-center gap-1.5">
                                <MailCheck className="w-4 h-4" /> Verified
                            </Badge>
                        ) : (
                            accountDetails.company_email && isProfessionalEmail(accountDetails.company_email) && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleSendVerification}
                                    disabled={isSendingVerification}
                                    className="whitespace-nowrap"
                                >
                                    {isSendingVerification ? <Loader2 className="w-4 h-4 mr-1 animate-spin"/> : "Verify"}
                                </Button>
                            )
                        )}
                      </div>
                      {!isProfessionalEmail(accountDetails.company_email) && accountDetails.company_email && (
