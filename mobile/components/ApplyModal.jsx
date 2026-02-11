/**
 * Apply Modal Component - Enhanced Hybrid Apply
 * - Ethiopian jobs: In-app form → sends email with CV to employer
 * - External jobs: Track + open external apply URL
 * - Both: Show success with next steps
 */

import React, { useState, useEffect } from 'react';
import {
    View, Text, Modal, StyleSheet, TouchableOpacity,
    TextInput, ScrollView, Alert, ActivityIndicator
} from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { Feather } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { useTheme } from '../context/ThemeContext';
import { trackApplication, submitApplication } from '../services/applications';
import { trackApplyClick } from '../services/analytics';
import { saveApplyProfile, loadApplyProfile, saveResumeInfo, loadResumeInfo } from '../services/applyProfile';

const ApplyModal = ({ visible, onClose, job, onApplicationSubmitted, deviceToken }) => {
    const { colors, isDark } = useTheme();
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState('confirm'); // 'confirm' | 'form' | 'success' | 'email_success'
    const [resume, setResume] = useState(null);
    const [coverLetter, setCoverLetter] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [applyResult, setApplyResult] = useState(null);
    const [profileLoaded, setProfileLoaded] = useState(false);

    // Auto-load saved profile when modal opens
    useEffect(() => {
        if (visible && !profileLoaded) {
            loadSavedProfile();
        }
        if (!visible) {
            setProfileLoaded(false);
        }
    }, [visible]);

    const loadSavedProfile = async () => {
        try {
            const profile = await loadApplyProfile();
            if (profile) {
                if (profile.email) setEmail(profile.email);
                if (profile.phone) setPhone(profile.phone);
            }
            const savedResume = await loadResumeInfo();
            if (savedResume && savedResume.name) {
                setResume({
                    name: savedResume.name,
                    uri: savedResume.uri,
                    mimeType: savedResume.mimeType,
                    _saved: true, // Flag to know it's from storage
                });
            }
            setProfileLoaded(true);
        } catch (err) {
            console.warn('Failed to load profile:', err);
            setProfileLoaded(true);
        }
    };

    // Save profile after successful application
    const saveProfileData = async () => {
        try {
            await saveApplyProfile({ email, phone });
            if (resume && !resume._saved) {
                await saveResumeInfo({
                    name: resume.name,
                    uri: resume.uri,
                    mimeType: resume.mimeType,
                });
            }
        } catch (err) {
            console.warn('Failed to save profile:', err);
        }
    };

    // Check if it's an Ethiopian/local job (can apply in-app)
    const isEthiopianJob = !job?.applyUrl ||
        job?.source === 'ethiopian' ||
        job?.source === 'ethio-job-api' ||
        job?.source === 'local' ||
        job?.location?.toLowerCase()?.includes('ethiopia');

    const resetForm = () => {
        setStep('confirm');
        setResume(null);
        setCoverLetter('');
        setPhone('');
        setEmail('');
        setApplyResult(null);
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    // Handle external job apply - Track & open URL
    const handleExternalApply = async () => {
        setLoading(true);
        try {
            // Track the application (optional, continues even if fails)
            try {
                await trackApplication({
                    jobId: job._id || job.id,
                    jobTitle: job.title,
                    company: job.organization,
                    status: 'applied',
                    appliedDate: new Date().toISOString(),
                    source: job.source || 'external',
                    applyUrl: job.applyUrl,
                });
                trackApplyClick(job._id || job.id, 'external');
            } catch (err) {
                console.warn('Tracking failed but opening URL:', err);
            }

            // Open in-app browser
            if (job.applyUrl) {
                let url = job.applyUrl.trim();

                // Ensure valid URL format
                if (!/^https?:\/\//i.test(url)) {
                    url = 'https://' + url;
                }

                // Validate URL structure
                try {
                    new URL(url);
                } catch (urlError) {
                    Alert.alert(
                        'Invalid Link',
                        'The application link for this job appears to be invalid. Would you like to search for this job instead?',
                        [
                            { text: 'Cancel', style: 'cancel' },
                            {
                                text: 'Search',
                                onPress: () => {
                                    const searchQuery = encodeURIComponent(`${job.title} ${job.organization} apply`);
                                    WebBrowser.openBrowserAsync(`https://www.google.com/search?q=${searchQuery}`);
                                }
                            }
                        ]
                    );
                    return;
                }

                console.log('Opening Apply URL:', url);
                await WebBrowser.openBrowserAsync(url);
            } else {
                // No apply URL - offer to search for the job
                Alert.alert(
                    'No Application Link',
                    `No direct link available. Would you like to search for "${job.title}" at ${job.organization}?`,
                    [
                        { text: 'Cancel', style: 'cancel' },
                        {
                            text: 'Search Online',
                            onPress: () => {
                                const searchQuery = encodeURIComponent(`${job.title} ${job.organization} apply`);
                                WebBrowser.openBrowserAsync(`https://www.google.com/search?q=${searchQuery}`);
                            }
                        }
                    ]
                );
            }

            setStep('success');
            onApplicationSubmitted?.();
        } catch (error) {
            console.error('External apply error:', error);
            Alert.alert('Error', 'Could not open the application link. Please try again.');
            handleClose();
        } finally {
            setLoading(false);
        }
    };

    // Handle resume/CV picker
    const handlePickResume = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: ['application/pdf', 'application/msword',
                    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
                copyToCacheDirectory: true,
            });

            if (!result.canceled && result.assets?.[0]) {
                setResume(result.assets[0]);
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to pick document');
        }
    };

    // Handle in-app apply with email sending
    const handleInAppApply = async () => {
        if (!email.trim()) {
            Alert.alert('Required', 'Please enter your email address');
            return;
        }

        setLoading(true);
        try {
            // Read resume as base64 if exists
            let resumeBase64 = null;
            if (resume?.uri) {
                try {
                    resumeBase64 = await FileSystem.readAsStringAsync(resume.uri, {
                        encoding: FileSystem.EncodingType.Base64,
                    });
                    // Add data URI prefix
                    const mimeType = resume.mimeType || 'application/pdf';
                    resumeBase64 = `data:${mimeType};base64,${resumeBase64}`;
                } catch (err) {
                    console.warn('Failed to read resume:', err);
                }
            }

            // Submit via new API
            const result = await submitApplication({
                deviceToken: deviceToken || 'anonymous',
                jobId: job._id || job.id,
                applicantName: email.split('@')[0], // Use email prefix as name fallback
                applicantEmail: email,
                applicantPhone: phone,
                coverLetter,
                resumeBase64,
                resumeName: resume?.name,
            });

            setApplyResult(result);

            if (result.success) {
                // Save profile for auto-fill next time!
                await saveProfileData();

                if (result.data?.emailSent) {
                    setStep('email_success'); // Email was sent to employer!
                } else {
                    setStep('success'); // Tracked, but needs external apply
                }
                onApplicationSubmitted?.();
            } else if (result.error === 'Already applied to this job') {
                Alert.alert('Already Applied', 'You have already applied to this job.');
                handleClose();
            } else {
                // Fallback - just track locally
                await trackApplication({
                    jobId: job._id || job.id,
                    jobTitle: job.title,
                    company: job.organization,
                    status: 'applied',
                    appliedDate: new Date().toISOString(),
                    source: 'in-app',
                    applicantEmail: email,
                    applicantPhone: phone,
                    hasResume: !!resume,
                    coverLetter,
                    appliedInApp: true,
                });
                setStep('success');
                onApplicationSubmitted?.();
            }

            // Track analytics
            trackApplyClick(job._id || job.id, 'internal_form');
        } catch (error) {
            console.error('Failed to submit application:', error);
            Alert.alert('Error', 'Failed to submit application. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Render confirmation step
    const renderConfirmation = () => (
        <View style={styles.content}>
            <View style={[styles.iconContainer, { backgroundColor: isDark ? colors.surfaceHover : '#EBF5FF' }]}>
                <Feather name="briefcase" size={40} color={colors.primary} />
            </View>

            <Text style={[styles.title, { color: colors.textPrimary }]}>Apply to this position?</Text>
            <Text style={[styles.jobTitle, { color: colors.primary }]}>{job?.title}</Text>
            <Text style={[styles.company, { color: colors.textSecondary }]}>at {job?.organization}</Text>

            {isEthiopianJob ? (
                <View style={[styles.infoBox, { backgroundColor: isDark ? colors.surfaceHover : '#ECFDF5' }]}>
                    <Feather name="mail" size={16} color="#10B981" />
                    <Text style={[styles.infoText, { color: isDark ? '#6EE7B7' : '#065F46' }]}>
                        Apply directly! We'll send your CV and details to the employer via email.
                    </Text>
                </View>
            ) : (
                <View style={[styles.infoBox, { backgroundColor: isDark ? colors.surfaceHover : '#F3F4F6' }]}>
                    <Feather name="external-link" size={16} color={colors.textSecondary} />
                    <Text style={[styles.infoText, { color: colors.textSecondary }]}>
                        You'll be redirected to the company's website to complete your application.
                    </Text>
                </View>
            )}

            <View style={styles.buttonRow}>
                <TouchableOpacity style={[styles.cancelBtn, { borderColor: colors.border }]} onPress={handleClose}>
                    <Text style={[styles.cancelBtnText, { color: colors.textSecondary }]}>Cancel</Text>
                </TouchableOpacity>

                {isEthiopianJob ? (
                    <TouchableOpacity
                        style={[styles.applyBtn, { backgroundColor: '#10B981' }]}
                        onPress={() => {
                            trackApplyClick(job._id || job.id, 'internal_form');
                            setStep('form');
                        }}
                    >
                        <Feather name="edit-3" size={18} color="white" />
                        <Text style={styles.applyBtnText}>Fill & Apply</Text>
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity
                        style={[styles.applyBtn, { backgroundColor: colors.primary }]}
                        onPress={handleExternalApply}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator size="small" color="white" />
                        ) : (
                            <>
                                <Feather name="external-link" size={18} color="white" />
                                <Text style={styles.applyBtnText}>Apply & Track</Text>
                            </>
                        )}
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );

    // Render in-app application form
    const renderForm = () => (
        <ScrollView style={styles.formScroll} showsVerticalScrollIndicator={false}>
            <View style={styles.content}>
                <Text style={[styles.title, { color: colors.textPrimary }]}>Apply for Position</Text>
                <Text style={[styles.jobTitle, { color: colors.primary }]}>{job?.title}</Text>
                <Text style={[styles.company, { color: colors.textSecondary }]}>at {job?.organization}</Text>

                {profileLoaded && email && (
                    <View style={[styles.infoBox, { backgroundColor: isDark ? colors.surfaceHover : '#ECFDF5', marginBottom: 12 }]}>
                        <Feather name="check-circle" size={14} color="#10B981" />
                        <Text style={[styles.infoText, { color: isDark ? '#6EE7B7' : '#065F46', fontSize: 12 }]}>
                            Profile auto-filled! Edit any field if needed.
                        </Text>
                    </View>
                )}

                <View style={styles.form}>
                    {/* Email */}
                    <View style={styles.field}>
                        <Text style={[styles.label, { color: colors.textSecondary }]}>Email *</Text>
                        <TextInput
                            style={[styles.input, { borderColor: colors.border, backgroundColor: isDark ? colors.background : '#FAFAFA', color: colors.textPrimary }]}
                            placeholder="your.email@example.com"
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            placeholderTextColor={colors.textMuted}
                        />
                    </View>

                    {/* Phone */}
                    <View style={styles.field}>
                        <Text style={[styles.label, { color: colors.textSecondary }]}>Phone Number</Text>
                        <TextInput
                            style={[styles.input, { borderColor: colors.border, backgroundColor: isDark ? colors.background : '#FAFAFA', color: colors.textPrimary }]}
                            placeholder="+251 9XX XXX XXX"
                            value={phone}
                            onChangeText={setPhone}
                            keyboardType="phone-pad"
                            placeholderTextColor={colors.textMuted}
                        />
                    </View>

                    {/* Resume/CV */}
                    <View style={styles.field}>
                        <Text style={[styles.label, { color: colors.textSecondary }]}>Resume/CV</Text>
                        <TouchableOpacity
                            style={[styles.uploadBtn, { borderColor: colors.primary, backgroundColor: isDark ? colors.surfaceHover : '#F0F7FF' }]}
                            onPress={handlePickResume}
                        >
                            <Feather name="upload" size={20} color={colors.primary} />
                            <Text style={[styles.uploadBtnText, { color: colors.primary }]}>
                                {resume ? resume.name : 'Upload PDF or Word document'}
                            </Text>
                        </TouchableOpacity>
                        {resume && (
                            <TouchableOpacity style={styles.removeFile} onPress={() => setResume(null)}>
                                <Text style={styles.removeFileText}>Remove file</Text>
                            </TouchableOpacity>
                        )}
                    </View>

                    {/* Cover Letter */}
                    <View style={styles.field}>
                        <Text style={[styles.label, { color: colors.textSecondary }]}>Cover Letter (Optional)</Text>
                        <TextInput
                            style={[styles.input, styles.textArea, { borderColor: colors.border, backgroundColor: isDark ? colors.background : '#FAFAFA', color: colors.textPrimary }]}
                            placeholder="Tell us why you're a great fit for this position..."
                            value={coverLetter}
                            onChangeText={setCoverLetter}
                            multiline
                            numberOfLines={4}
                            textAlignVertical="top"
                            placeholderTextColor={colors.textMuted}
                        />
                    </View>
                </View>

                <View style={styles.buttonRow}>
                    <TouchableOpacity style={[styles.cancelBtn, { borderColor: colors.border }]} onPress={() => setStep('confirm')}>
                        <Text style={[styles.cancelBtnText, { color: colors.textSecondary }]}>Back</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.applyBtn, { backgroundColor: '#10B981' }]}
                        onPress={handleInAppApply}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator size="small" color="white" />
                        ) : (
                            <>
                                <Feather name="send" size={18} color="white" />
                                <Text style={styles.applyBtnText}>Submit Application</Text>
                            </>
                        )}
                    </TouchableOpacity>
                </View>
            </View>
        </ScrollView>
    );

    // Render email sent success
    const renderEmailSuccess = () => (
        <View style={styles.content}>
            <View style={[styles.iconContainer, { backgroundColor: '#D1FAE5' }]}>
                <Feather name="mail" size={40} color="#10B981" />
            </View>

            <Text style={[styles.successTitle, { color: colors.textPrimary }]}>Application Sent! ✉️</Text>
            <Text style={[styles.successText, { color: colors.textSecondary }]}>
                Your application has been emailed directly to {job?.organization}. They will review your CV and contact you!
            </Text>

            <View style={[styles.successDetail, { backgroundColor: isDark ? colors.surfaceHover : '#ECFDF5' }]}>
                <Feather name="check-circle" size={16} color="#10B981" />
                <Text style={[styles.successDetailText, { color: '#065F46' }]}>
                    Confirmation email sent to {email}
                </Text>
            </View>

            {applyResult?.data?.hasApplyUrl && (
                <TouchableOpacity
                    style={[styles.secondaryBtn, { borderColor: colors.primary }]}
                    onPress={async () => {
                        if (applyResult.data.applyUrl) {
                            await Linking.openURL(applyResult.data.applyUrl);
                        }
                    }}
                >
                    <Feather name="external-link" size={16} color={colors.primary} />
                    <Text style={[styles.secondaryBtnText, { color: colors.primary }]}>
                        Also apply on website
                    </Text>
                </TouchableOpacity>
            )}

            <TouchableOpacity style={[styles.doneBtn, { backgroundColor: '#10B981' }]} onPress={handleClose}>
                <Text style={styles.doneBtnText}>Done</Text>
            </TouchableOpacity>
        </View>
    );

    // Render tracked success (no email sent)
    const renderSuccess = () => (
        <View style={styles.content}>
            <View style={[styles.iconContainer, { backgroundColor: isDark ? 'rgba(16, 185, 129, 0.2)' : '#D1FAE5' }]}>
                <Feather name="check-circle" size={40} color="#10B981" />
            </View>

            <Text style={[styles.successTitle, { color: colors.textPrimary }]}>Application Tracked! 🎉</Text>
            <Text style={[styles.successText, { color: colors.textSecondary }]}>
                Your application to {job?.organization} has been saved.
                {job?.applyUrl ? ' Complete your application on their website.' : ''}
            </Text>

            {job?.applyUrl && (
                <TouchableOpacity
                    style={[styles.applyBtn, { backgroundColor: colors.primary, width: '100%', marginBottom: 12 }]}
                    onPress={() => Linking.openURL(job.applyUrl)}
                >
                    <Feather name="external-link" size={18} color="white" />
                    <Text style={styles.applyBtnText}>Complete on Website</Text>
                </TouchableOpacity>
            )}

            <TouchableOpacity style={[styles.doneBtn, { backgroundColor: '#6B7280' }]} onPress={handleClose}>
                <Text style={styles.doneBtnText}>Done</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={handleClose}
        >
            <View style={styles.overlay}>
                <View style={[styles.modal, { backgroundColor: colors.surface }]}>
                    <TouchableOpacity style={styles.closeBtn} onPress={handleClose}>
                        <Feather name="x" size={24} color={colors.textSecondary} />
                    </TouchableOpacity>

                    {step === 'confirm' && renderConfirmation()}
                    {step === 'form' && renderForm()}
                    {step === 'success' && renderSuccess()}
                    {step === 'email_success' && renderEmailSuccess()}
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modal: {
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        maxHeight: '85%',
        minHeight: 300,
    },
    closeBtn: {
        position: 'absolute',
        top: 16,
        right: 16,
        zIndex: 10,
        padding: 4,
    },
    content: {
        padding: 24,
        paddingTop: 40,
        alignItems: 'center',
    },
    formScroll: {
        maxHeight: '100%',
    },
    iconContainer: {
        width: 72,
        height: 72,
        borderRadius: 36,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
        marginBottom: 8,
    },
    jobTitle: {
        fontSize: 16,
        fontWeight: '600',
        textAlign: 'center',
    },
    company: {
        fontSize: 14,
        marginBottom: 20,
    },
    infoBox: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 10,
        marginBottom: 24,
        gap: 10,
    },
    infoText: {
        flex: 1,
        fontSize: 13,
        lineHeight: 18,
    },
    buttonRow: {
        flexDirection: 'row',
        gap: 12,
        width: '100%',
    },
    cancelBtn: {
        flex: 1,
        padding: 14,
        borderRadius: 12,
        borderWidth: 1,
        alignItems: 'center',
    },
    cancelBtnText: {
        fontSize: 15,
        fontWeight: '600',
    },
    applyBtn: {
        flex: 1,
        flexDirection: 'row',
        padding: 14,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    applyBtnText: {
        fontSize: 15,
        fontWeight: '600',
        color: 'white',
    },
    form: {
        width: '100%',
        marginBottom: 20,
    },
    field: {
        marginBottom: 16,
    },
    label: {
        fontSize: 13,
        fontWeight: '500',
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderRadius: 12,
        padding: 14,
        fontSize: 15,
    },
    textArea: {
        height: 100,
        textAlignVertical: 'top',
    },
    uploadBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        borderWidth: 1,
        borderStyle: 'dashed',
        borderRadius: 12,
        padding: 16,
    },
    uploadBtnText: {
        flex: 1,
        fontSize: 14,
    },
    removeFile: {
        marginTop: 8,
    },
    removeFileText: {
        fontSize: 13,
        color: '#EF4444',
    },
    successTitle: {
        fontSize: 22,
        fontWeight: '700',
        marginBottom: 12,
    },
    successText: {
        fontSize: 14,
        textAlign: 'center',
        marginBottom: 20,
        lineHeight: 20,
    },
    successDetail: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 10,
        gap: 8,
        marginBottom: 16,
        width: '100%',
    },
    successDetailText: {
        fontSize: 13,
        flex: 1,
    },
    secondaryBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 14,
        borderRadius: 12,
        borderWidth: 1.5,
        gap: 8,
        width: '100%',
        marginBottom: 12,
    },
    secondaryBtnText: {
        fontSize: 15,
        fontWeight: '600',
    },
    doneBtn: {
        width: '100%',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    doneBtnText: {
        fontSize: 16,
        fontWeight: '600',
        color: 'white',
    },
});

export default ApplyModal;
