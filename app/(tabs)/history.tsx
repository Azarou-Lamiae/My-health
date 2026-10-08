import { Ionicons } from '@expo/vector-icons';
import { doc, getDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { dateKey, startOfWeek, weekDays } from '../../lib/date';
import { db } from '../../lib/firebase';
import { EMPTY_TOTALS, Totals } from '../../lib/metrics';
import { Theme } from '../../lib/theme';
import { useAuth } from '../../providers/AuthProvider';

const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
const BAR_WIDTH = Dimensions.get('window').width / 10;
const MAX_BAR_HEIGHT = 150;

function useWeeklyActivity(userId: string | undefined, weekRef: Date) {
  const [days, setDays] = useState<Totals[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      setError('You are not logged in.');
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError('');

    Promise.all(
      weekDays(weekRef).map(async (day) => {
        const snap = await getDoc(doc(db, 'users', userId, 'activities', dateKey(day)));
        if (!snap.exists()) return EMPTY_TOTALS;
        const data = snap.data();
        return {
          steps: data.steps ?? 0,
          calories: data.calories ?? 0,
          distance: data.distance ?? 0,
        };
      })
    )
      .then((result) => !cancelled && setDays(result))
      .catch(() => !cancelled && setError('Unable to load your activity.'))
      .finally(() => !cancelled && setLoading(false));

    return () => {
      cancelled = true;
    };
  }, [userId, weekRef]);

  return { days, loading, error };
}

type BarProps = {
  value: number;
  day: string;
  maxValue: number;
  isMax: boolean;
};

function Bar({ value, day, maxValue, isMax }: BarProps) {
  const height = useSharedValue(0);

  useEffect(() => {
    height.value = withTiming((value / maxValue) * MAX_BAR_HEIGHT, { duration: 800 });
  }, [value, maxValue, height]);

  const animatedStyle = useAnimatedStyle(() => ({
    height: height.value,
    backgroundColor: isMax ? Theme.colors.primary : Theme.colors.secondary,
  }));

  return (
    <View style={styles.barContainer}>
      <Text style={styles.stepsLabel}>{value}</Text>
      <Animated.View style={[styles.bar, animatedStyle]} />
      <Text style={styles.dayLabel}>{day}</Text>
    </View>
  );
}

export default function HistoryScreen() {
  const userId = useAuth().user?.uid;
  const [weekRef, setWeekRef] = useState(() => new Date());
  const { days, loading, error } = useWeeklyActivity(userId, weekRef);

  const weekStart = startOfWeek(weekRef);
  const isCurrentWeek = weekStart.getTime() === startOfWeek(new Date()).getTime();

  const shiftWeek = (offset: number) => {
    setWeekRef((previous) => {
      const next = startOfWeek(previous);
      next.setDate(next.getDate() + offset * 7);
      return next;
    });
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={Theme.colors.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  const maxSteps = Math.max(...days.map((d) => d.steps), 1);
  const totalCalories = days.reduce((sum, d) => sum + d.calories, 0);
  const totalDistance = days.reduce((sum, d) => sum + d.distance, 0);

  return (
    <View style={styles.container}>
      <View style={styles.titleWrapper}>
        <Text style={styles.title}>Weekly history</Text>
        <View style={styles.titleUnderline} />
      </View>

      <View style={styles.chart}>
        {days.map((day, index) => (
          <Bar
            key={index}
            value={day.steps}
            day={DAY_LABELS[index]}
            maxValue={maxSteps}
            isMax={day.steps > 0 && day.steps === maxSteps}
          />
        ))}
      </View>

      <View style={styles.weekNav}>
        <TouchableOpacity onPress={() => shiftWeek(-1)} style={styles.arrow}>
          <Ionicons name="chevron-back" size={28} color={Theme.colors.white} />
        </TouchableOpacity>
        <Text style={styles.weekText}>Week of {weekStart.toLocaleDateString('en-GB')}</Text>
        <TouchableOpacity onPress={() => shiftWeek(1)} style={styles.arrow} disabled={isCurrentWeek}>
          <Ionicons
            name="chevron-forward"
            size={28}
            color={isCurrentWeek ? Theme.colors.border : Theme.colors.white}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.totals}>
        <Text style={styles.totalText}>Total calories: {totalCalories} kcal</Text>
        <Text style={styles.totalText}>Total distance: {totalDistance.toFixed(2)} km</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Theme.colors.background,
    padding: Theme.spacing.md,
  },
  errorText: {
    color: Theme.colors.calories,
    fontFamily: Theme.fonts.medium,
    fontSize: Theme.fontSizes.md,
  },
  titleWrapper: {
    alignItems: 'center',
    marginVertical: Theme.spacing.lg,
  },
  title: {
    color: Theme.colors.primary,
    fontSize: Theme.fontSizes.xl,
    fontFamily: Theme.fonts.bold,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  titleUnderline: {
    width: 80,
    height: 4,
    borderRadius: 2,
    backgroundColor: Theme.colors.primary,
    opacity: 0.25,
  },
  chart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 200,
    marginBottom: Theme.spacing.sm,
  },
  barContainer: {
    alignItems: 'center',
    marginHorizontal: Theme.spacing.xs / 2,
  },
  bar: {
    width: BAR_WIDTH,
    borderRadius: Theme.radii.sm,
  },
  stepsLabel: {
    color: Theme.colors.white,
    fontSize: Theme.fontSizes.sm,
    fontFamily: Theme.fonts.semiBold,
    marginBottom: 4,
    textAlign: 'center',
  },
  dayLabel: {
    color: Theme.colors.white,
    fontSize: Theme.fontSizes.sm,
    fontFamily: Theme.fonts.medium,
    marginTop: Theme.spacing.xxs,
  },
  weekNav: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Theme.spacing.sm,
  },
  arrow: {
    padding: 8,
  },
  weekText: {
    color: Theme.colors.white,
    fontSize: Theme.fontSizes.md,
    fontFamily: Theme.fonts.semiBold,
    marginHorizontal: 12,
  },
  totals: {
    marginTop: Theme.spacing.md,
    alignItems: 'center',
  },
  totalText: {
    color: Theme.colors.white,
    fontSize: Theme.fontSizes.sm,
    fontFamily: Theme.fonts.medium,
    marginTop: 2,
  },
});
