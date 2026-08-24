'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { SettingsGroup } from '@/components/settings/SettingsGroup';
import { SettingsTile } from '@/components/settings/SettingsTile';
import { SwitchTile } from '@/components/settings/SwitchTile';
import { DangerZone } from '@/components/settings/DangerZone';
import { ThemeModal, ThemeType } from '@/components/settings/ThemeModal';
import { LogoutConfirmModal } from '@/components/common/LogoutConfirmModal';
import { usePWAInstall } from '@/hooks/usePWAInstall';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from 'next-themes';
import { useSettings } from '@/hooks/useSettings';
import { DailyGoalModal } from '@/components/settings/DailyGoalModal';
import {
  UserCircle,
  Palette,
  PaintBucket,
  Flag,
  BrainCircuit,
  Mic,
  Bell,
  Sparkles,
  Cpu,
  Fingerprint,
  LineChart,
  Info,
  LogOut,
  Search,
  MonitorDown,
} from 'lucide-react';

export default function SettingsPage() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const { isInstallable, isInstalled, installApp } = usePWAInstall();

  const [searchQuery, setSearchQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  
  const [isDailyGoalModalOpen, setIsDailyGoalModalOpen] = useState(false);
  const { dailyGoal, updateDailyGoal } = useSettings();

  // Mocked states for settings
  const [materialYou, setMaterialYou] = useState(false);
  const [contextMemory, setContextMemory] = useState(true);
  const [telemetry, setTelemetry] = useState(true);
  
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);
  const { theme, setTheme } = useTheme();

  const displayTheme: ThemeType = theme === 'light' ? 'Light' : theme === 'dark' ? 'Dark' : 'System';

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const matches = (text: string) => {
    if (!searchQuery.trim()) return true;
    return text.toLowerCase().includes(searchQuery.toLowerCase().trim());
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto h-full flex flex-col relative pt-24 md:pt-28 pb-24 w-full select-none">
      {/* Top Header Bar: Fixed Floating Search Capsule */}
      <div className="fixed top-3 left-0 right-0 md:left-64 z-50 pointer-events-none">
        <div className="max-w-7xl mx-auto w-full px-4 md:px-8 flex items-center justify-center">
          <div className="flex-1 max-w-2xl mx-auto w-full pointer-events-auto flex justify-center">
            <motion.div
              className="relative w-full mx-auto"
              initial={false}
              animate={{ maxWidth: isFocused || searchQuery ? '42rem' : '28rem' }}
              transition={{ type: 'spring', stiffness: 350, damping: 32 }}
            >
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4.5 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-muted group-focus-within:text-blue-400 transition-colors" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  className="block w-full pl-12 pr-4 py-3.5 bg-surface/50 border border-border rounded-full text-foreground placeholder-muted/50 focus:ring-0 focus:border-blue-500 outline-none transition-all shadow-[0_4px_20px_rgba(0,0,0,0.3)] backdrop-blur-md text-[16px]"
                  placeholder="Search settings..."
                />
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      <div className="px-4 md:px-0 space-y-8">
        {/* Account Category */}
        {(matches('Account') || matches('Sign In') || matches('Sync') || matches(user?.email || '') || matches(user?.user_metadata?.full_name || '')) && (
          <SettingsGroup title="Account">
            {!user ? (
              <SettingsTile
                title="Sign In"
                subtitle="Sync your vocabulary across devices"
                icon={UserCircle}
                iconColor="text-blue-500"
                href="/login"
              />
            ) : (
              <SettingsTile
                title={user.user_metadata?.full_name || 'Quill User'}
                subtitle={user.email || 'Signed in'}
                icon={UserCircle}
                iconColor="text-blue-500"
                href="/settings/account"
              />
            )}
          </SettingsGroup>
        )}

        {/* Appearance & App Category */}
        {(matches('Appearance') || matches('Theme') || matches('Material You') || matches('Desktop App') || matches('Install') || matches(displayTheme)) && (
          <SettingsGroup title="Appearance & Application">
            {(matches('Theme') || matches(displayTheme)) && (
              <SettingsTile
                title="Theme"
                subtitle={displayTheme}
                icon={Palette}
                iconColor="text-purple-500"
                onClick={() => setIsThemeModalOpen(true)}
              />
            )}
            {matches('Material You') && (
              <SwitchTile
                title="Material You"
                subtitle="Use system colors for app accent"
                icon={PaintBucket}
                iconColor="text-pink-500"
                value={materialYou}
                onChange={setMaterialYou}
              />
            )}
            {(matches('Desktop App') || matches('Install')) && (
              <SettingsTile
                title="Desktop Application"
                subtitle={isInstalled ? "Installed (Standalone Mode)" : "Install Quill on this computer"}
                icon={MonitorDown}
                iconColor="text-blue-400"
                onClick={isInstalled ? undefined : installApp}
              />
            )}
          </SettingsGroup>
        )}

        {/* Learning Category */}
        {(matches('Learning') || matches('Daily Goal') || matches('Revision Algorithm') || matches('Voice Settings') || matches('Spaced Repetition')) && (
          <SettingsGroup title="Learning">
            {matches('Daily Goal') && (
              <SettingsTile
                title="Daily Goal"
                subtitle={`${dailyGoal} Words / Day`}
                icon={Flag}
                iconColor="text-orange-500"
                onClick={() => setIsDailyGoalModalOpen(true)}
              />
            )}
            {(matches('Revision Algorithm') || matches('Spaced Repetition')) && (
              <SettingsTile
                title="Revision Algorithm"
                subtitle="Spaced Repetition (FSRS)"
                icon={BrainCircuit}
                iconColor="text-orange-600"
                onClick={() => {}}
              />
            )}
            {matches('Voice Settings') && (
              <SettingsTile
                title="Voice Settings"
                subtitle="Default System Voice"
                icon={Mic}
                iconColor="text-teal-500"
                href="/settings/tts"
              />
            )}
          </SettingsGroup>
        )}

        {/* Notifications Category */}
        {(matches('Notifications') || matches('Notification Settings') || matches('reminders') || matches('alerts')) && (
          <SettingsGroup title="Notifications">
            <SettingsTile
              title="Notification Settings"
              subtitle="Manage daily reminders and alerts"
              icon={Bell}
              iconColor="text-red-500"
              href="/settings/notifications"
            />
          </SettingsGroup>
        )}

        {/* AI Assistant Category */}
        {(matches('AI Assistant') || matches('AI Provider') || matches('Gemini') || matches('Context Memory')) && (
          <SettingsGroup title="AI Assistant">
            {(matches('AI Provider') || matches('Gemini')) && (
              <SettingsTile
                title="AI Provider"
                subtitle="Gemini 1.5 Pro"
                icon={Sparkles}
                iconColor="text-purple-500"
                onClick={() => {}}
              />
            )}
            {matches('Context Memory') && (
              <SwitchTile
                title="Context Memory"
                subtitle="Allow AI to remember past interactions"
                icon={Cpu}
                iconColor="text-indigo-500"
                value={contextMemory}
                onChange={setContextMemory}
              />
            )}
          </SettingsGroup>
        )}

        {/* Privacy & Security Category */}
        {(matches('Privacy & Security') || matches('Biometric Lock') || matches('Analytics & Telemetry') || matches('Security')) && (
          <SettingsGroup title="Privacy & Security">
            {matches('Biometric Lock') && (
              <SettingsTile
                title="Biometric Lock"
                subtitle="Disabled"
                icon={Fingerprint}
                iconColor="text-green-500"
                href="/settings/biometric"
              />
            )}
            {matches('Analytics & Telemetry') && (
              <SwitchTile
                title="Analytics & Telemetry"
                subtitle="Help improve Quill by sharing anonymous usage data"
                icon={LineChart}
                iconColor="text-slate-400"
                value={telemetry}
                onChange={setTelemetry}
              />
            )}
          </SettingsGroup>
        )}

        {/* About Category */}
        {(matches('About') || matches('About Quill') || matches('Version') || matches('legal')) && (
          <SettingsGroup title="About">
            <SettingsTile
              title="About Quill"
              subtitle="Version, licenses, and legal info"
              icon={Info}
              iconColor="text-blue-400"
              href="/settings/about"
            />
          </SettingsGroup>
        )}

        {/* Session Category */}
        {user && (matches('Session') || matches('Logout') || matches('Sign out')) && (
          <SettingsGroup title="Session">
            <DangerZone
              title="Logout"
              subtitle="Sign out of your account on this device"
              icon={LogOut}
              buttonText="Logout"
              onClick={handleLogout}
            />
          </SettingsGroup>
        )}
      </div>

      <DailyGoalModal
        isOpen={isDailyGoalModalOpen}
        onClose={() => setIsDailyGoalModalOpen(false)}
        currentGoal={dailyGoal}
        onSave={updateDailyGoal}
      />

      <ThemeModal
        isOpen={isThemeModalOpen}
        onClose={() => setIsThemeModalOpen(false)}
        currentTheme={displayTheme}
        onSelectTheme={(t) => {
          if (t === 'System') setTheme('system');
          else if (t === 'Light') setTheme('light');
          else if (t === 'Dark') setTheme('dark');
          setIsThemeModalOpen(false);
        }}
      />

      <LogoutConfirmModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={async () => {
          setIsLoggingOut(true);
          await signOut();
          setIsLoggingOut(false);
          setShowLogoutModal(false);
          router.push('/login');
        }}
        isLoading={isLoggingOut}
      />
    </div>
  );
}
