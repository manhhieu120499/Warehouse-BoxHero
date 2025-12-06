import React, { useEffect, useMemo, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TextInput,
    TouchableOpacity,
    Alert,
    Platform,
    KeyboardAvoidingView,
    Modal,
} from 'react-native';
import { DefaultLayout } from '../layouts';
import Header from '../layouts/Header';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import DateTimePicker from '@react-native-community/datetimepicker';
import { generateCode } from '../utilities/generate';
import { saveReceipt, validatePayloadCreateReceiptMissing } from '../service/order.service';
import { formatDate } from '../utilities/formatDate';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Calendar } from 'lucide-react-native';
import parseToken from '../utilities/parseToken';
import QRScanner from '../components/QRScanner';
import Toast from 'react-native-toast-message';
import { filterSupplier } from '../service/supplier.service';

export default function CreateMissingImportDetail() {
    const navigation = useNavigation();
    const route = useRoute();
    const { order } = route.params || {};
    const currentUser = useSelector((state) => state.AuthSlice.user);
    const [warehouse, setWarehouse] = useState(null);

    //log
    console.log('order', order);
    console.log('order detail', order.orderPurchaseDetail);

    const [orderInfo, setOrderInfo] = useState({
        code: '',
        publishedDate: new Date(),
        note: '',
    });
    const [productList, setProductList] = useState([]);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [datePickerMode, setDatePickerMode] = useState('manufacture');
    const [currentProductIndex, setCurrentProductIndex] = useState(null);
    const [isScannerVisible, setIsScannerVisible] = useState(false);
    const [scanningIndex, setScanningIndex] = useState(null);

    useEffect(() => {
        const loadWarehouse = async () => {
            const wh = await parseToken('warehouse');
            setWarehouse(wh);
        };
        loadWarehouse();
    }, []);

    useEffect(() => {
        if (order) {
            setOrderInfo((prev) => ({
                ...prev,
                note: order.note || '',
                code: generateCode('PNK-'),
            }));

            const products = order.orderPurchaseMissingDetails.map((detail) => ({
                productID: detail.orderPurchaseDetail?.batch?.product?.productID,
                productName: detail.orderPurchaseDetail?.batch?.product?.productName,
                unitID: detail.orderPurchaseDetail?.batch?.unitID,
                unitName: detail.orderPurchaseDetail?.batch?.unit?.unitName,
                missingQuantity: detail.missingQuantity,
                realAmount: 0,
                batchID: detail?.batchID || '',
                manufactureDate: new Date(),
                expiryDate: new Date(new Date().setDate(new Date().getDate() + 1)),
                supplierID: detail.orderPurchaseDetail?.batch?.supplierID,
                supplierName: `${detail.orderPurchaseDetail?.batch?.supplier?.supplierID}-${detail.orderPurchaseDetail?.batch?.supplier?.supplierName}`,
                enableScan: false,
                isScanned: false,
            }));
            setProductList(products);
        }
    }, [order]);

    const getDatePickerProps = () => {
        if (currentProductIndex === null) return {};
        const item = productList[currentProductIndex];
        const props = {};

        if (datePickerMode === 'manufacture') {
            const today = new Date();
            const expiryDate = new Date(item.expiryDate);
            const maxNsxByExpiry = new Date(expiryDate);
            maxNsxByExpiry.setDate(maxNsxByExpiry.getDate() - 1);

            props.maximumDate = today < maxNsxByExpiry ? today : maxNsxByExpiry;
        } else {
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const manufactureDate = new Date(item.manufactureDate);
            const minHsdByNsx = new Date(manufactureDate);
            minHsdByNsx.setDate(minHsdByNsx.getDate() + 1);

            props.minimumDate = today > minHsdByNsx ? today : minHsdByNsx;
        }
        return props;
    };

    const handleGenerateCode = () => {
        setOrderInfo({ ...orderInfo, code: generateCode('PNK-') });
    };

    const updateProduct = (index, field, value) => {
        const updatedList = [...productList];
        updatedList[index][field] = value;

        if (field === 'realAmount') {
            const real = parseInt(value) || 0;
            const missing = updatedList[index].missingQuantity;
            if (real > missing) {
                Alert.alert('Lỗi', 'Số lượng bổ sung không được lớn hơn số lượng thiếu');
                updatedList[index].realAmount = missing.toString();
            }
        }

        setProductList(updatedList);
    };

    const openDatePicker = (index, mode) => {
        setCurrentProductIndex(index);
        setDatePickerMode(mode);
        setShowDatePicker(true);
    };

    const onDateChange = (event, selectedDate) => {
        setShowDatePicker(false);
        if (event.type === 'set' && selectedDate && currentProductIndex !== null) {
            const field = datePickerMode === 'manufacture' ? 'manufactureDate' : 'expiryDate';
            updateProduct(currentProductIndex, field, selectedDate);
        }
    };

    const toggleScanMode = (index) => {
        const updatedList = productList.map((item, i) => ({
            ...item,
            enableScan: i === index ? !item.enableScan : false, // Only allow one active scan at a time
        }));
        setProductList(updatedList);
    };

    const handleOpenScanner = (index) => {
        setScanningIndex(index);
        setIsScannerVisible(true);
    };

    const handleScan = (data) => {
        if (scanningIndex === null) return;

        console.log('scanning', data);

        const updatedList = [...productList];
        const item = updatedList[scanningIndex];

        if (item.enableScan) {
            // tăng số lượng
            const currentReal = parseInt(item.realAmount) || 0;
            const req = Number(item.missingQuantity);

            const newReal = currentReal + 1;

            updatedList[scanningIndex].realAmount = newReal.toString();
            updatedList[scanningIndex].isScanned = true; // đánh dấu đã scanned

            if (newReal === req) {
                updatedList[scanningIndex].enableScan = false;
                Alert.alert('Thông báo', 'Đã quét đủ số lượng đề xuất bổ sung của lô hàng');
                setTimeout(() => setIsScannerVisible(false), 100);
            }

            setProductList(updatedList);

            return;
        }
    };

    const handleSave = async () => {
        const payload = {
            orderPurchaseID: orderInfo.code,
            employeeID: currentUser.empId || currentUser.employeeID,
            warehouseID: warehouse?.warehouseID,
            status: 'COMPLETED',
            type: 'SUPPLEMENT',
            originalOrderPurchaseID: order.orderPurchaseID,
            proposalID: order?.proposalID || order?.orderPurchase?.proposalID,

            orderPurchaseDetails: productList.map((item, index) => ({
                orderPurchaseDetailID: index + 1,
                batchID: item.batchID,
                requestedQuantity: item.missingQuantity,
                actualQuantity: parseInt(item.realAmount) || 0,
                unitID: item.unitID,
                manufactureDate: item.manufactureDate.toISOString().slice(0, 10),
                expiryDate: item.expiryDate.toISOString().slice(0, 10),
                productID: item.productID,
                supplierID: item.supplierID,
            })),
        };

        console.log('payload', payload);
        console.log('order', order);

        if (!validatePayloadCreateReceiptMissing(payload)) return;

        try {
            const res = await saveReceipt(payload);
            if (res && (res.status === 200 || res.status === 201 || res.data?.status === 'OK')) {
                navigation.goBack();
                Alert.alert('Thành công', res.data?.message || 'Tạo phiếu bổ sung thành công');
            }
        } catch (error) {
            console.log(error);
            Alert.alert('Lỗi', 'Có lỗi xảy ra khi lưu phiếu');
        }
    };

    const isValidSave = useMemo(() => {
        return productList.every((item) => Number(item.realAmount) === Number(item.missingQuantity));
    }, [productList]);

    return (
        <DefaultLayout>
            <Header
                title="Tạo phiếu nhập thiếu"
                leftIcon="arrow-back"
                handleOnPressLeftIcon={() => navigation.goBack()}
            />
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
                <ScrollView style={styles.createContainer} contentContainerStyle={{ paddingBottom: 40 }}>
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Thông tin chung</Text>
                        <View style={styles.row}>
                            <View style={{ flex: 1, marginRight: 12 }}>
                                <Text style={styles.label}>Mã phiếu bổ sung</Text>
                                <View style={styles.codeContainer}>
                                    <TextInput
                                        style={[
                                            styles.input,
                                            {
                                                flex: 1,
                                                borderTopRightRadius: 0,
                                                borderBottomRightRadius: 0,
                                            },
                                        ]}
                                        value={orderInfo.code}
                                        placeholder="Tạo mã tự động"
                                        editable={false}
                                    />
                                    <TouchableOpacity style={styles.btnGenerate} onPress={handleGenerateCode}>
                                        <Icon name="refresh" size={20} color="#fff" />
                                    </TouchableOpacity>
                                </View>
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.label}>Ngày lập</Text>
                                <TextInput
                                    style={[styles.input, styles.readOnly]}
                                    value={formatDate(orderInfo.publishedDate)}
                                    editable={false}
                                />
                            </View>
                        </View>
                        <View style={styles.row}>
                            <View style={{ flex: 1, marginRight: 12 }}>
                                <Text style={styles.label}>Kho nhập</Text>
                                <TextInput
                                    style={[styles.input, styles.readOnly]}
                                    value={warehouse?.warehouseName}
                                    editable={false}
                                />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.label}>Người lập</Text>
                                <TextInput
                                    style={[styles.input, styles.readOnly]}
                                    value={currentUser?.employeeName}
                                    editable={false}
                                />
                            </View>
                        </View>
                        <Text style={styles.label}>Ghi chú</Text>
                        <TextInput
                            style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
                            multiline
                            value={orderInfo.note}
                            onChangeText={(text) => setOrderInfo({ ...orderInfo, note: text })}
                            placeholder="Nhập ghi chú..."
                        />
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Danh sách sản phẩm ({productList.length})</Text>
                        {productList.map((item, index) => {
                            const isAnyScanning = productList.some((p) => p.enableScan);
                            const isThisScanning = item.enableScan;
                            const isDisabled = isAnyScanning && !isThisScanning;
                            const realAmount = parseInt(item.realAmount) || 0;
                            const isEnough = realAmount >= item.missingQuantity;
                            const isMissing = realAmount < item.missingQuantity;

                            return (
                                <View
                                    key={index}
                                    style={[
                                        styles.productCard,
                                        isMissing && item.isScanned && styles.warningProductCard,
                                        isEnough && styles.completedProductCard,
                                        isThisScanning && styles.activeProductCard,
                                        isDisabled && styles.disabledProductCard,
                                    ]}
                                    pointerEvents={isDisabled ? 'none' : 'auto'}
                                >
                                    <View style={styles.productHeader}>
                                        <View
                                            style={{
                                                flex: 1,
                                                flexDirection: 'row',
                                                alignItems: 'center',
                                                flexWrap: 'wrap',
                                            }}
                                        >
                                            <Text style={styles.productName}>{item.productName}</Text>
                                            <View
                                                style={[
                                                    styles.statusBadge,
                                                    isEnough ? styles.statusSuccess : styles.statusWarning,
                                                ]}
                                            >
                                                <Text style={styles.statusBadgeText}>
                                                    {isEnough ? 'Đủ hàng' : 'Chưa đủ hàng'}
                                                </Text>
                                            </View>
                                        </View>
                                        <Text style={styles.productSku}>#{item.productID}</Text>
                                    </View>
                                    <Text style={styles.unitText}>Đơn vị: {item.unitName}</Text>

                                    <View style={styles.gridRow}>
                                        <View style={styles.gridCol}>
                                            <Text style={styles.labelSmall}>Thiếu</Text>
                                            <TextInput
                                                style={[styles.inputSmall, styles.readOnly]}
                                                value={item.missingQuantity.toString()}
                                                editable={false}
                                            />
                                        </View>
                                        <View style={styles.gridCol}>
                                            <Text style={styles.labelSmall}>Bổ sung</Text>
                                            <TextInput
                                                style={[styles.inputSmall, styles.readOnly]}
                                                value={item.realAmount.toString()}
                                                keyboardType="numeric"
                                                onChangeText={(text) => updateProduct(index, 'realAmount', text)}
                                                editable={false}
                                            />
                                        </View>
                                    </View>

                                    <View style={styles.divider} />

                                    <View style={styles.row}>
                                        <View style={{ flex: 1, marginRight: 10 }}>
                                            <Text style={styles.labelSmall}>Mã lô</Text>
                                            <TextInput
                                                style={styles.input}
                                                value={item.batchID}
                                                onChangeText={(text) => updateProduct(index, 'batchID', text)}
                                                placeholder="Mã lô"
                                            />
                                        </View>
                                        <View style={{ flex: 1 }}>
                                            <Text style={styles.labelSmall}>Nhà cung cấp</Text>
                                            <TextInput
                                                style={[styles.input, styles.readOnly]}
                                                value={item.supplierName}
                                                editable={false}
                                            />
                                        </View>
                                    </View>

                                    <View style={styles.row}>
                                        <View style={{ flex: 1, marginRight: 10 }}>
                                            <Text style={styles.labelSmall}>NSX</Text>
                                            <TouchableOpacity
                                                onPress={() => openDatePicker(index, 'manufacture')}
                                                style={styles.dateInput}
                                            >
                                                <Text style={styles.dateInputText}>
                                                    {formatDate(item.manufactureDate)}
                                                </Text>
                                                <Calendar size={16} color="#6B7280" />
                                            </TouchableOpacity>
                                        </View>
                                        <View style={{ flex: 1 }}>
                                            <Text style={styles.labelSmall}>HSD</Text>
                                            <TouchableOpacity
                                                onPress={() => openDatePicker(index, 'expiry')}
                                                style={styles.dateInput}
                                            >
                                                <Text style={styles.dateInputText}>{formatDate(item.expiryDate)}</Text>
                                                <Calendar size={16} color="#6B7280" />
                                            </TouchableOpacity>
                                        </View>
                                    </View>

                                    {!isEnough && (
                                        <View style={styles.row}>
                                            <TouchableOpacity
                                                style={styles.checkboxContainer}
                                                onPress={() => toggleScanMode(index)}
                                            >
                                                <Icon
                                                    name={
                                                        item.enableScan ? 'checkbox-marked' : 'checkbox-blank-outline'
                                                    }
                                                    size={24}
                                                    color={item.enableScan ? '#2563EB' : '#6B7280'}
                                                />
                                                <Text style={styles.checkboxLabel}>Scan</Text>
                                            </TouchableOpacity>

                                            <TouchableOpacity
                                                style={[
                                                    styles.scanButton,
                                                    !item.enableScan && { backgroundColor: '#9CA3AF' },
                                                ]}
                                                onPress={() => handleOpenScanner(index)}
                                                disabled={!item.enableScan}
                                            >
                                                <Icon name="qrcode-scan" size={20} color="#fff" />
                                                <Text style={styles.scanButtonText}>Quét mã</Text>
                                            </TouchableOpacity>
                                        </View>
                                    )}
                                    <QRScanner
                                        visible={isScannerVisible && scanningIndex === index}
                                        onScanned={handleScan}
                                        onClose={() => setIsScannerVisible(false)}
                                        qrCheck={productList[index].batchID}
                                        descriptionText={`Đã quét ${productList[index].realAmount} / ${productList[index].missingQuantity} của lô hàng`}
                                    />
                                </View>
                            );
                        })}
                    </View>

                    <View style={styles.createFooter}>
                        <TouchableOpacity
                            style={[styles.btnSave, !isValidSave && { backgroundColor: '#9CA3AF' }]}
                            onPress={handleSave}
                            disabled={!isValidSave}
                        >
                            <Text style={styles.btnText}>Lưu phiếu</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>

            {Platform.OS === 'android' && showDatePicker && (
                <DateTimePicker
                    value={
                        currentProductIndex !== null
                            ? productList[currentProductIndex][
                                  datePickerMode === 'manufacture' ? 'manufactureDate' : 'expiryDate'
                              ]
                            : new Date()
                    }
                    mode="date"
                    display="default"
                    onChange={onDateChange}
                    {...getDatePickerProps()}
                />
            )}
            {Platform.OS === 'ios' && showDatePicker && (
                <Modal transparent={true} animationType="fade">
                    <View style={styles.iosModalContainer}>
                        <View style={styles.iosModalContent}>
                            <DateTimePicker
                                value={
                                    currentProductIndex !== null
                                        ? productList[currentProductIndex][
                                              datePickerMode === 'manufacture' ? 'manufactureDate' : 'expiryDate'
                                          ]
                                        : new Date()
                                }
                                mode="date"
                                display="inline"
                                onChange={(event, selectedDate) => {
                                    if (selectedDate && currentProductIndex !== null) {
                                        const field =
                                            datePickerMode === 'manufacture' ? 'manufactureDate' : 'expiryDate';
                                        updateProduct(currentProductIndex, field, selectedDate);
                                    }
                                }}
                                style={{ height: 300, width: '100%' }}
                                {...getDatePickerProps()}
                            />
                            <TouchableOpacity style={styles.iosConfirmButton} onPress={() => setShowDatePicker(false)}>
                                <Text style={styles.iosConfirmText}>Xong</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>
            )}
        </DefaultLayout>
    );
}

const styles = StyleSheet.create({
    createContainer: {
        flex: 1,
        padding: 16,
        backgroundColor: '#F3F4F6',
    },
    section: {
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 12,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 12,
        color: '#1F2937',
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
        paddingBottom: 8,
    },
    label: {
        fontSize: 13,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 6,
    },
    labelSmall: {
        fontSize: 11,
        fontWeight: '500',
        color: '#6B7280',
        marginBottom: 4,
    },
    input: {
        borderWidth: 1,
        borderColor: '#E5E7EB',
        padding: 12,
        borderRadius: 8,
        fontSize: 14,
        backgroundColor: '#fff',
        color: '#1F2937',
    },
    inputSmall: {
        borderWidth: 1,
        borderColor: '#E5E7EB',
        padding: 8,
        borderRadius: 6,
        fontSize: 14,
        backgroundColor: '#fff',
        color: '#1F2937',
        textAlign: 'center',
    },
    readOnly: {
        backgroundColor: '#F9FAFB',
        color: '#6B7280',
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    gridRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 10,
        marginBottom: 12,
    },
    gridCol: {
        flex: 1,
    },
    codeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    btnGenerate: {
        backgroundColor: '#2563EB',
        padding: 12,
        borderTopRightRadius: 8,
        borderBottomRightRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    productCard: {
        backgroundColor: '#F9FAFB',
        padding: 12,
        borderRadius: 10,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    productHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    productName: {
        fontSize: 15,
        fontWeight: '700',
        color: '#111827',
        flex: 1,
        marginRight: 8,
    },
    productSku: {
        fontSize: 12,
        color: '#6B7280',
        backgroundColor: '#E5E7EB',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    unitText: {
        fontSize: 13,
        color: '#4B5563',
        marginBottom: 12,
    },
    divider: {
        height: 1,
        backgroundColor: '#E5E7EB',
        marginVertical: 12,
    },
    dateInput: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        padding: 10,
        borderRadius: 8,
        backgroundColor: '#fff',
    },
    dateInputText: {
        fontSize: 13,
        color: '#374151',
    },
    createFooter: {
        marginTop: 10,
        marginBottom: 30,
    },
    btnSave: {
        backgroundColor: '#10B981',
        paddingVertical: 14,
        borderRadius: 10,
        alignItems: 'center',
        shadowColor: '#10B981',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
    },
    btnText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
    },
    iosModalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    iosModalContent: {
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 20,
        width: '90%',
        alignItems: 'center',
    },
    iosConfirmButton: {
        marginTop: 20,
        backgroundColor: '#2563eb',
        paddingVertical: 10,
        paddingHorizontal: 30,
        borderRadius: 10,
    },
    iosConfirmText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    activeProductCard: {
        borderColor: '#2563EB',
        borderWidth: 2,
        backgroundColor: '#EFF6FF',
    },
    disabledProductCard: {
        opacity: 0.6,
        backgroundColor: '#F3F4F6',
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 12,
        marginLeft: 8,
        marginRight: 8,
    },
    statusSuccess: {
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#D1D5DB',
    },
    statusWarning: {
        backgroundColor: '#FEF3C7',
        borderWidth: 1,
        borderColor: '#F59E0B',
    },
    statusBadgeText: {
        fontSize: 10,
        fontWeight: '700',
        color: '#000000',
    },
    completedProductCard: {
        backgroundColor: '#D1FAE5',
        borderColor: '#10B981',
    },
    warningProductCard: {
        backgroundColor: '#FEF3C7',
        borderColor: '#F59E0B',
    },
    checkboxContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 12,
        paddingVertical: 8,
    },
    checkboxLabel: {
        marginLeft: 8,
        fontSize: 14,
        color: '#374151',
        fontWeight: '500',
    },
    scanButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#2563EB',
        paddingVertical: 10,
        borderRadius: 8,
        gap: 8,
    },
    scanButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
});
