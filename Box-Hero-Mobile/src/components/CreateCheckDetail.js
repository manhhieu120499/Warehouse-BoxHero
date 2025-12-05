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
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { format } from 'date-fns';
import { X } from 'lucide-react-native';
import { updateInventoryCheck } from '../service/inventoryCheck.service';
import { authIsAdmin } from '../common';

const CreateCheckDetail = ({ isOpen, onClose, inventoryCheckDetail, fetchData }) => {
    const navigation = useNavigation();
    const currentUser = useSelector((state) => state.AuthSlice.user);

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
                                        style={[styles.input, { flex: 1 }, styles.disabledInput]}
                                        value={inventoryCheckDetail?.inventoryCheckID}
                                        placeholder="Nhập mã phiếu"
                                        editable={false}
                                    />
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
                                        value={inventoryCheckDetail?.employee?.employeeName}
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
                                        styles.disabledInput,
                                    ]}
                                    value={inventoryCheckDetail?.note || 'Không có ghi chú'}
                                    placeholder="Nhập ghi chú chung..."
                                    multiline={true}
                                    editable={false}
                                />
                            </View>
                        </View>

                        {/* List Items */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>
                                Danh sách hàng hóa ({inventoryCheckDetail?.details?.length})
                            </Text>

                            {inventoryCheckDetail?.details?.map((detail, index) => {
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

                                        <View style={styles.divider} />

                                        <View style={styles.quantityContainer}>
                                            <View style={styles.qBox}>
                                                <Text style={styles.qLabel}>Tồn hệ thống</Text>
                                                <Text style={styles.qValue}>{detail.systemQuantity}</Text>
                                            </View>
                                            <View style={styles.qBox}>
                                                <Text style={styles.qLabel}>Thực tế</Text>
                                                <Text style={[styles.qValue, { fontWeight: 'bold' }]}>
                                                    {inventoryCheckDetail?.status === 'PENDING_CHECK'
                                                        ? '---'
                                                        : detail.actualQuantity}
                                                </Text>
                                            </View>
                                            <View style={styles.qBox}>
                                                <Text style={styles.qLabel}>Chênh lệch</Text>
                                                <Text
                                                    style={[
                                                        styles.qValue,
                                                        inventoryCheckDetail?.status !== 'PENDING_CHECK'
                                                            ? Math.abs(detail.discrepancyQuantity) !== 0
                                                                ? styles.textError
                                                                : styles.textSuccess
                                                            : {},
                                                    ]}
                                                >
                                                    {inventoryCheckDetail?.status === 'PENDING_CHECK'
                                                        ? '---'
                                                        : Math.abs(detail.discrepancyQuantity)}
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
                        {inventoryCheckDetail?.status === 'PENDING_CHECK' && (
                            <TouchableOpacity
                                style={[styles.btn, styles.btnPrimary, { flex: 1 }]}
                                onPress={() => {
                                    onClose();
                                    navigation.navigate('ScanInventoryCheck', { inventoryCheckDetail });
                                }}
                            >
                                <Text style={styles.btnText}>Kiểm kê</Text>
                            </TouchableOpacity>
                        )}
                        {inventoryCheckDetail?.status === 'PENDING' && authIsAdmin(currentUser) && (
                            <>
                                <TouchableOpacity
                                    style={[styles.btn, styles.btnError, { flex: 1 }]}
                                    onPress={() => handleUpdateStatus('REFUSE', inventoryCheckDetail?.inventoryCheckID)}
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
