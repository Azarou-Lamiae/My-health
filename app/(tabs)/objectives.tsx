import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSharedValue, withTiming } from 'react-native-reanimated';
import { ProgressRing, RING_SIZE } from '../../components/ProgressRing';
import { useGoals } from '../../hooks/useGoals';
import { useTodayActivity } from '../../hooks/useTodayActivity';
import { METRIC_KEYS, METRICS } from '../../lib/metrics';
import { Theme } from '../../lib/theme';

export default function ObjectivesScreen() {
  const router = useRouter();
  const { today } = useTodayActivity();
  const goals = useGoals();
  const progress = useSharedValue(0);

  // Average completion across the goals the user has defined, each capped at 100%.
  const definedGoals = METRIC_KEYS.filter((key) => goals[key] > 0);
  const completion = definedGoals.length
    ? definedGoals.reduce((sum, key) => sum + Math.min(today[key] / goals[key], 1), 0) /
      definedGoals.length
    : 0;

  useEffect(() => {
    progress.value = withTiming(completion, { duration: 1000 });
  }, [completion, progress]);

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Today's Goals</Text>

      <View style={styles.ringContainer}>
        <View style={styles.ring}>
          <ProgressRing progress={progress} />
          <MaterialCommunityIcons
            name="bullseye-arrow"
            size={48}
            color={Theme.colors.primary}
            style={styles.ringIcon}
          />
        </View>
        <Text style={styles.percentage}>{Math.round(completion * 100)}%</Text>
      </View>

      <View style={styles.stats}>
        {METRIC_KEYS.map((key) => {
          const { icon, unit, format } = METRICS[key];
          return (
            <View key={key} style={styles.statBox}>
              <Ionicons name={icon} size={20} color={Theme.colors.white} />
              <Text style={styles.statValue}>
                {goals[key] > 0 ? `${format(today[key])} / ${format(goals[key])}` : format(today[key])}
              </Text>
              <Text style={styles.statLabel}>{unit}</Text>
            </View>
          );
        })}
      </View>

      <View style={styles.list}>
        {METRIC_KEYS.map((key) => {
          const { icon, label, color } = METRICS[key];
          return (
            <TouchableOpacity
              key={key}
              style={styles.listItem}
              onPress={() => router.push({ pathname: '/goal/[type]', params: { type: key } })}
            >
              <View style={styles.listItemLeft}>
                <Ionicons name={icon} size={20} color={color} style={styles.listIcon} />
                <Text style={styles.listItemText}>{label}</Text>
              </View>
              <Ionicons name="add" size={20} color={Theme.colors.white} />
            </TouchableOpacity>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: Theme.colors.dark,
  },
  content: {
    paddingHorizontal: Theme.spacing.sm,
    paddingBottom: Theme.spacing.lg,
  },
  title: {
    fontSize: Theme.fontSizes.xxl,
    fontFamily: Theme.fonts.bold,
    color: Theme.colors.primary,
    marginVertical: Theme.spacing.xxl,
    marginHorizontal: Theme.spacing.md,
  },
  ringContainer: {
    alignItems: 'center',
    width: '100%',
  },
  ring: {
    width: RING_SIZE,
    height: RING_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ringIcon: {
    position: 'absolute',
  },
  percentage: {
    fontSize: Theme.fontSizes.xl,
    fontFamily: Theme.fonts.bold,
    color: Theme.colors.primary,
    marginBottom: Theme.spacing.xs,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.radii.lg,
    padding: Theme.spacing.xs,
    marginTop: Theme.spacing.md,
  },
  statBox: {
    width: '32%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Theme.colors.card,
    padding: Theme.spacing.sm,
    borderRadius: Theme.radii.md,
  },
  statValue: {
    color: Theme.colors.white,
    fontSize: Theme.fontSizes.md,
    fontFamily: Theme.fonts.medium,
    textAlign: 'center',
  },
  statLabel: {
    color: Theme.colors.secondary,
    fontSize: Theme.fontSizes.sm,
    fontFamily: Theme.fonts.medium,
  },
  list: {
    backgroundColor: Theme.colors.surfaceDark,
    borderRadius: Theme.radii.lg,
    marginTop: Theme.spacing.md,
    paddingVertical: Theme.spacing.xs,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Theme.spacing.sm,
    paddingHorizontal: Theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.card,
  },
  listItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  listIcon: {
    marginRight: Theme.spacing.xs,
  },
  listItemText: {
    color: Theme.colors.white,
    fontSize: Theme.fontSizes.md,
    fontFamily: Theme.fonts.medium,
  },
});
