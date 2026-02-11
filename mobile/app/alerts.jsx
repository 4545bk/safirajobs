/**
 * Job Alerts Screen - Create and manage job alert preferences
 */

import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    Switch,
    TextInput,
    Alert,
    ActivityIndicator
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '../theme';
import * as alertsService from '../services/alerts';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import AnimatedEntry from '../components/AnimatedEntry';

// Multi-select chip component
const FilterChip = ({ label, selected, onToggle }) => {
    const { colors: themeColors, isDark } = useTheme();
    return (
        <TouchableOpacity
            style={[
                styles.chip,
                { backgroundColor: selected ? themeColors.primary : (isDark ? themeColors.surfaceHover : '#F3F4F6') },
                selected && styles.chipSelected
            ]}
            onPress={onToggle}
        >
            <Text style={[
                styles.chipText,
                { color: selected ? 'white' : themeColors.textSecondary }
            ]}>
                {label}
            </Text>
            {selected && (
                <Ionicons name="checkmark" size={14} color="white" style={styles.chipIcon} />
            )}
        </TouchableOpacity>
    );
};

// Alert card component
const AlertCard = ({ alert, onToggle, onEdit, onDelete }) => {
    const { colors: themeColors, isDark } = useTheme();
    const { t } = useLanguage();

    return (
        <View style={[styles.alertCard, { backgroundColor: themeColors.surface, shadowColor: themeColors.shadowColor }]}>
            <View style={styles.alertHeader}>
                <View style={styles.alertInfo}>
                    <Text style={[styles.alertName, { color: themeColors.textPrimary }]}>{alert.name}</Text>
                    <Text style={[styles.alertStats, { color: themeColors.textSecondary }]}>
                        {alert.notificationCount} {t('notificationsSent') || 'notifications sent'}
                    </Text>
                </View>
                <Switch
                    value={alert.isActive}
                    onValueChange={() => onToggle(alert._id)}
                    trackColor={{ false: isDark ? '#4B5563' : '#E5E7EB', true: themeColors.primary + '80' }}
                    thumbColor={alert.isActive ? themeColors.primary : '#9CA3AF'}
                />
            </View>

            <View style={styles.alertFilters}>
                {alert.categories?.length > 0 && (
                    <Text style={[styles.filterText, { color: themeColors.textSecondary }]}>
                        📁 {alert.categories.slice(0, 2).join(', ')}
                        {alert.categories.length > 2 && ` +${alert.categories.length - 2}`}
                    </Text>
                )}
                {alert.locations?.length > 0 && (
                    <Text style={[styles.filterText, { color: themeColors.textSecondary }]}>
                        📍 {alert.locations.slice(0, 2).join(', ')}
                        {alert.locations.length > 2 && ` +${alert.locations.length - 2}`}
                    </Text>
                )}
                {alert.keywords?.length > 0 && (
                    <Text style={[styles.filterText, { color: themeColors.textSecondary }]}>
                        🔍 {alert.keywords.join(', ')}
                    </Text>
                )}
            </View>

            <View style={[styles.alertActions, { borderTopColor: themeColors.borderLight }]}>
                <TouchableOpacity style={styles.actionBtn} onPress={() => onEdit(alert)}>
                    <Ionicons name="create-outline" size={18} color={themeColors.primary} />
                    <Text style={[styles.actionText, { color: themeColors.primary }]}>{t('edit') || 'Edit'}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionBtn} onPress={() => onDelete(alert._id)}>
                    <Ionicons name="trash-outline" size={18} color={themeColors.error} />
                    <Text style={[styles.actionText, { color: themeColors.error }]}>{t('delete') || 'Delete'}</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default function AlertsScreen() {
    const router = useRouter();
    const { colors: themeColors, isDark } = useTheme();
    const { t } = useLanguage();

    const [alerts, setAlerts] = useState([]);
    const [options, setOptions] = useState(null);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [deviceToken, setDeviceToken] = useState(null);

    // New alert form
    const [showForm, setShowForm] = useState(false);
    const [alertName, setAlertName] = useState('');
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [selectedLocations, setSelectedLocations] = useState([]);
    const [keywords, setKeywords] = useState('');
    const [selectedLevels, setSelectedLevels] = useState([]);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            // Get device token
            const token = await AsyncStorage.getItem('expoPushToken');
            setDeviceToken(token);

            if (token) {
                // Load alerts and options
                const [alertsRes, optionsRes] = await Promise.all([
                    alertsService.getAlerts(token),
                    alertsService.getAlertOptions()
                ]);

                if (alertsRes.success) setAlerts(alertsRes.data);
                if (optionsRes.success) setOptions(optionsRes.data);
            }
        } catch (error) {
            console.error('Failed to load alerts:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateAlert = async () => {
        if (!deviceToken) {
            Alert.alert(t('error') || 'Error', t('pushNotificationsNotEnabled') || 'Push notifications not enabled');
            return;
        }

        if (!alertName.trim()) {
            Alert.alert(t('error') || 'Required', t('pleaseEnterAlertName') || 'Please enter an alert name');
            return;
        }

        if (selectedCategories.length === 0 && selectedLocations.length === 0 && !keywords.trim()) {
            Alert.alert(t('error') || 'Required', t('selectOneFilter') || 'Please select at least one filter');
            return;
        }

        setCreating(true);
        try {
            const result = await alertsService.createAlert({
                deviceToken,
                name: alertName.trim(),
                categories: selectedCategories,
                locations: selectedLocations,
                keywords: keywords.split(',').map(k => k.trim()).filter(k => k),
                experienceLevels: selectedLevels,
                frequency: 'immediate'
            });

            if (result.success) {
                setAlerts([result.data, ...alerts]);
                resetForm();
                Alert.alert(t('success') || 'Success', t('jobAlertCreated') || 'Job alert created! You\'ll be notified when matching jobs appear.');
            } else {
                Alert.alert(t('error') || 'Error', result.error);
            }
        } catch (error) {
            Alert.alert(t('error') || 'Error', t('createAlertFailed') || 'Failed to create alert');
        } finally {
            setCreating(false);
        }
    };

    const handleToggle = async (alertId) => {
        const result = await alertsService.toggleAlert(alertId);
        if (result.success) {
            setAlerts(alerts.map(a =>
                a._id === alertId ? result.data : a
            ));
        }
    };

    const handleDelete = async (alertId) => {
        Alert.alert(
            t('deleteAlert') || 'Delete Alert',
            t('confirmDeleteAlert') || 'Are you sure you want to delete this alert?',
            [
                { text: t('cancel') || 'Cancel', style: 'cancel' },
                {
                    text: t('delete') || 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        const result = await alertsService.deleteAlert(alertId);
                        if (result.success) {
                            setAlerts(alerts.filter(a => a._id !== alertId));
                        }
                    }
                }
            ]
        );
    };

    const resetForm = () => {
        setShowForm(false);
        setAlertName('');
        setSelectedCategories([]);
        setSelectedLocations([]);
        setKeywords('');
        setSelectedLevels([]);
    };

    const toggleSelection = (item, list, setList) => {
        if (list.includes(item)) {
            setList(list.filter(i => i !== item));
        } else {
            setList([...list, item]);
        }
    };

    if (loading) {
        return (
            <View style={[styles.centered, { backgroundColor: themeColors.background }]}>
                <ActivityIndicator size="large" color={themeColors.primary} />
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: themeColors.background }]}>
            {/* Header */}
            <View style={[styles.header, { backgroundColor: themeColors.surface, borderBottomColor: themeColors.borderLight }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color={themeColors.textPrimary} />
                </TouchableOpacity>
                <Text style={[styles.title, { color: themeColors.textPrimary }]}>{t('jobAlerts') || 'Job Alerts'}</Text>
                <TouchableOpacity onPress={() => setShowForm(!showForm)} style={[styles.addBtn, { backgroundColor: themeColors.primary }]}>
                    <Ionicons name={showForm ? 'close' : 'add'} size={24} color="white" />
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Create Alert Form */}
                {showForm && options && (
                    <View style={[styles.formCard, { backgroundColor: themeColors.surface, shadowColor: themeColors.shadowColor }]}>
                        <Text style={[styles.formTitle, { color: themeColors.textPrimary }]}>{t('createNewAlert') || 'Create New Alert'}</Text>

                        <TextInput
                            style={[styles.input, { backgroundColor: isDark ? themeColors.background : '#F3F4F6', color: themeColors.textPrimary }]}
                            placeholder={t('alertNamePlaceholder') || "Alert name (e.g., Health Jobs in Addis)"}
                            value={alertName}
                            onChangeText={setAlertName}
                            placeholderTextColor={themeColors.textMuted}
                        />

                        <Text style={[styles.sectionTitle, { color: themeColors.textSecondary }]}>{t('categories') || 'Categories'}</Text>
                        <View style={styles.chipContainer}>
                            {options.categories.slice(0, 10).map(cat => (
                                <FilterChip
                                    key={cat}
                                    label={cat}
                                    selected={selectedCategories.includes(cat)}
                                    onToggle={() => toggleSelection(cat, selectedCategories, setSelectedCategories)}
                                />
                            ))}
                        </View>

                        <Text style={[styles.sectionTitle, { color: themeColors.textSecondary }]}>{t('locations') || 'Locations'}</Text>
                        <View style={styles.chipContainer}>
                            {options.locations.slice(0, 8).map(loc => (
                                <FilterChip
                                    key={loc}
                                    label={loc}
                                    selected={selectedLocations.includes(loc)}
                                    onToggle={() => toggleSelection(loc, selectedLocations, setSelectedLocations)}
                                />
                            ))}
                        </View>

                        <Text style={[styles.sectionTitle, { color: themeColors.textSecondary }]}>{t('experienceLevel') || 'Experience Level'}</Text>
                        <View style={styles.chipContainer}>
                            {options.experienceLevels.map(level => (
                                <FilterChip
                                    key={level}
                                    label={level}
                                    selected={selectedLevels.includes(level)}
                                    onToggle={() => toggleSelection(level, selectedLevels, setSelectedLevels)}
                                />
                            ))}
                        </View>

                        <Text style={[styles.sectionTitle, { color: themeColors.textSecondary }]}>{t('keywords') || 'Keywords (comma-separated)'}</Text>
                        <TextInput
                            style={[styles.input, { backgroundColor: isDark ? themeColors.background : '#F3F4F6', color: themeColors.textPrimary }]}
                            placeholder={t('keywordsPlaceholder') || "e.g., nurse, coordinator, manager"}
                            value={keywords}
                            onChangeText={setKeywords}
                            placeholderTextColor={themeColors.textMuted}
                        />

                        <TouchableOpacity
                            style={[styles.createBtn, { backgroundColor: themeColors.primary }, creating && styles.createBtnDisabled]}
                            onPress={handleCreateAlert}
                            disabled={creating}
                        >
                            {creating ? (
                                <ActivityIndicator color="white" />
                            ) : (
                                <>
                                    <Ionicons name="notifications" size={20} color="white" />
                                    <Text style={styles.createBtnText}>{t('createAlert') || 'Create Alert'}</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    </View>
                )}

                {/* Existing Alerts */}
                <AnimatedEntry delay={showForm ? 300 : 100}>
                    <Text style={[styles.sectionHeader, { color: themeColors.textPrimary }]}>
                        {t('yourAlerts') || 'Your Alerts'} ({alerts.length})
                    </Text>

                    {alerts.length === 0 ? (
                        <View style={styles.emptyState}>
                            <Ionicons name="notifications-off-outline" size={48} color={themeColors.textMuted} />
                            <Text style={[styles.emptyTitle, { color: themeColors.textPrimary }]}>{t('noAlerts') || 'No alerts yet'}</Text>
                            <Text style={[styles.emptyText, { color: themeColors.textSecondary }]}>
                                {t('noAlertsHint') || 'Create an alert to get notified when matching jobs are posted'}
                            </Text>
                        </View>
                    ) : (
                        alerts.map((alert, index) => (
                            <AnimatedEntry key={alert._id} delay={index * 100}>
                                <AlertCard
                                    alert={alert}
                                    onToggle={handleToggle}
                                    onEdit={(a) => Alert.alert(t('edit'), t('comingSoon') || 'Coming soon')}
                                    onDelete={handleDelete}
                                />
                            </AnimatedEntry>
                        ))
                    )}
                </AnimatedEntry>

                <View style={{ height: 40 }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingTop: 50,
        paddingBottom: 16,
        borderBottomWidth: 1
    },
    backBtn: { padding: 8 },
    title: { fontSize: 18, fontWeight: '600' },
    addBtn: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center'
    },
    content: { flex: 1, padding: 16 },
    formCard: {
        borderRadius: 16,
        padding: 20,
        marginBottom: 20,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3
    },
    formTitle: { fontSize: 18, fontWeight: '600', marginBottom: 16 },
    input: {
        borderRadius: 10,
        padding: 14,
        fontSize: 15,
        marginBottom: 16
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 8,
        marginTop: 4
    },
    chipContainer: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 12, gap: 8 },
    chip: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        flexDirection: 'row',
        alignItems: 'center'
    },
    chipSelected: {},
    chipText: { fontSize: 13 },
    chipTextSelected: {},
    chipIcon: { marginLeft: 4 },
    createBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        borderRadius: 12,
        marginTop: 8,
        gap: 8
    },
    createBtnDisabled: { opacity: 0.6 },
    createBtnText: { color: 'white', fontSize: 16, fontWeight: '600' },
    sectionHeader: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 12
    },
    alertCard: {
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2
    },
    alertHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    alertInfo: { flex: 1 },
    alertName: { fontSize: 16, fontWeight: '600' },
    alertStats: { fontSize: 12, marginTop: 2 },
    alertFilters: { marginTop: 12, gap: 4 },
    filterText: { fontSize: 13 },
    alertActions: {
        flexDirection: 'row',
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        gap: 16
    },
    actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    actionText: { fontSize: 13 },
    emptyState: { alignItems: 'center', paddingVertical: 40 },
    emptyTitle: { fontSize: 16, fontWeight: '600', marginTop: 12 },
    emptyText: { fontSize: 14, textAlign: 'center', marginTop: 4, paddingHorizontal: 20 }
});
