import mongoose from 'mongoose';
import { userField, dateField } from './shared.js';

// One workout. Calories burned are subtracted from calories eaten to give net calories.
const exerciseEntrySchema = new mongoose.Schema(
  {
    user: userField(),
    date: dateField(),
    activity: {
      type: String,
      required: [true, 'Activity is required'],
      trim: true,
      maxlength: [100, 'Activity must be 100 characters or fewer'],
    },
    minutes: {
      type: Number,
      required: [true, 'Minutes are required'],
      min: [1, 'Minutes must be at least 1'],
      max: [1440, 'Minutes cannot be more than a day (1440)'],
    },
    caloriesBurned: {
      type: Number,
      required: [true, 'Calories burned are required'],
      min: [0, 'Calories burned cannot be negative'],
      max: [5000, 'Calories burned must be at most 5000'],
    },
  },
  { timestamps: true }
);

exerciseEntrySchema.index({ user: 1, date: 1 });

export const ExerciseEntry = mongoose.model('ExerciseEntry', exerciseEntrySchema);
