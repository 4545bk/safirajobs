import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';

/**
 * Error Boundary — Catches unhandled JS errors and shows a friendly screen
 * instead of crashing. Required for Play Store quality standards.
 */
export default class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        // In production, you would log this to a service like Sentry
        console.error('App Error:', error, errorInfo);
    }

    handleRetry = () => {
        this.setState({ hasError: false, error: null });
    };

    render() {
        if (this.state.hasError) {
            return (
                <View style={styles.container}>
                    <Feather name="alert-triangle" size={64} color="#EF4444" />
                    <Text style={styles.title}>Something went wrong</Text>
                    <Text style={styles.message}>
                        An unexpected error occurred. Please try again.
                    </Text>
                    <TouchableOpacity style={styles.button} onPress={this.handleRetry}>
                        <Feather name="refresh-cw" size={18} color="#FFF" />
                        <Text style={styles.buttonText}>Try Again</Text>
                    </TouchableOpacity>
                </View>
            );
        }

        return this.props.children;
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#1a1a2e',
        padding: 32,
    },
    title: {
        fontSize: 22,
        fontWeight: '700',
        color: '#FFFFFF',
        marginTop: 20,
        marginBottom: 8,
    },
    message: {
        fontSize: 15,
        color: '#94A3B8',
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 24,
    },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#3B82F6',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 12,
        gap: 8,
    },
    buttonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '600',
    },
});
