import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { colors, spacing, radius, font } from '@/src/theme';

export default function ReceiptPreview() {
  const router = useRouter();
  const { id } = useLocalSearchParams();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.closeBtn}>
          <Feather name="arrow-left" size={24} color={colors.onSurface} />
        </Pressable>
        <Text style={styles.title}>Preview Struk</Text>
        <Pressable onPress={() => {}} style={styles.closeBtn}>
          <Feather name="share-2" size={22} color={colors.brandPrimary} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.receiptCard}>
          <Text style={styles.brandName}>KAS UMKM</Text>
          <Text style={styles.receiptTitle}>STRUK TRANSAKSI</Text>
          <View style={styles.divider} />
          <Text style={styles.info}>ID Transaksi: {id}</Text>
          <Text style={styles.info}>Tanggal: {new Date().toLocaleDateString('id-ID')}</Text>
          <View style={styles.divider} />
          <View style={styles.row}>
            <Text style={styles.label}>Total</Text>
            <Text style={styles.value}>Rp 0</Text>
          </View>
          <View style={styles.divider} />
          <Text style={styles.footerText}>Terima kasih telah berkunjung!</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    backgroundColor: colors.surfaceSecondary
  },
  closeBtn: { padding: spacing.sm },
  title: { fontSize: font.lg, fontWeight: '600' },
  content: { padding: spacing.xl, alignItems: 'center' },
  receiptCard: {
    backgroundColor: '#fff',
    width: '100%',
    padding: spacing.xl,
    borderRadius: radius.sm,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  brandName: { fontSize: font.xxl, fontWeight: 'bold', textAlign: 'center', color: colors.brandPrimary },
  receiptTitle: { fontSize: font.sm, textAlign: 'center', color: colors.muted, marginBottom: spacing.lg },
  divider: { height: 1, backgroundColor: colors.divider, marginVertical: spacing.md, borderStyle: 'dashed' },
  info: { fontSize: font.sm, color: colors.onSurface, marginBottom: 4 },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  label: { fontSize: font.lg, color: colors.onSurface },
  value: { fontSize: font.lg, fontWeight: 'bold', color: colors.onSurface },
  footerText: { fontSize: font.sm, color: colors.muted, textAlign: 'center', marginTop: spacing.xl }
});
