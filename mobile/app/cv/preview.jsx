/**
 * CV Builder - Final Preview Screen
 * Shows full CV preview with premium animations
 */

import React, { useState, useRef, useEffect } from 'react';
import {
    View, Text, TouchableOpacity, StyleSheet, SafeAreaView, StatusBar,
    Alert, ActivityIndicator, Animated, Easing
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { WebView } from 'react-native-webview';
import { Feather } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography } from '../../theme';
import { useCV } from '../../context/CVContext';
import { generateTemplateHTML } from '../../services/cvTemplates';
import { printToFileAsync } from 'expo-print';
import { shareAsync } from 'expo-sharing';

export default function PreviewScreen() {
    const router = useRouter();
    const { template: templateParam } = useLocalSearchParams();
    const { cvData } = useCV();
    const [isGenerating, setIsGenerating] = useState(false);
    const [webViewLoading, setWebViewLoading] = useState(true);

    // Animation refs
    const headerAnim = useRef(new Animated.Value(0)).current;
    const previewAnim = useRef(new Animated.Value(0)).current;
    const actionsAnim = useRef(new Animated.Value(0)).current;
    const loadingAnim = useRef(new Animated.Value(0)).current;
    const pulseAnim = useRef(new Animated.Value(1)).current;

    const selectedTemplate = templateParam || 'classic-teal';
    const html = generateTemplateHTML(cvData, selectedTemplate);

    // Template display names
    const templateNames = {
        'classic-teal': 'Classic Teal',
        'modern-amber': 'Modern Amber',
        'professional-navy': 'Professional Navy',
        'clean-minimal': 'Clean Minimal',
        'elegant-gray': 'Elegant Gray',
        'creative-split': 'Creative Split',
        'minimal-red': 'Minimal Red',
        'modern-sections': 'Modern Sections',
        'pink-creative': 'Pink Creative',
        'teal-sidebar': 'Teal Sidebar',
        'blue-header': 'Blue Header',
    };

    // Entrance animations
    useEffect(() => {
        Animated.stagger(100, [
            Animated.timing(headerAnim, { toValue: 1, duration: 400, useNativeDriver: true, easing: Easing.out(Easing.cubic) }),
            Animated.spring(previewAnim, { toValue: 1, tension: 50, friction: 10, useNativeDriver: true }),
            Animated.spring(actionsAnim, { toValue: 1, tension: 50, friction: 10, useNativeDriver: true }),
        ]).start();

        // Loading pulse animation
        const pulse = Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, { toValue: 1.1, duration: 800, useNativeDriver: true, easing: Easing.inOut(Easing.ease) }),
                Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true, easing: Easing.inOut(Easing.ease) }),
            ])
        );
        pulse.start();
        return () => pulse.stop();
    }, []);

    // WebView loaded animation
    useEffect(() => {
        if (!webViewLoading) {
            Animated.timing(loadingAnim, { toValue: 1, duration: 300, useNativeDriver: true }).start();
        }
    }, [webViewLoading]);

    const handleDownload = async () => {
        setIsGenerating(true);
        try {
            // Generate PDF from HTML
            const { uri } = await printToFileAsync({
                html,
                base64: false
            });

            // Share the generated PDF
            await shareAsync(uri, {
                UTI: '.pdf',
                mimeType: 'application/pdf',
                dialogTitle: `Share your CV - ${cvData?.personalInfo?.firstName || 'My CV'}`
            });

        } catch (error) {
            console.error('PDF Generation Error:', error);
            Alert.alert('Error', 'Failed to generate or share PDF. Please try again.');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleChangeTemplate = () => {
        router.push('/cv/templates');
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

            {/* Animated Header */}
            <Animated.View style={[
                styles.header,
                {
                    opacity: headerAnim,
                    transform: [{ translateY: headerAnim.interpolate({ inputRange: [0, 1], outputRange: [-20, 0] }) }]
                }
            ]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
                    <Feather name="chevron-left" size={24} color={colors.textPrimary} />
                </TouchableOpacity>
                <View style={styles.headerCenter}>
                    <Text style={styles.headerTitle}>Preview</Text>
                    <View style={styles.templateBadge}>
                        <Feather name="layout" size={12} color={colors.primary} />
                        <Text style={styles.templateName}>{templateNames[selectedTemplate] || 'Template'}</Text>
                    </View>
                </View>
                <TouchableOpacity onPress={handleChangeTemplate} style={styles.changeBtn} activeOpacity={0.7}>
                    <Feather name="grid" size={20} color={colors.primary} />
                </TouchableOpacity>
            </Animated.View>

            {/* Animated WebView Preview */}
            <Animated.View style={[
                styles.webViewContainer,
                {
                    opacity: previewAnim,
                    transform: [
                        { scale: previewAnim.interpolate({ inputRange: [0, 1], outputRange: [0.95, 1] }) },
                        { translateY: previewAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }
                    ]
                }
            ]}>
                {/* Loading overlay */}
                {webViewLoading && (
                    <View style={styles.loadingOverlay}>
                        <Animated.View style={[styles.loadingIcon, { transform: [{ scale: pulseAnim }] }]}>
                            <Feather name="file-text" size={32} color={colors.primary} />
                        </Animated.View>
                        <Text style={styles.loadingText}>Rendering your CV...</Text>
                    </View>
                )}

                <Animated.View style={{ flex: 1, opacity: loadingAnim }}>
                    <WebView
                        source={{ html }}
                        style={styles.webView}
                        scrollEnabled={true}
                        showsVerticalScrollIndicator={true}
                        originWhitelist={['*']}
                        onLoadEnd={() => setWebViewLoading(false)}
                    />
                </Animated.View>
            </Animated.View>

            {/* Animated Actions */}
            <Animated.View style={[
                styles.actions,
                {
                    opacity: actionsAnim,
                    transform: [{ translateY: actionsAnim.interpolate({ inputRange: [0, 1], outputRange: [30, 0] }) }]
                }
            ]}>
                <TouchableOpacity style={styles.secondaryBtn} onPress={() => router.push('/cv/personal')} activeOpacity={0.7}>
                    <View style={styles.editIcon}>
                        <Feather name="edit-2" size={16} color={colors.primary} />
                    </View>
                    <Text style={styles.secondaryBtnText}>Edit CV</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.primaryBtn, isGenerating && styles.primaryBtnDisabled]}
                    onPress={handleDownload}
                    disabled={isGenerating}
                    activeOpacity={0.8}
                >
                    {isGenerating ? (
                        <ActivityIndicator color="white" size="small" />
                    ) : (
                        <>
                            <View style={styles.downloadIcon}>
                                <Feather name="download" size={16} color="white" />
                            </View>
                            <Text style={styles.primaryBtnText}>Download PDF</Text>
                        </>
                    )}
                </TouchableOpacity>
            </Animated.View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },

    // Header
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
        backgroundColor: 'white',
    },
    backBtn: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center' },
    headerCenter: { alignItems: 'center' },
    headerTitle: { fontSize: 18, fontWeight: '700', color: colors.textPrimary, marginBottom: 2 },
    templateBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#EBF5FF', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
    templateName: { fontSize: 12, color: colors.primary, fontWeight: '500' },
    changeBtn: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#EBF5FF', alignItems: 'center', justifyContent: 'center' },

    // WebView
    webViewContainer: {
        flex: 1,
        backgroundColor: 'white',
        margin: spacing.md,
        borderRadius: 18,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 16,
        elevation: 4,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    webView: { flex: 1, backgroundColor: 'transparent' },
    loadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'white',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10,
    },
    loadingIcon: {
        width: 72,
        height: 72,
        borderRadius: 20,
        backgroundColor: '#EBF5FF',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    loadingText: { fontSize: 15, color: colors.textSecondary, fontWeight: '500' },

    // Actions
    actions: {
        flexDirection: 'row',
        gap: spacing.md,
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.lg,
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
        backgroundColor: 'white',
    },
    secondaryBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 16,
        borderRadius: 14,
        borderWidth: 1.5,
        borderColor: colors.primary,
        backgroundColor: '#F0F4FF',
    },
    editIcon: { width: 28, height: 28, borderRadius: 8, backgroundColor: 'white', alignItems: 'center', justifyContent: 'center' },
    secondaryBtnText: { fontSize: 15, color: colors.primary, fontWeight: '600' },
    primaryBtn: {
        flex: 2,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 16,
        backgroundColor: colors.primary,
        borderRadius: 14,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    primaryBtnDisabled: { opacity: 0.7 },
    downloadIcon: { width: 28, height: 28, borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
    primaryBtnText: { fontSize: 15, fontWeight: '600', color: 'white' },
});
