import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { addTotals, EMPTY_TOTALS, Totals, totalsFromSteps } from '../lib/metrics';
import { useAuth } from '../providers/AuthProvider';
import {
  getPendingTotals,
  loadRemoteTotals,
  savePendingTotals,
  syncIfDue,
} from '../services/activity';
import { useStepCounter } from './useStepCounter';

const SYNC_CHECK_INTERVAL_MS = 60 * 1000;

type Options = {
  /** Count steps in real time and sync periodically. */
  live?: boolean;
};

/**
 * Today's activity = totals already stored in Firestore
 * + steps counted on this device that are waiting to be synced.
 */
export function useTodayActivity({ live = false }: Options = {}) {
  const userId = useAuth().user?.uid;

  const [remote, setRemote] = useState<Totals>(EMPTY_TOTALS);
  const [pending, setPending] = useState<Totals>(EMPTY_TOTALS);
  const [baselineSteps, setBaselineSteps] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [updatedAt, setUpdatedAt] = useState<number | null>(null);

  const reload = useCallback(async () => {
    if (!userId) return;
    try {
      await syncIfDue(userId);
      const [remoteTotals, pendingTotals] = await Promise.all([
        loadRemoteTotals(userId),
        getPendingTotals(userId),
      ]);
      setRemote(remoteTotals);
      setPending(pendingTotals);
      setBaselineSteps(pendingTotals.steps);
      setUpdatedAt(Date.now());
    } catch (error) {
      console.error('Failed to load activity:', error);
    } finally {
      setLoaded(true);
    }
  }, [userId]);

  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload])
  );

  useEffect(() => {
    if (!live || !userId) return;
    const timer = setInterval(async () => {
      try {
        if (await syncIfDue(userId)) await reload();
      } catch (error) {
        console.error('Auto-sync failed:', error);
      }
    }, SYNC_CHECK_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [live, userId, reload]);

  const recordSteps = useCallback(
    (totalSteps: number) => {
      if (!userId) return;
      const totals = totalsFromSteps(totalSteps);
      setPending(totals);
      savePendingTotals(userId, totals).catch((error) =>
        console.error('Failed to save steps locally:', error)
      );
    },
    [userId]
  );

  useStepCounter({
    enabled: live && loaded && !!userId,
    initialSteps: baselineSteps,
    onSteps: recordSteps,
  });

  const today = useMemo(() => addTotals(remote, pending), [remote, pending]);

  return { today, loaded, updatedAt, reload };
}
