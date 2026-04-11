import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, StyleSheet, View } from 'react-native';

import { HapticTab } from '@/components/haptic-tab';
import { ThemedText } from '@/components/themed-text';

const COLORS = {
  primary: '#000000',
  inactive: '#9e9e9e',
  background: '#ffffff',
  shadow: '#000000',
};

export default function TabLayout() {
  return (
    <Tabs
      initialRouteName="index"
      screenOptions={{
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.inactive,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          height: 80,
          paddingBottom: 25,
          paddingTop: 15,
          backgroundColor: COLORS.background,
          borderTopLeftRadius: 0,
          borderTopRightRadius: 0,
          borderTopWidth: 1,
          borderTopColor: '#f0f0f0',
          shadowColor: COLORS.shadow,
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 10,
          elevation: 8,
          position: 'absolute',
        },
        tabBarShowLabel: false,
      }}>
      <Tabs.Screen
        name="quiz"
        options={{
          title: 'Quiz',
          tabBarIcon: ({ color }) => (
            <View style={styles.iconContainer}>
              <ThemedText style={{ fontSize: 20, color }}>🧠</ThemedText>
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explore',
          tabBarIcon: ({ color }) => (
            <View style={styles.iconContainer}>
              <ThemedText style={{ fontSize: 20, color }}>🧭</ThemedText>
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: () => (
            <View style={styles.centerButton}>
              <ThemedText style={{ fontSize: 20, color: '#000000' }}>⊞</ThemedText>
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="favorites"
        options={{
          title: 'Yêu thích',
          tabBarIcon: ({ color }) => (
            <View style={styles.iconContainer}>
              <ThemedText style={{ fontSize: 20, color }}>♡</ThemedText>
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Cá nhân',
          tabBarIcon: ({ color }) => (
            <View style={styles.iconContainer}>
              <ThemedText style={{ fontSize: 20, color }}>👤</ThemedText>
            </View>
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  centerButton: {
    width: 55,
    height: 55,
    backgroundColor: COLORS.background,
    borderRadius: 27.5,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -10,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 40,
    height: 40,
  },
});
