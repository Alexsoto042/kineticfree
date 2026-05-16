/**
 * This module contains functions to calculate nutritional information for a user,
 * such as Basal Metabolic Rate (BMR), Total Daily Energy Expenditure (TDEE),
 * and recommended macronutrient splits.
 */

import type { UserProfile, Gender, Goal, TrainingDays } from '../../types';

/**
 * Calculates Basal Metabolic Rate (BMR) using the Mifflin-St Jeor equation.
 * BMR is the number of calories your body needs to function at rest.
 */
function calculateBMR(weight_kg: number, height_cm: number, age: number, gender: Gender): number {
  if (gender === 'male') {
    return 10 * weight_kg + 6.25 * height_cm - 5 * age + 5;
  }
  // For 'female' or 'other', we use the female formula as a baseline.
  return 10 * weight_kg + 6.25 * height_cm - 5 * age - 161;
}

/**
 * Determines the activity factor based on the number of training days.
 */
function getActivityFactor(trainingDays: TrainingDays): number {
  switch (trainingDays) {
    case '2-3':
      return 1.375; // Lightly active
    case '4-5':
      return 1.55; // Moderately active
    case '5+':
      return 1.725; // Very active
    default:
      return 1.2; // Sedentary (fallback)
  }
}

/**
 * Calculates Total Daily Energy Expenditure (TDEE), which is the total
 * number of calories you burn in a day.
 */
function calculateTDEE(bmr: number, activityFactor: number): number {
  return bmr * activityFactor;
}

/**
 * Adjusts the TDEE based on the user's fitness goal.
 */
function adjustCaloriesForGoal(tdee: number, goal: Goal, calorieAdjustment?: number): number {
  if (calorieAdjustment !== undefined) {
    return tdee + calorieAdjustment; // Use custom adjustment
  }
  switch (goal) {
    case 'weight_loss':
      return tdee - 400; // Moderate deficit
    case 'gain_muscle':
      return tdee + 300; // Moderate surplus
    case 'get_fit':
    default:
      return tdee; // Maintenance
  }
}

/**
 * Calculates a sample macronutrient split (40% protein, 35% carbs, 25% fat).
 */
function calculateMacros(totalCalories: number): { protein: number; carbs: number; fat: number } {
  const proteinGrams = (totalCalories * 0.40) / 4;
  const carbsGrams = (totalCalories * 0.35) / 4;
  const fatGrams = (totalCalories * 0.25) / 9;
  return {
    protein: Math.round(proteinGrams),
    carbs: Math.round(carbsGrams),
    fat: Math.round(fatGrams),
  };
}

/**
 * Main function to get all nutritional recommendations for a user.
 */
export function getNutritionalRecommendations(
  profile: UserProfile,
  customCalorieAdjustment?: number,
  customProteinPercentage?: number,
  customCarbsPercentage?: number,
  customFatPercentage?: number
): {
  maintenanceCalories: number;
  targetCalories: number;
  macros: { protein: number; carbs: number; fat: number };
} {
  const { weight_kg, height_cm, age, gender, trainingDays, goal } = profile;

  const bmr = calculateBMR(weight_kg, height_cm, age, gender);
  const activityFactor = getActivityFactor(trainingDays);
  const tdee = calculateTDEE(bmr, activityFactor);
  const targetCalories = adjustCaloriesForGoal(tdee, goal, customCalorieAdjustment);
  const macros = calculateMacros(targetCalories, customProteinPercentage, customCarbsPercentage, customFatPercentage);

  return {
    maintenanceCalories: Math.round(tdee),
    targetCalories: Math.round(targetCalories),
    macros,
  };
}
