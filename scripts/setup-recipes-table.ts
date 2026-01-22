import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface RawRecipe {
  'Recipe Name': string;
  'URL': string;
  'Difficulty': string;
  'Prep Time': string;
  'Cook Time': string;
  'Rest Time': string;
  'Servings': string;
  'Rating Count': string;
  'Saves': string;
  'Cal': string;
  'Description': string;
  'Ingredients': string;
  'Instructions': string;
  'Nutrition': string;
  'Tags': string;
}

function parseTime(timeStr: string): number {
  const match = timeStr.match(/(\d+)/);
  return match ? parseInt(match[1], 10) : 0;
}

function parseDifficulty(diff: string): string {
  if (diff.includes('Easy')) return 'Easy';
  if (diff.includes('Medium')) return 'Medium';
  if (diff.includes('Hard')) return 'Hard';
  return 'Easy';
}

function parseIngredients(ingredientsStr: string): string[] {
  return ingredientsStr
    .split(',')
    .map(i => i.trim().toLowerCase())
    .filter(i => i.length > 0);
}

function parseTags(tagsStr: string): string[] {
  return tagsStr
    .split(',')
    .map(t => t.trim().toLowerCase())
    .filter(t => t.length > 0);
}

function parseCSV(content: string): RawRecipe[] {
  const lines = content.split('\n');
  const headers = parseCSVLine(lines[0]);
  const recipes: RawRecipe[] = [];
  
  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;
    const values = parseCSVLine(lines[i]);
    const recipe: any = {};
    headers.forEach((header, idx) => {
      recipe[header] = values[idx] || '';
    });
    recipes.push(recipe as RawRecipe);
  }
  
  return recipes;
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  
  return result;
}

async function main() {
  const csvFileName = process.argv[2];
  if (!csvFileName) {
    console.error('Usage: npx tsx scripts/setup-recipes-table.ts <csv_filename>');
    process.exit(1);
  }
  
  console.log(`Reading CSV file: ${csvFileName}...`);
  const csvPath = path.join(process.cwd(), 'attached_assets', csvFileName);
  const csvContent = fs.readFileSync(csvPath, 'utf-8');
  
  const rawRecipes = parseCSV(csvContent);
  console.log(`Parsed ${rawRecipes.length} recipes from CSV`);
  
  const recipesToInsert = rawRecipes.map(raw => ({
    title: raw['Recipe Name'],
    description: raw['Description'],
    ingredients: parseIngredients(raw['Ingredients']),
    difficulty: parseDifficulty(raw['Difficulty']),
    prep_time: parseTime(raw['Prep Time']),
    cook_time: parseTime(raw['Cook Time']),
    servings: parseInt(raw['Servings'], 10) || 2,
    instructions: raw['Instructions'],
    calories: parseInt(raw['Cal'], 10) || 0,
    tags: parseTags(raw['Tags']),
    source_url: raw['URL']
  }));
  
  console.log('Inserting recipes into Supabase...');
  
  const { data, error } = await supabase
    .from('recipes')
    .insert(recipesToInsert)
    .select();
  
  if (error) {
    console.error('Error inserting recipes:', error);
    process.exit(1);
  }
  
  console.log(`Successfully inserted ${data?.length || 0} recipes!`);
}

main().catch(console.error);
