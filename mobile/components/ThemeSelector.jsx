import React, { useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Pressable } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { LinearGradient } from 'expo-linear-gradient';

const ThemeOption = ({ title, icon, isActive, color, onPress }) => {
    const scaleAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        Animated.spring(scaleAnim, {
            toValue: isActive ? 1.05 : 1,
            friction: 5,
            useNativeDriver: true
        }).start();
    }, [isActive]);

    return (
        <Pressable
            onPress={onPress}
            style={({ pressed }) => [
                { opacity: pressed ? 0.9 : 1, flex: 1 },
                styles.optionWrapper
            ]}
        >
            <Animated.View style={[
                styles.optionCard,
                {
                    transform: [{ scale: scaleAnim }],
                    borderColor: isActive ? color : 'transparent',
                    borderWidth: 2,
                    backgroundColor: isActive ? color + '10' : '#F3F4F6' // Slight tint or grey
                }
            ]}>
                <LinearGradient
                    colors={isActive ? [color + '20', color + '05'] : ['#E5E7EB', '#F3F4F6']}
                    style={styles.gradientBg}
                >
                    <View style={[styles.iconCircle, { backgroundColor: isActive ? color : '#9CA3AF' }]}>
                        <Feather name={icon} size={24} color="white" />
                    </View>
                    <Text style={[styles.optionTitle, { color: isActive ? color : '#6B7280' }]}>
                        {title}
                    </Text>
                    {isActive && (
                        <View style={[styles.checkBadge, { backgroundColor: color }]}>
                            <Feather name="check" size={12} color="white" />
                        </View>
                    )}
                </LinearGradient>
            </Animated.View>
        </Pressable>
    );
};

export default function ThemeSelector() {
    const { isDark, toggleTheme, colors } = useTheme();
    const { t } = useLanguage();

    return (
        <View style={styles.container}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>{t('theme')}</Text>
            <View style={styles.row}>
                <ThemeOption
                    title={t('lightMode')}
                    icon="sun"
                    isActive={!isDark}
                    color="#F59E0B" // Amber/Orange for sun
                    onPress={() => isDark && toggleTheme()}
                />
                <View style={{ width: 16 }} />
                <ThemeOption
                    title={t('darkMode')}
                    icon="moon"
                    isActive={isDark}
                    color="#6366F1" // Indigo for moon
                    onPress={() => !isDark && toggleTheme()}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 12,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    optionWrapper: {
        height: 100,
    },
    optionCard: {
        flex: 1,
        borderRadius: 16,
        overflow: 'hidden',
        height: '100%',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    gradientBg: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 12,
    },
    iconCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
    },
    optionTitle: {
        fontSize: 14,
        fontWeight: '600',
    },
    checkBadge: {
        position: 'absolute',
        top: 8,
        right: 8,
        width: 20,
        height: 20,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    }
});
