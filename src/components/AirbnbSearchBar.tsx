/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { Search, X, ChevronLeft, ChevronRight, MapPin } from 'lucide-react';

export interface GuestCount {
  adults: number;
  children: number;
  infants: number;
  pets: number;
}

export interface SearchPayload {
  location: string;
  startDate: string | null;
  endDate: string | null;
  guests: GuestCount;
}

interface AirbnbSearchBarProps {
  where: string;
  setWhere: (val: string) => void;
  whenDisplay: string;
  setWhenDisplay: (val: string) => void;
  startDate: Date | null;
  setStartDate: (d: Date | null) => void;
  endDate: Date | null;
  setEndDate: (d: Date | null) => void;
  guestCount: GuestCount;
  setGuestCount: React.Dispatch<React.SetStateAction<GuestCount>>;
  onSearch: (payload?: SearchPayload) => void;
}

const POPULAR_DESTINATIONS = [
  { name: 'Puri, Odisha', label: 'Coastal Beach & Temple Hub', query: 'Puri' },
  { name: 'Pensacola, FL', label: 'Emerald Coast Luxury Beachfront', query: 'Pensacola' },
  { name: 'Scottsdale, AZ', label: 'Desert Oasis & Heated Pools', query: 'Scottsdale' },
  { name: 'Blue Ridge, GA', label: 'Alpine Mountain Retreats', query: 'Blue Ridge' },
];

export const AirbnbSearchBar: React.FC<AirbnbSearchBarProps> = ({
  where,
  setWhere,
  whenDisplay,
  setWhenDisplay,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  guestCount,
  setGuestCount,
  onSearch,
}) => {
  // Active Popover State: 'none' | 'where' | 'when' | 'who'
  const [activePopover, setActivePopover] = useState<'none' | 'where' | 'when' | 'who'>('none');
  const [dateTab, setDateTab] = useState<'dates' | 'flexible'>('dates');

  // Month navigation for date picker
  const [currentMonthIndex, setCurrentMonthIndex] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const locationInputRef = useRef<HTMLInputElement>(null);

  // Close popovers when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setActivePopover('none');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Total Guests Count Calculation
  const totalGuests = guestCount.adults + guestCount.children;
  const getGuestLabel = () => {
    if (totalGuests === 0) return 'Guests';
    let label = `${totalGuests} guest${totalGuests > 1 ? 's' : ''}`;
    if (guestCount.infants > 0) {
      label += `, ${guestCount.infants} infant${guestCount.infants > 1 ? 's' : ''}`;
    }
    if (guestCount.pets > 0) {
      label += `, ${guestCount.pets} pet${guestCount.pets > 1 ? 's' : ''}`;
    }
    return label;
  };

  // Clear Guests
  const handleClearGuests = (e: React.MouseEvent) => {
    e.stopPropagation();
    setGuestCount({ adults: 0, children: 0, infants: 0, pets: 0 });
  };

  // Clear Location
  const handleClearLocation = (e: React.MouseEvent) => {
    e.stopPropagation();
    setWhere('');
    if (locationInputRef.current) {
      locationInputRef.current.focus();
    }
  };

  // STEP 1 AUTO-ADVANCE: On location selection or pressing Enter
  const handleLocationSubmit = (selectedLocation?: string) => {
    const finalLoc = selectedLocation !== undefined ? selectedLocation : where;
    setWhere(finalLoc);
    // Auto-advance to Step 2 (DATE)
    setActivePopover('when');
  };

  // Calendar calculations
  const today = new Date();
  const getMonthData = (offsetMonth: number) => {
    const year = today.getFullYear();
    const month = today.getMonth() + offsetMonth;
    const date = new Date(year, month, 1);
    const monthName = date.toLocaleString('default', { month: 'long', year: 'numeric' });
    const firstDayIndex = date.getDay();
    const daysInMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();

    return { monthName, firstDayIndex, daysInMonth, year: date.getFullYear(), month: date.getMonth() };
  };

  const month1 = getMonthData(currentMonthIndex);
  const month2 = getMonthData(currentMonthIndex + 1);

  // STEP 2 AUTO-ADVANCE: Handle Date Selection on Calendar
  const handleDateClick = (year: number, month: number, day: number) => {
    const selected = new Date(year, month, day);
    if (!startDate || (startDate && endDate)) {
      setStartDate(selected);
      setEndDate(null);
      setWhenDisplay(`${selected.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ...`);
    } else if (startDate && !endDate) {
      if (selected < startDate) {
        setStartDate(selected);
        setEndDate(null);
        setWhenDisplay(`${selected.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ...`);
      } else {
        setEndDate(selected);
        const startStr = startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        const endStr = selected.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        setWhenDisplay(`${startStr} – ${endStr}`);
        
        // Auto-advance to Step 3 (GUESTS) when both check-in & check-out dates are selected!
        setTimeout(() => {
          setActivePopover('who');
        }, 150);
      }
    }
  };

  const isDateSelected = (year: number, month: number, day: number) => {
    const date = new Date(year, month, day);
    if (startDate && date.getTime() === startDate.getTime()) return 'start';
    if (endDate && date.getTime() === endDate.getTime()) return 'end';
    if (startDate && endDate && date > startDate && date < endDate) return 'range';
    return null;
  };

  const updateGuestCategory = (category: keyof GuestCount, delta: number) => {
    setGuestCount((prev) => {
      const current = prev[category];
      const updated = Math.max(0, current + delta);

      // Rule: If children or infants added, ensure at least 1 adult
      let newAdults = prev.adults;
      if (category !== 'adults' && updated > 0 && newAdults === 0) {
        newAdults = 1;
      }
      if (category === 'adults' && updated === 0 && (prev.children > 0 || prev.infants > 0)) {
        return prev;
      }

      return { ...prev, adults: newAdults, [category]: updated };
    });
  };

  const renderCalendarDays = (monthInfo: ReturnType<typeof getMonthData>) => {
    const days = [];
    for (let i = 0; i < monthInfo.firstDayIndex; i++) {
      days.push(<div key={`blank-${i}`} className="h-9 w-9" />);
    }
    for (let d = 1; d <= monthInfo.daysInMonth; d++) {
      const dateObj = new Date(monthInfo.year, monthInfo.month, d);
      const isPast = dateObj < new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const status = isDateSelected(monthInfo.year, monthInfo.month, d);

      let dayClasses = "h-9 w-9 flex items-center justify-center text-xs font-semibold rounded-full transition-all cursor-pointer font-sans ";

      if (isPast) {
        dayClasses += "text-slate-600 cursor-not-allowed pointer-events-none line-through ";
      } else if (status === 'start' || status === 'end') {
        dayClasses += "bg-gradient-to-r from-fuchsia-600 to-pink-600 text-white font-bold shadow-lg shadow-pink-600/40 scale-105 ";
      } else if (status === 'range') {
        dayClasses += "bg-purple-900/60 text-purple-200 rounded-none font-medium ";
      } else {
        dayClasses += "hover:bg-purple-900/40 text-slate-200 hover:border hover:border-purple-500/30 ";
      }

      days.push(
        <button
          key={`day-${d}`}
          disabled={isPast}
          onClick={() => handleDateClick(monthInfo.year, monthInfo.month, d)}
          className={dayClasses}
        >
          {d}
        </button>
      );
    }
    return days;
  };

  // Trigger search payload
  const handleTriggerSearch = () => {
    setActivePopover('none');
    const payload: SearchPayload = {
      location: where,
      startDate: startDate ? startDate.toISOString().split('T')[0] : null,
      endDate: endDate ? endDate.toISOString().split('T')[0] : null,
      guests: guestCount
    };
    onSearch(payload);
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-4xl mx-auto my-4 font-sans select-none z-30">
      
      {/* MAIN SEARCH CONTAINER PILL - EXACT MATCH FOR DARK PURPLE IMAGE DESIGN */}
      <div 
        className={`w-full bg-[#160826]/90 hover:bg-[#1a092c] backdrop-blur-xl transition-all duration-200 rounded-full shadow-2xl shadow-purple-950/80 border border-purple-900/60 p-1.5 flex items-center justify-between relative ${
          activePopover !== 'none' ? 'ring-2 ring-purple-500/50 bg-[#1e0a32] border-purple-500/50' : ''
        }`}
      >

        {/* SECTION 1: LOCATION */}
        <div 
          onClick={() => setActivePopover('where')}
          className={`flex-1 px-6 py-2 rounded-full cursor-pointer transition-all duration-200 flex flex-col justify-center relative group ${
            activePopover === 'where' ? 'bg-[#250d3e] shadow-md border border-purple-500/40' : 'hover:bg-[#200b36]'
          }`}
        >
          <span className="text-[10px] font-extrabold tracking-wider text-[#a78bfa] uppercase font-sans mb-0.5">
            LOCATION
          </span>
          <div className="flex items-center gap-1.5">
            <input 
              ref={locationInputRef}
              type="text" 
              placeholder="Location" 
              value={where}
              onChange={(e) => {
                setWhere(e.target.value);
                setActivePopover('where');
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleLocationSubmit();
                }
              }}
              onFocus={() => setActivePopover('where')}
              className="bg-transparent border-none outline-none text-sm font-semibold text-slate-100 placeholder:text-slate-400 placeholder:font-normal w-full font-sans cursor-text"
            />
            {where && (
              <button 
                type="button"
                onClick={handleClearLocation}
                className="text-slate-400 hover:text-slate-100 p-0.5 rounded-full hover:bg-purple-900/50 transition-colors shrink-0"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* SUBTLE VERTICAL DIVIDER LINE */}
        <div className={`h-7 w-[1px] bg-purple-900/60 transition-opacity ${activePopover === 'where' || activePopover === 'when' ? 'opacity-0' : 'opacity-100'}`} />

        {/* SECTION 2: DATE */}
        <div 
          onClick={() => setActivePopover('when')}
          className={`flex-1 px-6 py-2 rounded-full cursor-pointer transition-all duration-200 flex flex-col justify-center relative group ${
            activePopover === 'when' ? 'bg-[#250d3e] shadow-md border border-purple-500/40' : 'hover:bg-[#200b36]'
          }`}
        >
          <span className="text-[10px] font-extrabold tracking-wider text-[#a78bfa] uppercase font-sans mb-0.5">
            DATE
          </span>
          <span className={`text-sm font-sans truncate ${whenDisplay ? 'text-slate-100 font-semibold' : 'text-slate-400 font-normal'}`}>
            {whenDisplay || 'Date'}
          </span>
        </div>

        {/* SECTION 3: GUESTS - DISTINCT INNER PILL CONTAINER */}
        <div 
          onClick={() => setActivePopover('who')}
          className={`bg-[#200a33] hover:bg-[#280d40] rounded-full border border-purple-800/70 shadow-inner transition-all duration-200 flex items-center pl-5 pr-1.5 py-1.5 cursor-pointer ml-1 relative ${
            activePopover === 'who' ? 'ring-2 ring-purple-500/60 bg-[#2d0f48] shadow-xl border-purple-400/80' : ''
          }`}
        >
          {/* Single Label + Value Text */}
          <div className="flex flex-col justify-center mr-4">
            <span className="text-[10px] font-extrabold tracking-wider text-[#a78bfa] uppercase font-sans mb-0.5">
              GUESTS
            </span>
            <span className={`text-sm font-sans whitespace-nowrap ${totalGuests > 0 ? 'text-slate-100 font-semibold' : 'text-slate-400 font-normal'}`}>
              {getGuestLabel()}
            </span>
          </div>

          {/* X Clear Icon button when guests exist */}
          {totalGuests > 0 && (
            <button 
              type="button"
              onClick={handleClearGuests}
              className="p-1 text-slate-400 hover:text-slate-100 hover:bg-purple-900/50 rounded-full transition-colors mr-2 text-xs font-bold"
              title="Reset guests"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}

          {/* VIBRANT GLOW/GRADIENT ACTION SEARCH BUTTON */}
          <button 
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleTriggerSearch();
            }}
            className="bg-gradient-to-r from-fuchsia-600 via-pink-600 to-rose-600 hover:from-fuchsia-500 hover:to-rose-500 active:scale-95 text-white font-bold rounded-full px-5 py-2.5 flex items-center gap-2 shadow-lg shadow-pink-600/40 hover:shadow-pink-500/60 transition-all duration-200 shrink-0 font-sans cursor-pointer"
          >
            <Search className="w-4 h-4 stroke-[2.5]" />
            <span className="text-sm font-bold tracking-wide">Search</span>
          </button>
        </div>

      </div>

      {/* POPOVER 1: LOCATION SUGGESTIONS */}
      {activePopover === 'where' && (
        <div className="absolute top-full left-0 mt-3 w-80 bg-[#170728] rounded-3xl shadow-2xl shadow-black/90 border border-purple-800/80 p-5 text-slate-100 animate-slide-in z-50 backdrop-blur-2xl">
          <p className="text-[11px] font-extrabold uppercase tracking-wider text-purple-400 mb-3 font-mono">
            Popular Destinations
          </p>
          <div className="space-y-1.5">
            {POPULAR_DESTINATIONS.map((dest) => (
              <button
                key={dest.name}
                type="button"
                onClick={() => handleLocationSubmit(dest.query)}
                className="w-full text-left p-3 rounded-2xl hover:bg-[#280d44] transition-colors flex items-center gap-3.5 group border border-transparent hover:border-purple-700/50 cursor-pointer"
              >
                <div className="w-10 h-10 rounded-xl bg-purple-950/90 text-purple-400 flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition-colors border border-purple-800/60 shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-100 font-sans">{dest.name}</p>
                  <p className="text-xs text-slate-400 font-sans">{dest.label}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* POPOVER 2: DATE CALENDAR PICKER */}
      {activePopover === 'when' && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-full max-w-2xl bg-[#170728] rounded-3xl shadow-2xl shadow-black/90 border border-purple-800/80 p-6 text-slate-100 animate-slide-in z-50 backdrop-blur-2xl">
          
          {/* Calendar Header Tabs */}
          <div className="flex justify-center mb-6">
            <div className="bg-[#0f041c] p-1 rounded-full border border-purple-900/60 inline-flex gap-1 text-xs font-bold">
              <button 
                type="button"
                onClick={() => setDateTab('dates')}
                className={`px-5 py-2 rounded-full transition-all cursor-pointer ${
                  dateTab === 'dates' ? 'bg-[#2d0f48] text-white shadow-sm border border-purple-500/40' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Specific Dates
              </button>
              <button 
                type="button"
                onClick={() => setDateTab('flexible')}
                className={`px-5 py-2 rounded-full transition-all cursor-pointer ${
                  dateTab === 'flexible' ? 'bg-[#2d0f48] text-white shadow-sm border border-purple-500/40' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Flexible Presets
              </button>
            </div>
          </div>

          {dateTab === 'flexible' ? (
            <div className="space-y-6">
              <p className="text-center font-bold text-sm text-slate-300">Choose staying duration</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: 'Any weekend', desc: 'Fri – Sun' },
                  { label: 'Any week', desc: '7 days' },
                  { label: 'Full month', desc: '30 days' },
                  { label: 'Anytime', desc: 'Flexible' },
                ].map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => {
                      setWhenDisplay(item.label);
                      setStartDate(null);
                      setEndDate(null);
                      // Auto-advance to Step 3 (GUESTS)
                      setActivePopover('who');
                    }}
                    className={`p-4 rounded-2xl border text-center transition-all cursor-pointer ${
                      whenDisplay === item.label
                        ? 'border-purple-500 bg-purple-950/90 ring-2 ring-purple-500/40 text-purple-200 font-bold'
                        : 'border-purple-900/60 hover:border-purple-500/50 bg-[#200a33] text-slate-200'
                    }`}
                  >
                    <p className="text-sm font-bold font-sans">{item.label}</p>
                    <p className="text-xs text-slate-400 font-sans mt-0.5">{item.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div>
              {/* Month Navigation Header */}
              <div className="flex items-center justify-between mb-4 px-2">
                <button 
                  type="button"
                  disabled={currentMonthIndex <= 0}
                  onClick={() => setCurrentMonthIndex((prev) => Math.max(0, prev - 1))}
                  className="p-2 rounded-full hover:bg-purple-900/50 disabled:opacity-20 disabled:pointer-events-none text-slate-300 transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <div className="flex gap-12 font-bold text-sm text-slate-100">
                  <span>{month1.monthName}</span>
                  <span className="hidden sm:inline">{month2.monthName}</span>
                </div>
                <button 
                  type="button"
                  onClick={() => setCurrentMonthIndex((prev) => prev + 1)}
                  className="p-2 rounded-full hover:bg-purple-900/50 text-slate-300 transition-colors cursor-pointer"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              {/* Dual Month Calendar Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                
                {/* Month 1 */}
                <div>
                  <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-bold text-purple-400/80 mb-2">
                    <span>Su</span><span>Mo</span><span>Tu</span><span>We</span><span>Th</span><span>Fr</span><span>Sa</span>
                  </div>
                  <div className="grid grid-cols-7 gap-1 justify-items-center">
                    {renderCalendarDays(month1)}
                  </div>
                </div>

                {/* Month 2 */}
                <div className="hidden sm:block">
                  <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-bold text-purple-400/80 mb-2">
                    <span>Su</span><span>Mo</span><span>Tu</span><span>We</span><span>Th</span><span>Fr</span><span>Sa</span>
                  </div>
                  <div className="grid grid-cols-7 gap-1 justify-items-center">
                    {renderCalendarDays(month2)}
                  </div>
                </div>

              </div>

              {/* Calendar Footer Actions */}
              <div className="mt-6 pt-4 border-t border-purple-900/60 flex items-center justify-between">
                <button 
                  type="button"
                  onClick={() => {
                    setStartDate(null);
                    setEndDate(null);
                    setWhenDisplay('');
                  }}
                  className="text-xs font-bold text-slate-400 hover:text-slate-100 underline transition-colors cursor-pointer"
                >
                  Clear dates
                </button>
                <button 
                  type="button"
                  onClick={() => setActivePopover('who')}
                  className="px-5 py-2 bg-gradient-to-r from-fuchsia-600 to-pink-600 hover:from-fuchsia-500 hover:to-pink-500 text-white text-xs font-bold rounded-full shadow-md shadow-pink-600/30 cursor-pointer"
                >
                  Next: Guests →
                </button>
              </div>
            </div>
          )}

        </div>
      )}

      {/* POPOVER 3: GUESTS COUNTER DROPDOWN */}
      {activePopover === 'who' && (
        <div className="absolute top-full right-0 mt-3 w-80 bg-[#170728] rounded-3xl shadow-2xl shadow-black/90 border border-purple-800/80 p-6 text-slate-100 animate-slide-in z-50 backdrop-blur-2xl">
          
          <div className="space-y-6">
            
            {/* Adult Counter */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-slate-100 font-sans">Adults</p>
                <p className="text-xs text-slate-400 font-sans">Ages 13 or above</p>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  type="button"
                  disabled={guestCount.adults <= 0 || (guestCount.adults <= 1 && (guestCount.children > 0 || guestCount.infants > 0))}
                  onClick={() => updateGuestCategory('adults', -1)}
                  className="w-8 h-8 rounded-full border border-purple-800 flex items-center justify-center text-purple-300 hover:border-purple-400 hover:text-white hover:bg-purple-900/50 disabled:opacity-20 disabled:pointer-events-none font-bold text-sm transition-colors cursor-pointer"
                >
                  –
                </button>
                <span className="w-5 text-center font-bold text-sm text-slate-100">{guestCount.adults}</span>
                <button 
                  type="button"
                  onClick={() => updateGuestCategory('adults', 1)}
                  className="w-8 h-8 rounded-full border border-purple-800 flex items-center justify-center text-purple-300 hover:border-purple-400 hover:text-white hover:bg-purple-900/50 font-bold text-sm transition-colors cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>

            {/* Children Counter */}
            <div className="flex items-center justify-between pt-4 border-t border-purple-900/60">
              <div>
                <p className="text-sm font-bold text-slate-100 font-sans">Children</p>
                <p className="text-xs text-slate-400 font-sans">Ages 2–12</p>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  type="button"
                  disabled={guestCount.children <= 0}
                  onClick={() => updateGuestCategory('children', -1)}
                  className="w-8 h-8 rounded-full border border-purple-800 flex items-center justify-center text-purple-300 hover:border-purple-400 hover:text-white hover:bg-purple-900/50 disabled:opacity-20 disabled:pointer-events-none font-bold text-sm transition-colors cursor-pointer"
                >
                  –
                </button>
                <span className="w-5 text-center font-bold text-sm text-slate-100">{guestCount.children}</span>
                <button 
                  type="button"
                  onClick={() => updateGuestCategory('children', 1)}
                  className="w-8 h-8 rounded-full border border-purple-800 flex items-center justify-center text-purple-300 hover:border-purple-400 hover:text-white hover:bg-purple-900/50 font-bold text-sm transition-colors cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>

            {/* Infants Counter */}
            <div className="flex items-center justify-between pt-4 border-t border-purple-900/60">
              <div>
                <p className="text-sm font-bold text-slate-100 font-sans">Infants</p>
                <p className="text-xs text-slate-400 font-sans">Under 2</p>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  type="button"
                  disabled={guestCount.infants <= 0}
                  onClick={() => updateGuestCategory('infants', -1)}
                  className="w-8 h-8 rounded-full border border-purple-800 flex items-center justify-center text-purple-300 hover:border-purple-400 hover:text-white hover:bg-purple-900/50 disabled:opacity-20 disabled:pointer-events-none font-bold text-sm transition-colors cursor-pointer"
                >
                  –
                </button>
                <span className="w-5 text-center font-bold text-sm text-slate-100">{guestCount.infants}</span>
                <button 
                  type="button"
                  onClick={() => updateGuestCategory('infants', 1)}
                  className="w-8 h-8 rounded-full border border-purple-800 flex items-center justify-center text-purple-300 hover:border-purple-400 hover:text-white hover:bg-purple-900/50 font-bold text-sm transition-colors cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>

            {/* Pets Counter */}
            <div className="flex items-center justify-between pt-4 border-t border-purple-900/60">
              <div>
                <p className="text-sm font-bold text-slate-100 font-sans">Pets</p>
                <p className="text-xs text-slate-400 font-sans">Service animals welcome</p>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  type="button"
                  disabled={guestCount.pets <= 0}
                  onClick={() => updateGuestCategory('pets', -1)}
                  className="w-8 h-8 rounded-full border border-purple-800 flex items-center justify-center text-purple-300 hover:border-purple-400 hover:text-white hover:bg-purple-900/50 disabled:opacity-20 disabled:pointer-events-none font-bold text-sm transition-colors cursor-pointer"
                >
                  –
                </button>
                <span className="w-5 text-center font-bold text-sm text-slate-100">{guestCount.pets}</span>
                <button 
                  type="button"
                  onClick={() => updateGuestCategory('pets', 1)}
                  className="w-8 h-8 rounded-full border border-purple-800 flex items-center justify-center text-purple-300 hover:border-purple-400 hover:text-white hover:bg-purple-900/50 font-bold text-sm transition-colors cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>

          </div>

          <div className="mt-6 pt-4 border-t border-purple-900/60 flex items-center justify-between">
            <button 
              type="button"
              onClick={() => setGuestCount({ adults: 0, children: 0, infants: 0, pets: 0 })}
              className="text-xs font-bold text-slate-400 hover:text-slate-100 underline transition-colors cursor-pointer"
            >
              Reset
            </button>
            <button 
              type="button"
              onClick={() => handleTriggerSearch()}
              className="px-6 py-2 bg-gradient-to-r from-fuchsia-600 to-pink-600 hover:from-fuchsia-500 hover:to-pink-500 text-white text-xs font-bold rounded-full shadow-md shadow-pink-600/30 cursor-pointer"
            >
              Search Villas
            </button>
          </div>

        </div>
      )}

    </div>
  );
};
