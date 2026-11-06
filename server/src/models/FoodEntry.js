import mongoose from 'mongoose';
import { MEALS, userField, dateField } from './shared.js';

// Grams of protein, carbs or fat in this entry.
function nutrientField(label) {
  return { type: Number, default: 0, min: [0, `${label} cannot be negative`] };
}

// One food the user ate. Nutrition values are copied in when it is logged, so the history
// stays the same even if the food database changes later.
const foodEntrySchema = new mongoose.Schema(
  {
    user: userField(),
    date: dateField(),
    meal: {
      type: String,
      required: [true, 'Meal is required'],
      enum: {
        values: MEALS,
        message: '"{VALUE}" is not a meal. Use breakfast, lunch, dinner or snack',
      },
    },
    foodName: {
      type: String,
      required: [true, 'Food name is required'],
      trim: true,
      maxlength: [200, 'Food name must be 200 characters or fewer'],
    },
    fdcId: { type: Number }, // USDA food id when the food came from search (Step 6); empty if typed in
    grams: {
      type: Number,
      required: [true, 'Amount in grams is required'],
      min: [1, 'Amount must be at least 1 g'],
      max: [5000, 'Amount must be at most 5000 g'],
    },
    calories: {
      type: Number,
      required: [true, 'Calories are required'],
      min: [0, 'Calories cannot be negative'],
    },
    protein: nutrientField('Protein'),
    carbs: nutrientField('Carbs'),
    fat: nutrientField('Fat'),
  },
  { timestamps: true }
);

// Most lookups are "this user's entries for this day", so index exactly that.
foodEntrySchema.index({ user: 1, date: 1 });

export const FoodEntry = mongoose.model('FoodEntry', foodEntrySchema);
