import { Redirect } from 'expo-router';
import { useAuth } from '../providers/AuthProvider';

export default function Index() {
  const { user } = useAuth();
  return <Redirect href={user ? '/(tabs)/dashboard' : '/(auth)/login'} />;
}
