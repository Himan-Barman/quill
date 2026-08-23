'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { SettingsGroup } from '@/components/settings/SettingsGroup';
import { SettingsTile } from '@/components/settings/SettingsTile';
import { SwitchTile } from '@/components/settings/SwitchTile';
import {
  ChevronLeft,
  Volume2,
  Gauge,
  Ear
} from 'lucide-react';

export default function TtsSettingsPage() {
  const router = useRouter();
  
  const [autoPlay, setAutoPlay] = useState(true);

  return (
    <div className="md:p-8 max-w-7xl mx-auto h-full flex flex-col pb-24 pt-24 w-full">
      <div className="flex items-center gap-4 mb-8 px-4 md:px-0">
        <button 
          onClick={() => router.back()}
          className="w-10 h-10 bg-background border border-border rounded-xl flex items-center justify-center text-muted hover:text-foreground hover:border-[#EAB308] transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-bold text-foreground">Voice Settings</h1>
      </div>

      <div className="px-4 md:px-0 space-y-8">
        <SettingsGroup title="Playback">
          <SwitchTile
            title="Auto-play Audio"
            subtitle="Automatically pronounce words when opened"
            icon={Volume2}
            iconColor="text-blue-500"
            value={autoPlay}
            onChange={setAutoPlay}
          />
        </SettingsGroup>

        <SettingsGroup title="Voice Configuration">
          <SettingsTile
            title="Speech Rate"
            subtitle="Normal (1.0x)"
            icon={Gauge}
            iconColor="text-purple-500"
            onClick={() => {}}
          />
          <SettingsTile
            title="Select Voice"
            subtitle="System Default"
            icon={Ear}
            iconColor="text-pink-500"
            onClick={() => {}}
          />
        </SettingsGroup>
      </div>
    </div>
  );
}
