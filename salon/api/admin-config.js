// Public configuration only. Never expose SUPABASE_SERVICE_ROLE_KEY here.
module.exports = function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'GET') return res.status(405).json({error:'Method not allowed'});
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key || !process.env.ADMIN_EMAIL) return res.status(503).json({error:'Admin is not configured'});
  res.status(200).json({supabaseUrl: url.replace(/\/$/, ''), publishableKey: key});
};
