import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { isMetricKey, MetricKey, METRICS } from '../../lib/metrics';
import { Theme } from '../../lib/theme';
import { useAuth } from '../../providers/AuthProvider';
import { getObjectives, saveObjective } from '../../services/objectives';

function GoalEditor({ metric }: { metric: MetricKey }) {
  const router = useRouter();
  const userId = useAuth().user?.uid;
  const { unit, question, defaultGoal, goalStep, minGoal } = METRICS[metric];
  const [goal, setGoal] = useState(defaultGoal);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!userId) return;
    getObjectives(userId)
      .then((saved) => saved[metric] > 0 && setGoal(saved[metric]))
      .catch((error) => console.error('Failed to load goal:', error));
  }, [userId, metric]);

  const handleSave = async () => {
    if (!userId) return;
    setSaving(true);
    try {
      await saveObjective(userId, metric, goal);
      router.back();
    } catch (error) {
      console.error('Failed to save goal:', error);
      Alert.alert('Error', 'Unable to save your goal. Please try again.');
      setSaving(false);
    }
  };

  return (
    <View style={styles.overlay}>
      <View style={styles.card}>
        <Text style={styles.title}>Your daily goal</Text>
        <Text style={styles.subtitle}>{question}</Text>

        <View style={styles.counter}>
          <TouchableOpacity
            style={styles.counterButton}
            onPress={() => setGoal((value) => Math.max(value - goalStep, minGoal))}
          >
            <Text style={styles.counterButtonText}>-</Text>
          </TouchableOpacity>

          <Text style={styles.counterValue}>{goal}</Text>

          <TouchableOpacity
            style={styles.counterButton}
            onPress={() => setGoal((value) => value + goalStep)}
          >
            <Text style={styles.counterButtonText}>+</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.unit}>{unit} / day</Text>

        <TouchableOpacity
          style={[styles.saveButton, saving && styles.disabled]}
          onPress={handleSave}
          disabled={saving}
        >
          <Text style={styles.saveButtonText}>Save</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.back()} disabled={saving}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function GoalScreen() {
  const { type } = useLocalSearchParams<{ type: string }>();

  if (!isMetricKey(type)) return <Redirect href="/(tabs)/objectives" />;
  return <GoalEditor metric={type} />;
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    backgroundColor: Theme.colors.card,
    borderRadius: Theme.radii.lg,
    padding: Theme.spacing.sm,
    width: Dimensions.get('window').width - 60,
    alignItems: 'center',
  },
  title: {
    fontSize: Theme.fontSizes.lg,
    fontFamily: Theme.fonts.bold,
    color: Theme.colors.primary,
    textAlign: 'center',
    marginBottom: Theme.spacing.sm,
  },
  subtitle: {
    fontSize: Theme.fontSizes.sm,
    fontFamily: Theme.fonts.medium,
    color: Theme.colors.secondary,
    textAlign: 'center',
    marginBottom: Theme.spacing.md,
  },
  counter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Theme.spacing.sm,
  },
  counterButton: {
    backgroundColor: Theme.colors.secondary,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: Theme.spacing.md,
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 5,
  },
  counterButtonText: {
    color: Theme.colors.dark,
    fontSize: 28,
    fontFamily: Theme.fonts.bold,
  },
  counterValue: {
    minWidth: 100,
    textAlign: 'center',
    fontSize: 40,
    fontFamily: Theme.fonts.bold,
    color: Theme.colors.white,
  },
  unit: {
    fontSize: Theme.fontSizes.sm,
    fontFamily: Theme.fonts.medium,
    color: Theme.colors.secondary,
    marginBottom: Theme.spacing.md,
  },
  saveButton: {
    backgroundColor: Theme.colors.primary,
    paddingVertical: Theme.spacing.sm,
    paddingHorizontal: Theme.spacing.lg,
    borderRadius: 20,
    marginBottom: Theme.spacing.sm,
  },
  disabled: {
    opacity: 0.7,
  },
  saveButtonText: {
    color: Theme.colors.white,
    fontSize: Theme.fontSizes.md,
    fontFamily: Theme.fonts.bold,
  },
  cancelText: {
    color: Theme.colors.secondary,
    fontSize: Theme.fontSizes.sm,
    fontFamily: Theme.fonts.medium,
    marginBottom: Theme.spacing.xs,
  },
});
