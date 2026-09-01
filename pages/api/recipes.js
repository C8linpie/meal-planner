import { Client } from '@notionhq/client';

// Your Notion database's real column names (confirmed by inspecting it).
// Override any of these with an env var of the same name if you rename a
// column later.
const PROP = {
  name: process.env.NOTION_PROP_NAME || 'Recipe',
  tags: process.env.NOTION_PROP_TAGS || 'Tags',
  source: process.env.NOTION_PROP_SOURCE || 'Source',
  link: process.env.NOTION_PROP_LINK || 'Recipe link',
  cook: process.env.NOTION_PROP_COOK || 'Cook (mins)',
  prep: process.env.NOTION_PROP_PREP || 'Prep (mins)',
  serves: process.env.NOTION_PROP_SERVES || 'Serves',
  protein: process.env.NOTION_PROP_PROTEIN || 'Protein',
};

// Most of your recipes store ingredients/method as page content (a heading
// plus a list), not as database columns, so we look for headings matching
// these patterns rather than reading a fixed column.
const INGREDIENT_HEADING = /ingredient/i;
const METHOD_HEADING = /(method|instruction|steps?|directions)/i;

function getTitle(prop) {
  if (!prop || prop.type !== 'title') return '';
  return prop.title.map((t) => t.plain_text).join('').trim();
}
function getMultiSelect(prop) {
  if (!prop || prop.type !== 'multi_select') return [];
  return prop.multi_select.map((s) => s.name);
}
function getSelect(prop) {
  if (!prop || prop.type !== 'select' || !prop.select) return '';
  return prop.select.name;
}
function getUrl(prop) {
  if (!prop || prop.type !== 'url') return '';
  return prop.url || '';
}
function getNumber(prop) {
  if (!prop || prop.type !== 'number') return null;
  return prop.number;
}

function isHeading(block) {
  return block.type === 'heading_1' || block.type === 'heading_2' || block.type === 'heading_3';
}
function blockPlainText(block) {
  const rt = block[block.type] && block[block.type].rich_text;
  if (!rt) return '';
  return rt.map((t) => t.plain_text).join('');
}

async function getAllBlocks(notion, blockId) {
  let blocks = [];
  let cursor;
  do {
    const resp = await notion.blocks.children.list({
      block_id: blockId,
      start_cursor: cursor,
      page_size: 100,
    });
    blocks = blocks.concat(resp.results);
    cursor = resp.has_more ? resp.next_cursor : undefined;
  } while (cursor);
  return blocks;
}

// Reads the page body looking for an "Ingredients" heading (collects the
// list items under it) and a "Method"/"Instructions" heading (collects and
// numbers the steps under it). Anything under an unrelated heading is
// ignored.
function parseRecipeBlocks(blocks) {
  const ingredients = [];
  const instructions = [];
  let section = null;
  let stepNum = 1;

  for (const block of blocks) {
    if (isHeading(block)) {
      const text = blockPlainText(block);
      if (INGREDIENT_HEADING.test(text)) {
        section = 'ingredients';
      } else if (METHOD_HEADING.test(text)) {
        section = 'method';
        stepNum = 1;
      } else {
        section = null;
      }
      continue;
    }

    if (section === 'ingredients') {
      if (['bulleted_list_item', 'numbered_list_item', 'to_do'].includes(block.type)) {
        const t = blockPlainText(block).trim();
        if (t) ingredients.push(t);
      }
    } else if (section === 'method') {
      if (['numbered_list_item', 'bulleted_list_item', 'to_do'].includes(block.type)) {
        const t = blockPlainText(block).trim();
        if (t) {
          instructions.push(`${stepNum}. ${t}`);
          stepNum++;
        }
      } else if (block.type === 'paragraph') {
        const t = blockPlainText(block).trim();
        if (t) instructions.push(t);
      }
    }
  }

  return { ingredients: ingredients.join('\n'), instructions: instructions.join('\n') };
}

// Fallback only: used if a recipe's real Notion "Protein" column is empty.
// Guesses a protein from the ingredient text so the filter still has
// something reasonable to show.
function guessProtein(ingredientsText) {
  const t = ingredientsText.toLowerCase();
  if (/\bchicken\b/.test(t)) return 'Chicken';
  if (/(salmon|cod|fish|prawn|shrimp|tuna|anchov)/.test(t)) return 'Fish';
  if (/(beef|lamb|pork|bacon|sausage|mince|steak)/.test(t)) return 'Meat';
  if (/\btofu\b/.test(t)) return 'Tofu';
  if (/(egg|feta|cheese|halloumi|paneer|yoghurt|yogurt)/.test(t)) return 'Mixed';
  return 'None';
}

export default async function handler(req, res) {
  if (!process.env.NOTION_TOKEN || !process.env.NOTION_DATABASE_ID) {
    res.status(500).json({
      error:
        'NOTION_TOKEN / NOTION_DATABASE_ID are not set. Add them in Vercel Project Settings -> Environment Variables.',
    });
    return;
  }

  const notion = new Client({ auth: process.env.NOTION_TOKEN });
  const databaseId = process.env.NOTION_DATABASE_ID;

  try {
    let pages = [];
    let cursor;
    do {
      const response = await notion.databases.query({
        database_id: databaseId,
        start_cursor: cursor,
      });
      pages = pages.concat(response.results);
      cursor = response.has_more ? response.next_cursor : undefined;
    } while (cursor);

    const recipes = {};

    for (const page of pages) {
      const props = page.properties;
      const name = getTitle(props[PROP.name]);
      if (!name) continue;

      const tags = getMultiSelect(props[PROP.tags]);
      const source = getSelect(props[PROP.source]);
      const link = getUrl(props[PROP.link]);
      const cook = getNumber(props[PROP.cook]);
      const prep = getNumber(props[PROP.prep]);
      const serves = getNumber(props[PROP.serves]);
      const proteinProp = getSelect(props[PROP.protein]);

      const blocks = await getAllBlocks(notion, page.id);
      let { ingredients, instructions } = parseRecipeBlocks(blocks);

      if (!instructions) {
        instructions = link ? `Full recipe: ${link}` : 'No instructions available in Notion yet.';
      }
      const metaLine = [
        serves ? `Serves ${serves}` : null,
        prep ? `Prep ${prep} min` : null,
        cook ? `Cook ${cook} min` : null,
      ]
        .filter(Boolean)
        .join(' · ');
      if (metaLine) instructions = `${metaLine}\n\n${instructions}`;

      if (!ingredients && link) {
        ingredients = `See full recipe: ${link}`;
      }

      recipes[name] = {
        category: tags.length ? tags.join(', ') : source || 'Other',
        protein: proteinProp || guessProtein(ingredients),
        ingredients,
        pantry: '',
        instructions,
      };
    }

    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300');
    res.status(200).json(recipes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || 'Failed to fetch from Notion.' });
  }
}
