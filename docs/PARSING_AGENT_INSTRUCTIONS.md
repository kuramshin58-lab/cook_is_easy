# Instructions for Claude AI Recipe Parsing Agent

## Overview

This document provides comprehensive instructions for a Claude AI parsing agent to scrape recipes from websites and output them in an optimized CSV format ready for immediate database import.

**Your Mission**: Parse recipes autonomously, handle ambiguous cases using decision trees, and produce validated CSV output with structured ingredients.

---

## Section 1: CRITICAL CONSTRAINTS

### 1.1 MANDATORY FIELD VALIDATION

**REQUIRED FIELDS** (all 14 must be present):

```
□ title (TEXT, max 100 chars, Title Case)
□ description (TEXT, max 500 chars, 1-2 sentences)
□ difficulty (ENUM: easy|medium|hard - LOWERCASE ONLY)
□ prep_time (INTEGER, 1-300 minutes)
□ cook_time (INTEGER, 0-480 minutes)
□ servings (INTEGER, 1-12)
□ ingredients (JSON STRING, escaped for CSV)
□ instructions (JSON STRING, escaped for CSV)
□ calories (INTEGER, 100-1500)
□ protein (INTEGER, 5-80 grams)
□ fats (INTEGER, 3-50 grams)
□ carbs (INTEGER, 10-100 grams)
□ tags (TEXT, lowercase, comma-separated, no spaces)
□ source_url (TEXT, full URL with https://)
```

### 1.2 CSV ESCAPING RULES

**CRITICAL**: JSON inside CSV requires double-escaping of quotes:

```
✅ CORRECT: "[{""name"":""chicken breast"",""amount"":""500""}]"
❌ WRONG:   "[{"name":"chicken breast","amount":"500"}]"
❌ WRONG:   '[{"name":"chicken breast","amount":"500"}]'
```

**Rules**:
- Outer field must be wrapped in double quotes: `"[...]"`
- Every quote inside JSON must be doubled: `""` not `"`
- No single quotes allowed

### 1.3 INGREDIENT STRUCTURE REQUIREMENTS

**MANDATORY**: At least ONE ingredient with `category: "key"`

**Each ingredient MUST have**:
- `name` (string): lowercase, normalized (e.g., "chicken breast")
- `amount` (string): quantity as string ("2", "1.5", "1/2", or "")
- `unit` (string): from valid units list (see Section 1.4)
- `category` (string): ONE of: `key`, `important`, `flavor`, `base`

**OPTIONAL fields**:
- `substitutes` (array): up to 5 alternatives (can be empty array `[]`)
- `notes` (string): additional info (can be empty string `""`)

**Category Distribution (per recipe)**:
- KEY (weight 10): 1-3 ingredients (main proteins/starches)
- IMPORTANT (weight 5): 3-8 ingredients (major components)
- FLAVOR (weight 2): 2-10 ingredients (aromatics/spices)
- BASE (weight 0): 1-5 ingredients (salt, oil, water)

### 1.4 VALID UNITS

**Volume**: cup, cups, tbsp, tsp, tablespoon, tablespoons, teaspoon, teaspoons, ml, l
**Weight**: g, grams, gram, kg, oz, lb, lbs, pound, pounds
**Count**: piece, pieces, clove, cloves
**Special**: to taste, pinch, handful, dash, (empty string)

### 1.5 ZERO TOLERANCE VIOLATIONS

**REJECT RECIPE** (do not include in output) if:
- ❌ Missing any required field
- ❌ `difficulty` is not exactly: easy, medium, or hard (lowercase)
- ❌ No KEY ingredient present
- ❌ Invalid JSON structure in ingredients/instructions
- ❌ Times/nutrition are negative (except cook_time can be 0)
- ❌ Servings is zero or negative

---

## Section 2: DECISION TREES & WORKFLOWS

### 2.1 INGREDIENT CATEGORIZATION DECISION TREE

```
START: Ingredient = "garlic"
  ↓
Q1: Is it salt, pepper, oil, water, flour, or sugar?
  → YES: category = "base"
  → NO: Continue to Q2

Q2: Is it the main protein or starch?
  Check: Is it in recipe title? Is it >200g? Is recipe named after it?
  → YES: category = "key"
  → NO: Continue to Q3

Q3: If removed, does recipe fundamentally change?
  (e.g., Carbonara without eggs = not Carbonara)
  → YES: category = "important"
  → NO: Continue to Q4

Q4: Is it for flavoring/seasoning? (herbs, spices, acids, condiments)
  → YES: category = "flavor"
  → NO: Default to "important" (edge case)
```

**EXAMPLE RESULTS**:
- "chicken breast" (500g) in "Chicken Alfredo" → **KEY**
- "garlic" (3 cloves) in "Chicken Alfredo" → **FLAVOR**
- "parmesan" (100g) in "Chicken Alfredo" → **IMPORTANT**
- "olive oil" (2 tbsp) in "Chicken Alfredo" → **BASE**

### 2.2 DIFFICULTY CLASSIFICATION FLOWCHART

```
START: Calculate difficulty score

SCORING FACTORS:
- Total time (prep + cook):
  - <30 min: +0 points
  - 30-60 min: +1 point
  - >60 min: +2 points

- Number of ingredients:
  - <10: +0 points
  - 10-15: +1 point
  - >15: +2 points

- Technique complexity:
  - Basic (boil, sauté, bake): +0 points
  - Intermediate (roast, layer, reduce): +1 point
  - Advanced (sous vide, temper, fold): +2 points

FINAL MAPPING:
- 0-1 points → difficulty = "easy"
- 2-3 points → difficulty = "medium"
- 4-6 points → difficulty = "hard"
```

**EXAMPLES**:

Recipe: "Pasta Carbonara" (15 min prep, 15 min cook, 8 ingredients, sauté/boil)
→ Time: 0, Ingredients: 0, Technique: 0 → Total: 0 → **"easy"**

Recipe: "Beef Wellington" (45 min prep, 60 min cook, 18 ingredients, layering/pastry)
→ Time: 2, Ingredients: 2, Technique: 1 → Total: 5 → **"hard"**

### 2.3 HANDLING MISSING DATA DECISION TREE

```
IF source has no nutrition data:
  ↓
CALCULATE ESTIMATES:
  1. Identify main calorie sources:
     - Proteins: 4 cal/g
     - Fats: 9 cal/g
     - Carbs: 4 cal/g

  2. Use category-based estimation:
     Pasta dishes → 400-700 cal, 12-25g protein, 15-30g fat, 50-80g carbs
     Chicken dishes → 350-600 cal, 30-45g protein, 12-25g fat, 20-50g carbs
     Vegetarian → 300-500 cal, 10-20g protein, 10-20g fat, 40-70g carbs
     Salads → 200-400 cal, 8-15g protein, 10-20g fat, 20-40g carbs

  3. Adjust by portion size and ingredients
```

**EXAMPLE**:
Recipe: "Chicken Alfredo" (4 servings, 500g chicken, 400g pasta, 300ml cream)
→ Estimate: **680 cal, 42g protein, 28g fat, 62g carbs** per serving

### 2.4 AMBIGUOUS QUANTITY HANDLING

```
SOURCE SAYS           → PARSE AS
--------------------------------
"to taste"           → amount: "", unit: "to taste"
"a pinch"            → amount: "1", unit: "pinch"
"1-2 cups"           → amount: "1.5", unit: "cup" (use midpoint)
"2 cloves garlic"    → amount: "2", unit: "cloves", name: "garlic"
"handful of spinach" → amount: "1", unit: "handful", name: "spinach"
"salt"               → amount: "", unit: "to taste", category: "base"
"2 chicken breasts"  → amount: "2", unit: "pieces", name: "chicken breast"
"500g/1lb chicken"   → amount: "500", unit: "g" (prefer metric)
```

---

## Section 3: AUTONOMOUS DECISION FRAMEWORK

### 3.1 WHEN TO MAKE ASSUMPTIONS (DO NOT ASK)

| SCENARIO | ACTION |
|----------|--------|
| Missing nutrition data | Calculate estimate (Section 2.3) |
| Vague quantity ("a few") | Use reasonable default (Section 2.4) |
| Ingredient category unclear | Use decision tree (Section 2.1) |
| Multiple cooking times listed | Sum all active cooking steps |
| Missing ingredient notes | Leave `notes: ""` (empty string) |
| No substitutes obvious | Use empty array: `[]` |
| Tags not provided | Infer from ingredients/cuisine |
| Unclear difficulty | Calculate using scoring (Section 2.2) |
| Recipe name not Title Case | Convert to Title Case |
| Missing technique details | Infer from ingredient list |

### 3.2 WHEN TO REQUEST CLARIFICATION (MUST ASK)

| SCENARIO | WHY CRITICAL |
|----------|--------------|
| Zero ingredients found | Cannot create valid recipe |
| Recipe has no protein/starch | Cannot assign KEY category |
| Source URL not accessible | Required field cannot be inferred |
| Recipe is duplicate | Need confirmation to proceed |
| Ingredient quantity completely missing for main ingredient | Affects nutrition calculation significantly |
| Recipe contains offensive content | Safety/moderation concern |
| Recipe type unclear (is it a drink? dessert? main?) | Affects categorization entirely |

### 3.3 BATCH PROCESSING WORKFLOW

```
FOR EACH recipe in source:
  ↓
1. PRE-VALIDATION:
   - Check for required data (title, ingredients, source_url)
   - If missing critical fields → SKIP + LOG WARNING
  ↓
2. PARSING:
   - Extract all 14 fields
   - Apply decision trees for ambiguous cases
   - Calculate estimates for missing nutrition
  ↓
3. CATEGORIZATION:
   - Categorize all ingredients using decision tree
   - Verify at least ONE KEY ingredient exists
   - If none → ATTEMPT to infer, else SKIP + LOG ERROR
  ↓
4. VALIDATION:
   - Run format validation (difficulty lowercase, times integers, etc.)
   - Check JSON escaping is correct
   - Verify category distribution is reasonable
  ↓
5. OUTPUT:
   - Write to CSV with proper escaping
   - Maintain running log of skipped recipes
  ↓
6. SUMMARY REPORT:
   - Total processed: X
   - Successfully converted: Y
   - Skipped (with reasons): Z
```

---

## Section 4: INGREDIENT QUICK REFERENCE

### 4.1 COMMON INGREDIENTS BY CATEGORY

**KEY INGREDIENTS** (weight: 10):
```
Proteins: bacon, beef, chicken breast, chicken thighs, cod, ground beef,
         ground turkey, lamb, pork chops, pork tenderloin, salmon, shrimp,
         tofu, turkey breast, tuna

Starches: basmati rice, bread, couscous, fettuccine, linguine, noodles,
         pasta, penne, quinoa, rice, rigatoni, spaghetti, tortillas
```

**IMPORTANT INGREDIENTS** (weight: 5):
```
Dairy: butter, cheddar cheese, cream cheese, eggs, egg yolks, feta cheese,
      ghee, heavy cream, milk, mozzarella cheese, parmesan cheese,
      pecorino romano, ricotta cheese, sour cream, yogurt

Vegetables: bell pepper, broccoli, carrots, cauliflower, celery, cherry tomatoes,
           cucumber, mushrooms, onion, red onion, spinach, tomatoes, zucchini

Legumes: black beans, chickpeas, kidney beans, lentils, white beans

Sauces: broth, chicken broth, coconut milk (major component), tomato sauce,
       vegetable broth
```

**FLAVOR INGREDIENTS** (weight: 2):
```
Aromatics: garlic, ginger, shallot

Herbs: basil, cilantro, dill, mint, oregano, parsley, rosemary, sage, thyme

Spices: chili flakes, chili powder, cinnamon, cumin, curry powder,
       garam masala, nutmeg, paprika, turmeric

Acids: balsamic vinegar, lemon, lemon juice, lime, lime juice,
      red wine vinegar, vinegar

Condiments: dijon mustard, fish sauce, honey, hot sauce, ketchup,
           maple syrup, mustard, sesame oil, soy sauce, sriracha,
           worcestershire sauce
```

**BASE INGREDIENTS** (weight: 0):
```
Always available: baking powder, baking soda, black pepper, cornstarch,
                 flour, all-purpose flour, olive oil, pepper, salt,
                 sugar, vegetable oil, water, white sugar
```

### 4.2 SUBSTITUTE SUGGESTIONS TABLE

| INGREDIENT | SUBSTITUTES (max 5, most common first) |
|------------|----------------------------------------|
| chicken breast | turkey breast, chicken thighs, pork tenderloin |
| ground beef | ground turkey, ground pork, lentils (vegan) |
| heavy cream | coconut cream, half and half, milk + butter |
| parmesan | pecorino romano, grana padano, nutritional yeast |
| spaghetti | linguine, fettuccine, penne, angel hair |
| soy sauce | tamari, coconut aminos, worcestershire sauce |
| garlic | garlic powder, shallots, garlic paste |
| basil | oregano, parsley, cilantro, mint |
| rice | quinoa, cauliflower rice, couscous |
| tomatoes | tomato sauce, tomato paste, red peppers |
| butter | ghee, coconut oil, olive oil |
| eggs | flax eggs, chia eggs, applesauce (baking) |
| onion | shallot, leek, green onion, onion powder |
| spinach | kale, swiss chard, arugula |
| mushrooms | eggplant, zucchini, tofu |
| chickpeas | white beans, lentils, black beans |

---

## Section 5: CSV FORMATTING & ESCAPING

### 5.1 JSON ESCAPING EXAMPLES

**INGREDIENTS FIELD - CORRECT FORMAT**:

Single ingredient:
```
"[{""name"":""chicken breast"",""amount"":""500"",""unit"":""g"",""category"":""key"",""substitutes"":[""turkey breast""],""notes"":""boneless""}]"
```

Multiple ingredients (note the escaping):
```
"[{""name"":""pasta"",""amount"":""400"",""unit"":""g"",""category"":""key"",""substitutes"":[""rice""]},{""name"":""garlic"",""amount"":""3"",""unit"":""cloves"",""category"":""flavor"",""substitutes"":[]}]"
```

**INSTRUCTIONS FIELD - CORRECT FORMAT**:
```
"[""Bring water to boil"",""Cook pasta for 8 minutes"",""Drain and serve""]"
```

### 5.2 COMMON ESCAPING MISTAKES

```
❌ WRONG: "[{'name':'chicken'}]"
   (single quotes not allowed in JSON)

❌ WRONG: "[{"name":"chicken"}]"
   (quotes not escaped for CSV)

❌ WRONG: [{"name":"chicken"}]
   (missing outer quotes for CSV field)

✅ CORRECT: "[{""name"":""chicken""}]"
   (outer quotes + inner quotes doubled)
```

### 5.3 COMPLETE EXAMPLE ROW

```csv
"Chicken Alfredo","Creamy pasta with grilled chicken in a rich parmesan sauce.","easy",15,20,4,"[{""name"":""chicken breast"",""amount"":""500"",""unit"":""g"",""category"":""key"",""substitutes"":[""turkey breast""],""notes"":""""},{""name"":""fettuccine"",""amount"":""400"",""unit"":""g"",""category"":""key"",""substitutes"":[""linguine""]},{""name"":""heavy cream"",""amount"":""200"",""unit"":""ml"",""category"":""important"",""substitutes"":[""coconut cream""]},{""name"":""parmesan cheese"",""amount"":""50"",""unit"":""g"",""category"":""important"",""substitutes"":[""pecorino romano""]},{""name"":""garlic"",""amount"":""3"",""unit"":""cloves"",""category"":""flavor"",""substitutes"":[""garlic powder""]},{""name"":""olive oil"",""amount"":""2"",""unit"":""tbsp"",""category"":""base"",""substitutes"":[]}]","[""Cook fettuccine according to package instructions"",""Season chicken with salt and pepper"",""Heat olive oil in a pan over medium heat"",""Cook chicken for 6-7 minutes per side until golden"",""Add heavy cream and parmesan to the pan"",""Simmer until sauce thickens"",""Toss pasta with sauce and serve""]",680,42,28,62,"dinner,italian,pasta,chicken","https://example.com/chicken-alfredo"
```

---

## Section 6: QUALITY CONTROL CHECKLIST

### 6.1 PRE-OUTPUT VALIDATION

**BEFORE WRITING TO CSV, VERIFY**:

```
□ 1. All 14 required fields present
□ 2. difficulty is lowercase (easy|medium|hard)
□ 3. prep_time, cook_time, servings are integers
□ 4. ingredients is valid JSON array
□ 5. At least ONE ingredient has category: "key"
□ 6. All ingredients have: name, amount, unit, category
□ 7. All categories are valid (key|important|flavor|base)
□ 8. instructions is valid JSON array
□ 9. All instructions are strings (not empty)
□ 10. calories, protein, fats, carbs are integers
□ 11. Nutrition values are in reasonable ranges
□ 12. tags are lowercase, comma-separated, no spaces
□ 13. source_url starts with https://
□ 14. CSV escaping is correct (double quotes in JSON)
```

**AUTOMATIC FIXES**:
- Title case conversion → Apply automatically
- Difficulty capitalization → Convert to lowercase
- Missing substitutes → Use empty array `[]`
- Missing notes → Use empty string `""`
- Trailing commas in JSON → Remove automatically

### 6.2 RECIPE SKIP CRITERIA

**SKIP RECIPE** (do not include in output) IF:

**CRITICAL ISSUES**:
- Missing title or ingredients list
- Cannot identify any KEY ingredient
- Source URL missing or invalid
- Ingredient list is empty
- Recipe is clearly not food (e.g., "how to clean oven")

**QUALITY ISSUES** (configurable threshold):
- Less than 3 ingredients total
- More than 30 ingredients (overly complex)
- Cook time exceeds 8 hours (likely slow cooker edge case)
- No instructions available
- Recipe is duplicate of previous entry

---

## Section 7: EDGE CASES & SPECIAL HANDLING

### 7.1 NO-COOK RECIPES

**SCENARIO**: Salads, smoothies, no-bake desserts

**HANDLING**:
- `cook_time = 0` (zero is valid)
- `difficulty` typically "easy"
- KEY ingredient: main protein/grain (chickpeas, quinoa, etc.)
- IMPORTANT: vegetables, dressings, major components

**EXAMPLE**:
```
Recipe: "Mediterranean Chickpea Salad"
→ prep_time: 15
→ cook_time: 0
→ difficulty: "easy"
→ KEY: chickpeas, quinoa (if included)
→ IMPORTANT: tomatoes, cucumber, feta, dressing ingredients
```

### 7.2 MULTI-COMPONENT RECIPES

**SCENARIO**: Recipes with sub-recipes (e.g., "Burger with homemade sauce")

**HANDLING**:
- Flatten all ingredients into single array
- Keep instructions sequential
- Categorize based on final dish

**EXAMPLE**:
```
Recipe: "Burger with Special Sauce"
→ KEY: ground beef, burger buns
→ IMPORTANT: cheese, lettuce, tomato, sauce ingredients (mayo, ketchup, etc.)
→ FLAVOR: spices, garlic (in sauce)
→ Instructions: Include sauce preparation first, then burger assembly
```

### 7.3 INGREDIENT NAME NORMALIZATION

```
SOURCE TEXT                  → NORMALIZED NAME
-----------------------------------------------
"2 large chicken breasts"   → name: "chicken breast", notes: "large"
"fresh basil leaves"        → name: "basil", notes: "fresh"
"boneless chicken"          → name: "chicken breast", notes: "boneless"
"1 can (400g) tomatoes"     → name: "canned tomatoes", amount: "400", unit: "g"
"kosher salt"               → name: "salt", notes: ""
"EVOO"                      → name: "olive oil", notes: ""
"2 lb beef chuck"           → name: "beef", amount: "900", unit: "g", notes: "chuck"
```

### 7.4 BATCH SIZE VARIATIONS

**SCENARIO**: Recipe says "serves 4-6"

**HANDLING**:
→ `servings = 4` (use lower bound)
→ Calculate nutrition per serving based on lower bound
→ Note in description if critical: "serves 4-6 people"

---

## Section 8: CROSS-REFERENCES TO EXISTING DOCS

### 8.1 DOCUMENTATION INDEX

**REFER TO DETAILED DOCS FOR**:

1. **CSV_FORMAT_GUIDE.md**
   - **WHEN**: Need field-by-field specifications
   - **SECTIONS**: Field data types, validation rules, examples

2. **INGREDIENT_CATEGORIES.md**
   - **WHEN**: Unsure about category for specific ingredient
   - **SECTIONS**: Category weights, decision flowchart, cuisine-specific guides

3. **RECIPE_IMPORT_README.md**
   - **WHEN**: Need workflow overview or script usage
   - **SECTIONS**: Import process, validation, troubleshooting

4. **templates/recipe_template.csv**
   - **WHEN**: Need real-world examples to reference
   - **EXAMPLES**: 3 complete recipes (pasta, chicken, vegetarian)

### 8.2 QUICK LOOKUPS

| FOR THIS QUESTION | CONSULT |
|-------------------|---------|
| "What units are valid?" | CSV_FORMAT_GUIDE.md, Section 7 |
| "Is bacon KEY or IMPORTANT?" | INGREDIENT_CATEGORIES.md, "Special Cases" |
| "How to validate output?" | RECIPE_IMPORT_README.md, "Validation" |
| "Example of vegetarian recipe?" | templates/recipe_template.csv, Row 3 |
| "Common Italian ingredients?" | INGREDIENT_CATEGORIES.md, "Ingredient Categories by Cuisine" |

---

## Section 9: OUTPUT FORMAT TEMPLATE

### 9.1 CSV HEADER (First Line)

```csv
title,description,difficulty,prep_time,cook_time,servings,ingredients,instructions,calories,protein,fats,carbs,tags,source_url
```

### 9.2 CSV ROW TEMPLATE

```csv
"[RECIPE_TITLE_IN_TITLE_CASE]","[1-2 SENTENCE DESCRIPTION]","[easy|medium|hard]",[PREP_MINUTES],[COOK_MINUTES],[NUM_SERVINGS],"[{""name"":""[INGREDIENT]"",""amount"":""[QTY]"",""unit"":""[UNIT]"",""category"":""[CATEGORY]"",""substitutes"":[],""notes"":""""}]","[""[STEP_1]"",""[STEP_2]""]",[CALORIES],[PROTEIN_G],[FATS_G],[CARBS_G],"[tag1,tag2,tag3]","[FULL_URL]"
```

### 9.3 FILLED EXAMPLE

```csv
"Classic Spaghetti Carbonara","Traditional Italian pasta with eggs, cheese, and pancetta.","easy",10,15,4,"[{""name"":""spaghetti"",""amount"":""400"",""unit"":""g"",""category"":""key"",""substitutes"":[""linguine"",""fettuccine""],""notes"":""""},{""name"":""pancetta"",""amount"":""150"",""unit"":""g"",""category"":""key"",""substitutes"":[""bacon"",""guanciale""],""notes"":""""},{""name"":""eggs"",""amount"":""4"",""unit"":""pieces"",""category"":""important"",""substitutes"":[],""notes"":""large""},{""name"":""parmesan cheese"",""amount"":""100"",""unit"":""g"",""category"":""important"",""substitutes"":[""pecorino romano""],""notes"":""grated""},{""name"":""black pepper"",""amount"":""2"",""unit"":""tsp"",""category"":""flavor"",""substitutes"":[],""notes"":""freshly ground""},{""name"":""salt"",""amount"":"""",""unit"":""to taste"",""category"":""base"",""substitutes"":[],""notes"":""""}]","[""Bring a large pot of salted water to boil"",""Cook spaghetti according to package instructions until al dente"",""Meanwhile, cook pancetta in a pan until crispy"",""In a bowl, whisk together eggs, parmesan, and black pepper"",""Drain pasta, reserving 1 cup pasta water"",""Add hot pasta to pancetta pan"",""Remove from heat and quickly mix in egg mixture"",""Add pasta water to reach desired consistency"",""Serve immediately with extra parmesan""]",520,24,22,58,"dinner,italian,pasta,comfort-food","https://example.com/spaghetti-carbonara"
```

---

## Section 10: ERROR RECOVERY STRATEGIES

### 10.1 ERROR HANDLING MATRIX

| ERROR TYPE | RECOVERY ACTION | LOG LEVEL |
|------------|-----------------|-----------|
| Missing title | SKIP recipe | ERROR |
| Missing ingredients | SKIP recipe | ERROR |
| Invalid JSON in source | Attempt repair, else SKIP | WARNING |
| No KEY ingredient found | Try to infer, else SKIP | WARNING |
| Nutrition data missing | Calculate estimate | INFO |
| Unclear ingredient category | Use decision tree default | INFO |
| Invalid difficulty value | Calculate using scoring | INFO |
| Missing substitutes | Use empty array | DEBUG |
| Extra fields in source | Ignore extra fields | DEBUG |

### 10.2 LOGGING FORMAT

**LOG ENTRY TEMPLATE**:
```
[TIMESTAMP] [LEVEL] Recipe: "[TITLE]" - [MESSAGE]
```

**EXAMPLES**:
```
[2024-01-26 10:30:15] ERROR Recipe: "Unknown Dish" - Missing ingredients list, skipping
[2024-01-26 10:30:16] WARNING Recipe: "Pasta Salad" - No KEY ingredient identified, using "pasta" as fallback
[2024-01-26 10:30:17] INFO Recipe: "Chicken Curry" - Nutrition data missing, calculated estimate
[2024-01-26 10:30:18] DEBUG Recipe: "Tacos" - No substitutes provided for "tortillas", using empty array
```

### 10.3 BATCH SUMMARY FORMAT

**At end of processing, output**:

```
======================================================================
PARSING SUMMARY
======================================================================

Total recipes found: 50
Successfully parsed: 45
Skipped: 5

SKIPPED RECIPES:
  - "Unknown Recipe 1" - Missing ingredients list (ERROR)
  - "Bad Format Recipe" - Invalid JSON structure (ERROR)
  - "Incomplete Recipe" - No KEY ingredient (WARNING)
  - "Duplicate Recipe" - Already processed (INFO)
  - "Low Quality Recipe" - Less than 3 ingredients (INFO)

OUTPUT:
  File: new_recipes.csv
  Recipes: 45
  Ready for validation: npx tsx scripts/validate-csv.ts new_recipes.csv

======================================================================
```

---

## Final Notes

### Success Criteria

A successful parsing session should achieve:
- ✅ **90%+ conversion rate** (at least 90% of valid recipes parsed)
- ✅ **<5% clarification requests** (autonomous decision-making)
- ✅ **100% validation pass** (output passes validate-csv.ts with 0 errors)
- ✅ **Clear error logs** (skipped recipes have clear reasons)

### Remember

1. **Prioritize quality over quantity** - It's better to skip a recipe than output bad data
2. **Follow decision trees** - They eliminate ambiguity
3. **Log everything** - Transparency is critical
4. **Validate before output** - Use Section 6 checklist
5. **When in doubt** - Refer to existing documentation (Section 8)

### Next Steps After Parsing

1. **Validate output**: `npx tsx scripts/validate-csv.ts your_output.csv`
2. **Review any warnings** from validation
3. **Import to database**: `npx tsx scripts/import-structured-recipes.ts your_output.csv`
4. **Test in search** - Verify recipes appear with correct match scores

---

**Good luck parsing! You have all the tools and decision trees to operate autonomously.** 🚀
