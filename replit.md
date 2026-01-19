# Recipe Finder - Сервис подбора рецептов

## Overview
Веб-приложение для подбора рецептов на основе продуктов, которые есть дома. Пользователь вводит ингредиенты, выбирает фильтры (время, тип приготовления, тип еды) и получает 5 уникальных рецептов от AI.

## Recent Changes
- 2026-01-19: Initial MVP implementation
  - Frontend: React components with autocomplete ingredient input
  - Backend: OpenAI GPT-4o integration for recipe generation
  - Filters: Cooking time, method, food type (healthy/normal/fatty)

## Project Architecture

### Stack
- **Frontend**: React, TypeScript, TailwindCSS, Shadcn UI
- **Backend**: Express.js, Node.js
- **AI**: OpenAI GPT-4o API
- **Routing**: Wouter
- **State Management**: TanStack Query

### Key Files
```
shared/
  schema.ts           # Data schemas, types, popular ingredients list

client/src/
  pages/
    Home.tsx          # Main page with ingredient input and recipe display
  components/
    IngredientInput.tsx   # Autocomplete input for ingredients
    FilterButtons.tsx     # Filter selection buttons
    RecipeCard.tsx        # Recipe display card
    RecipeList.tsx        # List of recipes with loading/error states

server/
  routes.ts           # API endpoints
  openai.ts           # OpenAI integration
```

### API Endpoints
- `POST /api/recipes/generate` - Generate recipes based on ingredients and filters

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
