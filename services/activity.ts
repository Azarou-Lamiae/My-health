import AsyncStorage from '@react-native-async-storage/async-storage';
import { doc, getDoc, increment, serverTimestamp, setDoc } from 'firebase/firestore';
import { dateKey } from '../lib/date';
import { db } from '../lib/firebase';
import { EMPTY_TOTALS, Totals } from '../lib/metrics';

const PENDING_KEY = 'pendingActivity';
const SYNC_INTERVAL_MS = 5 * 60 * 1000;

/** Steps counted on the device that have not been pushed to Firestore yet. */
type PendingActivity = Totals & {
  userId: string;
  /** Day the pending steps belong to (YYYY-MM-DD). */
  date: string;
  /** When the first pending step was recorded. */
  since: number;
};

const activityDoc = (userId: string, date: string) =>
  doc(db, 'users', userId, 'activities', date);

async function readPending(): Promise<PendingActivity | null> {
  try {
    const raw = await AsyncStorage.getItem(PENDING_KEY);
    return raw ? (JSON.parse(raw) as PendingActivity) : null;
  } catch {
    return null;
  }
}

export async function getPendingTotals(userId: string): Promise<Totals> {
  const pending = await readPending();
  if (!pending || pending.userId !== userId || pending.date !== dateKey()) {
    return EMPTY_TOTALS;
  }
  return { steps: pending.steps, calories: pending.calories, distance: pending.distance };
}

export async function savePendingTotals(userId: string, totals: Totals): Promise<void> {
  const current = await readPending();
  const sameBatch = current?.userId === userId;
  const record: PendingActivity = {
    ...totals,
    userId,
    date: sameBatch ? current.date : dateKey(),
    since: sameBatch ? current.since : Date.now(),
  };
  await AsyncStorage.setItem(PENDING_KEY, JSON.stringify(record));
}

export async function loadRemoteTotals(userId: string): Promise<Totals> {
  const snap = await getDoc(activityDoc(userId, dateKey()));
  if (!snap.exists()) return EMPTY_TOTALS;
  const data = snap.data();
  return {
    steps: data.steps ?? 0,
    calories: data.calories ?? 0,
    distance: data.distance ?? 0,
  };
}

/** Pushes pending steps to Firestore and clears the local batch. */
export async function syncPending(userId: string): Promise<boolean> {
  const pending = await readPending();
  if (!pending || pending.userId !== userId || pending.steps <= 0) return false;

  await setDoc(
    activityDoc(userId, pending.date),
    {
      steps: increment(pending.steps),
      calories: increment(pending.calories),
      distance: increment(pending.distance),
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
  await AsyncStorage.removeItem(PENDING_KEY);
  return true;
}

/** Syncs when the batch is old enough, or belongs to a previous day. */
export async function syncIfDue(userId: string): Promise<boolean> {
  const pending = await readPending();
  if (!pending || pending.userId !== userId) return false;

  const isDue = pending.date !== dateKey() || Date.now() - pending.since > SYNC_INTERVAL_MS;
  return isDue ? syncPending(userId) : false;
}
