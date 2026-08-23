'use client';
import { LucideIcon } from 'lucide-react';

interface SwitchTileProps {
  title: string;
  subtitle?: string;
  icon: LucideIcon;
  iconColor?: string;
  value: boolean;
  onChange: (value: boolean) => void;
}

export function SwitchTile({
  title,
  subtitle,
  icon: Icon,
  iconColor = "text-muted",
  value,
  onChange
}: SwitchTileProps) {
  return (
    <div className="flex items-center px-4 py-4 w-full bg-background hover:bg-surface-active transition-colors border-b border-border last:border-b-0">
      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-surface flex items-center justify-center mr-4 border border-border">
        <Icon className={`w-5 h-5 ${iconColor}`} />
      </div>
      <div className="flex-1 min-w-0 text-left mr-4">
        <p className="text-base font-semibold text-foreground truncate">
          {title}
        </p>
        {subtitle && (
          <p className="text-sm text-muted truncate mt-0.5">
            {subtitle}
          </p>
        )}
      </div>
      <button
        role="switch"
        aria-checked={value}
        onClick={() => onChange(!value)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#EAB308] focus:ring-offset-2 focus:ring-offset-[#1A1A1A] ${
          value ? 'bg-[#EAB308]' : 'bg-[#334155]'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            value ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );
}
