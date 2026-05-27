import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
  Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';
import { useAuthState } from '../../core/auth/authGuards';
import { SettingsSubScreen } from '../../components/settings/SettingsSubScreen';
import { useAppTheme } from '../../context/ThemeContext';
import { userService } from '../../services/user.service';
import { showError, showSuccess } from '../../utils/toast';

const EditProfileScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user } = useAuthState();
  const { colors } = useAppTheme();
  const u = user as Record<string, unknown> | null;

  const [name, setName] = useState(String(u?.name ?? ''));
  const [mobile, setMobile] = useState(String(u?.mobile ?? u?.phone ?? ''));
  const [bio, setBio] = useState(String(u?.bio ?? ''));
  const [avatarUri, setAvatarUri] = useState<string | null>(String(u?.avatar ?? '') || null);
  const [saving, setSaving] = useState(false);

  const pickPhoto = async () => {
    if (Platform.OS === 'ios') {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) {
        showError('Photo library permission is required');
        return;
      }
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]?.uri) {
      setAvatarUri(result.assets[0].uri);
    }
  };

  const save = async () => {
    if (!name.trim()) {
      showError('Name is required');
      return;
    }
    setSaving(true);
    try {
      let avatar = avatarUri?.startsWith('http') ? avatarUri : undefined;
      if (avatarUri && !avatarUri.startsWith('http')) {
        const uploaded = await userService.uploadAvatar(avatarUri);
        if (uploaded) avatar = uploaded;
      }
      await userService.updateProfile({
        name: name.trim(),
        mobile: mobile.trim(),
        bio: bio.trim(),
        avatar: avatar ?? undefined,
      });
      showSuccess('Profile updated');
      navigation.goBack();
    } catch (e) {
      showError(e instanceof Error ? e.message : 'Could not save profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SettingsSubScreen
      title="Edit Profile"
      footer={
        <View style={[styles.footer, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
          <TouchableOpacity
            style={[styles.saveBtn, { backgroundColor: colors.primary }]}
            onPress={() => void save()}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.saveBtnText}>Save Changes</Text>
            )}
          </TouchableOpacity>
        </View>
      }
    >
      <TouchableOpacity style={styles.avatarBlock} onPress={() => void pickPhoto()}>
        {avatarUri ? (
          <Image source={{ uri: avatarUri }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, styles.avatarPlaceholder, { backgroundColor: colors.secondary }]}>
            <Text style={{ fontSize: 32, fontWeight: '700', color: colors.primary }}>
              {name.charAt(0).toUpperCase() || 'U'}
            </Text>
          </View>
        )}
        <Text style={[styles.changePhoto, { color: colors.primary }]}>Change Photo</Text>
      </TouchableOpacity>

      <Field label="Full Name" colors={colors}>
        <TextInput
          style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.card }]}
          value={name}
          onChangeText={setName}
          placeholder="Your name"
          placeholderTextColor={colors.textMuted}
        />
      </Field>
      <Field label="Phone Number" colors={colors}>
        <TextInput
          style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.card }]}
          value={mobile}
          onChangeText={setMobile}
          keyboardType="phone-pad"
          placeholder="Phone"
          placeholderTextColor={colors.textMuted}
        />
      </Field>
      <Field label="Email" colors={colors}>
        <TextInput
          style={[
            styles.input,
            styles.inputDisabled,
            { color: colors.textMuted, borderColor: colors.border, backgroundColor: colors.tertiary },
          ]}
          value={String(u?.email ?? '')}
          editable={false}
        />
      </Field>
      <Field label="Bio (optional)" colors={colors}>
        <TextInput
          style={[
            styles.input,
            styles.multiline,
            { color: colors.text, borderColor: colors.border, backgroundColor: colors.card },
          ]}
          value={bio}
          onChangeText={setBio}
          multiline
          numberOfLines={3}
          placeholder="Tell us about yourself"
          placeholderTextColor={colors.textMuted}
        />
      </Field>
    </SettingsSubScreen>
  );
};

function Field({
  label,
  children,
  colors,
}: {
  label: string;
  children: React.ReactNode;
  colors: { textMuted: string };
}) {
  return (
    <View style={{ marginBottom: 16 }}>
      <Text style={{ fontSize: 13, fontWeight: '600', color: colors.textMuted, marginBottom: 6 }}>{label}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  avatarBlock: { alignItems: 'center', marginBottom: 24 },
  avatar: { width: 96, height: 96, borderRadius: 48 },
  avatarPlaceholder: { justifyContent: 'center', alignItems: 'center' },
  changePhoto: { marginTop: 8, fontSize: 14, fontWeight: '600' },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
  },
  inputDisabled: { opacity: 0.85 },
  multiline: { minHeight: 88, textAlignVertical: 'top' },
  footer: {
    padding: 16,
    paddingBottom: 28,
    borderTopWidth: 1,
  },
  saveBtn: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});

export default EditProfileScreen;
