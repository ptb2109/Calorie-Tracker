// The GraphQL schema: the contract between the server and any client.
// Text in """triple quotes""" becomes documentation you can read in the browser playground.

export const typeDefs = `#graphql
  "Which meal of the day an entry belongs to."
  enum Meal {
    breakfast
    lunch
    dinner
    snack
  }

  "Daily targets. Protein, carbs and fat (grams) are optional."
  type Goals {
    calories: Int!
    protein: Int
    carbs: Int
    fat: Int
  }

  type User {
    id: ID!
    email: String!
    name: String!
    goals: Goals!
  }

  "What signup and login return: a token to send with later requests, and the user."
  type AuthPayload {
    "Send this with every request as the header  Authorization: Bearer <token>"
    token: String!
    user: User!
  }

  "Calories (kcal) and macros (grams)."
  type Nutrients {
    calories: Float!
    protein: Float!
    carbs: Float!
    fat: Float!
  }

  type FoodEntry {
    id: ID!
    "Calendar day, YYYY-MM-DD."
    date: String!
    meal: Meal!
    foodName: String!
    "USDA FoodData Central id, when the food came from search."
    fdcId: Int
    grams: Float!
    "Values for the amount eaten (already scaled from per-100 g)."
    calories: Float!
    protein: Float!
    carbs: Float!
    fat: Float!
  }

  type ExerciseEntry {
    id: ID!
    date: String!
    activity: String!
    minutes: Int!
    caloriesBurned: Float!
  }

  type DailySummary {
    date: String!
    "Calorie goal for the day."
    goal: Int!
    eaten: Nutrients!
    burned: Float!
    "eaten.calories - burned"
    net: Float!
    "goal - net (negative means over the goal)"
    remaining: Float!
    foodEntries: [FoodEntry!]!
    exerciseEntries: [ExerciseEntry!]!
  }


  "Calorie totals for one day, used by the weekly chart."
  type DayTotal {
    date: String!
    eaten: Float!
    burned: Float!
    "eaten - burned"
    net: Float!
    "The user's current calorie goal."
    goal: Int!
  }

  "A food from the USDA database, with its nutrition per 100 g."
  type Food {
    "USDA FoodData Central id. Send it as fdcId when logging this food."
    fdcId: Int!
    name: String!
    "Brand owner for packaged foods; null for generic foods."
    brand: String
    "Where USDA's data comes from, e.g. Foundation, SR Legacy, Survey (FNDDS) or Branded."
    dataType: String!
    "Calories and macros per 100 g. Send them as per100g when logging this food."
    per100g: Nutrients!
  }

  type Query {
    "The logged-in user, or null if no valid token was sent."
    me: User
    "Entries and totals for one day."
    dailySummary(date: String!): DailySummary!
    "Search the USDA food database (logged-in users only). The search must be 2 to 100 characters."
    searchFoods(query: String!): [Food!]!
    "Daily totals for the days up to and including endDate, oldest first (1 to 31 days)."
    history(endDate: String!, days: Int = 7): [DayTotal!]!
  }

  input SignupInput {
    email: String!
    "8 to 72 characters."
    password: String!
    name: String!
  }

  "Nutrition per 100 g, as food databases list it."
  input NutrientsInput {
    calories: Float!
    protein: Float
    carbs: Float
    fat: Float
  }

  input FoodEntryInput {
    date: String!
    meal: Meal!
    foodName: String!
    fdcId: Int
    grams: Float!
    per100g: NutrientsInput!
  }

  "Fields that can be changed on an existing food entry."
  input FoodEntryUpdateInput {
    meal: Meal
    grams: Float
  }

  input ExerciseEntryInput {
    date: String!
    activity: String!
    minutes: Int!
    caloriesBurned: Float!
  }

  "Only the goals you send are changed. Send null for protein, carbs or fat to clear it."
  input GoalsInput {
    calories: Int
    protein: Int
    carbs: Int
    fat: Int
  }

  type Mutation {
    "Create an account. Returns a token, so the new user is logged in straight away."
    signup(input: SignupInput!): AuthPayload!
    "Log in with email and password. Returns a new token."
    login(email: String!, password: String!): AuthPayload!

    # Everything below needs a logged-in user.
    updateGoals(input: GoalsInput!): User!
    addFoodEntry(input: FoodEntryInput!): FoodEntry!
    updateFoodEntry(id: ID!, input: FoodEntryUpdateInput!): FoodEntry!
    deleteFoodEntry(id: ID!): Boolean!
    addExerciseEntry(input: ExerciseEntryInput!): ExerciseEntry!
    deleteExerciseEntry(id: ID!): Boolean!
  }
`;
