# Calorie Tracker

A MERN fitness and calorie tracker. React talks to a GraphQL API (Apollo Server on Express), which stores data in MongoDB and looks up nutrition facts from the USDA FoodData Central database.

## Structure

```text
calorie-tracker/
├── docs/requirements.md   # What we are building and why (read this first)
├── server/                # Node + Express + Apollo Server (GraphQL)
│   ├── src/app.js         # Builds the Express app (no network listening here)
│   ├── src/config.js      # Reads and checks settings from .env
│   ├── src/db.js          # MongoDB connection
│   ├── src/index.js       # Entry point: settings -> database -> start listening
│   ├── src/models/        # Mongoose models: User, FoodEntry, ExerciseEntry
│   ├── src/services/      # Business logic: calorie maths, entries, daily summary
│   ├── src/graphql/       # GraphQL schema, resolvers, request context, error formatting
│   └── .env.example       # Settings template; copy to .env
└── client/                # React app (added in Step 7)
```

## Running the app (Docker, no Node needed)

```bash
cp server/.env.example server/.env   # once
docker compose up                    # Ctrl + C to stop
```

Then open http://localhost:4000/health (it should say `"database": "connected"`), and http://localhost:4000/graphql for the GraphQL playground.

Run any npm command inside the container, for example adding a package:

```bash
docker compose run --rm server npm install <package-name>
```

## Running without Docker (needs Node 20.6+)

```bash
cd server
npm install
cp .env.example .env
npm run dev
```
