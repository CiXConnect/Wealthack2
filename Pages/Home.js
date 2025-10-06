
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/PasswordInput';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { User } from '@/entities/User';
import { Account } from '@/entities/Account';
import { EmailVerificationToken } from '@/entities/EmailVerificationToken';
import { SendEmail } from '@/integrations/Core';
import { createPageUrl } from '@/utils';
import { Mail, Shield, Loader2, AlertCircle, User as UserIcon, Building } from 'lucide-react';
import { useAlert } from '@/components/AlertProvider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"


const RESEND_COOLDOWN_SECONDS = 60;

export default function HomePage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showResend, setShowResend] = useState(false);
    const [resendCooldown, setResendCooldown] = useState(0);
    const [isResending, setIsResending] = useState(false);
    const [accountType, setAccountType] = useState('personal'); // 'personal' or 'business'
    const navigate = useNavigate();
    const { showAlert } = useAlert();

    useEffect(() => {
        const lastResendTimestamp = parseInt(localStorage.getItem('lastVerificationResend') || '0', 10);
        const now = Date.now();
        const timePassed = (now - lastResendTimestamp) / 1000;

        if (timePassed < RESEND_COOLDOWN_SECONDS) {
            setResendCooldown(Math.ceil(RESEND_COOLDOWN_SECONDS - timePassed));
        }
    }, []);

    useEffect(() => {
        if (resendCooldown > 0) {
            const timer = setTimeout(() => {
                setResendCooldown(prev => prev - 1);
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [resendCooldown]);

    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        setShowResend(false);

        try {
            // Set the login preference BEFORE redirecting to Google auth
            localStorage.setItem('loginAccountType', accountType);

            // This is a simulated check. If the user is unverified, the error will show.
            // The actual login is handled by User.login() which redirects to Google.
            const users = await User.filter({ email: email.toLowerCase() }, null, 1);
            if (users.length > 0) {
                // We only check for unverified business accounts
                if (accountType === 'business') {
                    const businessAccounts = await Account.filter({ owner_email: email.toLowerCase(), account_type: 'business' });
                    const unverifiedBusinessAccount = businessAccounts.find(acc => !acc.company_email_verified);

                    if (unverifiedBusinessAccount) {
                        setError("Please verify your email before logging in. Check your email for the verification code.");
                        setShowResend(true);
                        setIsLoading(false);
