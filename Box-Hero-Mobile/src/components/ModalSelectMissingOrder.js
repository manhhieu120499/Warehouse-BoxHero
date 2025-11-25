import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, FlatList, TextInput } from 'react-native';
import { X, Search, FileText } from 'lucide-react-native';
import { fetchOrderMissing } from '../service/order.service';
import { formatDate } from '../utilities/formatDate';
import parseToken from '../utilities/parseToken';

const ModalSelectMissingOrder = ({ visible, onClose, onSelect }) => {
    const [orders, setOrders] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredOrders, setFilteredOrders] = useState([]);

    useEffect(() => {
        if (visible) {
            loadOrders();
        }
    }, [visible]);

    useEffect(() => {
        if (searchQuery) {
            const lower = searchQuery.toLowerCase();
            const filtered = orders.filter(
                (o) =>
                    o.orderPurchaseMissingID?.toLowerCase().includes(lower) ||
                    o.orderPurchase?.employee?.employeeName?.toLowerCase().includes(lower),
            );
            setFilteredOrders(filtered);
        } else {
            setFilteredOrders(orders);
        }
    }, [searchQuery, orders]);

    const loadOrders = async () => {
        try {
            const warehouse = await parseToken('warehouse');
            const res = await fetchOrderMissing(warehouse.warehouseID);
            if (res.data?.status === 'OK') {
                setOrders(res.data.data || []);
                setFilteredOrders(res.data.data || []);
            }
        } catch (error) {
            console.log('Error loading missing orders:', error);
        }
    };

    const renderItem = ({ item }) => (
        <TouchableOpacity
            style={styles.itemContainer}
            onPress={() => {
                onSelect(item);
                onClose();
            }}
        >
            <View style={styles.iconContainer}>
                <FileText size={24} color="#EF4444" />
            </View>
            <View style={styles.itemContent}>
                <Text style={styles.itemTitle}>{item.orderPurchaseMissingID}</Text>
                <Text style={styles.itemSubtitle}>
                    Người tạo: {item.orderPurchase?.employee?.employeeName} • {formatDate(item.createdAt)}
                </Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <Modal visible={visible} animationType="fade" transparent={true} onRequestClose={onClose}>
            <View style={styles.modalOverlay}>
                <View style={styles.modalContainer}>
                    <View style={styles.header}>
                        <Text style={styles.headerTitle}>Chọn phiếu thiếu</Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <X size={20} color="#6B7280" />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.searchContainer}>
                        <Search size={20} color="#9CA3AF" style={styles.searchIcon} />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Tìm kiếm mã phiếu, người tạo..."
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                    </View>
                    <FlatList
                        data={filteredOrders}
                        renderItem={renderItem}
                        keyExtractor={(item) => item.orderPurchaseMissingID}
                        contentContainerStyle={styles.listContent}
                        ListEmptyComponent={<Text style={styles.emptyText}>Không tìm thấy phiếu thiếu nào</Text>}
                    />
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContainer: {
        width: '100%',
        maxWidth: 400,
        backgroundColor: '#fff',
        borderRadius: 16,
        overflow: 'hidden',
        maxHeight: '80%',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#111827',
    },
    closeButton: {
        padding: 4,
        borderRadius: 20,
        backgroundColor: '#F3F4F6',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
        margin: 16,
        paddingHorizontal: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        height: 44,
        fontSize: 14,
        color: '#111827',
    },
    listContent: {
        paddingHorizontal: 16,
        paddingBottom: 16,
    },
    itemContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#FEE2E2',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    itemContent: {
        flex: 1,
    },
    itemTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1F2937',
        marginBottom: 2,
    },
    itemSubtitle: {
        fontSize: 13,
        color: '#6B7280',
    },
    emptyText: {
        textAlign: 'center',
        color: '#6B7280',
        marginTop: 20,
        fontSize: 14,
    },
});

export default ModalSelectMissingOrder;
