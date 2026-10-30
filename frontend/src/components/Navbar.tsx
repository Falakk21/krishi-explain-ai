import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Sprout, Menu, X, ArrowRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { DemoBadge } from './DemoBadge';

export const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { demoMode, setDemoMode, isBackendOnline } = useApp();

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Climate Dashboard', path: '/dashboard' },
    { name: 'Impact Assessment', path: '/assessment' },
    { name: 'Crop Factor Insights', path: '/explainability' },
    { name: 'Climate Simulator', path: '/simulator' },
    { name: 'Adaptation Insights', path: '/adaptation' },
  ];

  const isActive = (path: string) => {
    if (path === '/' && location.pathname !== '/') return false;
    return location.pathname.startsWith(path);
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-sage/30 shadow-subtle">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group focus:outline-none focus:ring-2 focus:ring-forest rounded-lg p-1">
            <div className="w-10 h-10 rounded-xl bg-forest flex items-center justify-center text-white shadow-subtle group-hover:bg-deep transition-colors">
              <Sprout className="w-6 h-6 text-sage-light" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-forest-dark flex items-center gap-1.5">
                KrishiExplain <span className="text-sage-dark font-extrabold text-sm uppercase px-1.5 py-0.5 rounded bg-mint">AI</span>
              </span>
              <span className="block text-[10px] uppercase tracking-wider text-muted font-medium">
                Climate Insights for Agriculture
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            {navLinks.map((link) => {
              const active = isActive(link.path);
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-3 py-2 text-xs xl:text-sm font-medium rounded-lg transition-all duration-150 ${
                    active
                      ? 'bg-mint text-forest-dark font-semibold shadow-xs'
                      : 'text-charcoal/80 hover:text-forest hover:bg-cream'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Actions: Mode Toggle & Analyze CTA */}
          <div className="hidden md:flex items-center gap-3">
            {/* Mode Indicator / Toggle */}
            <button
              onClick={() => setDemoMode(!demoMode)}
              className="text-left focus:outline-none group"
              title="Switch between demonstration estimates and historical-data estimates"
            >
              <DemoBadge
                isDemo={demoMode || !isBackendOnline}
                compact
              />
            </button>

            {/* Analyze Impact CTA */}
            <Link
              to="/assessment"
              className="inline-flex items-center gap-2 px-4 py-2 text-xs xl:text-sm font-semibold text-white bg-forest hover:bg-forest-dark rounded-xl shadow-card transition-all duration-200 hover:shadow-elevated active:scale-95"
            >
              <span>Analyze Impact</span>
              <ArrowRight className="w-4 h-4 text-sage-light" />
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex lg:hidden items-center gap-2">
            <button
              onClick={() => setDemoMode(!demoMode)}
              className="focus:outline-none"
            >
              <DemoBadge isDemo={demoMode || !isBackendOnline} compact />
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-charcoal hover:text-forest hover:bg-cream focus:outline-none focus:ring-2 focus:ring-forest"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-sage/30 bg-white px-4 pt-3 pb-6 space-y-2 shadow-elevated animate-in fade-in slide-in-from-top-2">
          {navLinks.map((link) => {
            const active = isActive(link.path);
            return (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-4 py-2.5 rounded-xl text-sm font-medium ${
                  active
                    ? 'bg-mint text-forest-dark font-bold'
                    : 'text-charcoal hover:bg-cream hover:text-forest'
                }`}
              >
                {link.name}
              </Link>
            );
          })}
          <div className="pt-3 border-t border-gray-100 flex flex-col gap-2">
            <Link
              to="/assessment"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-forest text-white text-sm font-semibold shadow-card"
            >
              <span>Analyze Impact Now</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
