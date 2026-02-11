import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Animated,
    Dimensions,
    SafeAreaView,
    StatusBar,
    Alert,
    KeyboardAvoidingView,
    ScrollView,
    Platform,
    ActivityIndicator
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Circle, Path, Line } from 'react-native-svg';
import useGoogleAuth from '../../hooks/useGoogleAuth';
import * as authService from '../../services/auth';

const { width } = Dimensions.get('window');

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

// Floating Dot Component
const FloatingDot = ({ size, color, top, left, delay = 0 }) => {
    const animatedValue = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const animation = Animated.loop(
            Animated.sequence([
                Animated.timing(animatedValue, {
                    toValue: 1,
                    duration: 3000,
                    useNativeDriver: true,
                    delay,
                }),
                Animated.timing(animatedValue, {
                    toValue: 0,
                    duration: 3000,
                    useNativeDriver: true,
                }),
            ])
        );
        animation.start();
        return () => animation.stop();
    }, []);

    const translateY = animatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: [0, -20],
    });

    return (
        <Animated.View
            style={[
                styles.floatingDot,
                {
                    width: size,
                    height: size,
                    backgroundColor: color,
                    top,
                    left,
                    transform: [{ translateY }],
                },
            ]}
        />
    );
};

// Owl Logo SVG Component (Full version with teardrop body)
const OwlLogoFull = () => (
    <View style={styles.owlLogoContainer}>
        <Svg width={112} height={112} viewBox="0 0 100 100">
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
            {/* Beak stem */}
            <Line x1="50" y1="64" x2="50" y2="82" stroke={COLORS.primary} strokeWidth="4" strokeLinecap="round" />
            {/* Beak left curve */}
            <Path d="M50 82 Q44 82 40 88" stroke={COLORS.primary} strokeWidth="4" strokeLinecap="round" fill="none" />
            {/* Beak right curve */}
            <Path d="M50 82 Q56 82 60 88" stroke={COLORS.primary} strokeWidth="4" strokeLinecap="round" fill="none" />
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

export default function SignupScreen() {
    const router = useRouter();
    const [showForm, setShowForm] = useState(false);
    const [loading, setLoading] = useState(false);

    // Form State
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    // Animations
    const scaleAnim = useRef(new Animated.Value(0)).current;
    const fadeAnim1 = useRef(new Animated.Value(0)).current;
    const fadeAnim2 = useRef(new Animated.Value(0)).current;
    const fadeAnim3 = useRef(new Animated.Value(0)).current;
    const fadeAnim4 = useRef(new Animated.Value(0)).current;
    const formFadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // Initial animations
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

    const handleEmailSignup = () => {
        setShowForm(true);
        Animated.timing(formFadeAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
        }).start();
    };

    const handleBackToLanding = () => {
        Animated.timing(formFadeAnim, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
        }).start(() => setShowForm(false));
    };

    const handleRegister = async () => {
        if (!name || !email || !password || !confirmPassword) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        if (password !== confirmPassword) {
            Alert.alert('Error', 'Passwords do not match');
            return;
        }

        if (password.length < 6) {
            Alert.alert('Error', 'Password must be at least 6 characters');
            return;
        }

        setLoading(true);
        try {
            // Register user
            const response = await authService.register({
                email: email.trim(),
                password,
                role: 'jobseeker',
                profile: { name: name.trim() }
            });

            if (response.success) {
                Alert.alert('Success', 'Account created successfully!', [
                    { text: 'OK', onPress: () => router.replace('/home') }
                ]);
            } else {
                Alert.alert('Registration Failed', response.message || 'Could not create account');
            }
        } catch (error) {
            console.error('Registration error:', error);
            Alert.alert('Error', 'Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Google Auth
    const { signInWithGoogle, user, loading: googleLoading, error: googleError, isReady } = useGoogleAuth();

    // Handle Google sign-in result
    useEffect(() => {
        if (user) {
            router.replace('/home');
        }
    }, [user]);

    useEffect(() => {
        if (googleError) {
            Alert.alert('Sign-In Error', googleError);
        }
    }, [googleError]);

    const handleGoogleSignup = async () => {
        if (!isReady) {
            Alert.alert('Please wait', 'Google Sign-In is initializing...');
            return;
        }
        await signInWithGoogle();
    };

    const handleAppleSignup = () => {
        Alert.alert('Coming Soon', 'Apple Sign-In will be available soon!');
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

            {/* Floating decorative dots */}
            <FloatingDot size={32} color={COLORS.primary + '80'} top={80} left={32} delay={0} />
            <FloatingDot size={16} color="#93C5FD" top={128} left={width - 60} delay={500} />
            <FloatingDot size={24} color={COLORS.primary + '50'} top={192} left={64} delay={1000} />
            <FloatingDot size={20} color={COLORS.accent + '70'} top={144} left={width - 40} delay={800} />
            <FloatingDot size={16} color={COLORS.accent + '50'} top={160} left={24} delay={1200} />

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                    {/* Header / Logo Section */}
                    <View style={styles.headerContainer}>
                        <Animated.View style={[styles.logoSection, { transform: [{ scale: scaleAnim }] }]}>
                            <OwlLogoFull />
                        </Animated.View>

                        <Animated.View style={[styles.headerSection, { opacity: fadeAnim1 }]}>
                            {showForm && (
                                <TouchableOpacity style={styles.backButton} onPress={handleBackToLanding}>
                                    <Ionicons name="arrow-back" size={24} color={COLORS.foreground} />
                                </TouchableOpacity>
                            )}
                            <View style={styles.orangeDot} />
                            <Text style={styles.title}>{showForm ? 'Create Account' : 'Lets Get Started'}</Text>
                            <Text style={styles.subtitle}>
                                {showForm
                                    ? 'Fill in your details to start your journey'
                                    : 'Find the right opportunity and start your\nimpact career journey'}
                            </Text>
                        </Animated.View>
                    </View>

                    {showForm ? (
                        /* Registration Form */
                        <Animated.View style={[styles.formContainer, { opacity: formFadeAnim }]}>
                            {/* Name Input */}
                            <View style={styles.inputContainer}>
                                <Ionicons name="person-outline" size={20} color={COLORS.mutedForeground} style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Full Name"
                                    placeholderTextColor={COLORS.mutedForeground}
                                    value={name}
                                    onChangeText={setName}
                                    autoCapitalize="words"
                                />
                            </View>

                            {/* Email Input */}
                            <View style={styles.inputContainer}>
                                <Ionicons name="mail-outline" size={20} color={COLORS.mutedForeground} style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Email Address"
                                    placeholderTextColor={COLORS.mutedForeground}
                                    value={email}
                                    onChangeText={setEmail}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                />
                            </View>

                            {/* Password Input */}
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
                                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                                    <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color={COLORS.mutedForeground} />
                                </TouchableOpacity>
                            </View>

                            {/* Confirm Password Input */}
                            <View style={styles.inputContainer}>
                                <Ionicons name="lock-closed-outline" size={20} color={COLORS.mutedForeground} style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Confirm Password"
                                    placeholderTextColor={COLORS.mutedForeground}
                                    value={confirmPassword}
                                    onChangeText={setConfirmPassword}
                                    secureTextEntry={!showPassword}
                                    autoCapitalize="none"
                                />
                            </View>

                            {/* Legal acceptance text */}
                            <Text style={styles.legalText}>
                                By signing up, you agree to our{' '}
                                <Text style={styles.legalLink} onPress={() => router.push('/privacy-policy')}>
                                    Privacy Policy
                                </Text>
                                {' '}and{' '}
                                <Text style={styles.legalLink} onPress={() => router.push('/terms-of-service')}>
                                    Terms of Service
                                </Text>
                            </Text>

                            <TouchableOpacity
                                style={styles.registerButton}
                                onPress={handleRegister}
                                disabled={loading}
                            >
                                {loading ? (
                                    <ActivityIndicator size="small" color="#FFF" />
                                ) : (
                                    <Text style={styles.registerButtonText}>Create Account</Text>
                                )}
                            </TouchableOpacity>

                        </Animated.View>
                    ) : (
                        /* Landing Options */
                        <View style={styles.landingContainer}>
                            <Animated.View style={[styles.emailButtonContainer, { opacity: fadeAnim2 }]}>
                                <TouchableOpacity style={styles.emailButton} onPress={handleEmailSignup} activeOpacity={0.8}>
                                    <Ionicons name="mail-outline" size={20} color={COLORS.mutedForeground} />
                                    <Text style={styles.emailButtonText}>Sign Up with Email</Text>
                                </TouchableOpacity>
                            </Animated.View>

                            <Animated.View style={[styles.divider, { opacity: fadeAnim3 }]}>
                                <Text style={styles.dividerText}>Or Use Instant Sign Up</Text>
                            </Animated.View>

                            <Animated.View style={[styles.socialButtons, { opacity: fadeAnim3 }]}>
                                <SocialButton provider="google" onPress={handleGoogleSignup} />
                                <SocialButton provider="apple" onPress={handleAppleSignup} />
                            </Animated.View>

                            <Animated.View style={[styles.loginLink, { opacity: fadeAnim4 }]}>
                                <Text style={styles.loginLinkText}>
                                    Already Have an Account?{' '}
                                    <Text style={styles.loginLinkHighlight} onPress={() => router.push('/auth/login')}>
                                        Sign In
                                    </Text>
                                </Text>
                            </Animated.View>
                        </View>
                    )}
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
    floatingDot: {
        position: 'absolute',
        borderRadius: 100,
        zIndex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        paddingBottom: 32,
    },
    headerContainer: {
        paddingHorizontal: 24,
        paddingTop: 80,
        alignItems: 'center',
        zIndex: 10,
    },
    logoSection: {
        marginBottom: 30,
    },
    owlLogoContainer: {
        width: 112,
        height: 112,
    },
    headerSection: {
        alignItems: 'center',
        position: 'relative',
        marginBottom: 30,
        width: '100%',
    },
    backButton: {
        position: 'absolute',
        left: 0,
        top: 0,
        padding: 8,
        zIndex: 20,
    },
    orangeDot: {
        position: 'absolute',
        left: -24,
        top: '50%',
        width: 12,
        height: 12,
        borderRadius: 6,
        borderWidth: 2,
        borderColor: COLORS.accent,
        transform: [{ translateY: -6 }],
        display: 'none',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: COLORS.foreground,
        marginBottom: 12,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 14,
        color: COLORS.mutedForeground,
        textAlign: 'center',
        lineHeight: 22,
    },

    // Landing View Styles
    landingContainer: {
        paddingHorizontal: 24,
        alignItems: 'center',
        width: '100%',
    },
    emailButtonContainer: {
        width: '100%',
        maxWidth: 360,
    },
    emailButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.muted,
        paddingVertical: 16,
        paddingHorizontal: 24,
        borderRadius: 16,
        gap: 12,
    },
    emailButtonText: {
        fontSize: 16,
        fontWeight: '500',
        color: COLORS.mutedForeground,
    },
    divider: {
        marginVertical: 32,
    },
    dividerText: {
        fontSize: 14,
        color: COLORS.mutedForeground,
    },
    socialButtons: {
        width: '100%',
        maxWidth: 360,
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
    loginLink: {
        marginTop: 40,
        paddingBottom: 20,
    },
    loginLinkText: {
        fontSize: 14,
        color: COLORS.mutedForeground,
    },
    loginLinkHighlight: {
        color: COLORS.primary,
        fontWeight: '600',
    },

    // Form View Styles
    formContainer: {
        paddingHorizontal: 24,
        width: '100%',
        maxWidth: 360,
        alignSelf: 'center',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.muted,
        borderRadius: 16,
        marginBottom: 16,
        paddingHorizontal: 16,
        height: 56,
        borderWidth: 1,
        borderColor: 'transparent',
    },
    inputIcon: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: COLORS.foreground,
        height: '100%',
    },
    eyeIcon: {
        padding: 8,
    },
    registerButton: {
        backgroundColor: COLORS.primary,
        borderRadius: 16,
        height: 56,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 16,
        shadowColor: COLORS.primary,
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    registerButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    legalText: {
        fontSize: 12,
        color: COLORS.mutedForeground,
        textAlign: 'center',
        marginTop: 12,
        lineHeight: 18,
    },
    legalLink: {
        color: COLORS.primary,
        fontWeight: '600',
    },
});
