# Weekly Meal Planner

A weekly meal planner that pulls your recipes live from Notion. Plan meals for
the week, auto-generate a shopping list, and browse/add recipes.

## How it's wired up

- `pages/index.js` — the planner UI (ported from the original Claude artifact).
- `pages/api/recipes.js` — a serverless function that queries your Notion
  "Recipes" database and reads each recipe's Ingredients/Method content,
  so your Notion token never reaches the browser.
- Recipes you add or edit in the app itself only live in that browser tab's
  session (they are **not** written back to Notion). This build is a
  one-way sync: Notion -> app.

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
- **Instructions**: reads the list/paragraphs under a heading containing
  "Method", "Instructions", "Steps", or "Directions", and numbers them.
- **Category** (used for the "Cuisine" filter): your Notion **Tags**
  (e.g. "Vegetarian, Weeknight"), falling back to **Source** if a recipe has
  no tags.
- **Protein** (used for the "Protein" filter): there's no protein column in
  your database, so this is **guessed** from keywords in the ingredient list
  (chicken, fish, beef/lamb/pork, tofu, egg/cheese, etc). It's an
  approximation — recipes can come out miscategorized. If that's annoying,
  the cleanest fix is adding a real "Protein" select column in Notion and
  extending `pages/api/recipes.js` to read it directly (see the `PROP`
  object at the top of that file).
- Recipes that only have an external **Recipe link** (no Ingredients/Method
  written in Notion, e.g. "Ramen") show that link in place of full
  ingredients/instructions.

## Changing property names later

If you rename a column in Notion, you don't need to touch the code — set the
matching `NOTION_PROP_*` environment variable in Vercel (see `.env.example`
for the full list) to the new name.
