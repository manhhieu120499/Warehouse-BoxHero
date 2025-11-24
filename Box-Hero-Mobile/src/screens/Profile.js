import React, { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Image,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
    Dimensions,
    Alert,
} from 'react-native';
import Modal from '../components/Modal';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../redux/auth/authSlice';
import {
    Eye,
    EyeOff,
    X,
    User,
    Calendar,
    Phone,
    MapPin,
    Briefcase,
    Shield,
    CreditCard,
    Lock,
    LogOut,
} from 'lucide-react-native';
import { getEmployeeInfo } from '../service/employee.service';
import parseToken from '../utilities/parseToken';
import { DefaultLayout } from '../layouts';
import Header from '../layouts/Header';
import { formatRole } from '../constans';
import request from '../config/axiosConfig';

const { width } = Dimensions.get('window');

const FormGroup = ({ label, value, icon, multiline = false, typeDate = false }) => (
    <View style={styles.formGroup}>
        <Text style={styles.label}>{label}</Text>
        <View style={styles.inputContainer}>
            {icon && <View style={styles.iconContainer}>{icon}</View>}
            <TextInput
                style={[styles.input, multiline && styles.multilineInput]}
                value={typeDate ? new Date(value).toLocaleDateString('vi-VN') : value ? String(value) : ''}
                editable={false}
                multiline={multiline}
            />
        </View>
    </View>
);

const Profile = () => {
    const dispatch = useDispatch();
    const navigation = useNavigation();
    const [employeeData, setEmployeeData] = useState(null);
    const [viewDetailRole, setViewDetailRole] = useState(false);
    const [changePasswordVisible, setChangePasswordVisible] = useState(false);
    const [passwordForm, setPasswordForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });
    const [showPassword, setShowPassword] = useState({
        current: false,
        new: false,
        confirm: false,
    });
    const currentUser = useSelector((state) => state.AuthSlice.user);

    useEffect(() => {
        setEmployeeData(currentUser);
    }, [currentUser]);

    const renderGender = (gender) => (
        <View style={styles.genderContainer}>
            <Text style={styles.label}>Giới tính</Text>
            <View style={styles.genderOptions}>
                <View style={styles.genderOption}>
                    <View style={[styles.radioCircle, gender === 'male' && styles.radioSelected]} />
                    <Text style={styles.genderText}>Nam</Text>
                </View>
                <View style={styles.genderOption}>
                    <View style={[styles.radioCircle, gender === 'female' && styles.radioSelected]} />
                    <Text style={styles.genderText}>Nữ</Text>
                </View>
            </View>
        </View>
    );

    const renderPasswordInput = (label, value, key, showKey) => (
        <View style={styles.formGroup}>
            <Text style={styles.label}>{label}</Text>
            <View style={styles.inputContainer}>
                <View style={styles.iconContainer}>
                    <Lock size={18} color="#6B7280" />
                </View>
                <TextInput
                    style={styles.input}
                    value={value}
                    onChangeText={(text) => setPasswordForm({ ...passwordForm, [key]: text })}
                    secureTextEntry={!showPassword[showKey]}
                    placeholder={`Nhập ${label.toLowerCase()}`}
                    placeholderTextColor="#9CA3AF"
                />
                <TouchableOpacity
                    onPress={() => setShowPassword({ ...showPassword, [showKey]: !showPassword[showKey] })}
                    style={styles.eyeButton}
                >
                    {showPassword[showKey] ? <Eye size={20} color="#6B7280" /> : <EyeOff size={20} color="#6B7280" />}
                </TouchableOpacity>
            </View>
        </View>
    );

    const handleChangePassword = async () => {
        try {
            const { currentPassword, newPassword, confirmPassword } = passwordForm;

            if (!currentPassword || !newPassword || !confirmPassword) {
                Alert.alert('Thông báo', 'Vui lòng nhập đầy đủ thông tin');
                return;
            }

            if (newPassword !== confirmPassword) {
                Alert.alert('Thông báo', 'Mật khẩu xác nhận không khớp');
                return;
            }

            if (newPassword === currentPassword) {
                Alert.alert('Thông báo', 'Mật khẩu mới không được trùng với mật khẩu hiện tại');
                return;
            }

            // Handle password change logic here
            const { accessToken, employeeID, email } = await parseToken('tokenUser');
            const updateResult = await request.post(
                '/account/change-password',
                {
                    email,
                    oldPassword: currentPassword,
                    newPassword,
                    confirmPassword,
                },
                {
                    headers: {
                        token: `Bearer ${accessToken}`,
                        employeeID,
                    },
                },
            );

            if (updateResult.data?.status === 'OK') {
                setChangePasswordVisible(false);
                Alert.alert('Thành công', 'Đổi mật khẩu thành công');
                setPasswordForm({
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: '',
                });
            }
        } catch (error) {
            console.log(error);
            Alert.alert(
                'Lỗi',
                Array.isArray(error.response.data.message)
                    ? error.response.data.message[0]
                    : error.response.data.message,
            );
        }
    };

    const handleLogout = () => {
        Alert.alert('Đăng xuất', 'Bạn có chắc chắn muốn đăng xuất?', [
            {
                text: 'Hủy',
                style: 'cancel',
            },
            {
                text: 'Đăng xuất',
                style: 'destructive',
                onPress: async () => {
                    try {
                        await AsyncStorage.removeItem('tokenUser');
                        await AsyncStorage.removeItem('warehouse');
                        dispatch(logout());
                        navigation.reset({
                            index: 0,
                            routes: [{ name: 'Login' }],
                        });
                    } catch (error) {
                        console.error('Error logging out:', error);
                        Alert.alert('Lỗi', 'Có lỗi xảy ra khi đăng xuất');
                    }
                },
            },
        ]);
    };

    if (!employeeData) {
        return (
            <DefaultLayout>
                <Header title="Thông tin nhân viên" />
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>Không thể tải thông tin nhân viên</Text>
                </View>
            </DefaultLayout>
        );
    }

    return (
        <DefaultLayout>
            <Header title="Thông tin cá nhân" />
            <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
                <View style={styles.card}>
                    <View style={styles.avatarContainer}>
                        <Image
                            source={{
                                uri:
                                    employeeData.image ||
                                    'https://upload.wikimedia.org/wikipedia/commons/thumb/5/59/User-avatar.svg/2048px-User-avatar.svg.png',
                            }}
                            style={styles.avatar}
                        />
                        <Text style={styles.name}>{employeeData.employeeName}</Text>
                    </View>

                    <View style={styles.section}>
                        <View style={styles.row}>
                            <View style={styles.col}>
                                <FormGroup
                                    label="Mã nhân viên"
                                    value={employeeData.employeeID}
                                    icon={<User size={18} color="#6B7280" />}
                                />
                            </View>
                            <View style={styles.col}>
                                <FormGroup
                                    label="CCCD"
                                    value={employeeData.cccd}
                                    icon={<CreditCard size={18} color="#6B7280" />}
                                />
                            </View>
                        </View>

                        <View style={styles.row}>
                            <View style={styles.col}>
                                <FormGroup
                                    label="Ngày sinh"
                                    value={employeeData.dob}
                                    icon={<Calendar size={18} color="#6B7280" />}
                                    typeDate={true}
                                />
                            </View>
                            <View style={styles.col}>
                                <FormGroup
                                    label="Số điện thoại"
                                    value={employeeData.phoneNumber}
                                    icon={<Phone size={18} color="#6B7280" />}
                                />
                            </View>
                        </View>

                        {renderGender(employeeData.gender)}

                        <FormGroup
                            label="Địa chỉ"
                            value={employeeData.address}
                            icon={<MapPin size={18} color="#6B7280" />}
                        />

                        <View style={styles.row}>
                            <View style={styles.col}>
                                <FormGroup
                                    label="Ngày vào làm"
                                    value={employeeData.statusWork}
                                    icon={<Briefcase size={18} color="#6B7280" />}
                                />
                            </View>
                            <View style={styles.col}>
                                <FormGroup
                                    label="Mã kho"
                                    value={employeeData.warehouseID}
                                    icon={<Briefcase size={18} color="#6B7280" />}
                                />
                            </View>
                        </View>

                        <View style={styles.roleContainer}>
                            <Text style={styles.label}>Chức vụ</Text>
                            <View style={styles.roleInputContainer}>
                                <Shield size={18} color="#6B7280" style={styles.icon} />
                                <Text style={styles.roleValue} numberOfLines={1}>
                                    {employeeData.empRole?.map((r) => formatRole[r.roleName] || r.roleName).join(', ')}
                                </Text>
                                <TouchableOpacity onPress={() => setViewDetailRole(true)} style={styles.eyeButton}>
                                    <Eye size={20} color="#3B82F6" />
                                </TouchableOpacity>
                            </View>
                        </View>

                        <FormGroup
                            label="Trạng thái"
                            value={employeeData.status === 'ACTIVE' ? 'Đang làm' : 'Nghỉ việc'}
                            icon={<Briefcase size={18} color="#6B7280" />}
                        />

                        {employeeData.status === 'INACTIVE' && (
                            <FormGroup
                                label="Ngày nghỉ làm"
                                value={employeeData.endDate}
                                icon={<Calendar size={18} color="#6B7280" />}
                            />
                        )}

                        <TouchableOpacity
                            style={styles.changePasswordButton}
                            onPress={() => setChangePasswordVisible(true)}
                        >
                            <Lock size={18} color="#3B82F6" style={styles.buttonIcon} />
                            <Text style={styles.changePasswordText}>Đổi mật khẩu</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                            <LogOut size={18} color="#EF4444" style={styles.buttonIcon} />
                            <Text style={styles.logoutButtonText}>Đăng xuất</Text>
                        </TouchableOpacity>
                    </View>
                </View>
                <View style={{ height: 20 }} />
            </ScrollView>

            {/* Role Modal */}
            <Modal isOpenInfo={viewDetailRole} onClose={() => setViewDetailRole(false)}>
                <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>Các quyền truy cập</Text>
                </View>
                <ScrollView style={styles.modalBody}>
                    {employeeData.empRole?.map((item, index) => (
                        <View key={index} style={styles.roleItem}>
                            <View style={styles.roleDot} />
                            <Text style={styles.roleItemText}>{formatRole[item.roleName] || item.roleName}</Text>
                        </View>
                    ))}
                </ScrollView>
            </Modal>

            {/* Change Password Modal */}
            <Modal
                showButtonClose={false}
                isOpenInfo={changePasswordVisible}
                onClose={() => setChangePasswordVisible(false)}
            >
                <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>Đổi mật khẩu</Text>
                </View>
                <View style={styles.modalBody}>
                    {renderPasswordInput(
                        'Mật khẩu hiện tại',
                        passwordForm.currentPassword,
                        'currentPassword',
                        'current',
                    )}
                    {renderPasswordInput('Mật khẩu mới', passwordForm.newPassword, 'newPassword', 'new')}
                    {renderPasswordInput(
                        'Xác nhận mật khẩu',
                        passwordForm.confirmPassword,
                        'confirmPassword',
                        'confirm',
                    )}
                </View>
                <View style={styles.modalFooter}>
                    <TouchableOpacity style={styles.cancelButton} onPress={() => setChangePasswordVisible(false)}>
                        <Text style={styles.cancelButtonText}>Hủy</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.saveButton} onPress={handleChangePassword}>
                        <Text style={styles.saveButtonText}>Đổi mật khẩu</Text>
                    </TouchableOpacity>
                </View>
            </Modal>
        </DefaultLayout>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F3F4F6',
        padding: 16,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorText: {
        fontSize: 16,
        color: '#EF4444',
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    avatarContainer: {
        alignItems: 'center',
        marginBottom: 24,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 3,
        borderColor: '#E5E7EB',
        marginBottom: 12,
    },
    name: {
        fontSize: 20,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 4,
    },
    roleText: {
        fontSize: 14,
        color: '#6B7280',
        backgroundColor: '#F3F4F6',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 20,
        overflow: 'hidden',
    },
    section: {
        gap: 16,
    },
    row: {
        flexDirection: 'row',
        gap: 12,
    },
    col: {
        flex: 1,
    },
    label: {
        fontSize: 13,
        fontWeight: '600',
        color: '#4B5563',
        marginBottom: 6,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 10,
        paddingHorizontal: 12,
    },
    iconContainer: {
        marginRight: 8,
    },
    input: {
        flex: 1,
        paddingVertical: 10,
        fontSize: 14,
        color: '#111827',
    },
    multilineInput: {
        height: 60,
        textAlignVertical: 'center',
    },
    genderContainer: {
        marginBottom: 12,
    },
    genderOptions: {
        flexDirection: 'row',
        gap: 24,
    },
    genderOption: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    radioCircle: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#D1D5DB',
    },
    radioSelected: {
        borderColor: '#3B82F6',
        backgroundColor: '#3B82F6',
    },
    genderText: {
        fontSize: 14,
        color: '#374151',
    },
    roleContainer: {
        marginBottom: 12,
    },
    roleInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 10,
    },
    icon: {
        marginRight: 8,
    },
    roleValue: {
        flex: 1,
        fontSize: 14,
        color: '#111827',
    },
    eyeButton: {
        padding: 4,
    },

    // Modal
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContent: {
        width: '100%',
        maxWidth: 400,
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#111827',
    },
    modalBody: {
        maxHeight: 300,
        gap: 15,
    },
    roleItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    roleDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#3B82F6',
        marginRight: 12,
    },
    roleItemText: {
        fontSize: 15,
        color: '#374151',
    },
    changePasswordButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#EFF6FF',
        paddingVertical: 12,
        borderRadius: 10,
        marginTop: 8,
        borderWidth: 1,
        borderColor: '#BFDBFE',
    },
    buttonIcon: {
        marginRight: 8,
    },
    changePasswordText: {
        color: '#3B82F6',
        fontWeight: '600',
        fontSize: 15,
    },
    buttonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 15,
    },
    modalFooter: {
        marginTop: 30,
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 12,
    },
    cancelButton: {
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 8,
        backgroundColor: '#F3F4F6',
    },
    cancelButtonText: {
        color: '#4B5563',
        fontWeight: '600',
    },
    saveButton: {
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 8,
        backgroundColor: '#3B82F6',
    },
    saveButtonText: {
        color: '#fff',
        fontWeight: '600',
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FEF2F2',
        paddingVertical: 12,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#FECACA',
    },
    logoutButtonText: {
        color: '#EF4444',
        fontWeight: '600',
        fontSize: 15,
    },
});

export default Profile;
