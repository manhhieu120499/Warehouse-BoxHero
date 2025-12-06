import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, TextInput, Alert } from 'react-native';
import { X } from 'lucide-react-native';
import { formatDate } from '../utilities/formatDate';
import parseToken from '../utilities/parseToken';
import request from '../config/axiosConfig';
import { useNavigation } from '@react-navigation/native';

const formatStatusOrderPurchaseMissing = {
    PENDING: 'Đang xử lý',
    RESOLVED: 'Đã giải quyết',
    CANCELED: 'Đã hủy',
};

const statusColors = {
    PENDING: '#FBBF24',
    RESOLVED: '#10B981',
    CANCELED: '#EF4444',
};

const ModalReceiveProductMissingDetail = ({ data, isOpen, onClose, reset }) => {
    const navigation = useNavigation();
    const [showPopConfirmSaveMissing, setShowPopConfirmSaveMissing] = useState(false);

    const handleUpdateStatus = async (status) => {
        try {
            const token = await parseToken('tokenUser');
            const warehouse = await parseToken('warehouse');
            const res = await request.post(
                '/order-purchase/update-status-order-purchase',
                {
                    orderPurchaseID: data.orderPurchaseMissingID,
                    status,
                },
                {
                    headers: {
                        token: `Bearer ${token.accessToken}`,
                        employeeid: token.employeeID,
                        warehouseid: warehouse.warehouseID,
                    },
                },
            );
            Alert.alert('Thành công', 'Cập nhật trạng thái thành công');
            //reset({ pageFilter: 1 });
            reset(1);
            onClose();
        } catch (err) {
            Alert.alert('Lỗi', 'Cập nhật trạng thái thất bại');
            console.log(err);
        }
    };

    const handlePurchaseSupplement = () => {
        onClose();
        navigation.navigate('CreateMissingImportDetail', { order: data });
    };

    if (!data) return null;

    return (
        <Modal visible={isOpen} animationType="slide" transparent={true} onRequestClose={onClose}>
            <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Chi tiết phiếu nhập thiếu</Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <X size={24} color="#374151" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                        <View style={styles.detailSection}>
                            <Text style={styles.sectionTitle}>Thông tin chung</Text>
                            <View style={styles.row}>
                                <View style={{ flex: 1, marginRight: 12 }}>
                                    <Text style={styles.label}>Mã phiếu</Text>
                                    <TextInput
                                        style={[styles.input, styles.readOnly]}
                                        value={data.orderPurchaseMissingID}
                                        editable={false}
                                    />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.label}>Ngày lập</Text>
                                    <TextInput
                                        style={[styles.input, styles.readOnly]}
                                        value={formatDate(data.createdAt)}
                                        editable={false}
                                    />
                                </View>
                            </View>
                            <View style={styles.row}>
                                <View style={{ flex: 1, marginRight: 12 }}>
                                    <Text style={styles.label}>Kho nhập</Text>
                                    <TextInput
                                        style={[styles.input, styles.readOnly]}
                                        value={data.orderPurchase?.warehouseID}
                                        editable={false}
                                    />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.label}>Người lập</Text>
                                    <TextInput
                                        style={[styles.input, styles.readOnly]}
                                        value={data.orderPurchase?.employee?.employeeName}
                                        editable={false}
                                    />
                                </View>
                            </View>
                            <View style={styles.row}>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.label}>Trạng thái</Text>
                                    <View
                                        style={[
                                            styles.statusBadge,
                                            {
                                                backgroundColor: statusColors[data.status] + '20',
                                            },
                                        ]}
                                    >
                                        <Text
                                            style={[
                                                styles.statusText,
                                                {
                                                    color: statusColors[data.status],
                                                },
                                            ]}
                                        >
                                            {formatStatusOrderPurchaseMissing[data.status]}
                                        </Text>
                                    </View>
                                </View>
                            </View>
                            {data.status === 'RESOLVED' && (
                                <View style={[styles.row, { marginTop: 12 }]}>
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.label}>Ngày giải quyết</Text>
                                        <TextInput
                                            style={[styles.input, styles.readOnly]}
                                            value={formatDate(data.updatedAt)}
                                            editable={false}
                                        />
                                    </View>
                                </View>
                            )}
                        </View>

                        <View style={styles.detailSection}>
                            <Text style={styles.sectionTitle}>
                                Danh sách sản phẩm ({data.orderPurchaseMissingDetails?.length})
                            </Text>
                            {data.orderPurchaseMissingDetails?.map((item, index) => (
                                <View key={index} style={styles.whiteCard}>
                                    <View style={styles.productHeader}>
                                        <Text style={styles.productName}>
                                            {item.orderPurchaseDetail?.batch?.product?.productName}
                                        </Text>
                                        <Text style={styles.productSku}>
                                            #{item.orderPurchaseDetail?.batch?.productID}
                                        </Text>
                                    </View>
                                    <Text style={styles.unitText}>
                                        Đơn vị: {item.orderPurchaseDetail?.batch?.unit?.unitName}
                                    </Text>

                                    <View style={styles.gridRow}>
                                        <View style={styles.gridCol}>
                                            <Text style={styles.labelSmall}>Mã lô</Text>
                                            <Text style={styles.valueText}>{item.orderPurchaseDetail?.batchID}</Text>
                                        </View>
                                        <View style={styles.gridCol}>
                                            <Text style={styles.labelSmall}>Yêu cầu</Text>
                                            <Text style={styles.valueText}>
                                                {item.orderPurchaseDetail?.requestedQuantity}
                                            </Text>
                                        </View>
                                        <View style={styles.gridCol}>
                                            <Text style={styles.labelSmall}>Thiếu</Text>
                                            <Text style={[styles.valueText, { color: '#EF4444', fontWeight: 'bold' }]}>
                                                {item.missingQuantity}
                                            </Text>
                                        </View>
                                    </View>
                                </View>
                            ))}
                        </View>
                    </ScrollView>

                    <View style={styles.modalFooter}>
                        {data.status === 'PENDING' && (
                            <>
                                <TouchableOpacity
                                    style={[styles.btnAction, styles.btnSuccess]}
                                    onPress={handlePurchaseSupplement}
                                >
                                    <Text style={styles.btnText}>Nhập bổ sung</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.btnAction, styles.btnError]}
                                    onPress={() => setShowPopConfirmSaveMissing(true)}
                                >
                                    <Text style={styles.btnText}>Hủy phiếu</Text>
                                </TouchableOpacity>
                            </>
                        )}
                        <TouchableOpacity style={[styles.btnAction, styles.btnClose]} onPress={onClose}>
                            <Text style={[styles.btnText, { color: '#374151' }]}>Đóng</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>

            {/* Confirm Cancel Modal */}
            <Modal
                visible={showPopConfirmSaveMissing}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setShowPopConfirmSaveMissing(false)}
            >
                <View style={styles.confirmModalOverlay}>
                    <View style={styles.confirmModalContent}>
                        <Text style={styles.confirmTitle}>Thông báo</Text>
                        <Text style={styles.confirmMessage}>Bạn có chắc chắn muốn hủy phiếu nhập thiếu này không?</Text>
                        <View style={styles.confirmActions}>
                            <TouchableOpacity
                                style={[styles.confirmBtn, styles.confirmBtnYes]}
                                onPress={() => {
                                    setShowPopConfirmSaveMissing(false);
                                    handleUpdateStatus('CANCELED');
                                }}
                            >
                                <Text style={styles.confirmBtnText}>Có</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.confirmBtn, styles.confirmBtnNo]}
                                onPress={() => setShowPopConfirmSaveMissing(false)}
                            >
                                <Text style={[styles.confirmBtnText, { color: '#374151' }]}>Không</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
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
        height: '92%',
        width: '100%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1F2937',
    },
    closeButton: {
        padding: 4,
    },
    scrollContent: {
        padding: 16,
        paddingBottom: 20,
    },
    detailSection: {
        marginBottom: 24,
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
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    label: {
        fontSize: 13,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 6,
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
    readOnly: {
        backgroundColor: '#F9FAFB',
        color: '#6B7280',
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 8,
        borderRadius: 8,
        alignSelf: 'flex-start',
    },
    statusText: {
        fontSize: 14,
        fontWeight: '600',
    },
    whiteCard: {
        backgroundColor: '#fff',
        padding: 12,
        borderRadius: 10,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
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
    gridRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 10,
    },
    gridCol: {
        flex: 1,
    },
    labelSmall: {
        fontSize: 11,
        fontWeight: '500',
        color: '#6B7280',
        marginBottom: 2,
    },
    valueText: {
        fontSize: 14,
        color: '#1F2937',
        fontWeight: '500',
    },
    modalFooter: {
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 10,
        paddingBottom: 30,
    },
    btnAction: {
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
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
    },
    btnText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 14,
    },
    confirmModalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    confirmModalContent: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 20,
        width: '100%',
        maxWidth: 320,
        alignItems: 'center',
    },
    confirmTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1F2937',
        marginBottom: 10,
    },
    confirmMessage: {
        fontSize: 14,
        color: '#4B5563',
        textAlign: 'center',
        marginBottom: 20,
    },
    confirmActions: {
        flexDirection: 'row',
        gap: 12,
        width: '100%',
    },
    confirmBtn: {
        flex: 1,
        paddingVertical: 10,
        borderRadius: 8,
        alignItems: 'center',
    },
    confirmBtnYes: {
        backgroundColor: '#2563EB',
    },
    confirmBtnNo: {
        backgroundColor: '#F3F4F6',
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    confirmBtnText: {
        color: '#fff',
        fontWeight: '600',
    },
});

export default ModalReceiveProductMissingDetail;
