import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';

import { colors, spacing, radius, font } from '@/src/theme';
import { api, fmtIDR, fmtDate, Transaction, TxType } from '@/src/api';

type Filter = 'all' | 'income' | 'expense';

export default function TransaksiScreen() {
  const router = useRouter();
  const [txs, setTxs] = useState<Transaction[]>([]);
  const [filter, setFilter] = useState<Filter>('all');
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await api.listTransactions();
      setTxs(data);
    } catch (e) {
      console.log('load tx err', e);
    } finally {
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const filtered = useMemo(
    () => txs.filter((t) => filter === 'all' || t.type === filter),
    [txs, filter]
  );

  const grouped = useMemo(() => {
    const m = new Map<string, Transaction[]>();
    filtered.forEach((t) => {
      if (!m.has(t.date)) m.set(t.date, []);
      m.get(t.date)!.push(t);
    });
    return Array.from(m.entries()).sort((a, b) => (a[0] < b[0] ? 1 : -1));
  }, [filtered]);

  const chips: { key: Filter; label: string }[] = [
    { key: 'all', label: 'Semua' },
    { key: 'income', label: 'Pemasukan' },
    { key: 'expense', label: 'Pengeluaran' },
  ];

  const openAdd = (type: TxType) => {
    Haptics.selectionAsync();
    router.push({ pathname: '/add-transaction', params: { type } });
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Transaksi</Text>
        <Pressable
          style={styles.headerBtn}
          onPress={() => openAdd('income')}
        >
          <Feather name="plus" size={20} color={colors.onBrandPrimary} />
        </Pressable>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.chipRow}
        contentContainerStyle={{ paddingHorizontal: spacing.lg, gap: spacing.sm, alignItems: 'center' }}
      >
        {chips.map((c) => {
          const active = filter === c.key;
          return (
            <Pressable
              key={c.key}
              onPress={() => setFilter(c.key)}
              style={[
                styles.chip,
                { backgroundColor: active ? colors.brandPrimary : colors.surfaceSecondary, borderColor: active ? colors.brandPrimary : colors.border },
              ]}
            >
              <Text style={{ color: active ? colors.onBrandPrimary : colors.onSurface, fontSize: font.base }}>
                {c.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <ScrollView
        contentContainerStyle={{ paddingBottom: 120, paddingTop: spacing.sm }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={colors.brandPrimary} />}
        showsVerticalScrollIndicator={false}
      >
        {grouped.length === 0 && (
          <View style={styles.empty}>
            <View style={styles.emptyIcon}>
              <Feather name="inbox" size={28} color={colors.muted} />
            </View>
            <Text style={styles.emptyTitle}>Belum ada transaksi</Text>
            <Text style={styles.emptySub}>Tekan tombol + untuk menambah transaksi.</Text>
          </View>
        )}

        {grouped.map(([date, list]) => {
          const inc = list.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
          const exp = list.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
          return (
            <View key={date} style={{ marginBottom: spacing.md }}>
              <View style={styles.groupHead}>
                <Text style={styles.groupDate}>{fmtDate(date)}</Text>
                <Text style={styles.groupSum}>
                  <Text style={{ color: colors.success }}>+{fmtIDR(inc)}</Text>
                  <Text style={{ color: colors.muted }}>  ·  </Text>
                  <Text style={{ color: colors.error }}>-{fmtIDR(exp)}</Text>
                </Text>
              </View>
              <View style={styles.groupCard}>
                {list.map((tx, i) => (
                  <Pressable
                    key={tx.id}
                    onPress={() => router.push({ pathname: '/edit-transaction', params: { id: tx.id } })}
                    style={[styles.row, i !== list.length - 1 && styles.rowDivider]}
                  >
                    <View
                      style={[
                        styles.rowIcon,
                        { backgroundColor: tx.type === 'income' ? colors.successBg : colors.errorBg },
                      ]}
                    >
                      <Feather
                        name={tx.type === 'income' ? 'arrow-down-left' : 'arrow-up-right'}
                        size={16}
                        color={tx.type === 'income' ? colors.success : colors.error}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.rowTitle} numberOfLines={1}>{tx.category_name}</Text>
                      {tx.note ? <Text style={styles.rowSub} numberOfLines={1}>{tx.note}</Text> : null}
                    </View>
                    <Text style={[styles.rowAmount, { color: tx.type === 'income' ? colors.success : colors.error }]}>
                      {tx.type === 'income' ? '+' : '-'}{fmtIDR(tx.amount)}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
  },
  title: { fontSize: font.xxl, color: colors.onSurface },
  headerBtn: {
    width: 40, height: 40, borderRadius: radius.pill,
    backgroundColor: colors.brandPrimary,
    alignItems: 'center', justifyContent: 'center',
  },
  chipRow: { maxHeight: 56, marginBottom: 4 },
  chip: {
    height: 36,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.pill,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  groupHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  groupDate: { fontSize: font.base, color: colors.onSurfaceTertiary },
  groupSum: { fontSize: font.sm },
  groupCard: {
    marginHorizontal: spacing.lg,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: radius.md,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    minHeight: 60,
  },
  rowDivider: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.divider },
  rowIcon: { width: 36, height: 36, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' },
  rowTitle: { fontSize: font.lg, color: colors.onSurface },
  rowSub: { fontSize: font.sm, color: colors.muted, marginTop: 2 },
  rowAmount: { fontSize: font.lg },

  empty: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.xxl,
    alignItems: 'center',
    padding: spacing.xl,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: radius.lg,
  },
  emptyIcon: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: colors.surfaceTertiary,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: spacing.md,
  },
  emptyTitle: { fontSize: font.lg, color: colors.onSurface, marginBottom: 4 },
  emptySub: { fontSize: font.base, color: colors.muted },
});
