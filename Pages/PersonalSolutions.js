
import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Subscription } from "@/entities/Subscription";
import { User } from "@/entities/User";
import { Account } from "@/entities/Account";
import { UploadFile } from "@/integrations/Core";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Check, Star, User as UserIcon, Copy, AlertCircle, RefreshCw, Upload, Loader2, Home, ArrowUp } from "lucide-react";
import { format, addDays, addMonths } from "date-fns";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAlert } from "@/components/AlertProvider";

const TIER_PRICES = {
    personal_basic: 190,
    personal_standard: 390,
    personal_premium: 690,
    personal_enterprise: 1290,
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
    personal_basic: { can_download: true, budgeting_tools: true, expenditure_analysis: false, cashflow_statements: false, sars_reporting: false, full_access: false },
    personal_standard: { can_download: true, budgeting_tools: true, expenditure_analysis: true, cashflow_statements: false, sars_reporting: false, full_access: false },
    personal_premium: { can_download: true, budgeting_tools: true, expenditure_analysis: true, cashflow_statements: true, sars_reporting: true, full_access: false },
    personal_enterprise: { can_download: true, budgeting_tools: true, expenditure_analysis: true, cashflow_statements: true, sars_reporting: true, full_access: true },
};

export default function PersonalSolutionsPage() {
  const [currentSubscription, setCurrentSubscription] = useState(null);
  const [user, setUser] = useState(null);
  const [activeAccount, setActiveAccount] = useState(null);
  const [selectedDuration, setSelectedDuration] = useState("1_month");
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [showPaymentFlow, setShowPaymentFlow] = useState(false);
  const [pendingSubscription, setPendingSubscription] = useState(null);
  const [popFile, setPopFile] = useState(null);
 