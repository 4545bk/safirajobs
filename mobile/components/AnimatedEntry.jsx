import React, { useEffect, useRef } from 'react';
import { Animated, View, StyleSheet } from 'react-native';

const AnimatedEntry = ({
    children,
    delay = 0,
    duration = 500,
    style,
    direction = 'up' // 'up', 'down', 'left', 'right'
}) => {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(direction === 'up' ? 50 : direction === 'down' ? -50 : 0)).current;
    const slideXAnim = useRef(new Animated.Value(direction === 'left' ? 50 : direction === 'right' ? -50 : 0)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: duration,
                delay: delay,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: duration,
                delay: delay,
                useNativeDriver: true,
            }),
            Animated.timing(slideXAnim, {
                toValue: 0,
                duration: duration,
                delay: delay,
                useNativeDriver: true,
            })
        ]).start();
    }, [delay, duration, fadeAnim, slideAnim, slideXAnim]);

    return (
        <Animated.View
            style={[
                style,
                {
                    opacity: fadeAnim,
                    transform: [
                        { translateY: slideAnim },
                        { translateX: slideXAnim }
                    ]
                }
            ]}
        >
            {children}
        </Animated.View>
    );
};

export default AnimatedEntry;
