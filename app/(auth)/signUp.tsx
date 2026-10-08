import { MaterialIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { getAuthErrorMessage } from '../../lib/authErrors';
import { formatDate } from '../../lib/date';
import { auth, db } from '../../lib/firebase';
import { Theme } from '../../lib/theme';

export default function SignUpScreen() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [birthDate, setBirthDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSignUp = async () => {
    if (!email || !password || !fullName) {
      Alert.alert('Error', 'Please fill in all required fields.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Error', 'Password should be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      const { user } = await createUserWithEmailAndPassword(auth, email.trim(), password);

      await setDoc(doc(db, 'users', user.uid), {
        fullName,
        email: email.trim(),
        mobileNumber,
        dateOfBirth: birthDate ? formatDate(birthDate) : '',
        createdAt: new Date().toISOString(),
      });

      router.replace('/(tabs)/dashboard');
    } catch (error) {
      Alert.alert('Error', getAuthErrorMessage(error, 'Sign up failed. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton} disabled={loading}>
              <MaterialIcons name="arrow-back" size={24} color={Theme.colors.white} />
            </TouchableOpacity>
            <Text style={styles.title}>New Account</Text>
          </View>

          <View style={styles.form}>
            <Text style={styles.label}>Full name *</Text>
            <TextInput
              style={styles.input}
              value={fullName}
              onChangeText={setFullName}
              editable={!loading}
            />

            <Text style={styles.label}>Email *</Text>
            <TextInput
              style={styles.input}
              placeholder="example@example.com"
              placeholderTextColor={Theme.colors.secondary}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              value={email}
              onChangeText={setEmail}
              editable={!loading}
            />

            <Text style={styles.label}>Password *</Text>
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor={Theme.colors.secondary}
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              editable={!loading}
            />

            <Text style={styles.label}>Mobile number</Text>
            <TextInput
              style={styles.input}
              placeholder="06XXXXXXXX"
              placeholderTextColor={Theme.colors.secondary}
              keyboardType="phone-pad"
              value={mobileNumber}
              onChangeText={setMobileNumber}
              editable={!loading}
            />

            <Text style={styles.label}>Date of birth</Text>
            <TouchableOpacity
              style={styles.input}
              onPress={() => setShowDatePicker(true)}
              disabled={loading}
            >
              <Text style={[styles.dateText, !birthDate && { color: Theme.colors.secondary }]}>
                {birthDate ? formatDate(birthDate) : 'DD/MM/YYYY'}
              </Text>
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={birthDate ?? new Date()}
                mode="date"
                display={Platform.OS === 'ios' ? 'compact' : 'default'}
                maximumDate={new Date()}
                onChange={(_, selected) => {
                  setShowDatePicker(Platform.OS === 'ios');
                  if (selected) setBirthDate(selected);
                }}
              />
            )}
          </View>

          <TouchableOpacity
            style={[styles.submitButton, loading && styles.disabled]}
            onPress={handleSignUp}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={Theme.colors.white} />
            ) : (
              <Text style={styles.submitText}>Sign up</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  scrollContent: {
    paddingHorizontal: Theme.spacing.lg,
    paddingTop: Theme.spacing.xxxl,
    paddingBottom: Theme.spacing.xxl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Theme.spacing.lg,
  },
  backButton: {
    position: 'absolute',
    left: 0,
    zIndex: 1,
    padding: Theme.spacing.sm,
  },
  title: {
    flex: 1,
    fontSize: Theme.fontSizes.xl,
    fontFamily: Theme.fonts.bold,
    color: Theme.colors.primary,
    textAlign: 'center',
  },
  form: {
    marginTop: Theme.spacing.md,
  },
  label: {
    fontSize: Theme.fontSizes.md,
    fontFamily: Theme.fonts.medium,
    color: Theme.colors.white,
    marginTop: Theme.spacing.sm,
    marginBottom: Theme.spacing.xxs,
  },
  input: {
    height: Theme.heights.input,
    borderWidth: 1,
    borderRadius: Theme.radii.lg,
    borderColor: Theme.colors.white,
    justifyContent: 'center',
    paddingHorizontal: Theme.spacing.sm,
    fontFamily: Theme.fonts.medium,
    color: Theme.colors.white,
  },
  dateText: {
    fontFamily: Theme.fonts.medium,
    fontSize: Theme.fontSizes.md,
    color: Theme.colors.white,
  },
  submitButton: {
    height: Theme.heights.button,
    backgroundColor: Theme.colors.primary,
    borderRadius: Theme.radii.xl,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Theme.spacing.xxl,
  },
  disabled: {
    opacity: 0.7,
  },
  submitText: {
    fontSize: Theme.fontSizes.md,
    fontFamily: Theme.fonts.semiBold,
    color: Theme.colors.white,
    textTransform: 'uppercase',
  },
});
