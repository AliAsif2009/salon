
const { randomUUID } = require('node:crypto');

// Service durations in minutes, matching main.js
const SERVICES = {
  "Women's cut & style": 60,
  "Men's cut": 40,
  "Full color": 120,
  "Balayage": 180,
  "Keratin smoothing": 150,
  "Blowout": 45,
  "Signature facial": 60,
  "Hydrating facial": 75,
  "Chemical peel": 45,
  "Waxing (face)": 20,
  "Classic manicure": 35,
  "Gel manicure": 50,
  "Spa pedicure": 60,
  "Acrylic or gel extensions": 90,
  "Event makeup": 60,
  "Lash lift & tint": 60,
  "Brow shaping & tint": 30
};

const PACKAGES = {
  'p-glow': { name: 'Glow Up package', minutes: 120 },
  'p-color': { name: 'Color & Care package', minutes: 240 },
  'p-hands': { name: 'Hands & Feet package', minutes: 100 },
  'p-bride': { name: 'Bridal Day package', minutes: 270 }
};

const STYLISTS = new Set([
  'Amelia Hart',
  'Jordan Reyes',
  'Sophia Lane',
  'Maya Brooks'
]);

function validDate(value) {
  if (typeof value !== 'string' ||
      !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;

  const date = new Date(value + 'T00:00:00Z');

  return !Number.isNaN(date.getTime()) &&
    date.toISOString().slice(0, 10) === value &&
    value >= new Date().toLocaleDateString('en-CA', {
      timeZone: 'Asia/Karachi',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).replace(/(\d{2})\/(\d{2})\/(\d{4})/, '$3-$1-$2');
}

function timeToMinutes(value) {
  if (typeof value !== 'string') return null;

  const match = value.match(
    /^(1[0-2]|[1-9]):([0-5]\d) (AM|PM)$/
  );

  if (!match) return null;

  let hour = Number(match[1]) % 12;

  if (match[3] === 'PM') hour += 12;

  return hour * 60 + Number(match[2]);
}

module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({
      error: 'Method not allowed.'
    });
  }

  const endpoint = (process.env.SUPABASE_URL || '')
    .trim()
    .replace(/\/+$/, '');

  const secret = (
    process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  ).trim();

  if (!endpoint || !secret) {
    return res.status(503).json({
      error: 'Booking system is not configured yet.'
    });
  }

  const d = req.body || {};

  if (JSON.stringify(d).length > 5000) {
    return res.status(413).json({
      error: 'Request too large.'
    });
  }

  const name = String(d.name || '').trim();
  const email = String(d.email || '').trim();
  const phone = String(d.phone || '').trim();
  const notes = String(d.notes || '').trim();
  const promo = String(d.promo || '').trim();

  const services = d.services;
  const stylist = d.stylist;
  const packageId = d.package_id || null;
  const date = d.appointment_date;
  const time = d.appointment_time;

  if (
    name.length < 2 ||
    name.length > 120 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
    email.length > 254 ||
    phone.length > 40 ||
    phone.replace(/\D/g, '').length < 10 ||
    notes.length > 1000 ||
    promo.length > 40 ||
    !Array.isArray(services) ||
    services.length < 1 ||
    services.length > 12 ||
    !services.every(s => typeof s === 'string') ||
    !validDate(date) ||
    timeToMinutes(time) === null
  ) {
    return res.status(400).json({
      error: 'Please check your booking details.'
    });
  }

  if (!STYLISTS.has(stylist)) {
    return res.status(400).json({
      error: 'Please select a specific stylist before booking.'
    });
  }

  let durationMinutes = 0;

  if (packageId) {
    const selectedPackage = PACKAGES[packageId];

    if (
      !selectedPackage ||
      services.length !== 1 ||
      services[0] !== selectedPackage.name
    ) {
      return res.status(400).json({
        error: 'Invalid package selection.'
      });
    }

    durationMinutes = selectedPackage.minutes;
  } else {
    for (const service of services) {
      if (!Object.prototype.hasOwnProperty.call(SERVICES, service)) {
        return res.status(400).json({
          error: 'Invalid service selection.'
        });
      }

      durationMinutes += SERVICES[service];
    }
  }

  const startMinute = timeToMinutes(time);

  if (durationMinutes <= 0) {
    return res.status(400).json({
      error: 'Invalid appointment duration.'
    });
  }

  if (startMinute + durationMinutes > 1440) {
    return res.status(400).json({
      error: 'Appointment cannot extend past midnight.'
    });
  }

  const ref = 'SLN-' + randomUUID().slice(0, 8).toUpperCase();

  const record = {
    reference: ref,
    name,
    email,
    phone,
    notes,
    services,
    stylist,
    package_id: packageId,
    appointment_date: date,
    appointment_time: time,
    start_minute: startMinute,
    duration_minutes: durationMinutes,
    promo,
    status: 'pending'
  };

  try {
    const headers = {
      apikey: secret,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal'
    };

    // Legacy JWT keys also require Authorization.
    if (!secret.startsWith('sb_secret_')) {
      headers.Authorization = `Bearer ${secret}`;
    }

    const response = await fetch(
      `${endpoint}/rest/v1/bookings`,
      {
        method: 'POST',
        headers,
        body: JSON.stringify(record),
        signal: AbortSignal.timeout(10000)
      }
    );

    if (!response.ok) {
      const errorText = await response.text();

      let errorData = {};

      try {
        errorData = JSON.parse(errorText);
      } catch (_) {}

      // PostgreSQL exclusion constraint violation.
      if (errorData.code === '23P01') {
        return res.status(409).json({
          error: 'This stylist already has an appointment during the selected time. Please choose another time or stylist.'
        });
      }

      console.error(
        'Supabase booking error:',
        response.status,
        errorText
      );

      return res.status(502).json({
        error: 'Could not save booking right now.'
      });
    }

    return res.status(201).json({
      ref,
      duration_minutes: durationMinutes
    });

  } catch (error) {
    console.error('Booking request failed:', error);

    return res.status(502).json({
      error: 'Booking service temporarily unavailable.'
    });
  }
};
