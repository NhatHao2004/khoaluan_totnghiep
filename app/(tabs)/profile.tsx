import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

export default function ProfileScreen() {
  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <ThemedText style={styles.avatarText}>👤</ThemedText>
        </View>
        <ThemedText type="title" style={styles.name}>
          Người dùng
        </ThemedText>
        <ThemedText style={styles.email}>user@example.com</ThemedText>
      </View>

      <View style={styles.menu}>
        <TouchableOpacity style={styles.menuItem}>
          <ThemedText style={styles.menuIcon}>⚙️</ThemedText>
          <ThemedText style={styles.menuText}>Cài đặt</ThemedText>
          <ThemedText style={styles.arrow}>›</ThemedText>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <ThemedText style={styles.menuIcon}>📍</ThemedText>
          <ThemedText style={styles.menuText}>Địa điểm đã lưu</ThemedText>
          <ThemedText style={styles.arrow}>›</ThemedText>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <ThemedText style={styles.menuIcon}>🔔</ThemedText>
          <ThemedText style={styles.menuText}>Thông báo</ThemedText>
          <ThemedText style={styles.arrow}>›</ThemedText>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <ThemedText style={styles.menuIcon}>ℹ️</ThemedText>
          <ThemedText style={styles.menuText}>Về ứng dụng</ThemedText>
          <ThemedText style={styles.arrow}>›</ThemedText>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <ThemedText style={styles.menuIcon}>🚪</ThemedText>
          <ThemedText style={styles.menuText}>Đăng xuất</ThemedText>
          <ThemedText style={styles.arrow}>›</ThemedText>
        </TouchableOpacity>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    padding: 40,
    paddingTop: 80,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#E8B4B8',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 48,
  },
  name: {
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    opacity: 0.6,
  },
  menu: {
    padding: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginBottom: 8,
    borderRadius: 12,
    backgroundColor: '#f5f5f5',
  },
  menuIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  menuText: {
    flex: 1,
    fontSize: 16,
  },
  arrow: {
    fontSize: 24,
    opacity: 0.3,
  },
});
