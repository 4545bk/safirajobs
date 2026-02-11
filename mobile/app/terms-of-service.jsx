import React from 'react';
import {
    View, Text, ScrollView, StyleSheet, TouchableOpacity, SafeAreaView, StatusBar
} from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

export default function TermsOfServiceScreen() {
    const router = useRouter();
    const { colors, isDark } = useTheme();
    const { t } = useLanguage();

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />

            {/* Header */}
            <View style={[styles.header, { borderBottomColor: colors.borderLight }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Feather name="arrow-left" size={24} color={colors.textPrimary} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
                    {t('termsOfService')}
                </Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView
                style={styles.content}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <Text style={[styles.lastUpdated, { color: colors.textMuted }]}>
                    Last Updated: February 11, 2026
                </Text>

                <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
                    By using SafiraJobs, you agree to these Terms of Service. Please read them carefully.
                </Text>

                <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
                    1. Acceptance of Terms
                </Text>
                <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
                    By creating an account or using SafiraJobs, you agree to be bound by these Terms of Service and our Privacy Policy. If you do not agree, do not use the application.
                </Text>

                <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
                    2. Description of Service
                </Text>
                <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
                    SafiraJobs is a job search and recruitment platform that aggregates job listings from multiple sources including ReliefWeb, RemoteOK, Remotive, and other job boards. We also provide a CV/Resume builder and job application tracking tools.
                </Text>

                <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
                    3. User Accounts
                </Text>
                <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
                    • You must provide accurate and complete information when creating an account{'\n'}
                    • You are responsible for maintaining the security of your account credentials{'\n'}
                    • You must be at least 16 years old to use SafiraJobs{'\n'}
                    • One person may maintain only one account
                </Text>

                <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
                    4. Acceptable Use
                </Text>
                <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
                    You agree NOT to:{'\n\n'}
                    • Post false, misleading, or fraudulent job listings{'\n'}
                    • Use the app for any illegal purpose{'\n'}
                    • Attempt to access other users' accounts{'\n'}
                    • Scrape or automatically collect data from the platform{'\n'}
                    • Upload malicious content or attempt to disrupt the service
                </Text>

                <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
                    5. Job Listings Disclaimer
                </Text>
                <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
                    Job listings on SafiraJobs are aggregated from third-party sources. We do not guarantee the accuracy, completeness, or availability of any job listing. SafiraJobs is not responsible for the content of external job postings or the hiring decisions of employers.
                </Text>

                <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
                    6. Intellectual Property
                </Text>
                <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
                    The SafiraJobs app, including its design, logo, and features, is the property of SafiraJobs. You may not copy, modify, or distribute any part of the application without permission.
                </Text>

                <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
                    7. Account Termination
                </Text>
                <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
                    You may delete your account at any time from the Profile settings. We reserve the right to suspend or terminate accounts that violate these terms.
                </Text>

                <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
                    8. Limitation of Liability
                </Text>
                <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
                    SafiraJobs is provided "as is" without warranties of any kind. We are not liable for any damages arising from your use of the application, including but not limited to lost opportunities, data loss, or service interruptions.
                </Text>

                <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
                    9. Changes to Terms
                </Text>
                <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
                    We reserve the right to modify these terms at any time. Continued use of the app after changes constitutes acceptance of the new terms.
                </Text>

                <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
                    10. Contact
                </Text>
                <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
                    For questions about these Terms, contact us at:{'\n\n'}
                    Email: support@safirajobs.com
                </Text>

                <View style={{ height: 40 }} />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderBottomWidth: 1,
    },
    backBtn: { width: 40, height: 40, justifyContent: 'center' },
    headerTitle: { fontSize: 18, fontWeight: '700' },
    content: { flex: 1 },
    scrollContent: { padding: 20 },
    lastUpdated: { fontSize: 13, marginBottom: 20, fontStyle: 'italic' },
    sectionTitle: { fontSize: 16, fontWeight: '700', marginTop: 20, marginBottom: 8 },
    paragraph: { fontSize: 14, lineHeight: 22 },
});
