import type { Plan } from '../types';
import { logger } from './logger';

const planLogger = logger.createContext('PlanGenerator');

// Temporary workaround for caching issue
export type Answers = {
  goal?: string;
  experience?: string;
  trainingDays?: string;
  equipment?: string;
  nutritionInterest?: string;
};

import { plans } from '../dummy-data/plans';

/**
 * Generates a personalized workout plan by selecting the best-matching plan.
 * 
 * @param answers The answers from the onboarding questionnaire.
 * @returns The best matching Plan object, or null if no match is found.
 */
export function generatePlan(answers: Answers): Plan | null {
  planLogger.debug('Generating plan with answers:', answers);

  const { goal, experience } = answers;

  if (!goal || !experience) {
    planLogger.error('Goal and experience are required to generate a plan.');
    return null;
  }

  // 1. Look for a perfect match
  let suggestedPlan = plans.find(p => p.goal_id === goal && p.difficulty === experience);
  if (suggestedPlan) {
    planLogger.info('Found perfect match:', suggestedPlan);
    return suggestedPlan;
  }

  // 2. If no perfect match, look for the same goal at a lower difficulty
  if (experience === 'intermedio') {
    suggestedPlan = plans.find(p => p.goal_id === goal && p.difficulty === 'principiante');
    if (suggestedPlan) {
      planLogger.info('No intermediate plan found, suggesting beginner plan for same goal:', suggestedPlan);
      return suggestedPlan;
    }
  }
  if (experience === 'avanzado') {
    suggestedPlan = plans.find(p => p.goal_id === goal && p.difficulty === 'intermedio');
    if (suggestedPlan) {
      planLogger.info('No advanced plan found, suggesting intermediate plan for same goal:', suggestedPlan);
      return suggestedPlan;
    }
  }

  // 3. If still no match, fall back to a general fitness plan at the user's difficulty
  suggestedPlan = plans.find(p => p.goal_id === 'general_fitness' && p.difficulty === experience);
  if (suggestedPlan) {
    planLogger.info('No specific plan found, suggesting general fitness plan at same difficulty:', suggestedPlan);
    return suggestedPlan;
  }

  // 4. As a final fallback, return the simplest general fitness plan
  suggestedPlan = plans.find(p => p.goal_id === 'general_fitness' && p.difficulty === 'principiante');
  if (suggestedPlan) {
    planLogger.info('As a last resort, suggesting beginner general fitness plan:', suggestedPlan);
    return suggestedPlan;
  }

  return null; // Should not happen if dummy data is correct
}
