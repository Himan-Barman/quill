'use client';
import { ChevronRight, LucideIcon } from 'lucide-react';
import Link from 'next/link';

interface SettingsTileProps {
  title: string;
  subtitle?: string;
  icon: LucideIcon;
  iconColor?: string;
  textColor?: string;
  href?: string;
  onClick?: () => void;
  trailing?: React.ReactNode;
}

export function SettingsTile({
  title,
  subtitle,
  icon: Icon,
  iconColor = "text-muted",
  textColor = "text-foreground",
  href,
  onClick,
  trailing
}: SettingsTileProps) {
  const content = (
    <div className="flex items-center px-4 py-4 w-full bg-background hover:bg-surface-active transition-colors border-b border-border last:border-b-0 cursor-pointer">
      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-surface flex items-center justify-center mr-4 border border-border">
        <Icon className={`w-5 h-5 ${iconColor}`} />
      </div>
      <div className="flex-1 min-w-0 text-left">
        <p className={`text-base font-semibold truncate ${textColor}`}>
          {title}
        </p>
        {subtitle && (
          <p className="text-sm text-muted truncate mt-0.5">
            {subtitle}
          </p>
        )}
      </div>
      <div className="ml-4 flex-shrink-0 flex items-center">
        {trailing ? trailing : (href || onClick) ? <ChevronRight className="w-5 h-5 text-muted" /> : null}
      </div>
    </div>
  );

  if (href) {
    return <Link href={href} className="block w-full">{content}</Link>;
  }

  if (onClick) {
    return <button onClick={onClick} className="block w-full">{content}</button>;
  }

  return <div className="block w-full">{content}</div>;
}
