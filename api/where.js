// Where to Buy lookup, read from the Notion "Where to Buy" database.
// Needs NOTION_TOKEN set in Vercel, and the Where to Buy database connected to the integration.
const WHERE_DB_ID = '7df8a7b8ccad4593968a76ebbebc4a7f';
const NOTION_VERSION = '2022-06-28';

export default async function handler(req, res) {
  const token = process.env.NOTION_TOKEN;
  if (!token) return res.status(500).json({ error: 'NOTION_TOKEN is not set in Vercel' });
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const out = [];
    let cursor;
    do {
      const r = await fetch(`https://api.notion.com/v1/databases/${WHERE_DB_ID}/query`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Notion-Version': NOTION_VERSION,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ page_size: 100, ...(cursor ? { start_cursor: cursor } : {}) }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.message || `Notion error ${r.status}`);
      data.results.forEach(page => {
        const p = page.properties;
        out.push({
          item: (p['Item']?.title || []).map(t => t.plain_text).join('').trim(),
          store: p['Store']?.select?.name || '',
          section: p['Section']?.select?.name || '',
        });
      });
      cursor = data.has_more ? data.next_cursor : null;
    } while (cursor);

    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).json(out.filter(w => w.item));
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
