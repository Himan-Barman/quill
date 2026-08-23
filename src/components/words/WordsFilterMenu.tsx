'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Calendar as CalendarIcon, Check } from 'lucide-react';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';

export type ViewMode = 'all' | 'today' | 'yesterday' | 'custom';

interface WordsFilterMenuProps {
  viewMode: ViewMode;
  customDate: string;
  availableDates: string[];
  onViewModeChange: (mode: ViewMode) => void;
  onCustomDateChange: (date: string) => void;
}

export function WordsFilterMenu({ viewMode, customDate, availableDates, onViewModeChange, onCustomDateChange }: WordsFilterMenuProps) {
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
    if (viewMode === 'all') return 'All';
    if (viewMode === 'today') return 'Today';
    if (viewMode === 'yesterday') return 'Yesterday';
    if (viewMode === 'custom' && customDate) {
      return customDate;
    }
    return 'Custom Date';
  };

  const handleSelect = (mode: ViewMode) => {
    if (mode === 'custom') {
      setShowCalendar(true);
    } else {
      onViewModeChange(mode);
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
            className={`absolute right-0 top-full mt-2 bg-surface border border-border rounded-2xl shadow-2xl overflow-hidden z-50 flex flex-col transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${showCalendar ? 'w-[350px]' : 'w-56'
              }`}
          >
            {!showCalendar ? (
              <div className="py-2">
                <MenuItem label="All" active={viewMode === 'all'} onClick={() => handleSelect('all')} />
                <MenuItem label="Today" active={viewMode === 'today'} onClick={() => handleSelect('today')} />
                <MenuItem label="Yesterday" active={viewMode === 'yesterday'} onClick={() => handleSelect('yesterday')} />
                <MenuItem label="Custom Date..." active={viewMode === 'custom'} onClick={() => handleSelect('custom')} />
              </div>
            ) : (
              <div className="p-5 flex flex-col w-full">
                <div className="flex items-center justify-between mb-4">
                  <label className="text-muted text-xs font-bold uppercase tracking-wider">Select Date</label>
                  <button
                    onClick={() => setShowCalendar(false)}
                    className="text-muted hover:text-foreground transition-colors p-1 rounded-md hover:bg-foreground/5"
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
                    onSelect={(date) => {
                      if (date) {
                        const offset = date.getTimezoneOffset();
                        const localDate = new Date(date.getTime() - (offset * 60 * 1000));
                        const val = localDate.toISOString().split('T')[0];
                        onCustomDateChange(val);
                        onViewModeChange('custom');
                        setIsOpen(false);
                        setShowCalendar(false);
                      }
                    }}
                    disabled={(date) => {
                      const offset = date.getTimezoneOffset();
                      const localDate = new Date(date.getTime() - (offset * 60 * 1000));
                      const dateStr = localDate.toISOString().split('T')[0];
                      const todayStr = new Date(new Date().getTime() - (new Date().getTimezoneOffset() * 60 * 1000)).toISOString().split('T')[0];
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

function MenuItem({ label, active, onClick }: { label: string, active: boolean, onClick: () => void }) {
  return (
    <div className="px-2 py-1">
      <button
        className={`w-full text-left px-4 py-2.5 flex items-center justify-between text-sm transition-all rounded-xl ${active ? 'bg-[#EAB308]/15 text-[#EAB308] font-bold shadow-[0_0_12px_rgba(234,179,8,0.15)]' : 'text-muted hover:text-foreground hover:bg-foreground/10'
          }`}
        onClick={onClick}
      >
        <span>{label}</span>
        {active && <Check className="w-4 h-4 text-[#EAB308]" />}
      </button>
    </div>
  );
}
