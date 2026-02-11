import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Animated,
    SafeAreaView,
    StatusBar,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Svg, { Circle, Path } from 'react-native-svg';
import useGoogleAuth from '../../hooks/useGoogleAuth';
import * as authService from '../../services/auth';

// Colors from the reference design
const COLORS = {
    primary: '#3B82F6',
    accent: '#F59E0B',
    background: '#FFFFFF',
    foreground: '#1E293B',
    muted: '#F1F5F9',
    mutedForeground: '#64748B',
    border: '#E2E8F0',
};

// Small Owl Icon for header
const OwlIcon = () => (
    <View style={styles.owlIcon}>
        <Svg width={32} height={32} viewBox="0 0 100 100">
            {/* Main body - teardrop shape */}
            <Path
                d="M50 8 C50 8 50 8 50 8 L72 40 C80 52 80 65 70 78 C62 88 50 90 50 90 C50 90 38 88 30 78 C20 65 20 52 28 40 L50 8Z"
                fill={COLORS.primary}
            />
            {/* Left eye - orange outer ring */}
            <Circle cx="36" cy="48" r="16" fill={COLORS.accent} />
            {/* Right eye - orange outer ring */}
            <Circle cx="64" cy="48" r="16" fill={COLORS.accent} />
            {/* Left eye - blue inner */}
            <Circle cx="36" cy="48" r="10" fill={COLORS.primary} />
            {/* Right eye - blue inner */}
            <Circle cx="64" cy="48" r="10" fill={COLORS.primary} />
            {/* Left eye - white highlight */}
            <Circle cx="39" cy="45" r="3" fill="white" />
            {/* Right eye - white highlight */}
            <Circle cx="67" cy="45" r="3" fill="white" />
        </Svg>
    </View>
);

// Social Button Component
const SocialButton = ({ provider, onPress }) => {
    const icons = {
        google: (
            <Svg width={20} height={20} viewBox="0 0 24 24">
                <Path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <Path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <Path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <Path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </Svg>
        ),
        apple: <Ionicons name="logo-apple" size={20} color={COLORS.mutedForeground} />,
    };

    const labels = {
        google: 'Sign With Google',
        apple: 'Sign With Apple',
    };

    return (
        <TouchableOpacity style={styles.socialButton} onPress={onPress} activeOpacity={0.8}>
            <View style={styles.socialIconContainer}>{icons[provider]}</View>
            <Text style={styles.socialButtonText}>{labels[provider]}</Text>
        </TouchableOpacity>
    );
};

export default function LoginScreen() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const scaleAnim = useRef(new Animated.Value(0)).current;
    const fadeAnim1 = useRef(new Animated.Value(0)).current;
    const fadeAnim2 = useRef(new Animated.Value(0)).current;
    const fadeAnim3 = useRef(new Animated.Value(0)).current;
    const fadeAnim4 = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // Staggered animations
        Animated.sequence([
            Animated.spring(scaleAnim, {
                toValue: 1,
                tension: 50,
                friction: 7,
                useNativeDriver: true,
            }),
            Animated.stagger(100, [
                Animated.timing(fadeAnim1, { toValue: 1, duration: 300, useNativeDriver: true }),
                Animated.timing(fadeAnim2, { toValue: 1, duration: 300, useNativeDriver: true }),
                Animated.timing(fadeAnim3, { toValue: 1, duration: 300, useNativeDriver: true }),
                Animated.timing(fadeAnim4, { toValue: 1, duration: 300, useNativeDriver: true }),
            ]),
        ]).start();
    }, []);

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Error', 'Please enter both email and password');
            return;
        }

        try {
            // Use real auth service
            const response = await authService.login(email, password);

            if (response.success) {
                // Navigate to home on success
                router.replace('/home');
            } else {
                Alert.alert('Login Failed', response.message || 'Invalid credentials');
            }
        } catch (error) {
            console.error('Login error:', error);
            Alert.alert('Error', 'Something went wrong. Please try again.');
        }
    };

    // Google Auth
    const { signInWithGoogle, user, loading: googleLoading, error: googleError, isReady } = useGoogleAuth();

    // Handle Google sign-in result
    useEffect(() => {
        if (user) {
            // User signed in successfully, navigate to home
            router.replace('/home');
        }
    }, [user]);

    useEffect(() => {
        if (googleError) {
            Alert.alert('Sign-In Error', googleError);
        }
    }, [googleError]);

    const handleGoogleLogin = async () => {
        if (!isReady) {
            Alert.alert('Please wait', 'Google Sign-In is initializing...');
            return;
        }
        await signInWithGoogle();
    };

    const handleAppleLogin = () => {
        Alert.alert('Coming Soon', 'Apple Sign-In will be available soon!');
    };

    const handleForgotPassword = () => {
        console.log('Forgot password');
        // TODO: Implement forgot password flow
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Header with emoji */}
                    <Animated.View style={[styles.header, { transform: [{ scale: scaleAnim }] }]}>
                        <View style={styles.headerRow}>
                            <OwlIcon />
                            <Text style={styles.title}>Hello Again!</Text>
                        </View>
                        <Text style={styles.subtitle}>
                            Welcome Back You've{'\n'}been missed
                        </Text>
                    </Animated.View>

                    {/* Login form */}
                    <Animated.View style={[styles.form, { opacity: fadeAnim1 }]}>
                        {/* Email input */}
                        <View style={styles.inputContainer}>
                            <Ionicons name="mail-outline" size={20} color={COLORS.mutedForeground} style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Enter your email"
                                placeholderTextColor={COLORS.mutedForeground}
                                value={email}
                                onChangeText={setEmail}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                autoCorrect={false}
                            />
                        </View>

                        {/* Password input */}
                        <View style={styles.inputContainer}>
                            <Ionicons name="lock-closed-outline" size={20} color={COLORS.mutedForeground} style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Password"
                                placeholderTextColor={COLORS.mutedForeground}
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry={!showPassword}
                                autoCapitalize="none"
                            />
                            <TouchableOpacity
                                style={styles.eyeIcon}
                                onPress={() => setShowPassword(!showPassword)}
                            >
                                <Ionicons
                                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                                    size={20}
                                    color={COLORS.mutedForeground}
                                />
                            </TouchableOpacity>
                        </View>

                        {/* Forgot password link */}
                        <TouchableOpacity style={styles.forgotPassword} onPress={handleForgotPassword}>
                            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                        </TouchableOpacity>

                        {/* Sign in button */}
                        <TouchableOpacity style={styles.signInButton} onPress={handleLogin} activeOpacity={0.8}>
                            <Text style={styles.signInButtonText}>Sign In</Text>
                        </TouchableOpacity>
                    </Animated.View>

                    {/* Social buttons */}
                    <Animated.View style={[styles.socialButtons, { opacity: fadeAnim2 }]}>
                        <SocialButton provider="google" onPress={handleGoogleLogin} />
                        <SocialButton provider="apple" onPress={handleAppleLogin} />
                    </Animated.View>

                    {/* Divider */}
                    <Animated.View style={[styles.divider, { opacity: fadeAnim3 }]}>
                        <Text style={styles.dividerText}>Or</Text>
                    </Animated.View>

                    {/* Sign up link */}
                    <Animated.View style={[styles.signupLink, { opacity: fadeAnim4 }]}>
                        <Text style={styles.signupLinkText}>
                            Don't Have Account?{' '}
                            <Text style={styles.signupLinkHighlight} onPress={() => router.push('/auth/signup')}>
                                Sign Up
                            </Text>
                        </Text>
                    </Animated.View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    keyboardView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: 24,
        paddingTop: 64,
        paddingBottom: 32,
        alignItems: 'center',
    },
    header: {
        alignItems: 'center',
        marginBottom: 40,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 12,
    },
    owlIcon: {
        width: 32,
        height: 32,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: COLORS.foreground,
    },
    subtitle: {
        fontSize: 14,
        color: COLORS.mutedForeground,
        textAlign: 'center',
        lineHeight: 20,
    },
    form: {
        width: '100%',
        maxWidth: 360,
        gap: 16,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.muted,
        borderRadius: 16,
        paddingHorizontal: 16,
    },
    inputIcon: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        paddingVertical: 16,
        fontSize: 16,
        color: COLORS.foreground,
    },
    eyeIcon: {
        padding: 8,
    },
    forgotPassword: {
        alignItems: 'center',
        paddingTop: 8,
    },
    forgotPasswordText: {
        fontSize: 14,
        color: COLORS.mutedForeground,
    },
    signInButton: {
        backgroundColor: COLORS.primary,
        paddingVertical: 16,
        borderRadius: 16,
        alignItems: 'center',
        marginTop: 8,
    },
    signInButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: 'white',
    },
    socialButtons: {
        width: '100%',
        maxWidth: 360,
        marginTop: 24,
        gap: 12,
    },
    socialButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.background,
        borderWidth: 1,
        borderColor: COLORS.border,
        paddingVertical: 16,
        paddingHorizontal: 24,
        borderRadius: 16,
        gap: 16,
    },
    socialIconContainer: {
        position: 'absolute',
        left: 24,
    },
    socialButtonText: {
        fontSize: 16,
        fontWeight: '500',
        color: COLORS.foreground,
    },
    divider: {
        marginVertical: 24,
    },
    dividerText: {
        fontSize: 14,
        color: COLORS.mutedForeground,
    },
    signupLink: {
        marginTop: 'auto',
    },
    signupLinkText: {
        fontSize: 14,
        color: COLORS.mutedForeground,
    },
    signupLinkHighlight: {
        color: COLORS.primary,
        fontWeight: '600',
    },
});
