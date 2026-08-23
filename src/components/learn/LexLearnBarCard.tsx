'use client';

import React from 'react';
import { LucideIcon, ChevronRight } from 'lucide-react';

interface LexLearnBarCardProps {
  title: string;
  subtitle: string;
  icon: LucideIcon;
  iconColor: string;
  iconBg: string;
  badge?: string;
  onClick?: () => void;
}

export function LexLearnBarCard({
  title,
  subtitle,
  icon: Icon,
  iconColor,
  iconBg,
  badge,
  onClick,
}: LexLearnBarCardProps) {
  return (
    <div
      className="flex items-center p-4 bg-surface border border-border/50 rounded-2xl cursor-pointer hover:border-border-hover transition-all hover:bg-surface/80 relative select-none group"
      onClick={onClick}
    >
      {/* Icon Badge matching words & docs bar design */}
      <div className={`w-10 h-10 rounded-full ${iconBg} flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform`}>
        <Icon className={`w-5 h-5 ${iconColor}`} />
      </div>

      {/* Text Info */}
      <div className="ml-4 flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="text-foreground font-bold text-[16px] truncate group-hover:text-blue-400 transition-colors">
            {title}
          </h3>
          {badge && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 uppercase tracking-wider">
              {badge}
            </span>
          )}
        </div>
        <p className="text-muted text-[12px] truncate mt-0.5">
          {subtitle}
        </p>
      </div>

      {/* Right Chevron Action */}
      <div className="ml-2 shrink-0 p-2 rounded-full text-muted group-hover:text-foreground transition-colors">
        <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
      </div>
    </div>
  );
}
