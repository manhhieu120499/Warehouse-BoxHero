import React, { useEffect, useState, useCallback } from 'react';
import {
    StyleSheet,
    Text,
    View,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    TextInput,
    Modal,
    ScrollView,
    Platform,
} from 'react-native';
import { DefaultLayout } from '../layouts';
import Header from '../layouts/Header';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Filter, Calendar, X, ChevronRight, ChevronLeft, Plus } from 'lucide-react-native';
import { filterOrderRelease } from '../service/order.service';
import { format } from 'date-fns';
import DateTimePicker from '@react-native-community/datetimepicker';
import OrderReleaseDetail from '../components/partials/OrderReleaseScreenComponents/OrderReleaseDetail';

export default function OrderReleaseProduct() {
    const navigation = useNavigation();
    const [listOrderRelease, setListOrderRelease] = useState([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [showFilter, setShowFilter] = useState(false);
    const [loading, setLoading] = useState(false);

    console.log(listOrderRelease);

    // Filters
    const [filter, setFilter] = useState({
        orderReleaseID: '',
        createdAt: null,
        employeeName: '',
        receiverName: '',
    });
    const [showDatePicker, setShowDatePicker] = useState(false);

    // Modal open order detail
    const [isOpen, setIsOpen] = useState(false);
    const [orderSelected, setOrderSelected] = useState(null);

    const fetchData = async (currentPage = 1) => {
        try {
            const params = {
                page: currentPage,
                orderReleaseID: filter.orderReleaseID,
                createBy: filter.employeeName,
                createdAt: filter.createdAt ? format(filter.createdAt, 'yyyy-MM-dd') : null,
            };

            const res = await filterOrderRelease(params);
            console.log('res', res);
            if (res && res.status === 'OK') {
                setListOrderRelease(res.data);
                setTotalPages(res.pagination?.totalPages || 1);
            }
        } catch (error) {
            console.log('Error fetching order releases:', error);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchData(page);
        }, [page]),
    );

    const handleApplyFilter = () => {
        setPage(1);
        fetchData(1);
        setShowFilter(false);
    };

    // Improved reset handler to ensure correct data fetch
    const handleResetAndFetch = async () => {
        const resetFilter = {
            orderReleaseID: '',
            createdAt: null,
            employeeName: '',
            receiverName: '',
        };
        setFilter(resetFilter);
        setPage(1);
        setShowFilter(false);

        try {
            const params = {
                page: 1,
                limit: 10,
                ...resetFilter,
            };
            const res = await filterOrderRelease(params);
            if (res && res.status === 'OK') {
                setListOrderRelease(res.data);
                setTotalPages(res.pagination?.totalPages || 1);
            }
        } catch (error) {
            console.log('Error fetching order releases:', error);
        }
    };

    const renderItem = ({ item }) => (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <Text style={styles.cardId}>{item.orderReleaseID}</Text>
                <View style={styles.statusTag}>
                    <Text style={styles.statusText}>Đã xuất kho</Text>
                </View>
            </View>
            <View style={styles.cardBody}>
                <Text style={styles.infoText}>
                    Ngày lập: {item.createdAt ? format(new Date(item.createdAt), 'yyyy-MM-dd') : 'N/A'}
                </Text>
                <Text style={styles.infoText}>Người tạo: {item.employee?.employeeName || item.employeeID}</Text>
                <Text style={styles.infoText}>Người nhận: {item.customers?.customerName || 'N/A'}</Text>
            </View>
            <TouchableOpacity
                style={styles.detailButton}
                onPress={() => {
                    // Navigate to detail screen if exists, or show modal
                    // navigation.navigate('OrderReleaseDetail', { id: item.orderReleaseID });
                    setIsOpen(true);
                    setOrderSelected(item);
                    console.log('View detail', item.orderReleaseID);
                }}
            >
                <Text style={styles.detailButtonText}>Xem chi tiết</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <DefaultLayout>
            <Header
                title="Phiếu xuất kho"
                leftIcon="arrow-back"
                handleOnPressLeftIcon={() => navigation.goBack()}
                RightComponent={
                    <TouchableOpacity onPress={() => setShowFilter(true)}>
                        <Filter size={24} color="white" />
                    </TouchableOpacity>
                }
            />
            <View style={styles.container}>
                {loading ? (
                    <View style={styles.center}>
                        <ActivityIndicator size="large" color="#2563eb" />
                    </View>
                ) : (
                    <FlatList
                        data={listOrderRelease}
                        renderItem={renderItem}
                        keyExtractor={(item) => item.orderReleaseID || Math.random().toString()}
                        contentContainerStyle={styles.listContent}
                        ListEmptyComponent={<Text style={styles.emptyText}>Không có phiếu xuất kho nào</Text>}
                    />
                )}

                {/* Floating Action Button */}
                <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('CreateOrderRelease')}>
                    <Plus size={24} color="white" />
                </TouchableOpacity>

                {/* Pagination */}
                <View style={styles.footer}>
                    <TouchableOpacity
                        disabled={page <= 1}
                        onPress={() => setPage((p) => p - 1)}
                        style={[styles.pageBtn, page <= 1 && styles.disabledBtn]}
                    >
                        <ChevronLeft size={20} color={page <= 1 ? '#9ca3af' : '#374151'} />
                    </TouchableOpacity>
                    <Text style={styles.pageText}>
                        Trang {page} / {totalPages || 1}
                    </Text>
                    <TouchableOpacity
                        disabled={page >= totalPages}
                        onPress={() => setPage((p) => p + 1)}
                        style={[styles.pageBtn, page >= totalPages && styles.disabledBtn]}
                    >
                        <ChevronRight size={20} color={page >= totalPages ? '#9ca3af' : '#374151'} />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Filter Modal */}
            <Modal visible={showFilter} animationType="slide" transparent={true}>
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Bộ lọc</Text>
                            <TouchableOpacity onPress={() => setShowFilter(false)}>
                                <X size={24} color="#333" />
                            </TouchableOpacity>
                        </View>
                        <ScrollView showsVerticalScrollIndicator={false}>
                            <View style={styles.filterSection}>
                                <Text style={styles.filterLabel}>Mã phiếu</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Nhập mã phiếu"
                                    value={filter.orderReleaseID}
                                    onChangeText={(text) => setFilter({ ...filter, orderReleaseID: text })}
                                />
                            </View>

                            <View style={styles.filterSection}>
                                <Text style={styles.filterLabel}>Ngày tạo</Text>
                                <TouchableOpacity style={styles.dateButton} onPress={() => setShowDatePicker(true)}>
                                    <Calendar size={20} color="#666" />
                                    <Text style={styles.dateText}>
                                        {filter.createdAt ? format(filter.createdAt, 'dd/MM/yyyy') : 'mm/dd/yyyy'}
                                    </Text>
                                </TouchableOpacity>
                                {Platform.OS === 'android' && showDatePicker && (
                                    <DateTimePicker
                                        value={filter.createdAt || new Date()}
                                        mode="date"
                                        display="default"
                                        onChange={(event, selectedDate) => {
                                            setShowDatePicker(false);
                                            if (selectedDate) {
                                                setFilter({
                                                    ...filter,
                                                    createdAt: selectedDate,
                                                });
                                            }
                                        }}
                                    />
                                )}
                                {Platform.OS === 'ios' && showDatePicker && (
                                    <Modal transparent={true} animationType="fade">
                                        <View style={styles.iosModalContainer}>
                                            <View style={styles.iosModalContent}>
                                                <DateTimePicker
                                                    value={filter.createdAt || new Date()}
                                                    mode="date"
                                                    display="inline"
                                                    onChange={(event, selectedDate) => {
                                                        if (selectedDate) {
                                                            setFilter({
                                                                ...filter,
                                                                createdAt: selectedDate,
                                                            });
                                                        }
                                                    }}
                                                    style={{ height: 300, width: '100%' }}
                                                />
                                                <TouchableOpacity
                                                    style={styles.iosConfirmButton}
                                                    onPress={() => setShowDatePicker(false)}
                                                >
                                                    <Text style={styles.iosConfirmText}>Xong</Text>
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                    </Modal>
                                )}
                            </View>

                            <View style={styles.filterSection}>
                                <Text style={styles.filterLabel}>Tên người tạo</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Nhập tên người tạo"
                                    value={filter.employeeName}
                                    onChangeText={(text) => setFilter({ ...filter, employeeName: text })}
                                />
                            </View>

                            <View style={styles.filterSection}>
                                <Text style={styles.filterLabel}>Tên người nhận</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Nhập tên người nhận"
                                    value={filter.receiverName}
                                    onChangeText={(text) => setFilter({ ...filter, receiverName: text })}
                                />
                            </View>
                        </ScrollView>
                        <View style={styles.modalFooter}>
                            <TouchableOpacity style={styles.resetButton} onPress={handleResetAndFetch}>
                                <Text style={styles.resetButtonText}>Đặt lại</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.applyButton} onPress={handleApplyFilter}>
                                <Text style={styles.applyButtonText}>Tìm kiếm</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {isOpen && (
                <OrderReleaseDetail
                    isOpen={isOpen}
                    onClose={() => {
                        setIsOpen(false);
                        setOrderSelected(null);
                    }}
                    orderReleaseItem={orderSelected}
                />
            )}
        </DefaultLayout>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f3f4f6',
    },
    listContent: {
        padding: 16,
        paddingBottom: 80,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 20,
        color: '#6b7280',
    },

    // Card
    card: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    cardId: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1f2937',
    },
    statusTag: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        backgroundColor: '#059669', // Default gray
    },
    statusText: {
        color: 'white',
        fontSize: 12,
        fontWeight: '600',
    },
    cardBody: {
        marginBottom: 12,
    },
    infoText: {
        fontSize: 14,
        color: '#4b5563',
        marginBottom: 4,
    },
    detailButton: {
        alignItems: 'center',
        padding: 10,
        borderRadius: 8,
        backgroundColor: '#eff6ff',
    },
    detailButtonText: {
        color: '#2563eb',
        fontWeight: '600',
    },

    // FAB
    fab: {
        position: 'absolute',
        bottom: 80,
        right: 20,
        backgroundColor: '#2563eb',
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },

    // Pagination
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#fff',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 12,
        borderTopWidth: 1,
        borderTopColor: '#e5e7eb',
        gap: 20,
        paddingBottom: 20,
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
        fontWeight: '500',
        color: '#374151',
    },

    // Filter Modal
    modalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: 'white',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
        height: '80%',
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
    },
    filterSection: {
        marginBottom: 20,
    },
    filterLabel: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 10,
        color: '#333',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        padding: 12,
        borderRadius: 8,
        fontSize: 16,
        backgroundColor: '#f9f9f9',
    },
    dateButton: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ddd',
        padding: 12,
        borderRadius: 8,
        backgroundColor: '#f9f9f9',
    },
    dateText: {
        marginLeft: 8,
        color: '#333',
    },
    modalFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 'auto',
        paddingTop: 20,
    },
    resetButton: {
        padding: 15,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#ddd',
        flex: 1,
        marginRight: 10,
        alignItems: 'center',
    },
    resetButtonText: {
        color: '#666',
        fontWeight: '600',
    },
    applyButton: {
        backgroundColor: '#1f2937',
        padding: 15,
        borderRadius: 10,
        flex: 1,
        marginLeft: 10,
        alignItems: 'center',
    },
    applyButtonText: {
        color: 'white',
        fontWeight: '600',
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
