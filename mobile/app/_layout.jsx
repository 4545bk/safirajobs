import { useEffect, useRef } from 'react';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { colors } from '../styles/global';
import {
    registerForPushNotifications,
    registerTokenWithBackend,
    addNotificationReceivedListener,
    addNotificationResponseListener,
} from '../services/notifications';

export default function RootLayout() {
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

    return (
        <>
            <StatusBar style="light" />
            <Stack
                screenOptions={{
                    headerStyle: {
                        backgroundColor: colors.background,
                    },
                    headerTintColor: colors.text,
                    headerTitleStyle: {
                        fontWeight: '600',
                    },
                    contentStyle: {
                        backgroundColor: colors.background,
                    },
                }}
            >
                <Stack.Screen
                    name="index"
                    options={{
                        title: 'SafiraJobs',
                        headerShown: true,
                    }}
                />
                <Stack.Screen
                    name="job/[id]"
                    options={{
                        title: 'Job Details',
                        headerBackTitle: 'Back',
                    }}
                />
            </Stack>
        </>
    );
}
