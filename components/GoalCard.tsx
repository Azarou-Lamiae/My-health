import { Ionicons } from '@expo/vector-icons';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { METRICS, MetricKey } from '../lib/metrics';
import { Theme } from '../lib/theme';

type Props = {
  metric: MetricKey;
  value: number;
  goal: number;
};

export function GoalCard({ metric, value, goal }: Props) {
  const { label, icon, color, format } = METRICS[metric];
  const percentage = Math.min(Math.round((value / goal) * 100), 100);

  const chartData = {
    labels: ['0%', '25%', '50%', '75%', '100%'],
    datasets: [
      {
        data: [0, goal * 0.25, goal * 0.5, goal * 0.75, goal],
        color: () => color,
        strokeWidth: 2,
      },
      {
        data: [0, value],
        color: () => Theme.colors.white,
        strokeWidth: 2,
      },
    ],
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={[styles.iconCircle, { backgroundColor: `${color}20` }]}>
          <Ionicons name={icon} size={24} color={color} />
        </View>
        <Text style={styles.label}>{label}</Text>
      </View>

      <LineChart
        data={chartData}
        width={Dimensions.get('window').width - 80}
        height={120}
        chartConfig={{
          backgroundColor: Theme.colors.card,
          backgroundGradientFrom: Theme.colors.card,
          backgroundGradientTo: Theme.colors.card,
          decimalPlaces: 0,
          color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
          labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
          style: { borderRadius: 16 },
        }}
        bezier
        style={styles.chart}
        withDots={false}
        withInnerLines={false}
        withOuterLines={false}
        withVerticalLines={false}
        withHorizontalLines={false}
      />

      <Text style={styles.percentage}>{percentage}%</Text>
      <Text style={styles.progressText}>
        {format(value)} / {format(goal)} {METRICS[metric].unit}
      </Text>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${percentage}%`, backgroundColor: color }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Theme.colors.card,
    padding: Theme.spacing.md,
    borderRadius: 20,
    width: '100%',
    height: 300,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Theme.spacing.md,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Theme.spacing.sm,
  },
  label: {
    color: Theme.colors.white,
    fontSize: Theme.fontSizes.xl,
    fontFamily: Theme.fonts.bold,
  },
  chart: {
    marginVertical: Theme.spacing.xs,
    borderRadius: 16,
  },
  percentage: {
    color: Theme.colors.white,
    fontSize: Theme.fontSizes.xl,
    fontFamily: Theme.fonts.bold,
    marginTop: Theme.spacing.xs,
  },
  progressText: {
    color: Theme.colors.secondary,
    fontSize: Theme.fontSizes.sm,
    fontFamily: Theme.fonts.medium,
    textAlign: 'right',
    marginBottom: Theme.spacing.xs,
  },
  track: {
    height: 4,
    backgroundColor: Theme.colors.surfaceDark,
    borderRadius: 2,
  },
  fill: {
    height: '100%',
    borderRadius: 2,
  },
});
