import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { EMPTY_TOTALS, Totals } from '../lib/metrics';
import { useAuth } from '../providers/AuthProvider';
import { getObjectives } from '../services/objectives';

export function useGoals() {
  const userId = useAuth().user?.uid;
  const [goals, setGoals] = useState<Totals>(EMPTY_TOTALS);

  useFocusEffect(
    useCallback(() => {
      if (!userId) return;
      getObjectives(userId)
        .then(setGoals)
        .catch((error) => console.error('Failed to load goals:', error));
    }, [userId])
  );

  return goals;
}
