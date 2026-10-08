import { Pedometer } from 'expo-sensors';
import { useEffect, useRef } from 'react';
import { Alert, PermissionsAndroid, Platform } from 'react-native';

type Options = {
  enabled: boolean;
  /** Steps already counted today on this device but not yet synced. */
  initialSteps: number;
  onSteps: (totalSteps: number) => void;
};

async function requestPermission(): Promise<boolean> {
  if (Platform.OS === 'android') {
    const result = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACTIVITY_RECOGNITION
    );
    return result === PermissionsAndroid.RESULTS.GRANTED;
  }
  const { status } = await Pedometer.requestPermissionsAsync();
  return status === 'granted';
}

export function useStepCounter({ enabled, initialSteps, onSteps }: Options) {
  const onStepsRef = useRef(onSteps);
  onStepsRef.current = onSteps;

  useEffect(() => {
    if (!enabled) return;

    let cancelled = false;
    let subscription: { remove: () => void } | undefined;

    const start = async () => {
      try {
        if (!(await Pedometer.isAvailableAsync())) {
          Alert.alert('Unavailable', 'The step counter is not available on this device.');
          return;
        }
        if (!(await requestPermission())) {
          Alert.alert('Permission required', 'MyHealth needs access to your motion data to count steps.');
          return;
        }
        if (cancelled) return;

        let total = initialSteps;
        let lastCount = 0;

        subscription = Pedometer.watchStepCount(({ steps }) => {
          const delta = steps - lastCount;
          if (delta <= 0) return;
          lastCount = steps;
          total += delta;
          onStepsRef.current(total);
        });
      } catch (error) {
        console.error('Step counter failed to start:', error);
      }
    };

    start();

    return () => {
      cancelled = true;
      subscription?.remove();
    };
  }, [enabled, initialSteps]);
}
