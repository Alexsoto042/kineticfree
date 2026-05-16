import { useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { syncPlansAndGoals } from '../lib/sync';

export const usePlans = () => {
  // This useEffect triggers the background sync
  useEffect(() => {
    syncPlansAndGoals();
  }, []);

  // useLiveQuery provides reactive data from Dexie
  const goals = useLiveQuery(() => db.goals.toArray(), []);
  const plans = useLiveQuery(() => db.plans.toArray(), []);

  // The loading state is true until the first query completes
  const loading = goals === undefined || plans === undefined;

  // Note: Error handling for the sync process is inside syncPlansAndGoals.
  // useLiveQuery itself doesn't throw errors in the same way, but can return undefined.
  // For simplicity, we are not exposing a separate error state from this hook for now.

  return { goals: goals || [], plans: plans || [], loading, error: null };
};
