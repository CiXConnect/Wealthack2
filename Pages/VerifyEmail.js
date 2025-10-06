import React, { useState, useEffect } from 'react';
import { EmailVerificationToken } from '@/entities/EmailVerificationToken';
import { Account } from '@/entities/Account';
import { SendEmail } from '@/integrations/Core'; // Import SendEmail
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, CheckCircle, XCircle, Home, Send } from 'lucide-react'; // Add Send icon
import { Button } from "@/components/ui/button";
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useAlert } from '@/components/AlertProvider'; // Import useAlert for better notifications

export default function VerifyEmail() {
    const [status, setStatus] = useState('verifying'); // verifying, success, error, expired
    const [message, setMessage] = useState('Verifying your email address...');
    const [accountIdForResend, setAccountIdForResend] = useState(null);
    const [isResending, setIsResending] = useState(false);
    const { showAlert } = useAlert();

    useEffect(() => {
        const verifyToken = async () => {
            const params = new URLSearchParams(window.location.search);
            const token = params.get('token');

            if (!token) {
                setStatus('error');
                setMessage("No verification token found. Please check the link and try again.");
                return;
            }

            try {
                const tokens = await EmailVerificationToken.filter({ token: token });
                if (tokens.length === 0) {
                    setStatus('error');
                    setMessage("Invalid or expired verification token. Please request a new one by logging into your account settings.");
                    return;
                }

                const verificationToken = tokens[0];

                if (new Date(verificationToken.expires_at) < new Date()) {
                    setStatus('expired');
                    setMessage("This verification link has expired. You can request a new one below.");
                    setAccountIdForResend(verificationToken.account_id); // Store account ID for resend
                    // Do NOT delete the expired token, as it might be useful for diagnostics
                    return;
                }

                // Token is valid, update the account
                await Account.update(verificationToken.account_id, { company_email_verified: true });

                // Delete the token so it can't be reused
                await EmailVerificationToken.delete(verificationToken.id);

                setStatus('success');
                setMessage("Your company email has been successfully verified! You can now access all features.");

            } catch (e) {
                console.error("Verification error:", e);
                setStatus('error');
                setMessage("An unexpected error occurred during verification. Please try again later or contact support.");
            }
        };

        verifyToken();
    }, []);

    const handleResend = async () => {
        if (!accountIdForResend) return;

        setIsResending(true);
        showAlert('Sending...', 'Preparing a new verification link...', 'info');

        try {
            const accountToVerify = await Account.get(accountIdForResend);
 