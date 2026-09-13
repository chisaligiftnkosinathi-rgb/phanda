import { useEffect, useRef, useState } from 'react';
import { Animated } from 'react-native';
import { useAnimationStore } from '@/state/useAnimationStore';

export type BadgeState = 'HIDDEN' | 'IMMEDIATE' | 'SETTLED' | 'MEMORY';

export function useTrustResumeAnimation(entityId: string, initialBadgeState: BadgeState = 'HIDDEN') {
  const { activeEntityId, stage } = useAnimationStore();
  const isActive = activeEntityId === entityId;
  const isAnotherActive = activeEntityId !== null && activeEntityId !== entityId;

  // Animated Values (Stored as Ref containers)
  const scaleRef = useRef(new Animated.Value(1));
  const opacityRef = useRef(new Animated.Value(1));
  const pulseOpacityRef = useRef(new Animated.Value(0));

  // Badge State (Visibility Decay Model)
  const [badgeState, setBadgeState] = useState<BadgeState>(initialBadgeState);

  // React to global stage changes
  useEffect(() => {
    let timerId: ReturnType<typeof setTimeout> | undefined;

    const scale = scaleRef.current;
    const opacity = opacityRef.current;
    const pulseOpacity = pulseOpacityRef.current;

    if (isActive) {
      if (stage === 'ZOOM_ENTITY') {
        Animated.spring(scale, {
          toValue: 1.05,
          friction: 7,
          tension: 40,
          useNativeDriver: true,
        }).start();
      } else if (stage === 'CONFIRM_BIND') {
        // Trigger the pulse ring and immediate badge asynchronously to avoid cascading renders
        queueMicrotask(() => {
          setBadgeState('IMMEDIATE');
        });

        Animated.sequence([
          Animated.timing(pulseOpacity, {
            toValue: 1,
            duration: 150,
            useNativeDriver: true,
          }),
          Animated.timing(pulseOpacity, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          })
        ]).start();
      } else if (stage === 'UNFREEZE') {
        Animated.spring(scale, {
          toValue: 1,
          friction: 7,
          tension: 40,
          useNativeDriver: true,
        }).start();

        // Decay badge after a few seconds
        timerId = setTimeout(() => {
          setBadgeState(prev => (prev === 'IMMEDIATE' ? 'SETTLED' : prev));
        }, 5000);
      }
    } else if (isAnotherActive) {
      // Fade out non-active cards
      if (stage === 'FREEZE_LIST') {
        Animated.timing(opacity, {
          toValue: 0.2,
          duration: 200,
          useNativeDriver: true,
        }).start();
      } else if (stage === 'UNFREEZE') {
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }).start();
      }
    }

    return () => {
      if (timerId) clearTimeout(timerId);
    };
  }, [stage, isActive, isAnotherActive]);

  return {
    scale: scaleRef.current,
    opacity: opacityRef.current,
    pulseOpacity: pulseOpacityRef.current,
    isActive,
    badgeState,
  };
}