import { collection, doc, getDocs, serverTimestamp, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { EMPTY_TOTALS, isMetricKey, MetricKey, Totals } from '../lib/metrics';

export async function getObjectives(userId: string): Promise<Totals> {
  const snapshot = await getDocs(collection(db, 'users', userId, 'objectives'));
  const goals: Totals = { ...EMPTY_TOTALS };

  snapshot.forEach((entry) => {
    const value = entry.data().value;
    if (isMetricKey(entry.id) && typeof value === 'number') {
      goals[entry.id] = value;
    }
  });

  return goals;
}

export async function saveObjective(userId: string, type: MetricKey, value: number): Promise<void> {
  await setDoc(doc(db, 'users', userId, 'objectives', type), {
    value,
    updatedAt: serverTimestamp(),
  });
}
