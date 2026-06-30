import React from 'react';
import { useTranslation } from 'react-i18next';
import ScreenHeader from '@/components/layout/ScreenHeader';

interface CartHeaderProps {
  userName: string;
  onProfilePress?: () => void;
}

export function CartHeader({ userName, onProfilePress }: CartHeaderProps): React.JSX.Element {
  const { t } = useTranslation();
  const firstName = userName ? userName.trim().split(' ')[0] : '';

  return (
    <ScreenHeader
      title={t('home.greeting', { name: firstName })}
      onProfilePress={onProfilePress}
    />
  );
}

export default CartHeader;
