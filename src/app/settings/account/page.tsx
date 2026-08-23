'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { SettingsGroup } from '@/components/settings/SettingsGroup';
import { SettingsTile } from '@/components/settings/SettingsTile';
import { DangerZone } from '@/components/settings/DangerZone';
import {
  ChevronLeft,
  UserCircle,
  Mail,
  KeyRound,
  Trash2
} from 'lucide-react';

export default function AccountSettingsPage() {
  const router = useRouter();
  const { user } = useAuth();

  return (
    <div className="md:p-8 max-w-7xl mx-auto h-full flex flex-col pb-24 pt-24 w-full">
      <div className="flex items-center gap-4 mb-8 px-4 md:px-0">
        <button 
          onClick={() => router.back()}
          className="w-10 h-10 bg-background border border-border rounded-xl flex items-center justify-center text-muted hover:text-foreground hover:border-[#EAB308] transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-bold text-foreground">Account Settings</h1>
      </div>

      <div className="px-4 md:px-0 space-y-8">
        <SettingsGroup title="Profile">
          <SettingsTile
            title="Display Name"
            subtitle={user?.user_metadata?.full_name || 'Tap to set name'}
            icon={UserCircle}
            iconColor="text-blue-500"
            onClick={() => {}}
          />
          <SettingsTile
            title="Email Address"
            subtitle={user?.email || 'No email'}
            icon={Mail}
            iconColor="text-teal-500"
            onClick={() => {}}
          />
        </SettingsGroup>

        <SettingsGroup title="Security">
          <SettingsTile
            title="Change Password"
            subtitle="Update your account password"
            icon={KeyRound}
            iconColor="text-orange-500"
            onClick={() => {}}
          />
        </SettingsGroup>

        <SettingsGroup title="Danger Zone">
          <DangerZone
            title="Delete Account"
            subtitle="Permanently delete your data and account"
            icon={Trash2}
            buttonText="Delete"
            onClick={() => {
              alert('Are you sure you want to delete your account? This action cannot be undone.');
            }}
          />
        </SettingsGroup>
      </div>
    </div>
  );
}
