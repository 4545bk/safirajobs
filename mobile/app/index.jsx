/**
 * App Entry Point
 * Checks first launch / auth state and redirects accordingly
 */

import { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Svg, { Circle, Path } from 'react-native-svg';

const COLORS = {
    primary: '#3B82F6',
    accent: '#F59E0B',
    background: '#FFFFFF',
};

// Mini owl icon for splash
const OwlSplash = () => (
    <View style={styles.splashLogo}>
        <Svg width={80} height={80} viewBox="0 0 100 100">
            <Path
                d="M50 8 C50 8 50 8 50 8 L72 40 C80 52 80 65 70 78 C62 88 50 90 50 90 C50 90 38 88 30 78 C20 65 20 52 28 40 L50 8Z"
                fill={COLORS.primary}
            />
            <Circle cx="36" cy="48" r="16" fill={COLORS.accent} />
            <Circle cx="64" cy="48" r="16" fill={COLORS.accent} />
            <Circle cx="36" cy="48" r="10" fill={COLORS.primary} />
            <Circle cx="64" cy="48" r="10" fill={COLORS.primary} />
            <Circle cx="39" cy="45" r="3" fill="white" />
            <Circle cx="67" cy="45" r="3" fill="white" />
        </Svg>
    </View>
);

export default function EntryScreen() {
    const router = useRouter();
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        checkFirstLaunch();
    }, []);

    const checkFirstLaunch = async () => {
        try {
            // Check if user has seen welcome screen before
            const hasSeenWelcome = await AsyncStorage.getItem('hasSeenWelcome');
            const isLoggedIn = await AsyncStorage.getItem('isLoggedIn');

            // Small delay for splash effect
            await new Promise(resolve => setTimeout(resolve, 500));

            if (!hasSeenWelcome) {
                // First launch - show welcome screen
                router.replace('/auth/welcome');
            } else if (!isLoggedIn) {
                // Has seen welcome but not logged in - show login
                router.replace('/auth/signup');
            } else {
                // Logged in - go to home
                router.replace('/home');
            }
        } catch (error) {
            console.error('Error checking first launch:', error);
            // Default to welcome on error
            router.replace('/auth/welcome');
        }
    };

    return (
        <View style={styles.container}>
            <OwlSplash />
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
    splashLogo: {
        width: 80,
        height: 80,
    },
});
