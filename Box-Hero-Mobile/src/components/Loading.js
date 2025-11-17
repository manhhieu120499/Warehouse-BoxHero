import React from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';

const Loading = () => {
    return (
        <View style={styles.overlayLoading}>
            <ActivityIndicator size="large" color="#000000" />
        </View>
    );
};

const styles = StyleSheet.create({
    overlayLoading: {
        ...StyleSheet.absoluteFillObject,

        zIndex: 1010,

        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',

        backgroundColor: 'rgba(0,0,0,0.08)',
    },
});

export default Loading;
