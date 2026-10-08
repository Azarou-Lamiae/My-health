import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { signOut } from 'firebase/auth';
import { useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { GoalCard } from '../../components/GoalCard';
import { useGoals } from '../../hooks/useGoals';
import { useTodayActivity } from '../../hooks/useTodayActivity';
import { auth } from '../../lib/firebase';
import { METRIC_KEYS, METRICS } from '../../lib/metrics';
import { Theme } from '../../lib/theme';
import { useAuth } from '../../providers/AuthProvider';
import { syncPending } from '../../services/activity';

const CARD_WIDTH = Dimensions.get('window').width - 40;

export default function DashboardScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { today, loaded, updatedAt } = useTodayActivity({ live: true });
  const goals = useGoals();
  const [activeCard, setActiveCard] = useState(0);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    setActiveCard(Math.round(event.nativeEvent.contentOffset.x / CARD_WIDTH));
  };

  const handleLogout = async () => {
    if (user) {
      try {
        await syncPending(user.uid);
      } catch (error) {
        console.error('Sync before logout failed:', error);
      }
    }
    await signOut(auth);
    router.replace('/');
  };

  if (!loaded) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={Theme.colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.date}>
          {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}
        </Text>
        <View style={styles.titleRow}>
          <Text style={styles.title}>Dashboard</Text>
          <TouchableOpacity onPress={() => router.push('/profile')}>
            <Ionicons name="person-circle-outline" size={40} color={Theme.colors.white} />
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
        <Text style={styles.logoutText}>Log out</Text>
      </TouchableOpacity>

      <Text style={[styles.sectionTitle, { marginTop: Theme.spacing.sm }]}>Today's Activity</Text>
      <View style={styles.stats}>
        {METRIC_KEYS.map((key, index) => {
          const { label, unit, icon, color, format } = METRICS[key];
          return (
            <View key={key} style={styles.statGroup}>
              {index > 0 && <View style={styles.statDivider} />}
              <View style={styles.statItem}>
                <View style={[styles.statIcon, { backgroundColor: `${color}20` }]}>
                  <Ionicons name={icon} size={24} color={color} />
                </View>
                <Text style={styles.statLabel}>{label}</Text>
                <Text style={styles.statValue}>
                  {format(today[key])}
                  {key !== 'steps' ? ` ${unit}` : ''}
                </Text>
              </View>
            </View>
          );
        })}
      </View>

      <Text style={styles.sectionTitle}>Daily Goals</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.cards}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        pagingEnabled
        snapToInterval={CARD_WIDTH}
        decelerationRate="fast"
        snapToAlignment="center"
      >
        {METRIC_KEYS.map((key) => (
          <View key={key} style={[styles.cardWrapper, { width: CARD_WIDTH }]}>
            <GoalCard
              metric={key}
              value={today[key]}
              goal={goals[key] || METRICS[key].defaultGoal}
            />
          </View>
        ))}
      </ScrollView>

      <View style={styles.pagination}>
        {METRIC_KEYS.map((key, index) => (
          <View
            key={key}
            style={[
              styles.dot,
              { width: activeCard === index ? 16 : 8, opacity: activeCard === index ? 1 : 0.5 },
            ]}
          />
        ))}
      </View>

      {updatedAt && (
        <Text style={styles.updated}>Last updated: {new Date(updatedAt).toLocaleTimeString()}</Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.dark,
  },
  content: {
    padding: Theme.spacing.md,
    paddingBottom: Theme.spacing.md,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Theme.colors.dark,
  },
  header: {
    marginBottom: Theme.spacing.md,
    paddingTop: Theme.spacing.xxl,
  },
  date: {
    fontSize: Theme.fontSizes.sm,
    fontFamily: Theme.fonts.medium,
    color: Theme.colors.secondary,
    marginBottom: Theme.spacing.xs,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: Theme.fontSizes.xxl,
    fontFamily: Theme.fonts.bold,
    color: Theme.colors.primary,
  },
  logoutButton: {
    alignSelf: 'flex-end',
    marginBottom: Theme.spacing.sm,
  },
  logoutText: {
    color: Theme.colors.primary,
    fontFamily: Theme.fonts.semiBold,
    fontSize: Theme.fontSizes.sm,
  },
  sectionTitle: {
    fontSize: Theme.fontSizes.xl,
    fontFamily: Theme.fonts.semiBold,
    color: Theme.colors.white,
    marginTop: Theme.spacing.lg,
    marginBottom: Theme.spacing.md,
  },
  stats: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.radii.lg,
    padding: Theme.spacing.sm,
    marginTop: Theme.spacing.xs,
  },
  statGroup: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: Theme.colors.border,
    marginRight: Theme.spacing.sm,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: Theme.spacing.xs,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statLabel: {
    color: Theme.colors.secondary,
    fontSize: Theme.fontSizes.sm,
    fontFamily: Theme.fonts.medium,
  },
  statValue: {
    color: Theme.colors.white,
    fontSize: Theme.fontSizes.lg,
    fontFamily: Theme.fonts.bold,
    textAlign: 'center',
  },
  cards: {
    paddingHorizontal: Theme.spacing.md,
    paddingBottom: Theme.spacing.md,
  },
  cardWrapper: {
    marginRight: Theme.spacing.md,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Theme.spacing.md,
    marginBottom: Theme.spacing.lg,
    height: 20,
  },
  dot: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
    backgroundColor: Theme.colors.primary,
  },
  updated: {
    color: Theme.colors.secondary,
    fontSize: Theme.fontSizes.sm,
    textAlign: 'center',
    marginTop: Theme.spacing.sm,
  },
});
