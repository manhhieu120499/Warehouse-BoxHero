import React, { useEffect, useState } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { X, Package, Layers, Calendar, Box } from 'lucide-react-native';
import parseToken from '../../../utilities/parseToken';
import { format } from 'date-fns';

const OrderReleaseDetail = ({ isOpen, onClose, orderReleaseItem, onConfirm, onRefuse }) => {
    const [orderDetail, setOrderDetail] = useState([]);
    const [warehouse, setWarehouse] = useState(null);

    useEffect(() => {
        const getWarehouse = async () => {
            const wh = await parseToken('warehouse');
            setWarehouse(wh);
        };
        getWarehouse();
    }, []);

    useEffect(() => {
        if (!orderReleaseItem || !orderReleaseItem.orderReleaseDetails) return;
        const groupDetail = [];

        orderReleaseItem.orderReleaseDetails.forEach((item) => {
            const product = item.batch.product;
            const unitName = item.batch.unit.unitName;
            const existProduct = groupDetail.find(
                (prod) => prod.productID === product.productID && prod.unitName === unitName,
            );
            if (existProduct) {
                existProduct.quantityExported += item.quantityExported;
                existProduct.batchOfProductExported.push(item);
            } else {
                groupDetail.push({
                    productID: product.productID,
                    productName: product.productName,
                    unitName: unitName,
                    quantityExported: item.quantityExported,
                    batchOfProductExported: [item],
                });
            }
        });

        setOrderDetail(groupDetail);
    }, [orderReleaseItem]);

    const formatDate = (dateString) => {
        if (!dateString) return '';
        return format(new Date(dateString), 'dd/MM/yyyy');
    };

    return (
        <Modal visible={isOpen} animationType="fade" transparent={true} onRequestClose={onClose}>
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    {/* Header */}
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Chi tiết phiếu xuất</Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <X size={20} color="#4B5563" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView
                        style={styles.body}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={styles.scrollContent}
                    >
                        {/* General Info Card */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Thông tin chung</Text>
                            <View style={styles.infoCard}>
                                <View style={styles.infoRow}>
                                    <View style={styles.infoItem}>
                                        <Text style={styles.label}>Mã phiếu</Text>
                                        <Text style={styles.valueText}>
                                            {orderReleaseItem?.orderReleaseID || '---'}
                                        </Text>
                                    </View>
                                    <View style={styles.infoItem}>
                                        <Text style={styles.label}>Ngày lập</Text>
                                        <Text style={styles.valueText}>
                                            {orderReleaseItem?.createdAt
                                                ? format(new Date(orderReleaseItem.createdAt), 'dd/MM/yyyy')
                                                : '---'}
                                        </Text>
                                    </View>
                                </View>
                                <View style={styles.divider} />
                                <View style={styles.infoRow}>
                                    <View style={styles.infoItem}>
                                        <Text style={styles.label}>Kho</Text>
                                        <Text style={styles.valueText}>{warehouse?.warehouseName || '---'}</Text>
                                    </View>
                                    <View style={styles.infoItem}>
                                        <Text style={styles.label}>Người lập</Text>
                                        <Text style={styles.valueText}>
                                            {orderReleaseItem?.employees?.employeeName || '---'}
                                        </Text>
                                    </View>
                                </View>
                                <View style={styles.divider} />
                                <View style={styles.infoRow}>
                                    <View style={styles.infoItemFull}>
                                        <Text style={styles.label}>Khách hàng</Text>
                                        <Text style={styles.valueText}>
                                            {orderReleaseItem?.customers?.customerName}{' '}
                                            <Text style={styles.subValue}>
                                                ({orderReleaseItem?.customers?.customerID})
                                            </Text>
                                        </Text>
                                    </View>
                                </View>
                            </View>
                        </View>

                        {/* Product List */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Danh sách sản phẩm</Text>
                            {orderDetail.map((product, index) => (
                                <View key={index} style={styles.productCard}>
                                    {/* Product Header */}
                                    <View style={styles.productHeader}>
                                        <View style={styles.productIcon}>
                                            <Package size={20} color="#fff" />
                                        </View>
                                        <View style={styles.productInfo}>
                                            <Text style={styles.productName}>{product.productName}</Text>
                                            <Text style={styles.productId}>{product.productID}</Text>
                                        </View>
                                        <View style={styles.totalBadge}>
                                            <Text style={styles.totalLabel}>Tổng xuất</Text>
                                            <Text style={styles.totalValue}>
                                                {product.quantityExported}{' '}
                                                <Text style={styles.unitText}>{product.unitName}</Text>
                                            </Text>
                                        </View>
                                    </View>

                                    {/* Batch List */}
                                    <View style={styles.batchContainer}>
                                        <View style={styles.tableHeader}>
                                            <Text style={[styles.headerText, { flex: 3 }]}>LÔ / HSD</Text>
                                            <Text style={[styles.headerText, { flex: 4 }]}>CHI TIẾT HỘP</Text>
                                            <Text style={[styles.headerText, { flex: 1.5, textAlign: 'right' }]}>
                                                SL
                                            </Text>
                                        </View>

                                        {product.batchOfProductExported.map((batchDetail, bIndex) => (
                                            <View key={bIndex} style={styles.batchRow}>
                                                {/* Batch Info */}
                                                <View style={{ flex: 3, paddingRight: 8 }}>
                                                    <View style={styles.batchIdTag}>
                                                        <Layers size={12} color="#4B5563" />
                                                        <Text style={styles.batchIdText}>
                                                            {batchDetail.batch.batchID}
                                                        </Text>
                                                    </View>
                                                    <View style={styles.expiryRow}>
                                                        <Calendar size={12} color="#9CA3AF" />
                                                        <Text style={styles.expiryText}>
                                                            {formatDate(batchDetail.batch.expiryDate)}
                                                        </Text>
                                                    </View>
                                                </View>

                                                {/* Box Details */}
                                                <View style={{ flex: 4 }}>
                                                    {batchDetail.orderReleaseBatchBoxDetails &&
                                                    batchDetail.orderReleaseBatchBoxDetails.length > 0 ? (
                                                        <View style={styles.boxList}>
                                                            {batchDetail.orderReleaseBatchBoxDetails.map(
                                                                (box, boxIndex) => (
                                                                    <View key={boxIndex} style={styles.boxTag}>
                                                                        <Box size={10} color="#4B5563" />
                                                                        <Text style={styles.boxText}>{box.boxID}</Text>
                                                                        <View style={styles.boxQtyBadge}>
                                                                            <Text style={styles.boxQtyText}>
                                                                                x{box.quantityExported}
                                                                            </Text>
                                                                        </View>
                                                                    </View>
                                                                ),
                                                            )}
                                                        </View>
                                                    ) : (
                                                        <Text style={styles.noBoxText}>Không có hộp</Text>
                                                    )}
                                                </View>

                                                {/* Quantity */}
                                                <View
                                                    style={{
                                                        flex: 1.5,
                                                        alignItems: 'flex-end',
                                                        justifyContent: 'center',
                                                    }}
                                                >
                                                    <Text style={styles.rowQty}>{batchDetail.quantityExported}</Text>
                                                </View>
                                            </View>
                                        ))}
                                    </View>
                                </View>
                            ))}
                        </View>
                    </ScrollView>

                    {/* Footer Actions */}
                    {orderReleaseItem?.status === 'PENDING_PICK' && (
                        <View style={styles.footer}>
                            <TouchableOpacity style={[styles.actionButton, styles.refuseButton]} onPress={onRefuse}>
                                <Text style={styles.refuseText}>Từ chối</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.actionButton, styles.confirmButton]} onPress={onConfirm}>
                                <Text style={styles.confirmText}>Xuất hàng</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#F3F4F6',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        height: '92%',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
    },
    modalHeader: {
        backgroundColor: '#fff',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#111827',
    },
    closeButton: {
        padding: 8,
        backgroundColor: '#F3F4F6',
        borderRadius: 20,
    },
    body: {
        flex: 1,
    },
    scrollContent: {
        padding: 16,
        paddingBottom: 20,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: '#6B7280',
        marginBottom: 12,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    // Info Card
    infoCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    infoItem: {
        width: '48%',
    },
    infoItemFull: {
        width: '100%',
    },
    divider: {
        height: 1,
        backgroundColor: '#F3F4F6',
        marginVertical: 12,
    },
    label: {
        fontSize: 12,
        color: '#9CA3AF',
        marginBottom: 4,
        fontWeight: '500',
    },
    valueText: {
        fontSize: 14,
        color: '#1F2937',
        fontWeight: '600',
    },
    subValue: {
        color: '#6B7280',
        fontWeight: '400',
    },
    // Product Card
    productCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.06,
        shadowRadius: 12,
        elevation: 3,
        overflow: 'hidden',
    },
    productHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    productIcon: {
        width: 40,
        height: 40,
        borderRadius: 10,
        backgroundColor: '#4F46E5',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    productInfo: {
        flex: 1,
    },
    productName: {
        fontSize: 15,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 2,
    },
    productId: {
        fontSize: 12,
        color: '#6B7280',
        fontFamily: 'monospace',
    },
    totalBadge: {
        alignItems: 'flex-end',
        backgroundColor: '#EFF6FF',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 8,
    },
    totalLabel: {
        fontSize: 10,
        color: '#3B82F6',
        fontWeight: '600',
        marginBottom: 2,
    },
    totalValue: {
        fontSize: 14,
        fontWeight: '800',
        color: '#1D4ED8',
    },
    unitText: {
        fontSize: 11,
        fontWeight: '500',
    },
    // Batch Table
    batchContainer: {
        padding: 16,
    },
    tableHeader: {
        flexDirection: 'row',
        marginBottom: 12,
        paddingHorizontal: 4,
    },
    headerText: {
        fontSize: 11,
        fontWeight: '700',
        color: '#9CA3AF',
    },
    batchRow: {
        flexDirection: 'row',
        paddingVertical: 12,
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
    },
    batchIdTag: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginBottom: 4,
    },
    batchIdText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#374151',
    },
    expiryRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    expiryText: {
        fontSize: 11,
        color: '#6B7280',
    },
    boxList: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 6,
    },
    boxTag: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
        paddingLeft: 6,
        paddingRight: 8,
        paddingVertical: 4,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        gap: 4,
    },
    boxText: {
        fontSize: 11,
        color: '#4B5563',
        fontWeight: '500',
    },
    boxQtyBadge: {
        backgroundColor: '#E5E7EB',
        paddingHorizontal: 5,
        paddingVertical: 1,
        borderRadius: 10,
    },
    boxQtyText: {
        fontSize: 10,
        fontWeight: '700',
        color: '#374151',
    },
    noBoxText: {
        fontSize: 12,
        color: '#9CA3AF',
        fontStyle: 'italic',
        marginTop: 4,
    },
    rowQty: {
        fontSize: 14,
        fontWeight: '700',
        color: '#111827',
    },
    // Footer Styles
    footer: {
        flexDirection: 'row',
        padding: 16,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
        gap: 12,
    },
    actionButton: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    refuseButton: {
        backgroundColor: '#ef4444',
    },
    confirmButton: {
        backgroundColor: '#10b981',
    },
    refuseText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    confirmText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});

export default OrderReleaseDetail;
