import React, { useEffect, useState } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { X } from 'lucide-react-native';
import { format } from 'date-fns';

const BatchExportOfProduct = ({ item, isOpen, onClose }) => {
    const [batchList, setBatchList] = useState([]);

    useEffect(() => {
        if (!item) return;
        const formatBatchList = item.batchOfProductExported.map((info) => {
            const uom = info.batch?.unit?.conversionQuantity || 1;
            return {
                batchID: info.batch?.batchID,
                manufactureDate: info.batch?.manufactureDate,
                expiryDate: info.batch?.expiryDate,
                unitName: info.batch?.unit?.unitName,
                quantityExported: info.quantityExported,
                conversion: Number(info.quantityExported) * Number(uom),
            };
        });
        setBatchList(formatBatchList);
    }, [item]);

    return (
        <Modal visible={isOpen} animationType="slide" transparent={true} onRequestClose={onClose}>
            <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Danh sách lô hàng xuất</Text>
                        <TouchableOpacity onPress={onClose}>
                            <X size={24} color="#333" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
                        {batchList.map((batch, index) => (
                            <View key={index} style={styles.card}>
                                <View style={styles.cardHeader}>
                                    <Text style={styles.batchId}>{batch.batchID}</Text>
                                    <View style={styles.badge}>
                                        <Text style={styles.badgeText}>{batch.unitName}</Text>
                                    </View>
                                </View>

                                <View style={styles.row}>
                                    <View style={styles.col}>
                                        <Text style={styles.label}>NSX</Text>
                                        <Text style={styles.value}>
                                            {batch.manufactureDate
                                                ? format(new Date(batch.manufactureDate), 'dd/MM/yyyy')
                                                : 'N/A'}
                                        </Text>
                                    </View>
                                    <View style={styles.col}>
                                        <Text style={styles.label}>HSD</Text>
                                        <Text style={styles.value}>
                                            {batch.expiryDate
                                                ? format(new Date(batch.expiryDate), 'dd/MM/yyyy')
                                                : 'N/A'}
                                        </Text>
                                    </View>
                                </View>

                                <View style={styles.row}>
                                    <View style={styles.col}>
                                        <Text style={styles.label}>Số lượng xuất</Text>
                                        <Text style={[styles.value, styles.highlight]}>{batch.quantityExported}</Text>
                                    </View>
                                    <View style={styles.col}>
                                        <Text style={styles.label}>Quy đổi</Text>
                                        <Text style={styles.value}>{batch.conversion}</Text>
                                    </View>
                                </View>
                            </View>
                        ))}
                        {batchList.length === 0 && <Text style={styles.emptyText}>Không có thông tin lô hàng</Text>}
                    </ScrollView>
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
        backgroundColor: 'white',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        height: '60%',
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
    card: {
        backgroundColor: '#f9fafb',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#e5e7eb',
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    batchId: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1f2937',
    },
    badge: {
        backgroundColor: '#dbeafe',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    badgeText: {
        color: '#1e40af',
        fontSize: 12,
        fontWeight: '500',
    },
    row: {
        flexDirection: 'row',
        marginBottom: 8,
    },
    col: {
        flex: 1,
    },
    label: {
        fontSize: 12,
        color: '#6b7280',
        marginBottom: 2,
    },
    value: {
        fontSize: 14,
        color: '#374151',
        fontWeight: '500',
    },
    highlight: {
        color: '#2563eb',
        fontWeight: 'bold',
    },
    emptyText: {
        textAlign: 'center',
        color: '#6b7280',
        marginTop: 20,
    },
});

export default BatchExportOfProduct;
