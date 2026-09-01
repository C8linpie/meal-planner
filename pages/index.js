import Head from 'next/head';
import { useEffect } from 'react';

const CSS = `
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    background: linear-gradient(135deg, #f9f7f4 0%, #f5f2ed 100%);
    height: 100vh;
    display: flex;
    flex-direction: column;
}

.header {
    background: linear-gradient(135deg, #1a2633 0%, #2d3e4f 100%);
    padding: 1.5rem 1.25rem;
    box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}

.header h1 {
    font-size: 24px;
    font-weight: 600;
    color: #f9f7f4;
    letter-spacing: -0.5px;
}

.header p {
    font-size: 13px;
    color: #a8b5c4;
    font-weight: 400;
    margin-top: 4px;
}

.tabs {
    display: flex;
    gap: 24px;
    padding: 1rem 1.25rem;
    border-bottom: 1px solid rgba(122, 155, 127, 0.15);
    background: rgba(255,255,255,0.4);
}

.tabs button {
    padding: 8px 0;
    background: none;
    border: none;
    border-bottom: 2px solid transparent;
    color: #8a9aaa;
    cursor: pointer;
    font-size: 14px;
    font-weight: 400;
    letter-spacing: -0.3px;
}

.tabs button.active {
    border-bottom-color: #7a9b7f;
    color: #1a2633;
    font-weight: 500;
}

.content {
    flex: 1;
    overflow-y: auto;
    padding: 1.5rem 1.25rem;
}

.tab-content {
    display: none;
}

.tab-content.active {
    display: block;
}

.week-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
    gap: 12px;
    margin-bottom: 2rem;
}

.day-card {
    background: white;
    border-radius: 12px;
    padding: 12px;
    border: 1px solid #e0dcd7;
    box-shadow: 0 2px 4px rgba(0,0,0,0.03);
}

.day-title {
    font-size: 11px;
    font-weight: 600;
    color: #8a9aaa;
    margin-bottom: 8px;
    text-transform: uppercase;
}

.filter-buttons {
    display: flex;
    gap: 3px;
    margin-bottom: 8px;
    flex-wrap: wrap;
}

.filter-btn {
    padding: 4px 8px;
    font-size: 10px;
    border-radius: 5px;
    border: 0.5px solid #e0dcd7;
    background: transparent;
    color: #8a9aaa;
    cursor: pointer;
    font-weight: 500;
}

.filter-btn.active {
    border-color: #7a9b7f;
    background: #7a9b7f;
    color: white;
}

select {
    width: 100%;
    padding: 7px 8px;
    margin-bottom: 6px;
    border-radius: 6px;
    border: 0.5px solid #e0dcd7;
    font-size: 12px;
    background: white;
    color: #1a2633;
    cursor: pointer;
}

.view-btn {
    width: 100%;
    margin-top: 8px;
    padding: 6px;
    font-size: 11px;
    background: #7a9b7f;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    font-weight: 500;
}

.shopping-container {
    background: linear-gradient(135deg, rgba(122, 155, 127, 0.08) 0%, rgba(193, 122, 74, 0.04) 100%);
    border: 1px solid #7a9b7f;
    border-radius: 12px;
    padding: 1.25rem;
    margin-bottom: 1.5rem;
}

.shopping-container h3 {
    font-size: 14px;
    margin: 0 0 12px 0;
    color: #1a2633;
    font-weight: 600;
    letter-spacing: -0.3px;
}

.shopping-container p {
    font-size: 12px;
    color: #8a9aaa;
    margin: 0 0 12px 0;
}

.shopping-list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.shopping-list li {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
}

.shopping-list input[type="checkbox"] {
    cursor: pointer;
    accent-color: #7a9b7f;
}

.shopping-list label {
    cursor: pointer;
    color: #1a2633;
    flex: 1;
}

.shopping-list input[type="checkbox"]:checked + label {
    text-decoration: line-through;
    color: #8a9aaa;
}

.recipes-header {
    font-size: 18px;
    margin: 0 0 1.5rem 0;
    color: #1a2633;
    font-weight: 600;
}

input[type="text"],
select,
textarea {
    width: 100%;
    margin-bottom: 10px;
    padding: 11px 12px;
    border-radius: 8px;
    border: 1px solid #e0dcd7;
    font-size: 14px;
    background: #fafbfc;
    font-family: inherit;
}

textarea {
    resize: vertical;
    min-height: 60px;
}

.add-btn, .btn-primary {
    width: 100%;
    padding: 10px 14px;
    background: #7a9b7f;
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-size: 13px;
    font-weight: 500;
}

.recipes-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 12px;
}

.recipe-card {
    background: white;
    border-radius: 12px;
    padding: 1rem;
    border: 1px solid #e0dcd7;
    box-shadow: 0 2px 4px rgba(0,0,0,0.03);
}

.recipe-card h4 {
    font-size: 13px;
    font-weight: 600;
    margin: 0 0 4px 0;
    color: #1a2633;
}

.recipe-card p {
    font-size: 11px;
    color: #8a9aaa;
    margin: 0 0 8px 0;
}

.recipe-ingredients {
    font-size: 12px;
    color: #8a9aaa;
    margin: 0 0 12px 0;
    line-height: 1.4;
    max-height: 50px;
    overflow: hidden;
}

.recipe-buttons {
    display: flex;
    gap: 6px;
}

.recipe-buttons button {
    flex: 1;
    padding: 8px 10px;
    background: #7a9b7f;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 12px;
    font-weight: 500;
}

.modal {
    display: none;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0,0,0,0.7);
    z-index: 1001;
    overflow: hidden;
    padding: 20px;
}

.modal.active {
    display: flex;
    align-items: center;
    justify-content: center;
}

.modal-content {
    background: white;
    border-radius: 16px;
    width: 100%;
    max-width: 500px;
    max-height: 85vh;
    display: flex;
    flex-direction: column;
    overflow: hidden;
}

.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.5rem;
    border-bottom: 1px solid #e0dcd7;
    flex-shrink: 0;
}

.modal-header h2 {
    font-size: 18px;
    margin: 0;
    color: #1a2633;
    font-weight: 600;
}

.close-btn {
    background: none;
    border: none;
    font-size: 24px;
    cursor: pointer;
    color: #8a9aaa;
    padding: 0;
    width: 30px;
    height: 30px;
}

.modal-body {
    padding: 1.5rem;
    overflow-y: auto;
    flex: 1;
}

.modal-footer {
    padding: 1.5rem;
    border-top: 1px solid #e0dcd7;
    display: flex;
    gap: 8px;
    flex-shrink: 0;
}

.modal-footer button {
    flex: 1;
    padding: 12px;
    background: #7a9b7f;
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
}

.modal-footer button.secondary {
    background: #e0dcd7;
    color: #1a2633;
}

.meal-section {
    margin-bottom: 1.5rem;
}

.meal-section h3 {
    font-size: 12px;
    color: #8a9aaa;
    text-transform: uppercase;
    font-weight: 600;
    margin: 0 0 12px 0;
}

.ingredients-list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.ingredients-list li {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
}

.ingredients-list input[type="checkbox"] {
    cursor: pointer;
    accent-color: #7a9b7f;
}

.ingredients-list label {
    cursor: pointer;
    color: #1a2633;
    flex: 1;
}

.ingredients-list input[type="checkbox"]:checked + label {
    text-decoration: line-through;
    color: #8a9aaa;
}

.instructions {
    font-size: 14px;
    color: #1a2633;
    line-height: 1.8;
    white-space: pre-wrap;
}

`;

const BODY_HTML = `
    <div class="header">
        <h1>Weekly Planner</h1>
        <p>Plan the week, reduce the friction</p>
    </div>

    <div class="tabs">
        <button id="tab-week" class="active">This Week</button>
        <button id="tab-recipes">Recipes</button>
    </div>

    <div class="content">
        <!-- THIS WEEK TAB -->
        <div id="week-tab" class="tab-content active">
            <div id="week-grid" class="week-grid"></div>

            <div id="shopping-container" class="shopping-container" style="display: none;">
                <h3>Shopping List by Meal</h3>
                <p>Uncheck items you already have</p>
                <div id="shopping-list-by-meal" style="display: flex; flex-direction: column; gap: 1.5rem;"></div>
            </div>
        </div>

        <!-- RECIPES TAB -->
        <div id="recipes-tab" class="tab-content">
            <h2 class="recipes-header">Recipes</h2>

            <div id="recipes-grid" class="recipes-grid"></div>
        </div>
    </div>

    <!-- MEAL DETAILS MODAL -->
    <div id="meal-details-modal" class="modal">
        <div class="modal-content">
            <div class="modal-header">
                <h2 id="meal-title"></h2>
                <button class="close-btn" id="close-meal-btn">✕</button>
            </div>

            <div class="modal-body">
                <div class="meal-section">
                    <h3>Ingredients</h3>
                    <ul id="meal-ingredients-list" class="ingredients-list"></ul>
                </div>

                <div class="meal-section" id="meal-pantry-section" style="display: none;">
                    <h3>Pantry</h3>
                    <ul id="meal-pantry-list" class="ingredients-list"></ul>
                </div>

                <div class="meal-section">
                    <h3>Instructions</h3>
                    <div id="meal-instructions" class="instructions"></div>
                </div>
            </div>

            <div class="modal-footer">
                <button class="secondary" id="close-meal-btn-2">Close</button>
            </div>
        </div>
    </div>
`;

// Used only if the Notion fetch fails, so the app still renders something
// useful (e.g. during first-time setup before env vars are configured).
const FALLBACK_RECIPES = {
  'Pasta with sauce': {
    ingredients: 'Pasta (500g)\nJarred sauce (500ml or more)',
    pantry: 'Garlic (2 cloves, optional)\nOlive oil (1 tbsp)\nParmesan (optional)',
    category: 'Pasta',
    protein: 'None',
    instructions: '1. Cook pasta according to package\n2. Heat sauce in a saucepan\n3. Drain pasta, toss with sauce\n4. Serve immediately',
  },
};

function initApp(recipesData) {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  let week = {};
  let recipes = recipesData;
  let shoppingChecks = {};
  let currentFilter = {};

  days.forEach((day) => {
    week[day] = { meal: '', cook: '' };
    currentFilter[day] = 'alphabet';
  });

  // Tab switching
  document.getElementById('tab-week').addEventListener('click', () => {
    document.getElementById('week-tab').classList.add('active');
    document.getElementById('recipes-tab').classList.remove('active');
    document.getElementById('tab-week').classList.add('active');
    document.getElementById('tab-recipes').classList.remove('active');
  });
  document.getElementById('tab-recipes').addEventListener('click', () => {
    document.getElementById('recipes-tab').classList.add('active');
    document.getElementById('week-tab').classList.remove('active');
    document.getElementById('tab-recipes').classList.add('active');
    document.getElementById('tab-week').classList.remove('active');
  });

  // Modal controls
  document.getElementById('close-meal-btn').addEventListener('click', () => {
    document.getElementById('meal-details-modal').classList.remove('active');
  });
  document.getElementById('close-meal-btn-2').addEventListener('click', () => {
    document.getElementById('meal-details-modal').classList.remove('active');
  });

  // Show meal details
  function showMealDetails(mealName) {
    const recipe = recipes[mealName];
    if (!recipe) return;

    document.getElementById('meal-title').textContent = mealName;

    const ingredientsList = document.getElementById('meal-ingredients-list');
    ingredientsList.innerHTML = recipe.ingredients
      .split('\n')
      .filter((ing) => ing.trim())
      .map((ing) => `<li>${ing.trim()}</li>`)
      .join('');

    const pantrySection = document.getElementById('meal-pantry-section');
    const pantryList = document.getElementById('meal-pantry-list');
    const pantryItems = (recipe.pantry || '').split('\n').filter((p) => p.trim());
    if (pantryItems.length) {
      pantryList.innerHTML = pantryItems.map((p) => `<li>${p.trim()}</li>`).join('');
      pantrySection.style.display = '';
    } else {
      pantryList.innerHTML = '';
      pantrySection.style.display = 'none';
    }

    document.getElementById('meal-instructions').textContent = recipe.instructions || 'No instructions available';
    document.getElementById('meal-details-modal').classList.add('active');
  }

  // Get filtered meals
  function getFilteredMeals(filter) {
    const mealNames = Object.keys(recipes);
    if (filter === 'alphabet') {
      return { All: mealNames.sort() };
    } else if (filter === 'protein') {
      const byProtein = {};
      mealNames.forEach((name) => {
        const prot = recipes[name].protein || 'Other';
        if (!byProtein[prot]) byProtein[prot] = [];
        byProtein[prot].push(name);
      });
      return byProtein;
    } else if (filter === 'cuisine') {
      const byCategory = {};
      mealNames.forEach((name) => {
        const cat = recipes[name].category || 'Other';
        if (!byCategory[cat]) byCategory[cat] = [];
        byCategory[cat].push(name);
      });
      return byCategory;
    }
  }

  // Render week
  function renderWeek() {
    const grid = document.getElementById('week-grid');
    grid.innerHTML = '';
    days.forEach((day) => {
      const card = document.createElement('div');
      card.className = 'day-card';

      const title = document.createElement('div');
      title.className = 'day-title';
      title.textContent = day;

      const filterContainer = document.createElement('div');
      filterContainer.className = 'filter-buttons';

      ['alphabet', 'protein', 'cuisine'].forEach((filter) => {
        const btn = document.createElement('button');
        const labels = { alphabet: 'A-Z', protein: 'Protein', cuisine: 'Cuisine' };
        btn.textContent = labels[filter];
        btn.className = 'filter-btn' + (currentFilter[day] === filter ? ' active' : '');
        btn.addEventListener('click', () => {
          currentFilter[day] = filter;
          renderWeek();
        });
        filterContainer.appendChild(btn);
      });

      const mealSelect = document.createElement('select');
      const filtered = getFilteredMeals(currentFilter[day]);
      let html = '<option value="">Choose meal</option>';
      Object.keys(filtered)
        .sort()
        .forEach((category) => {
          html += `<optgroup label="${category}">`;
          filtered[category].sort().forEach((meal) => {
            html += `<option value="${meal}">${meal}</option>`;
          });
          html += '</optgroup>';
        });
      mealSelect.innerHTML = html;
      mealSelect.value = week[day].meal;
      mealSelect.addEventListener('change', (e) => {
        week[day].meal = e.target.value;
        updateShoppingList();
        renderWeek();
      });

      const cookSelect = document.createElement('select');
      cookSelect.innerHTML =
        '<option value="">Cook?</option><option value="Cait">Cait</option><option value="Russel">Russel</option><option value="Takeaway">Takeaway</option>';
      cookSelect.value = week[day].cook;
      cookSelect.addEventListener('change', (e) => (week[day].cook = e.target.value));

      card.appendChild(title);
      card.appendChild(filterContainer);
      card.appendChild(mealSelect);
      card.appendChild(cookSelect);

      if (week[day].meal) {
        const mealLinkBtn = document.createElement('button');
        mealLinkBtn.className = 'view-btn';
        mealLinkBtn.textContent = '→ View details';
        mealLinkBtn.addEventListener('click', () => showMealDetails(week[day].meal));
        card.appendChild(mealLinkBtn);
      }

      grid.appendChild(card);
    });
  }

  // Update shopping list
  function updateShoppingList() {
    const mealsByDay = {};
    let hasAnyMeal = false;

    days.forEach((day) => {
      if (week[day].meal && recipes[week[day].meal]) {
        hasAnyMeal = true;
        mealsByDay[day] = {
          meal: week[day].meal,
          ingredients: recipes[week[day].meal].ingredients.split('\n').map((i) => i.trim()).filter((i) => i),
          pantry: (recipes[week[day].meal].pantry || '').split('\n').map((i) => i.trim()).filter((i) => i),
        };
      }
    });

    const container = document.getElementById('shopping-container');
    const listContainer = document.getElementById('shopping-list-by-meal');

    if (hasAnyMeal) {
      container.style.display = 'block';
      listContainer.innerHTML = '';

      days.forEach((day) => {
        if (mealsByDay[day]) {
          const { meal, ingredients, pantry } = mealsByDay[day];

          const mealSection = document.createElement('div');
          mealSection.style.cssText = 'border: 1px solid #e0dcd7; border-radius: 8px; padding: 12px; background: white;';

          const header = document.createElement('h4');
          header.style.cssText =
            'font-size: 12px; font-weight: 600; color: #1a2633; margin: 0 0 10px 0; text-transform: uppercase; letter-spacing: 0.5px;';
          header.textContent = day + ' — ' + meal;
          mealSection.appendChild(header);

          if (ingredients.length > 0) {
            const ingredientsList = document.createElement('ul');
            ingredientsList.style.cssText = 'list-style: none; padding: 0; margin: 0 0 12px 0; display: flex; flex-direction: column; gap: 6px;';

            ingredients.forEach((item) => {
              const id = 'check-' + day + '-' + item.replace(/\s/g, '-').replace(/\(/g, '').replace(/\)/g, '');
              const isUnchecked = shoppingChecks[id] === false;

              const li = document.createElement('li');
              li.style.cssText = 'display: flex; align-items: center; gap: 8px; font-size: 13px;';
              li.innerHTML = `
                                    <input type="checkbox" id="${id}" ${!isUnchecked ? 'checked' : ''} style="cursor: pointer; accent-color: #7a9b7f;">
                                    <label for="${id}" style="cursor: pointer; color: #1a2633; flex: 1; ${isUnchecked ? 'text-decoration: line-through; color: #8a9aaa;' : ''}">${item}</label>
                                `;
              ingredientsList.appendChild(li);

              const checkbox = li.querySelector('input');
              checkbox.addEventListener('change', () => {
                shoppingChecks[id] = !!checkbox.checked;
              });
            });

            mealSection.appendChild(ingredientsList);
          }

          if (pantry.length > 0) {
            const pantryLabel = document.createElement('h5');
            pantryLabel.style.cssText =
              'font-size: 11px; font-weight: 600; color: #8a9aaa; margin: 12px 0 8px 0; text-transform: uppercase; letter-spacing: 0.5px; opacity: 0.7;';
            pantryLabel.textContent = 'Pantry Check';
            mealSection.appendChild(pantryLabel);

            const pantryList = document.createElement('ul');
            pantryList.style.cssText = 'list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 6px;';

            pantry.forEach((item) => {
              const id = 'check-pant-' + day + '-' + item.replace(/\s/g, '-').replace(/\(/g, '').replace(/\)/g, '');
              const isUnchecked = shoppingChecks[id] === false;

              const li = document.createElement('li');
              li.style.cssText = 'display: flex; align-items: center; gap: 8px; font-size: 13px;';
              li.innerHTML = `
                                    <input type="checkbox" id="${id}" ${isUnchecked ? '' : ''} style="cursor: pointer; accent-color: #7a9b7f;">
                                    <label for="${id}" style="cursor: pointer; color: #1a2633; flex: 1; ${isUnchecked ? 'text-decoration: line-through; color: #8a9aaa;' : ''}">${item}</label>
                                `;
              pantryList.appendChild(li);

              const checkbox = li.querySelector('input');
              checkbox.addEventListener('change', () => {
                shoppingChecks[id] = !!checkbox.checked;
              });
            });

            mealSection.appendChild(pantryList);
          }

          listContainer.appendChild(mealSection);
        }
      });
    } else {
      container.style.display = 'none';
    }
  }

  // Render recipes
  function renderRecipes() {
    const grid = document.getElementById('recipes-grid');
    grid.innerHTML = '';
    Object.entries(recipes)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .forEach(([name, data]) => {
        const card = document.createElement('div');
        card.className = 'recipe-card';

        const title = document.createElement('h4');
        title.textContent = name;

        const cat = document.createElement('p');
        cat.textContent = (data.category || 'Other') + ' • ' + (data.protein || 'None');

        const ingr = document.createElement('p');
        ingr.className = 'recipe-ingredients';
        ingr.textContent = data.ingredients.split('\n').join(', ');

        const buttonContainer = document.createElement('div');
        buttonContainer.className = 'recipe-buttons';

        const viewBtn = document.createElement('button');
        viewBtn.textContent = '👁 View';
        viewBtn.addEventListener('click', () => showMealDetails(name));

        buttonContainer.appendChild(viewBtn);
        card.appendChild(title);
        card.appendChild(cat);
        card.appendChild(ingr);
        card.appendChild(buttonContainer);
        grid.appendChild(card);
      });
  }

  // Initialize
  renderWeek();
  renderRecipes();
}

export default function Home() {
  useEffect(() => {
    let cancelled = false;

    async function boot() {
      let recipes = FALLBACK_RECIPES;
      try {
        const res = await fetch('/api/recipes');
        const data = await res.json();
        if (res.ok && data && Object.keys(data).length > 0) {
          recipes = data;
        } else if (!res.ok) {
          console.warn('Notion fetch failed, using fallback recipes:', data.error);
        }
      } catch (err) {
        console.warn('Notion fetch failed, using fallback recipes:', err);
      }
      if (!cancelled) {
        initApp(recipes);
      }
    }

    boot();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <>
      <Head>
        <title>Weekly Meal Planner</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
      </Head>
      <div dangerouslySetInnerHTML={{ __html: BODY_HTML }} />
    </>
  );
}
