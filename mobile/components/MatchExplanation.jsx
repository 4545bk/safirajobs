/**
 * Match Explanation Modal
 * Explains why a user matches a job
 */

import React from 'react';
import { View, Text, Modal, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors, spacing, borderRadius } from '../theme';

export default function MatchExplanation({ visible, onClose, matchData }) {
    if (!matchData) return null;

    const { score, reasons = [], missing = [] } = matchData;

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={onClose}
        >
            <TouchableOpacity
                style={styles.overlay}
                activeOpacity={1}
                onPress={onClose}
            >
                <View style={styles.modalContent} onStartShouldSetResponder={() => true}>
                    <View style={styles.header}>
                        <Text style={styles.title}>Match Analysis</Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                            <Feather name="x" size={24} color={colors.textSecondary} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.content}>
                        {/* Score Circle */}
                        <View style={styles.scoreContainer}>
                            <View style={[styles.scoreCircle, { borderColor: score >= 80 ? '#10B981' : '#F59E0B' }]}>
                                <Text style={[styles.scoreText, { color: score >= 80 ? '#10B981' : '#F59E0B' }]}>
                                    {score}%
                                </Text>
                            </View>
                            <Text style={styles.matchLabel}>
                                {score >= 80 ? 'Excellent Match!' : score >= 60 ? 'Good Match' : 'Fair Match'}
                            </Text>
                        </View>

                        {/* Reasons */}
                        {reasons.length > 0 && (
                            <View style={styles.section}>
                                <Text style={styles.sectionTitle}>Why you match</Text>
                                {reasons.map((reason, index) => (
                                    <View key={index} style={styles.reasonItem}>
                                        <Feather name="check-circle" size={18} color="#10B981" />
                                        <Text style={styles.reasonText}>
                                            {typeof reason === 'string' ? reason : reason.message}
                                        </Text>
                                    </View>
                                ))}
                            </View>
                        )}

                        {/* Missing */}
                        {missing.length > 0 && (
                            <View style={styles.section}>
                                <Text style={styles.sectionTitle}>Missing Requirements</Text>
                                {missing.map((item, index) => (
                                    <View key={index} style={styles.reasonItem}>
                                        <Feather name="alert-circle" size={18} color="#EF4444" />
                                        <Text style={styles.reasonText}>
                                            {typeof item === 'string' ? item : item.message}
                                        </Text>
                                    </View>
                                ))}
                            </View>
                        )}

                        <View style={{ height: 40 }} />
                    </ScrollView>

                    <TouchableOpacity style={styles.btn} onPress={onClose}>
                        <Text style={styles.btnText}>Got it</Text>
                    </TouchableOpacity>
                </View>
            </TouchableOpacity>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: 'white',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: spacing.lg,
        maxHeight: '80%',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.textPrimary,
    },
    closeBtn: {
        padding: 4,
    },
    content: {
        maxHeight: 400,
    },
    scoreContainer: {
        alignItems: 'center',
        marginBottom: 24,
    },
    scoreCircle: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 4,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    scoreText: {
        fontSize: 32,
        fontWeight: 'bold',
    },
    matchLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.textSecondary,
    },
    section: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.textPrimary,
        marginBottom: 12,
    },
    reasonItem: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 12,
    },
    reasonText: {
        flex: 1,
        fontSize: 14,
        color: colors.textSecondary,
        lineHeight: 20,
    },
    btn: {
        backgroundColor: colors.primary,
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 10,
    },
    btnText: {
        fontSize: 16,
        fontWeight: '600',
        color: 'white',
    },
});
