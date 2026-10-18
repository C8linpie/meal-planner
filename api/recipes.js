// Recipes, read live from the Notion Recipes database.
// Needs NOTION_TOKEN set in Vercel. Ingredient lines keep the order they have in Notion.
const RECIPES_DB_ID = 'fe867f9d2c3f4279b5d2d4a5988956fe';
const NOTION_VERSION = '2022-06-28';

// The app has four protein buttons. Map Notion's detailed proteins onto them.
// If a recipe needs several, the meat option wins so it shows under the meat button.
const PROTEIN_PRIORITY = ['Chicken', 'Fish', 'Meat', 'Vegetarian'];
const PROTEIN_MAP = {
  'Chicken': 'Chicken',
  'Fish': 'Fish',
  'Beef': 'Meat',
  'Pork': 'Meat',
  'Lamb': 'Meat',
};

function plain(prop) {
  if (!prop) return '';
  if (prop.type === 'title') return prop.title.map(t => t.plain_text).join('');
  if (prop.type === 'rich_text') return prop.rich_text.map(t => t.plain_text).join('');
  return '';
}

function lines(text) {
  return text.split('\n').map(s => s.trim()).filter(Boolean);
}

function pickProtein(names) {
  const mapped = names.map(n => PROTEIN_MAP[n] || 'Vegetarian');
  for (const p of PROTEIN_PRIORITY) {
    if (mapped.includes(p)) return p;
  }
  return 'Vegetarian';
}

function toRecipe(page) {
  const p = page.properties;
  const name = plain(p['Recipe']) || 'Untitled';

  const categories = (p['Category']?.multi_select || []).map(o => o.name);
  const proteinNames = (p['Protein']?.multi_select || []).map(o => o.name);

  const prep = p['Prep (mins)']?.number || 0;
  const cook = p['Cook (mins)']?.number || 0;
  const total = prep + cook;

  const ingredientList = lines(plain(p['Main Ingredients']));
  const pantryList = lines(plain(p['Pantry Items']));

  return {
    name,
    category: categories[0] || 'Other',
    protein: pickProtein(proteinNames),
    time: total ? `${total} mins` : '30 mins',
    defaultServings: p['Serves']?.number || 3,
    ingredientList,
    ingredients: ingredientList.join(', '), // kept for older code paths
    pantryList,
    pantry: pantryList.join('\n'),
    instructions: plain(p['Instructions']),
  };
}

export default async function handler(req, res) {
  const token = process.env.NOTION_TOKEN;
  if (!token) {
    return res.status(500).json({ error: 'NOTION_TOKEN is not set in Vercel' });
  }
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const notionRes = await fetch(`https://api.notion.com/v1/databases/${RECIPES_DB_ID}/query`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Notion-Version': NOTION_VERSION,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        page_size: 100,
        sorts: [{ property: 'Recipe', direction: 'ascending' }],
      }),
    });
    const data = await notionRes.json();
    if (!notionRes.ok) throw new Error(data.message || `Notion error ${notionRes.status}`);

    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).json(data.results.map(toRecipe));
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
