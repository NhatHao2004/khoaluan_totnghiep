import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

export default function LoginScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      Alert.alert('Lỗi', 'Vui lòng nhập email và mật khẩu.');
      return;
    }

    try {
      setLoading(true);
      await login(email, password);
      // Success: Precise redirection based on where we came from
      if (params.from === 'pagoda-detail' && params.templeId) {
        router.replace({
          pathname: '/pagoda-detail',
          params: { id: params.templeId }
        });
      } else if (params.from === 'profile') {
        router.replace('/profile');
      } else if (params.from) {
        router.back();
      } else {
        router.replace('/profile');
      }
    } catch (error: any) {
      console.warn('Login error:', error);
      let errorMessage = 'Email hoặc mật khẩu không chính xác.';
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        errorMessage = 'Email hoặc mật khẩu không chính xác.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Địa chỉ email không hợp lệ.';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Tài khoản đã bị khóa tạm thời do nhập sai nhiều lần. Vui lòng thử lại sau.';
      }
      Alert.alert('Lỗi', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Header Section */}
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.backBtn} 
              onPress={() => {
                if (params.from === 'pagoda-detail' && params.templeId) {
                  router.replace({
                    pathname: '/pagoda-detail',
                    params: { id: params.templeId }
                  });
                } else if (params.from === 'profile') {
                  router.replace('/profile');
                } else {
                  router.back();
                }
              }}
            >
              <Ionicons name="arrow-back" size={24} color="#000" />
            </TouchableOpacity>
            <ThemedText style={styles.title}>Chào mừng trở lại</ThemedText>
            <ThemedText style={styles.subtitle}>Đăng nhập để tiếp tục hành trình khám phá</ThemedText>
          </View>

          {/* Form Section */}
          <View style={styles.form}>
            {/* Email */}
            <View style={styles.inputContainer}>
              <ThemedText style={styles.label}>Email</ThemedText>
              <View style={styles.inputBox}>
                <Ionicons name="mail-outline" size={20} color="#666" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="example@gmail.com"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
            </View>

            {/* Password */}
            <View style={styles.inputContainer}>
              <View style={styles.labelRow}>
                <ThemedText style={styles.label}>Mật khẩu</ThemedText>
                <TouchableOpacity onPress={() => Alert.alert('Thông báo', 'Chức năng quên mật khẩu đang phát triển.')}>
                  <ThemedText style={styles.forgotText}>Quên mật khẩu?</ThemedText>
                </TouchableOpacity>
              </View>
              <View style={styles.inputBox}>
                <Ionicons name="lock-closed-outline" size={20} color="#666" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Nhập mật khẩu của bạn"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Ionicons
                    name={showPassword ? "eye-outline" : "eye-off-outline"}
                    size={20}
                    color="#666"
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Login Button */}
            <TouchableOpacity
              style={[styles.loginBtn, loading && styles.disabledBtn]}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <ThemedText style={styles.loginBtnText} numberOfLines={1}>Đăng nhập</ThemedText>
              )}
            </TouchableOpacity>

            {/* Register Link */}
            <View style={styles.footer}>
              <ThemedText style={styles.footerText}>Chưa có tài khoản? </ThemedText>
              <TouchableOpacity onPress={() => router.push({
                pathname: '/register',
                params: { ...params }
              })}>
                <ThemedText style={styles.registerLink}>Đăng ký ngay</ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 24,
    marginBottom: 40,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#2d3436',
    marginBottom: 10,
    lineHeight: 34,
    includeFontPadding: true,
  },
  subtitle: {
    fontSize: 16,
    color: '#636e72',
    lineHeight: 24,
    includeFontPadding: true,
  },
  form: {
    paddingHorizontal: 24,
  },
  inputContainer: {
    marginBottom: 24,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2d3436',
    marginLeft: 4,
  },
  forgotText: {
    fontSize: 13,
    color: '#ff6b57',
    fontWeight: '600',
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 56,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#2d3436',
  },
  loginBtn: {
    backgroundColor: '#ff6b57',
    borderRadius: 12,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#ff6b57',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  disabledBtn: {
    backgroundColor: '#ffbbaa',
  },
  loginBtnText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 30,
  },
  footerText: {
    color: '#636e72',
    fontSize: 14,
  },
  registerLink: {
    color: '#ff6b57',
    fontSize: 14,
    fontWeight: '700',
  },
});
