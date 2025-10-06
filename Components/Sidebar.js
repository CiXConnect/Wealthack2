
import React, { createContext, useContext, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { ChevronsLeft } from "lucide-react";

const SidebarContext = createContext(null);

export const SidebarProvider = ({ children }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <SidebarContext.Provider value={{ isOpen, setIsOpen }}>
            {children}
        </SidebarContext.Provider>
    );
};

export function useSidebar() {
    const context = useContext(SidebarContext);
    if (!context) {
        throw new Error('useSidebar must be used within a SidebarProvider');
    }
    return context;
}

export const Sidebar = ({ children, className }) => {
  const { isOpen, setIsOpen } = useSidebar();
  return (
    <>
      <aside
        className={`fixed inset-y-0 left-0 z-20 flex h-full w-64 flex-col transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${!isOpen ? '-translate-x-full' : ''} ${className || 'bg-white'}`.trim()}
      >
        <div className="flex-1 flex flex-col overflow-hidden">{children}</div>
      </aside>
      
      {/* Mobile persistent toggle button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`md:hidden fixed top-1/2 -translate-y-1/2 z-30 w-6 h-24 bg-blue-600 text-white rounded-r-lg shadow-lg flex items-center justify-center transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-64' : 'translate-x-0'}`}
        aria-label="Toggle sidebar"
      >
        <ChevronsLeft className={`h-5 w-5 transition-transform ${!isOpen ? 'rotate-180' : ''}`} />
      </button>
    </>