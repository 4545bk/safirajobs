/**
 * CV Builder Layout
 * Wraps all CV screens with shared context
 */

import { Stack } from 'expo-router';
import { CVProvider } from '../../context/CVContext';
import { colors } from '../../theme';

export default function CVLayout() {
    return (
        <CVProvider>
            <Stack
                screenOptions={{
                    headerShown: false,
                    animation: 'slide_from_right',
                    contentStyle: {
                        backgroundColor: colors.background,
                    },
                }}
            />
        </CVProvider>
    );
}
