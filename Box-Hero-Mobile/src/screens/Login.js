import {
    Text,
    View,
    StyleSheet,
    Image,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Alert,
} from 'react-native';
import { useState } from 'react';

import { login } from '../service/login.service';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import { logout, login as loginRedux } from '../redux/auth/authSlice';

export default function Login() {
    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: '#f0f4f8',
        },
        headerBackground: {
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 300,
            backgroundColor: '#2563eb',
            borderBottomLeftRadius: 50,
            borderBottomRightRadius: 50,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
            elevation: 5,
        },
        scrollContent: {
            flexGrow: 1,
            paddingHorizontal: 24,
            paddingTop: 80,
            alignItems: 'center',
        },
        logoContainer: {
            alignItems: 'center',
            marginBottom: 40,
            zIndex: 1,
        },
        logo: {
            width: 120,
            height: 120,
            borderRadius: 60,
            marginBottom: 16,
            borderWidth: 4,
            borderColor: 'white',
        },
        welcomeText: {
            fontSize: 28,
            color: 'white',
            marginBottom: 8,
            marginTop: 10,
        },
        subText: {
            fontSize: 16,
            color: '#e0e7ff',
            marginBottom: 30,
        },
        formContainer: {
            width: '100%',
            backgroundColor: 'white',
            borderRadius: 16,
            padding: 24,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 3.84,
            elevation: 5,
        },
        inputGroup: {
            marginBottom: 20,
        },
        label: {
            fontSize: 14,
            fontWeight: '600',
            color: '#374151',
            marginBottom: 8,
        },
        inputWrapper: {
            flexDirection: 'row',
            alignItems: 'center',
            borderWidth: 1,
            borderColor: '#e5e7eb',
            borderRadius: 12,
            backgroundColor: '#f9fafb',
            paddingHorizontal: 12,
            height: 50,
        },
        inputIcon: {
            marginRight: 10,
        },
        input: {
            flex: 1,
            fontSize: 16,
            color: '#1f2937',
            height: '100%',
        },
        iconEye: {
            padding: 4,
        },
        loginButton: {
            backgroundColor: '#2563eb',
            borderRadius: 12,
            paddingVertical: 16,
            alignItems: 'center',
            marginTop: 10,
            shadowColor: '#2563eb',
            shadowOffset: {
                width: 0,
                height: 4,
            },
            shadowOpacity: 0.3,
            shadowRadius: 4.65,
            elevation: 8,
        },
        loginButtonText: {
            color: 'white',
            fontSize: 16,
            fontWeight: 'bold',
        },
    });

    const navigation = useNavigation();
    const dispatch = useDispatch();

    const [user, setUser] = useState({
        userName: '123@gmail.com',
        password: '123456',
    });

    const [showPassword, setShowPassword] = useState(false);

    const handleOnChange = (key, value) => {
        setUser((prev) => ({ ...prev, [key]: value }));
    };

    const handleLogin = async (user) => {
        if (!user.userName && !user.password) {
            Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ email và mật khẩu');
            return;
        }
        if (!user.userName) {
            Alert.alert('Lỗi', 'Vui lòng nhập email');
            return;
        }
        if (!user.password) {
            Alert.alert('Lỗi', 'Vui lòng nhập mật khẩu');
            return;
        }

        try {
            const { res, employeeInfo, roles } = await login(user.userName, user.password);

            if (res.data.status === 'OK') {
                navigation.navigate('Tabs');
                dispatch(loginRedux({ ...employeeInfo, empRole: roles }));
            }
        } catch (error) {
            console.log('Login error:', error);
        }
    };

    return (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
            <View style={styles.headerBackground} />
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <View style={styles.logoContainer}>
                    <Image source={require('../../assets/logo_v2.jpg')} style={styles.logo} />
                    <Text style={styles.welcomeText}>Welcome Back!</Text>
                    <Text style={styles.subText}>Đăng nhập để tiếp tục</Text>
                </View>

                <View style={styles.formContainer}>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Email</Text>
                        <View style={styles.inputWrapper}>
                            <Feather name="user" size={20} color="#9ca3af" style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Nhập email"
                                placeholderTextColor="#9ca3af"
                                value={user.userName}
                                onChangeText={(text) => handleOnChange('userName', text)}
                                autoCapitalize="none"
                            />
                        </View>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Mật khẩu</Text>
                        <View style={styles.inputWrapper}>
                            <Feather name="lock" size={20} color="#9ca3af" style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Nhập mật khẩu"
                                placeholderTextColor="#9ca3af"
                                secureTextEntry={!showPassword}
                                value={user.password}
                                onChangeText={(text) => handleOnChange('password', text)}
                            />
                            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.iconEye}>
                                <Feather name={showPassword ? 'eye-off' : 'eye'} size={20} color="#9ca3af" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    <TouchableOpacity style={styles.loginButton} onPress={() => handleLogin(user)}>
                        <Text style={styles.loginButtonText}>Đăng nhập</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}
