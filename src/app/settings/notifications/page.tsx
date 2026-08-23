'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { SettingsGroup } from '@/components/settings/SettingsGroup';
import { SwitchTile } from '@/components/settings/SwitchTile';
import { SettingsTile } from '@/components/settings/SettingsTile';
import {
  ChevronLeft,
  BellRing,
  Flame,
  MessageSquare
} from 'lucide-react';

export default function NotificationsSettingsPage() {
  const router = useRouter();
  
  const [dailyReminder, setDailyReminder] = useState(true);
  const [streakAlerts, setStreakAlerts] = useState(true);

  return (
    <div className="md:p-8 max-w-7xl mx-auto h-full flex flex-col pb-24 pt-24 w-full">
      <div className="flex items-center gap-4 mb-8 px-4 md:px-0">
        <button 
          onClick={() => router.back()}
          className="w-10 h-10 bg-background border border-border rounded-xl flex items-center justify-center text-muted hover:text-foreground hover:border-[#EAB308] transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-bold text-foreground">Notifications</h1>
      </div>

      <div className="px-4 md:px-0 space-y-8">
        <SettingsGroup title="General">
          <SwitchTile
            title="Daily Reminder"
            subtitle="Get reminded to practice your words"
            icon={BellRing}
            iconColor="text-blue-500"
            value={dailyReminder}
            onChange={setDailyReminder}
          />
          <SettingsTile
            title="Reminder Time"
            subtitle="09:00 AM"
            icon={MessageSquare}
            iconColor="text-purple-500"
            onClick={() => {}}
          />
        </SettingsGroup>

        <SettingsGroup title="Engagement">
          <SwitchTile
            title="Streak Alerts"
            subtitle="Get notified when your streak is at risk"
            icon={Flame}
            iconColor="text-orange-500"
            value={streakAlerts}
            onChange={setStreakAlerts}
          />
        </SettingsGroup>
      </div>
    </div>
  );
}
