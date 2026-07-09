import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';

import { colors, spacing, radius, font } from '@/src/theme';
import { api, fmtIDR, monthStartISO, monthEndISO } from '@/src/api';

const { width } = Dimensions.get('window');

export default function LaporanScreen() {
  const [summary, setSummary] = useState({ income: 0, expense: 0, balance: 0, count: 0 });
  const [monthly, setMonthly] = useState<Array<{ month: string, income: number, expense: number }>>([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const [sum, hist] = await Promise.all([
        api.summary({ start: monthStartISO(), end: monthEndISO() }),
        api.monthlySummary(),
      ]);
      setSummary(sum);
      setMonthly(hist);
    } catch (e) {
      console.log('load report err', e);
    } finally {
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const maxVal = Math.max(...monthly.map(m => Math.max(m.income, m.expense)), 1000);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Laporan</Text>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: 40 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={colors.brandPrimary} />}
      >
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Ringkasan Bulan Ini</Text>
          <View style={styles.statRow}>
            <View style={styles.stat}>
              <Text style={styles.statLabel}>Total Pemasukan</Text>
              <Text style={[styles.statValue, { color: colors.success }]}>{fmtIDR(summary.income)}</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statLabel}>Total Pengeluaran</Text>
              <Text style={[styles.statValue, { color: colors.error }]}>{fmtIDR(summary.expense)}</Text>
            </View>
          </View>
          <View style={[styles.stat, { marginTop: spacing.lg, borderTopWidth: 1, borderTopColor: colors.divider, paddingTop: spacing.md }]}>
            <Text style={styles.statLabel}>Laba / Rugi</Text>
            <Text style={[styles.statValue, { fontSize: font.xxl }]}>{fmtIDR(summary.balance)}</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Tren 6 Bulan Terakhir</Text>
          <View style={styles.chartContainer}>
            {monthly.map((m, i) => (
              <View key={m.month} style={styles.chartCol}>
                <View style={styles.barGroup}>
                  <View style={[styles.bar, { height: (m.income / maxVal) * 120, backgroundColor: colors.success }]} />
                  <View style={[styles.bar, { height: (m.expense / maxVal) * 120, backgroundColor: colors.error }]} />
                </View>
                <Text style={styles.barLabel}>{m.month.split('-')[1]}/{m.month.split('-')[0].slice(2)}</Text>
              </View>
            ))}
          </View>
          <View style={styles.legend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: colors.success }]} />
              <Text style={styles.legendText}>Pemasukan</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: colors.error }]} />
              <Text style={styles.legendText}>Pengeluaran</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface },
  header: { padding: spacing.lg },
  title: { fontSize: font.xxl, color: colors.onSurface },
  card: {
    marginHorizontal: spacing.lg,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: radius.lg,
    padding: spacing.xl,
    marginBottom: spacing.lg,
  },
  cardTitle: { fontSize: font.lg, color: colors.onSurface, marginBottom: spacing.lg, fontWeight: '600' },
  statRow: { flexDirection: 'row', justifyContent: 'space-between' },
  stat: { flex: 1 },
  statLabel: { fontSize: font.sm, color: colors.muted, marginBottom: 4 },
  statValue: { fontSize: font.lg, color: colors.onSurface, fontWeight: '700' },

  chartContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 160,
    paddingTop: 20,
  },
  chartCol: { alignItems: 'center', flex: 1 },
  barGroup: { flexDirection: 'row', alignItems: 'flex-end', gap: 2, height: 120 },
  bar: { width: 8, borderRadius: 4 },
  barLabel: { fontSize: 10, color: colors.muted, marginTop: 8 },

  legend: { flexDirection: 'row', gap: spacing.lg, marginTop: spacing.xl, justifyContent: 'center' },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: font.sm, color: colors.muted },
});
