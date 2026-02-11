/**
 * Simple Line Chart using react-native-svg
 * Avoiding external dependencies by building a lightweight chart
 */

import React from 'react';
import { View, Text, Dimensions, StyleSheet } from 'react-native';
import Svg, { Path, Circle, Line, Text as SvgText, Defs, LinearGradient, Stop } from 'react-native-svg';
import { colors } from '../theme';

const { width } = Dimensions.get('window');

export default function AnalyticsChart({ data = [], labels = [], height = 220 }) {
    if (!data || data.length === 0) {
        return (
            <View style={[styles.container, { height, justifyContent: 'center', alignItems: 'center' }]}>
                <Text style={styles.noDataText}>No data available</Text>
            </View>
        );
    }

    const chartWidth = width - 64; // Padding
    const paddingBottom = 30;
    const chartHeight = height - paddingBottom;

    // Calculate scaling
    const maxValue = Math.max(...data, 5); // Minimum scale of 5
    const points = data.map((value, index) => {
        const x = (index / (data.length - 1)) * chartWidth;
        const y = chartHeight - (value / maxValue) * chartHeight;
        return { x, y, value };
    });

    // Create path
    const pathData = points.map((p, i) =>
        `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`
    ).join(' ');

    // Create gradient fill path (closed)
    const fillPathData = `${pathData} L ${chartWidth} ${chartHeight} L 0 ${chartHeight} Z`;

    return (
        <View style={styles.container}>
            <Svg width={chartWidth} height={height}>
                <Defs>
                    <LinearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                        <Stop offset="0" stopColor={colors.primary} stopOpacity="0.2" />
                        <Stop offset="1" stopColor={colors.primary} stopOpacity="0" />
                    </LinearGradient>
                </Defs>

                {/* Grid Lines */}
                <Line x1="0" y1={chartHeight} x2={chartWidth} y2={chartHeight} stroke="#E5E7EB" strokeWidth="1" />
                <Line x1="0" y1={0} x2={chartWidth} y2={0} stroke="#E5E7EB" strokeWidth="1" strokeDasharray="4 4" />
                <Line x1="0" y1={chartHeight / 2} x2={chartWidth} y2={chartHeight / 2} stroke="#E5E7EB" strokeWidth="1" strokeDasharray="4 4" />

                {/* X-Axis Labels (Show every 5th roughly) */}
                {labels.map((label, index) => {
                    const x = (index / (labels.length - 1)) * chartWidth;
                    // Only show if label is not empty (logic from backend)
                    if (!label) return null;

                    return (
                        <SvgText
                            key={index}
                            x={x}
                            y={height - 5}
                            fontSize="10"
                            fill="#6B7280"
                            textAnchor="middle"
                        >
                            {label}
                        </SvgText>
                    );
                })}

                {/* Gradient Fill */}
                <Path
                    d={fillPathData}
                    fill="url(#gradient)"
                />

                {/* Line */}
                <Path
                    d={pathData}
                    stroke={colors.primary}
                    strokeWidth="2"
                    fill="none"
                />

                {/* Dots */}
                {points.map((p, i) => (
                    <Circle
                        key={i}
                        cx={p.x}
                        cy={p.y}
                        r="3"
                        fill="white"
                        stroke={colors.primary}
                        strokeWidth="2"
                    />
                ))}
            </Svg>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 16,
        marginVertical: 8,
    },
    noDataText: {
        color: '#9CA3AF',
        fontSize: 14,
    },
});
