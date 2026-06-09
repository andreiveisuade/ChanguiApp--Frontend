import React, { useState, useMemo } from 'react';
import { ActivityIndicator, FlatList, Pressable, RefreshControl, StyleSheet, TextInput, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { colors, fonts, radii, spacing } from '@/constants/theme';
import { useRouter } from 'expo-router';
import HistoryHeader from '@/components/layout/HistoryHeader'; 
import useProfile from '@/viewmodels/useProfile';
import { usePurchaseHistory } from '@/viewmodels/usePurchaseHistory';
import { AppText } from '@/components/atoms/AppText';
import { AppIcon } from '@/components/atoms/AppIcon';

const filterOptions = ['thisWeek', 'thisMonth', 'thisYear'] as const;

export function PurchaseHistoryScreen(): React.JSX.Element {
  const [search, setSearch] = useState<string>('');
  const [selectedFilter, setSelectedFilter] = useState<typeof filterOptions[number]>('thisYear');

  const [expandedCardId, setExpandedCardId] = useState<string | null>(null); 

  const { t } = useTranslation();
  const router = useRouter();
  const { profile } = useProfile();
  
  // Traemos los datos del backend a través del ViewModel
  const { purchases, isLoading, error, refetch } = usePurchaseHistory();

  // Calculamos los totales reales en base a la data
  const summary = useMemo(() => {
    const totalSpent = purchases.reduce((acc, p) => acc + (p.total || 0), 0);
    const completedCount = purchases.filter(p => p.status === 'COMPLETED').length;
    return {
      totalSpent,
      completedCount,
      totalPurchases: purchases.length,
    };
  }, [purchases]);
  
  const userName = profile?.full_name ?? t('home.defaultUser', { defaultValue: 'Usuario' });

  // UI para cuando la lista está vacía o cargando
  const renderEmptyState = () => {
    if (isLoading) return null;
    if (error) {
      return (
        <View style={styles.emptyContainer}>
          <AppText variant="Body" style={{ color: colors.error, marginBottom: 16 }}>{error}</AppText>
          <Pressable onPress={refetch} style={styles.filterButtonActive}>
            <AppText variant="Body" style={{ color: colors.white, padding: 8 }}>Reintentar</AppText>
          </Pressable>
        </View>
      );
    }
    return (
      <View style={styles.emptyContainer}>
        <AppText variant="H3" style={{ textAlign: 'center', marginBottom: 8 }}>
          {t('common.emptyTitle', { defaultValue: 'No hay nada acá' })}
        </AppText>
        <AppText variant="Body" style={{ textAlign: 'center', opacity: 0.7 }}>
          {t('common.emptySubtitle', { defaultValue: 'Todavía no hay contenido para mostrar' })}
        </AppText>
      </View>
    );
  };

  return (
    <View style={styles.page}>
      
      <HistoryHeader userName={userName} onProfilePress={() => router.push('/settings')} />
      <View style={styles.headerDivider} />

      <FlatList
        data={purchases}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.pageContent}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor={colors.primary} />
        }
        ListHeaderComponent={
          <>
            <View style={styles.titleContainer}>
              <AppText variant="Display" style={styles.mainTitle}>Historial de compras</AppText>
              <AppText variant="Body" style={styles.subTitle}>{summary.totalPurchases} compras realizadas</AppText>
            </View>

            <View style={styles.combinedSummaryContainer}>
              <View style={styles.summaryColumn}>
                <AppText variant="Body" style={styles.summaryLabel}>Total gastado</AppText>
                <AppText variant="Display" style={styles.summaryValue}>${summary.totalSpent}</AppText>
              </View>
              <View style={styles.summaryDivider} />
              <View style={styles.summaryColumn}>
                <AppText variant="Body" style={styles.summaryLabel}>Compras completadas</AppText>
                <AppText variant="Display" style={styles.summaryValue}>{summary.completedCount}</AppText>
              </View>
            </View>

            <View style={styles.searchContainer}>
              <AppIcon color={colors.textSecondary} name="buscar" size={18} />
              <TextInput
                accessibilityLabel={t('historyScreen.searchA11y')}
                onChangeText={setSearch}
                placeholder="Buscar por tienda o número de orden"
                placeholderTextColor={colors.textSecondary}
                style={styles.searchInput}
                value={search}
              />
            </View>

            <View style={styles.filtersRow}>
              {filterOptions.map((option, index) => {
                const isActive = selectedFilter === option;
                const label = option === 'thisWeek' ? 'Esta semana' : option === 'thisMonth' ? 'Este mes' : 'Este año';
                
                return (
                  <Pressable
                    key={option}
                    accessibilityRole="button"
                    onPress={() => setSelectedFilter(option)}
                    style={[
                      styles.filterButton,
                      isActive && styles.filterButtonActive,
                      index < filterOptions.length - 1 ? styles.filterButtonSpacing : null,
                    ]}
                  >
                    <AppText variant="Body" style={[styles.filterText, isActive && styles.filterTextActive]}>
                      {label}
                    </AppText>
                  </Pressable>
                );
              })}
            </View>
          </>
        }
        renderItem={({ item }) => {
          const isExpanded = expandedCardId === String(item.id);
          const isCompleted = item.status === 'COMPLETED';
          
          const dateObj = new Date(item.created_at || Date.now());
          const dateStr = dateObj.toLocaleDateString();
          const timeStr = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

          return (
            <View style={[styles.purchaseCard, isExpanded && styles.purchaseCardExpanded]}>
              <Pressable
                accessibilityRole="button"
                style={styles.purchaseHeader}
                onPress={() => setExpandedCardId(isExpanded ? null : String(item.id))}
              >
                <View style={styles.cardRow}>
                  <View style={styles.cardHeaderLeft}>
                    <AppText variant="Display" style={styles.storeName}>{item.store_name}</AppText>
                    <View style={[styles.statusBadge, !isCompleted && { backgroundColor: '#FEF3C7' }]}>
                      <AppText variant="Label" style={[styles.statusTextSuccess, !isCompleted && { color: '#92400E' }]}>
                        {item.status}
                      </AppText>
                    </View>
                  </View>
                  <AppText variant="Display" style={styles.cardTotalAmount}>
                    ${item.total}
                  </AppText>
                </View>

                <View style={[styles.cardRow, { marginTop: 4 }]}>
                  <AppText variant="Body" style={styles.orderId}>{String(item.id)}</AppText>
                  <AppIcon name={isExpanded ? 'arriba' : 'abajo'} size={20} color={colors.textSecondary} />
                </View>

                <View style={styles.cardMetaRow}>
                  <View style={styles.metaItem}>
                    <AppIcon name="calendario" size={14} color={colors.textSecondary} />
                    <AppText variant="Body" style={styles.metaText}>{dateStr} • {timeStr}</AppText>
                  </View>
                  <View style={styles.metaItem}>
                    <AppIcon name="ubicacion" size={14} color={colors.textSecondary} />
                    <AppText variant="Body" style={styles.metaText}>{item.store_location || 'Ubicación no disponible'}</AppText>
                  </View>
                </View>
              </Pressable>

              {isExpanded && (
                <View style={styles.expandedContent}>
                  <View style={styles.cardDivider} />
                  
                  <View style={styles.paymentMethodRow}>
                    <AppIcon name="tarjeta" size={16} color={colors.textSecondary} />
                    <AppText variant="Body" style={styles.paymentMethodText}>
                      Método de pago: <AppText variant="Body" style={styles.paymentMethodBold}>{item.payment_method || 'No especificado'}</AppText>
                    </AppText>
                  </View>

                  <View style={styles.cardDivider} />

                  <View style={styles.itemsHeader}>
                    <AppText variant="Body" style={styles.itemsHeaderText}>Productos ({(item.items || []).length})</AppText>
                  </View>
                  
                  {(item.items || []).map((product) => (
                    <View key={String(product.id)} style={styles.productCard}>
                      <View style={styles.productRowTop}>
                        <AppText variant="Body" style={styles.productName}>{product.product_name}</AppText>
                        <AppText variant="Body" style={styles.productPriceTotal}>
                          ${product.price * product.quantity}
                        </AppText>
                      </View>
                      <AppText variant="Body" style={styles.productPriceUnit}>
                        Cantidad: {product.quantity} • ${product.price} c/u
                      </AppText>
                    </View>
                  ))}

                  <View style={styles.totalsContainer}>
                    <View style={styles.feeRow}>
                      <AppText variant="Body" style={styles.feeLabel}>Subtotal</AppText>
                      <AppText variant="Body" style={styles.feeValue}>${item.subtotal}</AppText>
                    </View>
                    <View style={styles.feeRow}>
                      <AppText variant="Body" style={styles.feeLabel}>Cargo por servicio</AppText>
                      <AppText variant="Body" style={styles.feeValue}>${item.service_fee}</AppText>
                    </View>
                    <View style={styles.cardDivider} />
                    <View style={styles.totalRow}>
                      <AppText variant="Display" style={styles.totalLabel}>Total</AppText>
                      <AppText variant="Display" style={styles.totalFinalValue}>${item.total}</AppText>
                    </View>
                  </View>

                  <Pressable style={styles.downloadButton} onPress={() => {}}>
                    <AppIcon name="descargar" size={20} color={colors.white} />
                    <AppText variant="Body" style={styles.downloadButtonText}>
                      Descargar comprobante
                    </AppText>
                  </Pressable>
                </View>
              )}
            </View>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    backgroundColor: colors.white, 
    flex: 1,
  },
  headerDivider: {
    height: 1,
    backgroundColor: colors.border || '#E5E7EB',
    width: '100%',
  },
  pageContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  titleContainer: {
    marginBottom: spacing.lg,
  },
  mainTitle: {
    color: colors.textPrimary,
    fontFamily: fonts.display,
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 4,
  },
  subTitle: {
    color: colors.textSecondary,
    fontFamily: fonts.body,
    fontSize: 14,
  },
  combinedSummaryContainer: {
    alignItems: 'center',
    backgroundColor: '#EEF4FF',
    borderRadius: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xl,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
  },
  summaryColumn: {
    alignItems: 'center',
    flex: 1,
  },
  summaryDivider: {
    backgroundColor: '#D0DDF7',
    height: '100%',
    marginHorizontal: spacing.sm,
    width: 1,
  },
  summaryLabel: {
    color: colors.textSecondary,
    fontFamily: fonts.body,
    fontSize: 13,
    marginBottom: spacing.xs,
  },
  summaryValue: {
    color: colors.textPrimary,
    fontFamily: fonts.display,
    fontSize: 26,
    fontWeight: '800',
  },
  searchContainer: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border || '#E5E7EB',
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    height: 48,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  searchInput: {
    color: colors.textPrimary,
    flex: 1,
    fontFamily: fonts.body,
    fontSize: 15,
    padding: 0,
  },
  filtersRow: {
    flexDirection: 'row',
    marginBottom: spacing.xl,
  },
  filterButton: {
    alignItems: 'center',
    backgroundColor: colors.inputBackground || '#F3F4F6',
    borderRadius: 18,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    height: 36,
  },
  filterButtonSpacing: {
    marginRight: spacing.sm,
  },
  filterButtonActive: {
    backgroundColor: '#D84B47', 
  },
  filterText: {
    color: colors.textPrimary,
    fontFamily: fonts.body,
    fontSize: 13,
  },
  filterTextActive: {
    color: colors.white,
    fontWeight: '700',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    marginTop: 40,
  },
  purchaseCard: {
    backgroundColor: colors.white,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border || '#E5E7EB',
    marginBottom: spacing.md,
    padding: spacing.lg,
  },
  purchaseCardExpanded: {
    borderColor: '#080808',
    borderWidth: 1.5,
  },
  purchaseHeader: {
    width: '100%',
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  storeName: {
    color: colors.textPrimary,
    fontFamily: fonts.display,
    fontSize: 16,
    fontWeight: '800',
  },
  cardTotalAmount: {
    color: colors.textPrimary,
    fontFamily: fonts.display,
    fontSize: 18,
    fontWeight: '800',
  },
  statusBadge: {
    borderRadius: radii.sm,
    paddingHorizontal: 6,
    paddingVertical: 2,
    backgroundColor: '#E6F4EA',
  },
  statusTextSuccess: {
    fontFamily: fonts.body,
    fontSize: 11,
    fontWeight: '700',
    color: '#137333',
  },
  orderId: {
    color: colors.textSecondary,
    fontFamily: fonts.body,
    fontSize: 13,
  },
  cardMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.md,
    gap: spacing.md,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  metaText: {
    color: colors.textSecondary,
    fontFamily: fonts.body,
    fontSize: 12,
  },
  expandedContent: {
    marginTop: spacing.xs,
  },
  cardDivider: {
    backgroundColor: colors.border || '#E5E7EB',
    height: 1,
    width: '100%',
    marginVertical: spacing.md,
  },
  paymentMethodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  paymentMethodText: {
    color: colors.textSecondary,
    fontFamily: fonts.body,
    fontSize: 13,
  },
  paymentMethodBold: {
    color: colors.textPrimary,
    fontFamily: fonts.body,
    fontSize: 13,
    fontWeight: '700',
  },
  itemsHeader: {
    marginBottom: spacing.md,
  },
  itemsHeaderText: {
    color: colors.textPrimary,
    fontFamily: fonts.body,
    fontSize: 14,
    fontWeight: '700',
  },
  productCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: radii.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  productRowTop: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 2,
  },
  productName: {
    color: colors.textPrimary,
    flex: 1,
    fontFamily: fonts.body,
    fontSize: 14,
    fontWeight: '700',
    marginRight: spacing.sm,
  },
  productPriceTotal: {
    color: colors.textPrimary,
    fontFamily: fonts.body,
    fontSize: 14,
    fontWeight: '800',
  },
  productPriceUnit: {
    color: colors.textSecondary,
    fontFamily: fonts.body,
    fontSize: 13,
  },
  totalsContainer: {
    marginBottom: spacing.lg,
  },
  feeRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  feeLabel: {
    color: colors.textSecondary,
    fontFamily: fonts.body,
    fontSize: 13,
  },
  feeValue: {
    color: colors.textPrimary,
    fontFamily: fonts.body,
    fontSize: 13,
    fontWeight: '600',
  },
  totalRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  totalLabel: {
    color: colors.textPrimary,
    fontFamily: fonts.display,
    fontSize: 16,
    fontWeight: '800',
  },
  totalFinalValue: {
    color: colors.textPrimary,
    fontFamily: fonts.display,
    fontSize: 18,
    fontWeight: '800',
  },
  downloadButton: {
    backgroundColor: '#D84B47',
    borderRadius: radii.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: spacing.sm,
  },
  downloadButtonText: {
    color: colors.white,
    fontFamily: fonts.body,
    fontSize: 15,
    fontWeight: '700',
  }
});

export default PurchaseHistoryScreen;