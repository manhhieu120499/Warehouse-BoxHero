import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Modal } from 'react-native';
import { fetchListHistoryOrderCustomer } from '../../../service/customer.service';
import { fetchOrderReleaseById } from '../../../service/order.service';
import { Ionicons } from '@expo/vector-icons';
import OrderReleaseDetail from '../OrderReleaseScreenComponents/OrderReleaseDetail';

const CustomerHistoryTransaction = ({ visible, onClose, customer }) => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    // State for OrderReleaseDetail
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showOrderDetail, setShowOrderDetail] = useState(false);

    console.log('custome', customer);

    useEffect(() => {
        if (visible && customer.customerID) {
            loadHistory(1);
        }
    }, [visible, customer]);

    const loadHistory = async (p) => {
        setLoading(true);
        try {
            // Use customer.id or customer.customerID depending on what's passed
            const customerID = customer.id || customer.customerID;
            const res = await fetchListHistoryOrderCustomer(customerID, p);

            if (res && res.data) {
                setHistory(res.data);
                setTotalPages(res.pagination?.totalPages || 1);
                setPage(p);
            } else {
                setHistory([]);
            }
        } catch (error) {
            console.error('Error fetching history:', error);
            setHistory([]);
        } finally {
            setLoading(false);
        }
    };

    const handleViewDetail = async (item) => {
        setSelectedOrder(item);
        setShowOrderDetail(true);
    };

    const renderItem = ({ item }) => (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <Text style={styles.orderId}>#{item.orderReleaseID || item.orderID}</Text>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
                    <Text style={styles.statusText}>{formatStatus(item.status)}</Text>
                </View>
            </View>

            <View style={styles.cardBody}>
                <View style={styles.row}>
                    <Ionicons name="calendar-outline" size={16} color="#666" />
                    <Text style={styles.rowText}>{new Date(item.createdAt).toLocaleDateString('vi-VN')}</Text>
                </View>
                <View style={styles.row}>
                    <Ionicons name="person-outline" size={16} color="#666" />
                    <Text style={styles.rowText}>
                        Người tạo: {item.employeeName || item.employees?.employeeName || '---'}
                    </Text>
                </View>
                <View style={styles.row}>
                    <Ionicons name="people-outline" size={16} color="#666" />
                    <Text style={styles.rowText}>Khách hàng: {customer?.name || customer?.customerName || '---'}</Text>
                </View>
            </View>

            <TouchableOpacity style={styles.detailButton} onPress={() => handleViewDetail(item)}>
                <Text style={styles.detailButtonText}>Xem chi tiết</Text>
                <Ionicons name="arrow-forward" size={16} color="#2563eb" />
            </TouchableOpacity>
        </View>
    );

    const getStatusColor = (status) => {
        switch (status) {
            case 'COMPLETED':
                return '#dcfce7';
            case 'PENDING':
                return '#fef9c3';
            case 'CANCELLED':
                return '#fee2e2';
            default:
                return '#f3f4f6';
        }
    };

    const formatStatus = (status) => {
        switch (status) {
            case 'COMPLETED':
                return 'Hoàn thành';
            case 'PENDING':
                return 'Đang xử lý';
            case 'CANCELLED':
                return 'Đã hủy';
            default:
                return status;
        }
    };

    return (
        <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.title}>Lịch sử giao dịch</Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <Ionicons name="close" size={24} color="#333" />
                        </TouchableOpacity>
                    </View>
                    <Text style={styles.subtitle}>{customer?.name || customer?.customerName}</Text>

                    {loading ? (
                        <View style={styles.center}>
                            <ActivityIndicator size="large" color="#2563eb" />
                        </View>
                    ) : (
                        <>
                            <FlatList
                                data={history}
                                renderItem={renderItem}
                                keyExtractor={(item, index) => item.orderReleaseID || index.toString()}
                                contentContainerStyle={styles.listContent}
                                ListEmptyComponent={
                                    <View style={styles.center}>
                                        <Text style={styles.emptyText}>Không có lịch sử giao dịch</Text>
                                    </View>
                                }
                                showsVerticalScrollIndicator={false}
                            />

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <View style={styles.pagination}>
                                    <TouchableOpacity
                                        disabled={page <= 1}
                                        onPress={() => loadHistory(page - 1)}
                                        style={[styles.pageBtn, page <= 1 && styles.disabledBtn]}
                                    >
                                        <Ionicons name="chevron-back" size={20} color={page <= 1 ? '#ccc' : '#333'} />
                                    </TouchableOpacity>
                                    <Text style={styles.pageText}>
                                        Trang {page} / {totalPages}
                                    </Text>
                                    <TouchableOpacity
                                        disabled={page >= totalPages}
                                        onPress={() => loadHistory(page + 1)}
                                        style={[styles.pageBtn, page >= totalPages && styles.disabledBtn]}
                                    >
                                        <Ionicons
                                            name="chevron-forward"
                                            size={20}
                                            color={page >= totalPages ? '#ccc' : '#333'}
                                        />
                                    </TouchableOpacity>
                                </View>
                            )}
                        </>
                    )}
                </View>
            </View>

            {/* Order Detail Modal */}
            {showOrderDetail && selectedOrder && (
                <OrderReleaseDetail
                    isOpen={showOrderDetail}
                    onClose={() => setShowOrderDetail(false)}
                    orderReleaseItem={selectedOrder}
                />
            )}
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: 'white',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 16,
        height: '80%', // Adjust height as needed
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    closeButton: {
        padding: 4,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1f2937',
    },
    subtitle: {
        fontSize: 14,
        color: '#6b7280',
        textAlign: 'center',
        marginBottom: 16,
    },
    listContent: {
        paddingHorizontal: 4,
        paddingBottom: 10,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyText: {
        color: '#9ca3af',
        fontSize: 16,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 12,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#e5e7eb',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f3f4f6',
        paddingBottom: 8,
    },
    orderId: {
        fontWeight: 'bold',
        fontSize: 16,
        color: '#374151',
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#374151',
    },
    cardBody: {
        marginBottom: 12,
        gap: 8,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    rowText: {
        color: '#4b5563',
        fontSize: 14,
    },
    detailButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#eff6ff',
        padding: 8,
        borderRadius: 8,
        gap: 4,
    },
    detailButtonText: {
        color: '#2563eb',
        fontWeight: '600',
        fontSize: 14,
    },
    pagination: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
        gap: 16,
    },
    pageBtn: {
        padding: 8,
        borderRadius: 8,
        backgroundColor: '#f3f4f6',
    },
    disabledBtn: {
        opacity: 0.5,
    },
    pageText: {
        fontSize: 14,
        color: '#374151',
    },
});

export default CustomerHistoryTransaction;
