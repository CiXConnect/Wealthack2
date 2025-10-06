
import React, { useState, useEffect, useCallback } from "react";
import { User } from "@/entities/User";
import { PlatformSettings } from "@/entities/PlatformSettings";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Shield, AlertCircle, Save, DollarSign, Mail, Lock, Globe, Sparkles, MessageSquare, Search, Loader2, Bot } from "lucide-react"; // Added Bot icon
import StaffManager from "../components/admin/StaffManager";
import SubscriptionManager from "../components/admin/SubscriptionManager";
import CompanyVettingManager from "../components/admin/CompanyVettingManager";
import CampaignManager from "../components/admin/CampaignManager";
import MarketingSettingsManager from "../components/admin/MarketingSettingsManager"; // New Import
import ChatbotTrainer from "../components/admin/ChatbotTrainer"; // Import the new trainer component
import { Textarea } from "@/components/ui/textarea";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"; // New Import

// Provides a default structure for settings if none exist
const getDefaultSettings = () => ({
  tier_prices: {},
  smtp_settings: {},
  security_settings: { allowed_2fa_methods: [] },
  geographic_restrictions: { allowed_countries: [] },
  trial_settings: { features_during_trial: {} },
  support_settings: {},
  seo_settings: {},
  marketing_settings: { // New default for marketing settings
    visitor_counter_start_date: null,
    dynamic_growth_factor: 0
  }
});

export default function Admin() {
  const [user, setUser] = useState(null);
  const [settings, setSettings] = useState(getDefaultSettings());
  const [settingsId, setSettingsId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [alertInfo, setAlertInfo] = useState({ type: null, message: null });

  const showAlert = (type, message) => {
      setAlertInfo({ type, message });
      setTimeout(() => setAlertInfo({ type: null, message: null }), 5000); // Clear after 5 seconds
  };

  const loadAdminData = useCallback(async () => {
    setIsLoading(true);
    try {
      const currentUser = await User.me();
      setUser(currentUser);

      if (currentUser.role !== 'admin') {
        setError("You do not have permission to access this page.");
        setIsLoading(false);
        return;
      }

      const platformSettings = await PlatformSettings.list(null, 1);
      if (platformSettings.length > 0) {
        // Ensure nested objects exist to prevent runtime errors
        const loadedSettings = platformSettings[0];
        loadedSettings.tier_prices = loadedSettings.tier_prices || {};
        loadedSettings.smtp_settings = loadedSettings.smtp_settings || {};
        loadedSettings.security_settings = loadedSettings.security_settings || {};
        loadedSettings.geographic_restrictions = loadedSettings.geographic_restrictions || {};
        loadedSettings.trial_settings = loadedSettings.trial_settings || {};
        loadedSettings.trial_settings.features_during_trial = loadedSettings.trial_settings.features_during_trial || {};
        loadedSettings.support_settings = loadedSettings.support_settings || {};
        loadedSettings.seo_settings = loadedSettings.seo_settings || {};
        loadedSettings.marketing_settings = loadedSettings.marketing_settings || { visitor_counter_start_date: null, dynamic_growth_factor: 0 }; // New

        setSettings(loadedSettings);
        setSettingsId(loadedSettings.id);
      } else {
        setSettings(getDefaultSettings());
        setSettingsId(null);
      }
    } catch (err) {
      setError("An error occurred while loading admin data.");
      console.error(err);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadAdminData();
  }, [loadAdminData]);

  const handleInputChange = (group, key, value) => {
    setSettings(prev => ({
      ...prev,
      [group]: {
        ...prev[group],
        [key]: value
      }
    }));
  };
  
  const handleNestedInputChange = (group, subGroup, key, value) => {
    setSettings(prev => ({
      ...prev,
      [group]: {
        ...prev[group],
        [subGroup]: {
          ...prev[group][subGroup],
          [key]: value
        }
      }
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const updatedSettings = { ...settings };
      // If marketing settings and visitor counter start date are not set, set it now.
      if (!updatedSettings.marketing_settings) {
          updatedSettings.marketing_settings = {};
      }
      if (!updatedSettings.marketing_settings.visitor_counter_start_date) {
          updatedSettings.marketing_settings.visitor_counter_start_date = new Date().toISOString();
      }

      if (settingsId) { // Use settingsId state for clarity
        await PlatformSettings.update(settingsId, updatedSettings);
      } else {
        const newSettings = await PlatformSettings.create(updatedSettings);
        setSettingsId(newSettings.id);
      }
      showAlert("success", "Settings saved successfully!");
    } catch (err) {
      showAlert("error", "Failed to save settings. Please try again.");
      console.error(err);
    }
    setIsSaving(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900"></div>
      </div>
    );
  }
  
  if (error) {
    return (
       <div className="flex flex-col items-center justify-center min-h-screen bg-red-50 p-6">
        <AlertCircle className="w-16 h-16 text-red-500 mb-4"/>
        <h1 className="text-2xl font-bold text-red-900 mb-2">Access Denied</h1>
        <p className="text-red-700">{error}</p>
      </div>
    )
  }

  const schema = PlatformSettings.schema().properties;

  return (
    <div className="p-6 md:p-8 space-y-8">
      {alertInfo.message && (
          <Alert className={`mb-4 ${alertInfo.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
              {alertInfo.type === 'error' ? <AlertCircle className="h-4 w-4" /> : <Save className="h-4 w-4" />}
              <AlertTitle>{alertInfo.type === 'error' ? "Error" : "Success"}</AlertTitle>
              <AlertDescription>{alertInfo.message}</AlertDescription>
          </Alert>
      )}

      <div className="flex justify-between items-start">
        <div>
            <h1 className="text-3xl font-bold text-slate-900">Admin Dashboard</h1>
            <p className="text-slate-600">Manage platform-wide settings and operations.</p>
        </div>
        <Button onClick={handleSave} disabled={isSaving} className="bg-gradient-to-r from-blue-900 to-blue-700 hover:from-blue-800 hover:to-blue-600 text-white font-semibold">
            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Save All Settings
        </Button>
      </div>

      <Tabs defaultValue="settings" className="w-full"> {/* Changed default to settings for easier development */}
        <TabsList className="grid w-full grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 h-auto flex-wrap">
          <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
          <TabsTrigger value="vetting">Company Vetting</TabsTrigger>
          <TabsTrigger value="staff">Staff Management</TabsTrigger>
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="chatbot"><div className="flex items-center gap-2"><Bot className="w-4 h-4"/>Chatbot Training</div></TabsTrigger>
          <TabsTrigger value="settings">Platform Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="subscriptions" className="pt-6 max-w-6xl mx-auto">
          <SubscriptionManager />
        </TabsContent>
        <TabsContent value="vetting" className="pt-6 max-w-6xl mx-auto">
          <CompanyVettingManager />
        </TabsContent>
        <TabsContent value="staff" className="pt-6 max-w-6xl mx-auto">
            <StaffManager />
        </TabsContent>
        <TabsContent value="campaigns" className="pt-6 max-w-6xl mx-auto">
            <CampaignManager />
        </TabsContent>
        <TabsContent value="chatbot" className="pt-6 max-w-6xl mx-auto">
            <ChatbotTrainer />
        </TabsContent>
        <TabsContent value="settings" className="pt-6">
            <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                
                {/* Tier Prices */}
                <Card className="border-0 shadow-xl">
                    <CardHeader>
                    <CardTitle className="flex items-center gap-2"><DollarSign className="w-5 h-5 text-emerald-600"/>Tier Prices (ZAR)</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {Object.keys(schema.tier_prices.properties).map(key => (
                        <div key={key} className="space-y-1">
                        <Label htmlFor={key}>{key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</Label>
                        <Input
                            id={key}
                            type="number"
                            value={settings.tier_prices?.[key] || ''}
                            onChange={(e) => handleInputChange('tier_prices', key, parseFloat(e.target.value) || 0)}
                        />
                        </div>
                    ))}
                    </CardContent>
                </Card>

                {/* SMTP Settings */}
                <Card className="border-0 shadow-xl">
                    <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Mail className="w-5 h-5 text-blue-600"/>SMTP Settings</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                    {Object.keys(schema.smtp_settings.properties).map(key => (
                        <div key={key} className="space-y-1">
                        <Label htmlFor={`smtp-${key}`}>{key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</Label>
                        {key.includes('password') ? (
                            <PasswordInput
                                id={`smtp-${key}`}
                                value={settings.smtp_settings?.[key] || ''}
                                onChange={(e) => handleInputChange('smtp_settings', key, e.target.value)}
                                autoComplete="new-password"
                            />
                        ) : (
                            <Input
                            id={`smtp-${key}`}
                            type='text'
                            value={settings.smtp_settings?.[key] || ''}
                            onChange={(e) => handleInputChange('smtp_settings', key, e.target.value)}
                            />
                        )}
                        </div>
                    ))}
                    </CardContent>
                </Card>

                {/* SEO Settings (Revised as per outline and original field types) */}
                <Card className="border-0 shadow-xl">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Search className="w-5 h-5 text-green-600"/>SEO & Site Verification</CardTitle>
                    <CardDescription>Manage SEO for public pages and verify site ownership with search engines.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                     <div className="space-y-1">
                      <Label htmlFor="meta_title">Meta Title</Label>
                      <Input id="meta_title" value={settings.seo_settings?.meta_title || ''} onChange={(e) => handleInputChange('seo_settings', 'meta_title', e.target.value)} />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="meta_description">Meta Description</Label>
                      <Textarea id="meta_description" value={settings.seo_settings?.meta_description || ''} onChange={(e) => handleInputChange('seo_settings', 'meta_description', e.target.value)} />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="keywords">Keywords (comma-separated)</Label>
                      <Input id="keywords" value={settings.seo_settings?.keywords || ''} onChange={(e) => handleInputChange('seo_settings', 'keywords', e.target.value)} />
                    </div>
                     <div className="space-y-1 pt-4 border-t">
                      <Label htmlFor="google_site_verification">Google Site Verification Code</Label>
                      <Input id="google_site_verification" placeholder="Paste the code from your Google meta tag" value={settings.seo_settings?.google_site_verification || ''} onChange={(e) => handleInputChange('seo_settings', 'google_site_verification', e.target.value)} />
                    </div>
                     <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>How Site Verification Works</AlertTitle>
                      <AlertDescription>
                        Paste the content from the verification meta tag provided by Google Search Console. The platform will automatically add the tag to your site's header.
                      </AlertDescription>
                    </Alert>
                  </CardContent>
                </Card>
