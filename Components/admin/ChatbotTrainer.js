import React, { useState, useEffect, useCallback } from 'react';
import { KnowledgeBaseItem } from '@/entities/KnowledgeBaseItem';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PlusCircle, Trash2, Edit, Save, X, Loader2, Bot } from 'lucide-react';
import { useAlert } from "@/components/AlertProvider";

export default function ChatbotTrainer() {
    const [items, setItems] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(null); // holds the id of the item being edited
    const [editData, setEditData] = useState({ question: '', answer: '', category: 'General' });
    const { showAlert } = useAlert();

    const loadItems = useCallback(async () => {
        setIsLoading(true);
        try {
            const allItems = await KnowledgeBaseItem.list('-created_date');
            setItems(allItems);
        } catch (error) {
            showAlert('Error', 'Failed to load knowledge base items.', 'error');
            console.error(error);
        }
        setIsLoading(false);
    }, [showAlert]);

    useEffect(() => {
        loadItems();
    }, [loadItems]);

    const handleAddNew = async () => {
        setIsEditing('new');
        setEditData({ question: '', answer: '', category: 'General' });
    };

    const handleSave = async () => {
        if (!editData.question || !editData.answer) {
            showAlert('Validation Error', 'Question and Answer fields cannot be empty.', 'error');
            return;
        }
        
        setIsLoading(true);
        try {
            if (isEditing === 'new') {
                await KnowledgeBaseItem.create(editData);
                showAlert('Success', 'New Q&A item added to the knowledge base.', 'success');
            } else {
                await KnowledgeBaseItem.update(isEditing, editData);
                showAlert('Success', 'Q&A item updated successfully.', 'success');
            }
            setIsEditing(null);
            await loadItems();
        } catch (error) {
            showAlert('Error', `Failed to save item: ${error.message}`, 'error');
 