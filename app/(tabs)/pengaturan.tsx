import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Switch,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';

import { colors, spacing, radius, font } from '@/src/theme';
import { api, StoreProfile } from '@/src/api';

export default function PengaturanScreen() {
  const router = useRouter();
  const [profile, setProfile] = useState<StoreProfile | null>(null);

  const load = useCallback(async () => {
    try {
      const data = await api.getStoreProfile();
      setProfile(data);
    } catch (e) {
      console.log('load profile err', e);
    }
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Pengaturan</Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Profil Toko</Text>
          <Pressable style={styles.menuItem} onPress={() => {}}>
            <View style={styles.menuIcon}>
              <Feather name="home" size={20} color={colors.brandPrimary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.menuText}>{profile?.name || 'Toko Saya'}</Text>
              <Text style={styles.menuSub}>{profile?.address || 'Alamat belum diatur'}</Text>
            </View>
            <Feather name="chevron-right" size={20} color={colors.muted} />
          </Pressable>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data</Text>
          <Pressable style={styles.menuItem} onPress={() => router.push('/manage-categories')}>
            <View style={styles.menuIcon}>
              <Feather name="tag" size={20} color={colors.brandPrimary} />
            </View>
            <Text style={[styles.menuText, { flex: 1 }]}>Kelola Kategori</Text>
            <Feather name="chevron-right" size={20} color={colors.muted} />
          </Pressable>
          <Pressable
            style={styles.menuItem}
            onPress={() => Alert.alert('Export Data', 'Fitur ini akan mengekspor data ke Excel.')}
          >
            <View style={styles.menuIcon}>
              <Feather name="download" size={20} color={colors.brandPrimary} />
            </View>
            <Text style={[styles.menuText, { flex: 1 }]}>Export Laporan (Excel)</Text>
            <Feather name="chevron-right" size={20} color={colors.muted} />
          </Pressable>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Aplikasi</Text>
          <View style={styles.menuItem}>
            <View style={styles.menuIcon}>
              <Feather name="bell" size={20} color={colors.brandPrimary} />
            </View>
            <Text style={[styles.menuText, { flex: 1 }]}>Notifikasi Pengingat</Text>
            <Switch value={true} trackColor={{ true: colors.brandPrimary }} />
          </View>
          <View style={styles.menuItem}>
            <View style={styles.menuIcon}>
              <Feather name="info" size={20} color={colors.brandPrimary} />
            </View>
            <Text style={[styles.menuText, { flex: 1 }]}>Versi Aplikasi</Text>
            <Text style={styles.menuSub}>1.0.0</Text>
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
  section: { marginTop: spacing.lg },
  sectionTitle: {
    fontSize: font.sm,
    color: colors.muted,
    marginLeft: spacing.lg,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    backgroundColor: colors.surfaceSecondary,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.divider,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.brandTertiary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  menuText: { fontSize: font.lg, color: colors.onSurface },
  menuSub: { fontSize: font.sm, color: colors.muted },
});
