import AsyncStorage from '@react-native-async-storage/async-storage';

export default async function parseToken(key) {
    try {
        const token = await AsyncStorage.getItem(key);

        if (token) {
            return JSON.parse(token);
        }

        return null;
    } catch (error) {
        console.error('Error parsing token:', error);
        return null;
    }
}
