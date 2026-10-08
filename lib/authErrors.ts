const MESSAGES: Record<string, string> = {
  'auth/email-already-in-use': 'This email is already in use.',
  'auth/invalid-email': 'Please enter a valid email address.',
  'auth/weak-password': 'Password should be at least 6 characters.',
  'auth/invalid-credential': 'Incorrect email or password.',
  'auth/user-not-found': 'Incorrect email or password.',
  'auth/wrong-password': 'Incorrect email or password.',
  'auth/too-many-requests': 'Too many attempts. Please try again later.',
  'auth/network-request-failed': 'Network error. Check your connection.',
  'auth/requires-recent-login': 'Please log in again before changing your password.',
};

export function getAuthErrorMessage(error: unknown, fallback: string): string {
  const code = (error as { code?: string })?.code;
  return (code && MESSAGES[code]) || fallback;
}
