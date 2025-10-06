import React, { useState, useEffect } from 'react';
import { SharedReport } from '@/entities/SharedReport';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Clock } from 'lucide-react';

export default function ViewReport() {
    const [report, setReport] = useState(null);
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchReport = async () => {
            const params = new URLSearchParams(window.location.search);
            const reportId = params.get('id');

            if (!reportId) {
                setError("No report ID provided.");
                setIsLoading(false);
                return;
            }

            try {
                const fetchedReport = await SharedReport.get(reportId);
                
                if (new Date(fetchedReport.expires_at) < new Date()) {
                    setError("This report link has expired.");
                    setReport(null);
                } else {
                    setReport(fetchedReport);
                    document.title = fetchedReport.report_title || "Financial Report";
                }
            } catch (e) {
                console.error("Failed to fetch report:", e);
                setError("This report could not be found or has been deleted.");
            }
            setIsLoading(false);
        };

        fetchReport();
    }, []);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-slate-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-red-50 p-4">
                <Card className="w-full max-w-lg text-center shadow-lg">
                    <CardHeader>
                        <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                           <AlertCircle className="w-8 h-8 text-red-600" />
                        </div>
                        <CardTitle className="text-red-800">Link Error</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-slate-700">{error}</p>
                    </CardContent>
                </Card>
            </div>
        );
    }
    
    // This is a special component to render the pre-generated HTML for the report.
    // It is used for public sharing links.
    return (
        <div>
            <div dangerouslySetInnerHTML={{ __html: report.html_content }} />
        </div>
    );
}