import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { updatePassword } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import {
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
} from 'react-native';
import { getAuthErrorMessage } from '../lib/authErrors';
import { db } from '../lib/firebase';
import { Theme } from '../lib/theme';
import { useAuth } from '../providers/AuthProvider';

type ProfileData = {
  fullName: string;
  dateOfBirth: string;
  mobileNumber: string;
};

const EMPTY_PROFILE: ProfileData = { fullName: '', dateOfBirth: '', mobileNumber: '' };

export default function ProfileScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [profile, setProfile] = useState<ProfileData>(EMPTY_PROFILE);
  const [isEditing, setIsEditing] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    if (!user) return;
    getDoc(doc(db, 'users', user.uid))
      .then((snap) => {
        if (snap.exists()) setProfile({ ...EMPTY_PROFILE, ...snap.data() });
      })
      .catch((error) => console.error('Failed to load profile:', error));
  }, [user]);

  const updateField = (field: keyof ProfileData) => (value: string) =>
    setProfile((previous) => ({ ...previous, [field]: value }));

  const handleSave = async () => {
    if (!user) return;

    const wantsNewPassword = newPassword.length > 0 || confirmPassword.length > 0;
    if (wantsNewPassword) {
      if (newPassword !== confirmPassword) {
        Alert.alert('Error', 'Passwords do not match.');
        return;
      }
      if (newPassword.length < 6) {
        Alert.alert('Error', 'Password should be at least 6 characters.');
        return;
      }
    }

    try {
      await updateDoc(doc(db, 'users', user.uid), {
        fullName: profile.fullName,
        dateOfBirth: profile.dateOfBirth,
        mobileNumber: profile.mobileNumber,
      });
      if (wantsNewPassword) {
        await updatePassword(user, newPassword);
        setNewPassword('');
        setConfirmPassword('');
      }
      setIsEditing(false);
      Alert.alert('Success', 'Your profile has been updated.');
    } catch (error) {
      Alert.alert('Error', getAuthErrorMessage(error, 'Unable to update your profile.'));
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={60}
      >
        <ScrollView contentContainerStyle={styles.container}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <MaterialIcons name="arrow-back" size={24} color={Theme.colors.white} />
          </TouchableOpacity>

          <Text style={styles.avatar}>{profile.fullName.charAt(0).toUpperCase()}</Text>
          <Text style={styles.title}>Welcome {profile.fullName.split(' ')[0]}</Text>

          <Text style={styles.label}>Email</Text>
          <TextInput style={[styles.input, styles.readOnly]} value={user?.email ?? ''} editable={false} />

          <Text style={styles.label}>Full name</Text>
          <TextInput
            style={[styles.input, !isEditing && styles.readOnly]}
            value={profile.fullName}
            editable={isEditing}
            onChangeText={updateField('fullName')}
          />

          <Text style={styles.label}>Mobile number</Text>
          <TextInput
            style={[styles.input, !isEditing && styles.readOnly]}
            value={profile.mobileNumber}
            editable={isEditing}
            keyboardType="phone-pad"
            onChangeText={updateField('mobileNumber')}
          />

          <Text style={styles.label}>Date of birth</Text>
          <TextInput
            style={[styles.input, !isEditing && styles.readOnly]}
            value={profile.dateOfBirth}
            editable={isEditing}
            onChangeText={updateField('dateOfBirth')}
          />

          {isEditing && (
            <>
              <Text style={styles.label}>New password</Text>
              <TextInput
                style={styles.input}
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry
              />

              <Text style={styles.label}>Confirm password</Text>
              <TextInput
                style={styles.input}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
              />
            </>
          )}

          {isEditing ? (
            <TouchableOpacity style={styles.button} onPress={handleSave}>
              <Text style={styles.buttonText}>Save changes</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.button, styles.editButton]}
              onPress={() => setIsEditing(true)}
            >
              <Text style={styles.buttonText}>Edit information</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  container: {
    backgroundColor: Theme.colors.background,
    padding: Theme.spacing.lg,
    paddingTop: Theme.spacing.xxl,
    flexGrow: 1,
    alignItems: 'center',
  },
  backButton: {
    position: 'absolute',
    top: 80,
    left: Theme.spacing.md,
    zIndex: 10,
    backgroundColor: Theme.colors.primary,
    padding: 8,
    borderRadius: Theme.radii.xl,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    overflow: 'hidden',
    backgroundColor: Theme.colors.secondary,
    color: Theme.colors.dark,
    textAlign: 'center',
    textAlignVertical: 'center',
    lineHeight: 90,
    fontSize: 36,
    fontFamily: Theme.fonts.bold,
    marginBottom: Theme.spacing.md,
  },
  title: {
    fontFamily: Theme.fonts.bold,
    fontSize: Theme.fontSizes.xl,
    color: Theme.colors.white,
    marginBottom: Theme.spacing.lg,
  },
  label: {
    alignSelf: 'flex-start',
    fontFamily: Theme.fonts.medium,
    fontSize: Theme.fontSizes.md,
    color: Theme.colors.primary,
    marginTop: Theme.spacing.sm,
  },
  input: {
    width: '100%',
    height: Theme.heights.input,
    borderRadius: Theme.radii.md,
    backgroundColor: Theme.colors.surface,
    paddingHorizontal: Theme.spacing.md,
    color: Theme.colors.white,
    fontFamily: Theme.fonts.medium,
    marginBottom: Theme.spacing.sm,
  },
  readOnly: {
    opacity: 0.7,
  },
  button: {
    backgroundColor: Theme.colors.primary,
    height: Theme.heights.button,
    borderRadius: Theme.radii.lg,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Theme.spacing.xl,
    marginTop: Theme.spacing.lg,
  },
  editButton: {
    backgroundColor: Theme.colors.secondary,
  },
  buttonText: {
    color: Theme.colors.white,
    fontFamily: Theme.fonts.semiBold,
    fontSize: Theme.fontSizes.md,
  },
});
