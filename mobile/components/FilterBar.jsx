import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Modal,
    StyleSheet,
    ScrollView,
    Pressable
} from 'react-native';
import { colors } from '../styles/global';

// Filter options
const LOCATIONS = ['All', 'Addis Ababa', 'Ethiopia', 'Regional'];
const CATEGORIES = [
    'All',
    'Program Management',
    'Information Technology',
    'Health',
    'Logistics',
    'Finance',
    'Human Resources',
    'Monitoring & Evaluation'
];
const EXPERIENCE_LEVELS = ['All', 'Entry', 'Mid', 'Senior'];

/**
 * FilterBar - Filter controls for job search
 */
export default function FilterBar({ filters, onFilterChange }) {
    const [modalVisible, setModalVisible] = useState(false);
    const [activeFilterType, setActiveFilterType] = useState(null);

    const openFilterModal = (filterType) => {
        setActiveFilterType(filterType);
        setModalVisible(true);
    };

    const selectOption = (value) => {
        const newValue = value === 'All' ? '' : value;
        onFilterChange({ ...filters, [activeFilterType]: newValue });
        setModalVisible(false);
    };

    const getDisplayValue = (filterType) => {
        const value = filters[filterType];
        if (!value) {
            switch (filterType) {
                case 'location': return '📍 Location';
                case 'category': return '💼 Category';
                case 'experience': return '⭐ Level';
                default: return filterType;
            }
        }
        return value;
    };

    const getOptions = () => {
        switch (activeFilterType) {
            case 'location': return LOCATIONS;
            case 'category': return CATEGORIES;
            case 'experience': return EXPERIENCE_LEVELS;
            default: return [];
        }
    };

    const hasActiveFilters = filters.location || filters.category || filters.experience;

    return (
        <View style={styles.container}>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* Location Filter */}
                <TouchableOpacity
                    style={[styles.filterButton, filters.location && styles.activeFilter]}
                    onPress={() => openFilterModal('location')}
                >
                    <Text style={[styles.filterText, filters.location && styles.activeFilterText]}>
                        {getDisplayValue('location')}
                    </Text>
                </TouchableOpacity>

                {/* Category Filter */}
                <TouchableOpacity
                    style={[styles.filterButton, filters.category && styles.activeFilter]}
                    onPress={() => openFilterModal('category')}
                >
                    <Text style={[styles.filterText, filters.category && styles.activeFilterText]}>
                        {getDisplayValue('category')}
                    </Text>
                </TouchableOpacity>

                {/* Experience Filter */}
                <TouchableOpacity
                    style={[styles.filterButton, filters.experience && styles.activeFilter]}
                    onPress={() => openFilterModal('experience')}
                >
                    <Text style={[styles.filterText, filters.experience && styles.activeFilterText]}>
                        {getDisplayValue('experience')}
                    </Text>
                </TouchableOpacity>

                {/* Clear Filters */}
                {hasActiveFilters && (
                    <TouchableOpacity
                        style={styles.clearButton}
                        onPress={() => onFilterChange({ location: '', category: '', experience: '' })}
                    >
                        <Text style={styles.clearText}>✕ Clear</Text>
                    </TouchableOpacity>
                )}
            </ScrollView>

            {/* Filter Selection Modal */}
            <Modal
                visible={modalVisible}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setModalVisible(false)}
            >
                <Pressable
                    style={styles.modalOverlay}
                    onPress={() => setModalVisible(false)}
                >
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>
                            Select {activeFilterType?.charAt(0).toUpperCase() + activeFilterType?.slice(1)}
                        </Text>

                        <ScrollView>
                            {getOptions().map((option) => (
                                <TouchableOpacity
                                    key={option}
                                    style={[
                                        styles.optionButton,
                                        filters[activeFilterType] === option && styles.selectedOption
                                    ]}
                                    onPress={() => selectOption(option)}
                                >
                                    <Text style={[
                                        styles.optionText,
                                        filters[activeFilterType] === option && styles.selectedOptionText
                                    ]}>
                                        {option}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                </Pressable>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },

    scrollContent: {
        paddingHorizontal: 16,
        gap: 8,
    },

    filterButton: {
        backgroundColor: colors.surface,
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: colors.border,
    },

    activeFilter: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },

    filterText: {
        fontSize: 14,
        color: colors.textSecondary,
    },

    activeFilterText: {
        color: colors.text,
        fontWeight: '500',
    },

    clearButton: {
        paddingVertical: 10,
        paddingHorizontal: 12,
    },

    clearText: {
        fontSize: 14,
        color: colors.error,
    },

    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        justifyContent: 'flex-end',
    },

    modalContent: {
        backgroundColor: colors.surface,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        maxHeight: '60%',
    },

    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.text,
        marginBottom: 20,
        textAlign: 'center',
    },

    optionButton: {
        paddingVertical: 16,
        paddingHorizontal: 16,
        borderRadius: 12,
        marginBottom: 8,
        backgroundColor: colors.surfaceLight,
    },

    selectedOption: {
        backgroundColor: colors.primary,
    },

    optionText: {
        fontSize: 16,
        color: colors.textSecondary,
        textAlign: 'center',
    },

    selectedOptionText: {
        color: colors.text,
        fontWeight: '600',
    },
});
