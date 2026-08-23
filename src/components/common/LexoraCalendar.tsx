'use client';

import React from 'react';
import { DayPicker, DateRange } from 'react-day-picker';
import 'react-day-picker/dist/style.css';

interface LexoraSingleCalendarProps {
  mode?: 'single';
  selectedDate?: Date;
  availableDates?: string[];
  accentColor?: string;
  onSelectDate: (date: Date | undefined) => void;
}

interface LexoraRangeCalendarProps {
  mode: 'range';
  selectedRange?: DateRange;
  availableDates?: string[];
  accentColor?: string;
  onSelectRange: (range: DateRange | undefined) => void;
}

type LexoraCalendarProps = LexoraSingleCalendarProps | LexoraRangeCalendarProps;

export function LexoraCalendar(props: LexoraCalendarProps) {
  const accentColor = props.accentColor || '#3B82F6';

  const formatLocalDate = (date: Date): string => {
    const offset = date.getTimezoneOffset();
    const localDate = new Date(date.getTime() - offset * 60 * 1000);
    return localDate.toISOString().split('T')[0];
  };

  const isDayDisabled = (date: Date): boolean => {
    if (!props.availableDates || props.availableDates.length === 0) return false;
    const dateStr = formatLocalDate(date);
    const todayStr = formatLocalDate(new Date());
    return !props.availableDates.includes(dateStr) && dateStr !== todayStr;
  };

  return (
    <div className="flex justify-center w-full lexora-calendar pt-2">
      <style>{`
        .lexora-calendar .rdp {
          --rdp-cell-size: 38px;
          --rdp-accent-color: ${accentColor} !important;
          --rdp-background-color: ${accentColor} !important;
          margin: 0;
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
          cursor: pointer;
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
          cursor: pointer;
        }
        .lexora-calendar .rdp-day_today:not(.rdp-day_selected),
        .lexora-calendar .rdp-today:not(.rdp-selected) {
          color: ${accentColor} !important;
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
          background-color: ${accentColor};
          box-shadow: 0 0 8px ${accentColor};
        }
        .lexora-calendar .rdp-day_selected,
        .lexora-calendar .rdp-day_selected:hover,
        .lexora-calendar .rdp-selected,
        .lexora-calendar .rdp-selected:hover {
          background-color: ${accentColor} !important;
          color: #FFFFFF !important;
          box-shadow: 0 4px 14px ${accentColor}66 !important;
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

      {props.mode === 'range' ? (
        <DayPicker
          mode="range"
          selected={props.selectedRange}
          onSelect={props.onSelectRange}
          disabled={props.availableDates && props.availableDates.length > 0 ? isDayDisabled : undefined}
          className="text-foreground"
        />
      ) : (
        <DayPicker
          mode="single"
          selected={props.selectedDate}
          onSelect={props.onSelectDate}
          disabled={props.availableDates && props.availableDates.length > 0 ? isDayDisabled : undefined}
          className="text-foreground"
        />
      )}
    </div>
  );
}
