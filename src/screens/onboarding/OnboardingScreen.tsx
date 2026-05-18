import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
  FlatList,
  ListRenderItem,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import OnboardingFooter from '@/components/onboarding/OnboardingFooter';
import OnboardingSlide from '@/components/onboarding/OnboardingSlide';
import SplashSlide from '@/components/onboarding/SplashSlide';
import { colors, fonts, spacing, touchTarget } from '@/utils/theme';

const ONBOARDING_COMPLETED_KEY = '@changuiapp/onboarding_completed';

type Slide = {
  id: string;
  icon: keyof typeof Feather.glyphMap;
  titleKey: string;
  textKey: string;
};

const SLIDES: Slide[] = [
  {
    id: 'scan',
    icon: 'maximize',
    titleKey: 'onboarding.slide1.title',
    textKey: 'onboarding.slide1.text',
  },
  {
    id: 'budget',
    icon: 'trending-down',
    titleKey: 'onboarding.slide2.title',
    textKey: 'onboarding.slide2.text',
  },
  {
    id: 'start',
    icon: 'shopping-cart',
    titleKey: 'onboarding.slide3.title',
    textKey: 'onboarding.slide3.text',
  },
];

export function OnboardingScreen(): React.JSX.Element {
  const router = useRouter();
  const { t } = useTranslation();
  const { width } = useWindowDimensions();
  const listRef = useRef<FlatList<Slide>>(null);
  const [showSplash, setShowSplash] = useState<boolean>(true);
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  const handleFinish = async (): Promise<void> => {
    await AsyncStorage.setItem(ONBOARDING_COMPLETED_KEY, 'true');
    router.replace('/auth/login');
  };

  const handleNext = (): void => {
    if (currentIndex === SLIDES.length - 1) {
      void handleFinish();
      return;
    }

    const nextIndex = currentIndex + 1;
    setCurrentIndex(nextIndex);
    listRef.current?.scrollToIndex({ animated: true, index: nextIndex });
  };

  const renderItem: ListRenderItem<Slide> = ({ item }) => (
    <OnboardingSlide
      icon={item.icon}
      text={t(item.textKey)}
      title={t(item.titleKey)}
      width={width}
    />
  );

  if (showSplash) {
    return <SplashSlide onNext={() => setShowSplash(false)} />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.skipContainer}>
        <Pressable
          accessibilityHint={t('onboarding.skip')}
          accessibilityRole="button"
          onPress={handleFinish}
          style={styles.skipButton}
        >
          <Text style={styles.skipText}>{t('onboarding.skip')}</Text>
        </Pressable>
      </View>
      <FlatList
        data={SLIDES}
        horizontal
        keyExtractor={(item) => item.id}
        pagingEnabled
        ref={listRef}
        renderItem={renderItem}
        scrollEnabled={false}
        showsHorizontalScrollIndicator={false}
      />
      <OnboardingFooter
        current={currentIndex}
        isLast={currentIndex === SLIDES.length - 1}
        onNext={handleNext}
        onSkip={handleFinish}
        total={SLIDES.length}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    flex: 1,
  },
  skipContainer: {
    alignItems: 'flex-end',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
  },
  skipButton: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: touchTarget.minHeight,
    minWidth: touchTarget.minWidth,
  },
  skipText: {
    color: colors.primary,
    fontFamily: fonts.body,
    fontSize: 16,
    fontWeight: '700',
  },
});

export default OnboardingScreen;
