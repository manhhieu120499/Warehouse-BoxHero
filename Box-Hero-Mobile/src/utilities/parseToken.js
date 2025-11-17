export default function parseToken(key) {
    const token = AsyncStorage.getItem(key);
    if (token) {
        return { ...token };
    }
    return null;
}
