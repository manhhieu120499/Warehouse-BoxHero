import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import Navigation from './src/navigation/Navigation';
import Toast from 'react-native-toast-message';
import { setGlobalLoadingHandler } from './src/config/axiosConfig';
import { useEffect, useState } from 'react';
import { Provider } from 'react-redux';
import store from './src/redux/store';

export default function App() {
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setGlobalLoadingHandler(setLoading);
    }, []);
    return (
        <Provider store={store}>
            <View style={styles.container}>
                <Navigation />
                <Toast />
                {loading && (
                    <View style={styles.overlay}>
                        <ActivityIndicator size="large" color="#007bff" />
                    </View>
                )}
            </View>
        </Provider>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 999,
    },
});
