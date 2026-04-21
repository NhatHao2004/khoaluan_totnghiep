import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Tabs } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet } from 'react-native';
import 'react-native-reanimated';

import { HapticTab } from '@/components/haptic-tab';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { AuthProvider } from '@/contexts/AuthContext';

// Prevent native splash screen from auto-hiding

const COLORS = {
  primary: '#2282ff',
  inactive: '#9e9e9e',
  background: '#ffffff',
  shadow: '#0000ff',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <AuthProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Tabs
        initialRouteName="index"
        screenOptions={{
          tabBarActiveTintColor: COLORS.primary,
          tabBarInactiveTintColor: COLORS.inactive,
          headerShown: false,
          tabBarButton: HapticTab,
          tabBarStyle: {
            height:70,
            paddingBottom: 20,
            paddingTop: 15,
            backgroundColor: COLORS.background,
            borderTopLeftRadius: 25,
            borderTopRightRadius: 25,
            borderTopWidth: 0,
            shadowColor: COLORS.shadow,
            shadowOffset: { width: 0, height: -5 },
            shadowOpacity: 0.05,
            shadowRadius: 20,
            elevation: 10,
            position: 'absolute',
          },
          tabBarShowLabel: false,
        }}>
        <Tabs.Screen
          name="quiz"
          options={{
            title: 'Quiz',
            tabBarIcon: ({ color, focused, size }) => (
              <Ionicons 
                name={focused ? 'help-circle' : 'help-circle-outline'} 
                size={size || 24} 
                color={color} 
              />
            ),
          }}
        />
        <Tabs.Screen
          name="explore"
          options={{
            title: 'Explore',
            tabBarIcon: ({ color, focused, size }) => (
              <Ionicons 
                name={focused ? 'compass' : 'compass-outline'} 
                size={size || 24} 
                color={color} 
              />
            ),
          }}
        />
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ focused, size }) => (
              <Ionicons 
                name={focused ? 'grid' : 'grid-outline'} 
                size={22} 
                color={COLORS.primary} 
              />
            ),
          }}
        />
        <Tabs.Screen
          name="favorites"
          options={{
            title: 'Yêu thích',
            tabBarIcon: ({ color, focused, size }) => (
              <Ionicons 
                name={focused ? 'heart' : 'heart-outline'} 
                size={size || 24} 
                color={color} 
              />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Cá nhân',
            tabBarIcon: ({ color, focused, size }) => (
              <Ionicons 
                name={focused ? 'person' : 'person-outline'} 
                size={23} 
                color={color} 
              />
            ),
          }}
        />
        <Tabs.Screen
          name="pagoda"
          options={{
            href: null, // Hide from tab bar
          }}
        />
        <Tabs.Screen
          name="pagoda-detail"
          options={{
            href: null, // Hide from tab bar
          }}
        />
        <Tabs.Screen
          name="directions"
          options={{
            href: null, // Hide from tab bar
          }}
        />
        <Tabs.Screen
          name="login"
          options={{
            href: null, // Hide from tab bar
          }}
        />
        <Tabs.Screen
          name="register"
          options={{
            href: null, // Hide from tab bar
          }}
        />
        <Tabs.Screen
          name="edit-profile"
          options={{
            href: null, // Hide from tab bar
          }}
        />
        <Tabs.Screen
          name="change-password"
          options={{
            href: null, // Hide from tab bar
          }}
        />
        <Tabs.Screen
          name="language"
          options={{
            href: null, // Hide from tab bar
          }}
        />
      </Tabs>
      <StatusBar style="auto" />
    </ThemeProvider>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({});
