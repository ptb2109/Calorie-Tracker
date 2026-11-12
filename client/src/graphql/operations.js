import { gql } from '@apollo/client';

// Every GraphQL query and mutation the app uses, in one place: the frontend's view of the API.
// Each one matches an operation in the server's schema (server/src/graphql/typeDefs.js).

// ---------- user ----------

export const ME_QUERY = gql`
  query Me {
    me {
      id
      name
      email
      goals {
        calories
        protein
        carbs
        fat
      }
    }
  }
`;

export const UPDATE_GOALS_MUTATION = gql`
  mutation UpdateGoals($input: GoalsInput!) {
    updateGoals(input: $input) {
      id
      goals {
        calories
        protein
        carbs
        fat
      }
    }
  }
`;

// ---------- log in / sign up ----------

export const LOGIN_MUTATION = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      token
      user {
        id
        name
        email
      }
    }
  }
`;

export const SIGNUP_MUTATION = gql`
  mutation Signup($input: SignupInput!) {
    signup(input: $input) {
      token
      user {
        id
        name
        email
      }
    }
  }
`;

// ---------- the day ----------

// Queries to re-run after anything changes the day's numbers, so every part of the screen
// shows the server's latest data (the names match the query names below).
export const REFRESH_AFTER_CHANGE = ['DailySummary', 'History'];

export const DAILY_SUMMARY_QUERY = gql`
  query DailySummary($date: String!) {
    dailySummary(date: $date) {
      date
      goal
      eaten {
        calories
        protein
        carbs
        fat
      }
      burned
      net
      remaining
      foodEntries {
        id
        meal
        foodName
        grams
        calories
        protein
        carbs
        fat
      }
      exerciseEntries {
        id
        activity
        minutes
        caloriesBurned
      }
    }
  }
`;

export const HISTORY_QUERY = gql`
  query History($endDate: String!, $days: Int) {
    history(endDate: $endDate, days: $days) {
      date
      eaten
      burned
      net
      goal
    }
  }
`;

// ---------- food ----------

export const SEARCH_FOODS_QUERY = gql`
  query SearchFoods($query: String!) {
    searchFoods(query: $query) {
      fdcId
      name
      brand
      dataType
      per100g {
        calories
        protein
        carbs
        fat
      }
    }
  }
`;

export const ADD_FOOD_ENTRY_MUTATION = gql`
  mutation AddFoodEntry($input: FoodEntryInput!) {
    addFoodEntry(input: $input) {
      id
      foodName
      calories
    }
  }
`;

export const DELETE_FOOD_ENTRY_MUTATION = gql`
  mutation DeleteFoodEntry($id: ID!) {
    deleteFoodEntry(id: $id)
  }
`;

// ---------- exercise ----------

export const ADD_EXERCISE_ENTRY_MUTATION = gql`
  mutation AddExerciseEntry($input: ExerciseEntryInput!) {
    addExerciseEntry(input: $input) {
      id
      activity
      caloriesBurned
    }
  }
`;

export const DELETE_EXERCISE_ENTRY_MUTATION = gql`
  mutation DeleteExerciseEntry($id: ID!) {
    deleteExerciseEntry(id: $id)
  }
`;
