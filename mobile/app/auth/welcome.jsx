import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Animated, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Svg, { Circle, Path, Line } from 'react-native-svg';

const { width, height } = Dimensions.get('window');

// Colors from the reference design
const COLORS = {
    primary: '#3B82F6', // Blue
    accent: '#F59E0B', // Orange
    background: '#FFFFFF',
    waveLight: '#93C5FD',
    waveMedium: '#60A5FA',
    waveDark: '#3B82F6',
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

// Owl Logo SVG Component
const OwlLogo = () => (
    <View style={styles.logoContainer}>
        <Svg width={50} height={50} viewBox="0 0 50 50">
            {/* Left eye - orange outer ring */}
            <Circle cx="14" cy="25" r="11" fill={COLORS.accent} />
            {/* Right eye - orange outer ring */}
            <Circle cx="36" cy="25" r="11" fill={COLORS.accent} />
            {/* Left eye - blue inner */}
            <Circle cx="14" cy="25" r="6" fill={COLORS.primary} />
            {/* Right eye - blue inner */}
            <Circle cx="36" cy="25" r="6" fill={COLORS.primary} />
            {/* Left eye - white highlight */}
            <Circle cx="16" cy="23" r="2" fill="white" />
            {/* Right eye - white highlight */}
            <Circle cx="38" cy="23" r="2" fill="white" />
            {/* Beak stem */}
            <Line
                x1="25"
                y1="36"
                x2="25"
                y2="46"
                stroke={COLORS.primary}
                strokeWidth="2.5"
                strokeLinecap="round"
            />
            {/* Beak left curve */}
            <Path
                d="M25 46 Q21 46 18 50"
                stroke={COLORS.primary}
                strokeWidth="2.5"
                strokeLinecap="round"
                fill="none"
            />
            {/* Beak right curve */}
            <Path
                d="M25 46 Q29 46 32 50"
                stroke={COLORS.primary}
                strokeWidth="2.5"
                strokeLinecap="round"
                fill="none"
            />
        </Svg>
    </View>
);

// Wave Background Component
const WaveBackground = () => (
    <View style={styles.waveContainer}>
        <Svg width={width} height={200} viewBox="0 0 1440 400" preserveAspectRatio="none">
            <Path
                fill={COLORS.waveLight}
                d="M0,160 C320,280 420,100 720,180 C1020,260 1200,120 1440,200 L1440,400 L0,400 Z"
            />
        </Svg>
        <Svg width={width} height={200} viewBox="0 0 1440 400" preserveAspectRatio="none" style={styles.waveMedium}>
            <Path
                fill={COLORS.waveMedium}
                d="M0,200 C240,100 480,280 720,200 C960,120 1200,260 1440,180 L1440,400 L0,400 Z"
            />
        </Svg>
        <Svg width={width} height={200} viewBox="0 0 1440 400" preserveAspectRatio="none" style={styles.waveDark}>
            <Path
                fill={COLORS.waveDark}
                d="M0,240 C360,320 540,180 720,240 C900,300 1080,200 1440,260 L1440,400 L0,400 Z"
            />
        </Svg>
    </View>
);

// Loading Dots Component
const LoadingDots = () => {
    const dot1 = useRef(new Animated.Value(0)).current;
    const dot2 = useRef(new Animated.Value(0)).current;
    const dot3 = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const createAnimation = (value, delay) =>
            Animated.loop(
                Animated.sequence([
                    Animated.timing(value, {
                        toValue: 1,
                        duration: 300,
                        useNativeDriver: true,
                        delay,
                    }),
                    Animated.timing(value, {
                        toValue: 0,
                        duration: 300,
                        useNativeDriver: true,
                    }),
                ])
            );

        createAnimation(dot1, 0).start();
        createAnimation(dot2, 150).start();
        createAnimation(dot3, 300).start();
    }, []);

    const getDotStyle = (animatedValue) => ({
        transform: [
            {
                translateY: animatedValue.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, -10],
                }),
            },
        ],
    });

    return (
        <View style={styles.loadingDots}>
            <Animated.View style={[styles.loadingDot, getDotStyle(dot1)]} />
            <Animated.View style={[styles.loadingDot, getDotStyle(dot2)]} />
            <Animated.View style={[styles.loadingDot, getDotStyle(dot3)]} />
        </View>
    );
};

export default function WelcomeScreen() {
    const router = useRouter();
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(20)).current;
    const [showButtons, setShowButtons] = useState(false);

    useEffect(() => {
        // Fade in animation
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 1000,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 1000,
                useNativeDriver: true,
            }),
        ]).start();

        // Show buttons after 2 seconds
        const timer = setTimeout(() => {
            setShowButtons(true);
        }, 2000);

        return () => clearTimeout(timer);
    }, []);

    const handleContinueAsGuest = async () => {
        // Set guest mode flag
        await AsyncStorage.setItem('hasSeenWelcome', 'true');
        await AsyncStorage.setItem('isGuest', 'true');
        router.replace('/home');
    };

    const handleGetStarted = async () => {
        await AsyncStorage.setItem('hasSeenWelcome', 'true');
        router.replace('/auth/signup');
    };

    return (
        <View style={styles.container}>
            {/* Floating decorative dots */}
            <FloatingDot size={32} color={COLORS.primary + '80'} top={80} left={32} delay={0} />
            <FloatingDot size={16} color={COLORS.waveLight} top={128} left={width - 60} delay={500} />
            <FloatingDot size={24} color={COLORS.primary + '50'} top={192} left={64} delay={1000} />
            <FloatingDot size={12} color={COLORS.primary + '40'} top={96} left={width - 96} delay={200} />
            <FloatingDot size={20} color={COLORS.accent + '70'} top={144} left={width - 40} delay={800} />
            <FloatingDot size={12} color={COLORS.accent} top={224} left={width - 80} delay={600} />
            <FloatingDot size={16} color={COLORS.accent + '50'} top={160} left={24} delay={1200} />

            {/* Main content */}
            <Animated.View
                style={[
                    styles.content,
                    {
                        opacity: fadeAnim,
                        transform: [{ translateY: slideAnim }],
                    },
                ]}
            >
                {/* Logo: "find" text above JOBS with owl eyes */}
                <View style={styles.logoWrapper}>
                    <Text style={styles.findText}>find</Text>
                    <View style={styles.jobsRow}>
                        <Text style={styles.jobsText}>J</Text>
                        <OwlLogo />
                        <Text style={styles.jobsText}>BS</Text>
                    </View>
                </View>

                {/* Loading indicator */}
                {!showButtons ? (
                    <LoadingDots />
                ) : (
                    <View style={styles.buttonContainer}>
                        <TouchableOpacity
                            style={styles.primaryButton}
                            onPress={handleGetStarted}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.primaryButtonText}>Get Started</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.guestButton}
                            onPress={handleContinueAsGuest}
                            activeOpacity={0.7}
                        >
                            <Text style={styles.guestButtonText}>Continue as Guest</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </Animated.View>

            {/* Wave background */}
            <WaveBackground />

            {/* Bottom center owl icon */}
            <View style={styles.bottomIcon}>
                <Svg width={48} height={48} viewBox="0 0 50 50">
                    <Circle cx="25" cy="25" r="18" stroke="white" strokeWidth="2.5" fill="none" opacity={0.8} />
                    <Circle cx="25" cy="25" r="10" stroke="white" strokeWidth="2" fill="none" opacity={0.6} />
                </Svg>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
        alignItems: 'center',
        justifyContent: 'center',
    },
    floatingDot: {
        position: 'absolute',
        borderRadius: 100,
    },
    content: {
        alignItems: 'center',
        zIndex: 10,
    },
    logoWrapper: {
        alignItems: 'center',
    },
    findText: {
        fontSize: 14,
        fontWeight: '500',
        color: COLORS.primary,
        letterSpacing: 1,
        marginLeft: 16,
        marginBottom: 2,
    },
    jobsRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    jobsText: {
        fontSize: 48,
        fontWeight: 'bold',
        color: COLORS.primary,
        letterSpacing: -2,
    },
    logoContainer: {
        width: 50,
        height: 50,
        marginHorizontal: -2,
    },
    loadingDots: {
        flexDirection: 'row',
        marginTop: 64,
        gap: 8,
    },
    loadingDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: COLORS.primary,
    },
    waveContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '45%',
    },
    waveMedium: {
        position: 'absolute',
        bottom: 0,
    },
    waveDark: {
        position: 'absolute',
        bottom: 0,
    },
    bottomIcon: {
        position: 'absolute',
        bottom: 40,
        zIndex: 20,
    },
    buttonContainer: {
        marginTop: 64,
        width: width * 0.8,
        gap: 16,
    },
    primaryButton: {
        backgroundColor: COLORS.primary,
        paddingVertical: 16,
        paddingHorizontal: 32,
        borderRadius: 12,
        alignItems: 'center',
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    primaryButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
        letterSpacing: 0.5,
    },
    guestButton: {
        backgroundColor: 'transparent',
        paddingVertical: 14,
        paddingHorizontal: 32,
        borderRadius: 12,
        alignItems: 'center',
        borderWidth: 1.5,
        borderColor: COLORS.primary + '40',
    },
    guestButtonText: {
        color: COLORS.primary,
        fontSize: 15,
        fontWeight: '500',
        letterSpacing: 0.3,
    },
});
