import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';

import { colors, spacing, radius, font } from '@/src/theme';
import { api, Category, TxType, Transaction } from '@/src/api';
import { useToast } from '@/src/toast';

export default function EditTransaction() {
  const router = useRouter();
  const toast = useToast();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [type, setType] = useState<TxType>('income');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCat, setSelectedCat] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        const tx = await api.getTransaction(id);
        setType(tx.type);
        setAmount(tx.amount.toString());
        setNote(tx.note);
        setDate(new Date(tx.date));

        const cats = await api.listCategories(tx.type);
        setCategories(cats);
        const currentCat = cats.find(c => c.id === tx.category_id) || (cats.length > 0 ? cats[0] : null);
        setSelectedCat(currentCat);
      } catch (e) {
        console.log('fetch tx err', e);
        toast.show('Gagal memuat data transaksi', 'error');
        router.back();
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  useEffect(() => {
    if (loading) return;
    api.listCategories(type).then((data) => {
      setCategories(data);
    }).catch(err => {
      console.log('fetch categories err', err);
    });
  }, [type, loading]);

  const save = async () => {
    const val = parseFloat(amount);
    if (isNaN(val) || val <= 0) {
      toast.show('Masukkan nominal yang valid', 'error');
      return;
    }
    if (!selectedCat || !id) return;

    setSaving(true);
    try {
      // Format date to local YYYY-MM-DD
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, '0');
      const d = String(date.getDate()).padStart(2, '0');
      const dateStr = `${y}-${m}-${d}`;

      await api.updateTransaction(id, {
        type,
        amount: val,
        category_id: selectedCat.id,
        category_name: selectedCat.name,
        note,
        date: dateStr,
      });
      toast.show('Transaksi berhasil diperbarui', 'success');
      router.back();
    } catch (e: any) {
      console.log('save tx err', e);
      Alert.alert('Gagal Memperbarui', 'Terjadi kesalahan saat menghubungi server. ' + e.message);
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!id) return;
    Alert.alert(
      'Hapus Transaksi',
      'Apakah Anda yakin ingin menghapus transaksi ini?',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.deleteTransaction(id);
              toast.show('Transaksi berhasil dihapus', 'success');
              router.back();
            } catch (e: any) {
              Alert.alert('Error', 'Gagal menghapus transaksi. ' + e.message);
            }
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.brandPrimary} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.closeBtn}>
          <Feather name="x" size={24} color={colors.onSurface} />
        </Pressable>
        <Text style={styles.title}>Edit Transaksi</Text>
        <Pressable onPress={remove} style={styles.closeBtn}>
          <Feather name="trash-2" size={22} color={colors.error} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
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

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Nominal</Text>
          <View style={styles.amountInputContainer}>
            <Text style={styles.currency}>Rp</Text>
            <TextInput
              style={styles.amountInput}
              keyboardType="numeric"
              value={amount}
              onChangeText={setAmount}
              placeholder="0"
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Kategori</Text>
          <View style={styles.catGrid}>
            {categories.map((c) => (
              <Pressable
                key={c.id}
                onPress={() => setSelectedCat(c)}
                style={[
                  styles.catItem,
                  selectedCat?.id === c.id && { backgroundColor: type === 'income' ? colors.successBg : colors.errorBg, borderColor: type === 'income' ? colors.success : colors.error }
                ]}
              >
                <Feather
                  name={c.icon as any}
                  size={18}
                  color={selectedCat?.id === c.id ? (type === 'income' ? colors.success : colors.error) : colors.muted}
                />
                <Text style={[styles.catName, selectedCat?.id === c.id && { color: type === 'income' ? colors.success : colors.error }]}>
                  {c.name}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Tanggal</Text>
          <Pressable style={styles.datePickerBtn} onPress={() => setShowDatePicker(true)}>
            <Feather name="calendar" size={18} color={colors.brandPrimary} />
            <Text style={styles.dateText}>{date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</Text>
          </Pressable>
          {showDatePicker && (
            <DateTimePicker
              value={date}
              mode="date"
              display="default"
              onChange={(event, selectedDate) => {
                setShowDatePicker(false);
                if (selectedDate) setDate(selectedDate);
              }}
            />
          )}
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Catatan (Opsional)</Text>
          <TextInput
            style={styles.noteInput}
            value={note}
            onChangeText={setNote}
            placeholder="Tambah catatan..."
            multiline
          />
        </View>

        <Pressable
          style={[styles.saveBtn, (!amount || !selectedCat || saving) && { opacity: 0.5 }]}
          onPress={save}
          disabled={!amount || !selectedCat || saving}
        >
          {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>Update Transaksi</Text>}
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  closeBtn: { padding: spacing.sm },
  title: { fontSize: font.lg, fontWeight: '600' },
  scroll: { padding: spacing.lg },

  typeSelector: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceSecondary,
    borderRadius: radius.md,
    padding: 4,
    marginBottom: spacing.xl,
  },
  typeBtn: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: radius.sm },
  typeBtnActive: { backgroundColor: colors.success },
  typeBtnActiveExpense: { backgroundColor: colors.error },
  typeText: { fontSize: font.base, color: colors.muted, fontWeight: '500' },
  typeTextActive: { color: '#fff' },

  inputGroup: { marginBottom: spacing.xl },
  label: { fontSize: font.sm, color: colors.muted, marginBottom: spacing.sm, fontWeight: '500' },
  amountInputContainer: { flexDirection: 'row', alignItems: 'center' },
  currency: { fontSize: font.hero, color: colors.onSurface, fontWeight: '600', marginRight: 8 },
  amountInput: { fontSize: font.hero, color: colors.onSurface, fontWeight: '600', flex: 1 },

  catGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  catItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceSecondary,
  },
  catName: { fontSize: font.base, marginLeft: 6, color: colors.onSurface },

  datePickerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: radius.md,
    gap: spacing.sm,
  },
  dateText: { fontSize: font.lg, color: colors.onSurface },

  noteInput: {
    backgroundColor: colors.surfaceSecondary,
    borderRadius: radius.md,
    padding: spacing.md,
    fontSize: font.lg,
    minHeight: 80,
    textAlignVertical: 'top'
  },

  saveBtn: {
    backgroundColor: colors.brandPrimary,
    padding: spacing.lg,
    borderRadius: radius.lg,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  saveBtnText: { color: '#fff', fontSize: font.lg, fontWeight: '600' },
});
