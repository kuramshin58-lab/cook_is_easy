# Recipe Finder - Сервис подбора рецептов

## Overview
Веб-приложение для подбора рецептов на основе продуктов, которые есть дома. Пользователь вводит ингредиенты, выбирает фильтры (время, тип приготовления, тип еды) и получает 5 уникальных рецептов от AI. Зарегистрированные пользователи получают персонализированные рецепты на основе своих предпочтений.

## Recent Changes
- 2026-01-19: Initial MVP implementation
  - Frontend: React components with autocomplete ingredient input
  - Backend: OpenAI GPT-4o integration for recipe generation
  - Filters: Cooking time, method, food type (healthy/normal/fatty)
- 2026-01-19: Authentication & Onboarding system
  - 5-step onboarding: intro, base ingredients, equipment, food preferences, registration
  - Supabase database integration for user storage
  - Personalized recipe generation based on user preferences
  - Header with login/logout functionality
- 2026-01-19: Enhanced Recipe Display
  - Recipe preview cards with compact info: title, short description, time, ingredient matching
  - Full recipe modal with detailed ingredients (with amounts) and availability status
  - Ingredient synchronization: user's base ingredients + search ingredients combined
  - Visual indicators: available ingredients (green checkmark) vs missing (grey X)
- 2026-01-19: Personal Cabinet (Profile Page)
  - Display user name and email
  - Edit base ingredients (add custom, toggle predefined)
  - Edit cooking equipment
  - Edit food preferences (cuisines and diet types)
  - Changes saved to Supabase with Zod validation
- 2026-01-19: Landing Page for Unauthenticated Users
  - Hero section with value proposition
  - Features section (4 cards): ingredients usage, personalization, time saving, AI recipes
  - Benefits list with checkmarks
  - CTA buttons: "Начать бесплатно" → /register, "У меня есть аккаунт" → /login
  - Recipe generator only available after login
- 2026-01-19: UX/UI Redesign (modern clean style)
  - Card-based category selection with icons for cooking time and method
  - Pill-style badges for food type selection
  - User greeting with avatar on authenticated home
  - Onboarding: progress bar, visual step indicators, equipment as card grid
  - Recipe preview cards: soft shadows, match percentage indicator, gradient progress bar
  - Recipe detail modal: КБЖУ (calories/protein/fats/carbs) in colored cards
  - Updated OpenAI prompt to generate nutritional information
- 2026-01-20: Enhanced Onboarding Step 2 (Base Ingredients)
  - Search input with autocomplete from 400+ ingredients
  - Only 5 recommendations shown at a time
  - Dynamic replacement: selected recommendation replaced by next from list
  - Selected ingredients shown separately with X to remove
  - Click outside to close search dropdown

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
  schema.ts           # Data schemas, types, popular ingredients list

client/src/
  lib/
    auth.tsx          # Authentication context provider
  pages/
    Home.tsx          # Main page with ingredient input
    Recipes.tsx       # Recipe results page
    Login.tsx         # User login page
    Onboarding.tsx    # 5-step registration onboarding
  components/
    Header.tsx        # Header with login/logout buttons
    IngredientInput.tsx   # Autocomplete input for ingredients
    FilterButtons.tsx     # Filter selection buttons
    RecipeCard.tsx        # Recipe display card
    RecipeList.tsx        # List of recipes with loading/error states

server/
  routes.ts           # API endpoints (auth + recipes)
  openai.ts           # OpenAI integration with personalization
  supabase.ts         # Supabase client configuration
```

### API Endpoints
- `POST /api/auth/register` - Register new user with onboarding data
- `POST /api/auth/login` - User login
- `POST /api/recipes/generate` - Generate recipes based on ingredients and user preferences

### Database Schema (Supabase)
```sql
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
```

## User Preferences
- Language: Russian (interface and recipes)
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
