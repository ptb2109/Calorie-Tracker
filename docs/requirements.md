# Requirements and Design

## 1. Problem

People who want to lose, keep or gain weight need to know how many calories they eat and burn each day, compared with a goal. Looking up the nutrition of every food by hand is slow, so the app should find it for them.

## 2. Users

- **Guest**: can see the landing and sign-up pages only.
- **Registered user**: logs food and exercise, sets goals, sees their own history. Users never see each other's data.

## 3. User stories (MVP)

Format: *As a ..., I want ..., so that ...* Each has acceptance criteria we can test.

| # | Story | Done when |
|---|---|---|
| U1 | As a new user, I want to sign up and log in, so that my log is private. | Password is stored hashed; a wrong password is rejected; I stay logged in after a refresh. |
| U2 | As a user, I want to set a daily calorie goal (and optional protein/carb/fat targets), so that I know my limit. | Goal is saved and used in the daily summary. |
| U3 | As a user, I want to search for a food by name, so that I don't type nutrition values myself. | Typing "banana" lists matches with calories and macros per 100 g. |
| U4 | As a user, I want to log a food with an amount and a meal (breakfast, lunch, dinner, snack), so that it counts towards today. | Calories are scaled to the amount; entry appears under the right meal. |
| U5 | As a user, I want to log exercise with calories burned, so that my net calories are correct. | Net = eaten − burned. |
| U6 | As a user, I want a daily summary, so that I see where I stand. | Shows eaten, burned, net, remaining vs goal, and macros. |
| U7 | As a user, I want to edit or delete an entry, so that mistakes can be fixed. | Totals update straight away. |
| U8 | As a user, I want a 7-day chart, so that I see my trend. | Chart of net calories vs goal for the last 7 days. |

**Out of scope for now:** barcode scanning, social features, wearables, meal plans.

## 4. Non-functional requirements

- **Security:** bcrypt password hashes, JWT login tokens, every query only returns the logged-in user's data, API keys stay on the server.
- **Reliability:** the app still works (manual entry) if the food database is down.
- **Usability:** works on a phone screen.
- **Maintainability:** clear folders, tests for the calorie maths and the API.

## 5. Architecture

```text
 Browser                         Server (Node)                       Data
┌──────────────┐  GraphQL over  ┌────────────────────────────┐     ┌───────────┐
│ React        │  HTTP POST     │ Express                    │────▶│ MongoDB   │
│ + Apollo     │ ─────────────▶ │  └─ Apollo Server /graphql │     └───────────┘
│   Client     │ ◀───────────── │      ├─ resolvers          │     ┌──────────────────┐
└──────────────┘  JSON          │      └─ services ──────────│────▶│ USDA FoodData    │
                                └────────────────────────────┘     │ Central (REST)   │
                                                                   └──────────────────┘
```

The browser only ever speaks GraphQL to **our** server. The server's food service calls the USDA database (a REST API) and returns the results through our GraphQL schema, so the frontend never sees the outside API or its key.

## 6. Data model (first draft)

- **User**: email (unique), passwordHash, name, goals { calories, protein, carbs, fat }, createdAt
- **FoodEntry**: user, date (YYYY-MM-DD), meal, foodName, fdcId (USDA id, optional), grams, calories, protein, carbs, fat
- **ExerciseEntry**: user, date, activity, minutes, caloriesBurned

Nutrition values are copied onto the entry when it is logged, so history stays the same even if the food database changes later.

## 7. GraphQL API (first draft)

```graphql
type Query {
  me: User
  searchFoods(query: String!): [Food!]!
  dailySummary(date: String!): DailySummary!
  history(days: Int = 7): [DailySummary!]!
}

type Mutation {
  signup(email: String!, password: String!, name: String!): AuthPayload!
  login(email: String!, password: String!): AuthPayload!
  updateGoals(input: GoalsInput!): User!
  addFoodEntry(input: FoodEntryInput!): FoodEntry!
  updateFoodEntry(id: ID!, input: FoodEntryInput!): FoodEntry!
  deleteFoodEntry(id: ID!): Boolean!
  addExerciseEntry(input: ExerciseEntryInput!): ExerciseEntry!
  deleteExerciseEntry(id: ID!): Boolean!
}
```

## 8. Build plan

| Step | What | Main principle |
|---|---|---|
| 0 | Requirements and design (this file) | Understand the problem before coding |
| 1 | Project skeleton and a running server | Walking skeleton, version control |
| 2 | Configuration and MongoDB connection (Docker) | Config outside code, fail fast |
| 3 | Mongoose models | Data modelling, validation at the boundary |
| 4 | GraphQL schema and resolvers | Contract-first API design |
| 5 | Sign-up, login and protected queries | Security by default |
| 6 | Food search from USDA | Adapter pattern, caching, graceful failure |
| 7 | React client with Vite and Apollo Client | Component design, single source of truth |
| 8 | Pages: log, summary, goals, chart | UI state, user feedback |
| 9 | Automated tests | Testing pyramid |
| 10 | Docker Compose and documentation | Reproducible builds |
