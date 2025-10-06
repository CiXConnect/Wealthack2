
import React, { useState, useEffect, useCallback } from 'react';
import { Account } from '@/entities/Account';
import { EmailVerificationToken } from '@/entities/EmailVerificationToken';
import { SendEmail } from '@/integrations/Core';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CheckCircle, XCircle, Clock, Building, Send, ShieldCheck, MailWarning, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { useAlert } from "@/components/AlertProvider";
import { createPageUrl } from '@/utils';


const isProfessionalEmail = (email) => {
    if (!email) return false;
    const freeProviders = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'aol.com', 'icloud.com'];
    const domain = email.split('@')[1];
    return !freeProviders.includes(domain?.toLowerCase());
};

export default function CompanyVettingManager() {
    const [accounts, setAccounts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [sendingVerification, setSendingVerification] = useState(null); // To track which email is being sent
    const { showAlert } = useAlert();

    const loadAccounts = useCallback(async () => {
        setIsLoading(true);
        try {
            const businessAccounts = await Account.filter({ account_type: 'business' });
            setAccounts(businessAccounts);
        } catch (error) {
            console.error("Failed to load business accounts:", error);
        }
        setIsLoading(false);
    }, []);

    useEffect(() => {
        loadAccounts();
    }, [loadAccounts]);

    const handleStatusChange = async (accountId, newStatus) => {
        try {
            await Account.update(accountId, { payroll_vetting_status: newStatus });
            loadAccounts();
        } catch (error) {
            console.error("Failed to update vetting status:", error);
            alert("Could not update vetting status.");
        }
    };
    
    const handleResendVerification = async (account) => {
        if (!account || !account.company_email) return;
    
        setSendingVerification(account.id);
        showAlert("Sending...", `Sending verification email to ${account.company_email}.`, "info");
    
        try {
            const token = [...Array(32)].map(() => Math.random().toString(36)[2]).join('');
            const expires_at = new Date(new Date().getTime() + 60 * 60 * 1000).toISOString(); // 1 hour expiration
            
            await EmailVerificationToken.create({
                account_id: account.id,
                token: token,
                expires_at: expires_at,
            });
    
            const verificationUrl = `${window.location.origin}${createPageUrl(`VerifyEmail?token=${token}`)}`;
    
            await SendEmail({
                to: account.company_email,
                from_name: "WealthHack Verification",
                subject: "Verify Your Company Email Address",
                body: `
                    <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; line-height: 1.6;">
                        <h2 style="color: #1e3a8a;">Action Required: Verify Your Company Email</h2>
                        <p>An administrator has initiated an email verification for your WealthHack account. Please click the link below to verify your company email address.</p>
                        <p style="margin: 25px 0;">
                            <a href="${verificationUrl}" style="background-color: #2563eb; color: white; padding: 12px 22px; text-decoration: none; border-radius: 8px; font-weight: bold;">Verify Email Address</a>
                        </p>
                        <p>This is required to enable features like Payroll. If you did not expect this, you can safely ignore this email.</p>
                        <p style="font-size: 0.9em; color: #666;">This link will expire in 1 hour.</p>
                    </div>
                `
            });
    
            showAlert("Success", "Verification email has been resent successfully!", "success");
            
        } catch (error) {
            console.error("Error resending verification email:", error);
            showAlert("Error", "Failed to resend verification email. Please check SMTP settings and try again.", "error");
        }
    
        setSendingVerification(null);
    };

    const renderAccountRow = (account) => {
        const hasProfessionalEmail = isProfessionalEmail(account.company_email);
        // const hasRegNumber = !!account.company_registration; // Removed as 'Checks' column is replaced
        // const hasTaxNumber = !!account.tax_number; // Removed as 'Checks' column is replaced

        return (
            <TableRow key={account.id}>
                <TableCell>
                    <div className="font-medium text-slate-900">{account.company_name || 'N/A'}</div>
                    <div className="text-sm text-slate-500">{account.company_email || account.owner_email}</div>
                     {!hasProfessionalEmail && account.company_email && <Badge variant="destructive" className="mt-1"><MailWarning className="w-3 h-3 mr-1"/>Free Email</Badge>}
                </TableCell>
                <TableCell> {/* This is the new Email Verification column */}
                     {account.company_email ? (
                        account.company_email_verified ? (
                           <Badge className="bg-emerald-100 text-emerald-800">Verified</Badge>
                        ) : (
                           <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => handleResendVerification(account)}
                                disabled={sendingVerification === account.id}
                                className="whitespace-nowrap"
                            >
                               {sendingVerification === account.id ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
                               Resend Verification
                           </Button>
                        )
                    ) : (
                        <Badge variant="secondary">No Email</Badge>
                    )}
                </TableCell>
                {/* The original 'Checks' column (Reg No/Tax No) is removed */}
                <TableCell> {/* This is the Vetting Status column */}
                    <Badge 
                        className={
                            account.payroll_vetting_status === 'verified' ? 'bg-emerald-100 text-emerald-800' :
                            account.payroll_vetting_status === 'pending' ? 'bg-amber-100 text-amber-800' :
                            account.payroll_vetting_status === 'rejected' ? 'bg-red-100 text-red-800' :
                            'bg-slate-100 text-slate-800'
                        }
                    >
                        {(account.payroll_vetting_status || 'not_submitted').replace(/_/g, ' ')}
                    </Badge>
                </TableCell>
                <TableCell className="text-right">
                    <Select value={account.payroll_vetting_status || 'not_submitted'} onValueChange={(newStatus) => handleStatusChange(account.id, newStatus)}>
                        <SelectTrigger className="w-[120px]">
                            <SelectValue placeholder="Set Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="verified"><CheckCircle className="w-4 h-4 mr-2 text-green-500 inline-block"/>Verified</SelectItem>
                            <SelectItem value="rejected"><XCircle className="w-4 h-4 mr-2 text-red-500 inline-block"/>Rejected</SelectItem>
                            <SelectItem value="pending"><Clock className="w-4 h-4 mr-2 text-amber-500 inline-block"/>Pending</SelectItem>
                             <SelectItem value="not_submitted">Not Submitted</SelectItem>
                        </SelectContent>
                    </Select>
                </TableCell>
            </TableRow>
        );
    };

    return (
        <Card className="border-0 shadow-xl">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-blue-600" />
                    Company Vetting for Payroll
                </CardTitle>
                <CardDescription>Verify business accounts to grant them access to the Payroll Generation feature.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Company</TableHead>
                            <TableHead>Email Verification</TableHead> {/* Updated from 'Checks' */}
                            <TableHead>Vetting Status</TableHead> {/* Updated from 'Status' */}
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow><TableCell colSpan={4} className="text-center">Loading accounts...</TableCell></TableRow>
                        ) : accounts.length > 0 ? (
                            accounts.map(renderAccountRow)
                        ) : (
                            <TableRow><TableCell colSpan={4} className="text-center">No business accounts found.</TableCell></TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
