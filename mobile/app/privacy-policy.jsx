import React from 'react';
import {
    View, Text, ScrollView, StyleSheet, TouchableOpacity, SafeAreaView, StatusBar
} from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

export default function PrivacyPolicyScreen() {
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
                    {t('privacyPolicy')}
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

                <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
                    1. Information We Collect
                </Text>
                <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
                    SafiraJobs collects the following information when you use our app:{'\n\n'}
                    • <Text style={{ fontWeight: '600' }}>Account Information:</Text> Email address, name, and password when you create an account.{'\n'}
                    • <Text style={{ fontWeight: '600' }}>Profile Information:</Text> Phone number, company name, and other details you choose to provide.{'\n'}
                    • <Text style={{ fontWeight: '600' }}>CV/Resume Data:</Text> Education, work experience, skills, and other information you enter in the CV Builder.{'\n'}
                    • <Text style={{ fontWeight: '600' }}>Usage Data:</Text> Job searches, bookmarks, and application activity within the app.{'\n'}
                    • <Text style={{ fontWeight: '600' }}>Device Information:</Text> Device type and push notification tokens for sending alerts.
                </Text>

                <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
                    2. How We Use Your Information
                </Text>
                <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
                    We use the information we collect to:{'\n\n'}
                    • Provide and maintain the SafiraJobs service{'\n'}
                    • Send you relevant job alerts and notifications{'\n'}
                    • Improve and personalize your experience{'\n'}
                    • Generate your CV/resume documents{'\n'}
                    • Communicate with you about your account
                </Text>

                <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
                    3. Data Sharing
                </Text>
                <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
                    We do NOT sell your personal information to third parties. Your data may be shared only in the following cases:{'\n\n'}
                    • When you apply to a job, your application information is shared with the employer{'\n'}
                    • With service providers that help us operate the app (hosting, databases){'\n'}
                    • When required by law or legal process
                </Text>

                <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
                    4. Data Storage & Security
                </Text>
                <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
                    Your data is stored securely on encrypted servers. We use industry-standard security measures to protect your information, including HTTPS encryption for all data transfers. Passwords are hashed and never stored in plain text.
                </Text>

                <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
                    5. Your Rights
                </Text>
                <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
                    You have the right to:{'\n\n'}
                    • Access your personal data{'\n'}
                    • Update or correct your information{'\n'}
                    • Delete your account and all associated data{'\n'}
                    • Opt out of push notifications{'\n'}
                    • Request a copy of your data
                </Text>

                <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
                    6. Account Deletion
                </Text>
                <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
                    You can delete your account at any time from the Profile screen. When you delete your account, all your personal data, applications, bookmarks, CV data, and device tokens are permanently removed from our servers.
                </Text>

                <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
                    7. Children's Privacy
                </Text>
                <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
                    SafiraJobs is not intended for children under 16. We do not knowingly collect information from children under 16. If we learn that we have collected information from a child under 16, we will delete that information immediately.
                </Text>

                <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
                    8. Changes to This Policy
                </Text>
                <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
                    We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy in the app and updating the "Last Updated" date.
                </Text>

                <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
                    9. Contact Us
                </Text>
                <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
                    If you have any questions about this Privacy Policy, please contact us at:{'\n\n'}
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
