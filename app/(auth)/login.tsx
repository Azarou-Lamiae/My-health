import { useRouter } from 'expo-router';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { getAuthErrorMessage } from '../../lib/authErrors';
import { auth } from '../../lib/firebase';
import { Theme } from '../../lib/theme';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const titleAnim = useRef(new Animated.Value(0)).current;
  const subtitleAnim = useRef(new Animated.Value(0)).current;
  const formAnim = useRef(new Animated.Value(0)).current;
  const formVisible = useRef(false);

  useEffect(() => {
    Animated.parallel([
      Animated.spring(titleAnim, { toValue: 1, friction: 5, useNativeDriver: true }),
      Animated.spring(subtitleAnim, { toValue: 1, delay: 150, useNativeDriver: true }),
    ]).start();
  }, [titleAnim, subtitleAnim]);

  const showForm = () => {
    if (formVisible.current) return;
    formVisible.current = true;
    Animated.parallel([
      Animated.spring(formAnim, { toValue: 1, friction: 6, tension: 40, useNativeDriver: true }),
      Animated.timing(subtitleAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start();
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }

    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      router.replace('/(tabs)/dashboard');
    } catch (error) {
      Alert.alert('Login failed', getAuthErrorMessage(error, 'Unable to log in. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <TouchableWithoutFeedback onPress={showForm}>
        <View style={styles.container}>
          <Animated.View
            style={[
              styles.header,
              {
                transform: [
                  { translateY: formAnim.interpolate({ inputRange: [0, 1], outputRange: [0, -50] }) },
                ],
              },
            ]}
          >
            <Animated.Text
              style={[
                styles.title,
                {
                  transform: [
                    { translateY: titleAnim.interpolate({ inputRange: [0, 1], outputRange: [-40, 0] }) },
                    { scale: titleAnim.interpolate({ inputRange: [0, 1], outputRange: [0.8, 1] }) },
                  ],
                },
              ]}
            >
              MyHealth
            </Animated.Text>
            <Animated.Text
              style={[
                styles.subtitle,
                {
                  opacity: subtitleAnim,
                  transform: [
                    { translateY: subtitleAnim.interpolate({ inputRange: [0, 1], outputRange: [-30, 0] }) },
                  ],
                },
              ]}
            >
              Welcome
            </Animated.Text>
          </Animated.View>

          <Animated.View
            style={{
              opacity: formAnim,
              transform: [
                { translateY: formAnim.interpolate({ inputRange: [0, 1], outputRange: [100, 0] }) },
              ],
            }}
          >
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder="example@example.com"
                placeholderTextColor={Theme.colors.secondary}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                value={email}
                onChangeText={setEmail}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <TextInput
                style={styles.input}
                placeholder="••••••••"
                placeholderTextColor={Theme.colors.secondary}
                secureTextEntry
                autoComplete="password"
                value={password}
                onChangeText={setPassword}
              />
            </View>

            <TouchableOpacity style={styles.primaryButton} onPress={handleLogin} disabled={loading}>
              {loading ? (
                <ActivityIndicator color={Theme.colors.white} />
              ) : (
                <Text style={styles.buttonText}>Log in</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => router.push('/(auth)/signUp')}
            >
              <Text style={styles.buttonText}>Sign up</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Theme.colors.dark,
  },
  container: {
    flex: 1,
    paddingHorizontal: Theme.spacing.lg,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: Theme.spacing.lg,
  },
  title: {
    fontSize: 36,
    fontFamily: Theme.fonts.bold,
    color: Theme.colors.primary,
    marginBottom: Theme.spacing.xs,
  },
  subtitle: {
    fontSize: Theme.fontSizes.xl,
    fontFamily: Theme.fonts.medium,
    color: Theme.colors.white,
  },
  inputGroup: {
    marginBottom: Theme.spacing.md,
  },
  label: {
    fontSize: Theme.fontSizes.md,
    fontFamily: Theme.fonts.medium,
    color: Theme.colors.white,
    marginBottom: Theme.spacing.xs,
  },
  input: {
    height: Theme.heights.input,
    borderWidth: 1,
    borderColor: Theme.colors.white,
    borderRadius: Theme.radii.lg,
    paddingHorizontal: Theme.spacing.md,
    fontFamily: Theme.fonts.medium,
    fontSize: Theme.fontSizes.md,
    color: Theme.colors.white,
  },
  primaryButton: {
    height: Theme.heights.button,
    backgroundColor: Theme.colors.primary,
    borderRadius: Theme.radii.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Theme.spacing.md,
  },
  secondaryButton: {
    marginTop: Theme.spacing.lg,
    alignItems: 'center',
  },
  buttonText: {
    fontFamily: Theme.fonts.bold,
    fontSize: Theme.fontSizes.sm,
    color: Theme.colors.white,
  },
});
