import React from 'react';
import { LucideIcon, ChevronRight } from 'lucide-react';

interface LearnOptionCardProps {
  title: string;
  subtitle: string;
  icon: LucideIcon;
  gradient: string;
  iconColor: string;
  badge?: string;
  onClick: () => void;
}

export function LearnOptionCard({
  title,
  subtitle,
  icon: Icon,
  gradient,
  iconColor,
  badge,
  onClick,
}: LearnOptionCardProps) {
  return (
    <button
      onClick={onClick}
      className="group w-full text-left bg-surface-lowest/70 dark:bg-[#131722]/70 backdrop-blur-xl border border-outline-variant/40 dark:border-white/[0.07] hover:border-primary/40 dark:hover:border-primary/40 rounded-2xl p-5 transition-all duration-200 hover:shadow-lg hover:shadow-primary/5 hover:translate-y-[-1px] active:translate-y-[0px] flex items-center justify-between gap-4"
    >
      <div className="flex items-center gap-4 flex-1 min-w-0">
        {/* Icon Pod */}
        <div
          className={`w-13 h-13 rounded-2xl bg-gradient-to-br ${gradient} p-[1px] flex-shrink-0 shadow-md group-hover:scale-105 transition-transform duration-200`}
        >
          <div className="w-full h-full rounded-2xl bg-white/90 dark:bg-[#0F131C]/90 backdrop-blur-sm flex items-center justify-center">
            <Icon className={`w-6 h-6 ${iconColor}`} />
          </div>
        </div>

        {/* Text Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-[17px] font-bold text-foreground group-hover:text-primary transition-colors truncate">
              {title}
            </h3>
            {badge && (
              <span className="text-[10.5px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                {badge}
              </span>
            )}
          </div>
          <p className="text-[13.5px] text-foreground-variant line-clamp-2 leading-relaxed">
            {subtitle}
          </p>
        </div>
      </div>

      {/* Chevron */}
      <div className="w-8 h-8 rounded-full bg-surface-container/60 dark:bg-white/[0.04] flex items-center justify-center text-foreground-variant/60 group-hover:text-primary group-hover:bg-primary/10 transition-colors flex-shrink-0">
        <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
      </div>
    </button>
  );
}
