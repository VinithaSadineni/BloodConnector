import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, Heart } from 'lucide-react';
import { cn } from '../../lib/utils';
import Button from '../ui/Button';

export const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'Home', href: '/' },
    { label: 'Find Blood', href: '/signup' },
    { label: 'Donors', href: '/signup' },
    { label: 'Hospitals', href: '/signup' },
  ];

  return (
    <nav
      className={cn(
        'fixed top-0 left-0 w-full z-40 transition-all duration-300 font-body',
        isScrolled
          ? 'bg-surface/95 backdrop-blur-md py-3 shadow-card border-b border-border/80'
          : 'bg-transparent py-5'
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo Section */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <svg
              className="w-7 h-7 text-blood fill-current drop-shadow-[0_0_10px_rgba(200,16,46,0.6)] group-hover:scale-110 transition-transform duration-300"
              viewBox="0 0 24 24"
            >
              <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
            </svg>
            <span className="font-display text-2xl tracking-wider text-text-primary uppercase group-hover:text-blood transition-colors duration-300">
              EMERGENCY <span className="text-blood group-hover:text-text-primary transition-colors duration-300">CONNECTOR</span>
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-sm font-medium text-text-muted hover:text-text-primary transition-colors duration-200"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Authentication CTAs */}
          <div className="hidden md:flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/login')}
              className="border-white/10 hover:border-white/25 text-xs uppercase font-semibold tracking-wider font-display"
            >
              Login
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate('/signup')}
              className="text-xs uppercase font-semibold tracking-wider font-display px-5 py-2"
            >
              Register
            </Button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-lg bg-surface-3 hover:bg-surface-4 text-text-muted hover:text-text-primary border border-border transition-all duration-200 active:scale-95"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      <div
        className={cn(
          'md:hidden absolute top-full left-0 w-full bg-surface-2 border-b border-border/80 px-4 py-6 flex flex-col gap-5 shadow-card transition-all duration-300 ease-in-out origin-top z-40',
          isMobileMenuOpen ? 'opacity-100 scale-y-100' : 'opacity-0 scale-y-0 pointer-events-none'
        )}
      >
        <div className="flex flex-col gap-4">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-sm font-semibold text-text-muted hover:text-text-primary transition-colors duration-200 py-1"
            >
              {link.label}
            </a>
          ))}
        </div>
        <hr className="border-border/80" />
        <div className="flex flex-col gap-3">
          <Button
            variant="outline"
            onClick={() => {
              setIsMobileMenuOpen(false);
              navigate('/login');
            }}
            className="w-full text-xs uppercase tracking-wider font-display py-2.5"
          >
            Login
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              setIsMobileMenuOpen(false);
              navigate('/signup');
            }}
            className="w-full text-xs uppercase tracking-wider font-display py-2.5"
          >
            Register
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
