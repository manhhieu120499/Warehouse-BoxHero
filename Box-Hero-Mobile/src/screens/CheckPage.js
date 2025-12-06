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
    Alert,
} from 'react-native';
import { DefaultLayout } from '../layouts';
import Header from '../layouts/Header';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Filter, Scan, Calendar, X, ChevronRight, ChevronLeft } from 'lucide-react-native';
import { Ionicons } from '@expo/vector-icons';
import { getAllInventoryCheck, getFilterInventoryCheck } from '../service/inventoryCheck.service';
import parseToken from '../utilities/parseToken';
import { format } from 'date-fns';
import DateTimePicker from '@react-native-community/datetimepicker';
import CreateCheckDetail from '../components/CreateCheckDetail';
import ShowLocationDetail from '../components/ShowLocationDetail';
import QRScanner from '../components/QRScanner';

const formatStatusInventoryCheck = {
    PENDING_CHECK: 'Đang chờ kiểm kê',
    PENDING: 'Chờ phê duyệt',
    COMPLETED: 'Đã phê duyệt',
    REFUSE: 'Từ chối',
};

const formatStatusOrderPurchaseMissingInventoryCheck = {
    BALANCED: 'Đủ sản phẩm',
    DISCREPANCY: 'Chênh lệch',
};

const statusColors = {
    PENDING_CHECK: '#3b82f6', // Blue
    PENDING: '#f59e0b', // Orange
    COMPLETED: '#10b981', // Green
    REFUSE: '#ef4444', // Red
};

export default function CheckPage() {
    const navigation = useNavigation();
    const [listInventoryCheck, setListInventoryCheck] = useState([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [showFilter, setShowFilter] = useState(false);

    // Modals
    const [showDetailInventoryCheck, setShowDetailInventoryCheck] = useState(false);
    // const [showCreateInventoryCheck, setShowCreateInventoryCheck] = useState(false);
    const [inventoryCheckDetail, setInventoryCheckDetail] = useState(null);
    const [showScanner, setShowScanner] = useState(false);

    // Filters
    const [filterInventoryCheck, setFilterInventoryCheck] = useState({
        inventoryCheckID: '',
        status: 'PENDING_CHECK',
        checkStatus: 'ALL',
        createdAt: null,
        employeeName: '',
    });
    const [showDatePicker, setShowDatePicker] = useState(false);

    const fetchData = async (currentPage = 1, overrideFilters = null) => {
        try {
            const warehouse = await parseToken('warehouse');
            if (!warehouse) return;

            const currentFilters = overrideFilters || filterInventoryCheck;

            // If filtering
            if (
                currentFilters.status !== 'ALL' ||
                currentFilters.checkStatus !== 'ALL' ||
                currentFilters.inventoryCheckID ||
                currentFilters.employeeName ||
                currentFilters.createdAt
            ) {
                console.log(
                    'warehouseID: ',
                    warehouse.warehouseID,
                    'currentPage: ',
                    currentPage,
                    'status: ',
                    currentFilters.status,
                    'checkStatus: ',
                    currentFilters.checkStatus === 'ALL' ? '' : currentFilters.checkStatus,
                    'inventoryCheckID: ',
                    currentFilters.inventoryCheckID,
                    'createdAt: ',
                    currentFilters.createdAt ? format(currentFilters.createdAt, 'yyyy-MM-dd') : '',
                    'employeeName: ',
                    currentFilters.employeeName,
                );

                const res = await getFilterInventoryCheck({
                    warehouseID: warehouse.warehouseID,
                    currentPage: currentPage,
                    status: currentFilters.status,
                    checkStatus: currentFilters.checkStatus === 'ALL' ? '' : currentFilters.checkStatus,
                    inventoryCheckID: currentFilters.inventoryCheckID,
                    createdAt: currentFilters.createdAt ? format(currentFilters.createdAt, 'yyyy-MM-dd') : '',
                    employeeName: currentFilters.employeeName,
                });
                if (res?.data?.status === 'OK') {
                    setListInventoryCheck(res.data.data);
                    setTotalPages(res.data.pagination.totalPages);
                }
            } else {
                // Default fetch all
                const res = await getAllInventoryCheck(warehouse.warehouseID, currentPage);
                if (res?.data?.status === 'OK') {
                    setListInventoryCheck(res.data.data);
                    setTotalPages(res.data.pagination.totalPages);
                }
            }
        } catch (error) {
            console.log('Error fetching inventory checks:', error);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchData(page);
        }, [page, filterInventoryCheck.status]),
    );

    const handleApplyFilter = () => {
        setPage(1);
        fetchData(1);
        setShowFilter(false);
    };

    const handleResetFilter = () => {
        const defaultFilters = {
            inventoryCheckID: '',
            status: 'PENDING_CHECK',
            checkStatus: 'ALL',
            createdAt: null,
            employeeName: '',
        };

        const isStatusChanged = filterInventoryCheck.status !== defaultFilters.status;

        setFilterInventoryCheck(defaultFilters);
        setPage(1);

        // If status changed, useFocusEffect will trigger fetchData with the new state.
        // If status did NOT change, we must manually fetch with the default filters.
        if (!isStatusChanged) {
            fetchData(1, defaultFilters);
        }

        setShowFilter(false);
    };

    const renderItem = ({ item }) => (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <Text style={styles.cardId}>{item.inventoryCheckID}</Text>
                <View style={[styles.statusTag, { backgroundColor: statusColors[item.status] || '#9ca3af' }]}>
                    <Text style={styles.statusText}>{formatStatusInventoryCheck[item.status]}</Text>
                </View>
            </View>
            <View style={styles.cardBody}>
                <View style={styles.infoRow}>
                    <Ionicons name="calendar-outline" size={16} color="#6b7280" />
                    <Text style={styles.infoText}>Ngày tạo: {format(new Date(item.createdAt), 'dd/MM/yyyy')}</Text>
                </View>
                <View style={styles.infoRow}>
                    <Ionicons name="person-outline" size={16} color="#6b7280" />
                    <Text style={styles.infoText}>Người tạo: {item.employee?.employeeName}</Text>
                </View>
                <View style={styles.infoRow}>
                    <Ionicons name="clipboard-outline" size={16} color="#6b7280" />
                    <Text style={styles.infoText}>
                        Kết quả:{' '}
                        <Text
                            style={{
                                fontWeight: 'bold',
                                color:
                                    item.status === 'PENDING_CHECK'
                                        ? '#3b82f6'
                                        : item.checkStatus === 'BALANCED'
                                          ? '#10b981'
                                          : '#ef4444',
                            }}
                        >
                            {item.status === 'PENDING_CHECK'
                                ? 'Chưa có kết quả'
                                : formatStatusOrderPurchaseMissingInventoryCheck[item.checkStatus]}
                        </Text>
                    </Text>
                </View>
            </View>
            <TouchableOpacity
                style={styles.detailButton}
                onPress={() => {
                    setInventoryCheckDetail(item);
                    setShowDetailInventoryCheck(true);
                }}
            >
                <Text style={styles.detailButtonText}>Xem chi tiết</Text>
            </TouchableOpacity>
        </View>
    );

    const handleScan = () => {
        setShowScanner(true);
    };

    return (
        <DefaultLayout>
            <Header
                title="Kiểm kê kho"
                leftIcon="arrow-back"
                handleOnPressLeftIcon={() => navigation.goBack()}
                RightComponent={
                    <TouchableOpacity onPress={() => setShowFilter(true)}>
                        <Filter size={24} color="white" />
                    </TouchableOpacity>
                }
            />
            <View style={styles.container}>
                <View style={styles.tabContainer}>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.tabContent}
                    >
                        {['PENDING_CHECK', 'PENDING', 'COMPLETED', 'REFUSE'].map((status) => (
                            <TouchableOpacity
                                key={status}
                                style={[styles.tabItem, filterInventoryCheck.status === status && styles.tabItemActive]}
                                onPress={() => {
                                    setFilterInventoryCheck({ ...filterInventoryCheck, status });
                                    setPage(1);
                                }}
                            >
                                <Text
                                    style={[
                                        styles.tabText,
                                        filterInventoryCheck.status === status && styles.tabTextActive,
                                    ]}
                                >
                                    {formatStatusInventoryCheck[status]}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
                <FlatList
                    data={listInventoryCheck}
                    renderItem={renderItem}
                    keyExtractor={(item) => item._id || item.inventoryCheckID}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={<Text style={styles.emptyText}>Không có phiếu kiểm kê nào</Text>}
                />

                {/* Floating Action Button */}
                <TouchableOpacity style={styles.fab} onPress={handleScan}>
                    <Scan size={24} color="white" />
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
                                    value={filterInventoryCheck.inventoryCheckID}
                                    onChangeText={(text) =>
                                        setFilterInventoryCheck({ ...filterInventoryCheck, inventoryCheckID: text })
                                    }
                                />
                            </View>

                            <View style={styles.filterSection}>
                                <Text style={styles.filterLabel}>Ngày tạo</Text>
                                <TouchableOpacity style={styles.dateButton} onPress={() => setShowDatePicker(true)}>
                                    <Calendar size={20} color="#666" />
                                    <Text style={styles.dateText}>
                                        {filterInventoryCheck.createdAt
                                            ? format(filterInventoryCheck.createdAt, 'dd/MM/yyyy')
                                            : 'Chọn ngày'}
                                    </Text>
                                </TouchableOpacity>
                                {showDatePicker && (
                                    <DateTimePicker
                                        value={filterInventoryCheck.createdAt || new Date()}
                                        mode="date"
                                        display="default"
                                        onChange={(event, selectedDate) => {
                                            setShowDatePicker(false);
                                            if (selectedDate) {
                                                setFilterInventoryCheck({
                                                    ...filterInventoryCheck,
                                                    createdAt: selectedDate,
                                                });
                                            }
                                        }}
                                    />
                                )}
                            </View>

                            <View style={styles.filterSection}>
                                <Text style={styles.filterLabel}>Người tạo</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Nhập tên nhân viên"
                                    value={filterInventoryCheck.employeeName}
                                    onChangeText={(text) =>
                                        setFilterInventoryCheck({ ...filterInventoryCheck, employeeName: text })
                                    }
                                />
                            </View>

                            <View style={styles.filterSection}>
                                <Text style={styles.filterLabel}>Kết quả kiểm kê</Text>
                                <View style={styles.chipContainer}>
                                    {['ALL', 'BALANCED', 'DISCREPANCY'].map((status) => (
                                        <TouchableOpacity
                                            key={status}
                                            style={[
                                                styles.chip,
                                                filterInventoryCheck.checkStatus === status && styles.chipActive,
                                            ]}
                                            onPress={() =>
                                                setFilterInventoryCheck({
                                                    ...filterInventoryCheck,
                                                    checkStatus: status,
                                                })
                                            }
                                        >
                                            <Text
                                                style={[
                                                    styles.chipText,
                                                    filterInventoryCheck.checkStatus === status &&
                                                        styles.chipTextActive,
                                                ]}
                                            >
                                                {status === 'ALL'
                                                    ? 'Tất cả'
                                                    : formatStatusOrderPurchaseMissingInventoryCheck[status]}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>
                        </ScrollView>
                        <View style={styles.modalFooter}>
                            <TouchableOpacity style={styles.resetButton} onPress={handleResetFilter}>
                                <Text style={styles.resetButtonText}>Đặt lại</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.applyButton} onPress={handleApplyFilter}>
                                <Text style={styles.applyButtonText}>Áp dụng</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Create Modal (ShowLocationDetail first) */}
            {/* {showCreateInventoryCheck && (
                <ShowLocationDetail
                    isOpen={showCreateInventoryCheck}
                    onClose={() => setShowCreateInventoryCheck(false)}
                    fetchData={() => fetchData(1)}
                />
            )} */}

            <QRScanner
                visible={showScanner}
                onClose={() => setShowScanner(false)}
                onScanned={async (code) => {
                    setShowScanner(false);
                    try {
                        const warehouse = await parseToken('warehouse');
                        if (!warehouse) return;

                        const res = await getFilterInventoryCheck({
                            warehouseID: warehouse.warehouseID,
                            inventoryCheckID: code,
                        });

                        console.log('res', res);

                        if (res?.data?.status === 'OK' && res.data.data.length > 0) {
                            setInventoryCheckDetail(res.data.data[0]);
                            setShowDetailInventoryCheck(true);
                        } else {
                            Alert.alert('Lỗi', 'Không tìm thấy phiếu kiểm kê');
                        }
                    } catch (error) {
                        console.log('Error scanning:', error);
                        Alert.alert('Lỗi', 'Đã xảy ra lỗi khi tìm kiếm phiếu kiểm kê');
                    }
                }}
            />

            {/* Detail Modal */}
            {showDetailInventoryCheck && (
                <CreateCheckDetail
                    isOpen={showDetailInventoryCheck}
                    onClose={() => setShowDetailInventoryCheck(false)}
                    inventoryCheckDetail={inventoryCheckDetail}
                    type="detail"
                    fetchData={() => fetchData(page)}
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

    // Tabs
    tabContainer: {
        backgroundColor: 'white',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
    },
    tabContent: {
        paddingHorizontal: 16,
        gap: 12,
    },
    tabItem: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#f3f4f6',
        borderWidth: 1,
        borderColor: '#e5e7eb',
    },
    tabItemActive: {
        backgroundColor: '#eff6ff',
        borderColor: '#2563eb',
    },
    tabText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#6b7280',
    },
    tabTextActive: {
        color: '#2563eb',
        fontWeight: '600',
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
        marginLeft: 8,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
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
    chipContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    chip: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#ddd',
        backgroundColor: '#f9f9f9',
    },
    chipActive: {
        backgroundColor: '#2563eb',
        borderColor: '#2563eb',
    },
    chipText: {
        color: '#333',
    },
    chipTextActive: {
        color: 'white',
        fontWeight: '600',
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
        backgroundColor: '#2563eb',
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
});
