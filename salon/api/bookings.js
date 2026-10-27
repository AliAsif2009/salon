// Vercel Serverless Function. Keep the Supabase service-role key ONLY in Vercel environment variables.
const SERVICES = new Set([
  "Women's cut & style", "Men's cut", 'Full color', 'Balayage', 'Keratin smoothing', 'Blowout',
  'Signature facial', 'Hydrating facial', 'Chemical peel', 'Waxing (face)',
  'Classic manicure', 'Gel manicure', 'Spa pedicure', 'Acrylic or gel extensions',
  'Event makeup', 'Lash lift & tint', 'Brow shaping & tint',
  'Brow shaping', 'Deep conditioning', 'Paraffin treat', 'Bridal hair styling', 'Bridal makeup', 'Trial session'
]);
const STYLISTS = new Set(['Any available', 'Amelia Hart', 'Jordan Reyes', 'Sophia Lane', 'Maya Brooks']);
const PACKAGES = new Set(['p-glow', 'p-color', 'p-hands', 'p-bride']);
function validDate(v) {
  if (typeof v !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(v)) return false;
  const d = new Date(v + 'T00:00:00Z');
  return !Number.isNaN(d.valueOf()) && d.toISOString().slice(0,10) === v && v >= new Date().toISOString().slice(0,10);
}
module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') { res.setHeader('Allow','POST'); return res.status(405).json({ error: 'Method not allowed.' }); }
  const endpoint = process.env.SUPABASE_URL?.replace(/\/$/, '');
  const secret = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!endpoint || !secret) return res.status(503).json({ error: 'Booking system is not configured yet.' });
  const d = req.body || {};
  if (JSON.stringify(d).length > 5000) return res.status(413).json({ error: 'Request too large.' });
  const name = String(d.name || '').trim(), email = String(d.email || '').trim(), phone = String(d.phone || '').trim();
  const notes = String(d.notes || '').trim(), promo = String(d.promo || '').trim();
  const services = d.services;
  if (name.length < 2 || name.length > 120 || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) || email.length > 254 ||
      phone.length > 40 || phone.replace(/\D/g,'').length < 10 || notes.length > 1000 || promo.length > 40 ||
      !Array.isArray(services) || services.length < 1 || services.length > 12 || !services.every(s => typeof s === 'string' && SERVICES.has(s)) ||
      !STYLISTS.has(d.stylist) || (d.package_id !== null && d.package_id !== undefined && !PACKAGES.has(d.package_id)) ||
      !validDate(d.appointment_date) || !/^(1[0-2]|[1-9]):[0-5]\d (AM|PM)$/.test(d.appointment_time))
    return res.status(400).json({ error: 'Please check your booking details.' });
  const ref = 'SLN-' + crypto.randomUUID().slice(0,8).toUpperCase();
  const record = {
    reference: ref, name, email, phone, notes, services, stylist: d.stylist,
    package_id: d.package_id || null, appointment_date: d.appointment_date,
    appointment_time: d.appointment_time, promo, status: 'pending'
  };
  try {
    const response = await fetch(`${endpoint}/rest/v1/bookings`, {
      method:'POST', headers: {
        apikey: secret, Authorization: `Bearer ${secret}`, 'Content-Type':'application/json', Prefer:'return=minimal'
      }, body:JSON.stringify(record), signal:AbortSignal.timeout(10000)
    });
    if (!response.ok) { console.error('Supabase insertion failed', response.status, await response.text()); return res.status(502).json({ error:'Could not save booking right now.' }); }
    return res.status(201).json({ ref });
  } catch (e) { console.error('Booking request failed', e); return res.status(502).json({ error:'Booking service temporarily unavailable.' }); }
};
