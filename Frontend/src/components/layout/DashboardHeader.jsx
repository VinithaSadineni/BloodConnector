import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { Bell, Menu, User, Settings, LogOut, ChevronDown, Home } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useNotifications } from '../../hooks/useNotifications';
import { useSocket } from '../../hooks/useSocket';
import Avatar from '../ui/Avatar';
import SOSButton from '../common/SOSButton';

export const DashboardHeader = ({ title, onMenuClick }) => {
  const { user, logout, role } = useAuth();
  const { unreadCount, setOpen } = useNotifications();
  const { isConnected } = useSocket();
  const navigate = useNavigate();

  return (
    <header className="h-16 fixed top-0 right-0 left-0 lg:left-[260px] bg-surface/85 backdrop-blur-md border-b border-border/80 px-4 sm:px-6 flex items-center justify-between z-20 font-body">
      {/* Title & Mobile Toggle */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg bg-surface-3 hover:bg-surface-4 border border-border text-text-muted hover:text-text-primary transition-all duration-200 active:scale-95"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="flex flex-col">
          <h1 className="text-sm sm:text-base font-bold text-text-primary uppercase tracking-wider font-mono">
            {title || 'Command Center'}
          </h1>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className={`inline-block w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-success animate-pulse' : 'bg-critical'}`} />
            <span className="text-[9px] text-text-muted font-bold font-mono uppercase tracking-wider">
              {isConnected ? 'Real-Time Stream Active' : 'Offline Mode'}
            </span>
          </div>
        </div>
      </div>

      {/* Action Controls */}
      <div className="flex items-center gap-3.5">
        {/* Home Navigation Button */}
        <Link
          to="/"
          className="p-2 rounded-lg bg-surface-3 hover:bg-surface-4 border border-border text-text-muted hover:text-text-primary transition-all duration-200 active:scale-95"
          title="Go to Home"
        >
          <Home className="w-4 h-4" />
        </Link>

        {/* Seeker Emergency SOS shortcut trigger */}
        {role === 'seeker' && (
          <SOSButton className="scale-75 sm:scale-90 origin-right" />
        )}

        {/* Notifications Bell Button */}
        <button
          onClick={() => setOpen(true)}
          className="p-2 rounded-lg bg-surface-3 hover:bg-surface-4 border border-border text-text-muted hover:text-text-primary transition-all duration-200 relative active:scale-95"
        >
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-blood-glow text-[9px] font-bold text-white shadow-blood animate-pulse">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        {/* Accessible Profile Menu Dropdown */}
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button className="flex items-center gap-2 p-1 rounded-lg hover:bg-white/5 border border-transparent hover:border-border transition-all duration-200 outline-none">
              <Avatar name={user?.name || 'User'} size="sm" />
              <div className="hidden sm:flex flex-col items-start leading-none text-left">
                <span className="text-xs font-bold text-text-primary max-w-[80px] truncate">{user?.name?.split(' ')[0]}</span>
                <span className="text-[9px] text-text-muted font-mono uppercase tracking-wider font-bold mt-0.5">{role}</span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-text-muted hidden sm:block" />
            </button>
          </DropdownMenu.Trigger>

          <DropdownMenu.Portal>
            <DropdownMenu.Content
              align="end"
              sideOffset={5}
              className="bg-surface-3 border border-border rounded-xl p-1.5 w-48 shadow-card z-50 animate-slide-up"
            >
              <div className="px-3 py-2 border-b border-border/60 text-xs text-text-muted leading-relaxed font-body">
                Signed in as <br />
                <span className="font-bold text-text-primary truncate block">{user?.email}</span>
              </div>

              <DropdownMenu.Item asChild>
                <Link
                  to={`/${role}/profile`}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-text-muted hover:text-text-primary hover:bg-white/5 outline-none cursor-pointer transition-colors mt-1"
                >
                  <User className="w-3.5 h-3.5" />
                  <span>My Profile</span>
                </Link>
              </DropdownMenu.Item>

              <DropdownMenu.Item asChild>
                <Link
                  to={`/${role}/dashboard`}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-text-muted hover:text-text-primary hover:bg-white/5 outline-none cursor-pointer transition-colors"
                >
                  <Settings className="w-3.5 h-3.5" />
                  <span>Dashboard Control</span>
                </Link>
              </DropdownMenu.Item>

              <DropdownMenu.Separator className="h-px bg-border/60 my-1" />

              <DropdownMenu.Item
                onSelect={() => logout().then(() => navigate('/'))}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-critical hover:text-red-400 hover:bg-critical/5 outline-none cursor-pointer transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      </div>
    </header>
  );
};

export default DashboardHeader;
