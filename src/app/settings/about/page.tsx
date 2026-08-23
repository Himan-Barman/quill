'use client';

import { useRouter } from 'next/navigation';
import { SettingsGroup } from '@/components/settings/SettingsGroup';
import { SettingsTile } from '@/components/settings/SettingsTile';
import {
  ChevronLeft,
  BookOpen,
  Scale,
  ShieldCheck,
  Code
} from 'lucide-react';

export default function AboutPage() {
  const router = useRouter();

  return (
    <div className="md:p-8 max-w-7xl mx-auto h-full flex flex-col pb-24 pt-24 w-full">
      <div className="flex items-center gap-4 mb-8 px-4 md:px-0">
        <button 
          onClick={() => router.back()}
          className="w-10 h-10 bg-background border border-border rounded-xl flex items-center justify-center text-muted hover:text-foreground hover:border-[#EAB308] transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-bold text-foreground">About Lexora</h1>
      </div>

      <div className="px-4 md:px-0 space-y-8">
        <div className="flex flex-col items-center py-8">
          <div className="w-24 h-24 bg-[#EAB308] rounded-3xl flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(234,179,8,0.3)]">
            <BookOpen className="w-12 h-12 text-background" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Lexora</h2>
          <p className="text-muted">Version 1.0.0 (Web)</p>
        </div>

        <SettingsGroup title="Legal">
          <SettingsTile
            title="Privacy Policy"
            icon={ShieldCheck}
            iconColor="text-blue-500"
            onClick={() => {}}
          />
          <SettingsTile
            title="Terms of Service"
            icon={Scale}
            iconColor="text-purple-500"
            onClick={() => {}}
          />
        </SettingsGroup>

        <SettingsGroup title="Links">
          <SettingsTile
            title="View Source Code"
            icon={Code}
            iconColor="text-foreground"
            onClick={() => window.open('https://github.com/lexora', '_blank')}
          />
        </SettingsGroup>
      </div>
    </div>
  );
}
