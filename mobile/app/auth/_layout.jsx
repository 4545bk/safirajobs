import { Stack } from 'expo-router';

export default function AuthLayout() {
    return (
        <Stack
            screenOptions={{
                headerShown: false,
                animation: 'fade',
                contentStyle: {
                    backgroundColor: '#FFFFFF',
                },
            }}
        >
            <Stack.Screen name="welcome" />
            <Stack.Screen name="signup" />
            <Stack.Screen name="login" />
        </Stack>
    );
}
