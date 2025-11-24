import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    ScrollView,
    TouchableOpacity,
    Image,
    Dimensions,
    KeyboardAvoidingView,
    Platform,
    Alert,
} from 'react-native';
import Modal from '../../Modal';
import { COLORS } from '../../style/Globalstyle';
import Button from '../../Button';
import { Dropdown } from 'react-native-element-dropdown';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import * as ImagePicker from 'expo-image-picker';
import { getAllCategories } from '../../../service/category.service';
import { getAllBaseUnitProduct } from '../../../service/baseUnitProduct.service';

import { createProduct } from '../../../service/product.service';
import { uploadImageFromURI } from '../../../utilities/uploadImageRN';

const { width } = Dimensions.get('window');

const CreateProduct = ({ isOpen, onClose, refetchData }) => {
    const [formData, setFormData] = useState({
        categoryID: '',
        productID: '',
        productName: '',
        description: '',
        baseUnitID: '',
        minStock: '1',
        status: 'AVAILABLE',
        image: null,
    });
    const [categoryList, setCategoryList] = useState([]);
    const [baseUnits, setBaseUnits] = useState([]);

    const [imageUri, setImageUri] = useState(null);

    // Reset form when modal opens
    useEffect(() => {
        if (isOpen) {
            resetForm();
        }
    }, [isOpen]);

    const resetForm = () => {
        setFormData({
            categoryID: '',
            productID: '',
            productName: '',
            description: '',
            baseUnitID: '',
            minStock: '1',
            status: 'AVAILABLE',
            image: null,
        });
        setImageUri(null);
    };

    const validateForm = () => {
        if (!formData.categoryID) {
            Alert.alert('Lỗi', 'Vui lòng chọn mã nhóm sản phẩm');
            return false;
        }

        if (!formData.productID.trim()) {
            Alert.alert('Lỗi', 'Vui lòng nhập mã sản phẩm');
            return false;
        }

        if (!formData.productName.trim()) {
            Alert.alert('Lỗi', 'Vui lòng nhập tên sản phẩm');
            return false;
        }

        if (!formData.baseUnitID) {
            Alert.alert('Lỗi', 'Vui lòng chọn đơn vị cơ bản');
            return false;
        }

        if (!formData.minStock.trim() || isNaN(formData.minStock) || parseInt(formData.minStock) < 0) {
            Alert.alert('Lỗi', 'Số lượng tồn tối thiểu phải là số không âm');
            return false;
        }
        if (!formData.image) {
            Alert.alert('Lỗi', 'Vui lòng chọn ảnh cho sản phẩm');
            return false;
        }

        return true;
    };

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
                setFormData({ ...formData, image: result.assets[0].uri });
            }
        } catch (error) {
            console.error('Error picking image:', error);
            Alert.alert('Lỗi', 'Không thể chọn ảnh');
        }
    };

    // productID: data.productID,
    //                     productName: data.productName,
    //                     categoryID: data.categoryID,
    //                     minStock: data.minStock,
    //                     status: data.status,
    //                     baseUnitProductID: data.baseUnitProductID,
    //                     amount: 0,
    //                     qrCode: '1',
    //                     price: data?.price || 25000,
    //                     image: data?.image || '',
    //                     description: data?.description || '',

    const handleCreate = async () => {
        if (validateForm()) {
            const productData = {
                categoryID: formData.categoryID,
                productID: formData.productID,
                productName: formData.productName,
                description: formData.description,
                baseUnitProductID: formData.baseUnitID,
                minStock: parseInt(formData.minStock),
                status: formData.status,
                image: formData.image || '',
                price: (Math.floor(Math.random() * (1000 - 10 + 1)) + 10) * 1000,
                qrCode: formData.productID,
            };

            try {
                // upload image
                const resultImage = await uploadImageFromURI(formData.image);
                if (resultImage) productData.image = resultImage;

                const res = await createProduct(productData);
                if (res) {
                    onClose();
                    resetForm();
                    refetchData();
                }
            } catch (err) {
                console.log(err);
                return;
            }
        }
    };

    const handleCancel = () => {
        resetForm();
        onClose();
    };

    const statusOptions = [
        { label: 'Đang kinh doanh', value: 'AVAILABLE' },
        { label: 'Ngừng kinh doanh', value: 'DISCONTINUED' },
        { label: 'Hết hàng', value: 'OUT_OF_STOCK' },
    ];

    useEffect(() => {
        async function getCategories() {
            try {
                const res = await getAllCategories();
                const formatDataCategory = res?.data.map((it) => ({
                    label: it.categoryName,
                    value: it.categoryID,
                }));
                setCategoryList(formatDataCategory);
            } catch (error) {
                console.error('Error fetching categories:', error);
            }
        }
        getCategories();
    }, []);

    useEffect(() => {
        async function getBaseUnits() {
            try {
                const res = await getAllBaseUnitProduct();
                console.log('base', res);
                const formatDataBaseUnitProduct = res?.data.map((it) => ({
                    label: it.baseUnitName,
                    value: it.baseUnitProductID,
                }));
                setBaseUnits(formatDataBaseUnitProduct);
            } catch (error) {
                console.error('Error fetching base units:', error);
            }
        }
        getBaseUnits();
    }, []);

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
                        style={styles.createButton}
                        onPress={handleCreate}
                    >
                        Tạo mới
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
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardAvoidingView}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
            >
                <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={styles.headerTitle}>Thêm mới sản phẩm</Text>
                    </View>

                    {/* Form Container */}
                    <View style={styles.formContainer}>
                        {/* Image Upload Section */}
                        <View style={styles.imageSection}>
                            <TouchableOpacity style={styles.imageUploadContainer} onPress={handleImagePick}>
                                {imageUri ? (
                                    <Image source={{ uri: imageUri }} style={styles.uploadedImage} />
                                ) : (
                                    <View style={styles.imagePlaceholder}>
                                        <Icon name="image-outline" size={60} color={COLORS.gray} />
                                    </View>
                                )}
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.uploadButton} onPress={handleImagePick}>
                                <Text style={styles.uploadButtonText}>Tải ảnh lên</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Form Fields */}
                        <View style={styles.fieldsContainer}>
                            {/* Mã nhóm sản phẩm */}
                            <View style={styles.formGroup}>
                                <Text style={styles.label}>
                                    Mã nhóm sản phẩm <Text style={styles.required}>*</Text>
                                </Text>
                                <View style={styles.dropdownContainer}>
                                    <Dropdown
                                        data={categoryList || []}
                                        value={formData.categoryID}
                                        labelField="label"
                                        valueField="value"
                                        placeholder="Chọn mã nhóm sản phẩm"
                                        onChange={(item) => setFormData({ ...formData, categoryID: item.value })}
                                        style={styles.dropdown}
                                        placeholderStyle={styles.placeholderStyle}
                                        selectedTextStyle={styles.selectedTextStyle}
                                        renderItem={(item) => (
                                            <View style={styles.dropdownItem}>
                                                <Text style={styles.dropdownItemText}>{item.label}</Text>
                                            </View>
                                        )}
                                    />
                                </View>
                            </View>

                            {/* Mã sản phẩm */}
                            <View style={styles.formGroup}>
                                <Text style={styles.label}>
                                    Mã sản phẩm <Text style={styles.required}>*</Text>
                                </Text>
                                <TextInput
                                    style={styles.input}
                                    value={formData.productID}
                                    onChangeText={(text) => setFormData({ ...formData, productID: text })}
                                    placeholder="Nhập Mã sản phẩm"
                                    placeholderTextColor="#999"
                                />
                            </View>

                            {/* Tên sản phẩm */}
                            <View style={styles.formGroup}>
                                <Text style={styles.label}>Tên sản phẩm</Text>
                                <TextInput
                                    style={styles.input}
                                    value={formData.productName}
                                    onChangeText={(text) => setFormData({ ...formData, productName: text })}
                                    placeholder="Nhập Tên sản phẩm"
                                    placeholderTextColor="#999"
                                />
                            </View>

                            {/* Mô tả sản phẩm */}
                            <View style={styles.formGroup}>
                                <Text style={styles.label}>Mô tả sản phẩm</Text>
                                <TextInput
                                    style={[styles.input, styles.textArea]}
                                    value={formData.description}
                                    onChangeText={(text) => setFormData({ ...formData, description: text })}
                                    placeholder="Nhập mô tả sản phẩm"
                                    placeholderTextColor="#999"
                                    multiline
                                    numberOfLines={3}
                                />
                            </View>

                            {/* Đơn vị cơ bản */}
                            <View style={styles.formGroup}>
                                <Text style={styles.label}>Đơn vị cơ bản</Text>
                                <View style={styles.dropdownContainer}>
                                    <Dropdown
                                        data={baseUnits || []}
                                        value={formData.baseUnitID}
                                        labelField="label"
                                        valueField="value"
                                        placeholder="Chọn đơn vị cơ bản"
                                        onChange={(item) => setFormData({ ...formData, baseUnitID: item.value })}
                                        style={styles.dropdown}
                                        placeholderStyle={styles.placeholderStyle}
                                        selectedTextStyle={styles.selectedTextStyle}
                                        renderItem={(item) => (
                                            <View style={styles.dropdownItem}>
                                                <Text style={styles.dropdownItemText}>{item.label}</Text>
                                            </View>
                                        )}
                                    />
                                </View>
                            </View>

                            {/* Số lượng tồn tối thiểu */}
                            <View style={styles.formGroup}>
                                <Text style={styles.label}>Số lượng tồn tối thiểu</Text>
                                <TextInput
                                    style={styles.input}
                                    value={formData.minStock}
                                    onChangeText={(text) => setFormData({ ...formData, minStock: text })}
                                    placeholder="1"
                                    placeholderTextColor="#999"
                                    keyboardType="numeric"
                                />
                            </View>

                            {/* Trạng thái */}
                            <View style={styles.formGroup}>
                                <Text style={styles.label}>Trạng thái</Text>
                                <View style={styles.dropdownContainer}>
                                    <Dropdown
                                        data={statusOptions}
                                        value={formData.status}
                                        labelField="label"
                                        valueField="value"
                                        onChange={(item) => setFormData({ ...formData, status: item.value })}
                                        style={styles.dropdown}
                                        selectedTextStyle={styles.selectedTextStyle}
                                        renderItem={(item) => (
                                            <View style={styles.dropdownItem}>
                                                <Text style={styles.dropdownItemText}>{item.label}</Text>
                                            </View>
                                        )}
                                    />
                                </View>
                            </View>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </Modal>
    );
};

const styles = StyleSheet.create({
    keyboardAvoidingView: {
        maxHeight: Dimensions.get('window').height * 0.75,
    },
    container: {
        paddingBottom: 10,
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
    imageSection: {
        alignItems: 'center',
        marginBottom: 20,
    },
    imageUploadContainer: {
        width: 200,
        height: 200,
        marginBottom: 12,
    },
    imagePlaceholder: {
        width: '100%',
        height: '100%',
        backgroundColor: '#f5f5f5',
        borderWidth: 2,
        borderColor: '#d0d0d0',
        borderStyle: 'dashed',
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    uploadedImage: {
        width: '100%',
        height: '100%',
        borderRadius: 8,
        resizeMode: 'cover',
    },
    uploadButton: {
        backgroundColor: 'black',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 6,
    },
    uploadButtonText: {
        color: COLORS.white,
        fontSize: 14,
        fontWeight: '500',
    },
    fieldsContainer: {
        gap: 16,
    },
    formGroup: {
        marginBottom: 4,
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
        color: 'black',
        marginBottom: 8,
    },
    required: {
        color: '#ef4444',
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
    textArea: {
        minHeight: 80,
        textAlignVertical: 'top',
    },
    dropdownContainer: {
        borderWidth: 1,
        borderColor: '#d0d0d0',
        borderRadius: 6,
        backgroundColor: COLORS.white,
        overflow: 'hidden',
    },
    dropdown: {
        height: 50,
        paddingHorizontal: 12,
    },
    placeholderStyle: {
        fontSize: 14,
        color: '#999',
    },
    selectedTextStyle: {
        fontSize: 14,
        color: 'black',
    },
    dropdownItem: {
        paddingVertical: 12,
        paddingHorizontal: 12,
    },
    dropdownItemText: {
        fontSize: 14,
        color: 'black',
    },
    createButton: {
        backgroundColor: 'black',
        paddingHorizontal: 20,
    },
    cancelButton: {
        backgroundColor: 'black',
        paddingHorizontal: 20,
    },
});

export default CreateProduct;
