import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Menu, X, ChevronDown, User, LogOut } from 'lucide-react';
import { clsx } from 'clsx';

interface NavbarProps {
  variant?: 'marketing' | 'dashboard';
  backendOnline?: boolean | null;
  user?: { name: string; role: 'hr' | 'job_seeker' } | null;
  onLogout?: () => void;
}

export default function Navbar({ variant = 'marketing', backendOnline, user, onLogout }: NavbarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 w-full z-50 glass h-16 md:h-18 animate-fade-in-down flex items-center">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex justify-between items-center h-full">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center shadow-lg group-hover:shadow-indigo-500/50 transition-shadow">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="text-xl font-bold gradient-text">Resumify</span>
        </Link>

        {/* Desktop Nav - Marketing */}
        {variant === 'marketing' && (
          <>
            <div className="hidden md:flex items-center gap-8">
              <Link to="/features" className="text-sm font-medium text-secondary hover:text-primary transition-colors">Features</Link>
              <Link to="/how-it-works" className="text-sm font-medium text-secondary hover:text-primary transition-colors">How It Works</Link>
              
              <div className="relative group">
                <button className="flex items-center gap-1 text-sm font-medium text-secondary hover:text-primary transition-colors py-2">
                  Demo <ChevronDown className="w-4 h-4" />
                </button>
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-48 rounded-xl glass-md opacity-0 translate-y-2 invisible group-hover:opacity-100 group-hover:translate-y-0 group-hover:visible transition-all duration-200 p-2 flex flex-col gap-1">
                  <Link to="/demo/job-seeker" className="px-3 py-2 rounded-lg text-sm text-secondary hover:text-primary hover:bg-white/5 transition-colors">For Job Seekers</Link>
                  <Link to="/demo/hr" className="px-3 py-2 rounded-lg text-sm text-secondary hover:text-primary hover:bg-white/5 transition-colors">For HR Teams</Link>
                </div>
              </div>
            </div>

            <div className="hidden md:flex items-center gap-4">
              <Link to="/login" className="btn-ghost px-4 py-2 text-sm font-medium rounded-lg">Login</Link>
              <Link to="/register" className="btn-primary px-4 py-2 text-sm font-medium rounded-lg">Get Started</Link>
            </div>
          </>
        )}

        {/* Desktop Nav - Dashboard */}
        {variant === 'dashboard' && (
          <div className="hidden md:flex items-center gap-6">
            {backendOnline !== undefined && backendOnline !== null && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-secondary">Backend</span>
                <span className="relative flex h-3 w-3">
                  <span className={clsx("animate-ping absolute inline-flex h-full w-full rounded-full opacity-75", backendOnline ? "bg-emerald-400" : "bg-rose-400")}></span>
                  <span className={clsx("relative inline-flex rounded-full h-3 w-3", backendOnline ? "bg-emerald-500" : "bg-rose-500")}></span>
                </span>
              </div>
            )}
            
            {user && (
              <div className="flex items-center gap-4 border-l border-white/10 pl-6">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                    <User className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-primary leading-none">{user.name}</span>
                    <span className="text-xs text-muted mt-1 uppercase tracking-wider">{user.role === 'hr' ? 'HR Team' : 'Job Seeker'}</span>
                  </div>
                </div>
                <button onClick={onLogout} className="p-2 text-secondary hover:text-rose-400 transition-colors" title="Logout">
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* Mobile Menu Button */}
        <button 
          className="md:hidden p-2 text-secondary hover:text-primary"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="absolute top-full left-0 w-full glass-md border-t border-white/5 animate-fade-in-down p-4 flex flex-col gap-4 shadow-2xl">
          {variant === 'marketing' ? (
            <>
              <Link to="/features" className="text-sm font-medium text-secondary p-2">Features</Link>
              <Link to="/how-it-works" className="text-sm font-medium text-secondary p-2">How It Works</Link>
              <div className="h-px w-full bg-white/10" />
              <Link to="/demo/job-seeker" className="text-sm font-medium text-secondary p-2">Demo: Job Seekers</Link>
              <Link to="/demo/hr" className="text-sm font-medium text-secondary p-2">Demo: HR Teams</Link>
              <div className="h-px w-full bg-white/10" />
              <Link to="/login" className="btn-ghost w-full justify-center py-2">Login</Link>
              <Link to="/register" className="btn-primary w-full justify-center py-2 text-center rounded-lg">Get Started</Link>
            </>
          ) : (
            <div className="flex flex-col gap-4">
               {user && (
                  <div className="flex items-center gap-3 p-2 bg-white/5 rounded-lg">
                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                      <User className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-primary">{user.name}</div>
                      <div className="text-xs text-muted uppercase">{user.role === 'hr' ? 'HR Team' : 'Job Seeker'}</div>
                    </div>
                  </div>
               )}
               {onLogout && (
                 <button onClick={onLogout} className="flex items-center justify-center gap-2 w-full p-2 text-rose-400 bg-rose-400/10 rounded-lg">
                   <LogOut className="w-4 h-4" /> Logout
                 </button>
               )}
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
