import React, { createContext, useCallback, useContext, useRef, useState } from 'react';
import { StyleSheet, Text, Animated, View } from 'react-native';
import { colors, radius, spacing } from './theme';

type ToastCtx = { show: (msg: string, kind?: 'success' | 'error' | 'info') => void };
const Ctx = createContext<ToastCtx>({ show: () => {} });

export const useToast = () => useContext(Ctx);

export function ToastHost({ children }: { children: React.ReactNode }) {
  const [msg, setMsg] = useState('');
  const [kind, setKind] = useState<'success' | 'error' | 'info'>('info');
  const opacity = useRef(new Animated.Value(0)).current;
  const timer = useRef<any>(null);

  const show = useCallback((m: string, k: 'success' | 'error' | 'info' = 'info') => {
    setMsg(m);
    setKind(k);
    if (timer.current) clearTimeout(timer.current);
    Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }).start();
    timer.current = setTimeout(() => {
      Animated.timing(opacity, { toValue: 0, duration: 250, useNativeDriver: true }).start();
    }, 2400);
  }, [opacity]);

  const bg = kind === 'success' ? colors.success : kind === 'error' ? colors.error : colors.surfaceInverse;

  return (
    <Ctx.Provider value={{ show }}>
      {children}
      <Animated.View pointerEvents="none" style={[styles.wrap, { opacity }]}>
        <View style={[styles.toast, { backgroundColor: bg }]}>
          <Text style={styles.text}>{msg}</Text>
        </View>
      </Animated.View>
    </Ctx.Provider>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 90,
    alignItems: 'center',
    zIndex: 1000,
  },
  toast: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radius.pill,
    maxWidth: '85%',
  },
  text: { color: '#fff', fontSize: 14 },
});
