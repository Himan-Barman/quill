'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { SettingsGroup } from '@/components/settings/SettingsGroup';
import { SwitchTile } from '@/components/settings/SwitchTile';
import {
  ChevronLeft,
  Fingerprint
} from 'lucide-react';

export default function BiometricSettingsPage() {
  const router = useRouter();
  
  const [biometricEnabled, setBiometricEnabled] = useState(false);

  return (
    <div className="md:p-8 max-w-7xl mx-auto h-full flex flex-col pb-24 pt-24 w-full">
      <div className="flex items-center gap-4 mb-8 px-4 md:px-0">
        <button 
          onClick={() => router.back()}
          className="w-10 h-10 bg-background border border-border rounded-xl flex items-center justify-center text-muted hover:text-foreground hover:border-[#EAB308] transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-bold text-foreground">Biometric Lock</h1>
      </div>

      <div className="px-4 md:px-0 space-y-8">
        <SettingsGroup title="App Security">
          <SwitchTile
            title="Require Authentication"
            subtitle="Use Passkey or Windows Hello to unlock Lexora"
            icon={Fingerprint}
            iconColor="text-green-500"
            value={biometricEnabled}
            onChange={setBiometricEnabled}
          />
        </SettingsGroup>
      </div>
    </div>
  );
}
