import React from 'react';
import { View, FlatList, ActivityIndicator, StyleSheet, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { usePurchaseHistory } from '@/viewmodels/usePurchaseHistory';

export const HistoryScreen = () => {
  const { t } = useTranslation();
  const { purchases, isLoading, error, refetch } = usePurchaseHistory();

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyTitle}>
        {t('common.emptyTitle')}
      </Text>
      <Text style={styles.emptySubtitle}>
        {t('common.emptySubtitle')}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {isLoading ? (
        <View style={styles.centeredContainer}>
          <ActivityIndicator size="large" color="#D84B47" />
        </View>
      ) : error ? (
        <View style={styles.centeredContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : (
        <FlatList
          data={purchases}
          keyExtractor={(item) => item.id.toString()}
          refreshing={isLoading}
          onRefresh={refetch}
          ListEmptyComponent={renderEmptyState}
          contentContainerStyle={[
            styles.listContent, 
            purchases.length === 0 && styles.listEmpty
          ]}
          renderItem={({ item }) => (
            <View style={styles.cardPlaceholder}>
               <Text>Compra - Total: ${item.total}</Text>
            </View>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: '#D84B47',
    textAlign: 'center',
  },
  listContent: {
    padding: 16,
  },
  listEmpty: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.7,
  },
  cardPlaceholder: {
    marginBottom: 16,
    padding: 16,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
  }
});
