
import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Sidebar,
  SidebarProvider,
  SidebarTrigger,
  SidebarHeader,
  SidebarContent,
  SidebarLink,
  SidebarFooter,
} from "@/components/Sidebar.js";
import ErrorBoundary from "@/components/ErrorBoundary";
import { User } from "@/entities/User";
import { Account } from "@/entities/Account";
import { PlatformSettings } from "@/entities/PlatformSettings";
import { Subscription } from "@/entities/Subscription";
import { UserTrial } from "@/entities/UserTrial"; // Added import for UserTrial
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"; // Added imports for Dialog
import SubscriptionPage from "@/pages/Subscription"; // Added import for SubscriptionPage
import {
  LogOut,
  Settings,
  Upload,
  BarChart2,
  LayoutDashboard,
  CreditCard,
  Info,
  Shield,
  PlusCircle,
  RefreshCw,
  Landmark,
  Wallet,
  Home,
  ChevronDown,
  Briefcase,
  User as UserIcon,
} from "lucide-react";
import { createPageUrl } from "@/utils";
import LiveSupportChat from "@/components/chat/LiveSupportChat";
import { AlertProvider, useAlert } from "@/components/AlertProvider";

export default function Layout({ children, currentPageName }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [settings, setSettings] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [activeAccountId, setActiveAccountId] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [forceSubscription, setForceSubscription] = useState(false); // New state for forced subscription
  const [solutionsOpen, setSolutionsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const publicPages = ["Landing", "AboutUs", "Subscription", "PersonalSolutions", "BusinessSolutions", "ViewReport", "VerifyEmail", "Home"];
  const isPublicPage = publicPages.includes(currentPageName);

  useEffect(() => {
    const fetchSettingsAndApplySEO = async () => {
      try {
        const platformSettingsResult = await PlatformSettings.list(null, 1);
        if (platformSettingsResult.length > 0) {
          const loadedSettings = platformSettingsResult[0];
          setSettings(loadedSettings);

          if (loadedSettings.seo_settings) {
            if (loadedSettings.seo_settings.google_site_verification) {
              let metaTag = document.querySelector('meta[name="google-site-verification"]');
              if (!metaTag) {
                metaTag = document.createElement('meta');
                metaTag.name = 'google-site-verification';
                document.head.appendChild(metaTag);
              }
              metaTag.content = loadedSettings.seo_settings.google_site_verification;
            }

            if (isPublicPage) {
              document.title = loadedSettings.seo_settings.meta_title || document.title;
              let metaDesc = document.querySelector('meta[name="description"]');
              if (!metaDesc) {
                metaDesc = document.createElement('meta');
                metaDesc.name = 'description';
                document.head.appendChild(metaDesc);
              }
              metaDesc.content = loadedSettings.seo_settings.meta_description || '';
              let metaKeywords = document.querySelector('meta[name="keywords"]');
              if (!metaKeywords) {
                metaKeywords = document.createElement('meta');
                metaKeywords.name = 'keywords';
                document.head.appendChild(metaKeywords);
              }
              metaKeywords.content = loadedSettings.seo_settings.keywords || '';
            }
          }
        } else {
          setSettings({});
        }
      } catch (error) {
        console.error("Error fetching platform settings:", error);
        setSettings({});
      }
    };

    fetchSettingsAndApplySEO();
  }, [currentPageName, isPublicPage]);

  useEffect(() => {
    if (isPublicPage || currentPageName === 'Onboarding') {
      setIsLoading(false);
      return;
    }

    const fetchPrivateData = async () => {
        setIsLoading(true);
        try {
            const currentUser = await User.me();
            setUser(currentUser);
            
            const preferredType = localStorage.getItem('loginAccountType');
            let userAccounts = [];
            let activeId = localStorage.getItem('activeAccountId');

            // ADMIN OVERRIDE: Admins can see all their accounts
            if (currentUser.role === 'admin') {
                userAccounts = await Account.filter({ owner_email: currentUser.email });
                if (userAccounts.length > 0) {
                    const activeIdIsValid = userAccounts.some(acc => acc.id === activeId);
                    if (!activeId || !activeIdIsValid) {
                        activeId = userAccounts[0].id;
                        localStorage.setItem('activeAccountId', activeId);
                    }
                } else {
                    activeId = null;
                    localStorage.removeItem('activeAccountId');
                }
            } else { // Existing logic for regular users
                if (preferredType) {
                    // User just logged in from the Home page. This is the source of truth for the session type.
                    localStorage.removeItem('loginAccountType');
                    userAccounts = await Account.filter({ owner_email: currentUser.email, account_type: preferredType });
                    
                    if (userAccounts.length > 0) {
                        activeId = userAccounts[0].id;
                        localStorage.setItem('activeAccountId', activeId);
                    } else {
                        // No accounts of this type, redirect to create one.
                        navigate(createPageUrl(`Onboarding?type=${preferredType}`));
                        setIsLoading(false);
                        return;
                    }
                } else if (activeId) {
                    // User has an active session. Determine type from active account.
                    try {
                        const activeAccount = await Account.get(activeId);
                        userAccounts = await Account.filter({ owner_email: currentUser.email, account_type: activeAccount.account_type });
                    } catch (e) {
                        if (e.message?.includes("No object found")) { // If active account ID is invalid
                            console.warn(`Active account ID ${activeId} not found, clearing.`);
                            localStorage.removeItem('activeAccountId');
                            navigate(createPageUrl('Home')); // Redirect to Home to pick a session/account
                            setIsLoading(false);
                            return;
                        }
                        throw e; // Re-throw other errors
                    }
                } else {
                    // No session preference and no active account. Check if they have ANY accounts.
                     const allAccounts = await Account.filter({ owner_email: currentUser.email });
                     if (allAccounts.length === 0) {
                         navigate(createPageUrl('Onboarding')); // First-time user
                     } else {
                         navigate(createPageUrl('Home')); // Has accounts but must choose a session type
                     }
                     setIsLoading(false);
                     return;
                }
            }

            setAccounts(userAccounts); // Set accounts for the switcher (now filtered by type for users, or all for admins)
            setActiveAccountId(activeId);
            
            // Continue fetching subscription and trial info based on the determined activeId
            if (activeId) {
                const subs = await Subscription.filter({ account_id: activeId }, "-created_date", 1);
                setSubscription(subs.length > 0 ? subs[0] : null);

                // Check for forced subscription, but NEVER for admins
                if (currentUser.role !== 'admin') {
                    if (!subs.length || subs[0].status !== 'active') {
                        const trials = await UserTrial.filter({ user_email: currentUser.email, trial_status: 'active' });
                        if (trials.length === 0) {
                            setForceSubscription(true);
                        }
                    }
                }
            } else {
                setSubscription(null);
                setForceSubscription(false);
            }
            
        } catch (e) {
            console.error("Error fetching private data, redirecting to login:", e);
            if (e.message?.includes("No object found")) { // If active account ID is invalid, handled inside try for specific case
                localStorage.removeItem('activeAccountId');
                navigate(createPageUrl('Home'));
            } else {
                navigate(createPageUrl('Landing'));
            }
            setIsLoading(false); // Ensure isLoading is false on error path
        } finally {
            // Ensure isLoading is set to false if it hasn't been handled by an early return or specific catch block
            setIsLoading(false);
        }
    };
    
    fetchPrivateData();
  }, [navigate, currentPageName, isPublicPage, location.key]); // Use location.key to force re-fetch on navigation

  const handleLogout = async () => {
    await User.logout();
    localStorage.removeItem('activeAccountId');
    window.location.href = createPageUrl('Landing');
  };
  
  const handleAccountSwitch = (newAccountId) => {
    // The "add-new-account" option has been removed, so this check is technically not needed for UI but can remain for safety
    if (newAccountId === "add-new-account") { 
      navigate(createPageUrl('Onboarding'));
      return;
    }
    localStorage.setItem('activeAccountId', newAccountId);
    window.location.reload();
  };

  if (isPublicPage || currentPageName === "Onboarding") {
    return <AlertProvider><ErrorBoundary>{children}</ErrorBoundary></AlertProvider>;
  }
  
  if (isLoading) {
      return (
          <div className="flex items-center justify-center min-h-screen bg-slate-100">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900"></div>
          </div>
      );
  }
  
  if (!user) {
    return (
        <div className="flex items-center justify-center min-h-screen bg-slate-100">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900"></div>
        </div>
    );
  }

  const activeAccount = accounts.find(acc => acc.id === activeAccountId);
  const canAccessTaxFiling = subscription?.status === 'active' && (subscription.features?.sars_reporting || subscription.features?.full_access);
  const canAccessPayroll = subscription?.status === 'active' && subscription.features?.can_generate_payslips && activeAccount?.payroll_vetting_status === 'verified';
  const upgradeUrl = activeAccount?.account_type === 'business' ? createPageUrl("BusinessSolutions") : createPageUrl("PersonalSolutions");

  return (
    <>
    <style jsx global>{`
      :root {
        --background: 240 5% 95%; /* Updated from 240 10% 98% */
        --foreground: 240 5% 30%;
        --card: 0 0% 100%;
        --card-foreground: 240 5% 30%;
        --popover: 0 0% 100%;
        --popover-foreground: 240 5% 30%;
        --primary: 245 80% 55%;
        --primary-foreground: 0 0% 100%;
        --secondary: 240 5% 90%;
        --secondary-foreground: 240 5% 20%;
        --muted: 240 5% 95%;
        --muted-foreground: 240 5% 55%;
        --accent: 240 5% 90%;
        --accent-foreground: 240 5% 20%;
        --destructive: 0 84% 60%;
        --destructive-foreground: 0 0% 100%;
        --border: 240 5% 85%;
        --input: 240 5% 92%;
        --ring: 245 80% 55%;
        --radius: 0.75rem;
      }
    `}</style>
    <SidebarProvider>
      <AlertProvider>
        <div className="min-h-screen flex w-full bg-slate-100 font-sans">
          <Sidebar className="bg-blue-900 text-white border-r-0">
            <SidebarHeader className="border-b border-blue-700 p-4 space-y-4">
              <div className="flex items-center gap-3">
                <img 
                  src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68de9e486fce6eca7306d0e2/4dd13d4d2_WhatsAppImage2025-10-02at2046181.jpeg"
                  alt="WealthHack Logo"
                  className="h-10 w-auto rounded-md"
                />
                <div>
                  <h2 className="font-bold text-white text-lg">WealthHack</h2>
                </div>
              </div>
              {accounts.length > 0 && (
                  <Select value={activeAccountId} onValueChange={handleAccountSwitch}>
                      <SelectTrigger className="bg-blue-800 border-blue-700 text-white">
                          <SelectValue placeholder="Select an account..." />
                      </SelectTrigger>
                      <SelectContent className="bg-blue-800 border-blue-700 text-white">
                          {accounts.map(account => (
                              <SelectItem key={account.id} value={account.id} className="focus:bg-blue-700">
                                  {account.account_name} ({account.account_type})
                              </SelectItem>
                          ))}
                          {/* "Add New Account" has been removed as per user request */}
                      </SelectContent>
                  </Select>
              )}
            </SidebarHeader>
            
            <SidebarContent className="p-4 space-y-2">
              <SidebarLink to={createPageUrl("Dashboard")} icon={LayoutDashboard}>
                Dashboard
              </SidebarLink>
              <SidebarLink to={createPageUrl("Upload")} icon={Upload}>
                Upload
              </SidebarLink>
              <SidebarLink to={createPageUrl("Reports")} icon={BarChart2}>
                Reports
              </SidebarLink>
              {canAccessTaxFiling ? (
                <SidebarLink to={createPageUrl("Tax")} icon={Landmark}>
                    Tax Filing
                </SidebarLink>
              ) : (
                <Link to={upgradeUrl} className="flex items-center gap-3 rounded-lg px-3 py-2 text-blue-200 transition-colors hover:bg-blue-800 hover:text-white relative group">
                    <Landmark className="h-4 w-4" />
                    <span>Tax Filing</span>
                    <Badge className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-amber-500 text-white">Activate</Badge>
                </Link>
              )}
              {canAccessPayroll ? (
                <SidebarLink to={createPageUrl("Payroll")} icon={Wallet}>
                    Payroll
                </SidebarLink>
              ) : (
                <Link to={createPageUrl("BusinessSolutions")} className="flex items-center gap-3 rounded-lg px-3 py-2 text-blue-200 transition-colors hover:bg-blue-800 hover:text-white relative group">
                    <Wallet className="h-4 w-4" />
                    <span>Payroll</span>
                    <Badge className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-amber-500 text-white">Activate</Badge>
                </Link>
              )}
              
              <div>
                <button
                  onClick={() => setSolutionsOpen(!solutionsOpen)}
                  className="flex items-center justify-between w-full gap-3 rounded-lg px-3 py-2 text-blue-200 transition-colors hover:bg-blue-800 hover:text-white"
                >
                  <div className="flex items-center gap-3">
                    <CreditCard className="h-4 w-4" />
                    <span>Solutions</span>
                  </div>
                  <ChevronDown className={`h-4 w-4 transition-transform ${solutionsOpen ? "rotate-180" : ""}`} />
                </button>
                {solutionsOpen && (
                  <div className="pl-6 pt-2 space-y-1">
                    <SidebarLink to={createPageUrl("PersonalSolutions")} icon={UserIcon}>
                      Personal
                    </SidebarLink>
                    <SidebarLink to={createPageUrl("BusinessSolutions")} icon={Briefcase}>
                      Business
                    </SidebarLink>
                  </div>
                )}
              </div>

              {user?.role === 'admin' && (
                <SidebarLink to={createPageUrl("Admin")} icon={Shield}>
                  Admin
                </SidebarLink>
              )}
              <SidebarLink to={createPageUrl("AboutUs")} icon={Info}>
                About Us
              </SidebarLink>
              <SidebarLink to={createPageUrl("Landing")} icon={Home}>
                Website Home
              </SidebarLink>
              <SidebarLink to={createPageUrl("Settings")} icon={Settings}>
                Settings
              </SidebarLink>
            </SidebarContent>

            <SidebarFooter className="border-t border-blue-700 p-4">
              {user ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-blue-800 rounded-xl">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary to-sky-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-sm">
                        {user.full_name?.charAt(0)?.toUpperCase() || "U"}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-white text-sm truncate">{user.full_name}</p>
                      <p className="text-xs text-blue-300 truncate">{user.email}</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-2 text-blue-200 hover:bg-blue-800 hover:text-white"
                    onClick={() => window.location.reload()}
                  >
                    <RefreshCw className="w-4 h-4" />
                    Refresh App
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-2 text-blue-200 hover:bg-red-500/20 hover:text-red-400"
                    onClick={handleLogout}
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </Button>
                </div>
              ) : null}
            </SidebarFooter>
          </Sidebar>

          <main className="flex-1 flex flex-col overflow-hidden bg-white">
            <header className="bg-background/80 backdrop-blur-sm border-b border-border px-4 py-3 md:hidden">
              <div className="flex items-center justify-start gap-4">
                <SidebarTrigger className="hover:bg-slate-100 p-2 rounded-lg transition-colors" />
                <img 
                  src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68de9e486fce6eca7306d0e2/4dd13d4d2_WhatsAppImage2025-10-02at2046181.jpeg"
                  alt="WealthHack Logo"
                  className="h-8 w-auto"
                />
              </div>
            </header>

            <div className="flex-1 overflow-auto bg-background">
              <ErrorBoundary>
                {children}
              </ErrorBoundary>
            </div>
          </main>
          {settings?.support_settings?.live_chat_enabled && <LiveSupportChat />}
          
          <Dialog open={forceSubscription}>
            <DialogContent className="max-w-7xl h-[90vh] flex flex-col p-0 gap-0" hideCloseButton={true}>
              <DialogHeader className="p-6 border-b">
                <DialogTitle>Subscription Required</DialogTitle>
              </DialogHeader>
              <div className="flex-1 overflow-y-auto">
                <SubscriptionPage />
              </div>
            </DialogContent>
          </Dialog>

        </div>
      </AlertProvider>
    </SidebarProvider>
    </>
  );
}
