import React, { createContext, useContext, useState, useCallback } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { CheckCircle, AlertCircle, Info } from 'lucide-react';

const AlertContext = createContext(null);

export const useAlert = () => {
    const context = useContext(AlertContext);
    if (!context) {
        throw new Error('useAlert must be used within an AlertProvider');
    }
    return context;
};

export const AlertProvider = ({ children }) => {
    const [alertState, setAlertState] = useState(null);

    const showAlert = useCallback((title, message, type = 'info') => {
        setAlertState({ title, message, type });
    }, []);

    const hideAlert = useCallback(() => {
        setAlertState(null);
    }, []);

    const Icon = {
        success: <CheckCircle className="w-6 h-6 text-emerald-500" />,
        error: <AlertCircle className="w-6 h-6 text-red-500" />,
        info: <Info className="w-6 h-6 text-blue-500" />
    }[alertState?.type || 'info'];

    return (
        <AlertContext.Provider value={{ showAlert }}>
            {children}
            {alertState && (
                <AlertDialog open={true} onOpenChange={hideAlert}>
       