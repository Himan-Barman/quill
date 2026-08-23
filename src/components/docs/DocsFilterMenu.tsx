'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check, Quote, GitFork, FileText, Star, Calendar } from 'lucide-react';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';

export type DocsFilterMode = 'all' | 'snippet' | 'thread' | 'document' | 'favorite' | 'today' | 'yesterday' | 'custom';

interface DocsFilterMenuProps {
  filterMode: DocsFilterMode;
  customDate: string;
  availableDates: string[];
  onFilterModeChange: (mode: DocsFilterMode) => void;
  onCustomDateChange: (date: string) => void;
}

export function DocsFilterMenu({
  filterMode,
  customDate,
  availableDates,
  onFilterModeChange,
  onCustomDateChange,
}: DocsFilterMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setShowCalendar(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getLabel = () => {
    switch (filterMode) {
      case 'all':
        return 'All Docs';
      case 'snippet':
        return 'Snippets';
      case 'thread':
        return 'Threads';
      case 'document':
        return 'Documents';
      case 'favorite':
        return 'Favorites';
      case 'today':
        return 'Today';
      case 'yesterday':
        return 'Yesterday';
      case 'custom':
        return customDate || 'Custom Date';
      default:
        return 'Filter';
    }
  };

  const handleSelect = (mode: DocsFilterMode) => {
    if (mode === 'custom') {
      setShowCalendar(true);
    } else {
      onFilterModeChange(mode);
      setIsOpen(false);
      setShowCalendar(false);
    }
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20 transition-colors px-4 py-2 rounded-full font-bold text-sm border border-yellow-500/20 whitespace-nowrap shrink-0 cursor-pointer select-none"
      >
        <span className="whitespace-nowrap">{getLabel()}</span>
        <ChevronDown className="w-4 h-4 shrink-0" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.15 }}
            className={`absolute right-0 top-full mt-2 bg-surface border border-border rounded-2xl shadow-2xl overflow-hidden z-50 flex flex-col transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${
              showCalendar ? 'w-[350px]' : 'w-60'
            }`}
          >
            {!showCalendar ? (
              <div className="py-2">
                {/* Type Category Options */}
                <div className="px-3 py-1.5 text-[10px] font-bold text-muted uppercase tracking-wider">
                  Type Filters
                </div>
                <MenuItem
                  icon={FileText}
                  label="All Docs"
                  active={filterMode === 'all'}
                  onClick={() => handleSelect('all')}
                />
                <MenuItem
                  icon={Quote}
                  label="Snippets"
                  active={filterMode === 'snippet'}
                  onClick={() => handleSelect('snippet')}
                />
                <MenuItem
                  icon={GitFork}
                  label="Threads"
                  active={filterMode === 'thread'}
                  onClick={() => handleSelect('thread')}
                />
                <MenuItem
                  icon={FileText}
                  label="Documents"
                  active={filterMode === 'document'}
                  onClick={() => handleSelect('document')}
                />
                <MenuItem
                  icon={Star}
                  label="Favorites"
                  active={filterMode === 'favorite'}
                  onClick={() => handleSelect('favorite')}
                />

                <div className="h-px bg-border/50 my-1 mx-2" />

                {/* Date Filters */}
                <div className="px-3 py-1.5 text-[10px] font-bold text-muted uppercase tracking-wider">
                  Date Filters
                </div>
                <MenuItem
                  icon={Calendar}
                  label="Today"
                  active={filterMode === 'today'}
                  onClick={() => handleSelect('today')}
                />
                <MenuItem
                  icon={Calendar}
                  label="Yesterday"
                  active={filterMode === 'yesterday'}
                  onClick={() => handleSelect('yesterday')}
                />
                <MenuItem
                  icon={Calendar}
                  label="Custom Date..."
                  active={filterMode === 'custom'}
                  onClick={() => handleSelect('custom')}
                />
              </div>
            ) : (
              <div className="p-5 flex flex-col w-full">
                <div className="flex items-center justify-between mb-4">
                  <label className="text-muted text-xs font-bold uppercase tracking-wider">
                    Select Date
                  </label>
                  <button
                    onClick={() => setShowCalendar(false)}
                    className="text-muted hover:text-foreground transition-colors p-1 rounded-md hover:bg-foreground/5 cursor-pointer"
                  >
                    <ChevronDown className="w-4 h-4 rotate-90" />
                  </button>
                </div>

                <div className="flex justify-center w-full lexora-calendar pt-2">
                  <style>{`
                    .lexora-calendar .rdp {
                      --rdp-cell-size: 38px;
                      --rdp-accent-color: #EAB308 !important;
                      --rdp-background-color: #EAB308 !important;
                    }
                    .lexora-calendar .rdp-nav {
                      display: flex !important;
                      gap: 16px !important;
                      align-items: center;
                    }
                    .lexora-calendar .rdp-nav_button {
                      color: #FFFFFF !important;
                      width: 32px;
                      height: 32px;
                      border-radius: 10px;
                      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
                      background-color: transparent !important;
                      border: none !important;
                    }
                    .lexora-calendar .rdp-nav_button:hover {
                      background-color: rgba(255, 255, 255, 0.1) !important;
                      transform: scale(1.05);
                    }
                    .lexora-calendar .rdp-nav_button svg,
                    .lexora-calendar .rdp-chevron {
                      fill: #FFFFFF !important;
                      stroke: #FFFFFF !important;
                      width: 14px;
                      height: 14px;
                    }
                    .lexora-calendar .rdp-caption_label {
                      font-size: 1.05rem;
                      font-weight: 700;
                      color: var(--foreground);
                      letter-spacing: 0.01em;
                    }
                    .lexora-calendar .rdp-day {
                      border-radius: 10px;
                      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
                      font-weight: 500;
                      color: var(--muted);
                    }
                    .lexora-calendar .rdp-day:hover:not(.rdp-day_disabled):not([aria-disabled="true"]) {
                      background-color: var(--surface-hover) !important;
                      transform: scale(1.1);
                      color: var(--foreground);
                    }
                    .lexora-calendar .rdp-day_today:not(.rdp-day_selected),
                    .lexora-calendar .rdp-today:not(.rdp-selected) {
                      color: #EAB308 !important;
                      font-weight: 700 !important;
                      position: relative;
                    }
                    .lexora-calendar .rdp-day_today:not(.rdp-day_selected)::after,
                    .lexora-calendar .rdp-today:not(.rdp-selected)::after {
                      content: '';
                      position: absolute;
                      bottom: 4px;
                      left: 50%;
                      transform: translateX(-50%);
                      width: 4px;
                      height: 4px;
                      border-radius: 50%;
                      background-color: #EAB308;
                      box-shadow: 0 0 8px #EAB308;
                    }
                    .lexora-calendar .rdp-day_selected,
                    .lexora-calendar .rdp-day_selected:hover,
                    .lexora-calendar .rdp-selected,
                    .lexora-calendar .rdp-selected:hover {
                      background-color: #EAB308 !important;
                      color: var(--background) !important;
                      box-shadow: 0 4px 14px rgba(234, 179, 8, 0.4) !important;
                      transform: scale(1.05) !important;
                      border-radius: 10px !important;
                      font-weight: 700 !important;
                    }
                    .lexora-calendar .rdp-head_cell {
                      font-size: 0.7rem;
                      font-weight: 600;
                      text-transform: uppercase;
                      color: #64748B;
                      padding-bottom: 12px;
                      letter-spacing: 0.05em;
                    }
                    .lexora-calendar .rdp-day_disabled,
                    .lexora-calendar .rdp-day[aria-disabled="true"] {
                      opacity: 0.2;
                      text-decoration: line-through;
                      text-decoration-color: rgba(255,255,255,0.15);
                      font-weight: 400;
                    }
                  `}</style>
                  <DayPicker
                    mode="single"
                    selected={customDate ? new Date(customDate) : undefined}
                    onSelect={date => {
                      if (date) {
                        const offset = date.getTimezoneOffset();
                        const localDate = new Date(date.getTime() - offset * 60 * 1000);
                        const val = localDate.toISOString().split('T')[0];
                        onCustomDateChange(val);
                        onFilterModeChange('custom');
                        setIsOpen(false);
                        setShowCalendar(false);
                      }
                    }}
                    disabled={date => {
                      const offset = date.getTimezoneOffset();
                      const localDate = new Date(date.getTime() - offset * 60 * 1000);
                      const dateStr = localDate.toISOString().split('T')[0];
                      const todayStr = new Date(
                        new Date().getTime() - new Date().getTimezoneOffset() * 60 * 1000
                      )
                        .toISOString()
                        .split('T')[0];
                      return !availableDates.includes(dateStr) && dateStr !== todayStr;
                    }}
                  />
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function MenuItem({
  icon: Icon,
  label,
  active,
  onClick,
}: {
  icon?: any;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <div className="px-2 py-0.5">
      <button
        className={`w-full text-left px-3.5 py-2 flex items-center justify-between text-sm transition-all rounded-xl cursor-pointer ${
          active
            ? 'bg-[#EAB308]/15 text-[#EAB308] font-bold shadow-[0_0_12px_rgba(234,179,8,0.15)]'
            : 'text-muted hover:text-foreground hover:bg-foreground/10'
        }`}
        onClick={onClick}
      >
        <div className="flex items-center gap-2.5">
          {Icon && <Icon className="w-4 h-4 shrink-0" />}
          <span>{label}</span>
        </div>
        {active && <Check className="w-4 h-4 text-[#EAB308] shrink-0" />}
      </button>
    </div>
  );
}
