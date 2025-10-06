import React, { useState, useEffect, useCallback } from 'react';
import { Campaign } from '@/entities/Campaign';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { PlusCircle, Edit, Trash2, Megaphone } from 'lucide-react';
import { format } from 'date-fns';

const CampaignForm = ({ campaign, onSave, onCancel }) => {
    const [formData, setFormData] = useState(campaign || {
        name: '',
        platform: 'Facebook',
        status: 'Planning',
        start_date: '',
        end_date: '',
        link: '',
        notes: ''
    });

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <Label htmlFor="name">Campaign Name</Label>
                <Input id="name" value={formData.name} onChange={(e) => handleChange('name', e.target.value)} required />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="platform">Platform</Label>
                    <Select value={formData.platform} onValueChange={(value) => handleChange('platform', value)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                            {Campaign.schema().properties.platform.enum.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
                <div>
                    <Label htmlFor="status">Status</Label>
                    <Select value={formData.status} onValueChange={(value) => handleChange('status', value)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                             {Campaign.schema().properties.status.enum.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
            </div>
             <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="start_date">Start Date</Label>
                    <Input id="start_date" type="date" value={formData.start_date} onChange={(e) => handleChange('start_date', e.target.value)} />
                </div>
                <div>
                    <Label htmlFor="end_date">End Date</Label>
                    <Input id="end_date" type="date" value={formData.end_date} onChange={(e) => handleChange('end_date', e.target.value)} />
                </div>
            </div>
            <div>
                <Label htmlFor="link">Campaign Link</Label>
                <Input id="link" placeholder="https://your.campaign/link" value={formData.link} onChange={(e) => handleChange('link', e.target.value)} />
            </div>
            <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea id="notes" value={formData.notes} onChange={(e) => handleChange('notes', e.target.value)} />
            </div>
            <DialogFooter>
                <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
                <Button type="submit">Save Campaign</Button>
            </DialogFooter>
        </form>
    );
};

export default function CampaignManager() {
    const [campaigns, setCampaigns] = useState([]);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingCampaign, setEditingCampaign] = useState(null);

    const loadCampaigns = useCallback(async () => {
        const data = await Campaign.list('-created_date');
        setCampaigns(data);
    }, []);

    useEffect(() => {
        loadCampaigns();
    }, [loadCampaigns]);

    const handleSave = async (data) => {
        if (editingCampaign) {
            await Campaign.update(editingCampaign.id, data);
        } else {
            await Campaign.create(data);
        }
        await loadCampaigns();
        setIsFormOpen(false);
        setEditingCampaign(null);
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this campaign?")) {
            await Campaign.delete(id);
            await loadCampaigns();
        }
    };

    const openForm = (campaign = null) => {
        setEditingCampaign(campaign);
        setIsFormOpen(true);
    };

    return (
        <Card className="border-0 shadow-xl">
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                    <Megaphone className="w-5 h-5 text-indigo-600" />
                    Campaign Tracker
                </CardTitle>
                <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={() => openForm()}>
                            <PlusCircle className="w-4 h-4 mr-2" /> Add Campaign
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{editingCampaign ? 'Edit Campaign' : 'Add New Campaign'}</DialogTitle>
                        </DialogHeader>
                        <CampaignForm
                            campaign={editingCampaign}
                            onSave={handleSave}
                            onCancel={() => { setIsFormOpen(false); setEditingCampaign(null); }}
                        />
                    </DialogContent>
                </Dialog>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Platform</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Period</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {campaigns.length > 0 ? campaigns.map(c => (
                            <TableRow key={c.id}>
                                <TableCell className="font-medium">{c.name}</TableCell>
                                <TableCell>{c.platform}</TableCell>
                                <TableCell>{c.status}</TableCell>
                                <TableCell>
                                    {c.start_date ? format(new Date(c.start_date), 'dd MMM yy') : 'N/A'} - {c.end_date ? format(new Date(c.end_date), 'dd MMM yy') : 'N/A'}
                                </TableCell>
                                <TableCell className="space-x-2">
                                    <Button variant="ghost" size="icon" onClick={() => openForm(c)}><Edit className="w-4 h-4" /></Button>
                                    <Button variant="ghost" size="icon" onClick={() => handleDelete(c.id)}><Trash2 className="w-4 h-4 text-red-500" /></Button>
                                </TableCell>
                            </TableRow>
                        )) : (
                            <TableRow>
                                <TableCell colSpan="5" className="text-center">No campaigns created yet.</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}