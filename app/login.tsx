import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Dimensions,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { FontAwesome5 } from '@expo/vector-icons';
import Colors from '@/constants/Colors';
// Nhost authentication helpers
import { signIn, signUp } from '../../store/auth';

const { width } = Dimensions.get('window');

export default function LoginScreen() {
  const router = useRouter();
  const [loginType, setLoginType] = useState<'mobile' | 'email'>('mobile');
  // Mobile placeholder input
  const [inputValue, setInputValue] = useState('');
  // Email auth fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  // Toggle between Sign‑In and Sign‑Up when in email mode
  const [isSignUp, setIsSignUp] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;
  const logoScale = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.spring(logoScale, {
        toValue: 1,
        tension: 50,
        friction: 6,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleLogin = async () => {
    try {
      if (loginType === 'email') {
        if (isSignUp) {
          await signUp(inputValue.trim(), password.trim());
          Alert.alert('Success', 'Your account has been created successfully!');
        } else {
          await signIn(inputValue.trim(), password.trim());
        }
      } else {
        // Mobile login placeholder – keep navigation for now
      }
      router.replace('/(tabs)');
    } catch (e: any) {
      Alert.alert('Authentication error', e.message ?? 'Unexpected error');
    }
  };

  return (
    <View style={styles.container}>
      {/* Purple gradient header */}
      <View style={styles.headerSection}>
        <View style={styles.decorCircle1} />
        <View style={styles.decorCircle2} />
        <Animated.View
          style={[styles.logoContainer, { transform: [{ scale: logoScale }] }]}
        >
          <View style={styles.logoIcon}>
            <FontAwesome5 name="shipping-fast" size={32} color={Colors.white} />
          </View>
          <Text style={styles.appName}>DispatchPro</Text>
          <Text style={styles.tagline}>B2B Order & Dispatch Management</Text>
        </Animated.View>
      </View>

      {/* Login form */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.formSection}
      >
        <Animated.View
          style={[
            styles.formCard,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <Text style={styles.welcomeText}>Welcome Back</Text>
          <Text style={styles.subtitle}>Sign in to continue</Text>

          {/* Toggle mobile / email */}
          <View style={styles.toggleRow}>
            <TouchableOpacity
              style={[
                styles.toggleBtn,
                loginType === 'mobile' && styles.toggleBtnActive,
              ]}
              onPress={() => setLoginType('mobile')}
              activeOpacity={0.7}
            >
              <FontAwesome5
                name="mobile-alt"
                size={14}
                color={loginType === 'mobile' ? Colors.white : Colors.primary}
              />
              <Text
                style={[
                  styles.toggleText,
                  loginType === 'mobile' && styles.toggleTextActive,
                ]}
              >
                Mobile
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.toggleBtn,
                loginType === 'email' && styles.toggleBtnActive,
              ]}
              onPress={() => setLoginType('email')}
              activeOpacity={0.7}
            >
              <FontAwesome5
                name="envelope"
                size={14}
                color={loginType === 'email' ? Colors.white : Colors.primary}
              />
              <Text
                style={[
                  styles.toggleText,
                  loginType === 'email' && styles.toggleTextActive,
                ]}
              >
                Email
              </Text>
            </TouchableOpacity>
          </View>

          {/* Input fields */}
          <View style={styles.inputGroup}>
            <View style={styles.inputWrapper}>
              <FontAwesome5
                name={loginType === 'mobile' ? 'phone-alt' : 'at'}
                size={16}
                color={Colors.primary}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder={
                  loginType === 'mobile'
                    ? 'Enter Mobile Number'
                    : 'Enter Email Address'
                }
                placeholderTextColor={Colors.placeholder}
                value={inputValue}
                onChangeText={setInputValue}
                keyboardType={
                  loginType === 'mobile' ? 'phone-pad' : 'email-address'
                }
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputWrapper}>
              <FontAwesome5
                name="lock"
                size={16}
                color={Colors.primary}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Enter Password"
                placeholderTextColor={Colors.placeholder}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>
          </View>

          <TouchableOpacity style={styles.forgotBtn}>
            <Text style={styles.forgotText}>Forgot Password?</Text>
          </TouchableOpacity>

          {/* Login Button */}
          <TouchableOpacity
            style={styles.loginButton}
            onPress={handleLogin}
            activeOpacity={0.85}
          >
            <Text style={styles.loginButtonText}>
              {loginType === 'email' && isSignUp ? 'Sign Up' : 'Sign In'}
            </Text>
            <FontAwesome5 name="arrow-right" size={16} color={Colors.white} />
          </TouchableOpacity>

          {/* Footer */}
          <View style={styles.footerRow}>
            <Text style={styles.footerText}>
              {loginType === 'email'
                ? (isSignUp ? 'Already have an account? ' : "Don't have an account? ")
                : "Don't have an account? "}
            </Text>
            <TouchableOpacity
              onPress={() => {
                if (loginType === 'email') {
                  setIsSignUp(!isSignUp);
                } else {
                  setLoginType('email');
                  setIsSignUp(true);
                }
              }}
            >
              <Text style={styles.footerLink}>
                {loginType === 'email'
                  ? (isSignUp ? 'Sign In' : 'Sign Up')
                  : 'Contact Admin'}
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary,
  },
  headerSection: {
    height: 280,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  decorCircle1: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.06)',
    top: -40,
    right: -40,
  },
  decorCircle2: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(255,255,255,0.04)',
    bottom: 10,
    left: -30,
  },
  logoContainer: {
    alignItems: 'center',
  },
  logoIcon: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.18)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  appName: {
    fontSize: 30,
    fontWeight: '800',
    color: Colors.white,
    letterSpacing: 0.5,
  },
  tagline: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.75)',
    marginTop: 6,
    letterSpacing: 0.3,
  },
  formSection: {
    flex: 1,
    backgroundColor: Colors.background,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    marginTop: -24,
  },
  formCard: {
    flex: 1,
    paddingHorizontal: 28,
    paddingTop: 36,
  },
  welcomeText: {
    fontSize: 26,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 4,
    marginBottom: 24,
  },
  toggleRow: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 4,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  toggleBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 6,
  },
  toggleBtnActive: {
    backgroundColor: Colors.primary,
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
  },
  toggleTextActive: {
    color: Colors.white,
  },
  inputGroup: {
    gap: 14,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    paddingHorizontal: 16,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: 52,
    fontSize: 15,
    color: Colors.textPrimary,
  },
  forgotBtn: {
    alignSelf: 'flex-end',
    marginTop: 12,
    marginBottom: 28,
  },
  forgotText: {
    fontSize: 13,
    color: Colors.primary,
    fontWeight: '600',
  },
  loginButton: {
    backgroundColor: Colors.primary,
    height: 54,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  loginButtonText: {
    color: Colors.white,
    fontSize: 17,
    fontWeight: '700',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 28,
  },
  footerText: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  footerLink: {
    fontSize: 13,
    color: Colors.primary,
    fontWeight: '700',
  },
});
