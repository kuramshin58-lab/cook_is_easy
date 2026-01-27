# Project: Cook Is Easy - Recipe Search App

## Auto-Agent Orchestration

**IMPORTANT**: Automatically invoke specialized agents based on the task type WITHOUT asking the user. Use slash commands to delegate work to the appropriate agent.

### Agent Selection Rules

When the user's request involves:

| Task Type | Agent to Invoke | When to Use |
|-----------|-----------------|-------------|
| Backend/API work | `/backend-developer` | Database queries, API endpoints, server logic, Supabase |
| Frontend UI | `/frontend-developer` | React components, styling, user interface |
| Full-stack features | `/fullstack-developer` | Features spanning frontend + backend |
| Bug fixing | `/debugger` | Errors, crashes, unexpected behavior |
| Code quality | `/code-reviewer` | Review PRs, refactoring suggestions |
| API design | `/api-designer` | New endpoints, REST/GraphQL design |
| Testing | `/qa-expert` | Writing tests, test strategies |
| DevOps/Deploy | `/devops-engineer` | CI/CD, Docker, deployment |
| Documentation | `/documentation-engineer` | README, API docs, guides |
| TypeScript | `/typescript-pro` | Complex TS types, generics |
| JavaScript | `/javascript-pro` | JS-specific optimizations |
| Python scripts | `/python-pro` | Python tooling, scripts |
| Complex multi-step | `/multi-agent-coordinator` | Tasks requiring multiple agents |

### Orchestration Workflow

1. **Analyze Request**: Determine task type from user's message
2. **Select Agent(s)**: Choose the most appropriate agent(s)
3. **Invoke Automatically**: Use `/agent-name` without asking permission
4. **Coordinate if Needed**: For complex tasks, use `/multi-agent-coordinator`

### Multi-Agent Tasks

For tasks requiring multiple specialists:
1. First invoke `/multi-agent-coordinator`
2. Coordinator will delegate to appropriate agents
3. Aggregate results and present to user

### Examples

- "Fix the search bug" → Invoke `/debugger`
- "Add a new API endpoint" → Invoke `/backend-developer` or `/api-designer`
- "Improve the recipe card UI" → Invoke `/frontend-developer`
- "Review my code" → Invoke `/code-reviewer`
- "Write tests for the search" → Invoke `/qa-expert`
- "Refactor the entire auth system" → Invoke `/multi-agent-coordinator`

## Project Context

- **Stack**: React + TypeScript frontend, Express + Node.js backend, Supabase (PostgreSQL)
- **Main feature**: Recipe search by ingredients with weighted scoring
- **Key files**:
  - `server/recipeSearch.ts` - Search algorithm
  - `server/weightedScoring.ts` - Ingredient scoring
  - `client/src/pages/Home.tsx` - Main UI
  - `shared/schema.ts` - Database types

## Recipe Format

Recipes use structured ingredients with categories:
- `key` (weight 10): Main proteins/starches
- `important` (weight 5): Major components
- `flavor` (weight 2): Aromatics/spices
- `base` (weight 0): Salt, oil, water

See `docs/CSV_FORMAT_GUIDE.md` for full specification.
