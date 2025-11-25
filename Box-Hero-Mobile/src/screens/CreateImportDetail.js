import React, { useEffect, useState } from 'react';
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
import { saveReceipt, validatePayloadCreateReceipt } from '../service/order.service';
import Toast from 'react-native-toast-message';
import { formatDate } from '../utilities/formatDate';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Calendar } from 'lucide-react-native';
import parseToken from '../utilities/parseToken';

export default function CreateImportDetail() {
    const navigation = useNavigation();
    const route = useRoute();
    const { proposal } = route.params || {};
    const currentUser = useSelector((state) => state.AuthSlice.user);
    const [warehouse, setWarehouse] = useState(null);

    const [orderInfo, setOrderInfo] = useState({
        code: '',
        publishedDate: new Date(),
        note: '',
    });
    const [productList, setProductList] = useState([]);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [datePickerMode, setDatePickerMode] = useState('manufacture'); // 'manufacture' or 'expiry'
    const [currentProductIndex, setCurrentProductIndex] = useState(null);

    useEffect(() => {
        const loadWarehouse = async () => {
            const wh = await parseToken('warehouse');
            setWarehouse(wh);
        };
        loadWarehouse();
    }, []);

    useEffect(() => {
        if (proposal) {
            setOrderInfo((prev) => ({
                ...prev,
                note: proposal.note || '',
                code: generateCode('PNK-'), // Auto generate code on load
            }));

            const products = proposal.proposalDetails.map((detail) => ({
                productID: detail.productID,
                productName: detail.product.productName,
                unitID: detail.unit.unitID,
                unitName: detail.unit.unitName,
                requestAmount: detail.quantity,
                realAmount: detail.quantity.toString(),
                errorAmount: 0,
                batchID: '',
                manufactureDate: new Date(),
                expiryDate: new Date(new Date().setDate(new Date().getDate() + 1)),
                supplierID: '',
                reasonError: '',
            }));
            setProductList(products);
        }
    }, [proposal]);

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
            const req = updatedList[index].requestAmount;
            if (real > req) {
                Toast.show({ type: 'error', text1: 'Lỗi', text2: 'Số lượng thực tế không được lớn hơn yêu cầu' });
                updatedList[index].realAmount = req.toString();
                updatedList[index].errorAmount = 0;
            } else {
                updatedList[index].errorAmount = req - real;
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
        if (selectedDate && currentProductIndex !== null) {
            const field = datePickerMode === 'manufacture' ? 'manufactureDate' : 'expiryDate';
            updateProduct(currentProductIndex, field, selectedDate);
        }
    };

    const handleSave = async () => {
        const hasError = productList.some((p) => p.errorAmount > 0);

        const payload = {
            orderPurchaseID: orderInfo.code,
            createdAt: orderInfo.publishedDate.toISOString().slice(0, 10),
            employeeID: currentUser.empId || currentUser.employeeID,
            warehouseID: warehouse?.warehouseID,
            proposalID: proposal?.proposalID,
            status: hasError ? 'INCOMPLETE' : 'COMPLETED',
            orderPurchaseDetails: productList.map((item, index) => ({
                orderPurchaseDetailID: index + 1,
                batchID: item.batchID,
                requestedQuantity: item.requestAmount,
                actualQuantity: parseInt(item.realAmount) || 0,
                unitID: item.unitID,
                manufactureDate: item.manufactureDate.toISOString().slice(0, 10),
                expiryDate: item.expiryDate.toISOString().slice(0, 10),
                productID: item.productID,
                supplierID: item.supplierID,
                positions: [
                    {
                        zoneID: 'ZN1',
                        shelfID: 'SF1',
                        floorID: 'FL1',
                        boxID: 'BX1',
                    },
                ],
            })),
        };

        if (!validatePayloadCreateReceipt(payload)) return;

        const submit = async () => {
            try {
                const res = await saveReceipt(payload);
                if (res && (res.status === 200 || res.status === 201 || res.data?.status === 'OK')) {
                    navigation.goBack();
                    Alert.alert('Thành công', res.data?.message || 'Tạo phiếu nhập thành công');
                }
            } catch (error) {
                console.log(error);
                Toast.show({ type: 'error', text1: 'Lỗi', text2: 'Có lỗi xảy ra khi lưu phiếu' });
            }
        };

        if (hasError) {
            Alert.alert('Thông báo', 'Phiếu nhập bị thiếu sản phẩm. Bạn có muốn tạo phiếu nhập thiếu không?', [
                { text: 'Không', onPress: submit },
                { text: 'Có', onPress: submit },
            ]);
        } else {
            submit();
        }
    };

    return (
        <DefaultLayout>
            <Header
                title="Tạo phiếu nhập kho"
                leftIcon="arrow-back"
                handleOnPressLeftIcon={() => navigation.goBack()}
            />

            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
                <ScrollView style={styles.createContainer} contentContainerStyle={{ paddingBottom: 40 }}>
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Thông tin chung</Text>
                        <View style={styles.row}>
                            <View style={{ flex: 1, marginRight: 12 }}>
                                <Text style={styles.label}>Mã phiếu</Text>
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
                        {productList.map((item, index) => (
                            <View key={index} style={styles.productCard}>
                                <View style={styles.productHeader}>
                                    <Text style={styles.productName}>{item.productName}</Text>
                                    <Text style={styles.productSku}>#{item.productID}</Text>
                                </View>
                                <Text style={styles.unitText}>Đơn vị: {item.unitName}</Text>

                                <View style={styles.gridRow}>
                                    <View style={styles.gridCol}>
                                        <Text style={styles.labelSmall}>Yêu cầu</Text>
                                        <TextInput
                                            style={[styles.inputSmall, styles.readOnly]}
                                            value={item.requestAmount.toString()}
                                            editable={false}
                                        />
                                    </View>
                                    <View style={styles.gridCol}>
                                        <Text style={styles.labelSmall}>Thực tế</Text>
                                        <TextInput
                                            style={styles.inputSmall}
                                            value={item.realAmount}
                                            keyboardType="numeric"
                                            onChangeText={(text) => updateProduct(index, 'realAmount', text)}
                                        />
                                    </View>
                                    <View style={styles.gridCol}>
                                        <Text style={styles.labelSmall}>Thiếu</Text>
                                        <TextInput
                                            style={[
                                                styles.inputSmall,
                                                styles.readOnly,
                                                item.errorAmount > 0 && {
                                                    color: '#EF4444',
                                                    fontWeight: 'bold',
                                                },
                                            ]}
                                            value={item.errorAmount.toString()}
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
                                        <Text style={styles.labelSmall}>Mã NCC</Text>
                                        <TextInput
                                            style={styles.input}
                                            value={item.supplierID}
                                            onChangeText={(text) => updateProduct(index, 'supplierID', text)}
                                            placeholder="Mã NCC"
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
                                            <Text style={styles.dateInputText}>{formatDate(item.manufactureDate)}</Text>
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
                            </View>
                        ))}
                    </View>

                    <View style={styles.createFooter}>
                        <TouchableOpacity style={styles.btnSave} onPress={handleSave}>
                            <Text style={styles.btnText}>Lưu phiếu nhập</Text>
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
});
