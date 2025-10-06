
import React, { useState, useEffect } from 'react';
import { StaffMember } from '@/entities/StaffMember';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, Plus, Trash2, Check, X, Clock, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useAlert } from '@/components/AlertProvider';

const PERMISSIONS_MAP = {
    can_manage_users: "Manage Users",
    can_manage_subscriptions: "Manage Subscriptions",
    can_view_reports: "View Reports",
    can_access_support_chat: "Access Support Chat",
    can_modify_settings: "Modify Platform Settings"
};

export default function StaffManager() {
    const [allStaff, setAllStaff] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);
    const [newStaffEmail, setNewStaffEmail] = useState('');
    const [newStaffRole, setNewStaffRole] = useState('support');
    const { showAlert } = useAlert();

    const loadStaff = async () => {
        setIsLoading(true);
        const staffList = await StaffMember.list('-created_date');
        setAllStaff(staffList);
        setIsLoading(false);
    };

    useEffect(() => {
        loadStaff();
    }, []);

    const handleInvite = async () => {
        if (!newStaffEmail) {
            showAlert('Error', 'Please enter an email address.', 'error');
            return;
        }

        // Single Account Rule: Check if a staff member with this email already exists (active or pending)
        const existingStaff = allStaff.find(s => s.user_email.toLowerCase() === newStaffEmail.toLowerCase());
        if (existingStaff) {
            showAlert('Error', `A staff member with the email ${newStaffEmail} already exists or is pending approval.`, 'error');
            return;
        }

        const defaultPermissions = {
            can_manage_users: newStaffRole === 'admin',
            can_manage_subscriptions: ['admin', 'manager'].includes(newStaffRole),
            can_view_reports: true,
            can_access_support_chat: ['admin', 'support'].includes(newStaffRole),
            can_modify_settings: newStaffRole === 'admin'
        };

        try {
            // Status defaults to 'pending_approval' from entity definition
            await StaffMember.create({
                user_email: newStaffEmail,
                role: newStaffRole,
                hire_date: new Date().toISOString(),
                permissions: defaultPermissions
            });
            setNewStaffEmail('');
            setNewStaffRole('support');
            loadStaff();
            showAlert('Success', 'Staff member has been invited and is awaiting approval.', 'success');
        } catch (error) {
            console.error('Failed to add staff member:', error);
            // The message here implies Staff Verification failure at the backend
            showAlert('Error', 'Failed to add staff member. Make sure the user has a registered WealthHack account.', 'error');
        }
    };
    
    const handleApprove = async (staffId) => {
        setIsProcessing(true);
        try {
            await StaffMember.update(staffId, { status: 'active' });
            showAlert('Approved!', 'Staff member has been activated.', 'success');
            loadStaff();
        } catch (error) {
             showAlert('Error', 'Failed to approve staff member.', 'error');
        }
        setIsProcessing(false);
    };

    const handleReject = async (staffId) => {
        if (window.confirm('Are you sure you want to reject this staff invitation? This will permanently delete the invitation.')) {
            setIsProcessing(true);
            try {
                await StaffMember.delete(staffId);
                showAlert('Rejected', 'The staff invitation has been deleted.', 'success');
                loadStaff();
            } catch (error) {
                showAlert('Error', 'Failed to reject invitation.', 'error');
            }
            setIsProcessing(false);
        }
    };

    const handlePermissionChange = async (staffId, permissionKey, value) => {
        const staffMember = allStaff.find(s => s.id === staffId);
        if (!staffMember) return;

        const updatedPermissions = {
            ...staffMember.permissions,
            [permissionKey]: value
        };

        try {
            await StaffMember.update(staffId, { permissions: updatedPermissions });
            loadStaff();
        } catch (error) {
            console.error('Failed to update permission:', error);
            showAlert('Error', 'Failed to update permission.', 'error');
        }
    };

    const handleDelete = async (staffId) => {
        const staffMemberToDelete = allStaff.find(s => s.id === staffId);
        if (!staffMemberToDelete) {
            showAlert("Error", "Staff member not found.", "error");
            return;
        }

        if (staffMemberToDelete.role === 'admin') {
            const adminCount = allStaff.filter(s => s.role === 'admin' && s.status === 'active').length;
            if (adminCount <= 1) {
                showAlert('Action Blocked', 'Cannot delete the last active admin account. Please assign another user as admin first.', 'error');
                return;
            }
        }

        if (window.confirm(`Are you sure you want to remove ${staffMemberToDelete.user_email}? This action cannot be undone.`)) {
            try {
                await StaffMember.delete(staffId);
                loadStaff();
                showAlert('Success', 'Staff member removed successfully.', 'success');
            } catch (error) {
                console.error('Failed to delete staff member:', error);
                showAlert('Error', 'Failed to delete staff member.', 'error');
            }
        }
    };

    const pendingStaff = allStaff.filter(s => s.status === 'pending_approval');
    const activeStaff = allStaff.filter(s => s.status === 'active');

    return (
        <Card className="border-0 shadow-xl col-span-1 lg:col-span-2">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-purple-600" />
                    Staff Management
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col md:flex-row gap-4 mb-8 p-4 border rounded-lg bg-slate-50">
                    <Input
                        type="email"
                        placeholder="Staff member's email"
                        value={newStaffEmail}
                        onChange={(e) => setNewStaffEmail(e.target.value)}
                        className="flex-grow"
                    />
                    <Select value={newStaffRole} onValueChange={setNewStaffRole}>
                        <SelectTrigger className="w-full md:w-[180px]">
                            <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="support">Support</SelectItem>
                            <SelectItem value="accountant">Accountant</SelectItem>
                            <SelectItem value="manager">Manager</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button onClick={handleInvite} className="w-full md:w-auto">
                        <Plus className="w-4 h-4 mr-2" />
                        Invite Staff
                    </Button>
                </div>

                <Tabs defaultValue="active">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="active">Active Staff ({activeStaff.length})</TabsTrigger>
                        <TabsTrigger value="pending">
                            Pending Approvals
                            {pendingStaff.length > 0 && <Badge className="ml-2 bg-amber-500">{pendingStaff.length}</Badge>}
                        </TabsTrigger>
                    </TabsList>
                    <TabsContent value="active" className="pt-6">
                        <div className="space-y-6">
                            {isLoading ? (
                                <p>Loading staff...</p>
                            ) : activeStaff.length > 0 ? (
                                activeStaff.map(member => (
                                    <div key={member.id} className="p-4 border rounded-lg shadow-sm">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <p className="font-semibold text-slate-900">{member.user_email}</p>
                                                <p className="text-sm text-slate-500 capitalize">{member.role} - Hired: {format(new Date(member.created_date), 'dd MMM yyyy')}</p>
                                            </div>
                                            <Button variant="ghost" size="icon" onClick={() => handleDelete(member.id)}>
                                                <Trash2 className="w-4 h-4 text-red-500" />
                                            </Button>
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-medium mb-2">Permissions</h4>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                                {Object.entries(PERMISSIONS_MAP).map(([key, label]) => (
                                                    <div key={key} className="flex items-center justify-between rounded-lg border p-3">
                                                        <Label htmlFor={`${member.id}-${key}`} className="text-sm">{label}</Label>
                                                        <Switch
                                                            id={`${member.id}-${key}`}
                                                            checked={member.permissions?.[key] || false}
                                                            onCheckedChange={(checked) => handlePermissionChange(member.id, key, checked)}
                                                            disabled={member.role === 'admin'}
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-center text-slate-500 py-4">No active staff members found.</p>
                            )}
                        </div>
                    </TabsContent>
                    <TabsContent value="pending" className="pt-6">
                         <div className="space-y-4">
                            {isLoading ? (
                                <p>Loading pending invitations...</p>
                            ) : pendingStaff.length > 0 ? (
                                pendingStaff.map(member => (
                                    <div key={member.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 border rounded-lg shadow-sm bg-amber-50/50">
                                        <div className="mb-4 sm:mb-0">
                                            <p className="font-semibold text-slate-900">{member.user_email}</p>
                                            <p className="text-sm text-slate-500 capitalize">Invited as: {member.role}</p>
                                            <p className="text-xs text-slate-400">Invited on: {format(new Date(member.created_date), 'dd MMM yyyy')}</p>
                                        </div>
                                        <div className="flex gap-2 w-full sm:w-auto">
                                            <Button size="sm" variant="outline" className="w-1/2 sm:w-auto" onClick={() => handleReject(member.id)} disabled={isProcessing}>
                                                {isProcessing ? <Loader2 className="w-4 h-4 animate-spin"/> : <X className="w-4 h-4 mr-1"/>} Reject
                                            </Button>
                                            <Button size="sm" className="w-1/2 sm:w-auto bg-emerald-600 hover:bg-emerald-700" onClick={() => handleApprove(member.id)} disabled={isProcessing}>
                                               {isProcessing ? <Loader2 className="w-4 h-4 animate-spin"/> : <Check className="w-4 h-4 mr-1"/>} Approve
                                            </Button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-center text-slate-500 py-4">No staff members are pending approval.</p>
                            )}
                        </div>
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
}
