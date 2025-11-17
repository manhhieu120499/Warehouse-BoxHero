import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import Navigation from './src/navigation/Navigation';
import Toast from 'react-native-toast-message';

export default function App() {
    return (
        <View style={styles.container}>
            <Navigation />
            <Toast />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
});
