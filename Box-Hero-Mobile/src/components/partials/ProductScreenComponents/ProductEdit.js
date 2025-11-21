import React, { useState, useEffect } from 'react';
import {View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, Dimensions,
    Alert} from 'react-native';
import Modal from '../../Modal';
import { COLORS } from '../../style/Globalstyle';
import Button from '../../Button';
import { Dropdown } from 'react-native-element-dropdown';
import { updateProduct } from '../../../service/product.service';


const { width } = Dimensions.get('window');

const ProductEdit = ({ isOpen, onClose, productData, refetchData }) => {
    const [formData, setFormData] = useState({
        productName: '',
        minStock: '',
        status: 'AVAILABLE',
    });

    const [errors, setErrors] = useState({});

    // Populate form when productData changes
    useEffect(() => {
        if (productData) {
            setFormData({
                productName: productData.productName || '',
                minStock: productData.minStock?.toString() || '',
                status: productData.status || 'AVAILABLE',
            });
        }
    }, [productData]);

    const validateForm = () => {
        if (!formData.productName.trim()) {
            Alert.alert('Lỗi', 'Tên sản phẩm không được để trống');
            return false;
        }

        if (!formData.minStock.trim()) {
            Alert.alert('Lỗi', 'Tồn kho tối thiểu không được để trống');
            return false;
        } else if (isNaN(formData.minStock) || parseInt(formData.minStock) < 0) {
            Alert.alert('Lỗi', 'Tồn kho tối thiểu phải là số không âm');
            return false;
        }

        return true;
    };

    const handleUpdate = async () => {
        if (validateForm()) {
            const updatedData = {
                productID: productData.productID,
                productName: formData.productName,
                minStock: parseInt(formData.minStock),
                status: formData.status,
            };
            console.log('data update', updatedData);
            const result = await updateProduct(updatedData);
            if (result) {
                refetchData();
                onClose();
            } else return;
        }
    };

    const handleCancel = () => {
        onClose();
    };

    const statusOptions = [
        { label: 'Đang kinh doanh', value: 'AVAILABLE' },
        { label: 'Ngừng kinh doanh', value: 'DISCONTINUED' },
        { label: 'Hết hàng', value: 'OUT_OF_STOCK' },
    ];

    return (
        <Modal
            isOpenInfo={isOpen}
            onClose={handleCancel}
            showButtonClose={false}
            arrButton={[
                (index) => (
                    <Button
                        key={index}
                        primary
                        medium
                        borderRadiusSmall
                        style={styles.updateButton}
                        onPress={handleUpdate}
                    >
                        Cập nhật
                    </Button>
                ),
                (index) => (
                    <Button
                        key={index}
                        primary
                        medium
                        borderRadiusSmall
                        style={styles.cancelButton}
                        onPress={handleCancel}
                    >
                        Hủy
                    </Button>
                ),
            ]}
        >
            <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Cập nhật sản phẩm</Text>
                </View>

                {/* Form Fields */}
                <View style={styles.formContainer}>
                    {/* Tên sản phẩm */}
                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Tên sản phẩm</Text>
                        <TextInput
                            style={[styles.input, errors.productName && styles.inputError]}
                            value={formData.productName}
                            onChangeText={(text) => {
                                setFormData({ ...formData, productName: text });
                                if (errors.productName) {
                                    setErrors({ ...errors, productName: null });
                                }
                            }}
                            placeholder="Nhập tên sản phẩm"
                            placeholderTextColor="#999"
                        />
                        {errors.productName && <Text style={styles.errorText}>{errors.productName}</Text>}
                    </View>

                    {/* Tồn kho tối thiểu */}
                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Tồn kho tối thiểu</Text>
                        <TextInput
                            style={[styles.input, errors.minStock && styles.inputError]}
                            value={formData.minStock}
                            onChangeText={(text) => {
                                setFormData({ ...formData, minStock: text });
                                if (errors.minStock) {
                                    setErrors({ ...errors, minStock: null });
                                }
                            }}
                            placeholder="Nhập số lượng tối thiểu"
                            placeholderTextColor="#999"
                            keyboardType="numeric"
                        />
                        {errors.minStock && <Text style={styles.errorText}>{errors.minStock}</Text>}
                    </View>

                    {/* Trạng thái */}
                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Trạng thái</Text>
                        <View style={styles.pickerContainer}>
                            <Dropdown
                                data={statusOptions}
                                value={formData.status}
                                labelField="label"
                                valueField="value"
                                onChange={(item) => setFormData({ ...formData, status: item.value })}
                                style={styles.picker}
                                renderItem={(item) => <Text style={styles.pickerItem}>{item.label}</Text>}
                            />
                        </View>
                    </View>
                </View>
            </ScrollView>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        maxHeight: Dimensions.get('window').height * 0.7,
    },
    header: {
        marginBottom: 20,
        paddingBottom: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: 'black',
    },
    formContainer: {
        paddingVertical: 10,
    },
    formGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
        color: 'black',
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderColor: '#d0d0d0',
        borderRadius: 6,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 14,
        color: 'black',
        backgroundColor: COLORS.white,
    },
    inputError: {
        borderColor: '#ef4444',
    },
    errorText: {
        color: '#ef4444',
        fontSize: 12,
        marginTop: 4,
    },
    pickerContainer: {
        borderWidth: 1,
        borderColor: '#d0d0d0',
        borderRadius: 6,
        backgroundColor: COLORS.white,
        overflow: 'hidden',
    },
    picker: {
        height: 50,
        width: '100%',
        paddingHorizontal: 10,
    },
    pickerItem: {
        fontSize: 14,
        color: 'black',
        paddingVertical: 10,
        paddingHorizontal: 12,
    },
    updateButton: {
        backgroundColor: 'black',
        paddingHorizontal: 20,
    },
    cancelButton: {
        backgroundColor: 'black',
        paddingHorizontal: 20,
    },
});

export default ProductEdit;
