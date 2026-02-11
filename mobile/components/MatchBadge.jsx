/**
 * Match Badge Component
 * Displays match percentage with color coding
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors } from '../theme';

export default function MatchBadge({ score, size = 'small' }) {
    if (!score || score < 50) return null;

    let bg, color, icon;
    if (score >= 80) {
        bg = '#D1FAE5';
        color = '#059669';
        icon = 'check-circle';
    } else if (score >= 60) {
        bg = '#FEF3C7';
        color = '#D97706';
        icon = 'alert-circle';
    } else {
        bg = '#F3F4F6';
        color = '#6B7280';
        icon = 'help-circle';
    }

    const containerStyle = size === 'large' ? styles.badgeLarge : styles.badgeSmall;
    const textStyle = size === 'large' ? styles.textLarge : styles.textSmall;

    return (
        <View style={[styles.badge, containerStyle, { backgroundColor: bg }]}>
            <Feather name={icon} size={size === 'large' ? 16 : 12} color={color} />
            <Text style={[styles.text, textStyle, { color }]}>
                {score}% Match
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        borderRadius: 20,
    },
    badgeSmall: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        gap: 4,
    },
    badgeLarge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        gap: 8,
    },
    text: {
        fontWeight: 'bold',
    },
    textSmall: {
        fontSize: 10,
    },
    textLarge: {
        fontSize: 14,
    },
});
