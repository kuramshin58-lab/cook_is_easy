# CSV Format Guide for Recipe Parsing

## Welcome, Claude Parsing Agent! 👋

This guide will help you create **perfectly formatted CSV files** for the recipe database. Follow these specifications exactly to ensure recipes work optimally with the search algorithm.

---

## Quick Overview

You're creating CSV files with recipes in a **structured format** that:
- ✅ Pre-categorizes ingredients (key, important, flavor, base)
- ✅ Includes substitute suggestions
- ✅ Provides complete nutrition data
- ✅ Structures instructions as separate steps
- ✅ Ready for immediate database import (no post-processing needed!)

---

## CSV Structure

### Headers (Exact Order):
```
title,description,difficulty,prep_time,cook_time,servings,ingredients,instructions,calories,protein,fats,carbs,tags,source_url
```

### File Format:
- **Encoding**: UTF-8
- **Delimiter**: Comma (`,`)
- **Quote Character**: Double quote (`"`)
- **Line Ending**: LF (`\n`) or CRLF (`\r\n`)
- **Escape Quotes**: Double quotes inside fields must be escaped as `""`

---

## Field Specifications

### 1. title (TEXT, required)

**What**: Recipe name in Title Case

**Rules**:
- Max 100 characters
- Clear, descriptive name
- Title Case (First Letter Of Each Word Capitalized)
- No special characters except: `-`, `&`, `'`

**Examples**:
```
✅ "Creamy Chicken Alfredo Pasta"
✅ "Spicy Thai Basil Stir-Fry"
✅ "Mom's Classic Lasagna"

❌ "creamy chicken alfredo pasta" (not title case)
❌ "CHICKEN PASTA!!!" (all caps, excessive punctuation)
❌ "chicken" (too vague)
```

---

### 2. description (TEXT, required)

**What**: Short, enticing description (1-2 sentences)

**Rules**:
- Max 500 characters
- Describe flavor profile, texture, or occasion
- Avoid marketing hype, be authentic
- No emoji

**Examples**:
```
✅ "A rich and creamy pasta dish with tender chicken, garlic, and parmesan cheese. Perfect for a quick weeknight dinner."

✅ "Crispy chicken thighs glazed with a sweet and tangy honey-soy sauce, served over fluffy jasmine rice."

✅ "Light and healthy vegetarian stir-fry with colorful vegetables and a savory ginger-garlic sauce."

❌ "The BEST pasta you'll EVER taste!!!" (too much hype)
❌ "Pasta. Chicken." (too brief)
```

---

### 3. difficulty (TEXT, required)

**What**: Recipe complexity level

**Rules**:
- MUST be exactly one of: `easy`, `medium`, `hard` (lowercase!)
- No variations, no emoji, no additional text

**Mapping Guide**:
- **easy**: 30 min or less, <10 ingredients, basic techniques (boil, sauté, bake)
- **medium**: 30-60 min, 10-15 ingredients, some technique required (roasting, layering)
- **hard**: 60+ min, 15+ ingredients, advanced techniques (sous vide, tempering, complex assembly)

**Examples**:
```
✅ easy
✅ medium
✅ hard

❌ Easy (capitalized)
❌ easy 👌 (has emoji)
❌ beginner (wrong term)
❌ intermediate (use "medium" instead)
```

---

### 4. prep_time (INTEGER, required)

**What**: Preparation time in minutes

**Rules**:
- Integer only (no units, no decimals)
- Time to prep ingredients (chopping, mixing, marinating)
- Does NOT include cooking time
- Minimum: 1, Maximum: 300

**Examples**:
```
✅ 15
✅ 30
✅ 5

❌ 15 min (don't include units)
❌ 15.5 (no decimals)
❌ "fifteen" (must be number)
```

---

### 5. cook_time (INTEGER, required)

**What**: Cooking/baking time in minutes

**Rules**:
- Integer only (no units, no decimals)
- Active cooking time (frying, baking, simmering)
- Does NOT include prep time
- Minimum: 0 (for no-cook recipes), Maximum: 480

**Examples**:
```
✅ 20
✅ 45
✅ 0 (for salads, no-cook recipes)

❌ 20 minutes (don't include units)
❌ 1 hour (use 60)
```

---

### 6. servings (INTEGER, required)

**What**: Number of servings this recipe makes

**Rules**:
- Integer only
- Minimum: 1, Maximum: 12
- One serving = one person's portion

**Examples**:
```
✅ 4
✅ 6
✅ 2

❌ 4 portions (don't include units)
❌ 4-6 (pick one number, use 4)
```

---

### 7. ingredients (JSON STRING, required) ⭐ MOST IMPORTANT

**What**: JSON array of structured ingredient objects

**THIS IS CRITICAL**: Each ingredient must be a JSON object with these fields:

```json
{
  "name": "chicken breast",
  "amount": "500",
  "unit": "g",
  "category": "key",
  "substitutes": ["turkey breast", "chicken thighs"],
  "notes": "boneless, skinless"
}
```

#### Ingredient Object Fields:

**name** (string, required):
- Normalized lowercase name
- Singular form preferred: "tomato" not "tomatoes"
- No quantities: "chicken breast" not "2 chicken breasts"

**amount** (string, required):
- Quantity as string: "2", "1.5", "1/2", "2-3"
- If "to taste" or approximate, leave empty: ""

**unit** (string, required):
- One of: `cup`, `tbsp`, `tsp`, `ml`, `l`, `g`, `kg`, `oz`, `lb`, `piece`, `pieces`, `clove`, `cloves`, `to taste`, `pinch`, `handful`, `dash`
- If no unit, use empty string: ""

**category** (string, required):
- One of: `key`, `important`, `flavor`, `base`
- See INGREDIENT_CATEGORIES.md for detailed rules
- Quick guide:
  - `key`: Main proteins & starches (chicken, pasta, rice)
  - `important`: Major components (cheese, vegetables, cream)
  - `flavor`: Aromatics & spices (garlic, basil, cumin)
  - `base`: Always-available (salt, pepper, oil, water)

**substitutes** (array, optional):
- Up to 5 alternative ingredients
- Same form as name (normalized, lowercase)
- Only include realistic substitutes
- Can be empty array: `[]`

**notes** (string, optional):
- Additional info: "boneless", "fresh", "diced"
- Can be empty string: ""

#### JSON Escaping for CSV:

Since this is JSON inside CSV, you MUST escape quotes:
```csv
"[{""name"":""chicken breast"",""amount"":""500"",""unit"":""g"",""category"":""key""}]"
```

#### Complete Example:

```json
[
  {
    "name": "chicken breast",
    "amount": "500",
    "unit": "g",
    "category": "key",
    "substitutes": ["turkey breast", "chicken thighs"],
    "notes": "boneless, skinless"
  },
  {
    "name": "spaghetti",
    "amount": "400",
    "unit": "g",
    "category": "key",
    "substitutes": ["linguine", "fettuccine", "penne"]
  },
  {
    "name": "parmesan cheese",
    "amount": "50",
    "unit": "g",
    "category": "important",
    "substitutes": ["pecorino romano", "grana padano"],
    "notes": "freshly grated"
  },
  {
    "name": "garlic",
    "amount": "3",
    "unit": "cloves",
    "category": "flavor",
    "substitutes": ["garlic powder", "garlic paste"]
  },
  {
    "name": "olive oil",
    "amount": "2",
    "unit": "tbsp",
    "category": "base",
    "substitutes": []
  },
  {
    "name": "salt",
    "amount": "",
    "unit": "to taste",
    "category": "base",
    "substitutes": []
  }
]
```

#### As CSV field (escaped):

```csv
"[{""name"":""chicken breast"",""amount"":""500"",""unit"":""g"",""category"":""key"",""substitutes"":[""turkey breast"",""chicken thighs""],""notes"":""boneless, skinless""},{""name"":""spaghetti"",""amount"":""400"",""unit"":""g"",""category"":""key"",""substitutes"":[""linguine"",""fettuccine""]}]"
```

---

### 8. instructions (JSON STRING, required)

**What**: JSON array of step-by-step instructions

**Rules**:
- Each step is one distinct action
- No numbering (1., 2., etc.) - just the instruction text
- Clear, concise, imperative mood
- Present tense: "Heat oil" not "Heat the oil" or "You should heat oil"

**Example JSON**:
```json
[
  "Bring a large pot of salted water to boil",
  "Cook spaghetti according to package instructions until al dente",
  "Meanwhile, heat olive oil in a large skillet over medium heat",
  "Add chicken and cook for 6-7 minutes per side until golden brown",
  "Remove chicken and set aside",
  "In the same skillet, sauté garlic for 30 seconds until fragrant",
  "Add cream and parmesan, stir until smooth",
  "Slice chicken and return to pan",
  "Drain pasta and toss with sauce",
  "Serve immediately with extra parmesan"
]
```

**As CSV field (escaped)**:
```csv
"[""Bring a large pot of salted water to boil"",""Cook spaghetti according to package instructions""]"
```

**Examples**:
```
✅ "Preheat oven to 180°C"
✅ "Dice onion and mince garlic"
✅ "Simmer for 15 minutes until sauce thickens"

❌ "1. Preheat oven" (don't include numbering)
❌ "You should preheat the oven" (use imperative, not instructional)
❌ "Heat oil; add onions; cook 5 min" (split into separate steps)
```

---

### 9. calories (INTEGER, required)

**What**: Total calories per serving

**Rules**:
- Integer only
- Calories per ONE serving (not total)
- Reasonable range: 100-1500
- If unknown, estimate conservatively

**Examples**:
```
✅ 450
✅ 620
✅ 180

❌ 450 kcal (no units)
❌ 450.5 (no decimals)
```

---

### 10. protein (INTEGER, required)

**What**: Protein in grams per serving

**Rules**:
- Integer only
- Grams per ONE serving
- Reasonable range: 5-80g

**Examples**:
```
✅ 25
✅ 12
✅ 40

❌ 25g (no units)
❌ 25.3 (no decimals)
```

---

### 11. fats (INTEGER, required)

**What**: Fat in grams per serving

**Rules**:
- Integer only
- Grams per ONE serving
- Reasonable range: 3-50g

**Examples**:
```
✅ 15
✅ 8
✅ 22

❌ 15g (no units)
❌ 15.7 (no decimals)
```

---

### 12. carbs (INTEGER, required)

**What**: Carbohydrates in grams per serving

**Rules**:
- Integer only
- Grams per ONE serving
- Reasonable range: 10-100g

**Examples**:
```
✅ 45
✅ 60
✅ 20

❌ 45g (no units)
❌ 45.2 (no decimals)
```

---

### 13. tags (TEXT, optional)

**What**: Comma-separated lowercase tags

**Rules**:
- All lowercase
- Comma-separated, no spaces after commas
- Relevant tags only (5-10 max)
- Common tags: `breakfast, lunch, dinner, snack, vegetarian, vegan, gluten-free, dairy-free, quick, healthy, comfort-food, italian, mexican, asian, pasta, chicken, beef, seafood`

**Examples**:
```
✅ "dinner,italian,pasta,cheese"
✅ "lunch,vegetarian,healthy,quick"
✅ "breakfast,gluten-free,dairy-free"

❌ "Dinner, Italian, Pasta" (capitalized, spaces)
❌ "amazing,delicious,best" (subjective tags)
```

---

### 14. source_url (TEXT, required)

**What**: URL of the original recipe

**Rules**:
- Full URL including https://
- Valid URL format
- No tracking parameters if possible

**Examples**:
```
✅ "https://example.com/recipes/chicken-pasta"
✅ "https://foodblog.com/2024/01/lasagna-recipe"

❌ "example.com" (missing https://)
❌ "click here" (not a URL)
```

---

## Complete CSV Examples

### Example 1: Pasta Recipe (Italian)

```csv
title,description,difficulty,prep_time,cook_time,servings,ingredients,instructions,calories,protein,fats,carbs,tags,source_url
"Creamy Chicken Alfredo","Rich and creamy pasta with tender chicken breast, garlic, and parmesan cheese. Perfect for a comforting weeknight dinner.","easy",15,20,4,"[{""name"":""spaghetti"",""amount"":""400"",""unit"":""g"",""category"":""key"",""substitutes"":[""fettuccine"",""linguine"",""penne""],""notes"":""""},{""name"":""chicken breast"",""amount"":""500"",""unit"":""g"",""category"":""key"",""substitutes"":[""turkey breast"",""chicken thighs""],""notes"":""boneless, skinless""},{""name"":""heavy cream"",""amount"":""300"",""unit"":""ml"",""category"":""important"",""substitutes"":[""half and half"",""coconut cream""],""notes"":""""},{""name"":""parmesan cheese"",""amount"":""100"",""unit"":""g"",""category"":""important"",""substitutes"":[""pecorino romano"",""grana padano""],""notes"":""freshly grated""},{""name"":""garlic"",""amount"":""3"",""unit"":""cloves"",""category"":""flavor"",""substitutes"":[""garlic powder"",""garlic paste""],""notes"":""""},{""name"":""butter"",""amount"":""30"",""unit"":""g"",""category"":""flavor"",""substitutes"":[""olive oil""],""notes"":""""},{""name"":""olive oil"",""amount"":""2"",""unit"":""tbsp"",""category"":""base"",""substitutes"":[],""notes"":""""},{""name"":""salt"",""amount"":"""",""unit"":""to taste"",""category"":""base"",""substitutes"":[],""notes"":""""},{""name"":""black pepper"",""amount"":"""",""unit"":""to taste"",""category"":""base"",""substitutes"":[],""notes"":""""}]","[""Bring a large pot of salted water to boil"",""Cook spaghetti according to package instructions until al dente, about 8-10 minutes"",""Meanwhile, season chicken breasts with salt and pepper"",""Heat olive oil in a large skillet over medium-high heat"",""Add chicken and cook for 6-7 minutes per side until golden brown and cooked through"",""Remove chicken from pan and set aside to rest"",""In the same skillet, melt butter over medium heat"",""Add minced garlic and sauté for 30 seconds until fragrant"",""Pour in heavy cream and bring to a gentle simmer"",""Stir in grated parmesan cheese until sauce is smooth and creamy"",""Slice cooked chicken into strips"",""Drain pasta and add to the cream sauce"",""Toss pasta until well coated"",""Top with sliced chicken"",""Garnish with extra parmesan and black pepper before serving""]",680,42,28,62,"dinner,italian,pasta,chicken,comfort-food,creamy","https://example.com/chicken-alfredo"
```

### Example 2: Chicken Recipe (Poultry)

```csv
title,description,difficulty,prep_time,cook_time,servings,ingredients,instructions,calories,protein,fats,carbs,tags,source_url
"Honey Garlic Chicken Thighs","Crispy chicken thighs glazed with a sweet and savory honey-garlic sauce. Served over fluffy rice for an easy weeknight meal.","easy",10,25,4,"[{""name"":""chicken thighs"",""amount"":""8"",""unit"":""pieces"",""category"":""key"",""substitutes"":[""chicken breast"",""chicken drumsticks""],""notes"":""bone-in, skin-on""},{""name"":""rice"",""amount"":""200"",""unit"":""g"",""category"":""key"",""substitutes"":[""quinoa"",""couscous"",""cauliflower rice""],""notes"":""""},{""name"":""honey"",""amount"":""60"",""unit"":""ml"",""category"":""important"",""substitutes"":[""maple syrup"",""agave nectar""],""notes"":""""},{""name"":""soy sauce"",""amount"":""60"",""unit"":""ml"",""category"":""flavor"",""substitutes"":[""tamari"",""coconut aminos""],""notes"":""""},{""name"":""garlic"",""amount"":""4"",""unit"":""cloves"",""category"":""flavor"",""substitutes"":[""garlic powder"",""garlic paste""],""notes"":""""},{""name"":""ginger"",""amount"":""1"",""unit"":""tbsp"",""category"":""flavor"",""substitutes"":[""ground ginger""],""notes"":""fresh, grated""},{""name"":""sesame oil"",""amount"":""1"",""unit"":""tbsp"",""category"":""flavor"",""substitutes"":[""olive oil""],""notes"":""""},{""name"":""green onion"",""amount"":""2"",""unit"":""pieces"",""category"":""flavor"",""substitutes"":[""chives""],""notes"":""for garnish""},{""name"":""vegetable oil"",""amount"":""2"",""unit"":""tbsp"",""category"":""base"",""substitutes"":[],""notes"":""""},{""name"":""salt"",""amount"":"""",""unit"":""to taste"",""category"":""base"",""substitutes"":[],""notes"":""""}]","[""Cook rice according to package instructions and keep warm"",""Pat chicken thighs dry with paper towels and season with salt"",""Heat vegetable oil in a large skillet over medium-high heat"",""Place chicken thighs skin-side down and cook for 8-10 minutes until skin is crispy and golden"",""Flip chicken and cook for another 8-10 minutes until cooked through"",""Remove chicken from pan and set aside"",""In a small bowl, whisk together honey, soy sauce, minced garlic, grated ginger, and sesame oil"",""Pour sauce into the same skillet and bring to a simmer"",""Cook for 2-3 minutes until sauce thickens slightly"",""Return chicken to pan and coat with sauce"",""Simmer for 2 minutes, spooning sauce over chicken"",""Serve chicken over rice"",""Drizzle with remaining sauce and garnish with sliced green onions""]",520,38,18,48,"dinner,asian,chicken,rice,quick,comfort-food","https://example.com/honey-garlic-chicken"
```

### Example 3: Vegetarian Recipe

```csv
title,description,difficulty,prep_time,cook_time,servings,ingredients,instructions,calories,protein,fats,carbs,tags,source_url
"Mediterranean Chickpea Bowl","Healthy and colorful vegetarian bowl with roasted chickpeas, fresh vegetables, and a tangy lemon-tahini dressing.","easy",15,25,4,"[{""name"":""chickpeas"",""amount"":""400"",""unit"":""g"",""category"":""key"",""substitutes"":[""white beans"",""lentils"",""tofu""],""notes"":""canned, drained""},{""name"":""quinoa"",""amount"":""200"",""unit"":""g"",""category"":""key"",""substitutes"":[""rice"",""couscous"",""bulgur""],""notes"":""""},{""name"":""cherry tomatoes"",""amount"":""200"",""unit"":""g"",""category"":""important"",""substitutes"":[""grape tomatoes"",""diced tomatoes""],""notes"":""""},{""name"":""cucumber"",""amount"":""1"",""unit"":""piece"",""category"":""important"",""substitutes"":[""zucchini""],""notes"":""""},{""name"":""red onion"",""amount"":""1"",""unit"":""piece"",""category"":""important"",""substitutes"":[""white onion"",""shallot""],""notes"":""small""},{""name"":""feta cheese"",""amount"":""100"",""unit"":""g"",""category"":""important"",""substitutes"":[""goat cheese"",""vegan feta""],""notes"":""crumbled""},{""name"":""tahini"",""amount"":""60"",""unit"":""ml"",""category"":""flavor"",""substitutes"":[""sunflower seed butter""],""notes"":""""},{""name"":""lemon"",""amount"":""1"",""unit"":""piece"",""category"":""flavor"",""substitutes"":[""lime""],""notes"":""juiced""},{""name"":""cumin"",""amount"":""1"",""unit"":""tsp"",""category"":""flavor"",""substitutes"":[""coriander""],""notes"":""""},{""name"":""paprika"",""amount"":""1"",""unit"":""tsp"",""category"":""flavor"",""substitutes"":[""chili powder""],""notes"":""""},{""name"":""olive oil"",""amount"":""3"",""unit"":""tbsp"",""category"":""base"",""substitutes"":[],""notes"":""""},{""name"":""salt"",""amount"":"""",""unit"":""to taste"",""category"":""base"",""substitutes"":[],""notes"":""""},{""name"":""black pepper"",""amount"":"""",""unit"":""to taste"",""category"":""base"",""substitutes"":[],""notes"":""""}]","[""Preheat oven to 200°C (400°F)"",""Rinse quinoa and cook according to package instructions"",""Drain and rinse chickpeas, pat dry with paper towels"",""Toss chickpeas with 1 tbsp olive oil, cumin, paprika, salt, and pepper"",""Spread chickpeas on a baking sheet and roast for 20-25 minutes until crispy"",""Meanwhile, dice cucumber and halve cherry tomatoes"",""Thinly slice red onion"",""In a small bowl, whisk together tahini, lemon juice, 2 tbsp olive oil, and 2 tbsp water until smooth"",""Season dressing with salt and pepper"",""Divide cooked quinoa among 4 bowls"",""Top each bowl with roasted chickpeas, cucumber, tomatoes, and red onion"",""Sprinkle with crumbled feta cheese"",""Drizzle with tahini dressing"",""Serve immediately""]",420,16,18,52,"lunch,dinner,vegetarian,healthy,mediterranean,bowl,chickpeas","https://example.com/mediterranean-chickpea-bowl"
```

---

## Validation Checklist

Before submitting your CSV, verify:

- [ ] **Headers**: Exact match: `title,description,difficulty,prep_time,cook_time,servings,ingredients,instructions,calories,protein,fats,carbs,tags,source_url`
- [ ] **Difficulty**: Only `easy`, `medium`, or `hard` (lowercase)
- [ ] **Times**: Integers only, no units
- [ ] **Servings**: Integer, > 0
- [ ] **Ingredients**: Valid JSON array, properly escaped in CSV
- [ ] **Each Ingredient**: Has `name`, `amount`, `unit`, `category`
- [ ] **Categories**: Only `key`, `important`, `flavor`, `base`
- [ ] **At least ONE key ingredient**: Recipe must have at least one `category: "key"`
- [ ] **Substitutes**: Realistic alternatives (up to 5)
- [ ] **Instructions**: Valid JSON array, each step is one action
- [ ] **Nutrition**: All integers, reasonable values
- [ ] **Tags**: Lowercase, comma-separated, no spaces
- [ ] **URL**: Full URL with https://

---

## Common Mistakes to Avoid

### ❌ Mistake 1: Wrong Difficulty Format
```csv
❌ "Easy" → ✅ "easy"
❌ "easy 👌" → ✅ "easy"
❌ "beginner" → ✅ "easy"
```

### ❌ Mistake 2: Including Units in Numbers
```csv
❌ "15 min" → ✅ 15
❌ "4 servings" → ✅ 4
❌ "25g" → ✅ "25" (in amount field) + "g" (in unit field)
```

### ❌ Mistake 3: Wrong JSON Escaping
```csv
❌ "[{"name":"chicken"}]" → ✅ "[{""name"":""chicken""}]"
```

### ❌ Mistake 4: Wrong Ingredient Categories
```csv
❌ garlic = key → ✅ garlic = flavor
❌ olive oil = flavor → ✅ olive oil = base
❌ tomato (small amount) = important → ✅ tomato paste (small) = flavor
```

### ❌ Mistake 5: No Key Ingredients
```csv
❌ Only important/flavor/base → ✅ Must have at least one KEY ingredient
```

---

## Tips for Success

### 1. **Read INGREDIENT_CATEGORIES.md First**
Understand the category system before categorizing ingredients.

### 2. **Focus on Recipe Type**
- **Pasta dishes**: Pasta is KEY, cheese/sauce is IMPORTANT
- **Chicken dishes**: Chicken is KEY, vegetables are IMPORTANT
- **Vegetarian**: Chickpeas/tofu/lentils are KEY, vegetables are IMPORTANT

### 3. **Provide Good Substitutes**
Think about what a home cook might actually have:
- Chicken breast → chicken thighs, turkey breast
- Heavy cream → half and half, coconut cream
- Basil → oregano, parsley

### 4. **Write Clear Instructions**
- One action per step
- Use imperative mood: "Heat oil" not "You should heat oil"
- Include timing: "Cook for 5 minutes until golden"

### 5. **Realistic Nutrition**
If you don't have exact data, estimate conservatively:
- Pasta dishes: 400-700 calories
- Chicken dishes: 350-600 calories
- Vegetarian bowls: 300-500 calories

---

## Questions?

If you're unsure about any field:
1. Check the examples above
2. Refer to INGREDIENT_CATEGORIES.md for ingredient categorization
3. When in doubt, be conservative and simple

**Remember**: The goal is to create structured, searchable recipes that help users find dishes based on what they have in their kitchen!

---

Good luck with parsing! 🚀
