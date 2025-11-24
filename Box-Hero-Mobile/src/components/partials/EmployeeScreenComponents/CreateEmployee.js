import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Modal,
    KeyboardAvoidingView,
    Platform,
    StatusBar,
    Alert,
    Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Dropdown } from 'react-native-element-dropdown';
import DateTimePicker from '@react-native-community/datetimepicker';
import { generateCode } from '../../../utilities/generate';
import { formatRole, mapperRole } from '../../../constants';
import * as ImagePicker from 'expo-image-picker';

export default function CreateEmployee({ visible, onClose, onSubmit, mode = 'create', initialData = null }) {
    // Account Info
    const [username, setUsername] = useState('nguyenlong123@gmail.com');
    const [password, setPassword] = useState('Long12345@');
    const [showPassword, setShowPassword] = useState(false);

    // Employee Info
    const [employeeId, setEmployeeId] = useState('');
    const [employeeName, setEmployeeName] = useState('Nguyễn Văn Long');
    const [gender, setGender] = useState('male');
    const [address, setAddress] = useState('111 nguyễn văn khối');
    const [birthDate, setBirthDate] = useState(new Date('2003-01-01'));
    const [showBirthDatePicker, setShowBirthDatePicker] = useState(false);
    const [startDate, setStartDate] = useState(new Date());
    const [showStartDatePicker, setShowStartDatePicker] = useState(false);
    const [endDate, setEndDate] = useState(new Date());
    const [showEndDatePicker, setShowEndDatePicker] = useState(false);
    const [phoneNumber, setPhoneNumber] = useState('0944556712');
    const [warehouseId, setWarehouseId] = useState('WH1');
    const [status, setStatus] = useState('ACTIVE');
    const [selectedRoles, setSelectedRoles] = useState([]);
    const [isDraftAccount, setIsDraftAccount] = useState(false);
    const [cccd, setCCCD] = useState('');
    const [imageUri, setImageUri] = useState(null);

    // Get today's date at midnight for comparison
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Mock data for dropdowns
    const statusData = [
        { label: 'Đang làm', value: 'ACTIVE' },
        { label: 'Đã nghỉ', value: 'INACTIVE' },
    ];

    const rolesData = [
        { label: 'Quản lý kho', value: 'WAREHOUSE_MANAGER' },
        { label: 'Nhân viên xuất hàng', value: 'STOCK_DISPATCHER' },
        { label: 'Nhân viên nhận hàng', value: 'STOCK_RECEIVER' },
        { label: 'Kế toán', value: 'ACCOUNTANT' },
        { label: 'Quản trị viên', value: 'SYSTEM_ADMIN' },
    ];

    // Populate fields when in update mode
    React.useEffect(() => {
        console.log('data', initialData);
        if (mode === 'update' && initialData) {
            setUsername(initialData.username || '');
            setEmployeeId(initialData.id || '');
            setEmployeeName(initialData.name || '');
            setGender(initialData.gender || 'male');
            setAddress(initialData.address || '');
            setBirthDate(initialData.birthDate ? new Date(initialData.birthDate) : new Date());
            setStartDate(initialData.startDate ? new Date(initialData.startDate) : new Date());
            setEndDate(initialData.endDate ? new Date(initialData.endDate) : new Date());
            setPhoneNumber(initialData.phone || '');
            setWarehouseId(initialData.warehouse || 'WH1');
            setStatus(initialData.status || 'ACTIVE');
            setCCCD(initialData.cccd || '');
            setSelectedRoles(initialData.roles.map((role) => formatRole[role.roleName]) || []);
            setImageUri(initialData.image || null);
        }
    }, [mode, initialData]);

    const formatDate = (date) => {
        const d = new Date(date);
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear();
        return `${day}-${month}-${year}`;
    };

    const validateAccount = () => {
        if (!username || !password) {
            Alert.alert('Thông báo', 'Vui lòng tạo tài khoản trước khi tạo nhân viên');
            return false;
        }
        // regex value
        if (!/^\w+@(gmail|yahoo)(.com|.com.vn)$/.test(username)) {
            Alert.alert('Thông báo', 'Email không hợp lệ');
            return false;
        }
        if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$/.test(password)) {
            Alert.alert('Thông báo', 'Mật khẩu phải chứa ít nhất 1 chữ hoa, 1 chữ thường, 1 số và 1 ký tự đặc biệt');
            return false;
        }
        return true;
    };

    const handleSaveAccountDraft = () => {
        if (!username) {
            Alert.alert('Thông báo', 'Vui lòng nhập tên tài khoản');
            return;
        }
        if (!password) {
            Alert.alert('Thông báo', 'Vui lòng nhập mật khẩu');
            return;
        }
        // regex value
        if (!/^\w+@(gmail|yahoo)(.com|.com.vn)$/.test(username)) {
            Alert.alert('Thông báo', 'Email không hợp lệ');
            return;
        }
        if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$/.test(password)) {
            Alert.alert('Thông báo', 'Mật khẩu phải chứa ít nhất 1 chữ hoa, 1 chữ thường, 1 số và 1 ký tự đặc biệt');
            return;
        }

        setIsDraftAccount(true);
        Alert.alert('Thông báo', 'Tài khoản được tạo tạm thời và sẽ hoàn tất sau khi thêm nhân viên thành công');
    };

    function isOver18(birthDateStr) {
        const today = new Date();
        const birthDate = new Date(birthDateStr);

        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        const dayDiff = today.getDate() - birthDate.getDate();

        if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
            age--;
        }

        return age >= 18;
    }

    const validateEmployeeData = (data, action = 'create') => {
        const {
            employeeID,
            employeeName,
            cccd,
            dob,
            gender,
            phoneNumber,
            address,
            startDate,
            endDate,
            warehouseID,
            roles,
            status,
            image,
        } = data;
        const message = {
            employeeID: 'Vui lòng tạo mã nhân viên',
            employeeName: 'Vui lòng nhập tên nhân viên',
            cccd: 'Vui lòng nhập căn cước công dân',
            dob: 'Vui lòng chọn ngày sinh',
            gender: 'Vui lòng chọn giới tính',
            phoneNumber: 'Vui lòng nhập số điện thoại',
            address: 'Vui lòng nhập địa chỉ',
            startDate: 'Vui lòng chọn ngày vào làm',
            endDate: 'Vui lòng chọn ngày nghỉ',
            warehouseID: 'Vui lòng chọn kho',
            status: 'Vui lòng chọn trạng thái',
            roles: 'Vui lòng chọn ít nhất một vai trò cho nhân viên',
            image: 'Vui lòng tải hình ảnh nhân viên lên',
        };
        if (!employeeID) {
            Alert.alert('Thông báo', message['employeeID']);
            return false;
        }
        if (!employeeName) {
            Alert.alert('Thông báo', message['employeeName']);
            return false;
        }
        if (!cccd) {
            Alert.alert('Thông báo', message['cccd']);
            return false;
        }
        if (!dob) {
            Alert.alert('Thông báo', message['dob']);
            return false;
        }
        if (!gender) {
            Alert.alert('Thông báo', message['gender']);
            return false;
        }
        if (!phoneNumber) {
            Alert.alert('Thông báo', message['phoneNumber']);
            return false;
        }
        if (!address) {
            Alert.alert('Thông báo', message['address']);
            return false;
        }
        if (!startDate) {
            Alert.alert('Thông báo', message['startDate']);
            return false;
        }
        if (!warehouseID) {
            Alert.alert('Thông báo', message['warehouseID']);
            return false;
        }
        if (roles.length == 0) {
            Alert.alert('Thông báo', message['roles']);
            return false;
        }
        if (!status) {
            Alert.alert('Thông báo', message['status']);
            return false;
        }
        if (!image && mode === 'create') {
            Alert.alert('Thông báo', message['image']);
            return false;
        }

        if (status == 'Nghỉ việc') {
            if (!endDate) {
                Alert.alert('Thông báo', 'Vui lòng điền ngày nghỉ làm khi nhân viên nghỉ việc');
                return false;
            } else {
                if (new Date(endDate) < new Date(startDate)) {
                    Alert.alert('Thông báo', 'Ngày nghỉ làm phải sau ngày vào làm');
                    return false;
                }
            }
        }

        if (!/^[\p{L}\s]+$/u.test(employeeName)) {
            Alert.alert('Tên chỉ chứa chữ và khoảng trắng', {
                ...styleMessage,
            });
            return false;
        }
        if (!/^\d{12}$/.test(cccd)) {
            Alert.alert('Thông báo', 'Căn cước công dân bắt buộc có độ dài 12 chữ số');
            return false;
        }
        if (!/^(03|05|07|08|09)\d{8}$/.test(phoneNumber)) {
            Alert.alert(
                'Thông báo',
                'Số điện thoại có độ dài 10 chữ số và bắt đầu bằng 03 hoặc 05 hoặc 07 hoặc 08 hoặc 09',
            );
            return false;
        }
        if (new Date(dob) > Date.now()) {
            Alert.alert('Thông báo', 'Ngày sinh phải trước ngày hôm nay');
            return false;
        }
        if (new Date(dob) < Date.now()) {
            if (!isOver18(dob)) {
                Alert.alert('Thông báo', 'Nhân viên phải bằng hoặc trên 18 tuổi');
                return false;
            }
        }
        if (status !== 'INACTIVE' && action != 'update') {
            if (new Date(startDate) < Date.now()) {
                Alert.alert('Thông báo', 'Ngày vào làm phải sau ngày hôm nay');
                return false;
            }
        }
        return true;
    };

    const handleResetAccount = () => {
        setUsername('');
        setPassword('');
        setIsDraftAccount(false);
    };

    const handleSubmit = () => {
        if (!validateAccount()) return;
        const employeeData = {
            // Account info
            email: username,
            password,
            // Employee info
            employeeID: employeeId,
            employeeName,
            gender,
            address,
            dob: new Date(birthDate).toISOString().split('T')[0],
            startDate: new Date(startDate).toISOString().split('T')[0],
            endDate: mode === 'update' ? new Date(endDate).toISOString().split('T')[0] : null,
            phoneNumber,
            warehouseID: warehouseId,
            status,
            roles: selectedRoles.map((role) => mapperRole[role]),
            image: imageUri,
            confirmPassword: password,
            cccd,
        };
        if (!validateEmployeeData(employeeData)) return;
        const { password, ...dataUpdate } = employeeData;
        onSubmit(mode === 'update' ? dataUpdate : employeeData);
    };

    // const handleReset = () => {
    //     setUsername('');
    //     setPassword('');
    //     setEmployeeId('');
    //     setEmployeeName('');
    //     setGender('male');
    //     setAddress('');
    //     setBirthDate(new Date());
    //     setStartDate(new Date());
    //     setEndDate(new Date());
    //     setPhoneNumber('');
    //     setWarehouseId('WH1');
    //     setStatus('ACTIVE');
    //     setSelectedRoles([]);
    // };

    const handleImagePick = async () => {
        try {
            // Request permission
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Cảnh báo', 'Cần cấp quyền truy cập thư viện ảnh');
                return;
            }

            // Pick image
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
            });

            if (!result.canceled) {
                setImageUri(result.assets[0].uri);
            }
        } catch (error) {
            console.error('Error picking image:', error);
            Alert.alert('Lỗi', 'Không thể chọn ảnh');
        }
    };

    return (
        <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
            <View style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                        <Ionicons name="close" size={24} color="#1f2937" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>
                        {mode === 'update' ? 'Cập nhật nhân viên' : 'Thêm nhân viên'}
                    </Text>
                    <View style={styles.placeholder} />
                </View>

                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.keyboardAvoidingView}
                    keyboardVerticalOffset={0}
                >
                    <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                        {/* Account Section */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Thông tin tài khoản</Text>
                            <View style={styles.sectionContent}>
                                {/* Username */}
                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>Tên tài khoản</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Nhập tên tài khoản"
                                        placeholderTextColor="#9ca3af"
                                        value={username}
                                        onChangeText={setUsername}
                                        readOnly={mode === 'update' || isDraftAccount}
                                    />
                                </View>

                                {/* Password */}
                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>Mật khẩu</Text>
                                    <View style={styles.passwordContainer}>
                                        <TextInput
                                            style={styles.passwordInput}
                                            placeholder="Nhập mật khẩu"
                                            placeholderTextColor="#9ca3af"
                                            value={password}
                                            onChangeText={setPassword}
                                            secureTextEntry={!showPassword}
                                            readOnly={mode === 'update' || isDraftAccount}
                                        />
                                        {mode !== 'update' && (
                                            <TouchableOpacity
                                                onPress={() => setShowPassword(!showPassword)}
                                                style={styles.eyeIcon}
                                            >
                                                <Ionicons
                                                    name={showPassword ? 'eye-off' : 'eye'}
                                                    size={20}
                                                    color="#6b7280"
                                                />
                                            </TouchableOpacity>
                                        )}
                                    </View>
                                </View>

                                {/* Account Action Buttons */}
                                <View style={styles.accountActionButtons}>
                                    {/* Create Account Button */}
                                    {mode === 'create' && (
                                        <>
                                            <TouchableOpacity
                                                style={[
                                                    styles.createAccountButton,
                                                    isDraftAccount && styles.buttonDisabled,
                                                ]}
                                                onPress={handleSaveAccountDraft}
                                                disabled={isDraftAccount}
                                            >
                                                <Ionicons name="person-add" size={18} color="#fff" />
                                                <Text style={styles.createAccountButtonText}>Tạo tài khoản</Text>
                                            </TouchableOpacity>

                                            {/* Reset Account Button */}
                                            <TouchableOpacity
                                                style={styles.resetAccountButton}
                                                onPress={handleResetAccount}
                                            >
                                                <Ionicons name="refresh" size={18} color="#6b7280" />
                                                <Text style={styles.resetAccountButtonText}>Đặt lại</Text>
                                            </TouchableOpacity>
                                        </>
                                    )}
                                </View>
                            </View>
                        </View>

                        {/* Employee Info Section */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Thông tin nhân viên</Text>
                            <View style={styles.sectionContent}>
                                {/* Avatar Placeholder */}
                                <View style={styles.avatarContainer}>
                                    <View style={styles.avatarPlaceholder}>
                                        {imageUri ? (
                                            <Image source={{ uri: imageUri }} style={styles.avatar} />
                                        ) : (
                                            <Ionicons name="person" size={48} color="#9ca3af" />
                                        )}
                                    </View>
                                    <TouchableOpacity style={styles.uploadButton} onPress={handleImagePick}>
                                        <Text style={styles.uploadButtonText}>Tải ảnh lên</Text>
                                    </TouchableOpacity>
                                </View>

                                {/* Employee ID */}
                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>Mã nhân viên</Text>
                                    <View style={styles.inputWithButton}>
                                        <TextInput
                                            style={styles.inputFlex}
                                            placeholder="Nhập mã nhân viên"
                                            placeholderTextColor="#9ca3af"
                                            value={employeeId}
                                            onChangeText={setEmployeeId}
                                        />
                                        {mode == 'create' && (
                                            <TouchableOpacity
                                                style={styles.generateButton}
                                                onPress={() => {
                                                    setEmployeeId(generateCode('EP'));
                                                }}
                                            >
                                                <Ionicons name="create-outline" size={18} color="#fff" />
                                                <Text style={styles.generateButtonText}>Tạo mã</Text>
                                            </TouchableOpacity>
                                        )}
                                    </View>
                                </View>

                                {/* Employee Name */}
                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>Tên nhân viên</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Nhập tên nhân viên"
                                        placeholderTextColor="#9ca3af"
                                        value={employeeName}
                                        onChangeText={setEmployeeName}
                                    />
                                </View>

                                {/* Gender */}
                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>Giới tính</Text>
                                    <View style={styles.genderContainer}>
                                        <TouchableOpacity
                                            style={[styles.genderButton]}
                                            onPress={() => setGender('male')}
                                        >
                                            <View
                                                style={[
                                                    styles.radioOuter,
                                                    gender === 'male' && styles.radioOuterActive,
                                                ]}
                                            >
                                                {gender === 'male' && <View style={styles.radioInner} />}
                                            </View>
                                            <Text
                                                style={[
                                                    styles.genderText,
                                                    gender === 'male' && styles.genderTextActive,
                                                ]}
                                            >
                                                Nam
                                            </Text>
                                        </TouchableOpacity>

                                        <TouchableOpacity
                                            style={[styles.genderButton]}
                                            onPress={() => setGender('female')}
                                        >
                                            <View
                                                style={[
                                                    styles.radioOuter,
                                                    gender === 'female' && styles.radioOuterActive,
                                                ]}
                                            >
                                                {gender === 'female' && <View style={styles.radioInner} />}
                                            </View>
                                            <Text
                                                style={[
                                                    styles.genderText,
                                                    gender === 'female' && styles.genderTextActive,
                                                ]}
                                            >
                                                Nữ
                                            </Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>

                                {/* Cccd */}
                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>CCCD</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Nhập số CCCD"
                                        placeholderTextColor="#9ca3af"
                                        value={cccd}
                                        onChangeText={setCCCD}
                                    />
                                </View>

                                {/* Address */}
                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>Địa chỉ</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Nhập địa chỉ"
                                        placeholderTextColor="#9ca3af"
                                        value={address}
                                        onChangeText={setAddress}
                                    />
                                </View>

                                {/* Birth Date */}
                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>Ngày sinh</Text>
                                    <TouchableOpacity
                                        style={styles.dateInput}
                                        onPress={() => setShowBirthDatePicker(true)}
                                    >
                                        <Text style={styles.dateText}>{formatDate(birthDate)}</Text>
                                        <Ionicons name="calendar-outline" size={20} color="#6b7280" />
                                    </TouchableOpacity>
                                    {showBirthDatePicker && (
                                        <DateTimePicker
                                            value={birthDate}
                                            mode="date"
                                            display="default"
                                            onChange={(event, selectedDate) => {
                                                setShowBirthDatePicker(false);
                                                if (selectedDate) setBirthDate(selectedDate);
                                            }}
                                            style={styles.datePickerContainer}
                                        />
                                    )}
                                </View>

                                {/* Phone Number */}
                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>Số điện thoại</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Nhập số điện thoại"
                                        placeholderTextColor="#9ca3af"
                                        value={phoneNumber}
                                        onChangeText={setPhoneNumber}
                                        keyboardType="phone-pad"
                                    />
                                </View>

                                {/* Start Date */}
                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>Ngày vào làm</Text>
                                    <TouchableOpacity
                                        style={styles.dateInput}
                                        onPress={() => setShowStartDatePicker(true)}
                                    >
                                        <Text style={styles.dateText}>{formatDate(startDate)}</Text>
                                        <Ionicons name="calendar-outline" size={20} color="#6b7280" />
                                    </TouchableOpacity>
                                    {showStartDatePicker && (
                                        <DateTimePicker
                                            value={startDate}
                                            mode="date"
                                            display="default"
                                            minimumDate={today}
                                            onChange={(event, selectedDate) => {
                                                setShowStartDatePicker(false);
                                                if (selectedDate) setStartDate(selectedDate);
                                            }}
                                            style={styles.datePickerContainer}
                                        />
                                    )}
                                </View>

                                {/* End Date - Only show in update mode */}
                                {mode === 'update' && (
                                    <View style={styles.inputGroup}>
                                        <Text style={styles.label}>Ngày nghỉ làm</Text>
                                        <TouchableOpacity
                                            style={styles.dateInput}
                                            onPress={() => setShowEndDatePicker((prev) => !prev)}
                                        >
                                            <Text style={styles.dateText}>{formatDate(endDate)}</Text>
                                            <Ionicons name="calendar-outline" size={20} color="#6b7280" />
                                        </TouchableOpacity>
                                        {showEndDatePicker && (
                                            <DateTimePicker
                                                value={endDate}
                                                mode="date"
                                                display="default"
                                                minimumDate={today}
                                                onChange={(event, selectedDate) => {
                                                    setShowEndDatePicker(false);
                                                    if (selectedDate) setEndDate(selectedDate);
                                                }}
                                                style={styles.datePickerContainer}
                                            />
                                        )}
                                    </View>
                                )}

                                {/* Warehouse */}
                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>Mã kho</Text>
                                    <View style={styles.statusReadOnly}>
                                        <Text style={styles.statusReadOnlyText}>WH1</Text>
                                    </View>
                                </View>

                                {/* Status */}
                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>Trạng thái</Text>
                                    {mode === 'create' ? (
                                        <View style={styles.statusReadOnly}>
                                            <Text style={styles.statusReadOnlyText}>Đang làm</Text>
                                        </View>
                                    ) : (
                                        <Dropdown
                                            style={styles.dropdown}
                                            placeholderStyle={styles.dropdownPlaceholder}
                                            selectedTextStyle={styles.dropdownSelectedText}
                                            iconStyle={styles.dropdownIcon}
                                            data={statusData}
                                            maxHeight={300}
                                            labelField="label"
                                            valueField="value"
                                            placeholder="Đang làm"
                                            value={status}
                                            onChange={(item) => setStatus(item.value)}
                                        />
                                    )}
                                </View>

                                {/* Roles - Multi-select */}
                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>Chức vụ</Text>

                                    {/* Dropdown to select roles */}
                                    <Dropdown
                                        style={styles.dropdown}
                                        placeholderStyle={styles.dropdownPlaceholder}
                                        selectedTextStyle={styles.dropdownSelectedText}
                                        iconStyle={styles.dropdownIcon}
                                        data={rolesData}
                                        maxHeight={300}
                                        labelField="label"
                                        valueField="value"
                                        placeholder="-- Chọn chức vụ --"
                                        value={null}
                                        onChange={(item) => {
                                            // Add role if not already selected
                                            if (!selectedRoles.includes(item.label)) {
                                                setSelectedRoles([...selectedRoles, item.label]);
                                            }
                                        }}
                                    />

                                    {/* Display selected roles as chips */}
                                    {selectedRoles.length > 0 && (
                                        <View style={styles.rolesChipsContainer}>
                                            {selectedRoles.map((roleValue, index) => {
                                                const role = rolesData.find((r) => r.label === roleValue);
                                                return (
                                                    <View key={index} style={styles.roleChip}>
                                                        <Text style={styles.roleChipText}>
                                                            {role?.label || roleValue}
                                                        </Text>
                                                        <TouchableOpacity
                                                            onPress={() => {
                                                                setSelectedRoles(
                                                                    selectedRoles.filter((r) => r !== roleValue),
                                                                );
                                                            }}
                                                            style={styles.roleChipRemove}
                                                        >
                                                            <Ionicons name="close-circle" size={18} color="#ef4444" />
                                                        </TouchableOpacity>
                                                    </View>
                                                );
                                            })}
                                        </View>
                                    )}
                                </View>
                            </View>
                        </View>

                        {/* Action Buttons */}
                        <View style={styles.actionButtons}>
                            <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
                                <Text style={styles.submitButtonText}>
                                    {mode === 'update' ? 'Cập nhật' : 'Thêm nhân viên'}
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                                <Text style={styles.cancelButtonText}>Hủy</Text>
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f3f4f6',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 12 : 50,
        paddingBottom: 12,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
    },
    closeButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1f2937',
    },
    placeholder: {
        width: 32,
    },
    keyboardAvoidingView: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
    },
    section: {
        marginTop: 12,
        marginHorizontal: 16,
        backgroundColor: '#fff',
        borderRadius: 8,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
        backgroundColor: '#1e40af',
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    sectionContent: {
        padding: 16,
    },
    inputGroup: {
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
        color: '#374151',
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderColor: '#d1d5db',
        borderRadius: 6,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 14,
        color: '#1f2937',
        backgroundColor: '#fff',
    },
    inputWithButton: {
        flexDirection: 'row',
        gap: 8,
    },
    inputFlex: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#d1d5db',
        borderRadius: 6,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 14,
        color: '#1f2937',
        backgroundColor: '#fff',
    },
    generateButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#1e40af',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 6,
        gap: 6,
    },
    generateButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
    passwordContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#d1d5db',
        borderRadius: 6,
        backgroundColor: '#fff',
    },
    passwordInput: {
        flex: 1,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 14,
        color: '#1f2937',
    },
    eyeIcon: {
        padding: 10,
    },
    accountActionButtons: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 4,
    },
    createAccountButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#10b981',
        paddingVertical: 12,
        borderRadius: 6,
        gap: 8,
    },
    createAccountButtonText: {
        color: '#fff',
        fontSize: 15,
        fontWeight: '600',
    },
    resetAccountButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#d1d5db',
        paddingVertical: 12,
        borderRadius: 6,
        gap: 8,
    },
    resetAccountButtonText: {
        color: '#6b7280',
        fontSize: 15,
        fontWeight: '600',
    },
    buttonDisabled: {
        opacity: 0.5,
    },
    avatarContainer: {
        alignItems: 'center',
        marginBottom: 20,
    },
    avatarPlaceholder: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#e5e7eb',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 1,
        borderColor: '#d1d5db',
    },
    uploadButton: {
        backgroundColor: '#1f2937',
        paddingHorizontal: 20,
        paddingVertical: 8,
        borderRadius: 6,
    },
    uploadButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '500',
    },
    genderContainer: {
        flexDirection: 'row',
        gap: 16,
    },
    genderButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    radioOuter: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#d1d5db',
        justifyContent: 'center',
        alignItems: 'center',
    },
    radioOuterActive: {
        borderColor: '#1e40af',
    },
    radioInner: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#1e40af',
    },
    genderText: {
        fontSize: 14,
        color: '#6b7280',
    },
    genderTextActive: {
        color: '#1f2937',
        fontWeight: '500',
    },
    dateInput: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderWidth: 1,
        borderColor: '#d1d5db',
        borderRadius: 6,
        paddingHorizontal: 12,
        paddingVertical: 10,
        backgroundColor: '#fff',
    },
    dateText: {
        fontSize: 14,
        color: '#1f2937',
    },
    datePickerContainer: {
        marginTop: 12,
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    dropdown: {
        borderWidth: 1,
        borderColor: '#d1d5db',
        borderRadius: 6,
        paddingHorizontal: 12,
        paddingVertical: 10,
        backgroundColor: '#fff',
    },
    dropdownPlaceholder: {
        fontSize: 14,
        color: '#9ca3af',
    },
    dropdownSelectedText: {
        fontSize: 14,
        color: '#1f2937',
    },
    dropdownIcon: {
        width: 20,
        height: 20,
    },
    statusReadOnly: {
        borderWidth: 1,
        borderColor: '#d1d5db',
        borderRadius: 6,
        paddingHorizontal: 12,
        paddingVertical: 10,
        backgroundColor: '#f9fafb',
    },
    statusReadOnlyText: {
        fontSize: 14,
        color: '#6b7280',
    },
    rolesChipsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginTop: 12,
    },
    roleChip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#dbeafe',
        borderRadius: 16,
        paddingVertical: 6,
        paddingLeft: 12,
        paddingRight: 8,
        gap: 6,
    },
    roleChipText: {
        fontSize: 13,
        color: '#1e40af',
        fontWeight: '500',
    },
    roleChipRemove: {
        padding: 2,
    },
    actionButtons: {
        flexDirection: 'row',
        gap: 12,
        paddingHorizontal: 16,
        paddingVertical: 20,
    },
    submitButton: {
        flex: 1,
        backgroundColor: '#1f2937',
        paddingVertical: 12,
        borderRadius: 6,
        alignItems: 'center',
    },
    submitButtonText: {
        color: '#fff',
        fontSize: 15,
        fontWeight: '600',
    },
    cancelButton: {
        flex: 1,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#d1d5db',
        paddingVertical: 12,
        borderRadius: 6,
        alignItems: 'center',
    },
    cancelButtonText: {
        color: '#374151',
        fontSize: 15,
        fontWeight: '600',
    },
});
