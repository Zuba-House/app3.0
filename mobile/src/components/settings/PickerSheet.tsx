import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '../../context/ThemeContext';

export type PickerOption<T extends string> = {
  value: T;
  label: string;
  disabled?: boolean;
};

type Props<T extends string> = {
  visible: boolean;
  title: string;
  options: PickerOption<T>[];
  selected: T;
  onSelect: (value: T) => void;
  onClose: () => void;
  footer?: React.ReactNode;
  hint?: string;
};

export function PickerSheet<T extends string>({
  visible,
  title,
  options,
  selected,
  onSelect,
  onClose,
  footer,
  hint,
}: Props<T>) {
  const { colors } = useAppTheme();

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={[styles.sheet, { backgroundColor: colors.card }]} onPress={(e) => e.stopPropagation()}>
          <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
          <ScrollView style={styles.list}>
            {options.map((opt) => (
              <TouchableOpacity
                key={opt.value}
                style={[
                  styles.option,
                  { borderBottomColor: colors.border },
                  opt.disabled && { opacity: 0.45 },
                ]}
                disabled={opt.disabled}
                onPress={() => {
                  if (!opt.disabled) {
                    onSelect(opt.value);
                    onClose();
                  }
                }}
              >
                <Text style={[styles.optionLabel, { color: colors.text }]}>{opt.label}</Text>
                {selected === opt.value && !opt.disabled ? (
                  <Ionicons name="checkmark-circle" size={22} color={colors.secondary} />
                ) : opt.disabled ? (
                  <Text style={{ fontSize: 11, color: colors.textMuted }}>Coming soon</Text>
                ) : (
                  <View style={[styles.radio, { borderColor: colors.border }]} />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
          {hint ? (
            <Text style={[styles.hint, { color: colors.textMuted }]}>{hint}</Text>
          ) : null}
          {footer}
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Text style={{ color: colors.text, fontWeight: '600' }}>Close</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 32,
    maxHeight: '70%',
  },
  title: { fontSize: 18, fontWeight: '700', marginBottom: 12 },
  list: { maxHeight: 360 },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  optionLabel: { fontSize: 16, flex: 1 },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
  },
  hint: { fontSize: 12, lineHeight: 18, marginTop: 8, marginBottom: 4 },
  closeBtn: { alignItems: 'center', paddingTop: 16 },
});
