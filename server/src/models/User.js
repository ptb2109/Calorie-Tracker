import mongoose from 'mongoose';

// Daily targets. Stored inside the user document, not as a separate collection.
const goalsSchema = new mongoose.Schema(
  {
    calories: {
      type: Number,
      default: 2000,
      min: [500, 'Calorie goal must be at least 500'],
      max: [10000, 'Calorie goal must be at most 10000'],
    },
    // Optional targets in grams.
    protein: { type: Number, min: [0, 'Protein goal cannot be negative'] },
    carbs: { type: Number, min: [0, 'Carbs goal cannot be negative'] },
    fat: { type: Number, min: [0, 'Fat goal cannot be negative'] },
  },
  { _id: false } // a nested part of the user, so it needs no id of its own
);

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,   // creates a database index; a second account with this email is refused
      trim: true,     // " Ptb@NUS.edu " is saved as "ptb@nus.edu"
      lowercase: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Email address is not valid'],
    },
    // Never the password itself (Step 5 hashes it). select: false = left out of query results
    // unless code asks for it explicitly, so it can't leak by accident.
    passwordHash: { type: String, required: true, select: false },
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [50, 'Name must be 50 characters or fewer'],
    },
    goals: { type: goalsSchema, default: () => ({}) }, // new users get the default goals
  },
  { timestamps: true } // adds createdAt and updatedAt automatically
);

export const User = mongoose.model('User', userSchema);
