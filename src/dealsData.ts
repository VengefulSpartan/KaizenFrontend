/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface PlatformListing {
  platform: 'Airbnb' | 'Vrbo' | 'Booking.com' | 'Zillow' | 'Direct Website' | 'Custom' | string;
  url: string;
  isActive: boolean;
}

export interface Deal {
  id: string;
  title: string;
  location: string;
  bedsBaths: string;
  squareFeet: string | number;
  furnished: 'Yes' | 'No' | boolean;
  monthlyRent: string;
  leaseTerm: string;
  projectedAnnualRevenue: string; // e.g. "$55,683"
  estOccupancy: string;          // e.g. "68%"
  adr: string;                   // e.g. "$215"
  securityDeposit: string;
  concessions: string;
  availability: string;
  estNetMonthlyProfit: string;   // e.g. "~$1,700"
  totalCashToStart: string;      // e.g. "$9,400"
  specialRequirements: string;
  imageUrl: string;
  images: string[];
  status: 'AVAILABLE' | 'UNDER CONTRACT' | 'UNDER REVIEW' | 'OCCUPIED' | 'MAINTENANCE';
  description?: string;
  listings: PlatformListing[];
}

export const INITIAL_DEALS: Deal[] = [
  {
    id: 'deal-1',
    title: 'Coastal Retreat',
    location: 'Pensacola, FL',
    bedsBaths: '3 bed, 2 bath',
    squareFeet: '1,300',
    furnished: 'Yes',
    monthlyRent: '$2,200',
    leaseTerm: '12 months',
    projectedAnnualRevenue: '$55,683',
    estOccupancy: '68%',
    adr: '$215',
    securityDeposit: '$4,400',
    concessions: '1st month free',
    availability: 'ASAP',
    estNetMonthlyProfit: '~$1,700',
    totalCashToStart: '$9,400',
    specialRequirements: 'CGL insurance + COI',
    imageUrl: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80'
    ],
    status: 'AVAILABLE',
    description: 'Perfect short-term rental opportunity in a high-demand coastal pocket of Pensacola. Fully turnkey with pool access, private patio, and designer interiors.',
    listings: [
      {
        platform: 'Airbnb',
        url: 'https://www.airbnb.com/rooms/12345678',
        isActive: true
      },
      {
        platform: 'Vrbo',
        url: 'https://www.vrbo.com/98765432',
        isActive: true
      },
      {
        platform: 'Booking.com',
        url: 'https://www.booking.com/hotel/us/coastal-retreat-pensacola.html',
        isActive: true
      }
    ]
  },
  {
    id: 'deal-2',
    title: 'The Desert Oasis',
    location: 'Scottsdale, AZ',
    bedsBaths: '4 bed, 3 bath',
    squareFeet: '2,100',
    furnished: 'Yes',
    monthlyRent: '$3,800',
    leaseTerm: '12 months',
    projectedAnnualRevenue: '$82,100',
    estOccupancy: '72%',
    adr: '$312',
    securityDeposit: '$5,000',
    concessions: 'None',
    availability: 'Aug 1, 2026',
    estNetMonthlyProfit: '~$2,450',
    totalCashToStart: '$14,200',
    specialRequirements: 'Corporate lease addendum',
    imageUrl: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1512915922686-57c11dde9b6b?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=800&q=80'
    ],
    status: 'AVAILABLE',
    description: 'Stunning property with a private heated pool area, located in Scottsdale\'s premier leisure district. High demand during peak golf & spring season.',
    listings: [
      {
        platform: 'Airbnb',
        url: 'https://www.airbnb.com/rooms/23456789',
        isActive: true
      },
      {
        platform: 'Direct Website',
        url: 'https://www.kaizenstays.com/scottsdale-oasis',
        isActive: true
      }
    ]
  },
  {
    id: 'deal-3',
    title: 'Midcentury Alpine Cabin',
    location: 'Blue Ridge, GA',
    bedsBaths: '2 bed, 2 bath',
    squareFeet: '1,150',
    furnished: 'Yes',
    monthlyRent: '$1,850',
    leaseTerm: '12 months',
    projectedAnnualRevenue: '$48,200',
    estOccupancy: '65%',
    adr: '$195',
    securityDeposit: '$3,700',
    concessions: 'Half off security deposit',
    availability: 'ASAP',
    estNetMonthlyProfit: '~$1,350',
    totalCashToStart: '$7,400',
    specialRequirements: 'None',
    imageUrl: 'https://images.unsplash.com/photo-1508333706533-1ab43ecb1606?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1508333706533-1ab43ecb1606?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80'
    ],
    status: 'AVAILABLE',
    description: 'A cozy mountain retreat experiencing high weekend occupancy. Fire pit, hot tub, and panoramic forest views.',
    listings: [
      {
        platform: 'Airbnb',
        url: 'https://www.airbnb.com/rooms/34567890',
        isActive: true
      },
      {
        platform: 'Vrbo',
        url: 'https://www.vrbo.com/87654321',
        isActive: true
      },
      {
        platform: 'Booking.com',
        url: 'https://www.booking.com/hotel/us/alpine-cabin-blue-ridge.html',
        isActive: true
      },
      {
        platform: 'Zillow',
        url: 'https://www.zillow.com/homedetails/blue-ridge-ga',
        isActive: true
      }
    ]
  }
];

export function normalizeDeal(d: any): Deal {
  return {
    id: d.id || 'deal-' + Date.now(),
    title: d.title || 'Property',
    location: d.location || 'Location',
    bedsBaths: d.bedsBaths || '3 bed, 2 bath',
    squareFeet: d.squareFeet || '1,200',
    furnished: d.furnished || 'Yes',
    monthlyRent: d.monthlyRent || '$2,000',
    leaseTerm: d.leaseTerm || '12 months',
    projectedAnnualRevenue: d.projectedAnnualRevenue || '$50,000',
    estOccupancy: d.estOccupancy || '70%',
    adr: d.adr || '$200',
    securityDeposit: d.securityDeposit || '$4,000',
    concessions: d.concessions || 'None',
    availability: d.availability || 'ASAP',
    estNetMonthlyProfit: d.estNetMonthlyProfit || '~$1,500',
    totalCashToStart: d.totalCashToStart || '$8,000',
    specialRequirements: d.specialRequirements || 'None',
    imageUrl: d.imageUrl || 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80',
    images: Array.isArray(d.images) && d.images.length > 0 ? d.images : [d.imageUrl || 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80'],
    status: d.status || 'AVAILABLE',
    description: d.description || '',
    listings: Array.isArray(d.listings) ? d.listings : []
  };
}

export function getStoredDeals(): Deal[] {
  if (typeof window === 'undefined') return INITIAL_DEALS;
  const stored = localStorage.getItem('kaizen_deals');
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map(normalizeDeal);
      }
    } catch (e) {
      console.error('Failed to parse stored deals, resetting to default', e);
    }
  }
  return INITIAL_DEALS;
}

export function saveDeals(deals: Deal[]): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('kaizen_deals', JSON.stringify(deals));
  }
}

export function resetDealsToDefault(): Deal[] {
  if (typeof window !== 'undefined') {
    localStorage.setItem('kaizen_deals', JSON.stringify(INITIAL_DEALS));
  }
  return INITIAL_DEALS;
}

export function getStoredWebhook(): string {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem('kaizen_webhook') || '';
}

export function saveWebhook(url: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('kaizen_webhook', url);
  }
}
