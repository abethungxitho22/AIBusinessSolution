import type { SalesEntry, BusinessType } from './supabase';

export interface SalesInsight {
  bestSellers: { product: string; totalQty: number; totalRevenue: number }[];
  lowPerformers: { product: string; totalQty: number; totalRevenue: number }[];
  totalRevenue: number;
  totalUnits: number;
  avgOrderValue: number;
  topRevenueProduct: string;
  patterns: string[];
}

export interface AIAdvice {
  summary: string;
  insights: string[];
  recommendations: string[];
  urgentAction: string;
}

// NLP: tokenize and extract product mentions from free text
export function parseTextSales(text: string): Partial<SalesEntry>[] {
  const results: Partial<SalesEntry>[] = [];

  // Pattern: "sold X [product] at/for R[price]" or "X [product] R[price]"
  const linePatterns = [
    /(\d+)\s+([a-z\s]+?)\s+(?:at|for|@)\s*[Rr]?\s*([\d,.]+)/gi,
    /([a-z\s]+?)\s+[Rr]([\d,.]+)\s*[x×]\s*(\d+)/gi,
    /([a-z\s]+?):\s*(\d+)\s+units?\s+[Rr]([\d,.]+)/gi,
  ];

  for (const pattern of linePatterns) {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      if (pattern === linePatterns[0]) {
        results.push({
          product_name: match[2].trim(),
          quantity: parseInt(match[1]),
          unit_price: parseFloat(match[3].replace(',', '')),
        });
      } else if (pattern === linePatterns[1]) {
        results.push({
          product_name: match[1].trim(),
          quantity: parseInt(match[3]),
          unit_price: parseFloat(match[2].replace(',', '')),
        });
      } else {
        results.push({
          product_name: match[1].trim(),
          quantity: parseInt(match[2]),
          unit_price: parseFloat(match[3].replace(',', '')),
        });
      }
    }
  }

  return results;
}

// ML: aggregate and rank sales using weighted scoring
export function analyzeSales(entries: SalesEntry[]): SalesInsight {
  if (entries.length === 0) {
    return {
      bestSellers: [],
      lowPerformers: [],
      totalRevenue: 0,
      totalUnits: 0,
      avgOrderValue: 0,
      topRevenueProduct: '',
      patterns: [],
    };
  }

  const productMap = new Map<string, { totalQty: number; totalRevenue: number }>();

  for (const entry of entries) {
    const key = entry.product_name.toLowerCase().trim();
    const existing = productMap.get(key) || { totalQty: 0, totalRevenue: 0 };
    productMap.set(key, {
      totalQty: existing.totalQty + entry.quantity,
      totalRevenue: existing.totalRevenue + entry.total_price,
    });
  }

  const products = Array.from(productMap.entries()).map(([product, data]) => ({
    product,
    ...data,
  }));

  // ML-style weighted score: 60% revenue weight, 40% quantity weight
  const maxRevenue = Math.max(...products.map((p) => p.totalRevenue));
  const maxQty = Math.max(...products.map((p) => p.totalQty));

  const scored = products
    .map((p) => ({
      ...p,
      score:
        0.6 * (p.totalRevenue / (maxRevenue || 1)) +
        0.4 * (p.totalQty / (maxQty || 1)),
    }))
    .sort((a, b) => b.score - a.score);

  const totalRevenue = entries.reduce((s, e) => s + e.total_price, 0);
  const totalUnits = entries.reduce((s, e) => s + e.quantity, 0);

  // Pattern detection: day-of-week clustering
  const dayMap: Record<string, number> = {};
  for (const entry of entries) {
    const day = new Date(entry.sale_date).toLocaleDateString('en-ZA', { weekday: 'long' });
    dayMap[day] = (dayMap[day] || 0) + entry.total_price;
  }
  const busyDay = Object.entries(dayMap).sort((a, b) => b[1] - a[1])[0];

  const patterns: string[] = [];
  if (busyDay) patterns.push(`Your busiest sales day is ${busyDay[0]}`);
  if (scored.length > 1) {
    const ratio = scored[0].totalRevenue / (scored[scored.length - 1].totalRevenue || 1);
    if (ratio > 5) patterns.push(`"${scored[0].product}" generates ${ratio.toFixed(0)}x more revenue than your lowest seller`);
  }

  return {
    bestSellers: scored.slice(0, 3),
    lowPerformers: scored.slice(-3).reverse(),
    totalRevenue,
    totalUnits,
    avgOrderValue: totalRevenue / (entries.length || 1),
    topRevenueProduct: scored[0]?.product || '',
    patterns,
  };
}

// LLM-style rule-based advice generator tailored per business type
export function generateAdvice(insight: SalesInsight, businessType: BusinessType): AIAdvice {
  const { bestSellers, lowPerformers, totalRevenue, avgOrderValue, patterns } = insight;
  const top = bestSellers[0];

  const baseInsights: string[] = [
    ...patterns,
    totalRevenue > 0
      ? `Total revenue is R${totalRevenue.toFixed(2)} with an average sale value of R${avgOrderValue.toFixed(2)}`
      : 'No revenue data yet — start logging your sales to unlock insights',
  ];

  if (top) baseInsights.push(`"${top.product}" is your top performer with R${top.totalRevenue.toFixed(2)} in revenue`);
  if (lowPerformers[0] && lowPerformers[0].product !== top?.product) {
    baseInsights.push(`"${lowPerformers[0].product}" has the lowest performance — consider adjusting pricing or phasing it out`);
  }

  const typeAdvice: Record<BusinessType, { summary: string; recs: string[]; urgent: string }> = {
    food_vendor: {
      summary: `Your food business ${top ? `is driven by "${top.product}"` : 'is ready for analysis'}. Focus on consistency and freshness to retain customers.`,
      recs: [
        top ? `Restock "${top.product}" consistently — it is your revenue anchor` : 'Start tracking your daily food sales by item',
        'Offer combo deals combining high-margin items to increase basket size',
        'Track food waste — unsold perishables directly cut into your profit',
        'Consider a daily special on slow days to drive foot traffic',
        'Price your items in round ZAR amounts for faster cash transactions',
      ],
      urgent: top ? `Make sure "${top.product}" never runs out — a stockout costs you direct revenue` : 'Log at least 7 days of sales to get AI-driven restocking advice',
    },
    clothing_beauty: {
      summary: `Your clothing & beauty business ${top ? `sees strong demand for "${top.product}"` : 'needs sales data to unlock style trends'}. Stock what sells.`,
      recs: [
        top ? `Stock more of "${top.product}" in multiple sizes/colours — it has proven demand` : 'Track sales by style and colour to identify trends',
        'Bundle slow-moving items with best-sellers at a slight discount to clear stock',
        'Seasonal promotions (summer/winter weaves, festive outfits) can double weekly revenue',
        'Photograph best-sellers and promote on WhatsApp & Facebook to reach more buyers',
        'Offer a loyalty stamp card — 10 purchases = 1 free item — to encourage repeat visits',
      ],
      urgent: 'Review your stock levels for top items before the weekend — that is peak sales time for fashion',
    },
    furniture: {
      summary: `Your furniture business ${top ? `leads with "${top.product}"` : 'can benefit from tracking high-value items separately'}. Focus on high-margin pieces.`,
      recs: [
        top ? `Prioritise restocking "${top.product}" — high-value items drive outsized revenue` : 'Track each furniture piece separately to identify what buyers want',
        'Offer layby/payment plans to make high-ticket items accessible to more customers',
        'Slow-moving inventory ties up capital — consider a clearance sale after 60 days',
        'Upsell complementary pieces (e.g., chairs with tables, cushions with sofas)',
        'Take quality photos and list items on Facebook Marketplace to reach more buyers in your area',
      ],
      urgent: 'Identify any item sitting unsold for over 30 days and consider a 15% discount to free up cash flow',
    },
    retail: {
      summary: `Your retail shop ${top ? `depends on "${top.product}" for a significant share of revenue` : 'is ready to uncover its hidden best-sellers'}. Keep shelves stocked.`,
      recs: [
        top ? `Never let "${top.product}" go out of stock — it is your bread-and-butter item` : 'Start scanning or logging every sale by product name',
        'Group complementary products together in-store to encourage add-on purchases',
        'Run end-of-month promotions to clear slow stock before restocking',
        'Negotiate bulk discounts with suppliers for your top 5 selling products',
        'Offer a price-match guarantee on staple items to prevent customers going elsewhere',
      ],
      urgent: 'Check your top-selling product stock levels now — running out means lost sales and lost customers',
    },
    service_provider: {
      summary: `Your service business ${top ? `generates strong demand for "${top.product}"` : 'needs booking and service tracking to reveal growth opportunities'}. Time is your inventory.`,
      recs: [
        top ? `Promote "${top.product}" more actively — it is your most requested service` : 'Log each service you provide with a price to track your earnings',
        'Offer a package deal (e.g., 3 sessions for the price of 2) to lock in recurring revenue',
        'Ask every happy client for a WhatsApp review or referral — word-of-mouth is free marketing',
        'Track your busiest hours and consider upselling premium services during that time',
        'Introduce a booking deposit to reduce no-shows and protect your income',
      ],
      urgent: 'Follow up with clients you have not seen in 30+ days — a simple WhatsApp message can reactivate lost revenue',
    },
  };

  const advice = typeAdvice[businessType];

  return {
    summary: advice.summary,
    insights: baseInsights,
    recommendations: advice.recs,
    urgentAction: advice.urgent,
  };
}
