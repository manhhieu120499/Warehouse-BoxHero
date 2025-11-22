import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Modal from '../../Modal';
import Button from '../../Button';
import { formatStatusSupplier } from '../../../constants';

const CreateSupplier = ({ isOpen, onClose, onSubmit, supplierData = null }) => {
    const isUpdateMode = supplierData !== null;

    // Form state
    const [formData, setFormData] = useState({
        supplierID: '',
        supplierName: '',
        phoneNumber: '',
        address: '',
        email: '',
        status: 'ACTIVE',
    });

    // Validation errors
    const [errors, setErrors] = useState({});

    // Load existing data when in update mode
    useEffect(() => {
        if (isUpdateMode && supplierData) {
            setFormData({
                supplierID: supplierData.supplierID || '',
                supplierName: supplierData.supplierName || '',
                phoneNumber: supplierData.phoneNumber || '',
                address: supplierData.address || '',
                email: supplierData.email || '',
                status: supplierData.status || 'ACTIVE',
            });
        } else {
            // Reset form for create mode
            setFormData({
                supplierID: '',
                supplierName: '',
                phoneNumber: '',
                address: '',
                email: '',
                status: 'ACTIVE',
            });
        }
        setErrors({});
    }, [isUpdateMode, supplierData, isOpen]);

    // Handle input change
    const handleChange = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        // Clear error for this field when user starts typing
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: '' }));
        }
    };

    // Validate form
    const validateForm = () => {
        const newErrors = {};

        if (!formData.supplierID.trim()) {
            newErrors.supplierID = 'Mã NCC là bắt buộc';
        }

        if (!formData.supplierName.trim()) {
            newErrors.supplierName = 'Tên nhà cung cấp là bắt buộc';
        }

        if (!formData.phoneNumber.trim()) {
            newErrors.phoneNumber = 'SĐT là bắt buộc';
        } else if (!/^[0-9]{10,11}$/.test(formData.phoneNumber.trim())) {
            newErrors.phoneNumber = 'SĐT không hợp lệ (10-11 số)';
        }

        if (!formData.address.trim()) {
            newErrors.address = 'Địa chỉ là bắt buộc';
        }

        if (!formData.email.trim()) {
            newErrors.email = 'Email là bắt buộc';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
            newErrors.email = 'Email không hợp lệ';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Handle submit
    const handleSubmit = () => {
        if (validateForm()) {
            onSubmit(formData, isUpdateMode);
            handleClose();
        }
    };

    // Handle close
    const handleClose = () => {
        setFormData({
            supplierID: '',
            supplierName: '',
            phoneNumber: '',
            address: '',
            email: '',
        });
        setErrors({});
        onClose();
    };

    // Render input field with icon
    const renderInput = (label, field, placeholder, iconName, keyboardType = 'default', editable = true) => (
        <View style={styles.inputGroup}>
            <Text style={styles.label}>
                {label}
                {!editable && <Text style={styles.labelNote}> (không thể sửa)</Text>}
            </Text>
            <View
                style={[
                    styles.inputContainer,
                    errors[field] && styles.inputContainerError,
                    !editable && styles.inputContainerDisabled,
                ]}
            >
                <Icon name={iconName} size={20} color={!editable ? '#9ca3af' : '#4b5563'} style={styles.inputIcon} />
                <TextInput
                    style={[styles.input, !editable && styles.inputDisabled]}
                    placeholder={placeholder}
                    placeholderTextColor="#9ca3af"
                    value={formData[field]}
                    onChangeText={(value) => handleChange(field, value)}
                    keyboardType={keyboardType}
                    editable={editable}
                />
            </View>
            {errors[field] && <Text style={styles.errorText}>{errors[field]}</Text>}
        </View>
    );

    return (
        <Modal
            isOpenInfo={isOpen}
            onClose={handleClose}
            showButtonClose={false}
            arrButton={[
                (index) => (
                    <Button key={index} primary medium borderRadiusSmall onPress={handleSubmit}>
                        {isUpdateMode ? 'Cập nhật' : 'Tạo mới'}
                    </Button>
                ),
                (index) => (
                    <Button key={index} outline medium borderRadiusSmall onPress={handleClose}>
                        Hủy
                    </Button>
                ),
            ]}
        >
            <View style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.headerIconContainer}>
                        <Icon name={isUpdateMode ? 'edit' : 'add-business'} size={24} color="#60a5fa" />
                    </View>
                    <View style={styles.headerTextContainer}>
                        <Text style={styles.title}>
                            {isUpdateMode ? 'Cập nhật nhà cung cấp' : 'Thêm mới nhà cung cấp'}
                        </Text>
                        <Text style={styles.subtitle}>
                            {isUpdateMode
                                ? 'Chỉnh sửa thông tin nhà cung cấp hiện có'
                                : 'Điền đầy đủ thông tin để tạo nhà cung cấp mới'}
                        </Text>
                    </View>
                </View>

                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                    nestedScrollEnabled={true}
                >
                    {/* Form Fields */}
                    {renderInput(
                        'Mã nhà cung cấp',
                        'supplierID',
                        'Nhập mã nhà cung cấp',
                        'qr-code',
                        'default',
                        !isUpdateMode,
                    )}
                    {renderInput('Tên nhà cung cấp', 'supplierName', 'Nhập tên nhà cung cấp', 'business')}
                    {renderInput('Số điện thoại', 'phoneNumber', 'Nhập số điện thoại', 'phone', 'phone-pad')}
                    {renderInput('Địa chỉ', 'address', 'Nhập địa chỉ', 'location-on')}
                    {renderInput('Email', 'email', 'Nhập email', 'email', 'email-address')}

                    {/* Status Selector - Only in Update Mode */}
                    {isUpdateMode && (
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Trạng thái</Text>
                            <View style={styles.statusSelectorContainer}>
                                <TouchableOpacity
                                    style={[
                                        styles.statusOption,
                                        formData.status === 'ACTIVE' && styles.statusOptionActive,
                                    ]}
                                    onPress={() => handleChange('status', 'ACTIVE')}
                                >
                                    <Icon
                                        name="check-circle"
                                        size={20}
                                        color={formData.status === 'ACTIVE' ? '#22c55e' : '#9ca3af'}
                                    />
                                    <Text
                                        style={[
                                            styles.statusOptionText,
                                            formData.status === 'ACTIVE' && styles.statusOptionTextActive,
                                        ]}
                                    >
                                        {formatStatusSupplier.ACTIVE}
                                    </Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[
                                        styles.statusOption,
                                        formData.status === 'INACTIVE' && styles.statusOptionInactive,
                                    ]}
                                    onPress={() => handleChange('status', 'INACTIVE')}
                                >
                                    <Icon
                                        name="cancel"
                                        size={20}
                                        color={formData.status === 'INACTIVE' ? '#ef4444' : '#9ca3af'}
                                    />
                                    <Text
                                        style={[
                                            styles.statusOptionText,
                                            formData.status === 'INACTIVE' && styles.statusOptionTextInactive,
                                        ]}
                                    >
                                        {formatStatusSupplier.INACTIVE}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}
                </ScrollView>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        maxHeight: '100%',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingBottom: 16,
        marginBottom: 16,
        borderBottomWidth: 2,
        borderBottomColor: '#e5e7eb',
    },
    headerIconContainer: {
        width: 44,
        height: 44,
        borderRadius: 10,
        backgroundColor: '#eff6ff',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    headerTextContainer: {
        flex: 1,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#111827',
        marginBottom: 3,
    },
    subtitle: {
        fontSize: 12,
        color: '#6b7280',
        lineHeight: 16,
    },
    scrollContent: {
        paddingBottom: 5,
    },
    inputGroup: {
        marginBottom: 16,
    },
    label: {
        fontSize: 13,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 6,
    },
    labelNote: {
        fontSize: 11,
        fontWeight: '400',
        color: '#9ca3af',
        fontStyle: 'italic',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1.5,
        borderColor: '#d1d5db',
        borderRadius: 8,
        backgroundColor: '#ffffff',
        paddingHorizontal: 12,
        minHeight: 46,
    },
    inputContainerError: {
        borderColor: '#ef4444',
        backgroundColor: '#fef2f2',
    },
    inputContainerDisabled: {
        backgroundColor: '#f9fafb',
        borderColor: '#e5e7eb',
    },
    inputIcon: {
        marginRight: 10,
    },
    input: {
        flex: 1,
        fontSize: 14,
        color: '#1f2937',
        paddingVertical: 10,
    },
    inputDisabled: {
        color: '#9ca3af',
    },
    errorText: {
        fontSize: 12,
        color: '#ef4444',
        marginTop: 5,
        paddingLeft: 4,
    },
    statusSelectorContainer: {
        flexDirection: 'row',
        gap: 12,
    },
    statusOption: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
        borderWidth: 1.5,
        borderColor: '#d1d5db',
        backgroundColor: '#ffffff',
        gap: 8,
    },
    statusOptionActive: {
        borderColor: '#22c55e',
        backgroundColor: '#f0fdf4',
    },
    statusOptionInactive: {
        borderColor: '#ef4444',
        backgroundColor: '#fef2f2',
    },
    statusOptionText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#6b7280',
    },
    statusOptionTextActive: {
        color: '#16a34a',
    },
    statusOptionTextInactive: {
        color: '#dc2626',
    },
});

export default CreateSupplier;
