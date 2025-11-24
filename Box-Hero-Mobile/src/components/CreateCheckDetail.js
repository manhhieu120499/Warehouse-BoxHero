import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    TextInput,
    Alert,
    Modal,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { useSelector } from 'react-redux';
import { format } from 'date-fns';
import { X, Check, AlertCircle } from 'lucide-react-native';
import request from '../config/axiosConfig';
import { updateInventoryCheck } from '../service/inventoryCheck.service';
import AsyncStorage from '@react-native-async-storage/async-storage';
import parseToken from '../utilities/parseToken';
import { authIsAdmin } from '../common';

const formatStatusInventoryCheckDetail = {
    BALANCED: 'Cân bằng',
    DISCREPANCY: 'Chênh lệch',
};

const CreateCheckDetail = ({
    isOpen,
    onClose,
    inventoryCheckDetail,
    type = 'create',
    fetchData,
    listBatchBoxCheck,
    handleOnclose,
}) => {
    const currentUser = useSelector((state) => state.AuthSlice.user);
    const [inventoryCheckId, setInventoryCheckId] = useState('');
    const [note, setNote] = useState('');
    const [listBatchBox, setListBatchBox] = useState([]);

    useEffect(() => {
        if (type === 'create' && listBatchBoxCheck) {
            const mapConvert = listBatchBoxCheck.flatMap((box) =>
                box.batches.map((batch) => ({
                    ...batch,
                    boxID: box.boxID,
                    location: box.location,
                    systemQuantity: batch.batch_boxes.quantity,
                    actualQuantity: batch.batch_boxes.quantity.toString(),
                    discrepancyQuantity: 0,
                    reason: '',
                })),
            );
            setListBatchBox(mapConvert);
        }
    }, [listBatchBoxCheck, type]);

    const handleActualQuantityChange = (text, index, systemQuantity) => {
        const value = text;
        const difference = Number(value) - systemQuantity;
        setListBatchBox((prevDetails) =>
            prevDetails.map((item, i) =>
                i === index ? { ...item, actualQuantity: value, discrepancyQuantity: difference } : item,
            ),
        );
    };

    const generateCode = (prefix) => {
        const random = Math.floor(Math.random() * 10000);
        return `${prefix}${random}`;
    };

    const handleSaveInventoryCheck = async () => {
        let status = 'BALANCED';
        if (!inventoryCheckId) {
            Alert.alert('Lỗi', 'Vui lòng nhập mã phiếu kiểm kê');
            return;
        }
        for (const item of listBatchBox) {
            if (item.actualQuantity === null || item.actualQuantity === undefined || item.actualQuantity === '') {
                Alert.alert('Lỗi', 'Vui lòng nhập số lượng thực tế cho sản phẩm ' + item.product.productName);
                return;
            }
            if (item.discrepancyQuantity !== 0) {
                status = 'DISCREPANCY';
            }
        }

        try {
            const token = await parseToken('tokenUser');
            const warehouse = await parseToken('warehouse');
            const { employeeID, accessToken } = token;

            const data = {
                inventoryCheckID: inventoryCheckId,
                employeeID: employeeID,
                warehouseID: warehouse.warehouseID,
                note: note,
                checkStatus: status,
                details: listBatchBox.map((item) => ({
                    batchID: item.batchID,
                    boxID: item.boxID,
                    systemQuantity: item.systemQuantity,
                    actualQuantity: Number(item.actualQuantity),
                    discrepancyQuantity: Number(item.discrepancyQuantity),
                    reason: item.reason,
                })),
            };

            await request.post('/inventory-check/create-inventory-checks', data, {
                headers: {
                    token: `Bearer ${accessToken}`,
                    employeeID: employeeID,
                    warehouseID: warehouse.warehouseID,
                },
            });
            Alert.alert('Thành công', 'Tạo phiếu kiểm kê thành công');
            onClose();
            if (handleOnclose) handleOnclose();
            if (fetchData) fetchData();
        } catch (err) {
            Alert.alert(
                'Lỗi',
                Array.isArray(err.response?.data?.message)
                    ? err.response.data.message[0]
                    : err.response?.data?.message || 'Có lỗi xảy ra',
            );
            console.log(err);
        }
    };

    const handleUpdateStatus = async (status, id) => {
        const res = await updateInventoryCheck(status, id);
        if (res.data?.status === 'OK') {
            Alert.alert('Thành công', 'Cập nhật trạng thái phiếu kiểm kê thành công');
            onClose();
            if (fetchData) fetchData();
        }
    };

    return (
        <Modal visible={isOpen} animationType="slide" transparent={true} onRequestClose={onClose}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalContainer}>
                <View style={styles.modalContent}>
                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={styles.headerTitle}>Thông tin phiếu kiểm kê</Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <X size={24} color="#374151" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
                        {/* Form Info */}
                        <View style={styles.section}>
                            <View style={styles.formGroup}>
                                <Text style={styles.label}>Mã phiếu kiểm kê</Text>
                                <View style={styles.inputRow}>
                                    <TextInput
                                        style={[styles.input, { flex: 1 }, type !== 'create' && styles.disabledInput]}
                                        value={
                                            type === 'create'
                                                ? inventoryCheckId
                                                : inventoryCheckDetail?.inventoryCheckID
                                        }
                                        onChangeText={setInventoryCheckId}
                                        placeholder="Nhập mã phiếu"
                                        editable={type === 'create'}
                                    />
                                    {type === 'create' && (
                                        <TouchableOpacity
                                            style={styles.btnGenerate}
                                            onPress={() => setInventoryCheckId(generateCode('IVC-'))}
                                        >
                                            <Text style={styles.btnGenerateText}>Tạo mã</Text>
                                        </TouchableOpacity>
                                    )}
                                </View>
                            </View>

                            <View style={styles.rowTwoCols}>
                                <View style={[styles.formGroup, { flex: 1 }]}>
                                    <Text style={styles.label}>Ngày tạo</Text>
                                    <TextInput
                                        style={[styles.input, styles.disabledInput]}
                                        value={
                                            inventoryCheckDetail?.createdAt
                                                ? format(new Date(inventoryCheckDetail.createdAt), 'yyyy-MM-dd')
                                                : format(new Date(), 'yyyy-MM-dd')
                                        }
                                        editable={false}
                                    />
                                </View>
                                <View style={[styles.formGroup, { flex: 1 }]}>
                                    <Text style={styles.label}>Người lập</Text>
                                    <TextInput
                                        style={[styles.input, styles.disabledInput]}
                                        value={
                                            type === 'create'
                                                ? currentUser?.employeeName || currentUser?.username
                                                : inventoryCheckDetail?.employee?.employeeName
                                        }
                                        editable={false}
                                    />
                                </View>
                            </View>

                            <View style={styles.formGroup}>
                                <Text style={styles.label}>Ghi chú</Text>
                                <TextInput
                                    style={[
                                        styles.input,
                                        { height: 80, textAlignVertical: 'top' },
                                        type !== 'create' && styles.disabledInput,
                                    ]}
                                    value={type === 'create' ? note : inventoryCheckDetail?.note || 'Không có ghi chú'}
                                    onChangeText={setNote}
                                    placeholder="Nhập ghi chú chung..."
                                    multiline={true}
                                    editable={type === 'create'}
                                />
                            </View>
                        </View>

                        {/* List Items */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>
                                Danh sách hàng hóa (
                                {type === 'create' ? listBatchBox?.length : inventoryCheckDetail?.details?.length})
                            </Text>

                            {type === 'create' &&
                                listBatchBox?.map((item, index) => (
                                    <View key={index} style={styles.card}>
                                        <View style={styles.cardHeader}>
                                            <Text style={styles.productName}>{item.product.productName}</Text>
                                            <View style={styles.badge}>
                                                <Text style={styles.badgeText}>{item.batchID}</Text>
                                            </View>
                                        </View>

                                        <Text style={styles.locationText}>📍 {item.location}</Text>
                                        <Text style={styles.unitText}>Đơn vị: {item.unit.unitName}</Text>

                                        <View style={styles.divider} />

                                        <View style={styles.quantityContainer}>
                                            <View style={styles.qBox}>
                                                <Text style={styles.qLabel}>Tồn hệ thống</Text>
                                                <Text style={styles.qValue}>{item.systemQuantity}</Text>
                                            </View>
                                            <View style={styles.qBox}>
                                                <Text style={styles.qLabel}>Thực tế</Text>
                                                <TextInput
                                                    style={styles.qInput}
                                                    value={item.actualQuantity.toString()}
                                                    onChangeText={(text) =>
                                                        handleActualQuantityChange(text, index, item.systemQuantity)
                                                    }
                                                    keyboardType="numeric"
                                                    selectTextOnFocus
                                                />
                                            </View>
                                            <View style={styles.qBox}>
                                                <Text style={styles.qLabel}>Chênh lệch</Text>
                                                <Text
                                                    style={[
                                                        styles.qValue,
                                                        Math.abs(item.discrepancyQuantity) !== 0
                                                            ? styles.textError
                                                            : styles.textSuccess,
                                                    ]}
                                                >
                                                    {Math.abs(item.discrepancyQuantity)}
                                                </Text>
                                            </View>
                                        </View>

                                        <TextInput
                                            style={styles.noteInput}
                                            value={item.reason}
                                            onChangeText={(text) => {
                                                setListBatchBox((prev) =>
                                                    prev.map((p, i) => (i === index ? { ...p, reason: text } : p)),
                                                );
                                            }}
                                            placeholder="Ghi chú chi tiết..."
                                        />
                                    </View>
                                ))}

                            {type === 'detail' &&
                                inventoryCheckDetail?.details?.map((detail, index) => {
                                    const location = `${detail.batchBoxByBatch.box.floor.shelf.shelfName} - ${detail.batchBoxByBatch.box.floor.floorName} - ${detail.batchBoxByBatch.box.boxName}`;
                                    return (
                                        <View key={index} style={styles.card}>
                                            <View style={styles.cardHeader}>
                                                <Text style={styles.productName}>
                                                    {detail.batchBoxByBatch.batch.product.productName}
                                                </Text>
                                            </View>

                                            <View style={styles.rowInfo}>
                                                <Text style={styles.batchText}>
                                                    Lô: {detail.batchBoxByBatch.batch.batchID}
                                                </Text>
                                                <Text style={styles.unitText}>
                                                    {' '}
                                                    | {detail.batchBoxByBatch.batch.unit.unitName}
                                                </Text>
                                            </View>
                                            <Text style={styles.locationText}>📍{location}</Text>

                                            <View style={styles.divider} />

                                            <View style={styles.quantityContainer}>
                                                <View style={styles.qBox}>
                                                    <Text style={styles.qLabel}>Tồn hệ thống</Text>
                                                    <Text style={styles.qValue}>{detail.systemQuantity}</Text>
                                                </View>
                                                <View style={styles.qBox}>
                                                    <Text style={styles.qLabel}>Thực tế</Text>
                                                    <Text style={[styles.qValue, { fontWeight: 'bold' }]}>
                                                        {detail.actualQuantity}
                                                    </Text>
                                                </View>
                                                <View style={styles.qBox}>
                                                    <Text style={styles.qLabel}>Chênh lệch</Text>
                                                    <Text
                                                        style={[
                                                            styles.qValue,
                                                            Math.abs(detail.discrepancyQuantity) !== 0
                                                                ? styles.textError
                                                                : styles.textSuccess,
                                                        ]}
                                                    >
                                                        {Math.abs(detail.discrepancyQuantity)}
                                                    </Text>
                                                </View>
                                            </View>

                                            {detail.reason ? (
                                                <View style={styles.noteContainer}>
                                                    <Text style={styles.noteLabel}>Ghi chú:</Text>
                                                    <Text style={styles.noteContent}>{detail.reason}</Text>
                                                </View>
                                            ) : null}
                                        </View>
                                    );
                                })}
                        </View>
                    </ScrollView>

                    {/* Footer Actions */}
                    <View style={styles.footer}>
                        {type === 'detail' &&
                            inventoryCheckDetail?.status === 'PENDING' &&
                            authIsAdmin(currentUser) && (
                                <>
                                    <TouchableOpacity
                                        style={[styles.btn, styles.btnError, { flex: 1 }]}
                                        onPress={() =>
                                            handleUpdateStatus('REFUSE', inventoryCheckDetail?.inventoryCheckID)
                                        }
                                    >
                                        <Text style={styles.btnText}>Từ chối</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[styles.btn, styles.btnSuccess, { flex: 1 }]}
                                        onPress={() =>
                                            handleUpdateStatus('COMPLETED', inventoryCheckDetail?.inventoryCheckID)
                                        }
                                    >
                                        <Text style={styles.btnText}>Phê duyệt</Text>
                                    </TouchableOpacity>
                                </>
                            )}
                        {type === 'create' && (
                            <TouchableOpacity
                                style={[styles.btn, styles.btnPrimary, { flex: 1 }]}
                                onPress={handleSaveInventoryCheck}
                            >
                                <Text style={styles.btnText}>Lưu phiếu</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#F9FAFB',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        height: '92%',
        display: 'flex',
        flexDirection: 'column',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#111827',
    },
    closeButton: {
        padding: 4,
    },
    body: {
        flex: 1,
        padding: 16,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 16,
        color: '#111827',
    },
    formGroup: {
        marginBottom: 16,
    },
    rowTwoCols: {
        flexDirection: 'row',
        gap: 12,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 8,
    },
    input: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#D1D5DB',
        borderRadius: 12,
        padding: 12,
        fontSize: 15,
        color: '#111827',
    },
    disabledInput: {
        backgroundColor: '#F3F4F6',
        color: '#6B7280',
    },
    inputRow: {
        flexDirection: 'row',
        gap: 10,
    },
    btnGenerate: {
        backgroundColor: '#3B82F6',
        paddingHorizontal: 16,
        justifyContent: 'center',
        borderRadius: 12,
    },
    btnGenerateText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 14,
    },

    // Card Styles
    card: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 3,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    productName: {
        fontSize: 16,
        fontWeight: '700',
        color: '#111827',
        flex: 1,
        marginRight: 8,
    },
    badge: {
        backgroundColor: '#E0F2FE',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    badgeError: {
        backgroundColor: '#FEF2F2',
    },
    badgeSuccess: {
        backgroundColor: '#ECFDF5',
    },
    badgeText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#0369A1',
    },
    rowInfo: {
        flexDirection: 'row',
        marginBottom: 8,
    },
    batchText: {
        fontSize: 14,
        color: '#4B5563',
    },
    unitText: {
        fontSize: 14,
        color: '#6B7280',
    },
    locationText: {
        fontSize: 14,
        color: '#4B5563',
        marginBottom: 12,
        fontStyle: 'italic',
    },
    divider: {
        height: 1,
        backgroundColor: '#F3F4F6',
        marginVertical: 12,
    },
    quantityContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    qBox: {
        flex: 1,
        alignItems: 'center',
    },
    qLabel: {
        fontSize: 12,
        color: '#6B7280',
        marginBottom: 4,
        textTransform: 'uppercase',
    },
    qValue: {
        fontSize: 16,
        fontWeight: '600',
        color: '#111827',
    },
    qInput: {
        borderWidth: 1,
        borderColor: '#3B82F6',
        borderRadius: 8,
        paddingVertical: 4,
        paddingHorizontal: 12,
        fontSize: 16,
        fontWeight: '600',
        color: '#111827',
        textAlign: 'center',
        minWidth: 60,
        backgroundColor: '#EFF6FF',
    },
    textError: {
        color: '#EF4444',
    },
    textSuccess: {
        color: '#10B981',
    },
    noteInput: {
        backgroundColor: '#F9FAFB',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 8,
        padding: 10,
        fontSize: 14,
        color: '#111827',
    },
    noteContainer: {
        backgroundColor: '#F9FAFB',
        padding: 10,
        borderRadius: 8,
        marginTop: 8,
    },
    noteLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: '#4B5563',
        marginBottom: 2,
    },
    noteContent: {
        fontSize: 14,
        color: '#1F2937',
    },

    // Footer
    footer: {
        flexDirection: 'row',
        padding: 16,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
        gap: 12,
        marginBottom: 16,
    },
    btn: {
        paddingVertical: 14,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
    },
    btnPrimary: {
        backgroundColor: '#3B82F6',
    },
    btnSuccess: {
        backgroundColor: '#10B981',
    },
    btnError: {
        backgroundColor: '#EF4444',
    },
    btnClose: {
        backgroundColor: '#F3F4F6',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        elevation: 0,
    },
    btnText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 16,
    },
});

export default CreateCheckDetail;
