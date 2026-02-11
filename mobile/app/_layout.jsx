/**
 * Root Layout - Updated for Figma Light Theme
 */

import { useEffect, useRef } from 'react';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
// import { colors } from '../theme'; // Replaced by dynamic theme
import {
    registerForPushNotifications,
    registerTokenWithBackend,
    addNotificationReceivedListener,
    addNotificationResponseListener,
} from '../services/notifications';
import { useTheme } from '../context/ThemeContext';

import { ThemeProvider } from '../context/ThemeContext';
import { LanguageProvider } from '../context/LanguageContext';
import ErrorBoundary from '../components/ErrorBoundary';

export default function RootLayoutWrapper() {
    return (
        <ErrorBoundary>
            <LanguageProvider>
                <ThemeProvider>
                    <RootLayout />
                </ThemeProvider>
            </LanguageProvider>
        </ErrorBoundary>
    );
}

function RootLayout() {
    const router = useRouter();
    const notificationListener = useRef();
    const responseListener = useRef();

    useEffect(() => {
        // Initialize push notifications
        initPushNotifications();

        // Listener for notifications received while app is open
        notificationListener.current = addNotificationReceivedListener(notification => {
            console.log('Notification received:', notification);
        });

        // Listener for notification taps (including when app was closed)
        responseListener.current = addNotificationResponseListener(response => {
            console.log('Notification tapped:', response);

            // Navigate to job if notification contains jobId
            const jobId = response.notification.request.content.data?.jobId;
            if (jobId) {
                router.push(`/job/${jobId}`);
            }
        });

        // Cleanup on unmount
        return () => {
            if (notificationListener.current) {
                notificationListener.current.remove();
            }
            if (responseListener.current) {
                responseListener.current.remove();
            }
        };
    }, []);

    const initPushNotifications = async () => {
        try {
            // Get push token
            const token = await registerForPushNotifications();

            if (token) {
                // Register with backend
                await registerTokenWithBackend(token);
            }
        } catch (error) {
            console.error('Failed to initialize push notifications:', error);
        }
    };

    const { colors, isDark } = useTheme();

    return (
        <>
            <StatusBar style={isDark ? "light" : "dark"} />
            <Stack
                screenOptions={{
                    headerStyle: {
                        backgroundColor: colors.background,
                    },
                    headerTintColor: colors.textPrimary,
                    headerTitleStyle: {
                        fontWeight: '600',
                    },
                    contentStyle: {
                        backgroundColor: colors.background,
                    },
                    headerShadowVisible: false,
                }}
            >
                <Stack.Screen
                    name="index"
                    options={{
                        headerShown: false,
                    }}
                />
                <Stack.Screen
                    name="auth"
                    options={{
                        headerShown: false,
                    }}
                />
                <Stack.Screen
                    name="home"
                    options={{
                        headerShown: false,
                    }}
                />
                <Stack.Screen
                    name="job/[id]"
                    options={{
                        headerShown: false,
                    }}
                />
                <Stack.Screen
                    name="profile"
                    options={{
                        headerShown: false,
                    }}
                />
                <Stack.Screen
                    name="bookmarks"
                    options={{
                        headerShown: false,
                    }}
                />
                <Stack.Screen
                    name="alerts"
                    options={{
                        headerShown: false,
                    }}
                />
                <Stack.Screen
                    name="quickapply"
                    options={{
                        headerShown: false,
                    }}
                />
                <Stack.Screen
                    name="applications"
                    options={{
                        headerShown: false,
                    }}
                />
                <Stack.Screen
                    name="company/[name]"
                    options={{
                        headerShown: false,
                    }}
                />
                <Stack.Screen
                    name="explore"
                    options={{
                        headerShown: false,
                    }}
                />
                <Stack.Screen
                    name="interviews"
                    options={{
                        headerShown: false,
                    }}
                />
                <Stack.Screen
                    name="manage-profile"
                    options={{
                        headerShown: false,
                    }}
                />
                <Stack.Screen
                    name="privacy-policy"
                    options={{
                        headerShown: false,
                    }}
                />
                <Stack.Screen
                    name="terms-of-service"
                    options={{
                        headerShown: false,
                    }}
                />
                <Stack.Screen
                    name="change-password"
                    options={{
                        headerShown: false,
                    }}
                />
                <Stack.Screen
                    name="language"
                    options={{
                        headerShown: false,
                    }}
                />
            </Stack>
        </>
    );
}
