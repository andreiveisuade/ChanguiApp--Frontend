import AsyncStorage from '@react-native-async-storage/async-storage';

export const clearAllStorage = (): Promise<void> => AsyncStorage.clear();
