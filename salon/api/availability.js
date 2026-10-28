
const STYLISTS = [
  'Amelia Hart',
  'Jordan Reyes',
  'Sophia Lane',
  'Maya Brooks'
];

function validDate(value) {
  if (typeof value !== 'string' ||
      !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;

  const d = new Date(value + 'T00:00:00Z');

  return !Number.isNaN(d.getTime()) &&
    d.toISOString().slice(0, 10) === value;
}

function formatTime(minutes) {
  const hour = Math.floor(minutes / 60);
  const min = minutes % 60;

  return `${(hour % 12) || 12}:${String(min).padStart(2, '0')} ${hour < 12 ? 'AM' : 'PM'}`;
}

module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method !== 'GET') {
    return res.status(405).json({
      error: 'Method not allowed'
    });
  }

  const { date, stylist, duration } = req.query;

  const minutes = Number(duration);

  if (
    !validDate(date) ||
    typeof stylist !== 'string' ||
    !STYLISTS.includes(stylist) ||
    !Number.isInteger(minutes) ||
    minutes < 1 ||
    minutes > 720
  ) {
    return res.status(400).json({
      error: 'Invalid availability request'
    });
  }

  const url = (process.env.SUPABASE_URL || '')
    .trim().replace(/\/+$/, '');

  const secret = (
    process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  ).trim();

  if (!url || !secret) {
    return res.status(503).json({
      error: 'Availability is not configured'
    });
  }

  try {
    const headers = { apikey: secret };

    if (!secret.startsWith('sb_secret_')) {
      headers.Authorization = `Bearer ${secret}`;
    }

    const params = new URLSearchParams({
      select: 'stylist,start_minute,duration_minutes',
      appointment_date: `eq.${date}`,
      status: 'in.(pending,confirmed)',
      stylist: `eq.${stylist}`
    });

    const response = await fetch(
      `${url}/rest/v1/bookings?${params}`,
      {
        headers,
        signal: AbortSignal.timeout(10000)
      }
    );

    if (!response.ok) {
      console.error(
        'Availability query failed',
        response.status
      );

      return res.status(502).json({
        error: 'Could not check availability'
      });
    }

    const bookings = await response.json();

    const day = new Date(date + 'T12:00:00Z').getUTCDay();

    const opening = day === 0 ? 10 : 9;
    const closing = day === 0 ? 16 : day === 6 ? 18 : 19;

    const slots = [];

    for (let start = opening * 60;
         start + minutes <= closing * 60;
         start += 30) {

      const taken = bookings.some(booking => {
        const bookedStart = Number(booking.start_minute);
        const bookedDuration = Number(booking.duration_minutes);

        if (
          !Number.isFinite(bookedStart) ||
          !Number.isFinite(bookedDuration)
        ) return true;

        const bookedEnd = bookedStart + bookedDuration;
        const requestedEnd = start + minutes;

        return start < bookedEnd &&
               requestedEnd > bookedStart;
      });

      slots.push({
        time: formatTime(start),
        available: !taken
      });
    }

    return res.status(200).json({
      date,
      stylist,
      duration_minutes: minutes,
      slots
    });

  } catch (error) {
    console.error('Availability API error', error);

    return res.status(502).json({
      error: 'Availability temporarily unavailable'
    });
  }
};
