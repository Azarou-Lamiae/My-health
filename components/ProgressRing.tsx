import { Dimensions } from 'react-native';
import Animated, { SharedValue, useAnimatedProps } from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';
import { Theme } from '../lib/theme';

const STROKE_WIDTH = 12;

export const RING_SIZE = Dimensions.get('window').width * 0.5;

const RADIUS = (RING_SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

type Props = {
  /** Shared value between 0 and 1. */
  progress: SharedValue<number>;
  color?: string;
};

export function ProgressRing({ progress, color = Theme.colors.primary }: Props) {
  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: CIRCUMFERENCE * (1 - progress.value),
  }));

  const center = RING_SIZE / 2;

  return (
    <Svg width={RING_SIZE} height={RING_SIZE}>
      <Circle
        cx={center}
        cy={center}
        r={RADIUS}
        stroke={Theme.colors.secondary}
        strokeWidth={STROKE_WIDTH}
        fill="none"
      />
      <AnimatedCircle
        cx={center}
        cy={center}
        r={RADIUS}
        stroke={color}
        strokeWidth={STROKE_WIDTH}
        strokeDasharray={`${CIRCUMFERENCE}, ${CIRCUMFERENCE}`}
        strokeLinecap="round"
        fill="none"
        animatedProps={animatedProps}
      />
    </Svg>
  );
}
