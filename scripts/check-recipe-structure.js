import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function checkRecipeStructure(filePath, lineNum) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');

  if (lineNum >= lines.length) {
    console.log('Line number out of range');
    return;
  }

  const line = lines[lineNum].trim();
  const fields = parseCSVLine(line);

  if (fields.length !== 14) {
    console.log(`❌ Expected 14 fields, got ${fields.length}`);
    return;
  }

  const [title, description, difficulty, prep_time, cook_time, servings,
         ingredients, instructions, calories, protein, fats, carbs, tags, source_url] = fields;

  console.log(`\n📋 Recipe: ${title}`);
  console.log(`📝 Description: ${description.substring(0, 80)}...`);
  console.log(`⏱️  Difficulty: ${difficulty}`);
  console.log(`⏱️  Prep: ${prep_time}min | Cook: ${cook_time}min | Servings: ${servings}`);
  console.log(`🍽️  Nutrition: ${calories}cal | ${protein}g protein | ${fats}g fat | ${carbs}g carbs`);
  console.log(`🏷️  Tags: ${tags}`);
  console.log(`🔗 URL: ${source_url.substring(0, 60)}...`);

  // Check ingredients
  try {
    const ingredientsList = JSON.parse(ingredients);
    console.log(`\n🥘 Ingredients (${ingredientsList.length}):`);

    const byCategory = {
      key: [],
      important: [],
      flavor: [],
      base: []
    };

    ingredientsList.forEach(ing => {
      byCategory[ing.category].push(ing.name);
    });

    console.log(`  🔑 Key (${byCategory.key.length}): ${byCategory.key.join(', ')}`);
    console.log(`  ⭐ Important (${byCategory.important.length}): ${byCategory.important.slice(0, 5).join(', ')}${byCategory.important.length > 5 ? '...' : ''}`);
    console.log(`  🌿 Flavor (${byCategory.flavor.length}): ${byCategory.flavor.slice(0, 5).join(', ')}${byCategory.flavor.length > 5 ? '...' : ''}`);
    console.log(`  🧂 Base (${byCategory.base.length}): ${byCategory.base.join(', ')}`);
  } catch (e) {
    console.log(`❌ Error parsing ingredients: ${e.message}`);
  }

  // Check instructions
  try {
    const instructionsList = JSON.parse(instructions);
    console.log(`\n📖 Instructions (${instructionsList.length} steps):`);
    instructionsList.slice(0, 3).forEach((step, i) => {
      console.log(`  ${i + 1}. ${step.substring(0, 80)}${step.length > 80 ? '...' : ''}`);
    });
    if (instructionsList.length > 3) {
      console.log(`  ... and ${instructionsList.length - 3} more steps`);
    }
  } catch (e) {
    console.log(`❌ Error parsing instructions: ${e.message}`);
  }
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
        i++;
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

// Run check
const csvFile = process.argv[2] || path.join(__dirname, '..', 'kitchen_stories_main_recipes.csv');
const lineNum = parseInt(process.argv[3]) || 1;

checkRecipeStructure(csvFile, lineNum);
