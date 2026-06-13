import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '@/constants/storage';

export const OnboardingRepository = {
  markCompleted: async (): Promise<void> => {
    await AsyncStorage.setItem(STORAGE_KEYS.onboardingCompleted, 'true');
  },

  hasCompleted: async (): Promise<boolean> => {
    const value = await AsyncStorage.getItem(STORAGE_KEYS.onboardingCompleted);
    return value !== null;
  },
};

export default OnboardingRepository;
