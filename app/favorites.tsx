import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useFavoriteTemples } from '@/hooks/use-temples';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

export default function FavoritesScreen() {
  const tintColor = useThemeColor({}, 'tint');
  const { favorites, loading, error, refresh } = useFavoriteTemples();

  // Auto refresh when tab is focused
  useFocusEffect(
    useCallback(() => {
      if (refresh) {
        refresh();
      }
    }, [])
  );

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText type="title">Yêu thích</ThemedText>
        <ThemedText style={styles.subtitle}>
        </ThemedText>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={tintColor} style={styles.loader} />
      ) : error ? (
        <ThemedText style={styles.errorText}>
          Không thể tải dữ liệu
        </ThemedText>
      ) : favorites.length === 0 ? (
        <View style={styles.emptyContainer}>
          <ThemedText style={styles.emptyEmoji}>💔</ThemedText>
          <ThemedText style={styles.emptyText}>
            Chưa có địa điểm yêu thích
          </ThemedText>
          <ThemedText style={styles.emptySubtext}>
            Nhấn vào icon 🤍 để thêm địa điểm yêu thích
          </ThemedText>
        </View>
      ) : (
        <ScrollView style={styles.content}>
          {favorites.map((item) => (
            <TouchableOpacity key={item.id} style={styles.card}>
              <View style={styles.cardImage}>
                <ThemedText style={styles.emoji}>🛕</ThemedText>
              </View>
              <View style={styles.cardInfo}>
                <ThemedText type="defaultSemiBold">{item.name}</ThemedText>
                <ThemedText style={styles.location}>
                  {item.rental || item.location}
                </ThemedText>
                <ThemedText style={styles.category}>{item.category}</ThemedText>
              </View>
              <ThemedText style={styles.heart}>❤️</ThemedText>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 60,
  },
  subtitle: {
    fontSize: 14,
    opacity: 0.6,
    marginTop: 4,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  card: {
    flexDirection: 'row',
    padding: 12,
    marginBottom: 12,
    borderRadius: 12,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
  },
  cardImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#4A7C59',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  emoji: {
    fontSize: 32,
  },
  cardInfo: {
    flex: 1,
  },
  location: {
    fontSize: 12,
    opacity: 0.6,
    marginTop: 2,
  },
  category: {
    fontSize: 11,
    opacity: 0.5,
    marginTop: 2,
  },
  heart: {
    fontSize: 24,
  },
  loader: {
    marginTop: 40,
  },
  errorText: {
    color: '#ff6b6b',
    textAlign: 'center',
    padding: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    opacity: 0.6,
    textAlign: 'center',
  },
});
