/**
 * CV Preview Modal - Premium Animated Design
 * Professional template gallery with smooth animations
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, Modal, TouchableOpacity, StyleSheet, SafeAreaView,
  ActivityIndicator, ScrollView, TextInput, Dimensions, Animated, Easing,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { Feather } from '@expo/vector-icons';
import { colors, spacing, borderRadius } from '../../theme';
import { generateTemplateHTML } from '../../services/cvTemplates';
import { useCV } from '../../context/CVContext';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const CARD_WIDTH = (SCREEN_WIDTH - spacing.lg * 3) / 2;
const CARD_HEIGHT = CARD_WIDTH * 1.35;

// Template data
const TEMPLATES = [
  { id: 'classic-teal', name: 'Celeste', category: 'Professional', accent: '#0891B2', secondary: '#67E8F9', style: 'sidebar-teal' },
  { id: 'modern-amber', name: 'Aurora', category: 'Professional', accent: '#F59E0B', secondary: '#FDE68A', style: 'header-gold' },
  { id: 'professional-navy', name: 'Bianca', category: 'Modern', accent: '#1E3A5F', secondary: '#60A5FA', style: 'sidebar-navy' },
  { id: 'clean-minimal', name: 'Estella', category: 'Simple', accent: '#374151', secondary: '#9CA3AF', style: 'minimal' },
  { id: 'elegant-gray', name: 'Diana', category: 'Professional', accent: '#4B5563', secondary: '#D1D5DB', style: 'sidebar-gray' },
  { id: 'creative-split', name: 'Fiona', category: 'Modern', accent: '#1E40AF', secondary: '#93C5FD', style: 'sidebar-blue' },
  { id: 'minimal-red', name: 'Grace', category: 'Simple', accent: '#DC2626', secondary: '#FCA5A5', style: 'accent-red' },
  { id: 'modern-sections', name: 'Harper', category: 'Modern', accent: '#374151', secondary: '#E5E7EB', style: 'sections' },
  { id: 'pink-creative', name: 'Iris', category: 'Modern', accent: '#EC4899', secondary: '#F9A8D4', style: 'sidebar-pink' },
  { id: 'teal-sidebar', name: 'Julia', category: 'Professional', accent: '#0D9488', secondary: '#5EEAD4', style: 'sidebar-teal' },
  { id: 'blue-header', name: 'Kate', category: 'Simple', accent: '#3B82F6', secondary: '#BFDBFE', style: 'header-blue' },
];

const CATEGORIES = ['All', 'Professional', 'Minimalist', 'Modern', 'Simple'];

const SAMPLE_DATA = {
  personalInfo: { firstName: 'Sarah', lastName: 'Miller', email: 'sarah@email.com', phone: '+1234567890', city: 'New York', country: 'USA', jobTitle: 'Product Designer' },
  professionalSummary: { text: 'Creative designer with 5+ years of experience in UX/UI design and product development.' },
  education: [{ institution: 'Design University', degree: 'Bachelor of Design', fieldOfStudy: 'UX Design', startDate: { year: 2015 }, endDate: { year: 2019 } }],
  experience: [{ organization: 'Tech Corp', jobTitle: 'Senior Designer', startDate: { month: 1, year: 2020 }, isCurrently: true, responsibilities: ['Led design team', 'Created design systems'] }],
  skills: { technical: [{ name: 'Figma', level: 'expert' }, { name: 'Sketch', level: 'advanced' }], software: [], soft: [] },
  languages: [{ name: 'English', proficiency: 'native' }, { name: 'Spanish', proficiency: 'fluent' }],
};

// Animated Success Toast Component
const SuccessToast = ({ visible, templateName, onHide }) => {
  const slideAnim = useRef(new Animated.Value(-100)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(slideAnim, { toValue: 0, tension: 60, friction: 10, useNativeDriver: true }),
        Animated.timing(opacityAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.spring(scaleAnim, { toValue: 1, tension: 80, friction: 8, useNativeDriver: true }),
      ]).start();

      setTimeout(() => {
        Animated.parallel([
          Animated.timing(slideAnim, { toValue: -100, duration: 300, useNativeDriver: true }),
          Animated.timing(opacityAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
        ]).start(() => onHide());
      }, 2500);
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Animated.View style={[styles.toast, { transform: [{ translateY: slideAnim }, { scale: scaleAnim }], opacity: opacityAnim }]}>
      <View style={styles.toastIcon}>
        <Feather name="check" size={18} color="white" />
      </View>
      <View style={styles.toastContent}>
        <Text style={styles.toastTitle}>Template Selected!</Text>
        <Text style={styles.toastMessage}>"{templateName}" is now your CV style</Text>
      </View>
    </Animated.View>
  );
};

// Animated Mini Preview Component
const MiniPreview = ({ template }) => {
  const { accent, secondary, style } = template;

  if (style.includes('sidebar')) {
    return (
      <View style={styles.previewContainer}>
        <View style={[styles.sidebar, { backgroundColor: accent }]}>
          <View style={styles.photoCircle}>
            <View style={[styles.photoInner, { backgroundColor: secondary }]} />
          </View>
          <View style={[styles.line, styles.lineWide, { backgroundColor: 'rgba(255,255,255,0.6)' }]} />
          <View style={[styles.line, styles.lineMedium, { backgroundColor: 'rgba(255,255,255,0.4)' }]} />
          <View style={{ height: 8 }} />
          <View style={[styles.line, styles.lineWide, { backgroundColor: 'rgba(255,255,255,0.5)' }]} />
          <View style={[styles.line, styles.lineMedium, { backgroundColor: 'rgba(255,255,255,0.3)' }]} />
          <View style={[styles.line, styles.lineShort, { backgroundColor: 'rgba(255,255,255,0.3)' }]} />
        </View>
        <View style={styles.mainContent}>
          <View style={[styles.line, styles.nameBar, { backgroundColor: '#374151' }]} />
          <View style={[styles.line, styles.titleBar, { backgroundColor: accent }]} />
          <View style={{ height: 10 }} />
          <View style={[styles.line, styles.sectionHeader, { backgroundColor: accent }]} />
          <View style={[styles.line, styles.lineWide, { backgroundColor: '#E5E7EB' }]} />
          <View style={[styles.line, styles.lineMedium, { backgroundColor: '#E5E7EB' }]} />
          <View style={[styles.line, styles.lineWide, { backgroundColor: '#E5E7EB' }]} />
          <View style={{ height: 8 }} />
          <View style={[styles.line, styles.sectionHeader, { backgroundColor: accent }]} />
          <View style={[styles.line, styles.lineWide, { backgroundColor: '#E5E7EB' }]} />
          <View style={[styles.line, styles.lineMedium, { backgroundColor: '#E5E7EB' }]} />
        </View>
      </View>
    );
  }

  if (style.includes('header')) {
    return (
      <View style={styles.previewContainer}>
        <View style={styles.headerLayout}>
          <View style={[styles.headerBanner, { backgroundColor: accent }]}>
            <View style={[styles.line, { width: 50, height: 8, backgroundColor: 'white', marginBottom: 2 }]} />
            <View style={[styles.line, { width: 35, height: 4, backgroundColor: 'rgba(255,255,255,0.7)' }]} />
          </View>
          <View style={styles.headerContent}>
            <View style={[styles.line, styles.sectionHeader, { backgroundColor: accent }]} />
            <View style={[styles.line, styles.lineWide, { backgroundColor: '#E5E7EB' }]} />
            <View style={[styles.line, styles.lineMedium, { backgroundColor: '#E5E7EB' }]} />
            <View style={[styles.line, styles.lineWide, { backgroundColor: '#E5E7EB' }]} />
            <View style={{ height: 6 }} />
            <View style={[styles.line, styles.sectionHeader, { backgroundColor: accent }]} />
            <View style={[styles.line, styles.lineWide, { backgroundColor: '#E5E7EB' }]} />
            <View style={[styles.line, styles.lineMedium, { backgroundColor: '#E5E7EB' }]} />
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.previewContainer}>
      <View style={styles.minimalLayout}>
        <View style={[styles.line, { width: 60, height: 8, backgroundColor: '#374151', alignSelf: 'center', marginBottom: 4 }]} />
        <View style={[styles.line, { width: 80, height: 4, backgroundColor: '#9CA3AF', alignSelf: 'center', marginBottom: 8 }]} />
        <View style={[styles.divider, { backgroundColor: accent }]} />
        <View style={[styles.line, styles.sectionHeader, { backgroundColor: accent }]} />
        <View style={[styles.line, styles.lineWide, { backgroundColor: '#E5E7EB' }]} />
        <View style={[styles.line, styles.lineMedium, { backgroundColor: '#E5E7EB' }]} />
        <View style={[styles.line, styles.lineWide, { backgroundColor: '#E5E7EB' }]} />
        <View style={{ height: 6 }} />
        <View style={[styles.line, styles.sectionHeader, { backgroundColor: accent }]} />
        <View style={[styles.line, styles.lineWide, { backgroundColor: '#E5E7EB' }]} />
        <View style={[styles.line, styles.lineMedium, { backgroundColor: '#E5E7EB' }]} />
      </View>
    </View>
  );
};

// Animated Template Card
const TemplateCard = ({ template, isSelected, onPress, index }) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const pressAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 50,
      friction: 7,
      delay: index * 80,
      useNativeDriver: true,
    }).start();
  }, []);

  const handlePressIn = () => {
    Animated.spring(pressAnim, { toValue: 0.95, tension: 100, friction: 10, useNativeDriver: true }).start();
  };

  const handlePressOut = () => {
    Animated.spring(pressAnim, { toValue: 1, tension: 100, friction: 10, useNativeDriver: true }).start();
  };

  return (
    <Animated.View style={{ transform: [{ scale: Animated.multiply(scaleAnim, pressAnim) }], opacity: scaleAnim }}>
      <TouchableOpacity
        style={styles.templateCard}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
      >
        <View style={[styles.templatePreview, isSelected && styles.templatePreviewSelected]}>
          <MiniPreview template={template} />
          {isSelected && (
            <View style={styles.selectedBadge}>
              <Feather name="check" size={12} color="white" />
            </View>
          )}
        </View>
        <View style={styles.templateInfo}>
          <Text style={[styles.templateName, isSelected && styles.templateNameSelected]}>
            {template.name}
          </Text>
        </View>
        <Text style={styles.templateCategory}>{template.category}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

// Animated Category Chip
const CategoryChip = ({ label, isActive, onPress }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.9, duration: 100, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, tension: 100, friction: 10, useNativeDriver: true }),
    ]).start();
    onPress();
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        style={[styles.categoryChip, isActive && styles.categoryChipActive]}
        onPress={handlePress}
        activeOpacity={0.8}
      >
        <Text style={[styles.categoryText, isActive && styles.categoryTextActive]}>{label}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const CVPreviewModal = ({ visible, onClose, cvData }) => {
  const { selectedTemplate: savedTemplate, setTemplate } = useCV();

  const [previewingTemplate, setPreviewingTemplate] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showToast, setShowToast] = useState(false);
  const [toastTemplateName, setToastTemplateName] = useState('');

  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const previewSlideAnim = useRef(new Animated.Value(SCREEN_WIDTH)).current;

  const previewData = cvData?.personalInfo?.firstName ? cvData : SAMPLE_DATA;

  const filteredTemplates = TEMPLATES.filter(t => {
    const matchesCategory = selectedCategory === 'All' || t.category === selectedCategory;
    const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(slideAnim, { toValue: 0, tension: 40, friction: 10, useNativeDriver: true }),
        Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
      ]).start();
    }
  }, [visible]);

  const handleTemplatePress = (templateId) => {
    setPreviewingTemplate(templateId);
    setIsLoading(true);
    Animated.spring(previewSlideAnim, { toValue: 0, tension: 50, friction: 10, useNativeDriver: true }).start();
  };

  const handleUseTemplate = () => {
    if (previewingTemplate) {
      setTemplate(previewingTemplate);
      const templateName = TEMPLATES.find(t => t.id === previewingTemplate)?.name;
      setToastTemplateName(templateName);
      setShowToast(true);
    }
  };

  const handleBackToGallery = () => {
    Animated.timing(previewSlideAnim, { toValue: SCREEN_WIDTH, duration: 250, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start(() => {
      setPreviewingTemplate(null);
    });
  };

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(slideAnim, { toValue: SCREEN_HEIGHT, duration: 300, easing: Easing.in(Easing.cubic), useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
    ]).start(() => {
      setPreviewingTemplate(null);
      onClose();
    });
  };

  const html = previewingTemplate ? generateTemplateHTML(previewData, previewingTemplate) : '';
  const previewingTemplateData = TEMPLATES.find(t => t.id === previewingTemplate);

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={handleClose}>
      <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
        <Animated.View style={[styles.container, { transform: [{ translateY: slideAnim }] }]}>
          <SafeAreaView style={styles.safeArea}>

            {/* Success Toast */}
            <SuccessToast
              visible={showToast}
              templateName={toastTemplateName}
              onHide={() => { setShowToast(false); handleClose(); }}
            />

            {/* Gallery View */}
            {!previewingTemplate ? (
              <>
                <View style={styles.header}>
                  <TouchableOpacity onPress={handleClose} style={styles.headerBtn}>
                    <Feather name="chevron-left" size={22} color={colors.textPrimary} />
                  </TouchableOpacity>
                  <Text style={styles.headerTitle}>Choose Template</Text>
                  <View style={styles.headerBtn} />
                </View>

                <View style={styles.searchContainer}>
                  <Feather name="search" size={18} color={colors.textTertiary} />
                  <TextInput
                    style={styles.searchInput}
                    placeholder="Search templates..."
                    placeholderTextColor={colors.textTertiary}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                  />
                </View>

                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesScroll} contentContainerStyle={styles.categoriesContent}>
                  {CATEGORIES.map((cat) => (
                    <CategoryChip
                      key={cat}
                      label={cat}
                      isActive={selectedCategory === cat}
                      onPress={() => setSelectedCategory(cat)}
                    />
                  ))}
                </ScrollView>

                <ScrollView style={styles.gridScroll} contentContainerStyle={styles.gridContent} showsVerticalScrollIndicator={false}>
                  <View style={styles.grid}>
                    {filteredTemplates.map((template, index) => (
                      <TemplateCard
                        key={template.id}
                        template={template}
                        index={index}
                        isSelected={savedTemplate === template.id}
                        onPress={() => handleTemplatePress(template.id)}
                      />
                    ))}
                  </View>
                </ScrollView>
              </>
            ) : (
              /* Preview View */
              <Animated.View style={[styles.previewView, { transform: [{ translateX: previewSlideAnim }] }]}>
                <View style={styles.header}>
                  <TouchableOpacity onPress={handleBackToGallery} style={styles.headerBtn}>
                    <Feather name="chevron-left" size={22} color={colors.textPrimary} />
                  </TouchableOpacity>
                  <View style={styles.headerCenter}>
                    <Text style={styles.headerTitle}>CV Preview</Text>
                    <Text style={styles.headerSubtitle}>{previewingTemplateData?.name}</Text>
                  </View>
                  <TouchableOpacity onPress={handleClose} style={styles.headerBtn}>
                    <Feather name="x" size={20} color={colors.textPrimary} />
                  </TouchableOpacity>
                </View>

                <View style={styles.webViewContainer}>
                  {isLoading && (
                    <View style={styles.loadingOverlay}>
                      <ActivityIndicator size="large" color={colors.primary} />
                      <Text style={styles.loadingText}>Loading preview...</Text>
                    </View>
                  )}
                  <WebView
                    source={{ html }}
                    style={styles.webView}
                    onLoadEnd={() => setIsLoading(false)}
                    scrollEnabled={true}
                    showsVerticalScrollIndicator={true}
                    originWhitelist={['*']}
                  />
                </View>

                <View style={styles.actionBar}>
                  <TouchableOpacity style={styles.backToTemplatesBtn} onPress={handleBackToGallery}>
                    <Feather name="layout" size={18} color={colors.primary} />
                    <Text style={styles.backToTemplatesBtnText}>Templates</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.useTemplateBtn} onPress={handleUseTemplate}>
                    <Feather name="check-circle" size={18} color="white" />
                    <Text style={styles.useTemplateBtnText}>Use This Template</Text>
                  </TouchableOpacity>
                </View>
              </Animated.View>
            )}
          </SafeAreaView>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' },
  container: { flex: 1, backgroundColor: '#FAFBFC', marginTop: 40, borderTopLeftRadius: 24, borderTopRightRadius: 24, overflow: 'hidden' },
  safeArea: { flex: 1 },
  previewView: { flex: 1, backgroundColor: '#FAFBFC' },

  // Header
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14, backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  headerBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#F5F5F5', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '600', color: '#1F2937', letterSpacing: -0.3 },
  headerCenter: { alignItems: 'center' },
  headerSubtitle: { fontSize: 12, color: '#6B7280', marginTop: 2 },

  // Search
  searchContainer: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 16, marginTop: 12, marginBottom: 8, backgroundColor: 'white', borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12, borderWidth: 1, borderColor: '#E5E7EB' },
  searchInput: { flex: 1, marginLeft: 10, fontSize: 15, color: '#1F2937' },

  // Categories
  categoriesScroll: { maxHeight: 52, marginBottom: 8 },
  categoriesContent: { paddingHorizontal: 16, paddingVertical: 8 },
  categoryChip: { paddingHorizontal: 18, paddingVertical: 10, borderRadius: 24, backgroundColor: 'white', marginRight: 10, borderWidth: 1, borderColor: '#E5E7EB' },
  categoryChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  categoryText: { fontSize: 13, color: '#6B7280', fontWeight: '500' },
  categoryTextActive: { color: 'white', fontWeight: '600' },

  // Grid
  gridScroll: { flex: 1 },
  gridContent: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 24 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },

  // Template Card
  templateCard: { width: CARD_WIDTH, marginBottom: 20, alignItems: 'center' },
  templatePreview: {
    width: '100%',
    height: CARD_HEIGHT,
    backgroundColor: 'white',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4
  },
  templatePreviewSelected: { borderColor: colors.primary, borderWidth: 2.5 },
  selectedBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  templateInfo: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  templateName: { fontSize: 15, fontWeight: '600', color: '#1F2937' },
  templateNameSelected: { color: colors.primary },
  templateCategory: { fontSize: 12, color: '#9CA3AF', marginTop: 2 },

  // Mini Preview
  previewContainer: { flex: 1, flexDirection: 'row' },
  sidebar: { width: '40%', padding: 12, alignItems: 'center' },
  photoCircle: { width: 30, height: 30, borderRadius: 15, backgroundColor: 'rgba(255,255,255,0.25)', marginBottom: 10, justifyContent: 'center', alignItems: 'center' },
  photoInner: { width: 22, height: 22, borderRadius: 11, opacity: 0.5 },
  mainContent: { flex: 1, padding: 12, backgroundColor: 'white' },
  headerLayout: { flex: 1, backgroundColor: 'white' },
  headerBanner: { height: 55, justifyContent: 'flex-end', padding: 12 },
  headerContent: { flex: 1, padding: 12 },
  minimalLayout: { flex: 1, padding: 14, backgroundColor: 'white' },
  divider: { height: 2, marginBottom: 12 },
  line: { marginBottom: 5, borderRadius: 3 },
  lineWide: { width: '100%', height: 5 },
  lineMedium: { width: '75%', height: 5 },
  lineShort: { width: '50%', height: 5 },
  nameBar: { width: 55, height: 7, marginBottom: 4 },
  titleBar: { width: 40, height: 4 },
  sectionHeader: { width: 45, height: 5, marginBottom: 8 },

  // Preview WebView
  webViewContainer: { flex: 1, backgroundColor: '#F0F2F5', margin: 12, borderRadius: 16, overflow: 'hidden' },
  webView: { flex: 1, backgroundColor: 'transparent' },
  loadingOverlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center', backgroundColor: 'white', zIndex: 10 },
  loadingText: { marginTop: 12, color: '#6B7280', fontSize: 14 },

  // Action Bar
  actionBar: { flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 16, paddingBottom: 24, backgroundColor: 'white', borderTopWidth: 1, borderTopColor: '#F0F0F0', gap: 12 },
  backToTemplatesBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 14,
    backgroundColor: '#F0F4FF',
    gap: 8,
  },
  backToTemplatesBtnText: { fontSize: 14, color: colors.primary, fontWeight: '600' },
  useTemplateBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    backgroundColor: colors.primary,
    borderRadius: 14,
    gap: 8,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  useTemplateBtnText: { fontSize: 15, fontWeight: '700', color: 'white' },

  // Toast
  toast: {
    position: 'absolute',
    top: 16,
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10B981',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    zIndex: 100,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  toastIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  toastContent: { flex: 1 },
  toastTitle: { fontSize: 15, fontWeight: '700', color: 'white' },
  toastMessage: { fontSize: 13, color: 'rgba(255,255,255,0.9)', marginTop: 2 },
});

export default CVPreviewModal;
export { generateTemplateHTML as getPreviewHTML };
