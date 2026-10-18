// Shared shopping list, stored in the Notion "Shopping List" database.
// Needs NOTION_TOKEN set in Vercel (Settings > Environment Variables).
const SHOPPING_DB_ID = '5783bfe3c9fa4a48960e27b18c5834b1';
const NOTION_VERSION = '2022-06-28';

function richText(value) {
  return { rich_text: value ? [{ text: { content: String(value).slice(0, 2000) } }] : [] };
}

function plain(prop) {
  if (!prop) return '';
  if (prop.type === 'title') return prop.title.map(t => t.plain_text).join('');
  if (prop.type === 'rich_text') return prop.rich_text.map(t => t.plain_text).join('');
  return '';
}

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

function toItem(page) {
  const p = page.properties;
  return {
    id: page.id,
    item: plain(p['Item']),
    quantity: plain(p['Quantity']),
    recipe: plain(p['Recipe']),
    ticked: !!p['Ticked']?.checkbox,
    addedBy: p['Added by']?.select?.name || '',
    store: p['Store']?.select?.name || '',
    section: p['Section']?.select?.name || '',
  };
}

export default async function handler(req, res) {
  const token = process.env.NOTION_TOKEN;
  if (!token) {
    return res.status(500).json({ error: 'NOTION_TOKEN is not set in Vercel' });
  }

  try {
    if (req.method === 'GET') {
      const data = await notion(`/databases/${SHOPPING_DB_ID}/query`, token, 'POST', {
        page_size: 100,
        sorts: [{ property: 'Item', direction: 'ascending' }],
      });
      return res.status(200).json(data.results.map(toItem));
    }

    if (req.method === 'POST') {
      const { item, quantity = '', recipe = '', addedBy = '', store = '', section = '' } = req.body || {};
      if (!item) return res.status(400).json({ error: 'item is required' });
      const page = await notion('/pages', token, 'POST', {
        parent: { database_id: SHOPPING_DB_ID },
        properties: {
          'Item': { title: [{ text: { content: String(item).slice(0, 2000) } }] },
          'Quantity': richText(quantity),
          'Recipe': richText(recipe),
          'Ticked': { checkbox: false },
          ...(addedBy ? { 'Added by': { select: { name: addedBy } } } : {}),
          ...(store ? { 'Store': { select: { name: store } } } : {}),
          ...(section ? { 'Section': { select: { name: section } } } : {}),
        },
      });
      return res.status(200).json(toItem(page));
    }

    if (req.method === 'PATCH') {
      const { id, ticked } = req.body || {};
      if (!id) return res.status(400).json({ error: 'id is required' });
      const page = await notion(`/pages/${id}`, token, 'PATCH', {
        properties: { 'Ticked': { checkbox: !!ticked } },
      });
      return res.status(200).json(toItem(page));
    }

    if (req.method === 'DELETE') {
      const { id } = req.body || {};
      if (!id) return res.status(400).json({ error: 'id is required' });
      // Archive rather than hard delete, so it can be restored from Notion's trash.
      await notion(`/pages/${id}`, token, 'PATCH', { archived: true });
      return res.status(200).json({ ok: true });
    }

    res.setHeader('Allow', 'GET, POST, PATCH, DELETE');
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
