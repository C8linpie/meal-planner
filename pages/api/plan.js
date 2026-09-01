import { Redis } from '@upstash/redis';

// This is the one shared "This Week" plan + shopping list for your household.
// There's no login system - anyone with the app URL reads and writes this
// same record, the same way a shared document works. That's intentional:
// it's built for you and your husband, not for multiple separate households.
const PLAN_KEY = 'meal-planner:this-week';
const EMPTY_PLAN = { week: {}, shoppingChecks: {} };

function getRedis() {
  // Works with either the "Upstash for Redis" or "KV" naming Vercel's
  // storage integrations use - whichever one you connect will set one of
  // these pairs automatically.
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}

export default async function handler(req, res) {
  const redis = getRedis();
  if (!redis) {
    res.status(500).json({
      error:
        'No shared storage connected yet. In Vercel: Project -> Storage -> Create Database -> Upstash (Redis) -> connect it to this project, then redeploy.',
    });
    return;
  }

  try {
    if (req.method === 'GET') {
      const plan = (await redis.get(PLAN_KEY)) || EMPTY_PLAN;
      res.status(200).json(plan);
      return;
    }

    if (req.method === 'POST') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      const plan = {
        week: (body && body.week) || {},
        shoppingChecks: (body && body.shoppingChecks) || {},
      };
      await redis.set(PLAN_KEY, plan);
      res.status(200).json({ ok: true });
      return;
    }

    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || 'Failed to save the shared plan.' });
  }
}
