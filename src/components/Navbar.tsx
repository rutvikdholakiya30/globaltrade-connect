import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Globe, Search, User } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { useAuth } from '@/src/contexts/AuthContext';
import { supabase } from '@/src/lib/supabase';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activePages, setActivePages] = useState<string[]>([]);
  const { isAdmin } = useAuth();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);

    async function fetchActivePages() {
      const { data } = await supabase
        .from('pages')
        .select('name')
        .eq('is_active', true);
      
      if (data) {
        setActivePages(data.map(p => p.name));
      }
    }
    fetchActivePages();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Products', href: '/products' },
    ...(activePages.includes('about') ? [{ name: 'About', href: '/about' }] : []),
    ...(activePages.includes('contact') ? [{ name: 'Contact', href: '/contact' }] : []),
  ];

  return (
    <nav
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        isScrolled ? 'bg-white shadow-md py-3' : 'bg-transparent py-5'
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="bg-blue-600 p-1.5 rounded-lg group-hover:bg-blue-700 transition-colors">
              <Globe className="w-6 h-6 text-white" />
            </div>
            <span className={cn(
              "text-xl font-bold tracking-tight",
              !isScrolled && location.pathname === '/' ? "text-white" : "text-gray-900"
            )}>
              GlobalTrade<span className="text-blue-600">Connect</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                className={cn(
                  'text-sm font-medium transition-colors hover:text-blue-600',
                  !isScrolled && location.pathname === '/' ? 'text-white/90' : 'text-gray-600',
                  location.pathname === link.href && 'text-blue-600 font-semibold'
                )}
              >
                {link.name}
              </Link>
            ))}
            {isAdmin && (
              <Link
                to="/admin"
                className="flex items-center space-x-1 text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                <User className="w-4 h-4" />
                <span>Admin</span>
              </Link>
            )}
            <button className={cn(
              "p-2 rounded-full transition-colors",
              !isScrolled && location.pathname === '/' ? "text-white hover:bg-white/10" : "text-gray-600 hover:bg-gray-100"
            )}>
              <Search className="w-5 h-5" />
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-4">
            {isAdmin && (
              <Link to="/admin" className="text-blue-600">
                <User className="w-5 h-5" />
              </Link>
            )}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={cn(
                "p-2 rounded-md",
                !isScrolled && location.pathname === '/' ? "text-white" : "text-gray-900"
              )}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 animate-in slide-in-from-top duration-200">
          <div className="px-4 pt-2 pb-6 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                onClick={() => setIsMenuOpen(false)}
                className={cn(
                  'block px-3 py-4 text-base font-medium border-b border-gray-50',
                  location.pathname === link.href ? 'text-blue-600 bg-blue-50/50' : 'text-gray-700'
                )}
              >
                {link.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
