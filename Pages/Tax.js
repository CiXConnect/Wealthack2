
import React, { useState, useEffect, useCallback } from 'react';
import { Account } from '@/entities/Account';
import { TaxDocument } from '@/entities/TaxDocument';
import { UploadFile, ExtractDataFromUploadedFile, InvokeLLM } from '@/integrations/Core';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Landmark, Upload, FileText, Sparkles, Loader2, CheckCircle, Trash2, Pill, TrendingUp, Car, FileSpreadsheet, Receipt } from 'lucide-react';
import { format } from 'date-fns';

const DOCUMENT_TYPES = [
    { value: "irp5", label: "IRP5 / IT3(a)", icon: FileText, accountType: 'personal', schema: {
        type: "object",
        properties: {
            employee_name: { type: "string" },
            employer_name: { type: "string" },
            tax_period: { type: "string" },
            gross_income: { type: "number" },
            paye: { type: "number" },
            uif_contribution: { type: "number" },
            medical_aid_contributions: { type: "number" },
            pension_fund_contributions: { type: "number" }
        }
    }},
    { value: "medical_aid_certificate", label: "Medical Aid Certificate", icon: Pill, accountType: 'personal', schema: {
        type: "object",
        properties: {
            member_name: { type: "string" },
            scheme_name: { type: "string" },
            total_contributions: { type: "number" },
            number_of_dependents: { type: "number" }
        }
    }},
    { value: "ra_contribution_certificate", label: "RA Contribution Certificate", icon: TrendingUp, accountType: 'personal', schema: {
        type: "object",
        properties: {
            member_name: { type: "string" },
            fund_name: { type: "string" },
            total_contributions: { type: "number" },
            policy_number: { type: "string" }
        }
    }},
    { value: "logbook", label: "Travel Logbook", icon: Car, accountType: 'personal', schema: {
        type: "object",
        properties: {
            vehicle_make_model: { type: "string" },
            total_business_km: { type: "number" },
            total_km: { type: "number" },
            opening_odometer: { type: "number" },
            closing_odometer: { type: "number" }
        }
    }},
    { value: "financial_statements", label: "Annual Financial Statements", icon: FileSpreadsheet, accountType: 'business', schema: {
        type: "object",
        properties: {
            company_name: { type: "string" },
            year_end: { type: "string" },
            total_revenue: { type: "number" },
            net_profit_before_tax: { type: "number" },
            total_assets: { type: "number" },
            total_liabilities: { type: "number" }
        }
    }},
    { value: "supplier_invoices", label: "Supplier Invoices", icon: Receipt, accountType: 'business', schema: {
        type: "object",
        properties: {
            invoices: {
                type: "array",
                items: {
 