/**
 * Animation Utilities for CV Builder
 * Reusable animated components and hooks
 */

import React, { useRef, useEffect } from 'react';
import { Animated, Easing } from 'react-native';

/**
 * Hook for fade-in animation
 */
export const useFadeIn = (delay = 0, duration = 400) => {
    const opacity = useRef(new Animated.Value(0)).current;
    const translateY = useRef(new Animated.Value(20)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(opacity, {
                toValue: 1,
                duration,
                delay,
                useNativeDriver: true,
                easing: Easing.out(Easing.cubic),
            }),
            Animated.timing(translateY, {
                toValue: 0,
                duration,
                delay,
                useNativeDriver: true,
                easing: Easing.out(Easing.cubic),
            }),
        ]).start();
    }, []);

    return { opacity, transform: [{ translateY }] };
};

/**
 * Hook for staggered list item animation
 */
export const useStaggerAnimation = (index, baseDelay = 50) => {
    const animValue = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.spring(animValue, {
            toValue: 1,
            tension: 50,
            friction: 8,
            delay: index * baseDelay,
            useNativeDriver: true,
        }).start();
    }, []);

    return {
        opacity: animValue,
        transform: [
            { scale: animValue },
            {
                translateY: animValue.interpolate({
                    inputRange: [0, 1],
                    outputRange: [30, 0],
                }),
            },
        ],
    };
};

/**
 * Hook for button press animation
 */
export const usePressAnimation = () => {
    const scale = useRef(new Animated.Value(1)).current;

    const onPressIn = () => {
        Animated.spring(scale, {
            toValue: 0.95,
            tension: 100,
            friction: 10,
            useNativeDriver: true,
        }).start();
    };

    const onPressOut = () => {
        Animated.spring(scale, {
            toValue: 1,
            tension: 100,
            friction: 10,
            useNativeDriver: true,
        }).start();
    };

    return { scale, onPressIn, onPressOut };
};

/**
 * Hook for input focus animation
 */
export const useFocusAnimation = () => {
    const borderColor = useRef(new Animated.Value(0)).current;
    const scale = useRef(new Animated.Value(1)).current;

    const onFocus = () => {
        Animated.parallel([
            Animated.timing(borderColor, {
                toValue: 1,
                duration: 200,
                useNativeDriver: false,
            }),
            Animated.spring(scale, {
                toValue: 1.01,
                tension: 100,
                friction: 10,
                useNativeDriver: true,
            }),
        ]).start();
    };

    const onBlur = () => {
        Animated.parallel([
            Animated.timing(borderColor, {
                toValue: 0,
                duration: 200,
                useNativeDriver: false,
            }),
            Animated.spring(scale, {
                toValue: 1,
                tension: 100,
                friction: 10,
                useNativeDriver: true,
            }),
        ]).start();
    };

    return { borderColor, scale, onFocus, onBlur };
};

/**
 * Animated wrapper component for list items
 */
export const AnimatedListItem = ({ children, index, style }) => {
    const animStyle = useStaggerAnimation(index);
    return (
        <Animated.View style={[style, animStyle]}>
            {children}
        </Animated.View>
    );
};

/**
 * Animated wrapper with fade-in effect
 */
export const FadeInView = ({ children, delay = 0, style }) => {
    const animStyle = useFadeIn(delay);
    return (
        <Animated.View style={[style, animStyle]}>
            {children}
        </Animated.View>
    );
};

/**
 * Shake animation for error feedback
 */
export const useShakeAnimation = () => {
    const shakeAnim = useRef(new Animated.Value(0)).current;

    const shake = () => {
        Animated.sequence([
            Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
        ]).start();
    };

    return { translateX: shakeAnim, shake };
};

/**
 * Success checkmark animation
 */
export const useSuccessAnimation = () => {
    const scale = useRef(new Animated.Value(0)).current;
    const opacity = useRef(new Animated.Value(0)).current;

    const animate = () => {
        Animated.parallel([
            Animated.spring(scale, {
                toValue: 1,
                tension: 50,
                friction: 5,
                useNativeDriver: true,
            }),
            Animated.timing(opacity, {
                toValue: 1,
                duration: 200,
                useNativeDriver: true,
            }),
        ]).start();
    };

    const reset = () => {
        scale.setValue(0);
        opacity.setValue(0);
    };

    return { scale, opacity, animate, reset };
};

export default {
    useFadeIn,
    useStaggerAnimation,
    usePressAnimation,
    useFocusAnimation,
    useShakeAnimation,
    useSuccessAnimation,
    AnimatedListItem,
    FadeInView,
};
