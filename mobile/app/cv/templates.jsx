/**
 * CV Template Gallery Screen
 * Grid layout with category filters like the Figma design
 */

import React, { useState, useMemo } from 'react';
import {
    View, Text, TouchableOpacity, StyleSheet, SafeAreaView, StatusBar,
    ScrollView, TextInput, Image, Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography } from '../../theme';
import { useCV } from '../../context/CVContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = (SCREEN_WIDTH - spacing.lg * 3) / 2;

// Template data with categories
const TEMPLATES = [
    { id: 'classic-teal', name: 'Classic Teal', category: 'Professional', color: '#0891B2' },
    { id: 'modern-amber', name: 'Modern Amber', category: 'Modern', color: '#F59E0B' },
    { id: 'professional-navy', name: 'Professional Navy', category: 'Professional', color: '#1E3A5F' },
    { id: 'clean-minimal', name: 'Clean Minimal', category: 'Minimalist', color: '#6B7280' },
    { id: 'elegant-gray', name: 'Elegant Gray', category: 'Professional', color: '#6B7280' },
    { id: 'creative-split', name: 'Creative Split', category: 'Modern', color: '#1E3A5F' },
    { id: 'minimal-red', name: 'Minimal Red', category: 'Simple', color: '#EF4444' },
    { id: 'modern-sections', name: 'Modern Sections', category: 'Modern', color: '#374151' },
    { id: 'pink-creative', name: 'Pink Creative', category: 'Modern', color: '#EC4899' },
    { id: 'teal-sidebar', name: 'Teal Sidebar', category: 'Professional', color: '#14B8A6' },
    { id: 'blue-header', name: 'Blue Header', category: 'Simple', color: '#3B82F6' },
];

const CATEGORIES = ['All', 'Professional', 'Minimalist', 'Modern', 'Simple'];

export default function TemplatesScreen() {
    const router = useRouter();
    const { cvData } = useCV();
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTemplate, setSelectedTemplate] = useState(null);

    // Filter templates
    const filteredTemplates = useMemo(() => {
        return TEMPLATES.filter(t => {
            const matchesCategory = selectedCategory === 'All' || t.category === selectedCategory;
            const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesCategory && matchesSearch;
        });
    }, [selectedCategory, searchQuery]);

    const handleSelectTemplate = (templateId) => {
        setSelectedTemplate(templateId);
    };

    const handleUseTemplate = () => {
        if (selectedTemplate) {
            router.push({ pathname: '/cv/preview', params: { template: selectedTemplate } });
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Feather name="chevron-left" size={24} color={colors.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Templates</Text>
                <TouchableOpacity style={styles.menuBtn}>
                    <Feather name="more-vertical" size={20} color={colors.textPrimary} />
                </TouchableOpacity>
            </View>

            {/* Search Bar */}
            <View style={styles.searchContainer}>
                <Feather name="search" size={18} color={colors.textTertiary} style={styles.searchIcon} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search your template"
                    placeholderTextColor={colors.textTertiary}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
            </View>

            {/* Category Filters */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesScroll} contentContainerStyle={styles.categoriesContent}>
                {CATEGORIES.map((cat) => (
                    <TouchableOpacity
                        key={cat}
                        style={[styles.categoryChip, selectedCategory === cat && styles.categoryChipActive]}
                        onPress={() => setSelectedCategory(cat)}
                    >
                        <Text style={[styles.categoryText, selectedCategory === cat && styles.categoryTextActive]}>
                            {cat}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            {/* Template Grid */}
            <ScrollView style={styles.gridScroll} contentContainerStyle={styles.gridContent}>
                <View style={styles.grid}>
                    {filteredTemplates.map((template) => (
                        <TouchableOpacity
                            key={template.id}
                            style={[styles.templateCard, selectedTemplate === template.id && styles.templateCardSelected]}
                            onPress={() => handleSelectTemplate(template.id)}
                            activeOpacity={0.7}
                        >
                            {/* Template Preview Thumbnail */}
                            <View style={[styles.templatePreview, { borderTopColor: template.color }]}>
                                <View style={styles.previewContent}>
                                    {/* Mini CV mockup */}
                                    <View style={[styles.previewHeader, { backgroundColor: template.color }]} />
                                    <View style={styles.previewLines}>
                                        <View style={[styles.previewLine, { width: '60%' }]} />
                                        <View style={[styles.previewLine, { width: '80%' }]} />
                                        <View style={[styles.previewLine, { width: '70%' }]} />
                                        <View style={[styles.previewLine, { width: '50%' }]} />
                                    </View>
                                </View>

                                {/* Selected check */}
                                {selectedTemplate === template.id && (
                                    <View style={styles.selectedBadge}>
                                        <Feather name="check" size={14} color="white" />
                                    </View>
                                )}
                            </View>

                            {/* Template Info */}
                            <Text style={[styles.templateName, selectedTemplate === template.id && styles.templateNameSelected]}>
                                {template.name.split(' ')[0]}
                            </Text>
                            <Text style={styles.templateCategory}>{template.category}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>

            {/* Use Template Button */}
            {selectedTemplate && (
                <View style={styles.footer}>
                    <TouchableOpacity style={styles.useButton} onPress={handleUseTemplate}>
                        <Text style={styles.useButtonText}>Use This Template</Text>
                        <Feather name="arrow-right" size={18} color="white" />
                    </TouchableOpacity>
                </View>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },

    // Header
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
    backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
    headerTitle: { fontSize: 18, fontWeight: '600', color: colors.textPrimary },
    menuBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },

    // Search
    searchContainer: { flexDirection: 'row', alignItems: 'center', marginHorizontal: spacing.lg, marginBottom: spacing.md, backgroundColor: colors.surface, borderRadius: borderRadius.lg, paddingHorizontal: spacing.md, borderWidth: 1, borderColor: colors.borderLight },
    searchIcon: { marginRight: spacing.sm },
    searchInput: { flex: 1, paddingVertical: 12, fontSize: 14, color: colors.textPrimary },

    // Categories
    categoriesScroll: { maxHeight: 48, marginBottom: spacing.md },
    categoriesContent: { paddingHorizontal: spacing.lg, gap: spacing.sm },
    categoryChip: { paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, borderRadius: 20, backgroundColor: colors.surface, marginRight: spacing.sm },
    categoryChipActive: { backgroundColor: colors.primary },
    categoryText: { fontSize: 13, color: colors.textSecondary, fontWeight: '500' },
    categoryTextActive: { color: 'white' },

    // Grid
    gridScroll: { flex: 1 },
    gridContent: { paddingHorizontal: spacing.lg, paddingBottom: 100 },
    grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },

    // Template Card
    templateCard: { width: CARD_WIDTH, marginBottom: spacing.lg, alignItems: 'center' },
    templateCardSelected: {},
    templatePreview: { width: '100%', aspectRatio: 0.75, backgroundColor: 'white', borderRadius: borderRadius.lg, borderWidth: 1, borderColor: colors.borderLight, borderTopWidth: 3, overflow: 'hidden', marginBottom: spacing.sm, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
    previewContent: { flex: 1, padding: 12 },
    previewHeader: { height: 20, borderRadius: 4, marginBottom: 8 },
    previewLines: { gap: 6 },
    previewLine: { height: 6, backgroundColor: '#E5E7EB', borderRadius: 3 },
    selectedBadge: { position: 'absolute', top: 8, right: 8, width: 24, height: 24, borderRadius: 12, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },

    // Template Info
    templateName: { fontSize: 14, fontWeight: '600', color: colors.textPrimary, marginBottom: 2 },
    templateNameSelected: { color: colors.primary },
    templateCategory: { fontSize: 12, color: colors.textTertiary },

    // Footer
    footer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: spacing.lg, backgroundColor: colors.background, borderTopWidth: 1, borderTopColor: colors.borderLight },
    useButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, backgroundColor: colors.primary, paddingVertical: 14, borderRadius: borderRadius.lg },
    useButtonText: { fontSize: 16, fontWeight: '600', color: 'white' },
});
