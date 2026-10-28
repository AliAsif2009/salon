// Authenticated admin-only API. The secret key never leaves this function.
const STATUS = new Set(['pending', 'confirmed', 'cancelled', 'completed']);
module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'private, no-store');
  if (!['GET', 'PATCH'].includes(req.method)) return res.status(405).json({error:'Method not allowed'});
  const url = (process.env.SUPABASE_URL || '').replace(/\/$/, '');
  const secret = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const publicKey = process.env.SUPABASE_PUBLISHABLE_KEY;
  const adminEmail = (process.env.ADMIN_EMAIL || '').trim().toLowerCase();
  if (!url || !secret || !publicKey || !adminEmail) return res.status(503).json({error:'Admin is not configured'});
  const auth = req.headers.authorization || '';
  if (!/^Bearer [^\s]+$/.test(auth)) return res.status(401).json({error:'Sign in required'});
  try {
    // Supabase Auth validates the access token server-side. Never trust an email from the browser.
    const userResp = await fetch(`${url}/auth/v1/user`, {headers:{apikey: publicKey, Authorization: auth}, signal:AbortSignal.timeout(8000)});
    if (!userResp.ok) return res.status(401).json({error:'Session expired. Please sign in again'});
    const user = await userResp.json();
    if (user.email?.toLowerCase() !== adminEmail || !user.email_confirmed_at || user.role !== 'authenticated')
      return res.status(403).json({error:'Administrator access required'});
    const headers = {apikey: secret, 'Content-Type':'application/json'};
    if (req.method === 'GET') {
      const r = await fetch(`${url}/rest/v1/bookings?select=id,reference,name,email,phone,services,stylist,package_id,appointment_date,appointment_time,notes,promo,status,created_at&order=created_at.desc&limit=300`, {headers, signal:AbortSignal.timeout(10000)});
      if (!r.ok) {console.error('Admin list Supabase error:',r.status,await r.text()); return res.status(502).json({error:'Could not load bookings'});}
      return res.status(200).json({bookings:await r.json()});
    }
    const {id, status} = req.body || {};
    if (!Number.isSafeInteger(id) || id <= 0 || !STATUS.has(status)) return res.status(400).json({error:'Invalid booking update'});
    const r = await fetch(`${url}/rest/v1/bookings?id=eq.${id}`, {method:'PATCH', headers:{...headers,Prefer:'return=representation'},body:JSON.stringify({status}),signal:AbortSignal.timeout(10000)});
    if (!r.ok) {console.error('Admin update Supabase error:',r.status,await r.text());return res.status(502).json({error:'Could not update booking'});}
    const updated = await r.json();
    if (!updated.length) return res.status(404).json({error:'Booking not found'});
    return res.status(200).json({booking:updated[0]});
  } catch (err) {console.error('Admin API failed:',err);return res.status(502).json({error:'Booking service temporarily unavailable'});}
};
