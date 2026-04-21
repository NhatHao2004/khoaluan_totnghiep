import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Alert,
  StyleSheet,
  TouchableOpacity,
  View
} from 'react-native';

const LANGUAGES = [
  { id: 'vi', name: 'Tiếng Việt', flag: '🇻🇳' },
  { id: 'km', name: 'Tiếng Khmer', flag: '🇰🇭' },
];

export default function LanguageScreen() {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState('vi');

  useEffect(() => {
    loadLanguage();
  }, []);

  const loadLanguage = async () => {
    try {
      const saved = await AsyncStorage.getItem('app_language');
      if (saved) {
        setSelectedId(saved);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSelect = async (id: string) => {
    try {
      setSelectedId(id);
      await AsyncStorage.setItem('app_language', id);
      // In a real app, this would trigger a language change in a context
      Alert.alert('Thông báo', 'Đã thay đổi ngôn ngữ ứng dụng.', [
        { text: 'OK', onPress: () => router.replace('/profile') }
      ]);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <ThemedView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.replace('/profile')} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#2d2d2d" />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>Ngôn ngữ ứng dụng</ThemedText>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.content}>
        <ThemedText style={styles.sectionTitle}>Chọn ngôn ngữ hiển thị</ThemedText>

        <View style={styles.list}>
          {LANGUAGES.map((lang) => (
            <TouchableOpacity
              key={lang.id}
              style={styles.item}
              onPress={() => handleSelect(lang.id)}
              activeOpacity={0.7}
            >
              <View style={styles.itemLeft}>
                <ThemedText style={styles.flag}>{lang.flag}</ThemedText>
                <ThemedText style={[
                  styles.langName,
                  selectedId === lang.id && styles.activeText
                ]}>
                  {lang.name}
                </ThemedText>
              </View>
              {selectedId === lang.id && (
                <Ionicons name="checkmark-circle" size={24} color="#667eea" />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#ffffff',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2d2d2d',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4a5568',
    marginBottom: 16,
    marginLeft: 4,
  },
  list: {
    backgroundColor: 'white',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 2,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f7fafc',
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  flag: {
    fontSize: 24,
    marginRight: 12,
  },
  langName: {
    fontSize: 16,
    color: '#2d3748',
    fontWeight: '500',
  },
  activeText: {
    color: '#667eea',
    fontWeight: '700',
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#edf2f7',
    padding: 16,
    borderRadius: 12,
    marginTop: 24,
    alignItems: 'flex-start',
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#718096',
    marginLeft: 10,
    lineHeight: 18,
  },
});
