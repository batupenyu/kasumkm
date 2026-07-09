import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';

import { colors, spacing, radius, font } from '@/src/theme';
import { api, fmtIDR, fmtDate, monthStartISO, monthEndISO, Transaction } from '@/src/api';

export default function Beranda() {
  const router = useRouter();
  const [summary, setSummary] = useState({ income: 0, expense: 0, balance: 0, count: 0 });
  const [recent, setRecent] = useState<Transaction[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const [sum, txs] = await Promise.all([
        api.summary({ start: monthStartISO(), end: monthEndISO() }),
        api.listTransactions(),
      ]);
      setSummary(sum);
      setRecent(txs.slice(0, 8));
    } catch (e) {
      console.log('Load beranda error', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const openAdd = (type: 'income' | 'expense') => {
    Haptics.selectionAsync();
    router.push({ pathname: '/add-transaction', params: { type } });
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: spacing.xxxl }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={colors.brandPrimary} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greetingSm}>Halo,</Text>
            <Text style={styles.greetingLg}>KasUMKM</Text>
          </View>
          <Pressable
            onPress={() => router.push('/(tabs)/pengaturan')}
            style={styles.avatar}
          >
            <Feather name="user" size={22} color={colors.brandPrimary} />
          </Pressable>
        </View>

        {/* Hero card */}
        <LinearGradient
          colors={[colors.brandPrimary, colors.brandPrimaryDark]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.hero}
        >
          <Text style={styles.heroLabel}>Saldo Bersih Bulan Ini</Text>
          <Text style={styles.heroValue}>
            {loading ? '—' : fmtIDR(summary.balance)}
          </Text>
          <View style={styles.heroRow}>
            <View style={styles.heroCol}>
              <View style={styles.heroDot}>
                <Feather name="arrow-down-left" size={14} color={colors.brandPrimary} />
              </View>
              <View>
                <Text style={styles.heroSubLabel}>Pemasukan</Text>
                <Text style={styles.heroSubValue}>
                  {fmtIDR(summary.income)}
                </Text>
              </View>
            </View>
            <View style={styles.heroCol}>
              <View style={styles.heroDot}>
                <Feather name="arrow-up-right" size={14} color={colors.error} />
              </View>
              <View>
                <Text style={styles.heroSubLabel}>Pengeluaran</Text>
                <Text style={styles.heroSubValue}>
                  {fmtIDR(summary.expense)}
                </Text>
              </View>
            </View>
          </View>
        </LinearGradient>

        {/* Quick actions */}
        <View style={styles.actions}>
          <Pressable
            style={[styles.actionBtn, { backgroundColor: colors.successBg }]}
            onPress={() => openAdd('income')}
          >
            <View style={[styles.actionIcon, { backgroundColor: colors.success }]}>
              <Feather name="plus" size={18} color="#fff" />
            </View>
            <Text style={[styles.actionText, { color: colors.success }]}>Pemasukan</Text>
          </Pressable>
          <Pressable
            style={[styles.actionBtn, { backgroundColor: colors.errorBg }]}
            onPress={() => openAdd('expense')}
          >
            <View style={[styles.actionIcon, { backgroundColor: colors.error }]}>
              <Feather name="minus" size={18} color="#fff" />
            </View>
            <Text style={[styles.actionText, { color: colors.error }]}>Pengeluaran</Text>
          </Pressable>
        </View>

        {/* Recent transactions */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Transaksi Terakhir</Text>
          <Pressable onPress={() => router.push('/(tabs)/transaksi')}>
            <Text style={styles.link}>Lihat semua</Text>
          </Pressable>
        </View>

        <View style={styles.list}>
          {recent.length === 0 && !loading && (
            <View style={styles.empty}>
              <View style={styles.emptyIcon}>
                <Feather name="inbox" size={28} color={colors.muted} />
              </View>
              <Text style={styles.emptyTitle}>Belum ada transaksi</Text>
              <Text style={styles.emptySub}>Catat pemasukan atau pengeluaran pertama Anda.</Text>
              <Pressable
                onPress={() => openAdd('income')}
                style={styles.emptyCta}
              >
                <Text style={styles.emptyCtaText}>Catat Transaksi Pertama</Text>
              </Pressable>
            </View>
          )}

          {recent.map((tx) => (
            <Pressable
              key={tx.id}
              style={styles.row}
              onPress={() => router.push({ pathname: '/edit-transaction', params: { id: tx.id } })}
            >
              <View
                style={[
                  styles.rowIcon,
                  { backgroundColor: tx.type === 'income' ? colors.successBg : colors.errorBg },
                ]}
              >
                <Feather
                  name={tx.type === 'income' ? 'arrow-down-left' : 'arrow-up-right'}
                  size={18}
                  color={tx.type === 'income' ? colors.success : colors.error}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.rowTitle} numberOfLines={1}>{tx.category_name}</Text>
                <Text style={styles.rowSub} numberOfLines={1}>
                  {fmtDate(tx.date)}{tx.note ? ` · ${tx.note}` : ''}
                </Text>
              </View>
              <Text
                style={[styles.rowAmount, { color: tx.type === 'income' ? colors.success : colors.error }]}
              >
                {tx.type === 'income' ? '+' : '-'}{fmtIDR(tx.amount)}
              </Text>
            </Pressable>
          ))}
        </View>
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
  greetingSm: { fontSize: font.base, color: colors.muted },
  greetingLg: { fontSize: font.xxl, color: colors.onSurface, marginTop: 2 },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: radius.pill,
    backgroundColor: colors.brandTertiary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hero: {
    marginHorizontal: spacing.lg,
    borderRadius: radius.lg,
    padding: spacing.xl,
  },
  heroLabel: { color: colors.brandSecondary, fontSize: font.base, marginBottom: spacing.sm },
  heroValue: { color: colors.onBrandPrimary, fontSize: font.hero, marginBottom: spacing.lg },
  heroRow: { flexDirection: 'row', gap: spacing.lg },
  heroCol: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  heroDot: {
    width: 26, height: 26, borderRadius: 13,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center', justifyContent: 'center',
  },
  heroSubLabel: { color: colors.brandSecondary, fontSize: font.sm },
  heroSubValue: { color: colors.onBrandPrimary, fontSize: font.lg, marginTop: 2 },

  actions: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    marginTop: spacing.lg,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.lg,
  },
  actionIcon: {
    width: 36, height: 36, borderRadius: radius.pill,
    alignItems: 'center', justifyContent: 'center',
  },
  actionText: { fontSize: font.lg },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    marginTop: spacing.xl,
    marginBottom: spacing.sm,
  },
  sectionTitle: { fontSize: font.lg, color: colors.onSurface },
  link: { fontSize: font.base, color: colors.brandPrimary },

  list: { paddingHorizontal: spacing.lg },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surfaceSecondary,
    padding: spacing.md,
    borderRadius: radius.md,
    marginBottom: spacing.sm,
    minHeight: 60,
  },
  rowIcon: { width: 40, height: 40, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' },
  rowTitle: { fontSize: font.lg, color: colors.onSurface },
  rowSub: { fontSize: font.sm, color: colors.muted, marginTop: 2 },
  rowAmount: { fontSize: font.lg },

  empty: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.lg,
  },
  emptyIcon: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: colors.surfaceTertiary,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: spacing.md,
  },
  emptyTitle: { fontSize: font.lg, color: colors.onSurface, marginBottom: 4 },
  emptySub: { fontSize: font.base, color: colors.muted, textAlign: 'center', marginBottom: spacing.lg },
  emptyCta: {
    backgroundColor: colors.brandPrimary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: radius.pill,
  },
  emptyCtaText: { color: colors.onBrandPrimary, fontSize: font.base },
});
