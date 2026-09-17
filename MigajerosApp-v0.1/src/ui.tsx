import type { PropsWithChildren } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export const palette = {
  purple: '#513192',
  purpleDark: '#372163',
  background: '#F7F5FB',
  surface: '#FFFFFF',
  text: '#241B33',
  muted: '#675D73',
  border: '#D9D1E2',
  coral: '#EB8D73',
  danger: '#A22B44',
};

type ActionProps = {
  label: string;
  onPress: () => void;
  secondary?: boolean;
  disabled?: boolean;
  compact?: boolean;
};

export function Action({ label, onPress, secondary = false, disabled = false, compact = false }: ActionProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        compact && styles.compact,
        secondary && styles.buttonSecondary,
        disabled && styles.disabled,
        pressed && !disabled && styles.pressed,
      ]}
    >
      <Text style={[styles.buttonText, secondary && styles.buttonSecondaryText]}>{label}</Text>
    </Pressable>
  );
}

type PillProps = { label: string; selected?: boolean; onPress: () => void };

export function Pill({ label, selected = false, onPress }: PillProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => [styles.pill, selected && styles.pillSelected, pressed && styles.pressed]}
    >
      <Text style={[styles.pillText, selected && styles.pillSelectedText]}>{label}</Text>
    </Pressable>
  );
}

export function Surface({ children }: PropsWithChildren) {
  return <View style={styles.surface}>{children}</View>;
}

export const styles = StyleSheet.create({
  button: {
    minHeight: 48,
    backgroundColor: palette.purple,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    marginVertical: 6,
    borderWidth: 1,
    borderColor: palette.purple,
  },
  compact: { minHeight: 44, alignSelf: 'flex-start' },
  buttonSecondary: { backgroundColor: palette.surface },
  buttonText: { color: '#FFFFFF', fontWeight: '700', fontSize: 15 },
  buttonSecondaryText: { color: palette.purple },
  disabled: { opacity: 0.45 },
  pressed: { opacity: 0.75 },
  pill: {
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: 18,
    minHeight: 40,
    paddingHorizontal: 14,
    justifyContent: 'center',
    marginRight: 7,
    marginBottom: 7,
    backgroundColor: palette.surface,
  },
  pillSelected: { backgroundColor: palette.purple, borderColor: palette.purple },
  pillText: { color: palette.text, fontSize: 13 },
  pillSelectedText: { color: '#FFFFFF', fontWeight: '700' },
  surface: {
    padding: 17,
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: 18,
    marginBottom: 12,
  },
});
