import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert, Modal } from 'react-native';
import { useSelector } from 'react-redux';
import { format } from 'date-fns';
import { X, Check, AlertCircle } from 'lucide-react-native';
import request from '../config/axiosConfig';
import { updateInventoryCheck } from '../service/inventoryCheck.service';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
            const userJSON = await AsyncStorage.getItem('tokenUser');
            const { employeeID, warehouseID, accessToken } = JSON.parse(userJSON);

            const data = {
                inventoryCheckID: inventoryCheckId,
                employeeID: employeeID,
                warehouseID: warehouseID,
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
                    warehouseID: warehouseID,
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

    const isAdmin = currentUser?.role === 'ADMIN' || currentUser?.role === 'MANAGER'; // Adjust based on your role logic

    return (
        <Modal visible={isOpen} animationType="slide" transparent={true} onRequestClose={onClose}>
            <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={styles.headerTitle}>Thông tin phiếu kiểm kê</Text>
                        <TouchableOpacity onPress={onClose}>
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
                                        style={[styles.input, { flex: 1 }]}
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

                            <View style={styles.formGroup}>
                                <Text style={styles.label}>Ngày tạo phiếu</Text>
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

                            <View style={styles.formGroup}>
                                <Text style={styles.label}>Người lập phiếu</Text>
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

                            <View style={styles.formGroup}>
                                <Text style={styles.label}>Ghi chú</Text>
                                <TextInput
                                    style={styles.input}
                                    value={type === 'create' ? note : inventoryCheckDetail?.note || ''}
                                    onChangeText={setNote}
                                    placeholder="Nhập ghi chú"
                                    editable={type === 'create'}
                                />
                            </View>
                        </View>

                        {/* Table List */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Danh sách hàng hóa kiểm kê</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={true}>
                                <View>
                                    <View style={styles.tableHeader}>
                                        <Text style={[styles.th, styles.wLocation]}>Vị trí</Text>
                                        <Text style={[styles.th, styles.wBatch]}>Mã lô</Text>
                                        <Text style={[styles.th, styles.wName]}>Tên SP</Text>
                                        <Text style={[styles.th, styles.wUnit]}>ĐVT</Text>
                                        {type === 'detail' && (
                                            <Text style={[styles.th, styles.wStatus]}>Trạng thái</Text>
                                        )}
                                        <Text style={[styles.th, styles.wNum]}>Tồn HT</Text>
                                        <Text style={[styles.th, styles.wNum]}>Tồn TT</Text>
                                        <Text style={[styles.th, styles.wNum]}>Chênh lệch</Text>
                                        <Text style={[styles.th, styles.wNote]}>Ghi chú</Text>
                                    </View>

                                    {type === 'create' &&
                                        listBatchBox?.map((item, index) => (
                                            <View key={index} style={styles.tableRow}>
                                                <Text style={[styles.td, styles.wLocation]}>{item.location}</Text>
                                                <Text style={[styles.td, styles.wBatch]}>{item.batchID}</Text>
                                                <Text style={[styles.td, styles.wName]}>
                                                    {item.product.productName}
                                                </Text>
                                                <Text style={[styles.td, styles.wUnit]}>{item.unit.unitName}</Text>
                                                <Text style={[styles.td, styles.wNum]}>{item.systemQuantity}</Text>
                                                <View style={[styles.td, styles.wNum]}>
                                                    <TextInput
                                                        style={styles.cellInput}
                                                        value={item.actualQuantity.toString()}
                                                        onChangeText={(text) =>
                                                            handleActualQuantityChange(text, index, item.systemQuantity)
                                                        }
                                                        keyboardType="numeric"
                                                    />
                                                </View>
                                                <Text
                                                    style={[
                                                        styles.td,
                                                        styles.wNum,
                                                        Math.abs(item.discrepancyQuantity) !== 0 && styles.highlight,
                                                    ]}
                                                >
                                                    {Math.abs(item.discrepancyQuantity)}
                                                </Text>
                                                <View style={[styles.td, styles.wNote]}>
                                                    <TextInput
                                                        style={styles.cellInput}
                                                        value={item.reason}
                                                        onChangeText={(text) => {
                                                            setListBatchBox((prev) =>
                                                                prev.map((p, i) =>
                                                                    i === index ? { ...p, reason: text } : p,
                                                                ),
                                                            );
                                                        }}
                                                        placeholder="Ghi chú"
                                                    />
                                                </View>
                                            </View>
                                        ))}

                                    {type === 'detail' &&
                                        inventoryCheckDetail?.details?.map((detail, index) => {
                                            const location = `${detail.batchBoxByBatch.box.floor.shelf.shelfName} - ${detail.batchBoxByBatch.box.floor.floorName} - ${detail.batchBoxByBatch.box.boxName}`;
                                            return (
                                                <View key={index} style={styles.tableRow}>
                                                    <Text style={[styles.td, styles.wLocation]}>{location}</Text>
                                                    <Text style={[styles.td, styles.wBatch]}>
                                                        {detail.batchBoxByBatch.batch.batchID}
                                                    </Text>
                                                    <Text style={[styles.td, styles.wName]}>
                                                        {detail.batchBoxByBatch.batch.product.productName}
                                                    </Text>
                                                    <Text style={[styles.td, styles.wUnit]}>
                                                        {detail.batchBoxByBatch.batch.unit.unitName}
                                                    </Text>
                                                    <Text
                                                        style={[
                                                            styles.td,
                                                            styles.wStatus,
                                                            Math.abs(detail.discrepancyQuantity) !== 0 &&
                                                                styles.highlight,
                                                        ]}
                                                    >
                                                        {formatStatusInventoryCheckDetail[detail.status]}
                                                    </Text>
                                                    <Text style={[styles.td, styles.wNum]}>
                                                        {detail.systemQuantity}
                                                    </Text>
                                                    <Text style={[styles.td, styles.wNum]}>
                                                        {detail.actualQuantity}
                                                    </Text>
                                                    <Text
                                                        style={[
                                                            styles.td,
                                                            styles.wNum,
                                                            Math.abs(detail.discrepancyQuantity) !== 0 &&
                                                                styles.highlight,
                                                        ]}
                                                    >
                                                        {Math.abs(detail.discrepancyQuantity)}
                                                    </Text>
                                                    <Text style={[styles.td, styles.wNote]}>{detail.reason || ''}</Text>
                                                </View>
                                            );
                                        })}
                                </View>
                            </ScrollView>
                        </View>
                    </ScrollView>

                    {/* Footer Actions */}
                    <View style={styles.footer}>
                        {type === 'detail' && inventoryCheckDetail?.status === 'PENDING' && isAdmin && (
                            <>
                                <TouchableOpacity
                                    style={[styles.btn, styles.btnError]}
                                    onPress={() => handleUpdateStatus('REFUSE', inventoryCheckDetail?.inventoryCheckID)}
                                >
                                    <Text style={styles.btnText}>Từ chối</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.btn, styles.btnSuccess]}
                                    onPress={() =>
                                        handleUpdateStatus('COMPLETED', inventoryCheckDetail?.inventoryCheckID)
                                    }
                                >
                                    <Text style={styles.btnText}>Phê duyệt</Text>
                                </TouchableOpacity>
                            </>
                        )}
                        <TouchableOpacity style={[styles.btn, styles.btnClose]} onPress={onClose}>
                            <Text style={[styles.btnText, { color: '#374151' }]}>Đóng</Text>
                        </TouchableOpacity>
                        {type === 'create' && (
                            <TouchableOpacity
                                style={[styles.btn, styles.btnPrimary]}
                                onPress={handleSaveInventoryCheck}
                            >
                                <Text style={styles.btnText}>Lưu phiếu</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            </View>
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
        backgroundColor: '#fff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        height: '90%',
        display: 'flex',
        flexDirection: 'column',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#111827',
    },
    body: {
        flex: 1,
        padding: 16,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 12,
        color: '#374151',
    },
    formGroup: {
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
        color: '#374151',
        marginBottom: 6,
    },
    input: {
        borderWidth: 1,
        borderColor: '#d1d5db',
        borderRadius: 8,
        padding: 10,
        fontSize: 14,
        color: '#1f2937',
    },
    disabledInput: {
        backgroundColor: '#f3f4f6',
        color: '#6b7280',
    },
    inputRow: {
        flexDirection: 'row',
        gap: 10,
    },
    btnGenerate: {
        backgroundColor: '#3b82f6',
        paddingHorizontal: 16,
        justifyContent: 'center',
        borderRadius: 8,
    },
    btnGenerateText: {
        color: '#fff',
        fontWeight: '600',
    },

    // Table Styles
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: '#f3f4f6',
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
    },
    tableRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
        alignItems: 'center',
    },
    th: {
        padding: 10,
        fontWeight: '600',
        color: '#4b5563',
        fontSize: 13,
    },
    td: {
        padding: 10,
        fontSize: 13,
        color: '#1f2937',
    },
    wLocation: { width: 150 },
    wBatch: { width: 80 },
    wName: { width: 150 },
    wUnit: { width: 80 },
    wStatus: { width: 100 },
    wNum: { width: 80, textAlign: 'right' },
    wNote: { width: 150 },
    highlight: {
        color: '#ef4444',
        fontWeight: 'bold',
    },
    cellInput: {
        borderWidth: 1,
        borderColor: '#d1d5db',
        borderRadius: 4,
        padding: 4,
        fontSize: 13,
        width: '100%',
    },

    // Footer
    footer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: '#e5e7eb',
        gap: 10,
    },
    btn: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    btnPrimary: {
        backgroundColor: '#3b82f6',
    },
    btnSuccess: {
        backgroundColor: '#22c55e',
    },
    btnError: {
        backgroundColor: '#ef4444',
    },
    btnClose: {
        backgroundColor: '#e5e7eb',
    },
    btnText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 14,
    },
});

export default CreateCheckDetail;
