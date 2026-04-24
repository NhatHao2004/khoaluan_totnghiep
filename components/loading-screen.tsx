import { useEffect, useRef } from 'react';
import { Animated, Dimensions, Image, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

const { width } = Dimensions.get('window');

export function LoadingScreen() {
  // Sử dụng Animated chuẩn của React Native
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Chỉ giữ lại Animation cho thanh tiến trình (Chạy từ 0 đến 1 trong 3 giây)
    Animated.timing(progress, {
      toValue: 1,
      duration: 3000,
      useNativeDriver: false,
    }).start();
  }, []);

  const barWidth = width * 0.85;

  return (
    <ThemedView style={styles.container}>
      <View style={styles.centerContent}>
        <View style={styles.logoContainer}>
          <Image 
            source={require('@/assets/images/logo.jpg')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        <ThemedText style={styles.title}>
          KhmerGo
        </ThemedText>
        <ThemedText style={styles.subtitle}>
          Chuẩn bị hành trình khám phá
        </ThemedText>
      </View>

      <View style={styles.bottomContent}>
        <View style={styles.progressBarContainer}>
          <Animated.View 
            style={[
              styles.progressBar, 
              { 
                width: progress.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, barWidth]
                }) 
              }
            ]} 
          />
        </View>
        <ThemedText style={styles.loadingText}>
          Đang tải...
        </ThemedText>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    justifyContent: 'space-between',
    paddingVertical: 80,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    marginBottom: 20,
  },
  logo: {
    width: 250,
    height: 180,
  },
  title: {
    fontSize: 42,
    fontWeight: '800',
    color: '#000',
    marginBottom: 8,
    includeFontPadding: false,
    lineHeight: 52,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
    fontWeight: '500',
    includeFontPadding: false,
  },
  bottomContent: {
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  progressBarContainer: {
    width: '85%',
    height: 6,
    backgroundColor: '#f0f0f0',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 15,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#FFCC00',
  },
  loadingText: {
    fontSize: 14,
    color: '#999',
    fontWeight: '500',
  },
});
