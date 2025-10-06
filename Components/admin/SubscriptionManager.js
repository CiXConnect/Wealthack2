
import React, { useState, useEffect, useCallback } from 'react';
import { Subscription } from '@/entities/Subscription';
import { Account } from '@/entities/Account';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle, XCircle, Clock, Eye, ShoppingCart, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { SendEmail } from "@/integrations/Core";
import { useAlert } from '@/components/AlertProvider';

export default function SubscriptionManager() {
    const [subscriptions, setSubscriptions] = useState([]);
    const [accounts, setAccounts] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);
    const [rejectionInfo, setRejectionInfo] = useState({ open: false, subId: null, reason: '' });
    const { showAlert } = useAlert();

    const loadSubscriptions = useCallback(async () => {
        setIsLoading(true);
        try {
            const [subs, accs] = await Promise.all([
                Subscription.list('-created_date'),
                Account.list()
            ]);
            
            setSubscriptions(subs);
            
            const accountMap = accs.reduce((map, acc) => {
                map[acc.id] = acc;
                return map;
            }, {});
            setAccounts(accountMap);
            
        } catch (error) {
            console.error("Failed to load subscriptions or accounts:", error);
            showAlert("Error", "Failed to load subscriptions or accounts.", "error");
        }
        setIsLoading(false);
    }, [showAlert]);

    useEffect(() => {
        loadSubscriptions();
    }, [loadSubscriptions]);

    const handleApprove = async (subId) => {
        setIsProcessing(true);
        try {
            await Subscription.update(subId, { status: 'active' });
            loadSubscriptions();
        } catch (error) {
            console.error(`Failed to activate subscription:`, error);
            showAlert("Error", `Could not activate subscription.`, "error");
        }
        setIsProcessing(false);
    };

    const handleReject = (subId) => {
        setRejectionInfo({ open: true, subId: subId, reason: '' });
    };

    const handleConfirmRejection = async () => {
        if (!rejectionInfo.subId || !rejectionInfo.reason) {
            showAlert("Validation Error", "Please provide a reason for rejection.", "error");
            return;
        }
        setIsProcessing(true);
        try {
            const subToReject = subscriptions.find(s => s.id === rejectionInfo.subId);
            if (subToReject) {
                const account = accounts[subToReject.account_id];
                await Subscription.update(rejectionInfo.subId, { status: 'rejected', rejection_reason: rejectionInfo.reason });
                
                if (account?.owner_email) {
                    await SendEmail({
                        to: account.owner_email,
                        from_name: "WealthHack Support",
                        subject: "Your Subscription Payment Was Rejected",
                        body: `
                            <p>Hello,</p>
                            <p>We are writing to inform you that your recent subscription payment for WealthHack has been rejected.</p>
                            <p><b>Reason for rejection:</b> ${rejectionInfo.reason}</p>
                            <p>Please review the reason, correct any issues, and feel free to attempt the subscription process again. If you have any questions, please contact our support team.</p>
                            <p>Thank you,<br>The WealthHack Team</p>
                        `
                    });
                }
            }
            setRejectionInfo({ open: false, subId: null, reason: '' });
            loadSubscriptions();
        } catch (error) {
            console.error("Failed to reject subscription:", error);
            showAlert("Error", "Could not reject subscription.", "error");
        }
        setIsProcessing(false);
    };
    
    const pendingSubscriptions = subscriptions.filter(s => s.status === 'pending_approval');
    const activeSubscriptions = subscriptions.filter(s => s.status === 'active');

    const renderSubscriptionRow = (sub, isPending) => {
        const account = accounts[sub.account_id];
        return (
            <TableRow key={sub.id}>
                <TableCell>
                    <div className="font-medium text-slate-900">{account?.account_name || 'N/A'}</div>
                    <div className="text-sm text-slate-500">{account?.owner_email || sub.account_id}</div>
                </TableCell>
                <TableCell>{(sub.tier || 'N/A').replace(/_/g, ' ')}</TableCell>
                <TableCell>R {sub.price_paid?.toLocaleString() || '0'}</TableCell>
                <TableCell>
                     <Badge 
                        className={
                            sub.status === 'active' ? 'bg-emerald-100 text-emerald-800' :
                            sub.status === 'pending_approval' ? 'bg-amber-100 text-amber-800' :
                            sub.status === 'rejected' ? 'bg-red-100 text-red-800' :
                            'bg-slate-100 text-slate-800'
                        }
                    >
                        {(sub.status || 'unknown').replace(/_/g, ' ')}
                    </Badge>
                </TableCell>
                 <TableCell>{sub.end_date ? format(new Date(sub.end_date), 'dd MMM yyyy') : 'N/A'}</TableCell>
                <TableCell className="text-right">
                    {isPending && (
                        <div className="flex gap-2 justify-end">
                            <Button variant="outline" size="sm" asChild>
                                <a href={sub.proof_of_payment_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1">
                                    <Eye className="w-4 h-4"/> View POP
                                </a>
                            </Button>
                            <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700" onClick={() => handleApprove(sub.id)} disabled={isProcessing}>
                                {isProcessing ? <Loader2 className="w-4 h-4 mr-1 animate-spin"/> : <CheckCircle className="w-4 h-4 mr-1"/>} Approve
                            </Button>
                            <Button size="sm" variant="destructive" onClick={() => handleReject(sub.id)} disabled={isProcessing}>
                                 <XCircle className="w-4 h-4 mr-1"/> Reject
                            </Button>
                        </div>
                    )}
                </TableCell>
            </TableRow>
        );
    };

    return (
        <>
            <AlertDialog open={rejectionInfo.open} onOpenChange={(open) => !isProcessing && setRejectionInfo(prev => ({...prev, open}))}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Reject Subscription</AlertDialogTitle>
                        <AlertDialogDescription>
                            Please provide a clear reason for rejecting this payment. This reason will be emailed to the user.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="grid gap-2 py-4">
                        <Label htmlFor="rejection-reason">Reason for Rejection</Label>
                        <Textarea 
                            id="rejection-reason" 
                            placeholder="e.g., Incorrect reference number used, amount paid does not match."
                            value={rejectionInfo.reason}
                            onChange={(e) => setRejectionInfo(prev => ({...prev, reason: e.target.value}))}
                        />
                    </div>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isProcessing}>Cancel</AlertDialogCancel>
                        <Button variant="destructive" onClick={handleConfirmRejection} disabled={isProcessing || !rejectionInfo.reason}>
                            {isProcessing ? <Loader2 className="w-4 h-4 mr-2 animate-spin"/> : <XCircle className="w-4 h-4 mr-2"/>} Confirm Rejection
                        </Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <Card className="border-0 shadow-xl">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <ShoppingCart className="w-5 h-5 text-blue-600" />
                        Subscription Management
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue="pending">
                        <TabsList>
                            <TabsTrigger value="pending">
                                Pending Approval 
                                {pendingSubscriptions.length > 0 && <Badge className="ml-2 bg-amber-500 text-white">{pendingSubscriptions.length}</Badge>}
                            </TabsTrigger>
                            <TabsTrigger value="active">Active Subscriptions</TabsTrigger>
                        </TabsList>
                        <TabsContent value="pending" className="mt-4">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Account</TableHead>
                                        <TableHead>Tier</TableHead>
                                        <TableHead>Price</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Expiry</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {isLoading ? (
                                        <TableRow><TableCell colSpan={6} className="text-center">Loading...</TableCell></TableRow>
                                    ) : pendingSubscriptions.length > 0 ? (
                                        pendingSubscriptions.map(sub => renderSubscriptionRow(sub, true))
                                    ) : (
                                        <TableRow><TableCell colSpan={6} className="text-center">No subscriptions are pending approval.</TableCell></TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </TabsContent>
                         <TabsContent value="active" className="mt-4">
                             <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Account</TableHead>
                                        <TableHead>Tier</TableHead>
                                        <TableHead>Price</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Expiry</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {isLoading ? (
                                        <TableRow><TableCell colSpan={6} className="text-center">Loading...</TableCell></TableRow>
                                    ) : activeSubscriptions.length > 0 ? (
                                        activeSubscriptions.map(sub => renderSubscriptionRow(sub, false))
                                    ) : (
                                        <TableRow><TableCell colSpan={6} className="text-center">No active subscriptions found.</TableCell></TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </>
    );
}
