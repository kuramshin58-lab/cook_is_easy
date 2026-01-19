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
