/**
 * Filter Modal Component - Enhanced with Advanced Filters
 */

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, ScrollView, Pressable } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography } from '../theme';

const locations = ['All', 'Addis Ababa', 'Gambella', 'Dire Dawa', 'Hawassa', 'Bahir Dar', 'Remote'];
const categories = ['All', 'Health', 'Finance', 'IT', 'Marketing', 'Logistics', 'M&E', 'Communications'];
const levels = ['All', 'Entry', 'Mid', 'Senior'];
const workTypes = ['All', 'On-site', 'Remote', 'Hybrid'];
const contractTypes = ['All', 'Full-time', 'Part-time', 'Contract', 'Internship'];
const postedOptions = [
    { label: 'All time', value: 'all' },
    { label: 'Last 24 hours', value: '1' },
    { label: 'Last 7 days', value: '7' },
    { label: 'Last 30 days', value: '30' }
];

const FilterModal = ({ isOpen, onClose, filters, setFilters, onApply }) => {
    if (!isOpen) return null;

    const handleSelect = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const handleClear = () => {
        setFilters({
            location: 'All',
            category: 'All',
            level: 'All',
            workType: 'All',
            contractType: 'All',
            postedWithin: 'all',
        });
    };

    const handleApply = () => {
        onApply && onApply();
        onClose();
    };

    // Count active filters
    const activeCount = Object.entries(filters || {}).filter(([key, val]) =>
        val && val !== 'All' && val !== 'all'
    ).length;

    return (
        <Modal
            visible={isOpen}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <Pressable style={styles.backdrop} onPress={onClose} />

                <View style={styles.sheet}>
                    {/* Handle */}
                    <View style={styles.handleContainer}>
                        <View style={styles.handle} />
                    </View>

                    {/* Header */}
                    <View style={styles.header}>
                        <View style={styles.titleRow}>
                            <Text style={styles.title}>Filters</Text>
                            {activeCount > 0 && (
                                <View style={styles.countBadge}>
                                    <Text style={styles.countText}>{activeCount}</Text>
                                </View>
                            )}
                        </View>
                        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                            <Feather name="x" size={24} color={colors.textMuted} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                        {/* Posted Within Filter */}
                        <View style={styles.filterSection}>
                            <Text style={styles.sectionLabel}>📅 Posted Within</Text>
                            <View style={styles.pillsContainer}>
                                {postedOptions.map((opt) => (
                                    <TouchableOpacity
                                        key={opt.value}
                                        style={[
                                            styles.pill,
                                            filters.postedWithin === opt.value && styles.pillActive
                                        ]}
                                        onPress={() => handleSelect('postedWithin', opt.value)}
                                    >
                                        <Text style={[
                                            styles.pillText,
                                            filters.postedWithin === opt.value && styles.pillTextActive
                                        ]}>
                                            {opt.label}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        {/* Work Type Filter */}
                        <View style={styles.filterSection}>
                            <Text style={styles.sectionLabel}>🏢 Work Type</Text>
                            <View style={styles.pillsContainer}>
                                {workTypes.map((type) => (
                                    <TouchableOpacity
                                        key={type}
                                        style={[
                                            styles.pill,
                                            filters.workType === type && styles.pillActive
                                        ]}
                                        onPress={() => handleSelect('workType', type)}
                                    >
                                        <Text style={[
                                            styles.pillText,
                                            filters.workType === type && styles.pillTextActive
                                        ]}>
                                            {type}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        {/* Contract Type Filter */}
                        <View style={styles.filterSection}>
                            <Text style={styles.sectionLabel}>📋 Contract Type</Text>
                            <View style={styles.pillsContainer}>
                                {contractTypes.map((type) => (
                                    <TouchableOpacity
                                        key={type}
                                        style={[
                                            styles.pill,
                                            filters.contractType === type && styles.pillActive
                                        ]}
                                        onPress={() => handleSelect('contractType', type)}
                                    >
                                        <Text style={[
                                            styles.pillText,
                                            filters.contractType === type && styles.pillTextActive
                                        ]}>
                                            {type}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        {/* Location Filter */}
                        <View style={styles.filterSection}>
                            <Text style={styles.sectionLabel}>📍 Location</Text>
                            <View style={styles.pillsContainer}>
                                {locations.map((loc) => (
                                    <TouchableOpacity
                                        key={loc}
                                        style={[
                                            styles.pill,
                                            filters.location === loc && styles.pillActive
                                        ]}
                                        onPress={() => handleSelect('location', loc)}
                                    >
                                        <Text style={[
                                            styles.pillText,
                                            filters.location === loc && styles.pillTextActive
                                        ]}>
                                            {loc}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        {/* Category Filter */}
                        <View style={styles.filterSection}>
                            <Text style={styles.sectionLabel}>📁 Category</Text>
                            <View style={styles.pillsContainer}>
                                {categories.map((cat) => (
                                    <TouchableOpacity
                                        key={cat}
                                        style={[
                                            styles.pill,
                                            filters.category === cat && styles.pillActive
                                        ]}
                                        onPress={() => handleSelect('category', cat)}
                                    >
                                        <Text style={[
                                            styles.pillText,
                                            filters.category === cat && styles.pillTextActive
                                        ]}>
                                            {cat}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        {/* Level Filter */}
                        <View style={styles.filterSection}>
                            <Text style={styles.sectionLabel}>📊 Experience Level</Text>
                            <View style={styles.pillsContainer}>
                                {levels.map((level) => (
                                    <TouchableOpacity
                                        key={level}
                                        style={[
                                            styles.pill,
                                            filters.level === level && styles.pillActive
                                        ]}
                                        onPress={() => handleSelect('level', level)}
                                    >
                                        <Text style={[
                                            styles.pillText,
                                            filters.level === level && styles.pillTextActive
                                        ]}>
                                            {level}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        <View style={{ height: 20 }} />
                    </ScrollView>

                    {/* Footer Buttons */}
                    <View style={styles.footer}>
                        <TouchableOpacity
                            style={styles.resetBtn}
                            onPress={handleClear}
                        >
                            <Feather name="refresh-cw" size={16} color={colors.textSecondary} />
                            <Text style={styles.resetBtnText}>Reset</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.applyBtn}
                            onPress={handleApply}
                        >
                            <Text style={styles.applyBtnText}>
                                Apply {activeCount > 0 ? `(${activeCount})` : ''}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
    },
    sheet: {
        backgroundColor: colors.surface,
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        maxHeight: '90%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -5 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 20,
    },
    handleContainer: {
        alignItems: 'center',
        paddingTop: spacing.md,
    },
    handle: {
        width: 40,
        height: 4,
        backgroundColor: colors.border,
        borderRadius: 2,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: spacing.xxl,
        paddingVertical: spacing.lg,
        borderBottomWidth: 1,
        borderBottomColor: colors.borderLight,
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    title: {
        fontSize: typography.xl,
        fontWeight: typography.bold,
        color: colors.textPrimary,
    },
    countBadge: {
        backgroundColor: colors.primary,
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 10,
    },
    countText: {
        color: 'white',
        fontSize: 12,
        fontWeight: '600',
    },
    closeBtn: {
        padding: spacing.xs,
    },
    content: {
        paddingHorizontal: spacing.xxl,
        paddingTop: spacing.lg,
    },
    filterSection: {
        marginBottom: spacing.xl,
    },
    sectionLabel: {
        fontSize: typography.sm,
        fontWeight: typography.bold,
        color: colors.textPrimary,
        marginBottom: spacing.md,
    },
    pillsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.sm,
    },
    pill: {
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.sm,
        borderRadius: borderRadius.full,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.surface,
    },
    pillActive: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 3,
    },
    pillText: {
        fontSize: typography.sm,
        fontWeight: typography.medium,
        color: colors.textSecondary,
    },
    pillTextActive: {
        color: colors.textOnPrimary,
    },
    footer: {
        flexDirection: 'row',
        gap: spacing.md,
        padding: spacing.xxl,
        paddingBottom: 40,
        borderTopWidth: 1,
        borderTopColor: colors.borderLight,
    },
    resetBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        paddingVertical: spacing.lg,
        borderRadius: borderRadius.md,
        backgroundColor: colors.surfaceHover,
    },
    resetBtnText: {
        fontSize: typography.base,
        fontWeight: typography.bold,
        color: colors.textSecondary,
    },
    applyBtn: {
        flex: 1,
        paddingVertical: spacing.lg,
        borderRadius: borderRadius.md,
        backgroundColor: colors.primary,
        alignItems: 'center',
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    applyBtnText: {
        fontSize: typography.base,
        fontWeight: typography.bold,
        color: colors.textOnPrimary,
    },
});

export default FilterModal;
