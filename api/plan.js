// Shared weekly plan (shortlist, day and cook), stored in the Notion "Meal Plan" database.
// Needs NOTION_TOKEN set in Vercel, and the Meal Plan database connected to the integration.
const PLAN_DB_ID = 'bdd36c786d4c4bd6a0e0a2ef6d8a3900';
const NOTION_VERSION = '2022-06-28';

async function notion(path, token, method = 'GET', body) {
  const res = await fetch(`https://api.notion.com/v1${path}`, {
    method,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Notion-Version': NOTION_VERSION,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || `Notion error ${res.status}`);
  return data;
}

function plain(prop) {
  if (!prop) return '';
  if (prop.type === 'title') return prop.title.map(t => t.plain_text).join('');
  return '';
}

function toEntry(page) {
  const p = page.properties;
  return {
    id: page.id,
    meal: plain(p['Meal']),
    shortlisted: !!p['Shortlisted']?.checkbox,
    day: p['Day']?.select?.name || '',
    cook: p['Cook']?.select?.name || '',
    changedBy: p['Changed by']?.select?.name || '',
  };
}

function select(name) {
  return { select: name ? { name } : null };
}

export default async function handler(req, res) {
  const token = process.env.NOTION_TOKEN;
  if (!token) {
    return res.status(500).json({ error: 'NOTION_TOKEN is not set in Vercel' });
  }

  try {
    if (req.method === 'GET') {
      res.setHeader('Cache-Control', 'no-store');
      const data = await notion(`/databases/${PLAN_DB_ID}/query`, token, 'POST', {
        page_size: 100,
        sorts: [{ property: 'Meal', direction: 'ascending' }],
      });
      return res.status(200).json(data.results.map(toEntry));
    }

    if (req.method === 'PUT') {
      const { meal, shortlisted, day, cook, changedBy = '' } = req.body || {};
      if (!meal) return res.status(400).json({ error: 'meal is required' });

      const props = {
        'Shortlisted': { checkbox: !!shortlisted },
        'Day': select(day),
        'Cook': select(cook),
        'Changed by': select(changedBy),
      };

      // Find the existing row for this meal, or create one
      const found = await notion(`/databases/${PLAN_DB_ID}/query`, token, 'POST', {
        page_size: 1,
        filter: { property: 'Meal', title: { equals: meal } },
      });

      let page;
      if (found.results.length) {
        page = await notion(`/pages/${found.results[0].id}`, token, 'PATCH', { properties: props });
      } else {
        page = await notion('/pages', token, 'POST', {
          parent: { database_id: PLAN_DB_ID },
          properties: { 'Meal': { title: [{ text: { content: String(meal).slice(0, 2000) } }] }, ...props },
        });
      }
      return res.status(200).json(toEntry(page));
    }

    res.setHeader('Allow', 'GET, PUT');
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
