import { Text, View, StyleSheet, Image, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { DefaultLayout } from '../layouts';
import { useState } from 'react';
import { ToastMessage } from '../components/common/ToastMessage';
import { login } from '../service/LoginService';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

export default function Login() {
    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: 'white',
            padding: 20,
        },
        logoContainer: {
            flex: 3,
            justifyContent: 'center',
            alignItems: 'center',
        },
        logo: {
            width: 200,
            height: 200,
            borderRadius: 120,
            boxShadow: '0 0 8px rgba(0,0,0,0.1)',
            objectFit: 'cover',
        },
        formContainer: {
            flex: 3,
            justifyContent: 'flex-start',
        },
        inputGroup: {
            marginBottom: 20,
        },
        label: {
            fontSize: 16,
            fontWeight: '600',
            color: '#333',
            marginBottom: 8,
        },
        inputWrapper: {
            position: 'relative',
            justifyContent: 'center',
        },
        input: {
            borderWidth: 1,
            borderColor: '#ddd',
            borderRadius: 8,
            paddingHorizontal: 15,
            paddingVertical: 12,
            fontSize: 16,
            backgroundColor: '#f9f9f9',
            paddingRight: 40, // Chừa khoảng cho icon
        },
        iconEye: {
            position: 'absolute',
            right: 10,
            top: '45%',
            transform: [{ translateY: -11 }],
            padding: 4,
        },
        loginButton: {
            backgroundColor: '#007bff',
            borderRadius: 8,
            paddingVertical: 15,
            alignItems: 'center',
            marginTop: 20,
        },
        loginButtonText: {
            color: 'white',
            fontSize: 18,
            fontWeight: '600',
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

    const navigation = useNavigation();

    const [user, setUser] = useState({
        userName: '',
        password: '',
    });

    const [showPassword, setShowPassword] = useState(false);

    const handleOnChange = (key, value) => {
        setUser((prev) => ({ ...prev, [key]: value }));
    };

    const handleLogin = async (user) => {
        if (!user.userName && !user.password) {
            ToastMessage({ status: 'error', message: 'Vui lòng nhập đầy đủ username và password' });
            return;
        }
        if (!user.userName) {
            ToastMessage({ status: 'error', message: 'Vui lòng nhập username' });
            return;
        }
        if (!user.password) {
            ToastMessage({ status: 'error', message: 'Vui lòng nhập password' });
            return;
        }
        try {
            const res = await login(user.userName, user.password);

            if (res) {
                // chuyển trang khi login thành công
                navigation.navigate('Tabs');
            } else {
                return;
            }
        } catch (err) {
            return;
        }
    };

    return (
        <DefaultLayout>
            <View style={styles.container}>
                <View style={styles.logoContainer}>
                    <Image source={require('../../assets/logo_v2.jpg')} style={styles.logo} />
                </View>

                <View style={styles.formContainer}>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Username</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Nhập username"
                            placeholderTextColor="#999"
                            value={user.userName}
                            onChangeText={(text) => handleOnChange('userName', text)}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Password</Text>
                        <View style={styles.inputWrapper}>
                            <TextInput
                                style={styles.input}
                                placeholder="Nhập password"
                                placeholderTextColor="#999"
                                secureTextEntry={!showPassword}
                                value={user.password}
                                onChangeText={(text) => handleOnChange('password', text)}
                            />
                            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.iconEye}>
                                <Feather name={showPassword ? 'eye-off' : 'eye'} size={22} color="#999" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    <TouchableOpacity style={styles.loginButton} onPress={() => handleLogin(user)}>
                        <Text style={styles.loginButtonText}>Login</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </DefaultLayout>
    );
}
