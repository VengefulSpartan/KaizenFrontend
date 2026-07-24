/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  getStoredDeals, 
  saveDeals, 
  resetDealsToDefault, 
  normalizeDeal,
  Deal,
  PlatformListing
} from './dealsData';
import { 
  Building, 
  ArrowRight, 
  Calendar, 
  DollarSign, 
  CheckCircle2, 
  MapPin, 
  Maximize2, 
  Sparkles, 
  Clock, 
  Info, 
  Lock, 
  Plus, 
  Trash2, 
  Edit, 
  X, 
  ChevronRight, 
  ChevronLeft,
  Check, 
  Settings, 
  Send, 
  FileText, 
  RefreshCw, 
  Download, 
  Users, 
  Eye, 
  AlertTriangle, 
  Sliders, 
  Layers,
  Heart,
  MessageSquare,
  Compass,
  Award,
  BookOpen,
  HeartHandshake,
  Star,
  CheckCircle,
  ShieldCheck,
  ExternalLink,
  Globe,
  ToggleLeft,
  ToggleRight,
  Image as ImageIcon
} from 'lucide-react';

// Platform Colors & Icons map
const PLATFORM_CONFIG: Record<string, { bg: string; text: string; border: string; iconLabel: string }> = {
  'Airbnb': {
    bg: 'bg-rose-950/80 hover:bg-rose-900/90',
    text: 'text-rose-200',
    border: 'border-rose-500/40',
    iconLabel: '🏠 Airbnb'
  },
  'Vrbo': {
    bg: 'bg-blue-950/80 hover:bg-blue-900/90',
    text: 'text-blue-200',
    border: 'border-blue-500/40',
    iconLabel: '🏖️ Vrbo'
  },
  'Booking.com': {
    bg: 'bg-indigo-950/80 hover:bg-indigo-900/90',
    text: 'text-indigo-200',
    border: 'border-indigo-500/40',
    iconLabel: '🏨 Booking.com'
  },
  'Zillow': {
    bg: 'bg-emerald-950/80 hover:bg-emerald-900/90',
    text: 'text-emerald-200',
    border: 'border-emerald-500/40',
    iconLabel: '🏡 Zillow'
  },
  'Direct Website': {
    bg: 'bg-purple-950/80 hover:bg-purple-900/90',
    text: 'text-purple-200',
    border: 'border-purple-500/40',
    iconLabel: '🌐 Direct Website'
  },
  'Custom': {
    bg: 'bg-slate-900/80 hover:bg-slate-800/90',
    text: 'text-slate-200',
    border: 'border-slate-600/40',
    iconLabel: '🔗 Platform'
  }
};

const AVAILABLE_PLATFORMS = ['Airbnb', 'Vrbo', 'Booking.com', 'Zillow', 'Direct Website', 'Custom'];

import { AirbnbSearchBar, GuestCount, SearchPayload } from './components/AirbnbSearchBar';

export default function App() {
  // Navigation & View States
  const [activeTab, setActiveTab] = useState<'properties' | 'blogs' | 'stories' | 'experiences' | 'about' | 'admin'>('properties');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'AVAILABLE' | 'UNDER CONTRACT' | 'UNDER REVIEW'>('ALL');
  
  // Airbnb Search Bar States
  const [searchWhere, setSearchWhere] = useState('');
  const [searchWhenDisplay, setSearchWhenDisplay] = useState('');
  const [searchStartDate, setSearchStartDate] = useState<Date | null>(null);
  const [searchEndDate, setSearchEndDate] = useState<Date | null>(null);
  const [searchGuestCount, setSearchGuestCount] = useState<GuestCount>({
    adults: 0,
    children: 0,
    infants: 0,
    pets: 0,
  });
  
  // Storage & Core Data States
  const [deals, setDeals] = useState<Deal[]>([]);
  
  // Favorites system
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('kaizen_favorites');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  // Authentication & Admin Modal States
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loggedInUser, setLoggedInUser] = useState<{ name: string; email: string; isAdmin: boolean } | null>(null);

  // Sync favorites helper
  const toggleFavorite = (dealId: string) => {
    const isFav = favorites.includes(dealId);
    let updated;
    if (isFav) {
      updated = favorites.filter(id => id !== dealId);
      triggerNotification('Property removed from saved list.', 'info');
    } else {
      updated = [...favorites, dealId];
      triggerNotification('Property added to saved list!', 'success');
    }
    setFavorites(updated);
    localStorage.setItem('kaizen_favorites', JSON.stringify(updated));
  };
  
  // Property Modal & Image Gallery States
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);
  
  // Admin Property Editor Modal State
  const [showPropertyEditorModal, setShowPropertyEditorModal] = useState(false);
  const [editingDealId, setEditingDealId] = useState<string | null>(null);
  
  // Admin Form State
  const [adminForm, setAdminForm] = useState<{
    title: string;
    location: string;
    bedsBaths: string;
    squareFeet: string;
    furnished: 'Yes' | 'No';
    monthlyRent: string;
    leaseTerm: string;
    projectedAnnualRevenue: string;
    estOccupancy: string;
    adr: string;
    securityDeposit: string;
    concessions: string;
    availability: string;
    estNetMonthlyProfit: string;
    totalCashToStart: string;
    specialRequirements: string;
    imageUrl: string;
    images: string[];
    status: 'AVAILABLE' | 'UNDER CONTRACT' | 'UNDER REVIEW' | 'OCCUPIED' | 'MAINTENANCE';
    description: string;
    listings: PlatformListing[];
  }>({
    title: '',
    location: '',
    bedsBaths: '3 bed, 2 bath',
    squareFeet: '1,200',
    furnished: 'Yes',
    monthlyRent: '$2,200',
    leaseTerm: '12 months',
    projectedAnnualRevenue: '$55,000',
    estOccupancy: '70%',
    adr: '$210',
    securityDeposit: '$4,000',
    concessions: 'None',
    availability: 'ASAP',
    estNetMonthlyProfit: '~$1,700',
    totalCashToStart: '$9,000',
    specialRequirements: 'CGL insurance + COI',
    imageUrl: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80',
    images: ['https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80'],
    status: 'AVAILABLE',
    description: 'Vetted luxury vacation rental property with proven occupancy and turn-key amenities.',
    listings: [
      { platform: 'Airbnb', url: 'https://www.airbnb.com', isActive: true },
      { platform: 'Vrbo', url: 'https://www.vrbo.com', isActive: true }
    ]
  });

  const [newImageUrlInput, setNewImageUrlInput] = useState('');

  // Handle URL route checking (e.g. /admin or #admin)
  useEffect(() => {
    const handleLocationCheck = () => {
      const path = window.location.pathname;
      const hash = window.location.hash;
      if (path === '/admin' || hash === '#admin') {
        setActiveTab('admin');
      }
    };
    handleLocationCheck();
    window.addEventListener('popstate', handleLocationCheck);
    window.addEventListener('hashchange', handleLocationCheck);
    return () => {
      window.removeEventListener('popstate', handleLocationCheck);
      window.removeEventListener('hashchange', handleLocationCheck);
    };
  }, []);

  // Initialize Data
  useEffect(() => {
    setDeals(getStoredDeals());
  }, []);

  // Sync state helper
  const triggerNotification = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  // Backend Search State
  const [isSearching, setIsSearching] = useState(false);

  // Handle Search Execution from Airbnb Bar with full backend API integration
  const handleExecuteSearch = async (payload?: SearchPayload) => {
    setIsSearching(true);
    const searchPayload: SearchPayload = payload || {
      location: searchWhere,
      startDate: searchStartDate ? searchStartDate.toISOString().split('T')[0] : null,
      endDate: searchEndDate ? searchEndDate.toISOString().split('T')[0] : null,
      guests: searchGuestCount
    };

    try {
      const response = await fetch('/api/properties/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          location: searchPayload.location,
          startDate: searchPayload.startDate,
          endDate: searchPayload.endDate,
          guests: searchPayload.guests,
          statusFilter
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && Array.isArray(data.deals)) {
          setDeals(data.deals.map(normalizeDeal));
          setSearchQuery(searchPayload.location);
          const totalG = searchPayload.guests.adults + searchPayload.guests.children;
          triggerNotification(`Found ${data.count} luxury ${data.count === 1 ? 'villa' : 'villas'} matching "${searchPayload.location || 'All Locations'}".`, 'info');
        }
      } else {
        // Fallback for offline / static client filtering
        setSearchQuery(searchWhere);
      }
    } catch (err) {
      console.warn('Backend search API unreachable, using client state:', err);
      setSearchQuery(searchWhere);
    } finally {
      setIsSearching(false);
    }
  };

  // Filtered Deals
  const filteredDeals = useMemo(() => {
    return deals.filter(deal => {
      const q = (searchWhere || searchQuery).toLowerCase().trim();
      const matchesSearch = !q || 
                            deal.location.toLowerCase().includes(q) ||
                            deal.title.toLowerCase().includes(q) ||
                            (deal.description && deal.description.toLowerCase().includes(q));
      const matchesStatus = statusFilter === 'ALL' || deal.status === statusFilter;
      const matchesFavorite = !showFavoritesOnly || favorites.includes(deal.id);
      return matchesSearch && matchesStatus && matchesFavorite;
    });
  }, [deals, searchWhere, searchQuery, statusFilter, showFavoritesOnly, favorites]);

  // Open property details
  const handleOpenProspectus = (deal: Deal) => {
    setSelectedDeal(deal);
    setActiveImageIndex(0);
  };

  // Admin: Open Create Modal
  const handleOpenCreateModal = () => {
    setEditingDealId(null);
    setAdminForm({
      title: '',
      location: '',
      bedsBaths: '3 bed, 2 bath',
      squareFeet: '1,300',
      furnished: 'Yes',
      monthlyRent: '$2,400',
      leaseTerm: '12 months',
      projectedAnnualRevenue: '$58,000',
      estOccupancy: '70%',
      adr: '$220',
      securityDeposit: '$4,500',
      concessions: 'None',
      availability: 'ASAP',
      estNetMonthlyProfit: '~$1,800',
      totalCashToStart: '$9,500',
      specialRequirements: 'CGL insurance + COI',
      imageUrl: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80',
      images: [
        'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80'
      ],
      status: 'AVAILABLE',
      description: 'Newly sourced luxury property in high-demand vacation district.',
      listings: [
        { platform: 'Airbnb', url: 'https://www.airbnb.com', isActive: true },
        { platform: 'Vrbo', url: 'https://www.vrbo.com', isActive: true },
        { platform: 'Booking.com', url: 'https://www.booking.com', isActive: true }
      ]
    });
    setNewImageUrlInput('');
    setShowPropertyEditorModal(true);
  };

  // Admin: Open Edit Modal
  const handleOpenEditModal = (deal: Deal) => {
    setEditingDealId(deal.id);
    setAdminForm({
      title: deal.title || '',
      location: deal.location || '',
      bedsBaths: deal.bedsBaths || '',
      squareFeet: String(deal.squareFeet || ''),
      furnished: (deal.furnished as 'Yes' | 'No') || 'Yes',
      monthlyRent: deal.monthlyRent || '',
      leaseTerm: deal.leaseTerm || '12 months',
      projectedAnnualRevenue: deal.projectedAnnualRevenue || '',
      estOccupancy: deal.estOccupancy || '',
      adr: deal.adr || '',
      securityDeposit: deal.securityDeposit || '',
      concessions: deal.concessions || '',
      availability: deal.availability || '',
      estNetMonthlyProfit: deal.estNetMonthlyProfit || '',
      totalCashToStart: deal.totalCashToStart || '',
      specialRequirements: deal.specialRequirements || '',
      imageUrl: deal.imageUrl || '',
      images: Array.isArray(deal.images) && deal.images.length > 0 ? [...deal.images] : [deal.imageUrl],
      status: deal.status || 'AVAILABLE',
      description: deal.description || '',
      listings: Array.isArray(deal.listings) ? deal.listings.map(l => ({ ...l })) : []
    });
    setNewImageUrlInput('');
    setShowPropertyEditorModal(true);
  };

  // Admin: Save Deal
  const handleSaveProperty = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminForm.title || !adminForm.location || !adminForm.monthlyRent) {
      triggerNotification('Please complete required fields (Title, Location, Rent)', 'error');
      return;
    }

    const primaryImage = adminForm.images[0] || adminForm.imageUrl || 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80';

    let updatedDeals: Deal[] = [];
    if (editingDealId) {
      updatedDeals = deals.map(d => {
        if (d.id === editingDealId) {
          return {
            ...d,
            ...adminForm,
            imageUrl: primaryImage,
            images: adminForm.images.length > 0 ? adminForm.images : [primaryImage]
          };
        }
        return d;
      });
      triggerNotification('Property updated successfully!');
    } else {
      const newDeal: Deal = {
        id: 'prop-' + Date.now(),
        ...adminForm,
        imageUrl: primaryImage,
        images: adminForm.images.length > 0 ? adminForm.images : [primaryImage]
      };
      updatedDeals = [newDeal, ...deals];
      triggerNotification('New property added to catalog!');
    }

    setDeals(updatedDeals);
    saveDeals(updatedDeals);
    setShowPropertyEditorModal(false);
  };

  // Admin: Delete deal
  const handleDeleteProperty = (id: string) => {
    if (confirm('Are you sure you want to delete this property listing?')) {
      const updated = deals.filter(d => d.id !== id);
      setDeals(updated);
      saveDeals(updated);
      triggerNotification('Property deleted successfully.', 'info');
    }
  };

  // Admin: Toggle Property Status
  const handleToggleStatus = (id: string) => {
    const updated = deals.map(d => {
      if (d.id === id) {
        const nextStatus: Deal['status'] = 
          d.status === 'AVAILABLE' ? 'OCCUPIED' :
          d.status === 'OCCUPIED' ? 'UNDER CONTRACT' : 'AVAILABLE';
        return { ...d, status: nextStatus };
      }
      return d;
    });
    setDeals(updated);
    saveDeals(updated);
    triggerNotification('Property status updated.', 'info');
  };

  // Admin: Toggle Listing Active State directly from Overview
  const handleToggleListingActive = (dealId: string, platformIndex: number) => {
    const updated = deals.map(d => {
      if (d.id === dealId) {
        const newListings = d.listings.map((item, idx) => {
          if (idx === platformIndex) {
            return { ...item, isActive: !item.isActive };
          }
          return item;
        });
        return { ...d, listings: newListings };
      }
      return d;
    });
    setDeals(updated);
    saveDeals(updated);
    triggerNotification('Platform listing status toggled.', 'info');
  };

  // Admin: Reset deals
  const handleResetToDefault = () => {
    if (confirm('Reset property database back to default initial listings?')) {
      const defaults = resetDealsToDefault();
      setDeals(defaults);
      triggerNotification('Property database reset to default.', 'info');
    }
  };

  // Export JSON Schema
  const handleDownloadDealsJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(deals, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "kaizen_properties.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    triggerNotification('Property catalog exported to JSON.');
  };

  return (
    <div className="min-h-screen bg-[#08090E] text-slate-100 font-sans flex flex-col selection:bg-purple-600 selection:text-white">
      
      {/* Toast Notification Banner */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 px-5 py-4 rounded-xl shadow-2xl flex items-center gap-3 border backdrop-blur-xl transition-all duration-300 animate-slide-in ${
          notification.type === 'success' ? 'bg-[#121124]/90 border-emerald-500/40 text-emerald-300 shadow-emerald-950/50' :
          notification.type === 'error' ? 'bg-[#121124]/90 border-red-500/40 text-red-300 shadow-red-950/50' :
          'bg-[#121124]/90 border-purple-500/40 text-purple-200 shadow-purple-950/50'
        }`}>
          <div className={`w-2 h-2 rounded-full ${
            notification.type === 'success' ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]' :
            notification.type === 'error' ? 'bg-red-400 shadow-[0_0_8px_#f87171]' : 'bg-purple-400 shadow-[0_0_8px_#c084fc]'
          }`} />
          <p className="text-xs font-bold tracking-wide uppercase font-mono">
            {notification.message}
          </p>
        </div>
      )}

      {/* Main Header Navbar */}
      <header className="sticky top-0 z-40 bg-[#0A0B12]/85 backdrop-blur-xl border-b border-purple-900/25 shadow-2xl shadow-purple-950/20">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          
          {/* Kaizen Logo & Emblem */}
          <div 
            className="flex items-center gap-3.5 cursor-pointer group" 
            onClick={() => { setActiveTab('properties'); setShowFavoritesOnly(false); window.location.hash = ''; }}
          >
            <div className="w-11 h-11 bg-gradient-to-br from-purple-600 to-indigo-900 rounded-full flex items-center justify-center shadow-lg shadow-purple-900/30 border border-purple-400/30 group-hover:scale-105 transition-all duration-300">
              <span className="text-white font-black text-sm tracking-widest pl-0.5">K</span>
            </div>
            <div>
              <span className="font-extrabold text-lg tracking-[0.06em] text-white leading-none block font-serif">KAIZEN</span>
              <span className="text-[9px] text-purple-400 font-mono tracking-widest block uppercase mt-0.5">LUXURY STAYS</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-7 text-xs font-bold uppercase tracking-widest">
            <button 
              onClick={() => { setActiveTab('properties'); setShowFavoritesOnly(false); setSearchQuery(''); window.location.hash = ''; }}
              className={`pb-1 border-b-2 transition-colors ${activeTab === 'properties' && !showFavoritesOnly ? 'border-purple-500 text-purple-300' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
            >
              Properties
            </button>
            <button 
              onClick={() => { setActiveTab('blogs'); window.location.hash = ''; }}
              className={`pb-1 border-b-2 transition-colors ${activeTab === 'blogs' ? 'border-purple-500 text-purple-300' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
            >
              Blogs
            </button>
            <button 
              onClick={() => { setActiveTab('stories'); window.location.hash = ''; }}
              className={`pb-1 border-b-2 transition-colors ${activeTab === 'stories' ? 'border-purple-500 text-purple-300' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
            >
              Stories
            </button>
            <button 
              onClick={() => { setActiveTab('experiences'); window.location.hash = ''; }}
              className={`pb-1 border-b-2 transition-colors ${activeTab === 'experiences' ? 'border-purple-500 text-purple-300' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
            >
              Experience
            </button>
            <button 
              onClick={() => { setActiveTab('about'); window.location.hash = ''; }}
              className={`pb-1 border-b-2 transition-colors ${activeTab === 'about' ? 'border-purple-500 text-purple-300' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
            >
              About
            </button>
            
            {/* Admin Portal Tab */}
            <button 
              onClick={() => { setActiveTab('admin'); window.location.hash = 'admin'; }}
              className={`px-3 py-1.5 rounded-full text-[11px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5 border ${
                activeTab === 'admin' 
                  ? 'bg-purple-600 text-white border-purple-400 shadow-md shadow-purple-600/30' 
                  : 'bg-purple-950/40 text-purple-300 border-purple-800/40 hover:bg-purple-900/50'
              }`}
            >
              <Lock className="w-3 h-3" />
              Admin Portal
            </button>
          </nav>

          {/* Right Controls */}
          <div className="flex items-center gap-3">
            
            {/* Saved Favorites Trigger */}
            <button 
              onClick={() => {
                setShowFavoritesOnly(!showFavoritesOnly);
                setActiveTab('properties');
                if (!showFavoritesOnly) {
                  triggerNotification('Showing saved favorites!', 'info');
                } else {
                  triggerNotification('Showing all properties.', 'info');
                }
              }}
              className={`p-2.5 rounded-full transition-all duration-300 relative border ${
                showFavoritesOnly 
                  ? 'text-red-400 bg-red-950/50 border-red-500/40' 
                  : 'text-slate-400 hover:text-red-400 hover:bg-purple-950/40 border-transparent hover:border-purple-500/30'
              }`}
              title="Saved Favorites"
            >
              <Heart className={`w-5 h-5 ${showFavoritesOnly ? 'fill-current text-red-400' : ''}`} />
              {favorites.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-purple-600 text-white font-mono text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center border border-[#08090E]">
                  {favorites.length}
                </span>
              )}
            </button>

            {/* Quick Admin Toggle */}
            <button 
              onClick={() => {
                if (activeTab === 'admin') {
                  setActiveTab('properties');
                  window.location.hash = '';
                } else {
                  setActiveTab('admin');
                  window.location.hash = 'admin';
                }
              }}
              className="px-4 py-2 bg-[#121122] hover:bg-purple-950/60 border border-purple-900/40 text-purple-300 rounded-full text-[11px] font-bold uppercase tracking-wider transition-all flex items-center gap-1.5"
            >
              <Settings className="w-3.5 h-3.5 text-purple-400" />
              <span className="hidden sm:inline">{activeTab === 'admin' ? 'Exit Admin' : 'Admin Portal'}</span>
            </button>

          </div>

        </div>
      </header>

      {/* Amenities Ticker */}
      <div className="bg-[#0B0A14] py-3 border-b border-purple-900/30 relative overflow-hidden select-none flex items-center">
        <div className="flex whitespace-nowrap text-[9px] md:text-xs font-bold uppercase tracking-[0.14em] text-purple-300">
          <div className="inline-flex items-center shrink-0 gap-8 px-4 animate-marquee-reverse">
            <span>HEATED PRIVATE INFINITY POOLS</span>
            <span className="text-purple-600/60">✦</span>
            <span>24/7 PERSONAL CONCIERGE SERVICES</span>
            <span className="text-purple-600/60">✦</span>
            <span>DIRECT PLATFORM BOOKINGS (AIRBNB, VRBO, BOOKING.COM)</span>
            <span className="text-purple-600/60">✦</span>
            <span>SCOTTSDALE & PENSACOLA LUXURY ESTATES</span>
            <span className="text-purple-600/60">✦</span>
          </div>
          <div className="inline-flex items-center shrink-0 gap-8 px-4 animate-marquee-reverse" aria-hidden="true">
            <span>HEATED PRIVATE INFINITY POOLS</span>
            <span className="text-purple-600/60">✦</span>
            <span>24/7 PERSONAL CONCIERGE SERVICES</span>
            <span className="text-purple-600/60">✦</span>
            <span>DIRECT PLATFORM BOOKINGS (AIRBNB, VRBO, BOOKING.COM)</span>
            <span className="text-purple-600/60">✦</span>
            <span>SCOTTSDALE & PENSACOLA LUXURY ESTATES</span>
            <span className="text-purple-600/60">✦</span>
          </div>
        </div>
      </div>

      {/* Main Workspace Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8">

        {/* VIEW: ADMIN PORTAL (/admin) */}
        {activeTab === 'admin' ? (
          <div className="space-y-8 animate-fade-in">
            
            {/* Admin Header & Stats Banner */}
            <div className="glass-card rounded-3xl border border-purple-500/30 p-8 shadow-2xl relative overflow-hidden">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-950/80 rounded-full mb-3 border border-purple-500/30">
                    <Lock className="w-3.5 h-3.5 text-purple-400" />
                    <span className="text-[10px] font-bold text-purple-300 tracking-wider uppercase font-mono">Kaizen Property Portal</span>
                  </div>
                  <h1 className="text-3xl font-extrabold text-white font-serif tracking-tight">
                    Property Management Workspace
                  </h1>
                  <p className="text-slate-400 text-xs mt-1 max-w-xl leading-relaxed">
                    Manage luxury villa listings, specs, photo galleries, and platform booking links (Airbnb, Vrbo, Booking.com, Zillow, Direct Site). Changes update the customer portal instantly.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <button 
                    onClick={handleDownloadDealsJson}
                    className="px-4 py-2.5 bg-[#141226] hover:bg-purple-950 border border-purple-900/40 text-purple-300 rounded-xl text-xs font-bold transition-all flex items-center gap-2 font-mono"
                  >
                    <Download className="w-4 h-4 text-purple-400" />
                    Export Schema
                  </button>
                  <button 
                    onClick={handleResetToDefault}
                    className="px-4 py-2.5 bg-[#141226] hover:bg-red-950/60 border border-red-900/40 text-red-400 rounded-xl text-xs font-bold transition-all flex items-center gap-2 font-mono"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Reset Defaults
                  </button>
                  <button 
                    onClick={handleOpenCreateModal}
                    className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-purple-600/30 flex items-center gap-2 font-mono border border-purple-400/30"
                  >
                    <Plus className="w-4 h-4" />
                    + Add New Property
                  </button>
                </div>
              </div>

              {/* Quick High-Level Metrics Row */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-6 border-t border-purple-900/30">
                <div className="bg-[#0B0A12]/80 p-4 rounded-xl border border-purple-900/40">
                  <span className="text-[10px] text-slate-400 uppercase font-mono font-bold block">Total Properties</span>
                  <span className="text-2xl font-black text-white font-mono mt-0.5 block">{deals.length} Units</span>
                </div>
                <div className="bg-[#0B0A12]/80 p-4 rounded-xl border border-purple-900/40">
                  <span className="text-[10px] text-slate-400 uppercase font-mono font-bold block">Active Listings</span>
                  <span className="text-2xl font-black text-emerald-400 font-mono mt-0.5 block">
                    {deals.filter(d => d.status === 'AVAILABLE').length} Available
                  </span>
                </div>
                <div className="bg-[#0B0A12]/80 p-4 rounded-xl border border-purple-900/40">
                  <span className="text-[10px] text-slate-400 uppercase font-mono font-bold block">Active Platform Links</span>
                  <span className="text-2xl font-black text-purple-300 font-mono mt-0.5 block">
                    {deals.reduce((acc, d) => acc + d.listings.filter(l => l.isActive).length, 0)} Active
                  </span>
                </div>
                <div className="bg-[#0B0A12]/80 p-4 rounded-xl border border-purple-900/40">
                  <span className="text-[10px] text-slate-400 uppercase font-mono font-bold block">Total Net Monthly Yield</span>
                  <span className="text-2xl font-black text-emerald-400 font-mono mt-0.5 block">
                    ~${deals.reduce((acc, d) => acc + (parseInt(d.estNetMonthlyProfit.replace(/[^0-9]/g, '')) || 0), 0).toLocaleString()}/mo
                  </span>
                </div>
              </div>
            </div>

            {/* Property Overview Management Table */}
            <div className="glass-card rounded-3xl border border-purple-500/20 p-6 shadow-2xl space-y-6">
              
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h3 className="font-extrabold text-xl text-white font-serif flex items-center gap-2">
                    <Building className="w-5 h-5 text-purple-400" />
                    Property Management Table
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">Toggle platform links, edit financial specs, or add new luxury listings.</p>
                </div>

                <button 
                  onClick={handleOpenCreateModal}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 font-mono shadow-md"
                >
                  <Plus className="w-4 h-4" />
                  Add Property
                </button>
              </div>

              {/* Table */}
              <div className="overflow-x-auto rounded-2xl border border-purple-900/30 bg-[#0B0A12]/90">
                <table className="w-full text-left text-xs text-slate-300 border-collapse">
                  <thead>
                    <tr className="border-b border-purple-900/40 bg-[#121122] font-mono text-[11px] text-purple-300">
                      <th className="py-3.5 px-4 font-bold">Property & Address</th>
                      <th className="py-3.5 px-4 font-bold">Status / Occupancy</th>
                      <th className="py-3.5 px-4 font-bold">Monthly Rent</th>
                      <th className="py-3.5 px-4 font-bold">Net Monthly Profit</th>
                      <th className="py-3.5 px-4 font-bold">Active Platforms</th>
                      <th className="py-3.5 px-4 text-right font-bold">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-purple-900/20">
                    {deals.map(deal => {
                      const activeCount = deal.listings.filter(l => l.isActive).length;
                      return (
                        <tr key={deal.id} className="hover:bg-purple-900/10 transition-colors">
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              <img 
                                src={deal.imageUrl} 
                                alt={deal.title}
                                className="w-12 h-12 rounded-lg object-cover border border-purple-900/40 shrink-0"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80';
                                }}
                              />
                              <div>
                                <p className="font-extrabold text-white text-sm font-serif">{deal.title}</p>
                                <p className="text-[10px] text-purple-300/80 font-mono">{deal.location} • {deal.bedsBaths}</p>
                              </div>
                            </div>
                          </td>

                          <td className="py-3.5 px-4">
                            <button
                              onClick={() => handleToggleStatus(deal.id)}
                              className={`px-2.5 py-1 rounded-full text-[10px] font-black font-mono border transition-all ${
                                deal.status === 'AVAILABLE' ? 'bg-emerald-950/90 text-emerald-300 border-emerald-500/40 hover:bg-emerald-900' :
                                deal.status === 'OCCUPIED' ? 'bg-slate-900/90 text-slate-300 border-slate-700/40 hover:bg-slate-800' :
                                'bg-amber-950/90 text-amber-300 border-amber-500/40 hover:bg-amber-900'
                              }`}
                              title="Click to cycle status"
                            >
                              {deal.status}
                            </button>
                            <span className="block text-[10px] text-slate-400 font-mono mt-1">Est. Occ: {deal.estOccupancy}</span>
                          </td>

                          <td className="py-3.5 px-4 font-mono font-bold text-slate-200">
                            {deal.monthlyRent}
                          </td>

                          <td className="py-3.5 px-4 font-mono font-extrabold text-emerald-400">
                            {deal.estNetMonthlyProfit}
                          </td>

                          <td className="py-3.5 px-4">
                            <div className="flex flex-wrap items-center gap-1.5 max-w-[200px]">
                              {deal.listings.map((item, idx) => (
                                <button
                                  key={idx}
                                  onClick={() => handleToggleListingActive(deal.id, idx)}
                                  className={`px-2 py-0.5 rounded text-[9px] font-bold font-mono transition-all border ${
                                    item.isActive 
                                      ? 'bg-purple-950 text-purple-200 border-purple-500/40' 
                                      : 'bg-slate-900/50 text-slate-500 border-slate-800 line-through'
                                  }`}
                                  title={`Toggle ${item.platform} ON/OFF`}
                                >
                                  {item.platform}
                                </button>
                              ))}
                              {deal.listings.length === 0 && (
                                <span className="text-[10px] text-slate-500 italic font-mono">No platforms</span>
                              )}
                            </div>
                            <span className="text-[9px] text-slate-400 font-mono block mt-1">
                              {activeCount} of {deal.listings.length} Active
                            </span>
                          </td>

                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button 
                                onClick={() => handleOpenEditModal(deal)}
                                className="px-2.5 py-1.5 bg-[#141226] hover:bg-purple-900/60 text-purple-300 rounded-lg border border-purple-900/40 transition-colors flex items-center gap-1 font-mono text-[10px]"
                              >
                                <Edit className="w-3.5 h-3.5" />
                                Edit
                              </button>
                              <button 
                                onClick={() => handleDeleteProperty(deal.id)}
                                className="p-1.5 bg-[#141226] hover:bg-red-950/60 text-red-400 rounded-lg border border-red-900/40 transition-colors"
                                title="Delete Property"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

            </div>

          </div>
        ) : (

          /* CUSTOMER PUBLIC VIEW */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Brand Sidebar */}
            <section className="lg:col-span-4 glass-card rounded-3xl p-8 border border-purple-500/20 shadow-2xl flex flex-col justify-between min-h-[520px]">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-950/80 rounded-full mb-6 border border-purple-500/30">
                  <Sparkles className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
                  <span className="text-[10px] font-bold text-purple-300 tracking-wider uppercase font-mono">Kaizen Luxury Collection</span>
                </div>
                
                <h1 className="text-3xl sm:text-4xl font-extrabold leading-tight tracking-tight mb-4 text-white font-serif">
                  Luxury stays, <span className="text-purple-400 italic">unforgettable</span> memories.
                </h1>
                <p className="text-slate-400 text-sm leading-relaxed mb-8">
                  Indulge in our collection of meticulously curated luxury villas. Heated pools, private chefs, 24/7 concierge, and bespoke hospitality crafted to perfection.
                </p>
                
                {/* Navigation Doors */}
                <div className="space-y-3.5">
                  
                  <div 
                    onClick={() => { setActiveTab('properties'); setShowFavoritesOnly(false); }}
                    className={`p-4 rounded-xl border cursor-pointer group transition-all duration-300 ${
                      activeTab === 'properties' && !showFavoritesOnly
                        ? 'bg-purple-950/60 border-purple-500/60 shadow-lg shadow-purple-950/50 ring-1 ring-purple-500/40' 
                        : 'bg-[#121122]/60 border-purple-900/30 hover:border-purple-500/40 hover:bg-[#18162e]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[10px] font-extrabold text-purple-400 uppercase mb-1 tracking-widest font-mono">Collection Catalog</p>
                        <p className="text-sm font-bold text-white">Browse Luxury Villas</p>
                        <p className="text-xs text-slate-400 mt-1">Book directly on Airbnb, Vrbo, Booking.com, or Direct Site.</p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-purple-500/50 group-hover:text-purple-400 group-hover:translate-x-1 transition-all" />
                    </div>
                  </div>

                  <div 
                    onClick={() => setActiveTab('experiences')}
                    className={`p-4 rounded-xl border cursor-pointer group transition-all duration-300 ${
                      activeTab === 'experiences' 
                        ? 'bg-purple-950/60 border-purple-500/60 shadow-lg shadow-purple-950/50 ring-1 ring-purple-500/40' 
                        : 'bg-[#121122]/60 border-purple-900/30 hover:border-purple-500/40 hover:bg-[#18162e]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[10px] font-extrabold text-indigo-400 uppercase mb-1 tracking-widest font-mono">Our Experience</p>
                        <p className="text-sm font-bold text-white">Learn Guest Experience</p>
                        <p className="text-xs text-slate-400 mt-1">Private infinity pools, gourmet chefs, and custom catering.</p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-indigo-500/50 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
                    </div>
                  </div>

                </div>
              </div>

              {/* Trust Badge */}
              <div className="pt-8 mt-8 border-t border-purple-900/30 flex items-center justify-between text-xs text-slate-400">
                <span className="font-mono text-[11px] text-purple-300">Airbtics Analytics Verified</span>
                <span className="font-extrabold text-white font-serif">KAIZEN ESTATES</span>
              </div>
            </section>

            {/* Right Main Content Panel */}
            <section className="lg:col-span-8 space-y-6">

              {/* Mobile Filter Pill Tabs */}
              <div className="flex md:hidden overflow-x-auto pb-2 gap-2">
                <button 
                  onClick={() => { setActiveTab('properties'); setShowFavoritesOnly(false); setSearchQuery(''); }}
                  className={`px-4 py-2 rounded-lg text-xs font-bold flex-shrink-0 whitespace-nowrap transition-colors ${
                    activeTab === 'properties' && !showFavoritesOnly ? 'bg-purple-600 text-white shadow-md' : 'bg-[#121122] text-slate-300 border border-purple-900/30'
                  }`}
                >
                  Properties
                </button>
                <button 
                  onClick={() => setActiveTab('blogs')}
                  className={`px-4 py-2 rounded-lg text-xs font-bold flex-shrink-0 whitespace-nowrap transition-colors ${
                    activeTab === 'blogs' ? 'bg-purple-600 text-white shadow-md' : 'bg-[#121122] text-slate-300 border border-purple-900/30'
                  }`}
                >
                  Blogs
                </button>
                <button 
                  onClick={() => setActiveTab('stories')}
                  className={`px-4 py-2 rounded-lg text-xs font-bold flex-shrink-0 whitespace-nowrap transition-colors ${
                    activeTab === 'stories' ? 'bg-purple-600 text-white shadow-md' : 'bg-[#121122] text-slate-300 border border-purple-900/30'
                  }`}
                >
                  Stories
                </button>
                <button 
                  onClick={() => setActiveTab('experiences')}
                  className={`px-4 py-2 rounded-lg text-xs font-bold flex-shrink-0 whitespace-nowrap transition-colors ${
                    activeTab === 'experiences' ? 'bg-purple-600 text-white shadow-md' : 'bg-[#121122] text-slate-300 border border-purple-900/30'
                  }`}
                >
                  Experience
                </button>
                <button 
                  onClick={() => setActiveTab('about')}
                  className={`px-4 py-2 rounded-lg text-xs font-bold flex-shrink-0 whitespace-nowrap transition-colors ${
                    activeTab === 'about' ? 'bg-purple-600 text-white shadow-md' : 'bg-[#121122] text-slate-300 border border-purple-900/30'
                  }`}
                >
                  About
                </button>
              </div>

              {/* VIEW A: ACTIVE PROPERTIES CATALOG */}
              {activeTab === 'properties' && (
                <div className="space-y-6 animate-fade-in">
                  
                  {/* Airbnb-style Interactive Search Bar */}
                  <AirbnbSearchBar 
                    where={searchWhere}
                    setWhere={setSearchWhere}
                    whenDisplay={searchWhenDisplay}
                    setWhenDisplay={setSearchWhenDisplay}
                    startDate={searchStartDate}
                    setStartDate={setSearchStartDate}
                    endDate={searchEndDate}
                    setEndDate={setSearchEndDate}
                    guestCount={searchGuestCount}
                    setGuestCount={setSearchGuestCount}
                    onSearch={handleExecuteSearch}
                  />

                  {/* Status Filters Bar */}
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-xs font-mono text-slate-400">
                      Showing {filteredDeals.length} luxury {filteredDeals.length === 1 ? 'property' : 'properties'}
                    </span>
                    <div className="flex bg-[#121122] p-1 rounded-xl border border-purple-900/40">
                      {(['ALL', 'AVAILABLE', 'UNDER CONTRACT', 'UNDER REVIEW'] as const).map((filter) => (
                        <button
                          key={filter}
                          onClick={() => setStatusFilter(filter)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                            statusFilter === filter 
                              ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30' 
                              : 'text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          {filter === 'ALL' ? 'All Listings' : filter}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Deals Grid */}
                  {isSearching ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-pulse">
                      {[1, 2].map((n) => (
                        <div key={n} className="glass-card rounded-2xl border border-purple-900/40 p-5 space-y-4">
                          <div className="h-48 bg-purple-950/50 rounded-xl flex items-center justify-center">
                            <Sparkles className="w-8 h-8 text-purple-500/40 animate-spin" />
                          </div>
                          <div className="h-5 bg-purple-900/40 rounded w-2/3" />
                          <div className="h-4 bg-purple-900/30 rounded w-1/3" />
                          <div className="grid grid-cols-3 gap-2 pt-2">
                            <div className="h-12 bg-purple-950/40 rounded-lg" />
                            <div className="h-12 bg-purple-950/40 rounded-lg" />
                            <div className="h-12 bg-purple-950/40 rounded-lg" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : filteredDeals.length === 0 ? (
                    <div className="glass-card rounded-2xl border border-purple-500/20 p-12 text-center shadow-xl">
                      <Building className="w-12 h-12 text-purple-400/50 mx-auto mb-4" />
                      <p className="font-bold text-slate-200">No matching luxury villas found</p>
                      <p className="text-xs text-slate-400 mt-1">Try resetting the status filter or clearing your search term.</p>
                      <button 
                        onClick={() => { setSearchQuery(''); setStatusFilter('ALL'); setShowFavoritesOnly(false); }}
                        className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg text-xs font-bold hover:bg-purple-500 transition-colors shadow-lg shadow-purple-600/20"
                      >
                        Reset Filters
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {filteredDeals.map((deal) => {
                        const activeListings = deal.listings.filter(l => l.isActive && l.url);

                        return (
                          <div 
                            key={deal.id}
                            className="glass-card glass-card-hover rounded-2xl border border-purple-900/30 overflow-hidden flex flex-col transition-all duration-300 group"
                          >
                            {/* Thumbnail Header */}
                            <div className="h-48 bg-[#0A0914] relative overflow-hidden cursor-pointer" onClick={() => handleOpenProspectus(deal)}>
                              <img 
                                src={deal.imageUrl} 
                                alt={deal.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80';
                                }}
                              />
                              
                              <div className="absolute top-3 left-3 px-3 py-1 bg-[#090A10]/90 backdrop-blur rounded-full text-[10px] font-bold uppercase tracking-wider text-slate-200 shadow-md border border-purple-500/20 flex items-center gap-1.5 font-mono">
                                <MapPin className="w-3 h-3 text-purple-400" />
                                {deal.location}
                              </div>

                              <div className="absolute top-3 right-3 flex items-center gap-2">
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleFavorite(deal.id);
                                  }}
                                  className="p-2 bg-[#090A10]/90 backdrop-blur rounded-full text-slate-300 hover:text-red-400 hover:scale-110 shadow-md transition-all duration-300 border border-purple-500/20"
                                  title={favorites.includes(deal.id) ? "Remove from Saved" : "Save Property"}
                                >
                                  <Heart className={`w-3.5 h-3.5 ${favorites.includes(deal.id) ? 'fill-current text-red-400' : 'text-slate-400'}`} />
                                </button>
                                
                                <span className={`text-[10px] font-extrabold px-3 py-1 rounded-full shadow-md text-white font-mono ${
                                  deal.status === 'AVAILABLE' ? 'bg-emerald-600/90 border border-emerald-400/30' :
                                  deal.status === 'OCCUPIED' ? 'bg-slate-700/90 border border-slate-500/30' :
                                  'bg-purple-600/90 border border-purple-400/30'
                                }`}>
                                  {deal.status}
                                </span>
                              </div>
                              
                              <div className="absolute bottom-3 left-3 bg-[#090A10]/90 backdrop-blur border border-purple-500/20 px-2.5 py-1 rounded text-[10px] font-bold text-purple-200 uppercase tracking-wider font-mono">
                                {deal.bedsBaths} • {deal.squareFeet} SQFT
                              </div>
                            </div>

                            {/* Card Body */}
                            <div className="p-6 flex-1 flex flex-col justify-between">
                              <div>
                                <div 
                                  className="flex justify-between items-start gap-4 mb-3 cursor-pointer"
                                  onClick={() => handleOpenProspectus(deal)}
                                >
                                  <div>
                                    <h3 className="font-extrabold text-lg leading-tight text-white group-hover:text-purple-300 transition-colors">
                                      {deal.title}
                                    </h3>
                                    <p className="text-xs text-slate-400 mt-1">Furnished: {deal.furnished}</p>
                                  </div>
                                  <div className="text-right">
                                    <span className="text-[10px] font-extrabold text-slate-400 block uppercase tracking-wider font-mono">Rate</span>
                                    <span className="font-bold text-purple-300 text-base leading-none block font-mono">{deal.adr}/night</span>
                                  </div>
                                </div>

                                <p className="text-xs text-slate-300 leading-relaxed line-clamp-2 mb-4">
                                  {deal.description}
                                </p>
                              </div>

                              {/* Book / View on Platforms Section */}
                              <div className="pt-4 border-t border-purple-900/30">
                                <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 block mb-2 font-mono">
                                  Book / View on Platforms:
                                </span>

                                {activeListings.length > 0 ? (
                                  <div className="flex flex-wrap gap-2">
                                    {activeListings.map((listing, idx) => {
                                      const cfg = PLATFORM_CONFIG[listing.platform] || PLATFORM_CONFIG['Custom'];
                                      return (
                                        <a
                                          key={idx}
                                          href={listing.url}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 border transition-all duration-200 shadow-sm ${cfg.bg} ${cfg.text} ${cfg.border}`}
                                        >
                                          <span>{cfg.iconLabel}</span>
                                          <ExternalLink className="w-3 h-3 opacity-80" />
                                        </a>
                                      );
                                    })}
                                  </div>
                                ) : (
                                  <span className="inline-block px-3 py-1 rounded-full bg-slate-900/80 border border-slate-800 text-slate-400 text-xs font-mono font-medium">
                                    Currently Unavailable / Fully Booked
                                  </span>
                                )}

                                <button
                                  onClick={() => handleOpenProspectus(deal)}
                                  className="mt-4 w-full py-2 bg-purple-950/40 hover:bg-purple-900/40 border border-purple-500/30 text-purple-200 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 font-mono"
                                >
                                  <Eye className="w-3.5 h-3.5 text-purple-400" />
                                  View Full Details & Specs
                                </button>
                              </div>

                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Reassurance Footer */}
                  <div className="glass-card p-6 rounded-2xl border border-purple-500/20 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="flex -space-x-2.5 overflow-hidden">
                        <div className="inline-block h-8 w-8 rounded-full ring-2 ring-[#08090E] bg-purple-950 text-purple-300 border border-purple-500/30 flex items-center justify-center text-[10px] font-bold">SM</div>
                        <div className="inline-block h-8 w-8 rounded-full ring-2 ring-[#08090E] bg-indigo-950 text-indigo-300 border border-indigo-500/30 flex items-center justify-center text-[10px] font-bold">JD</div>
                        <div className="inline-block h-8 w-8 rounded-full ring-2 ring-[#08090E] bg-emerald-950 text-emerald-300 border border-emerald-500/30 flex items-center justify-center text-[10px] font-bold">LH</div>
                      </div>
                      <p className="text-xs text-slate-400 font-medium">
                        Guiding <span className="font-bold text-white">100% verified guest stays</span> across Arizona and Florida.
                      </p>
                    </div>
                    <div className="text-[10px] font-bold text-purple-400 font-mono tracking-widest uppercase">
                      KAIZEN ESTATES • LUXURY REDEFINED
                    </div>
                  </div>

                </div>
              )}

              {/* VIEW B: BLOGS */}
              {activeTab === 'blogs' && (
                <div className="space-y-8 animate-fade-in">
                  <div className="glass-card rounded-3xl border border-purple-500/20 p-8 shadow-xl">
                    <span className="text-[10px] font-extrabold text-purple-300 bg-purple-950/80 px-3 py-1 rounded-full uppercase tracking-widest border border-purple-500/30 font-mono">
                      Kaizen Editorial
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-4 font-serif">
                      The Art of Luxury Vacation Rentals & Design
                    </h2>
                    <p className="text-slate-400 text-sm mt-2 leading-relaxed">
                      Exclusive columns on luxury real estate curation, interior design secrets, and guest experience benchmarks.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="glass-card glass-card-hover rounded-2xl border border-purple-900/30 overflow-hidden flex flex-col justify-between transition-all shadow-xl">
                      <div>
                        <div className="h-40 relative">
                          <img 
                            src="https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=600&q=80" 
                            alt="Luxury Scottsdale Villa design" 
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="p-5 space-y-2">
                          <p className="text-[10px] text-purple-400 font-bold uppercase tracking-wider font-mono">July 18, 2026 • 5 min read</p>
                          <h3 className="font-extrabold text-base text-white">
                            Curating Kaizen Scottsdale: Inside Our Design Playbook
                          </h3>
                          <p className="text-xs text-slate-400 leading-relaxed line-clamp-3">
                            How we integrated custom local cactus gardens, heated infinity pools, and warm neutral linens to boost Scottsdale guest satisfaction.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="glass-card glass-card-hover rounded-2xl border border-purple-900/30 overflow-hidden flex flex-col justify-between transition-all shadow-xl">
                      <div>
                        <div className="h-40 relative">
                          <img 
                            src="https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=600&q=80" 
                            alt="Private Chef Table Experience" 
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="p-5 space-y-2">
                          <p className="text-[10px] text-purple-400 font-bold uppercase tracking-wider font-mono">July 14, 2026 • 7 min read</p>
                          <h3 className="font-extrabold text-base text-white">
                            The Jain-Friendly Gourmet Advantage in Modern Luxury
                          </h3>
                          <p className="text-xs text-slate-400 leading-relaxed line-clamp-3">
                            A 5-star trip is more than just handing over a check-in code. We explore how catering to specialized dietary travelers secures top reviews.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="glass-card glass-card-hover rounded-2xl border border-purple-900/30 overflow-hidden flex flex-col justify-between transition-all shadow-xl">
                      <div>
                        <div className="h-40 relative">
                          <img 
                            src="https://images.unsplash.com/photo-1450622238302-a223f43d35fc?auto=format&fit=crop&w=600&q=80" 
                            alt="Florida Coastal Villa" 
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="p-5 space-y-2">
                          <p className="text-[10px] text-purple-400 font-bold uppercase tracking-wider font-mono">June 29, 2026 • 6 min read</p>
                          <h3 className="font-extrabold text-base text-white">
                            Pensacola Coastal Living: High Amenities & Unmatched Comfort
                          </h3>
                          <p className="text-xs text-slate-400 leading-relaxed line-clamp-3">
                            Coastal luxury requires absolute precision in design and private beach club access.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* VIEW C: STORIES */}
              {activeTab === 'stories' && (
                <div className="space-y-8 animate-fade-in">
                  <div className="glass-card rounded-3xl border border-purple-500/20 p-8 shadow-xl">
                    <span className="text-[10px] font-extrabold text-purple-300 bg-purple-950/80 px-3 py-1 rounded-full uppercase tracking-widest border border-purple-500/30 font-mono">
                      Guest Chronicles
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-4 font-serif">
                      The Stories Behind Kaizen
                    </h2>
                    <p className="text-slate-400 text-sm mt-2 leading-relaxed">
                      Read real testimonials from travelers who have experienced the Kaizen difference.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="glass-card p-6 rounded-2xl border border-purple-900/30 flex flex-col justify-between space-y-4">
                      <p className="text-xs text-slate-300 leading-relaxed italic">
                        "Finding rental homes that accommodate specialized dietary needs and custom concierge dining is challenging. Kaizen curated a flawless family experience for us in Scottsdale. The absolute gold standard."
                      </p>
                      <div className="flex items-center gap-3 pt-4 border-t border-purple-900/30">
                        <div className="w-10 h-10 rounded-full bg-purple-950 text-purple-300 font-bold flex items-center justify-center font-mono text-xs border border-purple-500/30">
                          AK
                        </div>
                        <div>
                          <p className="font-extrabold text-white text-xs">Anand Kapoor</p>
                          <p className="text-[10px] text-purple-300 font-mono">Scottsdale Villa Guest</p>
                        </div>
                      </div>
                    </div>

                    <div className="glass-card p-6 rounded-2xl border border-purple-900/30 flex flex-col justify-between space-y-4">
                      <p className="text-xs text-slate-300 leading-relaxed italic">
                        "Kaizen handles designer styling, 24/7 guest check-ins, and bespoke concierge requests effortlessly. Highly recommend their collection."
                      </p>
                      <div className="flex items-center gap-3 pt-4 border-t border-purple-900/30">
                        <div className="w-10 h-10 rounded-full bg-indigo-950 text-indigo-300 font-bold flex items-center justify-center font-mono text-xs border border-indigo-500/30">
                          MR
                        </div>
                        <div>
                          <p className="font-extrabold text-white text-xs">Marcus Roberts</p>
                          <p className="text-[10px] text-purple-300 font-mono">Pensacola Retreat Guest</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* VIEW D: EXPERIENCE */}
              {activeTab === 'experiences' && (
                <div className="space-y-8 animate-fade-in">
                  <div className="glass-card rounded-3xl border border-purple-500/20 p-8 shadow-xl">
                    <span className="text-[10px] font-extrabold text-purple-300 bg-purple-950/80 px-3 py-1 rounded-full uppercase tracking-widest border border-purple-500/30 font-mono">
                      The Kaizen Signature
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-4 font-serif">
                      Elevating Travel into Artistry
                    </h2>
                    <p className="text-slate-400 text-sm mt-2 leading-relaxed">
                      We believe hospitality lies in custom, invisible luxuries. At every Kaizen villa, your trip is accompanied by curated personal services, premium amenities, and dedicated concierge lines.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="glass-card p-6 rounded-2xl border border-purple-900/30 space-y-3">
                      <Sparkles className="w-6 h-6 text-purple-400" />
                      <h3 className="font-extrabold text-base text-white font-serif">Heated Infinity Pools</h3>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        Year-round temperature control, resort lighting, and private cabana loungers.
                      </p>
                    </div>

                    <div className="glass-card p-6 rounded-2xl border border-purple-900/30 space-y-3">
                      <Award className="w-6 h-6 text-indigo-400" />
                      <h3 className="font-extrabold text-base text-white font-serif">24/7 Concierge Service</h3>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        Instant WhatsApp communication for dining reservations, airport transfers, and private chefs.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* VIEW E: ABOUT */}
              {activeTab === 'about' && (
                <div className="space-y-8 animate-fade-in">
                  <div className="glass-card rounded-3xl border border-purple-500/20 p-8 shadow-xl">
                    <span className="text-[10px] font-extrabold text-purple-300 bg-purple-950/80 px-3 py-1 rounded-full uppercase tracking-widest border border-purple-500/30 font-mono">
                      The Kaizen Philosophy
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-4 font-serif">
                      Continuous Improvement. Exceptional Hospitality.
                    </h2>
                    <p className="text-slate-400 text-sm mt-2 leading-relaxed">
                      At Kaizen, we merge high-end, culturally-inclusive hospitality with continuous operational improvement.
                    </p>
                  </div>
                </div>
              )}

            </section>

          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="bg-[#0B0A12]/90 border-t border-purple-900/40 mt-16 py-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-purple-600 rounded flex items-center justify-center shadow-lg shadow-purple-600/30">
              <span className="text-white font-bold text-xs font-mono">K</span>
            </div>
            <div>
              <p className="font-extrabold text-sm text-white font-serif tracking-wide">KAIZEN LUXURY ESTATES</p>
              <p className="text-[10px] text-purple-300/80 font-mono tracking-widest leading-none">PREMIUM VACATION RENTALS</p>
            </div>
          </div>

          <div className="flex items-center gap-6 text-xs text-slate-400 font-bold font-mono">
            <button onClick={() => { setActiveTab('properties'); window.location.hash = ''; }} className="hover:text-purple-300 transition-colors">Properties</button>
            <button onClick={() => { setActiveTab('experiences'); window.location.hash = ''; }} className="hover:text-purple-300 transition-colors">Experience</button>
            <button onClick={() => { setActiveTab('about'); window.location.hash = ''; }} className="hover:text-purple-300 transition-colors">About Us</button>
            <button onClick={() => { setActiveTab('admin'); window.location.hash = 'admin'; }} className="hover:text-purple-300 text-purple-300 border border-purple-800/40 bg-[#141226] px-3 py-1 rounded-full transition-colors flex items-center gap-1">
              <Lock className="w-3 h-3 text-purple-400" />
              Admin Portal
            </button>
          </div>

          <p className="text-[10px] text-slate-400 font-mono text-center md:text-right">
            © 2026 Kaizen Luxury Real Estate LLC. All rights reserved.
          </p>
        </div>
      </footer>


      {/* ==========================================
          MODAL A: PROPERTY DETAILS & PLATFORMS
         ========================================== */}
      {selectedDeal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-card rounded-3xl max-w-2xl w-full border border-purple-500/30 shadow-2xl overflow-hidden flex flex-col animate-scale-in">
            
            {/* Header */}
            <div className="bg-[#0B0A12] p-6 text-white flex justify-between items-start border-b border-purple-900/40">
              <div>
                <span className="text-[10px] font-mono tracking-widest uppercase text-purple-300 bg-purple-950 px-2.5 py-1 rounded-full font-bold border border-purple-500/30">
                  Luxury Villa Details
                </span>
                <h3 className="text-xl font-extrabold tracking-tight mt-2 font-serif">{selectedDeal.title}</h3>
                <p className="text-xs text-slate-400 mt-1 flex items-center gap-1 font-mono">
                  <MapPin className="w-3 h-3 text-purple-400" />
                  {selectedDeal.location} • {selectedDeal.bedsBaths} • {selectedDeal.squareFeet} SQFT
                </p>
              </div>
              <button 
                onClick={() => setSelectedDeal(null)}
                className="p-1.5 bg-purple-950/80 hover:bg-purple-900 text-purple-300 rounded-full transition-colors border border-purple-500/30"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content area */}
            <div className="p-6 overflow-y-auto space-y-6 max-h-[600px]">
              
              {/* Photo Gallery Viewer */}
              <div>
                <div className="h-64 rounded-2xl overflow-hidden relative border border-purple-900/40 bg-[#0B0A12]">
                  <img 
                    src={selectedDeal.images[activeImageIndex] || selectedDeal.imageUrl} 
                    alt={selectedDeal.title}
                    className="w-full h-full object-cover transition-all duration-300"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80';
                    }}
                  />

                  {selectedDeal.images.length > 1 && (
                    <>
                      <button 
                        onClick={() => setActiveImageIndex((prev) => (prev > 0 ? prev - 1 : selectedDeal.images.length - 1))}
                        className="absolute left-3 top-1/2 -translate-y-1/2 p-2 bg-black/60 hover:bg-black/80 text-white rounded-full transition-all border border-white/20"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => setActiveImageIndex((prev) => (prev < selectedDeal.images.length - 1 ? prev + 1 : 0))}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-black/60 hover:bg-black/80 text-white rounded-full transition-all border border-white/20"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </>
                  )}

                  <div className="absolute bottom-3 right-3 bg-black/70 backdrop-blur px-2.5 py-1 rounded text-[10px] font-mono text-slate-200">
                    {activeImageIndex + 1} / {selectedDeal.images.length || 1} Photos
                  </div>
                </div>

                {/* Thumbnails strip */}
                {selectedDeal.images.length > 1 && (
                  <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
                    {selectedDeal.images.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActiveImageIndex(idx)}
                        className={`w-16 h-12 rounded-lg overflow-hidden border-2 shrink-0 transition-all ${
                          activeImageIndex === idx ? 'border-purple-500 scale-105' : 'border-purple-900/40 opacity-60 hover:opacity-100'
                        }`}
                      >
                        <img src={img} alt="" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Book / View on Platforms - CRUCIAL CUSTOMER SECTION */}
              <div className="bg-[#0B0A12] p-5 rounded-2xl border border-purple-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-extrabold text-white font-serif flex items-center gap-1.5">
                      <Globe className="w-4 h-4 text-purple-400" />
                      Book / View on Platforms
                    </h4>
                    <p className="text-xs text-slate-400 mt-0.5">Select your preferred platform below to open the official active listing directly.</p>
                  </div>
                  <span className="px-2.5 py-1 bg-purple-950 text-purple-300 text-[10px] font-mono font-bold rounded-full border border-purple-500/30">
                    LIVE LISTINGS
                  </span>
                </div>

                <div className="pt-2">
                  {selectedDeal.listings.filter(l => l.isActive && l.url).length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {selectedDeal.listings.filter(l => l.isActive && l.url).map((listing, idx) => {
                        const cfg = PLATFORM_CONFIG[listing.platform] || PLATFORM_CONFIG['Custom'];
                        return (
                          <a
                            key={idx}
                            href={listing.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`p-3.5 rounded-xl border text-xs font-extrabold flex items-center justify-between transition-all duration-200 shadow-md ${cfg.bg} ${cfg.text} ${cfg.border}`}
                          >
                            <span className="text-sm">{cfg.iconLabel}</span>
                            <div className="flex items-center gap-1 text-[11px] opacity-90 font-mono">
                              <span>Open Listing</span>
                              <ExternalLink className="w-3.5 h-3.5" />
                            </div>
                          </a>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
                      <span className="px-3 py-1 rounded-full bg-slate-950 text-slate-400 text-xs font-mono font-bold inline-block">
                        Currently Unavailable / Fully Booked
                      </span>
                      <p className="text-xs text-slate-500 mt-2">This property is currently not accepting new platform reservations.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Description text */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-purple-300/80 mb-1.5 font-mono">Property Overview</h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {selectedDeal.description || 'This vetted corporate sublease property exhibits highly robust short-term rental performance indicators. Located in an area of exceptional tourism density with clear local HOA allowance.'}
                </p>
              </div>

              {/* Full Specs Table Grid */}
              <div className="bg-[#0B0A12]/80 p-4 rounded-xl border border-purple-900/40">
                <h4 className="text-xs font-bold uppercase tracking-wider text-purple-300/80 mb-3 font-mono">Property Specifications</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-4 gap-x-6 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase font-mono">Nightly Rate</span>
                    <span className="font-extrabold text-white text-sm font-mono">{selectedDeal.adr}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase font-mono">Beds & Baths</span>
                    <span className="font-bold text-slate-200">{selectedDeal.bedsBaths}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase font-mono">Furnished Setup</span>
                    <span className="font-bold text-slate-200">{selectedDeal.furnished}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase font-mono">Est Occupancy</span>
                    <span className="font-bold text-slate-200">{selectedDeal.estOccupancy}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase font-mono">Square Footage</span>
                    <span className="font-bold text-slate-200">{selectedDeal.squareFeet} SQFT</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase font-mono">Earliest Availability</span>
                    <span className="font-extrabold text-purple-300 font-mono">{selectedDeal.availability}</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Bottom bar */}
            <div className="bg-[#0B0A12] p-5 border-t border-purple-900/40 flex items-center justify-between">
              <span className="text-[10px] text-slate-400 font-mono">Kaizen Luxury Estates • Verified Property</span>
              <button 
                onClick={() => setSelectedDeal(null)}
                className="px-5 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-bold transition-all font-mono shadow-md"
              >
                Close Window
              </button>
            </div>

          </div>
        </div>
      )}


      {/* ==========================================
          MODAL B: ADMIN PROPERTY EDITOR MODAL
         ========================================== */}
      {showPropertyEditorModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-card rounded-3xl max-w-3xl w-full border border-purple-500/40 shadow-2xl overflow-hidden flex flex-col animate-scale-in text-white">
            
            {/* Header */}
            <div className="bg-[#0B0A12] p-6 text-white flex justify-between items-center border-b border-purple-900/40">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-purple-950 rounded-lg border border-purple-500/30 text-purple-300">
                  <Building className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold font-serif">
                    {editingDealId ? `Edit Property: ${adminForm.title}` : 'Create New Luxury Property'}
                  </h3>
                  <p className="text-xs text-slate-400 font-mono">Update specs, images, and external platform listing links.</p>
                </div>
              </div>
              <button 
                onClick={() => setShowPropertyEditorModal(false)}
                className="p-1.5 bg-purple-950/80 hover:bg-purple-900 text-purple-300 rounded-full transition-colors border border-purple-500/30"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form Container */}
            <form onSubmit={handleSaveProperty} className="p-6 overflow-y-auto space-y-6 max-h-[70vh]">
              
              {/* Section 1: Core Specs */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-purple-300 uppercase tracking-widest font-mono border-b border-purple-900/40 pb-1">
                  1. Core Property Specs
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1 font-mono">Property Title / Name *</label>
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. Coastal Modern Retreat"
                      value={adminForm.title}
                      onChange={(e) => setAdminForm({...adminForm, title: e.target.value})}
                      className="w-full px-3.5 py-2.5 bg-[#141226] border border-purple-900/40 rounded-xl text-white text-xs focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1 font-mono">Location / Address *</label>
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. Pensacola, FL"
                      value={adminForm.location}
                      onChange={(e) => setAdminForm({...adminForm, location: e.target.value})}
                      className="w-full px-3.5 py-2.5 bg-[#141226] border border-purple-900/40 rounded-xl text-white text-xs focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1 font-mono">Beds / Baths</label>
                    <input 
                      type="text" 
                      placeholder="3 bed, 2 bath"
                      value={adminForm.bedsBaths}
                      onChange={(e) => setAdminForm({...adminForm, bedsBaths: e.target.value})}
                      className="w-full px-3 py-2 bg-[#141226] border border-purple-900/40 rounded-xl text-white text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1 font-mono">Square Feet</label>
                    <input 
                      type="text" 
                      placeholder="1,300"
                      value={adminForm.squareFeet}
                      onChange={(e) => setAdminForm({...adminForm, squareFeet: e.target.value})}
                      className="w-full px-3 py-2 bg-[#141226] border border-purple-900/40 rounded-xl text-white text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1 font-mono">Furnished Status</label>
                    <select
                      value={adminForm.furnished}
                      onChange={(e) => setAdminForm({...adminForm, furnished: e.target.value as 'Yes' | 'No'})}
                      className="w-full px-3 py-2 bg-[#141226] border border-purple-900/40 rounded-xl text-white text-xs"
                    >
                      <option value="Yes">Yes (Furnished)</option>
                      <option value="No">No (Unfurnished)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1 font-mono">Status</label>
                    <select
                      value={adminForm.status}
                      onChange={(e) => setAdminForm({...adminForm, status: e.target.value as any})}
                      className="w-full px-3 py-2 bg-[#141226] border border-purple-900/40 rounded-xl text-white text-xs"
                    >
                      <option value="AVAILABLE">AVAILABLE</option>
                      <option value="OCCUPIED">OCCUPIED</option>
                      <option value="UNDER CONTRACT">UNDER CONTRACT</option>
                      <option value="UNDER REVIEW">UNDER REVIEW</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Section 2: Financials & Analytics */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-purple-300 uppercase tracking-widest font-mono border-b border-purple-900/40 pb-1">
                  2. Financials & Analytics (Airbtics)
                </h4>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1 font-mono">Monthly Rent *</label>
                    <input 
                      type="text" 
                      required
                      placeholder="$2,200"
                      value={adminForm.monthlyRent}
                      onChange={(e) => setAdminForm({...adminForm, monthlyRent: e.target.value})}
                      className="w-full px-3 py-2 bg-[#141226] border border-purple-900/40 rounded-xl text-white text-xs font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1 font-mono">Net Monthly Profit</label>
                    <input 
                      type="text" 
                      placeholder="~$1,700"
                      value={adminForm.estNetMonthlyProfit}
                      onChange={(e) => setAdminForm({...adminForm, estNetMonthlyProfit: e.target.value})}
                      className="w-full px-3 py-2 bg-[#141226] border border-purple-900/40 rounded-xl text-emerald-400 text-xs font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1 font-mono">Nightly Rate (ADR)</label>
                    <input 
                      type="text" 
                      placeholder="$215"
                      value={adminForm.adr}
                      onChange={(e) => setAdminForm({...adminForm, adr: e.target.value})}
                      className="w-full px-3 py-2 bg-[#141226] border border-purple-900/40 rounded-xl text-white text-xs font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1 font-mono">Est Occupancy</label>
                    <input 
                      type="text" 
                      placeholder="68%"
                      value={adminForm.estOccupancy}
                      onChange={(e) => setAdminForm({...adminForm, estOccupancy: e.target.value})}
                      className="w-full px-3 py-2 bg-[#141226] border border-purple-900/40 rounded-xl text-white text-xs font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1 font-mono">Proj. Annual Revenue</label>
                    <input 
                      type="text" 
                      placeholder="$55,683"
                      value={adminForm.projectedAnnualRevenue}
                      onChange={(e) => setAdminForm({...adminForm, projectedAnnualRevenue: e.target.value})}
                      className="w-full px-3 py-2 bg-[#141226] border border-purple-900/40 rounded-xl text-white text-xs font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1 font-mono">Total Cash To Start</label>
                    <input 
                      type="text" 
                      placeholder="$9,400"
                      value={adminForm.totalCashToStart}
                      onChange={(e) => setAdminForm({...adminForm, totalCashToStart: e.target.value})}
                      className="w-full px-3 py-2 bg-[#141226] border border-purple-900/40 rounded-xl text-yellow-300 text-xs font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1 font-mono">Lease Term</label>
                    <input 
                      type="text" 
                      placeholder="12 months"
                      value={adminForm.leaseTerm}
                      onChange={(e) => setAdminForm({...adminForm, leaseTerm: e.target.value})}
                      className="w-full px-3 py-2 bg-[#141226] border border-purple-900/40 rounded-xl text-white text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Section 3: Image URL Manager */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-purple-300 uppercase tracking-widest font-mono border-b border-purple-900/40 pb-1 flex items-center justify-between">
                  <span>3. Image Gallery Manager</span>
                  <span className="text-[10px] text-slate-400 font-normal">({adminForm.images.length} Photos)</span>
                </h4>

                {/* Current Image List */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {adminForm.images.map((imgUrl, idx) => (
                    <div key={idx} className="relative group rounded-xl overflow-hidden border border-purple-900/40 h-24 bg-[#0B0A12]">
                      <img src={imgUrl} alt="" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                        <button 
                          type="button"
                          onClick={() => {
                            const filtered = adminForm.images.filter((_, i) => i !== idx);
                            setAdminForm({ ...adminForm, images: filtered });
                          }}
                          className="p-1.5 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs"
                          title="Remove photo"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      {idx === 0 && (
                        <span className="absolute bottom-1 left-1 bg-purple-600 text-white text-[8px] font-mono font-bold px-1.5 py-0.5 rounded">
                          PRIMARY
                        </span>
                      )}
                    </div>
                  ))}
                </div>

                {/* Add new image input */}
                <div className="flex gap-2">
                  <input 
                    type="url" 
                    placeholder="Paste image URL (https://...)"
                    value={newImageUrlInput}
                    onChange={(e) => setNewImageUrlInput(e.target.value)}
                    className="flex-1 px-3.5 py-2 bg-[#141226] border border-purple-900/40 rounded-xl text-white text-xs font-mono placeholder-slate-500"
                  />
                  <button 
                    type="button"
                    onClick={() => {
                      if (newImageUrlInput.trim()) {
                        setAdminForm({
                          ...adminForm,
                          images: [...adminForm.images, newImageUrlInput.trim()]
                        });
                        setNewImageUrlInput('');
                      }
                    }}
                    className="px-4 py-2 bg-purple-950 hover:bg-purple-900 text-purple-200 border border-purple-500/30 rounded-xl text-xs font-bold font-mono"
                  >
                    + Add Photo
                  </button>
                </div>
              </div>

              {/* Section 4: Platform Listing Link Manager (CRUCIAL) */}
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-purple-900/40 pb-1">
                  <h4 className="text-xs font-bold text-purple-300 uppercase tracking-widest font-mono">
                    4. Platform Listing Link Manager
                  </h4>
                  <button 
                    type="button"
                    onClick={() => {
                      setAdminForm({
                        ...adminForm,
                        listings: [
                          ...adminForm.listings,
                          { platform: 'Airbnb', url: 'https://www.airbnb.com', isActive: true }
                        ]
                      });
                    }}
                    className="px-3 py-1 bg-purple-900/60 hover:bg-purple-800 text-purple-200 rounded-lg text-[10px] font-bold font-mono border border-purple-500/30 flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" /> Add Platform
                  </button>
                </div>

                <div className="space-y-3">
                  {adminForm.listings.map((item, idx) => (
                    <div key={idx} className="p-3 bg-[#0B0A12]/90 rounded-xl border border-purple-900/40 flex flex-col sm:flex-row items-start sm:items-center gap-3">
                      
                      {/* Platform Choice */}
                      <select
                        value={item.platform}
                        onChange={(e) => {
                          const updated = [...adminForm.listings];
                          updated[idx].platform = e.target.value;
                          setAdminForm({ ...adminForm, listings: updated });
                        }}
                        className="px-3 py-2 bg-[#141226] border border-purple-900/40 rounded-lg text-white text-xs font-bold font-mono"
                      >
                        {AVAILABLE_PLATFORMS.map(p => (
                          <option key={p} value={p}>{p}</option>
                        ))}
                      </select>

                      {/* URL Input */}
                      <input 
                        type="url" 
                        required
                        placeholder="Listing URL (https://...)"
                        value={item.url}
                        onChange={(e) => {
                          const updated = [...adminForm.listings];
                          updated[idx].url = e.target.value;
                          setAdminForm({ ...adminForm, listings: updated });
                        }}
                        className="flex-1 w-full px-3 py-2 bg-[#141226] border border-purple-900/40 rounded-lg text-white text-xs font-mono placeholder-slate-500"
                      />

                      {/* Active Toggle Switch */}
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            const updated = [...adminForm.listings];
                            updated[idx].isActive = !updated[idx].isActive;
                            setAdminForm({ ...adminForm, listings: updated });
                          }}
                          className={`px-3 py-1.5 rounded-lg text-[10px] font-mono font-bold transition-all border flex items-center gap-1 ${
                            item.isActive 
                              ? 'bg-emerald-950 text-emerald-300 border-emerald-500/40' 
                              : 'bg-slate-900 text-slate-500 border-slate-800'
                          }`}
                        >
                          {item.isActive ? <Check className="w-3 h-3 text-emerald-400" /> : null}
                          {item.isActive ? 'Active' : 'Inactive'}
                        </button>

                        <button 
                          type="button"
                          onClick={() => {
                            const updated = adminForm.listings.filter((_, i) => i !== idx);
                            setAdminForm({ ...adminForm, listings: updated });
                          }}
                          className="p-1.5 bg-[#141226] hover:bg-red-950 text-red-400 rounded-lg border border-red-900/40"
                          title="Remove platform link"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                    </div>
                  ))}

                  {adminForm.listings.length === 0 && (
                    <div className="p-4 rounded-xl bg-[#0B0A12] border border-purple-900/40 text-center text-xs text-slate-500 italic">
                      No platform listing links added yet. Click "+ Add Platform" to add Airbnb, Vrbo, etc.
                    </div>
                  )}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1 font-mono">Property Description</label>
                <textarea 
                  rows={3}
                  placeholder="Detail the property layout, location perks, and key guest amenities..."
                  value={adminForm.description}
                  onChange={(e) => setAdminForm({...adminForm, description: e.target.value})}
                  className="w-full px-3.5 py-2.5 bg-[#141226] border border-purple-900/40 rounded-xl text-white text-xs focus:outline-none focus:border-purple-500"
                />
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-purple-900/40 flex items-center justify-end gap-3 font-mono">
                <button 
                  type="button"
                  onClick={() => setShowPropertyEditorModal(false)}
                  className="px-5 py-2.5 bg-[#141226] hover:bg-purple-950 border border-purple-900/40 text-slate-300 rounded-xl text-xs font-bold transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-purple-600/30"
                >
                  {editingDealId ? 'Save Changes' : 'Create Property'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
