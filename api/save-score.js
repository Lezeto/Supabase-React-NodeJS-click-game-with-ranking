import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export const config = { runtime: 'nodejs' };

export default async function handler(req, res) {
  // Parse body if needed (Vercel Node API)
  let body = req.body;
  if (req.method === 'POST' && typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch {
      return res.status(400).json({ error: 'Invalid JSON' });
    }
  }

  if (req.method === 'POST') {
    const { name, score } = body;
    console.log('Trying to insert:', { name, score }); // Add this line
    if (!name || typeof score !== 'number') {
      return res.status(400).json({ error: 'Invalid input' });
    }
    const { error: insertError } = await supabase.from('leaderboard').insert([{ name, score }]);
    if (insertError) {
      console.log('Insert error:', insertError); // Add this line
      return res.status(500).json({ error: insertError.message });
    }
  }

  const { data, error } = await supabase
    .from('leaderboard')
    .select('name,score')
    .order('score', { ascending: false })
    .limit(10);

  if (error) return res.status(500).json({ error: error.message });
  res.status(200).json({ top10: data });
}