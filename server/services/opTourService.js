/**
 * opTourService.js — B2C Tour Departure Service
 * 
 * Tách logic query + normalize ra khỏi controller.
 * Dùng Whitelist approach: chỉ expose fields an toàn cho public.
 * 
 * Used by: opTourController.getB2COpTours
 */

const db = require('../db');
const { resolveMarket } = require('../config/markets');

// =============================================
// WHITELIST: Chỉ những field tour_info này được ra ngoài B2C
// Khi CRM thêm field nhạy cảm (cost, discount, notes) → auto-safe
// =============================================
const SAFE_B2C_TOUR_INFO_FIELDS = [
  'total_seats', 'price_adult', 'price_child', 'price_infant',
  'dep_airline', 'departure_flight', 'dep_time',
  'ret_airline', 'return_flight', 'ret_time',
  'pickup_point', 'dropoff_point',
  'tour_itinerary_web_link'
];

/**
 * Fetch active tour departures from DB
 * Chỉ lấy tour sắp tới (start_date >= today) + template đang active
 */
async function fetchActiveTours() {
  const result = await db.query(`
    SELECT 
      td.id, td.code as tour_code, 
      COALESCE(tt.name, td.tour_info->>'tour_name') as tour_name,
      td.tour_info->>'tour_itinerary_web_link' as website_link,
      td.start_date, td.end_date, td.market, td.status,
      td.tour_info, td.max_participants,
      COALESCE(b_agg.total_sold, 0) AS total_sold,
      COALESCE(b_agg.total_reserved, 0) AS total_reserved
    FROM tour_departures td
    LEFT JOIN tour_templates tt ON td.tour_template_id = tt.id
    LEFT JOIN (
      SELECT 
        tour_departure_id,
        SUM(CASE WHEN booking_status NOT IN ('Huỷ', 'CANCELLED', 'EXPIRED', 'Mới', 'pending', 'Giữ chỗ', 'HELD') THEN pax_count ELSE 0 END) AS total_sold,
        SUM(CASE WHEN booking_status IN ('Giữ chỗ', 'Mới', 'pending', 'HELD') THEN pax_count ELSE 0 END) AS total_reserved
      FROM bookings
      GROUP BY tour_departure_id
    ) b_agg ON b_agg.tour_departure_id = td.id
    WHERE td.start_date >= CURRENT_DATE
      AND COALESCE(tt.is_active, true) = true
    ORDER BY td.start_date ASC
  `);

  return result.rows;
}

/**
 * Transform DB row → B2C-safe normalized object
 * Frontend không biết DB schema — chỉ thấy domain-oriented fields
 */
function transformB2CTour(row) {
  // Parse tour_info JSON blob
  let tourInfo = row.tour_info || {};
  if (typeof tourInfo === 'string') {
    try { tourInfo = JSON.parse(tourInfo); } catch { tourInfo = {}; }
  }

  // Whitelist: chỉ extract safe fields
  const safeTourInfo = {};
  for (const field of SAFE_B2C_TOUR_INFO_FIELDS) {
    if (tourInfo[field] !== undefined && tourInfo[field] !== null && tourInfo[field] !== '') {
      safeTourInfo[field] = tourInfo[field];
    }
  }

  // Seats calculation
  const maxSeats = Number(row.max_participants) || Number(safeTourInfo.total_seats) || 0;
  const sold = Number(row.total_sold) || 0;
  const reserved = Number(row.total_reserved) || 0;
  const seatsRemaining = Math.max(0, maxSeats - sold - reserved);

  // Market resolution
  const market = resolveMarket(row.market);

  // Build airline info
  const airline = {};
  if (safeTourInfo.dep_airline || safeTourInfo.departure_flight) {
    airline.departure = [safeTourInfo.dep_airline, safeTourInfo.departure_flight]
      .filter(Boolean).join(' ').trim() || null;
    airline.departureName = safeTourInfo.dep_airline || null;
  }
  if (safeTourInfo.ret_airline || safeTourInfo.return_flight) {
    airline.return = [safeTourInfo.ret_airline, safeTourInfo.return_flight]
      .filter(Boolean).join(' ').trim() || null;
    airline.returnName = safeTourInfo.ret_airline || null;
  }

  // Slugify tour code for URL
  const slug = (row.tour_code || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

  return {
    id: row.id,
    code: row.tour_code,
    slug,
    title: row.tour_name || row.tour_code,
    destination: market.label,
    destinationSlug: market.slug,
    websiteUrl: row.website_link || null,
    departureDate: row.start_date,
    returnDate: row.end_date,
    status: row.status || 'upcoming',
    price: Number(safeTourInfo.price_adult) || 0,
    priceChild: Number(safeTourInfo.price_child) || null,
    priceInfant: Number(safeTourInfo.price_infant) || null,
    totalSeats: maxSeats,
    seatsRemaining,
    airline: Object.keys(airline).length > 0 ? airline : null,
    departureTime: safeTourInfo.dep_time || null,
    returnTime: safeTourInfo.ret_time || null,
    pickup: safeTourInfo.pickup_point || null,
  };
}

module.exports = {
  fetchActiveTours,
  transformB2CTour,
  SAFE_B2C_TOUR_INFO_FIELDS,
};
