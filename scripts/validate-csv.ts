/**
 * Validate CSV Recipe Format
 *
 * This script validates CSV files in the optimized format before importing to database.
 * Checks all fields, data types, categories, and provides detailed error reports.
 *
 * Usage: npx tsx scripts/validate-csv.ts <file.csv>
 * Example: npx tsx scripts/validate-csv.ts data/pasta_recipes_new.csv
 */

import 'dotenv/config';
import * as fs from 'fs';
import { parse } from 'csv-parse/sync';

interface ValidationError {
  row: number;
  field: string;
  value: any;
  error: string;
  severity: 'error' | 'warning';
}

interface ValidationResult {
  valid: boolean;
  totalRows: number;
  errors: ValidationError[];
  warnings: ValidationError[];
}

const VALID_DIFFICULTIES = ['easy', 'medium', 'hard'];
const VALID_CATEGORIES = ['key', 'important', 'flavor', 'base'];
const VALID_UNITS = [
  'cup', 'cups', 'tbsp', 'tsp', 'tablespoon', 'tablespoons', 'teaspoon', 'teaspoons',
  'ml', 'l', 'g', 'kg', 'grams', 'gram', 'oz', 'lb', 'lbs', 'pound', 'pounds',
  'piece', 'pieces', 'clove', 'cloves',
  'to taste', 'pinch', 'handful', 'dash', ''
];

const REQUIRED_FIELDS = [
  'title', 'description', 'difficulty', 'prep_time', 'cook_time', 'servings',
  'ingredients', 'instructions', 'calories', 'protein', 'fats', 'carbs', 'source_url'
];

/**
 * Validate CSV file format
 */
function validateCSV(filePath: string): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];

  console.log('='.repeat(70));
  console.log('CSV VALIDATION REPORT');
  console.log('='.repeat(70));
  console.log(`\nFile: ${filePath}\n`);

  // Check if file exists
  if (!fs.existsSync(filePath)) {
    errors.push({
      row: 0,
      field: 'file',
      value: filePath,
      error: 'File not found',
      severity: 'error',
    });

    return {
      valid: false,
      totalRows: 0,
      errors,
      warnings,
    };
  }

  // Read and parse CSV
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  let recipes: any[];

  try {
    recipes = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    });
  } catch (error) {
    errors.push({
      row: 0,
      field: 'csv',
      value: null,
      error: `CSV parsing error: ${error instanceof Error ? error.message : String(error)}`,
      severity: 'error',
    });

    return {
      valid: false,
      totalRows: 0,
      errors,
      warnings,
    };
  }

  console.log(`✓ Found ${recipes.length} recipes\n`);
  console.log('🔍 Validating recipes...\n');

  // Validate each recipe
  recipes.forEach((recipe, index) => {
    const rowNum = index + 2; // +2 because CSV has header row and is 1-indexed

    // Check required fields
    REQUIRED_FIELDS.forEach(field => {
      if (!recipe[field] || recipe[field].trim() === '') {
        errors.push({
          row: rowNum,
          field,
          value: recipe[field],
          error: `Required field "${field}" is missing or empty`,
          severity: 'error',
        });
      }
    });

    // Validate title
    if (recipe.title && recipe.title.length > 100) {
      warnings.push({
        row: rowNum,
        field: 'title',
        value: recipe.title,
        error: `Title exceeds 100 characters (${recipe.title.length} chars)`,
        severity: 'warning',
      });
    }

    // Validate description
    if (recipe.description && recipe.description.length > 500) {
      warnings.push({
        row: rowNum,
        field: 'description',
        value: recipe.description,
        error: `Description exceeds 500 characters (${recipe.description.length} chars)`,
        severity: 'warning',
      });
    }

    // Validate difficulty
    if (recipe.difficulty && !VALID_DIFFICULTIES.includes(recipe.difficulty.toLowerCase())) {
      errors.push({
        row: rowNum,
        field: 'difficulty',
        value: recipe.difficulty,
        error: `Invalid difficulty. Must be one of: ${VALID_DIFFICULTIES.join(', ')}`,
        severity: 'error',
      });
    }

    // Validate prep_time
    if (recipe.prep_time) {
      const prepTime = parseInt(recipe.prep_time, 10);
      if (isNaN(prepTime) || prepTime < 0) {
        errors.push({
          row: rowNum,
          field: 'prep_time',
          value: recipe.prep_time,
          error: 'prep_time must be a positive integer',
          severity: 'error',
        });
      }
      if (prepTime > 300) {
        warnings.push({
          row: rowNum,
          field: 'prep_time',
          value: prepTime,
          error: 'prep_time is unusually high (>300 minutes)',
          severity: 'warning',
        });
      }
    }

    // Validate cook_time
    if (recipe.cook_time) {
      const cookTime = parseInt(recipe.cook_time, 10);
      if (isNaN(cookTime) || cookTime < 0) {
        errors.push({
          row: rowNum,
          field: 'cook_time',
          value: recipe.cook_time,
          error: 'cook_time must be a non-negative integer',
          severity: 'error',
        });
      }
      if (cookTime > 480) {
        warnings.push({
          row: rowNum,
          field: 'cook_time',
          value: cookTime,
          error: 'cook_time is unusually high (>480 minutes)',
          severity: 'warning',
        });
      }
    }

    // Validate servings
    if (recipe.servings) {
      const servings = parseInt(recipe.servings, 10);
      if (isNaN(servings) || servings <= 0) {
        errors.push({
          row: rowNum,
          field: 'servings',
          value: recipe.servings,
          error: 'servings must be a positive integer',
          severity: 'error',
        });
      }
      if (servings > 12) {
        warnings.push({
          row: rowNum,
          field: 'servings',
          value: servings,
          error: 'servings is unusually high (>12)',
          severity: 'warning',
        });
      }
    }

    // Validate ingredients (JSON)
    if (recipe.ingredients) {
      try {
        const ingredients = JSON.parse(recipe.ingredients);

        if (!Array.isArray(ingredients)) {
          errors.push({
            row: rowNum,
            field: 'ingredients',
            value: recipe.ingredients,
            error: 'ingredients must be a JSON array',
            severity: 'error',
          });
        } else {
          // Check for at least one key ingredient
          const hasKeyIngredient = ingredients.some((ing: any) => ing.category === 'key');
          if (!hasKeyIngredient) {
            errors.push({
              row: rowNum,
              field: 'ingredients',
              value: null,
              error: 'Recipe must have at least one KEY ingredient',
              severity: 'error',
            });
          }

          // Validate each ingredient
          ingredients.forEach((ing: any, ingIndex: number) => {
            if (!ing.name || typeof ing.name !== 'string') {
              errors.push({
                row: rowNum,
                field: `ingredients[${ingIndex}].name`,
                value: ing.name,
                error: 'Ingredient must have a "name" (string)',
                severity: 'error',
              });
            }

            if (ing.name && ing.name !== ing.name.toLowerCase()) {
              errors.push({
                row: rowNum,
                field: `ingredients[${ingIndex}].name`,
                value: ing.name,
                error: 'Ingredient name must be lowercase',
                severity: 'error',
              });
            }

            if (ing.amount === undefined) {
              errors.push({
                row: rowNum,
                field: `ingredients[${ingIndex}].amount`,
                value: ing.amount,
                error: 'Ingredient must have an "amount" field (can be empty string)',
                severity: 'error',
              });
            }

            if (ing.unit === undefined) {
              errors.push({
                row: rowNum,
                field: `ingredients[${ingIndex}].unit`,
                value: ing.unit,
                error: 'Ingredient must have a "unit" field',
                severity: 'error',
              });
            }

            if (ing.unit && !VALID_UNITS.includes(ing.unit.toLowerCase())) {
              warnings.push({
                row: rowNum,
                field: `ingredients[${ingIndex}].unit`,
                value: ing.unit,
                error: `Unit "${ing.unit}" is not in the standard list`,
                severity: 'warning',
              });
            }

            if (!ing.category) {
              errors.push({
                row: rowNum,
                field: `ingredients[${ingIndex}].category`,
                value: ing.category,
                error: 'Ingredient must have a "category"',
                severity: 'error',
              });
            } else if (!VALID_CATEGORIES.includes(ing.category)) {
              errors.push({
                row: rowNum,
                field: `ingredients[${ingIndex}].category`,
                value: ing.category,
                error: `Invalid category. Must be one of: ${VALID_CATEGORIES.join(', ')}`,
                severity: 'error',
              });
            }

            if (ing.substitutes !== undefined && !Array.isArray(ing.substitutes)) {
              errors.push({
                row: rowNum,
                field: `ingredients[${ingIndex}].substitutes`,
                value: ing.substitutes,
                error: 'substitutes must be an array',
                severity: 'error',
              });
            }

            if (ing.substitutes && ing.substitutes.length > 5) {
              warnings.push({
                row: rowNum,
                field: `ingredients[${ingIndex}].substitutes`,
                value: ing.substitutes.length,
                error: 'Too many substitutes (>5), consider limiting',
                severity: 'warning',
              });
            }
          });

          if (ingredients.length > 20) {
            warnings.push({
              row: rowNum,
              field: 'ingredients',
              value: ingredients.length,
              error: 'Recipe has many ingredients (>20), might be too complex',
              severity: 'warning',
            });
          }
        }
      } catch (error) {
        errors.push({
          row: rowNum,
          field: 'ingredients',
          value: recipe.ingredients,
          error: `Invalid JSON: ${error instanceof Error ? error.message : String(error)}`,
          severity: 'error',
        });
      }
    }

    // Validate instructions (JSON)
    if (recipe.instructions) {
      try {
        const instructions = JSON.parse(recipe.instructions);

        if (!Array.isArray(instructions)) {
          errors.push({
            row: rowNum,
            field: 'instructions',
            value: recipe.instructions,
            error: 'instructions must be a JSON array',
            severity: 'error',
          });
        } else if (instructions.length === 0) {
          errors.push({
            row: rowNum,
            field: 'instructions',
            value: instructions,
            error: 'instructions array is empty',
            severity: 'error',
          });
        } else {
          instructions.forEach((step: any, stepIndex: number) => {
            if (typeof step !== 'string' || step.trim() === '') {
              errors.push({
                row: rowNum,
                field: `instructions[${stepIndex}]`,
                value: step,
                error: 'Instruction step must be a non-empty string',
                severity: 'error',
              });
            }
          });
        }
      } catch (error) {
        errors.push({
          row: rowNum,
          field: 'instructions',
          value: recipe.instructions,
          error: `Invalid JSON: ${error instanceof Error ? error.message : String(error)}`,
          severity: 'error',
        });
      }
    }

    // Validate calories
    if (recipe.calories) {
      const calories = parseInt(recipe.calories, 10);
      if (isNaN(calories) || calories < 0) {
        errors.push({
          row: rowNum,
          field: 'calories',
          value: recipe.calories,
          error: 'calories must be a non-negative integer',
          severity: 'error',
        });
      }
      if (calories < 100 || calories > 1500) {
        warnings.push({
          row: rowNum,
          field: 'calories',
          value: calories,
          error: 'calories is outside typical range (100-1500)',
          severity: 'warning',
        });
      }
    }

    // Validate protein
    if (recipe.protein) {
      const protein = parseInt(recipe.protein, 10);
      if (isNaN(protein) || protein < 0) {
        errors.push({
          row: rowNum,
          field: 'protein',
          value: recipe.protein,
          error: 'protein must be a non-negative integer',
          severity: 'error',
        });
      }
    }

    // Validate fats
    if (recipe.fats) {
      const fats = parseInt(recipe.fats, 10);
      if (isNaN(fats) || fats < 0) {
        errors.push({
          row: rowNum,
          field: 'fats',
          value: recipe.fats,
          error: 'fats must be a non-negative integer',
          severity: 'error',
        });
      }
    }

    // Validate carbs
    if (recipe.carbs) {
      const carbs = parseInt(recipe.carbs, 10);
      if (isNaN(carbs) || carbs < 0) {
        errors.push({
          row: rowNum,
          field: 'carbs',
          value: recipe.carbs,
          error: 'carbs must be a non-negative integer',
          severity: 'error',
        });
      }
    }

    // Validate URL
    if (recipe.source_url && !recipe.source_url.startsWith('http')) {
      errors.push({
        row: rowNum,
        field: 'source_url',
        value: recipe.source_url,
        error: 'source_url must be a valid URL starting with http:// or https://',
        severity: 'error',
      });
    }
  });

  return {
    valid: errors.length === 0,
    totalRows: recipes.length,
    errors,
    warnings,
  };
}

/**
 * Print validation report
 */
function printReport(result: ValidationResult) {
  console.log('📊 VALIDATION RESULTS\n');
  console.log(`Total recipes: ${result.totalRows}`);
  console.log(`Errors: ${result.errors.length}`);
  console.log(`Warnings: ${result.warnings.length}\n`);

  if (result.errors.length > 0) {
    console.log('❌ ERRORS:\n');
    result.errors.forEach(err => {
      console.log(`  Row ${err.row}, field "${err.field}":`);
      console.log(`  → ${err.error}`);
      if (err.value !== null && err.value !== undefined) {
        console.log(`  → Value: ${JSON.stringify(err.value).slice(0, 100)}`);
      }
      console.log();
    });
  }

  if (result.warnings.length > 0) {
    console.log('⚠️  WARNINGS:\n');
    result.warnings.forEach(warn => {
      console.log(`  Row ${warn.row}, field "${warn.field}":`);
      console.log(`  → ${warn.error}`);
      if (warn.value !== null && warn.value !== undefined) {
        console.log(`  → Value: ${JSON.stringify(warn.value).slice(0, 100)}`);
      }
      console.log();
    });
  }

  console.log('='.repeat(70));

  if (result.valid) {
    console.log('✅ VALIDATION PASSED');
    console.log('='.repeat(70));
    console.log('\nThis CSV is ready for import!');
    console.log('Run: npx tsx scripts/import-structured-recipes.ts <file.csv>\n');
  } else {
    console.log('❌ VALIDATION FAILED');
    console.log('='.repeat(70));
    console.log(`\nFound ${result.errors.length} errors. Please fix them before importing.\n`);
  }
}

// CLI execution
const args = process.argv.slice(2);

if (args.length < 1) {
  console.log('Usage: npx tsx scripts/validate-csv.ts <file.csv>');
  console.log('\nExample:');
  console.log('  npx tsx scripts/validate-csv.ts data/pasta_recipes_new.csv');
  process.exit(1);
}

const [filePath] = args;

const result = validateCSV(filePath);
printReport(result);

process.exit(result.valid ? 0 : 1);

export { validateCSV, ValidationResult, ValidationError };
