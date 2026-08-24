'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, BookOpen, FileText, GraduationCap, Settings, LogOut, ChevronRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import { LogoutConfirmModal } from '@/components/common/LogoutConfirmModal';

const navItems = [
  { name: 'Home', href: '/', icon: Home },
  { name: 'Words', href: '/words', icon: BookOpen },
  { name: 'Docs', href: '/docs', icon: FileText },
  { name: 'Learn', href: '/learn', icon: GraduationCap },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { signOut, user } = useAuth();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  return (
    <aside className="w-64 h-screen bg-surface border-r border-border flex flex-col justify-between sticky top-0">
      <div>
        {/* Brand Name */}
        <div className="pt-7 pb-3 px-8 flex items-center">
          <span className="text-2xl font-bold text-foreground tracking-wide">Quill</span>
        </div>

        {/* Navigation */}
        <nav className="mt-6 px-4 space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.name} href={item.href}>
                <div className={`relative flex items-center px-4 py-3 rounded-xl transition-all duration-300 group overflow-hidden ${isActive ? 'text-foreground' : 'text-muted hover:text-foreground'}`}>
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 bg-blue-500/10 rounded-xl"
                      initial={false}
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    />
                  )}
                  <item.icon className="w-5 h-5 mr-3 relative z-10" />
                  <span className="font-medium relative z-10">{item.name}</span>
                  {isActive && <ChevronRight className="w-4 h-4 ml-auto relative z-10 text-blue-400" />}
                </div>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* User Profile & Actions */}
      <div className="p-4 border-t border-border space-y-2">
        <div className="flex flex-col gap-2">
          <div className="flex items-center px-3 py-3 rounded-xl bg-surface-active/30 border border-border/50">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 p-[2px] shrink-0 mr-3">
              <div className="w-full h-full rounded-full bg-background flex items-center justify-center">
                <span className="text-sm font-semibold text-foreground">
                  {user?.email?.charAt(0).toUpperCase() || 'U'}
                </span>
              </div>
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-medium text-foreground truncate w-full">
                {user?.email || 'Guest User'}
              </span>
              <span className="text-xs text-blue-400 font-medium">Pro Plan</span>
            </div>
          </div>
          <button
            onClick={() => setShowLogoutModal(true)}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-muted hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer group text-sm font-medium"
          >
            <LogOut className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      <LogoutConfirmModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={async () => {
          setIsLoggingOut(true);
          await signOut();
          setIsLoggingOut(false);
          setShowLogoutModal(false);
        }}
        isLoading={isLoggingOut}
      />
    </aside>
  );
}
