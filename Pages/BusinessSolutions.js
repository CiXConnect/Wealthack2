
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
import { Check, Building, Wallet, Copy, AlertCircle, RefreshCw, Upload, Loader2, Home, ArrowUp } from "lucide-react";
import { format, addDays, addMonths } from "date-fns";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAlert } from "@/components/AlertProvider";

const TIER_PRICES = {
    business_basic: 220,
    business_standard: 450,
    business_premium: 795,
    business_enterprise: 1890,
    business_payroll: 2490,
};

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
    business_basic: { can_download: true, budgeting_tools: true, expenditure_analysis: false, cashflow_statements: false, sars_reporting: false, full_access: false, can_generate_payslips: false },
    business_standard: { can_download: true, budgeting_tools: true, expenditure_analysis: true, cashflow_statements: false, sars_reporting: false, full_access: false, can_generate_payslips: false },
    business_premium: { can_download: true, budgeting_tools: true, expenditure_analysis: true, cashflow_statements: true, sars_reporting: true, full_access: false, can_generate_payslips: false },
    business_enterprise: { can_download: true, budgeting_tools: true, expenditure_analysis: true, cashflow_statements: true, sars_reporting: true, full_access: true, can_generate_payslips: false },
    business_payroll: { can_download: true, budgeting_tools: true, expenditure_analysis: true, cashflow_statements: true, sars_reporting: true, full_access: true, can_generate_payslips: true },
};
