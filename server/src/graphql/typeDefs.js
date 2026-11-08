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

  type Query {
    "The current user."
    me: User
    "Entries and totals for one day."
    dailySummary(date: String!): DailySummary!
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
    updateGoals(input: GoalsInput!): User!
    addFoodEntry(input: FoodEntryInput!): FoodEntry!
    updateFoodEntry(id: ID!, input: FoodEntryUpdateInput!): FoodEntry!
    deleteFoodEntry(id: ID!): Boolean!
    addExerciseEntry(input: ExerciseEntryInput!): ExerciseEntry!
    deleteExerciseEntry(id: ID!): Boolean!
  }
`;
