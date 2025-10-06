
import React, { useState, useEffect, Suspense } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User } from "@/entities/User";
import {
  BarChart3,
  PiggyBank,
  Target,
  Shield,
  Users,
  Sparkles,
  ArrowRight,
  Menu,
  X,
  Home
} from "lucide-react";
import { createPageUrl } from "@/utils";
import ScrollToTopButton from "../components/ScrollToTopButton";
import LiveSupportChat from "@/components/chat/LiveSupportChat"; // Added import
const VisitorCounter = React.lazy(() => import('../components/VisitorCounter'));

const navLinks = [
  { name: "Personal", to: "PersonalSolutions" },
  { name: "Business", to: "BusinessSolutions" },
  { name: "About", to: "AboutUs" },
  { name: "Pricing", to: "Subscription" },
];

export default function Landing() {
  const [user, setUser] = useState(null);
  const [isMenuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate(); // Added useNavigate hook

  useEffect(() => {
    User.me()
      .then(setUser)
      .catch(() => setUser(null));
  }, []);

  const handleLogin = async () => {
    // This now navigates to the Home page where user must choose personal/business
    navigate(createPageUrl('Home'));
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <header className="py-4 px-6 md:px-12 bg-background/80 backdrop-blur-sm sticky top-0 z-50 border-b border-border">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link to={createPageUrl('Landing')} className="flex items-center gap-3">
            <img
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68de9e486fce6eca7306d0e2/4dd13d4d2_WhatsAppImage2025-10-02at2046181.jpeg"
              alt="WealthHack Logo"
              className="h-10 w-auto rounded-md"
            />
            <span className="text-xl font-bold text-foreground">WealthHack</span>
          </Link>
          
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={createPageUrl(link.to)}
                className="text-sm font-semibold text-muted-foreground hover:text-primary transition-colors"
              >
                {link.name}
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <Link to={createPageUrl("Dashboard")}>
                <Button>Go to Dashboard</Button>
              </Link>
            ) : (
              <>
                <Button variant="ghost" onClick={handleLogin} className="text-primary hover:text-primary">
                  Sign In
                </Button>
                <Button onClick={handleLogin}>Get Started</Button>
              </>
            )}
          </div>
          
          <div className="md:hidden">
            <Button variant="ghost" size="icon" onClick={() => setMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X /> : <Menu />}
            </Button>
          </div>
        </div>
        {isMenuOpen && (
          <div className="md:hidden mt-4 bg-background rounded-lg p-4 space-y-4 shadow-lg border">
            <nav className="flex flex-col space-y-3">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={createPageUrl(link.to)}
                  className="font-semibold text-muted-foreground hover:text-primary transition-colors block p-2 rounded-md hover:bg-muted"
                  onClick={() => setMenuOpen(false)}
                >
                  {link.name}
                </Link>
              ))}
            </nav>
            <div className="border-t border-border pt-4 flex flex-col space-y-3">
              {user ? (
                <Link to={createPageUrl("Dashboard")}>
                  <Button className="w-full">Go to Dashboard</Button>
                </Link>
              ) : (
                <>
                  <Button variant="outline" onClick={handleLogin} className="w-full">
                    Sign In
                  </Button>
                  <Button onClick={handleLogin} className="w-full">Get Started</Button>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      <main>
        <section className="py-20 md:py-32 text-center bg-gradient-to-b from-background to-muted">
          <div className="max-w-4xl mx-auto px-6">
            <Badge variant="secondary" className="mb-4">Your Personal AI Bookkeeper 🇿🇦</Badge>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-foreground mb-6">
              Take Control of Your Finances with AI
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
              From automated bookkeeping to SARS-compliant reports, WealthHack is the all-in-one platform for personal and business finance in South Africa.
            </p>
            <div className="flex justify-center items-center gap-4">
              <Button size="lg" onClick={handleLogin}>
                Get Started for Free <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Link to={createPageUrl('AboutUs')}>
                <Button size="lg" variant="outline">Learn More</Button>
              </Link>
            </div>
          </div>
        </section>

        <section className="py-20 md:py-24 bg-background">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                The Smart Way to Manage Your Money
              </h2>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                WealthHack simplifies complex financial tasks so you can focus on what matters most.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <Card className="text-center border-0 shadow-lg">
                <CardHeader>
                  <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <BarChart3 className="w-8 h-8 text-primary" />
                  </div>
                  <CardTitle className="text-2xl">Analyze Your Spending</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Upload bank statements and let our AI automatically categorize transactions, revealing exactly where your money goes.
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center border-0 shadow-lg">
                <CardHeader>
                  <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <PiggyBank className="w-8 h-8 text-primary" />
                  </div>
                  <CardTitle className="text-2xl">Smart Budgeting</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Create realistic budgets based on your actual spending, and get alerts to help you stay on track.
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center border-0 shadow-lg">
                <CardHeader>
                  <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Target className="w-8 h-8 text-primary" />
                  </div>
                  <CardTitle className="text-2xl">Generate Pro Reports</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Instantly create professional, SARS-compliant reports like cashflow statements, balance sheets, and tax summaries.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section className="py-20 md:py-24 bg-muted">
          <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                Built for South Africa, by South Africans
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                We understand the unique financial landscape of South Africa. Our platform is specifically tailored for local banks, SARS regulations, and the needs of both individuals and businesses.
              </p>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Shield className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg text-foreground">SARS-Compliant</h4>
                    <p className="text-muted-foreground">Generate tax reports with confidence, knowing they meet the latest SARS requirements for ITR14, VAT201, and more.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Users className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg text-foreground">Local Focus</h4>
                    <p className="text-muted-foreground">From understanding local bank statement formats to providing relevant budgeting tips, we're designed for the SA market.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative h-80 rounded-2xl overflow-hidden shadow-2xl">
                <img
                    src="https://images.unsplash.com/photo-1556740758-90de374c12ad?q=80&w=2070&auto=format&fit=crop"
                    alt="Business owner working"
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
            </div>
          </div>
        </section>
        
        <section className="py-20 md:py-24 text-center bg-background">
          <div className="max-w-3xl mx-auto px-6">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
              Ready to Hack Your Wealth?
            </h2>
            <p className="text-lg text-muted-foreground mb-10">
              Join thousands of South Africans taking control of their financial future. Get started in minutes.
            </p>
            <Button size="lg" onClick={handleLogin} className="text-lg px-8 py-6">
              Sign Up Now <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </section>
      </main>

      <footer className="bg-slate-900 text-slate-400 py-12 px-6">
        <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
              {/* Column 1: Company */}
              <div>
                <h5 className="font-bold text-white mb-4">Company</h5>
                <ul className="space-y-2 text-sm">
                  <li><Link to={createPageUrl("AboutUs")} className="hover:text-white transition-colors">About Us</Link></li>
                  <li><Link to={createPageUrl("Subscription")} className="hover:text-white transition-colors">Pricing</Link></li>
                </ul>
              </div>
              {/* Column 2: Solutions */}
              <div>
                <h5 className="font-bold text-white mb-4">Solutions</h5>
                <ul className="space-y-2 text-sm">
                  <li><Link to={createPageUrl("PersonalSolutions")} className="hover:text-white transition-colors">Personal Finance</Link></li>
                  <li><Link to={createPageUrl("BusinessSolutions")} className="hover:text-white transition-colors">Business Finance</Link></li>
                  <li><Link to={createPageUrl("Tax")} className="hover:text-white transition-colors">Tax Filing</Link></li>
                </ul>
              </div>
              {/* Column 3: Knowledge Base */}
              <div>
                <h5 className="font-bold text-white mb-4">Knowledge Base</h5>
                <ul className="space-y-2 text-sm">
                  <li><a href="#" className="hover:text-white transition-colors">FAQ</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
                </ul>
              </div>
            </div>

            {/* Visitor Counter centered */}
            <div className="mb-10">
