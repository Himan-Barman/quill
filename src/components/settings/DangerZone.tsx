'use client';
import { LucideIcon } from 'lucide-react';

interface DangerZoneProps {
  title: string;
  subtitle?: string;
  icon: LucideIcon;
  buttonText: string;
  onClick: () => void;
}

export function DangerZone({
  title,
  subtitle,
  icon: Icon,
  buttonText,
  onClick
}: DangerZoneProps) {
  return (
    <div className="flex items-center px-4 py-4 w-full bg-background hover:bg-red-500/5 transition-colors border-b border-border last:border-b-0 group">
      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center mr-4 border border-red-500/20 group-hover:bg-red-500/20 transition-colors">
        <Icon className="w-5 h-5 text-red-500" />
      </div>
      <div className="flex-1 min-w-0 text-left mr-4">
        <p className="text-base font-semibold text-red-500 truncate">
          {title}
        </p>
        {subtitle && (
          <p className="text-sm text-red-400/80 truncate mt-0.5">
            {subtitle}
          </p>
        )}
      </div>
      <button
        onClick={onClick}
        className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 font-semibold rounded-xl text-sm transition-colors border border-red-500/20"
      >
        {buttonText}
      </button>
    </div>
  );
}
