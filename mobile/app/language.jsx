/**
 * Language Selection Screen
 */

import React from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, SafeAreaView, StatusBar
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons, Feather } from '@expo/vector-icons';
import { borderRadius } from '../theme';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import AnimatedEntry from '../components/AnimatedEntry';

const LANGUAGES = [
    { code: 'en', name: 'English', native: 'English', flag: '🇬🇧' },
    { code: 'am', name: 'Amharic', native: 'አማርኛ', flag: '🇪🇹' },
    { code: 'om', name: 'Oromiffa', native: 'Afaan Oromoo', flag: '🌳' },
];

export default function LanguageScreen() {
    const router = useRouter();
    const { colors, isDark } = useTheme();
    const { language, changeLanguage, t } = useLanguage();

    const handleSelect = async (code) => {
        await changeLanguage(code);
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={colors.surface} />

            {/* Header */}
            <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.borderLight }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
                </TouchableOpacity>
                <Text style={[styles.title, { color: colors.textPrimary }]}>{t('language')}</Text>
                <View style={{ width: 40 }} />
            </View>

            <View style={styles.content}>
                <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Select your preferred language</Text>

                <View style={styles.list}>
                    {LANGUAGES.map((lang, index) => (
                        <AnimatedEntry key={lang.code} delay={index * 100}>
                            <TouchableOpacity
                                style={[
                                    styles.item,
                                    {
                                        backgroundColor: colors.surface,
                                        borderColor: language === lang.code ? colors.primary : 'transparent',
                                        borderWidth: 2,
                                        shadowColor: colors.shadowColor || '#000'
                                    }
                                ]}
                                onPress={() => handleSelect(lang.code)}
                                activeOpacity={0.9}
                            >
                                <View style={[styles.flagBox, { backgroundColor: language === lang.code ? colors.primary + '20' : colors.surfaceHover }]}>
                                    <Text style={styles.flag}>{lang.flag}</Text>
                                </View>

                                <View style={styles.info}>
                                    <Text style={[
                                        styles.langName,
                                        { color: colors.textPrimary },
                                        language === lang.code && { color: colors.primary, fontWeight: '700' }
                                    ]}>{lang.name}</Text>
                                    <Text style={[styles.langNative, { color: colors.textSecondary }]}>{lang.native}</Text>
                                </View>

                                {language === lang.code && (
                                    <View style={[styles.checkCircle, { backgroundColor: colors.primary }]}>
                                        <Feather name="check" size={16} color="white" />
                                    </View>
                                )}
                            </TouchableOpacity>
                        </AnimatedEntry>
                    ))}
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 16, paddingTop: 16, paddingBottom: 16,
        borderBottomWidth: 1
    },
    backBtn: { padding: 8 },
    title: { fontSize: 18, fontWeight: '600' },
    content: { padding: 20 },
    subtitle: {
        fontSize: 14, marginBottom: 20,
    },
    list: {
        gap: 16
    },
    item: {
        flexDirection: 'row', alignItems: 'center',
        padding: 16,
        borderRadius: 16,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    flagBox: {
        width: 50, height: 50, borderRadius: 25,
        alignItems: 'center', justifyContent: 'center',
        marginRight: 16,
    },
    flag: { fontSize: 24 },
    info: { flex: 1 },
    langName: { fontSize: 16, fontWeight: '500', marginBottom: 4 },
    langNative: { fontSize: 13 },
    checkCircle: {
        width: 24, height: 24, borderRadius: 12,
        alignItems: 'center', justifyContent: 'center'
    }
});
