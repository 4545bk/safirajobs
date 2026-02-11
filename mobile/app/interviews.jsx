/**
 * Interview Calendar Screen - Track upcoming interviews
 */

import React, { useState, useEffect } from 'react';
import {
    View, Text, ScrollView, StyleSheet, TouchableOpacity,
    Modal, TextInput, Alert
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons, Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors, spacing, borderRadius, typography, getLogoColor } from '../theme';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import AnimatedEntry from '../components/AnimatedEntry';

const INTERVIEW_KEY = 'interviews';

const formatDate = (date) => {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
};

const formatTime = (date) => {
    const d = new Date(date);
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
};

const getDaysDiff = (date) => {
    const now = new Date();
    const target = new Date(date);
    const diff = Math.ceil((target - now) / (1000 * 60 * 60 * 24));
    if (diff === 0) return 'Today';
    if (diff === 1) return 'Tomorrow';
    if (diff < 0) return 'Passed';
    return `In ${diff} days`;
};

const InterviewCard = ({ interview, onEdit, onDelete, colors: themeColors, t }) => {
    const activeColors = themeColors || colors;
    const logoColors = getLogoColor(interview.company || 'Interview');
    const daysDiff = getDaysDiff(interview.date);
    const isPast = daysDiff === 'Passed';

    return (
        <View style={[styles.card, { backgroundColor: activeColors.surface, shadowColor: activeColors.shadowColor || '#000' }, isPast && styles.cardPast]}>
            <View style={styles.cardHeader}>
                <View style={[styles.logo, { backgroundColor: logoColors.bg }]}>
                    <Text style={[styles.logoText, { color: logoColors.text }]}>
                        {interview.company?.charAt(0) || '?'}
                    </Text>
                </View>
                <View style={styles.cardInfo}>
                    <Text style={[styles.position, { color: activeColors.textPrimary }]} numberOfLines={1}>{interview.position}</Text>
                    <Text style={[styles.company, { color: activeColors.textSecondary }]}>{interview.company}</Text>
                </View>
                <View style={[styles.badge, { backgroundColor: activeColors.primary + '20' }, isPast && styles.badgePast]}>
                    <Text style={[styles.badgeText, { color: activeColors.primary }, isPast && styles.badgeTextPast]}>{daysDiff}</Text>
                </View>
            </View>

            <View style={styles.details}>
                <View style={styles.detailRow}>
                    <Feather name="calendar" size={14} color={activeColors.textSecondary} />
                    <Text style={[styles.detailText, { color: activeColors.textSecondary }]}>{formatDate(interview.date)}</Text>
                </View>
                <View style={styles.detailRow}>
                    <Feather name="clock" size={14} color={activeColors.textSecondary} />
                    <Text style={[styles.detailText, { color: activeColors.textSecondary }]}>{formatTime(interview.date)}</Text>
                </View>
                {interview.location && (
                    <View style={styles.detailRow}>
                        <Feather name="map-pin" size={14} color={activeColors.textSecondary} />
                        <Text style={[styles.detailText, { color: activeColors.textSecondary }]}>{interview.location}</Text>
                    </View>
                )}
                {interview.type && (
                    <View style={styles.detailRow}>
                        <Feather name={interview.type === 'video' ? 'video' : 'phone'} size={14} color={activeColors.textSecondary} />
                        <Text style={[styles.detailText, { color: activeColors.textSecondary }]}>{interview.type === 'video' ? 'Video Call' : interview.type === 'phone' ? 'Phone' : 'In-Person'}</Text>
                    </View>
                )}
            </View>

            {interview.notes && (
                <View style={[styles.notesBox, { backgroundColor: activeColors.surfaceHover }]}>
                    <Text style={[styles.notesText, { color: activeColors.textSecondary }]}>{interview.notes}</Text>
                </View>
            )}

            <View style={[styles.actions, { borderTopColor: activeColors.borderLight }]}>
                <TouchableOpacity style={styles.actionBtn} onPress={() => onEdit(interview)}>
                    <Feather name="edit-2" size={16} color={activeColors.primary} />
                    <Text style={[styles.actionText, { color: activeColors.primary }]}>{t ? t('edit') : 'Edit'}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionBtn} onPress={() => onDelete(interview.id)}>
                    <Feather name="trash-2" size={16} color="#EF4444" />
                    <Text style={[styles.actionText, { color: '#EF4444' }]}>{t ? t('delete') : 'Delete'}</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default function InterviewsScreen() {
    const router = useRouter();
    const [interviews, setInterviews] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [form, setForm] = useState({
        position: '', company: '', date: '', time: '', location: '', type: 'in-person', notes: ''
    });

    const { colors: themeColors, isDark } = useTheme();
    const { t } = useLanguage();

    useEffect(() => {
        loadInterviews();
    }, []);

    const loadInterviews = async () => {
        try {
            const saved = await AsyncStorage.getItem(INTERVIEW_KEY);
            if (saved) {
                setInterviews(JSON.parse(saved).sort((a, b) => new Date(a.date) - new Date(b.date)));
            }
        } catch (error) {
            console.error('Failed to load interviews:', error);
        }
    };

    const saveInterviews = async (data) => {
        try {
            await AsyncStorage.setItem(INTERVIEW_KEY, JSON.stringify(data));
        } catch (error) {
            console.error('Failed to save interviews:', error);
        }
    };

    const handleSave = () => {
        if (!form.position || !form.company || !form.date) {
            Alert.alert(t('error') || 'Required', t('fillRequiredFields') || 'Please fill in position, company, and date.');
            return;
        }

        const dateTime = form.time ? `${form.date}T${form.time}` : `${form.date}T09:00`;
        const interview = {
            id: editingId || Date.now().toString(),
            position: form.position,
            company: form.company,
            date: new Date(dateTime).toISOString(),
            location: form.location,
            type: form.type,
            notes: form.notes,
        };

        let updated;
        if (editingId) {
            updated = interviews.map(i => i.id === editingId ? interview : i);
        } else {
            updated = [...interviews, interview];
        }

        updated.sort((a, b) => new Date(a.date) - new Date(b.date));
        setInterviews(updated);
        saveInterviews(updated);
        closeModal();
    };

    const handleDelete = (id) => {
        Alert.alert(t('delete') || 'Delete', t('confirmDeleteInterview') || 'Delete this interview?', [
            { text: t('cancel'), style: 'cancel' },
            {
                text: t('delete'), style: 'destructive',
                onPress: () => {
                    const updated = interviews.filter(i => i.id !== id);
                    setInterviews(updated);
                    saveInterviews(updated);
                }
            }
        ]);
    };

    const handleEdit = (interview) => {
        const d = new Date(interview.date);
        setForm({
            position: interview.position,
            company: interview.company,
            date: d.toISOString().split('T')[0],
            time: d.toTimeString().slice(0, 5),
            location: interview.location || '',
            type: interview.type || 'in-person',
            notes: interview.notes || '',
        });
        setEditingId(interview.id);
        setModalVisible(true);
    };

    const closeModal = () => {
        setModalVisible(false);
        setEditingId(null);
        setForm({ position: '', company: '', date: '', time: '', location: '', type: 'in-person', notes: '' });
    };

    const upcomingInterviews = interviews.filter(i => new Date(i.date) >= new Date());
    const pastInterviews = interviews.filter(i => new Date(i.date) < new Date());

    return (
        <View style={[styles.container, { backgroundColor: themeColors.background }]}>
            {/* Header */}
            <View style={[styles.header, { backgroundColor: themeColors.surface, borderBottomColor: themeColors.borderLight }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color={themeColors.textPrimary} />
                </TouchableOpacity>
                <Text style={[styles.title, { color: themeColors.textPrimary }]}>{t('interviews')}</Text>
                <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.addBtn}>
                    <Feather name="plus" size={24} color={themeColors.primary} />
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Upcoming */}
                {upcomingInterviews.length > 0 && (
                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: themeColors.textPrimary }]}>{t('upcoming') || 'Upcoming'} ({upcomingInterviews.length})</Text>
                        {upcomingInterviews.map((interview, index) => (
                            <AnimatedEntry key={interview.id} delay={index * 100}>
                                <InterviewCard
                                    interview={interview}
                                    onEdit={handleEdit}
                                    onDelete={handleDelete}
                                    colors={themeColors}
                                    t={t}
                                />
                            </AnimatedEntry>
                        ))}
                    </View>
                )}

                {/* Past */}
                {pastInterviews.length > 0 && (
                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: themeColors.textPrimary }]}>{t('past') || 'Past'} ({pastInterviews.length})</Text>
                        {pastInterviews.map((interview, index) => (
                            <AnimatedEntry key={interview.id} delay={(upcomingInterviews.length + index) * 100}>
                                <InterviewCard
                                    interview={interview}
                                    onEdit={handleEdit}
                                    onDelete={handleDelete}
                                    colors={themeColors}
                                    t={t}
                                />
                            </AnimatedEntry>
                        ))}
                    </View>
                )}

                {interviews.length === 0 && (
                    <View style={styles.emptyState}>
                        <Feather name="calendar" size={48} color={themeColors.textMuted} />
                        <Text style={[styles.emptyTitle, { color: themeColors.textPrimary }]}>{t('noInterviews')}</Text>
                        <Text style={[styles.emptyText, { color: themeColors.textSecondary }]}>{t('addInterviewHint')}</Text>
                    </View>
                )}

                <View style={{ height: 40 }} />
            </ScrollView>

            {/* Add/Edit Modal */}
            <Modal visible={modalVisible} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <View style={[styles.modal, { backgroundColor: themeColors.surface }]}>
                        <View style={[styles.modalHeader, { borderBottomColor: themeColors.borderLight }]}>
                            <Text style={[styles.modalTitle, { color: themeColors.textPrimary }]}>{editingId ? t('editInterview') : t('addInterview')}</Text>
                            <TouchableOpacity onPress={closeModal}>
                                <Feather name="x" size={24} color={themeColors.textSecondary} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.modalContent}>
                            <Text style={[styles.label, { color: themeColors.textSecondary }]}>{t('position')} *</Text>
                            <TextInput
                                style={[styles.input, { color: themeColors.textPrimary, borderColor: themeColors.border, backgroundColor: themeColors.background }]}
                                placeholder={t('positionPlaceholder') || "e.g. Software Engineer"}
                                placeholderTextColor={themeColors.textMuted}
                                value={form.position}
                                onChangeText={(t) => setForm(f => ({ ...f, position: t }))}
                            />

                            <Text style={[styles.label, { color: themeColors.textSecondary }]}>{t('company')} *</Text>
                            <TextInput
                                style={[styles.input, { color: themeColors.textPrimary, borderColor: themeColors.border, backgroundColor: themeColors.background }]}
                                placeholder={t('companyPlaceholder') || "e.g. SafariCom"}
                                placeholderTextColor={themeColors.textMuted}
                                value={form.company}
                                onChangeText={(t) => setForm(f => ({ ...f, company: t }))}
                            />

                            <Text style={[styles.label, { color: themeColors.textSecondary }]}>{t('date')} *</Text>
                            <TextInput
                                style={[styles.input, { color: themeColors.textPrimary, borderColor: themeColors.border, backgroundColor: themeColors.background }]}
                                placeholder="YYYY-MM-DD"
                                placeholderTextColor={themeColors.textMuted}
                                value={form.date}
                                onChangeText={(t) => setForm(f => ({ ...f, date: t }))}
                            />

                            <Text style={[styles.label, { color: themeColors.textSecondary }]}>{t('time')}</Text>
                            <TextInput
                                style={[styles.input, { color: themeColors.textPrimary, borderColor: themeColors.border, backgroundColor: themeColors.background }]}
                                placeholder="HH:MM (e.g. 10:30)"
                                placeholderTextColor={themeColors.textMuted}
                                value={form.time}
                                onChangeText={(t) => setForm(f => ({ ...f, time: t }))}
                            />

                            <Text style={[styles.label, { color: themeColors.textSecondary }]}>{t('locationOrLink')}</Text>
                            <TextInput
                                style={[styles.input, { color: themeColors.textPrimary, borderColor: themeColors.border, backgroundColor: themeColors.background }]}
                                placeholder={t('locationPlaceholder') || "Office address or meeting link"}
                                placeholderTextColor={themeColors.textMuted}
                                value={form.location}
                                onChangeText={(t) => setForm(f => ({ ...f, location: t }))}
                            />

                            <Text style={[styles.label, { color: themeColors.textSecondary }]}>{t('interviewType')}</Text>
                            <View style={styles.typeRow}>
                                {['in-person', 'video', 'phone'].map(type => (
                                    <TouchableOpacity
                                        key={type}
                                        style={[
                                            styles.typeBtn,
                                            { borderColor: themeColors.border },
                                            form.type === type && { backgroundColor: themeColors.primary, borderColor: themeColors.primary }
                                        ]}
                                        onPress={() => setForm(f => ({ ...f, type }))}
                                    >
                                        <Text style={[
                                            styles.typeBtnText,
                                            { color: themeColors.textSecondary },
                                            form.type === type && { color: themeColors.textOnPrimary, fontWeight: '500' }
                                        ]}>
                                            {type.charAt(0).toUpperCase() + type.slice(1)}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            <Text style={[styles.label, { color: themeColors.textSecondary }]}>{t('notes')}</Text>
                            <TextInput
                                style={[styles.input, styles.textArea, { color: themeColors.textPrimary, borderColor: themeColors.border, backgroundColor: themeColors.background }]}
                                placeholder={t('notesPlaceholder') || "Preparation notes, interviewer names, etc."}
                                placeholderTextColor={themeColors.textMuted}
                                value={form.notes}
                                onChangeText={(t) => setForm(f => ({ ...f, notes: t }))}
                                multiline
                                numberOfLines={3}
                            />
                        </ScrollView>

                        <TouchableOpacity style={[styles.saveBtn, { backgroundColor: themeColors.primary }]} onPress={handleSave}>
                            <Text style={[styles.saveBtnText, { color: themeColors.textOnPrimary }]}>{editingId ? t('update') : t('add')} Interview</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 16, paddingTop: 50, paddingBottom: 16,
        backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#E5E7EB'
    },
    backBtn: { padding: 8 },
    title: { fontSize: 20, fontWeight: '700', color: colors.textPrimary },
    addBtn: { padding: 8 },
    content: { flex: 1, padding: 16 },
    section: { marginBottom: 24 },
    sectionTitle: { fontSize: 16, fontWeight: '600', color: colors.textPrimary, marginBottom: 12 },
    card: {
        backgroundColor: 'white', borderRadius: 12, padding: 16, marginBottom: 12,
        shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2
    },
    cardPast: { opacity: 0.6 },
    cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
    logo: { width: 44, height: 44, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
    logoText: { fontSize: 18, fontWeight: '600' },
    cardInfo: { flex: 1, marginLeft: 12 },
    position: { fontSize: 15, fontWeight: '600', color: colors.textPrimary },
    company: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
    badge: { backgroundColor: colors.primary + '20', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
    badgeText: { fontSize: 12, color: colors.primary, fontWeight: '500' },
    badgePast: { backgroundColor: '#E5E7EB' },
    badgeTextPast: { color: colors.textSecondary },
    details: { flexDirection: 'row', flexWrap: 'wrap', gap: 16, marginBottom: 12 },
    detailRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    detailText: { fontSize: 13, color: colors.textSecondary },
    notesBox: { backgroundColor: '#F9FAFB', padding: 10, borderRadius: 8, marginBottom: 12 },
    notesText: { fontSize: 13, color: colors.textSecondary },
    actions: { flexDirection: 'row', gap: 16, borderTopWidth: 1, borderTopColor: '#F3F4F6', paddingTop: 12 },
    actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    actionText: { fontSize: 13, color: colors.primary, fontWeight: '500' },
    emptyState: { alignItems: 'center', paddingVertical: 60 },
    emptyTitle: { fontSize: 16, fontWeight: '600', color: colors.textPrimary, marginTop: 12 },
    emptyText: { fontSize: 14, color: colors.textSecondary, marginTop: 4 },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modal: { backgroundColor: 'white', borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '85%' },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
    modalTitle: { fontSize: 18, fontWeight: '600', color: colors.textPrimary },
    modalContent: { padding: 20, maxHeight: 400 },
    label: { fontSize: 13, fontWeight: '500', color: colors.textSecondary, marginBottom: 6, marginTop: 12 },
    input: { borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 10, padding: 12, fontSize: 15, color: colors.textPrimary },
    textArea: { height: 80, textAlignVertical: 'top' },
    typeRow: { flexDirection: 'row', gap: 8 },
    typeBtn: { flex: 1, paddingVertical: 10, borderRadius: 8, borderWidth: 1, borderColor: '#E5E7EB', alignItems: 'center' },
    typeBtnActive: { backgroundColor: colors.primary, borderColor: colors.primary },
    typeBtnText: { fontSize: 13, color: colors.textSecondary },
    typeBtnTextActive: { color: 'white', fontWeight: '500' },
    saveBtn: { backgroundColor: colors.primary, margin: 20, padding: 16, borderRadius: 12, alignItems: 'center' },
    saveBtnText: { color: 'white', fontSize: 16, fontWeight: '600' },
});
