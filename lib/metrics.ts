import type { Ionicons } from '@expo/vector-icons';
import { Theme } from './theme';

export type MetricKey = 'steps' | 'calories' | 'distance';
export type Totals = Record<MetricKey, number>;

export const METRIC_KEYS: MetricKey[] = ['steps', 'calories', 'distance'];

export const EMPTY_TOTALS: Totals = { steps: 0, calories: 0, distance: 0 };

const STEP_LENGTH_KM = 0.000762;
const KCAL_PER_STEP = 0.04;

export function totalsFromSteps(steps: number): Totals {
  return {
    steps,
    distance: steps * STEP_LENGTH_KM,
    calories: Math.round(steps * KCAL_PER_STEP),
  };
}

export function addTotals(a: Totals, b: Totals): Totals {
  return {
    steps: a.steps + b.steps,
    calories: a.calories + b.calories,
    distance: a.distance + b.distance,
  };
}

type MetricConfig = {
  label: string;
  unit: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  question: string;
  defaultGoal: number;
  goalStep: number;
  minGoal: number;
  format: (value: number) => string;
};

export const METRICS: Record<MetricKey, MetricConfig> = {
  steps: {
    label: 'Steps',
    unit: 'steps',
    icon: 'walk',
    color: Theme.colors.steps,
    question: 'How many steps do you want to reach today?',
    defaultGoal: 10000,
    goalStep: 500,
    minGoal: 500,
    format: (v) => Math.round(v).toLocaleString('en-US'),
  },
  calories: {
    label: 'Calories',
    unit: 'kcal',
    icon: 'flame',
    color: Theme.colors.calories,
    question: 'How many calories do you want to burn today?',
    defaultGoal: 400,
    goalStep: 50,
    minGoal: 50,
    format: (v) => Math.round(v).toLocaleString('en-US'),
  },
  distance: {
    label: 'Distance',
    unit: 'km',
    icon: 'map',
    color: Theme.colors.distance,
    question: 'How far do you want to walk today?',
    defaultGoal: 5,
    goalStep: 1,
    minGoal: 1,
    format: (v) => v.toFixed(2),
  },
};

export function isMetricKey(value: unknown): value is MetricKey {
  return typeof value === 'string' && value in METRICS;
}
