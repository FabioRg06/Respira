import HapticFeedback from 'react-native-haptic-feedback';

export const hapticFeedback = (type: 'light' | 'medium' | 'heavy' = 'light') => {
  const hapticType =
    type === 'light' ? 'impactLight' :
    type === 'medium' ? 'impactMedium' : 'impactHeavy';

  HapticFeedback.trigger(hapticType as any);
};