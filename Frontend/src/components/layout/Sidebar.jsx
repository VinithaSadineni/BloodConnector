import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  PlusCircle,
  ClipboardList,
  Heart,
  History,
  MapPin,
  Store,
  Users,
  CheckSquare,
  Activity,
  BarChart3,
  User,
  LogOut,
  Bell,
  Settings,
  ShieldAlert
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { cn } from '../../lib/utils';
import Avatar from '../ui/Avatar';
import Modal from '../ui/Modal';
import Button from '../ui/Button';

export const Sidebar = ({ isMobileOpen, setIsMobileOpen }) => {
  const { user, logout, role } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  // Group links by role
  const seekerLinks = [
    { label: 'Dashboard', href: '/seeker/dashboard', icon: LayoutDashboard },
    { label: 'New Request', href: '/seeker/requests/new', icon: PlusCircle },
    { label: 'My Requests', href: '/seeker/requests', icon: ClipboardList },
    { label: 'My Profile', href: '/seeker/profile', icon: User },
  ];

  const donorLinks = [
    { label: 'Dashboard', href: '/donor/dashboard', icon: LayoutDashboard },
    { label: 'Nearby Requests', href: '/donor/nearby', icon: MapPin },
    { label: 'Donation History', href: '/donor/history', icon: History },
    { label: 'My Profile', href: '/donor/profile', icon: User },
  ];

  const hospitalLinks = [
    { label: 'Dashboard', href: '/hospital/dashboard', icon: LayoutDashboard },
    { label: 'Blood Stock', href: '/hospital/stock', icon: Store },
    { label: 'Incoming Requests', href: '/hospital/requests', icon: ClipboardList },
    { label: 'Institution Profile', href: '/hospital/profile', icon: User },
  ];

  const adminLinks = [
    { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'User Directory', href: '/admin/users', icon: Users },
    { label: 'Verify Queue', href: '/admin/verify', icon: CheckSquare },
    { label: 'Request Monitor', href: '/admin/requests', icon: ShieldAlert },
    { label: 'System Analytics', href: '/admin/analytics', icon: BarChart3 },
  ];

  const getLinks = () => {
    switch (role) {
      case 'seeker': return seekerLinks;
      case 'donor': return donorLinks;
      case 'hospital': return hospitalLinks;
      case 'admin': return adminLinks;
      default: return [];
    }
  };

  const activeLinks = getLinks();

  const handleLogoutConfirm = async () => {
    setIsLogoutModalOpen(false);
    setIsMobileOpen && setIsMobileOpen(false);
    await logout();
    navigate('/');
  };

  return (
    <>
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-30 w-[260px] bg-surface-3 border-r border-border/80 flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex flex-col flex-1 overflow-y-auto">
          {/* Header Branding */}
          <div className="h-16 flex items-center px-6 border-b border-border/80 gap-2.5">
            <svg className="w-6 h-6 text-blood fill-current drop-shadow-[0_0_8px_rgba(200,16,46,0.6)]" viewBox="0 0 24 24">
              <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
            </svg>
            <span className="font-display text-lg tracking-wider text-text-primary uppercase">
              CRITICAL CARE <span className="text-blood">HQ</span>
            </span>
          </div>

          {/* User Profile Summary */}
          <div className="p-5 border-b border-border/60 flex items-center gap-3.5 bg-surface-2/20">
            <Avatar name={user?.name || 'User'} size="md" status={role === 'donor' && user?.donorProfile?.isAvailable ? 'available' : 'online'} />
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-bold text-text-primary truncate">{user?.name || 'EBC Member'}</h4>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-blood-glow" />
                <span className="text-[10px] text-blood-glow font-bold uppercase tracking-wider font-mono">
                  {role || 'Seeker'}
                </span>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 p-4 flex flex-col gap-1.5 font-body">
            {activeLinks.map((link) => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.label}
                  to={link.href}
                  onClick={() => setIsMobileOpen && setIsMobileOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3.5 px-4 py-3 rounded-lg text-sm font-medium text-text-muted hover:text-text-primary hover:bg-white/5 transition-all duration-150 group border-l-2 border-transparent',
                      isActive && 'text-blood hover:text-blood bg-blood/5 hover:bg-blood/5 border-blood'
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      <Icon className={cn('w-4 h-4 text-text-muted group-hover:text-text-primary transition-colors', isActive && 'text-blood group-hover:text-blood')} />
                      <span>{link.label}</span>
                    </>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer Controls */}
        <div className="p-4 border-t border-border/80 flex flex-col gap-2 bg-surface-2/10">
          <button
            onClick={() => setIsLogoutModalOpen(true)}
            className="flex items-center gap-3.5 px-4 py-3 rounded-lg text-sm font-semibold text-critical hover:text-red-400 hover:bg-critical/5 transition-all duration-150 outline-none w-full active:scale-95 border-l-2 border-transparent"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Logout Confirmation Dialog */}
      <Modal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        title="Confirm Sign Out"
        description="Are you sure you want to end your active session in the Critical Care Command Center?"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setIsLogoutModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" size="sm" onClick={handleLogoutConfirm}>
              Sign Out
            </Button>
          </>
        }
      >
        <p className="text-xs text-text-muted leading-relaxed">
          Logging out terminates your real-time secure communication lines. Any active socket-based emergency streams and localized notifications will be disconnected immediately.
        </p>
      </Modal>
    </>
  );
};

export default Sidebar;
