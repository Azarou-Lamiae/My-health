import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { Theme } from '../../lib/theme';

type IconName = keyof typeof Ionicons.glyphMap;

const screens: { name: string; title: string; icon: IconName }[] = [
  { name: 'dashboard', title: 'Home', icon: 'home' },
  { name: 'history', title: 'History', icon: 'stats-chart' },
  { name: 'objectives', title: 'Goals', icon: 'trophy-outline' },
];

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Theme.colors.primary,
        tabBarStyle: { backgroundColor: Theme.colors.dark, borderTopWidth: 0 },
      }}
    >
      {screens.map(({ name, title, icon }) => (
        <Tabs.Screen
          key={name}
          name={name}
          options={{
            tabBarLabel: title,
            tabBarIcon: ({ color }) => <Ionicons name={icon} size={24} color={color} />,
          }}
        />
      ))}
    </Tabs>
  );
}
