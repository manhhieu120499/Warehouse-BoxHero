import React, { useEffect, useState } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { X, Eye } from 'lucide-react-native';
import parseToken from '../../../utilities/parseToken';
import { format } from 'date-fns';
import BatchExportOfProduct from './BatchExportOfProduct';

const OrderReleaseDetail = ({ isOpen, onClose, orderReleaseItem }) => {
    const [orderDetail, setOrderDetail] = useState([]);
    const [warehouse, setWarehouse] = useState(null);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [showBatchModal, setShowBatchModal] = useState(false);

    useEffect(() => {
        const getWarehouse = async () => {
            const wh = await parseToken('warehouse');
            setWarehouse(wh);
        };
        getWarehouse();
    }, []);

    useEffect(() => {
        if (!orderReleaseItem) return;
        const groupDetail = [];

        if (orderReleaseItem.orderReleaseDetails) {
            const formatOrderReleaseData = orderReleaseItem.orderReleaseDetails.map((item) => {
                const uom = item.batch?.unit?.conversionQuantity || 1;
                const totalQuantityExport =
                    item.orderReleaseBatchBoxDetails?.reduce(
                        (acc, cur) => acc + Number(cur.quantityExported) * Number(uom),
                        0,
                    ) || 0;
                return {
                    productID: item.batch?.product?.productID,
                    productName: item.batch?.product?.productName,
                    unitName: item.batch?.product?.baseUnitProducts?.baseUnitName,
                    quantityExported: totalQuantityExport,
                    batchOfProductExported: [item],
                };
            });

            formatOrderReleaseData.forEach((item) => {
                const existProduct = groupDetail.find((prod) => prod.productID === item.productID);
                if (existProduct) {
                    existProduct.quantityExported += item.quantityExported;
                    existProduct.batchOfProductExported.push(item.batchOfProductExported[0]);
                } else {
                    groupDetail.push({ ...item });
                }
            });
        }
        setOrderDetail(groupDetail);
    }, [orderReleaseItem]);

    return (
        <Modal visible={isOpen} animationType="slide" transparent={true} onRequestClose={onClose}>
            <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Chi tiết phiếu xuất kho</Text>
                        <TouchableOpacity onPress={onClose}>
                            <X size={24} color="#333" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
                        {/* General Info */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Thông tin chung</Text>

                            <View style={styles.infoRow}>
                                <Text style={styles.label}>Mã phiếu:</Text>
                                <Text style={styles.value}>{orderReleaseItem?.orderReleaseID}</Text>
                            </View>
                            <View style={styles.infoRow}>
                                <Text style={styles.label}>Ngày lập:</Text>
                                <Text style={styles.value}>
                                    {orderReleaseItem?.createdAt
                                        ? format(new Date(orderReleaseItem.createdAt), 'dd/MM/yyyy')
                                        : ''}
                                </Text>
                            </View>
                            <View style={styles.infoRow}>
                                <Text style={styles.label}>Kho:</Text>
                                <Text style={styles.value}>{warehouse?.warehouseName}</Text>
                            </View>
                            <View style={styles.infoRow}>
                                <Text style={styles.label}>Người lập:</Text>
                                <Text style={styles.value}>{orderReleaseItem?.employees?.employeeName}</Text>
                            </View>
                            <View style={styles.infoRow}>
                                <Text style={styles.label}>Khách hàng:</Text>
                                <Text style={styles.value}>
                                    {orderReleaseItem?.customers?.customerName} (
                                    {orderReleaseItem?.customers?.customerID})
                                </Text>
                            </View>
                        </View>

                        {/* Product List */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Chi tiết xuất kho</Text>
                            {orderDetail.map((item, index) => (
                                <View key={index} style={styles.productCard}>
                                    <View style={styles.productHeader}>
                                        <View style={{ flex: 1 }}>
                                            <Text style={styles.productName}>{item.productName}</Text>
                                            <Text style={styles.productCode}>{item.productID}</Text>
                                        </View>
                                        <TouchableOpacity
                                            style={styles.detailBtn}
                                            onPress={() => {
                                                setSelectedProduct(item);
                                                setShowBatchModal(true);
                                            }}
                                        >
                                            <Eye size={20} color="#2563eb" />
                                        </TouchableOpacity>
                                    </View>

                                    <View style={styles.productBody}>
                                        <View style={styles.productRow}>
                                            <Text style={styles.productLabel}>Đơn vị tính:</Text>
                                            <Text style={styles.productValue}>{item.unitName}</Text>
                                        </View>
                                        <View style={styles.productRow}>
                                            <Text style={styles.productLabel}>Số lượng xuất:</Text>
                                            <Text style={styles.productValueHighlight}>{item.quantityExported}</Text>
                                        </View>
                                    </View>
                                </View>
                            ))}
                        </View>
                    </ScrollView>
                </View>
            </View>

            {/* Batch Detail Modal */}
            {selectedProduct && (
                <BatchExportOfProduct
                    item={selectedProduct}
                    isOpen={showBatchModal}
                    onClose={() => {
                        setShowBatchModal(false);
                        setSelectedProduct(null);
                    }}
                />
            )}
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
        backgroundColor: 'white',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        height: '90%',
        padding: 20,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1f2937',
    },
    body: {
        flex: 1,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
        paddingBottom: 8,
    },
    infoRow: {
        flexDirection: 'row',
        marginBottom: 8,
    },
    label: {
        width: 100,
        color: '#6b7280',
        fontSize: 14,
    },
    value: {
        flex: 1,
        color: '#1f2937',
        fontSize: 14,
        fontWeight: '500',
    },
    // Product Card
    productCard: {
        backgroundColor: '#f9fafb',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#e5e7eb',
    },
    productHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
        paddingBottom: 8,
    },
    productName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1f2937',
        marginBottom: 4,
    },
    productCode: {
        fontSize: 14,
        color: '#6b7280',
    },
    detailBtn: {
        padding: 8,
        backgroundColor: '#eff6ff',
        borderRadius: 8,
    },
    productBody: {
        gap: 8,
    },
    productRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    productLabel: {
        fontSize: 14,
        color: '#6b7280',
    },
    productValue: {
        fontSize: 14,
        color: '#374151',
        fontWeight: '500',
    },
    productValueHighlight: {
        fontSize: 14,
        color: '#2563eb',
        fontWeight: 'bold',
    },
});

export default OrderReleaseDetail;
