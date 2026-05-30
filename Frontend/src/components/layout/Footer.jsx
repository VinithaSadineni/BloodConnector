import React from 'react';
import { Link } from 'react-router-dom';

export const Footer = () => {
  return (
    <footer className="bg-surface-2 border-t border-border/80 font-body py-12 relative overflow-hidden">
      {/* Visual background details */}
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-blood/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="md:col-span-2 flex flex-col gap-4">
            <Link to="/" className="flex items-center gap-2 group w-fit">
              <svg
                className="w-6 h-6 text-blood fill-current drop-shadow-[0_0_8px_rgba(200,16,46,0.6)]"
                viewBox="0 0 24 24"
              >
                <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
              </svg>
              <span className="font-display text-xl tracking-wider text-text-primary uppercase">
                EMERGENCY <span className="text-blood">CONNECTOR</span>
              </span>
            </Link>
            <p className="text-xs text-text-muted leading-relaxed max-w-sm">
              Real-time emergency blood donation & healthcare coordination platform designed to instantly connect verified blood seekers, donors, and hospitals.
            </p>
          </div>

          {/* Quick Columns */}
          <div className="flex flex-col gap-3.5">
            <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider font-display">
              For Seekers & Donors
            </h4>
            <ul className="flex flex-col gap-2 text-xs text-text-muted">
              <li>
                <Link to="/signup" className="hover:text-blood transition-colors">
                  Become a Donor
                </Link>
              </li>
              <li>
                <Link to="/signup" className="hover:text-blood transition-colors">
                  Create Blood Request
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-blood transition-colors">
                  Donor Login
                </Link>
              </li>
            </ul>
          </div>

          <div className="flex flex-col gap-3.5">
            <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider font-display">
              For Institutions
            </h4>
            <ul className="flex flex-col gap-2 text-xs text-text-muted">
              <li>
                <Link to="/signup" className="hover:text-blood transition-colors">
                  Register Hospital
                </Link>
              </li>
              <li>
                <Link to="/signup" className="hover:text-blood transition-colors">
                  Manage Blood Stocks
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-blood transition-colors">
                  Portal Login
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <hr className="border-border/60 my-8" />

        {/* Bottom Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] text-text-muted">
          <span>
            &copy; {new Date().getFullYear()} Emergency Blood Connector. All rights reserved.
          </span>
          <div className="flex gap-6">
            <a href="#" className="hover:text-text-primary transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-text-primary transition-colors">
              Terms of Service
            </a>
            <a href="#" className="hover:text-text-primary transition-colors">
              Security
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
