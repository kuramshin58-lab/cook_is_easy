# Cook Is Easy

Recipe search application that helps you find what to cook based on ingredients you already have.

## Features

- **Ingredient-Based Search** - Enter ingredients you have, get matching recipes
- **Weighted Scoring Algorithm** - Recipes ranked by ingredient match quality
- **500+ Recipes** - Diverse collection across multiple cuisines (chicken, beef, fish, pasta)
- **Smart Substitutions** - 200+ ingredient substitutes for flexibility
- **User Profiles** - Save preferences and favorite recipes
- **Video Generation** - Create recipe videos with Remotion

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS |
| UI Components | Shadcn/UI, Radix UI |
| Backend | Express 5, Node.js |
| Database | Supabase (PostgreSQL) |
| ORM | Drizzle |
| State | TanStack Query |
| Video | Remotion |
| AI | OpenAI API (recipe generation) |

## Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/cook-is-easy.git
cd cook-is-easy

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your credentials

# Start development server
npm run dev
```

The app will be available at `http://localhost:5000`

## Environment Variables

Create a `.env` file in the root directory:

```env
# Supabase
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key

# OpenAI (for recipe generation)
OPENAI_API_KEY=your_openai_api_key

# Session
SESSION_SECRET=your_random_session_secret
```

## Project Structure

```
cook_is_easy/
├── client/                 # React frontend
│   ├── src/
│   │   ├── pages/          # Page components
│   │   ├── components/     # Reusable components
│   │   ├── hooks/          # React hooks
│   │   ├── lib/            # Utilities
│   │   └── remotion/       # Video generation
│   └── public/             # Static assets
│
├── server/                 # Express backend
│   ├── index.ts            # App entry point
│   ├── routes.ts           # API routes
│   ├── recipeSearch.ts     # Search algorithm
│   └── weightedScoring.ts  # Scoring logic
│
├── shared/                 # Shared code
│   ├── schema.ts           # Database types
│   └── substitutionMap.ts  # Ingredient substitutes
│
├── scripts/                # Utility scripts
├── recipe-data/            # Recipe CSV files
├── docs/                   # Documentation
└── migrations/             # Database migrations
```

## Available Scripts

```bash
# Development
npm run dev          # Start dev server with hot reload

# Build
npm run build        # Build for production
npm start            # Run production build

# Database
npm run db:push      # Push schema changes to Supabase

# Type checking
npm run check        # Run TypeScript compiler

# Video generation
npm run remotion:studio        # Open Remotion Studio
npm run remotion:render        # Render recipe video (9:16)
npm run remotion:render:square # Render square video (1:1)
npm run remotion:render:ad     # Render ad video
```

## Recipe Search Algorithm

The search uses a weighted scoring system:

| Category | Weight | Description |
|----------|--------|-------------|
| Key | 10 | Main proteins/starches (chicken, rice, pasta) |
| Important | 5 | Major components (tomatoes, cheese) |
| Flavor | 2 | Aromatics/spices (garlic, herbs) |
| Base | 0 | Common ingredients (salt, oil, water) |

Recipes are ranked by:
1. Match score (how many ingredients match)
2. Diversity (max 2 recipes per key ingredient)
3. Missing ingredients count

## Documentation

- [CSV Format Guide](docs/CSV_FORMAT_GUIDE.md) - Recipe data format specification
- [Ingredient Categories](docs/INGREDIENT_CATEGORIES.md) - How ingredients are categorized
- [Recipe Import Guide](docs/RECIPE_IMPORT_README.md) - How to add new recipes
- [Migration Guide](MIGRATION_GUIDE.md) - Database migration instructions

## API Endpoints

### Recipe Search

```
POST /api/recipes/search
```

Request body:
```json
{
  "ingredients": ["chicken", "tomato", "garlic"],
  "limit": 20
}
```

Response:
```json
{
  "recipes": [
    {
      "id": 1,
      "title": "Garlic Butter Chicken",
      "cookTime": 25,
      "difficulty": "easy",
      "matchScore": 98,
      "ingredients": [...],
      "instructions": [...]
    }
  ]
}
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

---

Built with love for home cooks everywhere.
