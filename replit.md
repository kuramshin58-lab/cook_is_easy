# Recipe Finder - Recipe Suggestion Service

## Overview
Web application for suggesting recipes based on ingredients you have at home. Users enter ingredients, select filters (time, meal type, skill level, food style) and get 5 unique recipes. Uses hybrid search: database-first with ChatGPT fallback. Registered users get personalized recipes based on their preferences stored in Supabase.

## Recent Changes
- 2026-01-23: Added recipe adaptation feature (AI ingredient substitution)
  - "Adapt recipe" button appears when user doesn't have all ingredients (match < 100%)
  - ChatGPT analyzes missing ingredients and suggests substitutions
  - Shows original → replacement list for all substitutions
  - Adapted recipe updates with new ingredients and adjusted steps
  - POST /api/recipes/adapt endpoint with Zod validation
- 2026-01-23: Simplified recipe scoring algorithm
  - Score = pure match percentage (matched ingredients / total recipe ingredients)
  - Recipes sorted by highest match % first
  - Minimum 20% match threshold to show recipe
  - Recipes must match at least one main search ingredient (not just base pantry ingredients)
- 2026-01-23: Fixed ingredient matching consistency bug
  - Created shared utility: client/src/lib/ingredientMatching.ts
  - Both RecipePreviewCard and RecipeDetailModal now use the same matching algorithm
  - Local calculation used for AI-generated recipes (ChatGPT fallback)
- 2026-01-23: Full English translation
  - Translated all UI components: Home, IngredientInput, Recipes, Login, Header, Onboarding, Profile, RecipeList, RecipePreviewCard, RecipeDetailModal
  - Updated schema.ts: All options (meal types, skill levels, food types, ingredients) now in English
  - Updated OpenAI prompts to generate English recipes
  - Simplified recipeSearch.ts: removed Russian translation dictionary (no longer needed)
  - ~300 popular ingredients in English for autocomplete
- 2026-01-20: Enhanced ingredient search with special ingredient booster (+30% for pumpkin, cream, mushrooms, spinach, eggplant, zucchini)
- 2026-01-20: Replaced cooking method with meal type selection (Breakfast, Main Course, Snack, Salad)
- 2026-01-19: Initial MVP with auth, onboarding, hybrid recipe search

## Project Architecture

### Stack
- **Frontend**: React, TypeScript, TailwindCSS, Shadcn UI
- **Backend**: Express.js, Node.js
- **Database**: Supabase (PostgreSQL)
- **AI**: OpenAI GPT-4o API
- **Routing**: Wouter
- **State Management**: TanStack Query, Context API (Auth)

### Key Files
```
shared/
  schema.ts           # Data schemas, types, English options & ingredients

client/src/
  lib/
    auth.tsx          # Authentication context provider
  pages/
    Home.tsx          # Main page with ingredient input (landing for unauthenticated)
    Recipes.tsx       # Recipe results page
    Login.tsx         # User login page
    Onboarding.tsx    # 5-step registration onboarding
    Profile.tsx       # User profile/settings page
  components/
    Header.tsx        # Header with login/logout buttons
    IngredientInput.tsx   # Autocomplete input for ingredients
    RecipeList.tsx        # List of recipes with loading/error states
    RecipePreviewCard.tsx # Recipe preview card with match percentage
    RecipeDetailModal.tsx # Full recipe modal with ingredients & steps

server/
  routes.ts           # API endpoints (auth + recipes)
  openai.ts           # OpenAI integration for recipe generation (English prompts)
  recipeSearch.ts     # Database search with scoring algorithm
  supabase.ts         # Supabase client configuration
```

### API Endpoints
- `POST /api/auth/register` - Register new user with onboarding data
- `POST /api/auth/login` - User login
- `PUT /api/auth/profile` - Update user preferences
- `POST /api/recipes/generate` - Generate recipes (hybrid: database + AI)

### Database Schema (Supabase)
```sql
-- Users table
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  base_ingredients TEXT[] DEFAULT '{}',
  equipment TEXT[] DEFAULT '{}',
  food_preferences TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Recipes table (for database-first search)
CREATE TABLE recipes (
  id UUID PRIMARY KEY,
  title TEXT,
  description TEXT,
  ingredients TEXT[],
  difficulty TEXT,
  prep_time INTEGER,
  cook_time INTEGER,
  servings INTEGER,
  instructions TEXT,
  calories INTEGER,
  tags TEXT[],
  source_url TEXT
);
```

### Filter Options (English)
- **Cooking Time**: 20 min, 40 min, 1 hour
- **Meal Type**: Breakfast, Main Course, Snack, Salad
- **Skill Level**: Beginner, Intermediate, Expert
- **Food Style**: Healthy, Regular, Comfort

### Search Algorithm
1. Database search first with ingredient matching
2. Score = matched ingredients / total recipe ingredients (pure match %)
3. Recipes must match at least one main search ingredient
4. Minimum 20% match threshold
5. Filters by cooking time and skill level
6. If < 5 recipes found, falls back to ChatGPT generation

## User Preferences
- Communication with user: Russian
- Service language: English (all UI, code, recipes, error messages)
- Theme: Green color scheme (primary: hsl(145 63% 42%))

## Development

### Running the App
```bash
npm run dev
```

The app runs on port 5000 with both frontend and backend served together.

### Environment Variables
- `OPENAI_API_KEY` - Required for recipe generation
- `SUPABASE_URL` - Supabase project URL
- `SUPABASE_ANON_KEY` - Supabase anonymous key
- `SESSION_SECRET` - Session encryption key
