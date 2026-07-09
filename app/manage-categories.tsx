import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';

import { colors, spacing, radius, font } from '@/src/theme';
import { api, Category, TxType } from '@/src/api';

export default function ManageCategories() {
  const router = useRouter();
  const [type, setType] = useState<TxType>('income');
  const [categories, setCategories] = useState<Category[]>([]);
  const [newName, setNewName] = useState('');
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await api.listCategories(type);
      setCategories(data);
    } catch (e) {
      console.log('load cats err', e);
    }
  }, [type]);

  useEffect(() => { load(); }, [load]);

  const add = async () => {
    if (!newName.trim()) return;
    setLoading(true);
    try {
      await api.createCategory({ name: newName, type, icon: 'tag' });
      setNewName('');
      load();
    } catch (e) {
      Alert.alert('Error', 'Gagal menambah kategori');
    } finally {
      setLoading(false);
    }
  };

  const remove = (id: string, isDefault: boolean) => {
    if (isDefault) {
      Alert.alert('Info', 'Kategori bawaan tidak dapat dihapus');
      return;
    }
    Alert.alert('Hapus Kategori', 'Yakin ingin menghapus kategori ini?', [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Hapus',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.deleteCategory(id);
            load();
          } catch (e) {
            Alert.alert('Error', 'Gagal menghapus kategori');
          }
        }
      }
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.closeBtn}>
          <Feather name="arrow-left" size={24} color={colors.onSurface} />
        </Pressable>
        <Text style={styles.title}>Kelola Kategori</Text>
        <View style={{ width: 44 }} />
      </View>

      <View style={styles.typeSelector}>
        <Pressable
          style={[styles.typeBtn, type === 'income' && styles.typeBtnActive]}
          onPress={() => setType('income')}
        >
          <Text style={[styles.typeText, type === 'income' && styles.typeTextActive]}>Pemasukan</Text>
        </Pressable>
        <Pressable
          style={[styles.typeBtn, type === 'expense' && styles.typeBtnActiveExpense]}
          onPress={() => setType('expense')}
        >
          <Text style={[styles.typeText, type === 'expense' && styles.typeTextActive]}>Pengeluaran</Text>
        </Pressable>
      </View>

      <View style={styles.addSection}>
        <TextInput
          style={styles.input}
          placeholder="Nama kategori baru..."
          value={newName}
          onChangeText={setNewName}
        />
        <Pressable
          style={[styles.addBtn, !newName.trim() && { opacity: 0.5 }]}
          onPress={add}
          disabled={!newName.trim() || loading}
        >
          {loading ? <ActivityIndicator color="#fff" /> : <Feather name="plus" size={20} color="#fff" />}
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.list}>
        {categories.map((c) => (
          <View key={c.id} style={styles.row}>
            <View style={styles.rowIcon}>
              <Feather name={c.icon as any} size={18} color={colors.brandPrimary} />
            </View>
            <Text style={styles.rowText}>{c.name}</Text>
            {c.is_default ? (
              <View style={styles.badge}><Text style={styles.badgeText}>Default</Text></View>
            ) : (
              <Pressable onPress={() => remove(c.id, c.is_default)}>
                <Feather name="trash-2" size={18} color={colors.error} />
              </Pressable>
            )}
          </View>
        ))}
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
    backgroundColor: colors.surfaceSecondary,
  },
  closeBtn: { padding: spacing.sm },
  title: { fontSize: font.lg, fontWeight: '600' },

  typeSelector: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceTertiary,
    margin: spacing.lg,
    borderRadius: radius.md,
    padding: 4,
  },
  typeBtn: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: radius.sm },
  typeBtnActive: { backgroundColor: colors.success },
  typeBtnActiveExpense: { backgroundColor: colors.error },
  typeText: { fontSize: font.base, color: colors.muted, fontWeight: '500' },
  typeTextActive: { color: '#fff' },

  addSection: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
    marginBottom: spacing.lg
  },
  input: {
    flex: 1,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    height: 48,
    borderWidth: 1,
    borderColor: colors.border,
  },
  addBtn: {
    width: 48,
    height: 48,
    backgroundColor: colors.brandPrimary,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center'
  },

  list: { paddingHorizontal: spacing.lg, paddingBottom: 40 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: radius.md,
    marginBottom: spacing.sm,
    gap: spacing.md,
  },
  rowIcon: { width: 36, height: 36, borderRadius: radius.pill, backgroundColor: colors.brandTertiary, alignItems: 'center', justifyContent: 'center' },
  rowText: { flex: 1, fontSize: font.lg, color: colors.onSurface },
  badge: { backgroundColor: colors.surfaceTertiary, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  badgeText: { fontSize: 10, color: colors.muted },
});
