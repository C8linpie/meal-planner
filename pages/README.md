# Weekly Meal Planner

A weekly meal planner that pulls your recipes live from Notion. Plan meals for
the week, auto-generate a shopping list, and browse recipes.

## How it's wired up

- `pages/index.js` — the planner UI (ported from the original Claude artifact).
- `pages/api/recipes.js` — a serverless function that queries your Notion
  "Recipes" database and reads each recipe's Ingredients/Method content,
  so your Notion token never reaches the browser.
- The Recipes tab is **read-only** — recipe management (adding, editing,
  removing recipes) happens entirely in Notion. This is a one-way sync:
  Notion -> app. To change a recipe, edit it in Notion; the app picks it up
  on the next load (Notion data is cached for up to 60 seconds).
- `pages/api/plan.js` — a serverless function that saves and loads the
  shared "This Week" plan and shopping list, so it's the same for everyone
  who opens the app rather than living only in one browser tab. See
  "Shared plan + shopping list" below.

## 1. Make sure your Notion integration can see the database

1. Go to https://www.notion.so/my-integrations and confirm your integration
   exists (you already have a token for it).
2. Open your Recipes database in Notion → click the `...` menu (top right) →
   **Connections** → add your integration if it isn't already listed. Without
   this step, the API will return an empty list even with a valid token.

## 2. Deploy to Vercel

1. Push this project to a GitHub repo.
2. In Vercel, "Add New Project" → import that repo.
3. Before the first deploy (or right after, then redeploy), go to
   **Project Settings → Environment Variables** and add:
   - `NOTION_TOKEN` = your integration's secret token
   - `NOTION_DATABASE_ID` = `fe867f9d-2c3f-4279-b5d2-d4a5988956fe`
4. Deploy. Visit the deployed URL — the "This Week" and "Recipes" tabs should
   populate from your Notion data.

## 3. Connect shared storage for the weekly plan + shopping list

Without this step, the "This Week" plan and shopping list still work, but
only in the browser tab they were made in — nobody else sees them, and
they're gone on refresh.

1. In Vercel, open this project → **Storage** tab → **Create Database** →
   choose **Upstash (Redis)** → follow the prompts to connect it to this
   project. Vercel fills in the required environment variables for you.
2. Redeploy. Now whenever anyone opens the app URL — you, your husband,
   anyone with the link — they see the same live plan and the same
   checked-off shopping list items, and any change either of you makes
   saves for the other. There's no login; it works like a shared document.

## Local development (optional)

```bash
npm install
cp .env.example .env.local   # then fill in your real token + database ID
npm run dev
```

## How your Notion data maps to the app

Your "Recipes" database uses columns for Cook/Prep time, Serves, Source,
Tags, and an optional external Recipe link — the actual ingredients and
method are page content (headings + lists), not columns. The API route
handles this by:

- **Ingredients**: reads the bullet/numbered list under any heading containing
  the word "Ingredients".
- **Pantry** (optional): reads the list under any heading containing the
  word "Pantry" — staples you always have (oil, salt, spices) — and keeps
  them in a separate "Pantry Check" section, split out from the main
  shopping-list ingredients. Skip this heading entirely if you don't want
  the split for a given recipe.
- **Instructions**: reads the list/paragraphs under a heading containing
  "Method", "Instructions", "Steps", or "Directions", and numbers them.
- **Category** (used for the "Cuisine" filter): your Notion **Tags**
  (e.g. "Vegetarian, Weeknight"), falling back to **Source** if a recipe has
  no tags.
- **Protein** (used for the "Protein" filter): read directly from your
  Notion **Protein** select column. If a recipe's Protein column is left
  empty, the app falls back to guessing from keywords in the ingredient
  list (chicken, fish, beef/lamb/pork, tofu, egg/cheese, etc.) so the
  filter still has something to show.
- Recipes that only have an external **Recipe link** (no Ingredients/Method
  written in Notion, e.g. "Ramen") show that link in place of full
  ingredients/instructions.

## Changing property names later

If you rename a column in Notion, you don't need to touch the code — set the
matching `NOTION_PROP_*` environment variable in Vercel (see `.env.example`
for the full list) to the new name.
