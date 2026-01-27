# Ingredient Categories Reference Guide

## Overview

This guide helps you categorize ingredients for optimal recipe search algorithm performance. Each ingredient must be assigned one of four categories: **key**, **important**, **flavor**, or **base**.

---

## Category Weights & Purpose

| Category | Weight | Impact on Search | When to Use |
|----------|--------|------------------|-------------|
| **key** | 10 | Highest - defines the dish | Main proteins & starches that are the foundation of the recipe |
| **important** | 5 | High - significantly affects dish | Major components like vegetables, dairy, sauces |
| **flavor** | 2 | Medium - adds character | Aromatics, spices, herbs, condiments |
| **base** | 0 | None - always available | Salt, pepper, oil, water, sugar, flour |

---

## Decision Flowchart

```
START: Look at the ingredient
  ↓
Is it a basic seasoning or cooking medium?
(salt, pepper, oil, water, flour, sugar)
  YES → BASE (weight: 0)
  NO → Continue
  ↓
Is it the main protein or starch?
(chicken, beef, pasta, rice, fish)
  YES → KEY (weight: 10)
  NO → Continue
  ↓
Does removing it significantly change the dish?
(tomatoes, cheese, eggs, onions, major vegetables)
  YES → IMPORTANT (weight: 5)
  NO → Continue
  ↓
Is it for flavoring/seasoning?
(garlic, basil, cumin, lemon, soy sauce)
  YES → FLAVOR (weight: 2)
```

---

## Category: KEY (Weight: 10)

### Definition
Main proteins and starches that **define what the dish is**. Without these, it's a completely different recipe.

### Examples:

#### Proteins:
- **Poultry**: chicken, chicken breast, chicken thighs, turkey, turkey breast, duck, quail
- **Beef**: ground beef, beef steak, beef brisket, beef roast, ribeye, sirloin
- **Pork**: pork chops, pork tenderloin, pork shoulder, bacon (when main ingredient), ham (when main), sausage (when main)
- **Lamb**: lamb chops, lamb leg, ground lamb, lamb shank
- **Seafood**: salmon, tuna, cod, tilapia, shrimp, prawns, scallops, mussels, clams, crab, lobster, halibut, sea bass
- **Plant Proteins**: tofu, tempeh, seitan

#### Starches & Grains:
- **Pasta**: pasta, spaghetti, penne, fettuccine, linguine, rigatoni, farfalle, lasagna noodles
- **Rice**: rice, basmati rice, jasmine rice, brown rice, arborio rice, wild rice
- **Other Grains**: quinoa, couscous, bulgur, barley, farro, polenta
- **Noodles**: ramen noodles, udon noodles, rice noodles, egg noodles, soba noodles
- **Bread/Dough**: bread, tortillas, pita bread, flatbread, pizza dough

### Common Substitutes for KEY Ingredients:

| Ingredient | Substitutes |
|------------|-------------|
| Chicken breast | Turkey breast, chicken thighs, pork tenderloin |
| Ground beef | Ground turkey, ground pork, ground lamb, lentils (vegan) |
| Salmon | Trout, arctic char, tuna, cod |
| Shrimp | Prawns, scallops, chicken breast |
| Pasta | Rice noodles, zucchini noodles, spaghetti squash, egg noodles |
| Rice | Quinoa, couscous, cauliflower rice, bulgur |
| Tofu | Tempeh, seitan, chicken breast, paneer |

---

## Category: IMPORTANT (Weight: 5)

### Definition
Major components that **significantly affect the flavor, texture, or appearance** of the dish. Removing them changes the recipe substantially.

### Examples:

#### Dairy:
- **Cheese**: parmesan, mozzarella, cheddar, feta, goat cheese, ricotta, cream cheese, gruyere, provolone
- **Cream & Milk**: heavy cream, milk, half and half, evaporated milk, coconut milk (when major component)
- **Yogurt**: greek yogurt, plain yogurt, sour cream
- **Butter**: butter, ghee
- **Eggs**: eggs, egg yolks, egg whites

#### Vegetables (Major):
- **Tomatoes**: tomatoes, cherry tomatoes, roma tomatoes, canned tomatoes, tomato paste, tomato sauce, sun-dried tomatoes
- **Onions**: onion, red onion, white onion, yellow onion, shallot, leek, green onion, scallion
- **Peppers**: bell pepper, red pepper, green pepper, yellow pepper, jalapeño, poblano
- **Carrots**: carrots, baby carrots
- **Celery**: celery, celery root
- **Mushrooms**: mushrooms, button mushrooms, shiitake, portobello, cremini
- **Leafy Greens**: spinach, kale, arugula, swiss chard, collard greens, lettuce, cabbage
- **Cruciferous**: broccoli, cauliflower, brussels sprouts
- **Squash**: zucchini, yellow squash, butternut squash, acorn squash, pumpkin
- **Eggplant**: eggplant

#### Legumes:
- beans, black beans, kidney beans, chickpeas, lentils, pinto beans, white beans, cannellini beans

#### Sauces & Liquids (Major):
- tomato sauce, marinara sauce, cream sauce, alfredo sauce, pesto, curry sauce
- broth, chicken broth, beef broth, vegetable broth, stock
- wine (when used for sauce), white wine, red wine

### Common Substitutes for IMPORTANT Ingredients:

| Ingredient | Substitutes |
|------------|-------------|
| Parmesan | Pecorino romano, grana padano, nutritional yeast |
| Heavy cream | Coconut cream, cashew cream, half and half, milk + butter |
| Eggs | Flax eggs, chia eggs, applesauce (baking) |
| Tomatoes | Tomato paste, tomato sauce, red peppers |
| Onion | Shallot, leek, green onion, onion powder |
| Spinach | Kale, swiss chard, arugula, collard greens |
| Mushrooms | Eggplant, zucchini, tofu |
| Chickpeas | White beans, cannellini beans, lentils |

---

## Category: FLAVOR (Weight: 2)

### Definition
Aromatics, spices, herbs, and condiments that **add flavor and character** but don't define the dish. Recipe would still be recognizable without them.

### Examples:

#### Aromatics:
- **Garlic**: garlic, garlic cloves, minced garlic, roasted garlic
- **Ginger**: ginger, fresh ginger, ground ginger, ginger paste
- **Shallots**: shallots (when used for flavor, not main ingredient)

#### Fresh Herbs:
- basil, oregano, thyme, rosemary, sage, dill, cilantro, parsley, mint, chives, tarragon, bay leaves

#### Dried Spices:
- cumin, paprika, turmeric, cinnamon, nutmeg, curry powder, garam masala, coriander, cardamom, cloves, allspice
- chili powder, cayenne pepper, red pepper flakes, crushed red pepper

#### Acids:
- lemon, lime, lemon juice, lime juice, vinegar, balsamic vinegar, apple cider vinegar, rice vinegar, white wine vinegar

#### Condiments & Sauces (Small amounts):
- soy sauce, fish sauce, worcestershire sauce, hot sauce, sriracha, tabasco, mustard, dijon mustard, ketchup, mayonnaise
- honey, maple syrup, brown sugar (when for seasoning)

#### Other Flavorings:
- coconut milk (when used for flavor), sesame oil, vanilla extract, almond extract, tomato paste (small amount)

### Common Substitutes for FLAVOR Ingredients:

| Ingredient | Substitutes |
|------------|-------------|
| Garlic | Garlic powder, shallots, garlic paste |
| Ginger | Ground ginger, galangal, turmeric |
| Basil | Oregano, parsley, cilantro, mint |
| Cumin | Coriander, caraway seeds, chili powder |
| Lemon juice | Lime juice, vinegar, citric acid |
| Soy sauce | Tamari, coconut aminos, worcestershire sauce |
| Paprika | Chili powder, cayenne, smoked paprika |

---

## Category: BASE (Weight: 0)

### Definition
**Always-available basic ingredients** that are assumed to be in every kitchen. These don't affect recipe scoring.

### Examples:

#### Seasonings:
- salt, sea salt, kosher salt, table salt
- pepper, black pepper, white pepper, ground pepper, peppercorns

#### Oils & Fats:
- oil, olive oil, vegetable oil, canola oil, cooking oil, sunflower oil, grapeseed oil, avocado oil, coconut oil (cooking)

#### Basic Baking:
- flour, all-purpose flour, bread flour, whole wheat flour
- sugar, white sugar, granulated sugar
- baking powder, baking soda, cornstarch, yeast

#### Water:
- water, cold water, boiling water, ice

### Important Notes:
- BASE ingredients are **not counted in scoring**
- Assumed to always be available
- Don't add substitutes for BASE ingredients
- If butter/oil is the main cooking medium (e.g., butter chicken), it might be FLAVOR, not BASE

---

## Special Cases & Guidelines

### 1. **Context Matters**

Same ingredient can be different categories depending on usage:

| Ingredient | As KEY | As IMPORTANT | As FLAVOR | As BASE |
|------------|--------|--------------|-----------|---------|
| Bacon | Main dish: Bacon pasta | Pizza topping | Flavor for soup | - |
| Tomato paste | - | Tomato-based sauce | Small amount for depth | - |
| Butter | - | Butter sauce | Finishing butter | Cooking fat |
| Onion | Onion soup | Major component | Aromatics base | - |

**Rule of Thumb**: If it's **in the recipe name** or **defines the dish**, it's KEY.

### 2. **Pasta & Italian Recipes**

| Ingredient | Category | Notes |
|------------|----------|-------|
| Pasta (any type) | KEY | Defines the dish |
| Parmesan | IMPORTANT | Essential for Italian dishes |
| Tomato sauce | IMPORTANT | Major component |
| Tomato paste | FLAVOR | Small amount for depth |
| Garlic | FLAVOR | Aromatic |
| Basil | FLAVOR | Herb |
| Olive oil | BASE | Cooking oil |
| Mozzarella | IMPORTANT | Major cheese component |
| Ricotta | IMPORTANT | Major filling |

**Example - Spaghetti Carbonara:**
- KEY: spaghetti, bacon (or pancetta), eggs
- IMPORTANT: parmesan cheese
- FLAVOR: black pepper, garlic (optional)
- BASE: salt, olive oil

### 3. **Chicken & Poultry Recipes**

| Ingredient | Category | Notes |
|------------|----------|-------|
| Chicken breast | KEY | Main protein |
| Chicken thighs | KEY | Main protein |
| Chicken stock | IMPORTANT | Major liquid component |
| Cream | IMPORTANT | Major sauce component |
| Onion | IMPORTANT | Major vegetable |
| Garlic | FLAVOR | Aromatic |
| Thyme/Rosemary | FLAVOR | Herbs |
| Lemon | FLAVOR | Acid |
| Olive oil | BASE | Cooking oil |

**Example - Chicken Tikka Masala:**
- KEY: chicken breast
- IMPORTANT: yogurt, tomatoes, cream, onion
- FLAVOR: garam masala, cumin, ginger, garlic, lemon
- BASE: salt, oil

### 4. **Vegetarian/Vegan Recipes**

| Ingredient | Category | Notes |
|------------|----------|-------|
| Tofu | KEY | Main protein |
| Chickpeas | KEY | Main protein/starch |
| Lentils | KEY | Main protein/starch |
| Quinoa | KEY | Main grain |
| Vegetables (major) | IMPORTANT | Main components |
| Coconut milk | IMPORTANT | Major liquid in curry |
| Nutritional yeast | FLAVOR | Flavor enhancer |
| Tamari/Soy sauce | FLAVOR | Seasoning |

**Example - Chickpea Curry:**
- KEY: chickpeas
- IMPORTANT: coconut milk, tomatoes, onion, spinach
- FLAVOR: curry powder, cumin, ginger, garlic, lime
- BASE: salt, oil

---

## Quick Category Test

Ask yourself these questions:

1. **Is it salt, pepper, oil, water, or flour?** → **BASE**
2. **If I remove this, is it still recognizable as the same dish?**
   - NO (completely different dish) → **KEY**
   - YES, but significantly different → **IMPORTANT**
   - YES, just less flavorful → **FLAVOR**

3. **Does the recipe name include this ingredient?**
   - YES → **KEY** (e.g., "Chicken" in "Chicken Curry")

---

## Common Mistakes to Avoid

❌ **Mistake 1**: Categorizing garlic as KEY
- ✅ **Correct**: Garlic is almost always FLAVOR (unless it's "Garlic Bread" where garlic is in the name)

❌ **Mistake 2**: Categorizing oil as FLAVOR
- ✅ **Correct**: Olive oil, vegetable oil are BASE (unless it's infused oil used for specific flavor)

❌ **Mistake 3**: Categorizing all vegetables as IMPORTANT
- ✅ **Correct**: Major vegetables are IMPORTANT, but garnishes might be FLAVOR (e.g., cilantro garnish)

❌ **Mistake 4**: Categorizing eggs as KEY in every recipe
- ✅ **Correct**: Eggs are KEY only if they're the main protein (e.g., omelette). In baking or as binder, they're IMPORTANT.

❌ **Mistake 5**: Not considering quantity
- ✅ **Correct**: 1 tbsp tomato paste (FLAVOR) vs 2 cups tomato sauce (IMPORTANT)

---

## Ingredient Categories by Cuisine

### Italian Cuisine
- **KEY**: Pasta, chicken, beef, seafood
- **IMPORTANT**: Parmesan, mozzarella, tomatoes, tomato sauce, cream
- **FLAVOR**: Garlic, basil, oregano, balsamic vinegar, parsley
- **BASE**: Olive oil, salt, pepper, flour

### Asian Cuisine
- **KEY**: Rice, noodles, chicken, beef, tofu, shrimp
- **IMPORTANT**: Vegetables (bok choy, bean sprouts), eggs, coconut milk
- **FLAVOR**: Soy sauce, ginger, garlic, sesame oil, lime, cilantro, fish sauce
- **BASE**: Oil, salt, sugar

### Mexican Cuisine
- **KEY**: Chicken, beef, beans, rice, tortillas
- **IMPORTANT**: Cheese, tomatoes, avocado, onion, bell peppers
- **FLAVOR**: Lime, cilantro, cumin, chili powder, jalapeño, garlic
- **BASE**: Oil, salt

---

## Summary

**Remember the golden rule**: Categories are about **how much the ingredient affects the dish identity and search relevance**.

- **KEY (10)**: Defines what the dish IS
- **IMPORTANT (5)**: Significantly affects the dish
- **FLAVOR (2)**: Adds character and taste
- **BASE (0)**: Always available basics

When in doubt, ask: **"What is this recipe mainly about?"** That's your KEY ingredient.
