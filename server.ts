/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

// Initial deals mock dataset for backend server search
const BACKEND_DEALS = [
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
      { platform: 'Airbnb', url: 'https://www.airbnb.com/rooms/12345678', isActive: true },
      { platform: 'Vrbo', url: 'https://www.vrbo.com/98765432', isActive: true },
      { platform: 'Booking.com', url: 'https://www.booking.com/hotel/us/coastal-retreat-pensacola.html', isActive: true }
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
      { platform: 'Airbnb', url: 'https://www.airbnb.com/rooms/23456789', isActive: true },
      { platform: 'Direct Website', url: 'https://www.kaizenstays.com/scottsdale-oasis', isActive: true }
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
      { platform: 'Airbnb', url: 'https://www.airbnb.com/rooms/34567890', isActive: true },
      { platform: 'Vrbo', url: 'https://www.vrbo.com/87654321', isActive: true }
    ]
  },
  {
    id: 'deal-4',
    title: 'Puri Beachfront Haven',
    location: 'Puri, Odisha',
    bedsBaths: '3 bed, 3 bath',
    squareFeet: '1,800',
    furnished: 'Yes',
    monthlyRent: '$1,950',
    leaseTerm: '12 months',
    projectedAnnualRevenue: '$52,000',
    estOccupancy: '75%',
    adr: '$180',
    securityDeposit: '$3,900',
    concessions: 'Free WiFi setup',
    availability: 'ASAP',
    estNetMonthlyProfit: '~$1,600',
    totalCashToStart: '$8,200',
    specialRequirements: 'Coastal clearance certification',
    imageUrl: 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&w=800&q=80'
    ],
    status: 'AVAILABLE',
    description: 'Serene coastal villa near Puri beach with golden sands view and cultural heritage access.',
    listings: [
      { platform: 'Airbnb', url: 'https://www.airbnb.com/rooms/45678901', isActive: true }
    ]
  }
];

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Health check endpoint
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  // SEARCH API ENDPOINT
  app.post("/api/properties/search", (req, res) => {
    const { location = '', statusFilter = 'ALL', guests } = req.body || {};
    
    // Simulate slight server processing latency for smooth skeleton state demo
    setTimeout(() => {
      const locQuery = (location || '').toLowerCase().trim();

      const filtered = BACKEND_DEALS.filter((deal) => {
        // Location check
        const matchesLoc = !locQuery || 
          deal.location.toLowerCase().includes(locQuery) ||
          deal.title.toLowerCase().includes(locQuery) ||
          deal.description.toLowerCase().includes(locQuery);

        // Status check
        const matchesStatus = statusFilter === 'ALL' || deal.status === statusFilter;

        return matchesLoc && matchesStatus;
      });

      res.json({
        success: true,
        query: req.body,
        count: filtered.length,
        deals: filtered
      });
    }, 450);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
