import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function validateCSV(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');

  const issues = [];
  const warnings = [];
  let validRecipes = 0;

  // Check header
  const expectedHeader = 'title,description,difficulty,prep_time,cook_time,servings,ingredients,instructions,calories,protein,fats,carbs,tags,source_url';
  const actualHeader = lines[0].trim();

  if (actualHeader !== expectedHeader) {
    issues.push(`❌ Header mismatch. Expected: ${expectedHeader}`);
  } else {
    console.log('✅ CSV header is correct');
  }

  // Parse CSV (simple parser for escaped quotes)
  for (let i = 1; i < lines.length; i++) {
    const lineNum = i + 1;
    const line = lines[i].trim();

    if (!line) continue; // Skip empty lines

    try {
      // Parse CSV line (handling escaped quotes)
      const fields = parseCSVLine(line);

      if (fields.length !== 14) {
        issues.push(`Line ${lineNum}: Expected 14 fields, got ${fields.length}`);
        continue;
      }

      const [title, description, difficulty, prep_time, cook_time, servings,
             ingredients, instructions, calories, protein, fats, carbs, tags, source_url] = fields;

      // Validate title
      if (!title || title.length > 100) {
        issues.push(`Line ${lineNum}: Title invalid (empty or > 100 chars)`);
      }

      // Validate difficulty
      if (!['easy', 'medium', 'hard'].includes(difficulty)) {
        issues.push(`Line ${lineNum}: Difficulty must be 'easy', 'medium', or 'hard'. Got: '${difficulty}'`);
      }

      // Validate numeric fields
      if (!isInteger(prep_time)) {
        issues.push(`Line ${lineNum}: prep_time must be integer. Got: '${prep_time}'`);
      }
      if (!isInteger(cook_time)) {
        issues.push(`Line ${lineNum}: cook_time must be integer. Got: '${cook_time}'`);
      }
      if (!isInteger(servings)) {
        issues.push(`Line ${lineNum}: servings must be integer. Got: '${servings}'`);
      }

      // Validate nutrition
      const cal = parseInt(calories);
      const prot = parseInt(protein);
      const fat = parseInt(fats);
      const carb = parseInt(carbs);

      if (cal === 0 && prot === 0 && fat === 0 && carb === 0) {
        warnings.push(`Line ${lineNum} (${title}): All nutrition values are 0 - missing data?`);
      }

      if (!isInteger(calories) || cal < 0) {
        issues.push(`Line ${lineNum}: calories must be positive integer`);
      }
      if (!isInteger(protein) || prot < 0) {
        issues.push(`Line ${lineNum}: protein must be positive integer`);
      }
      if (!isInteger(fats) || fat < 0) {
        issues.push(`Line ${lineNum}: fats must be positive integer`);
      }
      if (!isInteger(carbs) || carb < 0) {
        issues.push(`Line ${lineNum}: carbs must be positive integer`);
      }

      // Validate ingredients JSON
      try {
        const ingredientsList = JSON.parse(ingredients);

        if (!Array.isArray(ingredientsList)) {
          issues.push(`Line ${lineNum}: ingredients must be JSON array`);
        } else {
          let hasKeyIngredient = false;

          ingredientsList.forEach((ing, idx) => {
            if (!ing.name) {
              issues.push(`Line ${lineNum}: Ingredient ${idx} missing 'name'`);
            }
            if (!ing.hasOwnProperty('amount')) {
              issues.push(`Line ${lineNum}: Ingredient ${idx} missing 'amount'`);
            }
            if (!ing.hasOwnProperty('unit')) {
              issues.push(`Line ${lineNum}: Ingredient ${idx} missing 'unit'`);
            }
            if (!ing.category) {
              issues.push(`Line ${lineNum}: Ingredient ${idx} missing 'category'`);
            } else if (!['key', 'important', 'flavor', 'base'].includes(ing.category)) {
              issues.push(`Line ${lineNum}: Ingredient '${ing.name}' has invalid category: '${ing.category}'`);
            }

            if (ing.category === 'key') {
              hasKeyIngredient = true;
            }

            if (!Array.isArray(ing.substitutes)) {
              issues.push(`Line ${lineNum}: Ingredient '${ing.name}' substitutes must be array`);
            }
          });

          if (!hasKeyIngredient) {
            issues.push(`Line ${lineNum}: Recipe must have at least ONE 'key' ingredient`);
          }
        }
      } catch (e) {
        issues.push(`Line ${lineNum}: Invalid ingredients JSON - ${e.message}`);
      }

      // Validate instructions JSON
      try {
        const instructionsList = JSON.parse(instructions);

        if (!Array.isArray(instructionsList)) {
          issues.push(`Line ${lineNum}: instructions must be JSON array`);
        } else if (instructionsList.length === 0) {
          issues.push(`Line ${lineNum}: instructions array is empty`);
        }
      } catch (e) {
        issues.push(`Line ${lineNum}: Invalid instructions JSON - ${e.message}`);
      }

      // Validate URL
      if (!source_url.startsWith('http://') && !source_url.startsWith('https://')) {
        issues.push(`Line ${lineNum}: source_url must start with http:// or https://`);
      }

      if (issues.length === 0) {
        validRecipes++;
      }

    } catch (e) {
      issues.push(`Line ${lineNum}: Parse error - ${e.message}`);
    }
  }

  return { issues, warnings, validRecipes, totalRecipes: lines.length - 1 };
}

function parseCSVLine(line) {
  const fields = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const next = line[i + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        current += '"';
        i++; // Skip next quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      fields.push(current);
      current = '';
    } else {
      current += char;
    }
  }

  fields.push(current);
  return fields;
}

function isInteger(value) {
  return /^\d+$/.test(value);
}

// Run validation
const csvFile = process.argv[2] || path.join(__dirname, '..', 'kitchen_stories_main_recipes.csv');

console.log(`\n🔍 Validating: ${path.basename(csvFile)}\n`);

const result = validateCSV(csvFile);

console.log(`\n📊 Summary:`);
console.log(`Total recipes: ${result.totalRecipes}`);
console.log(`Valid recipes: ${result.validRecipes}`);
console.log(`Issues found: ${result.issues.length}`);
console.log(`Warnings: ${result.warnings.length}`);

if (result.warnings.length > 0) {
  console.log(`\n⚠️  Warnings (${result.warnings.length}):`);
  result.warnings.forEach(w => console.log(`  ${w}`));
}

if (result.issues.length > 0) {
  console.log(`\n❌ Issues (${result.issues.length}):`);
  result.issues.forEach(issue => console.log(`  ${issue}`));
  console.log(`\n❌ CSV file has validation errors. Please fix before importing.\n`);
  process.exit(1);
} else {
  console.log(`\n✅ All validation checks passed! File is ready for import.\n`);
  process.exit(0);
}
