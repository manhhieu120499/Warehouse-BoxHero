import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    FlatList,
    Modal,
    TextInput,
    Platform,
    ScrollView,
} from 'react-native';
import { DefaultLayout } from '../layouts';
import Header from '../layouts/Header';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Filter, Plus, X, Calendar, ChevronLeft, ChevronRight } from 'lucide-react-native';
import { format } from 'date-fns';
import DateTimePicker from '@react-native-community/datetimepicker';
import ModalSelectMissingOrder from '../components/ModalSelectMissingOrder';
import ModalReceiveProductMissingDetail from '../components/ModalReceiveProductMissingDetail';
import { fetchOrderPurchase, filterOrderMissing } from '../service/order.service';
import { formatDate } from '../utilities/formatDate';
import parseToken from '../utilities/parseToken';

const formatStatusOrderPurchase = {
    PENDING: 'Đang xử lý',
    RESOLVED: 'Đã giải quyết',
    CANCELED: 'Đã hủy',
};

const statusColors = {
    PENDING: '#FBBF24',
    RESOLVED: '#10B981',
    CANCELED: '#3B82F6',
    REFUSE: '#EF4444',
};

export default function MissingImport() {
    const navigation = useNavigation();
    const [listOrderPurchase, setListOrderPurchase] = useState([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [showFilter, setShowFilter] = useState(false);
    const [showSelectMissingOrderModal, setShowSelectMissingOrderModal] = useState(false);

    // Filter State
    const [filterOrder, setFilterOrder] = useState({
        code: '',
        createdAt: null,
        employeeName: '',
        type: 'SUPPLEMENT',
        status: 'PENDING',
    });
    const [appliedFilter, setAppliedFilter] = useState({
        code: '',
        createdAt: null,
        employeeName: '',
        type: 'SUPPLEMENT',
        status: 'PENDING',
    });
    const [showDatePickerFilter, setShowDatePickerFilter] = useState(false);

    useFocusEffect(
        React.useCallback(() => {
            fetchData(page);
        }, [page, appliedFilter]),
    );

    const fetchData = async (currentPage = 1) => {
        try {
            const warehouse = await parseToken('warehouse');
            const filterParam = {};
            if (appliedFilter.code) filterParam.orderPurchaseMissingID = appliedFilter.code;
            if (appliedFilter.createdAt) filterParam.createdAt = format(appliedFilter.createdAt, 'yyyy-MM-dd');
            if (appliedFilter.status) filterParam.status = appliedFilter.status;
            if (appliedFilter.employeeName) filterParam.employeeName = appliedFilter.employeeName;

            console.log(filterParam);

            const res = await filterOrderMissing({
                page: currentPage,
                warehouseID: warehouse.warehouseID,
                ...filterParam,
            });
            console.log(res.data);
            if (res?.data?.status === 'OK') {
                setListOrderPurchase(res.data.data || []);
                setTotalPages(res.data.pagination?.totalPages || 0);
            }
        } catch (error) {
            console.log('Error fetching order missing:', error);
        }
    };

    const handleApplyFilter = () => {
        setPage(1);
        setAppliedFilter(filterOrder);
        setShowFilter(false);
    };

    const handleResetFilter = () => {
        const resetState = {
            code: '',
            createdAt: null,
            employeeName: '',
            type: 'SUPPLEMENT',
            status: 'PENDING',
        };
        setFilterOrder(resetState);
        setAppliedFilter(resetState);
        setPage(1);
        setShowFilter(false);
    };

    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);

    const handleOpenCreate = () => {
        setShowSelectMissingOrderModal(true);
    };

    const handleSelectMissingOrder = (order) => {
        navigation.navigate('CreateMissingImportDetail', { order });
    };

    const handleViewDetail = (item) => {
        setSelectedOrder(item);
        setShowDetailModal(true);
    };

    const renderItem = ({ item }) => (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <Text style={styles.cardId}>{item.orderPurchaseMissingID}</Text>
                <View style={[styles.statusTag, { backgroundColor: statusColors[item.status] || '#9ca3af' }]}>
                    <Text style={styles.statusText}>{formatStatusOrderPurchase[item.status]}</Text>
                </View>
            </View>
            <View style={styles.cardBody}>
                <Text style={styles.infoText}>Ngày tạo: {formatDate(item.createdAt)}</Text>
                <Text style={styles.infoText}>Người tạo: {item.orderPurchase?.employee?.employeeName}</Text>
                <Text style={styles.infoText}>Loại phiếu: Nhập bổ sung</Text>
            </View>
            <TouchableOpacity style={styles.detailButton} onPress={() => handleViewDetail(item)}>
                <Text style={styles.detailButtonText}>Xem chi tiết</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <DefaultLayout>
            <Header
                title="Quản lý nhập thiếu"
                leftIcon="arrow-back"
                handleOnPressLeftIcon={() => navigation.goBack()}
                RightComponent={
                    <TouchableOpacity onPress={() => setShowFilter(true)}>
                        <Filter size={24} color="#fff" />
                    </TouchableOpacity>
                }
            />

            <View style={styles.container}>
                <FlatList
                    data={listOrderPurchase}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.orderPurchaseMissingID}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyText}>Không có dữ liệu</Text>
                        </View>
                    }
                />

                <TouchableOpacity style={styles.fab} onPress={handleOpenCreate}>
                    <Plus size={24} color="#fff" />
                </TouchableOpacity>

                <View style={styles.footer}>
                    <TouchableOpacity
                        disabled={page === 1}
                        onPress={() => setPage(page - 1)}
                        style={[styles.pageBtn, page === 1 && styles.disabledBtn]}
                    >
                        <ChevronLeft size={20} color={page === 1 ? '#9ca3af' : '#374151'} />
                    </TouchableOpacity>
                    <Text style={styles.pageText}>
                        Trang {page} / {totalPages || 1}
                    </Text>
                    <TouchableOpacity
                        disabled={page === totalPages}
                        onPress={() => setPage(page + 1)}
                        style={[styles.pageBtn, page === totalPages && styles.disabledBtn]}
                    >
                        <ChevronRight size={20} color={page === totalPages ? '#9ca3af' : '#374151'} />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Filter Modal */}
            <Modal
                visible={showFilter}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setShowFilter(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Bộ lọc</Text>
                            <TouchableOpacity onPress={() => setShowFilter(false)}>
                                <X size={24} color="#374151" />
                            </TouchableOpacity>
                        </View>
                        <ScrollView style={styles.modalBody}>
                            <View style={styles.filterSection}>
                                <Text style={styles.filterLabel}>Mã phiếu</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Nhập mã phiếu"
                                    value={filterOrder.code}
                                    onChangeText={(text) => setFilterOrder({ ...filterOrder, code: text })}
                                />
                            </View>
                            <View style={styles.filterSection}>
                                <Text style={styles.filterLabel}>Người tạo</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Nhập tên người tạo"
                                    value={filterOrder.employeeName}
                                    onChangeText={(text) => setFilterOrder({ ...filterOrder, employeeName: text })}
                                />
                            </View>
                            <View style={styles.filterSection}>
                                <Text style={styles.filterLabel}>Ngày tạo</Text>
                                <TouchableOpacity
                                    style={styles.dateButton}
                                    onPress={() => setShowDatePickerFilter(true)}
                                >
                                    <Calendar size={20} color="#666" />
                                    <Text style={styles.dateText}>
                                        {filterOrder.createdAt
                                            ? format(filterOrder.createdAt, 'dd/MM/yyyy')
                                            : 'Chọn ngày'}
                                    </Text>
                                </TouchableOpacity>
                                {Platform.OS === 'android' && showDatePickerFilter && (
                                    <DateTimePicker
                                        value={filterOrder.createdAt || new Date()}
                                        mode="date"
                                        display="default"
                                        onChange={(event, selectedDate) => {
                                            setShowDatePickerFilter(false);
                                            if (event.type === 'set' && selectedDate) {
                                                setFilterOrder({ ...filterOrder, createdAt: selectedDate });
                                            }
                                        }}
                                    />
                                )}
                                {Platform.OS === 'ios' && showDatePickerFilter && (
                                    <Modal transparent={true} animationType="fade">
                                        <View style={styles.iosModalContainer}>
                                            <View style={styles.iosModalContent}>
                                                <DateTimePicker
                                                    value={filterOrder.createdAt || new Date()}
                                                    mode="date"
                                                    display="inline"
                                                    onChange={(event, selectedDate) => {
                                                        if (selectedDate) {
                                                            setFilterOrder({ ...filterOrder, createdAt: selectedDate });
                                                        }
                                                    }}
                                                    style={{ height: 300, width: '100%' }}
                                                />
                                                <TouchableOpacity
                                                    style={styles.iosConfirmButton}
                                                    onPress={() => setShowDatePickerFilter(false)}
                                                >
                                                    <Text style={styles.iosConfirmText}>Xong</Text>
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                    </Modal>
                                )}
                            </View>
                            <View style={styles.filterSection}>
                                <Text style={styles.filterLabel}>Trạng thái</Text>
                                <View style={styles.statusFilterContainer}>
                                    {Object.keys(formatStatusOrderPurchase).map((status) => (
                                        <TouchableOpacity
                                            key={status}
                                            style={[
                                                styles.statusFilterItem,
                                                filterOrder.status === status && styles.statusFilterItemSelected,
                                            ]}
                                            onPress={() =>
                                                setFilterOrder({
                                                    ...filterOrder,
                                                    status: filterOrder.status === status ? '' : status,
                                                })
                                            }
                                        >
                                            <Text
                                                style={[
                                                    styles.statusFilterText,
                                                    filterOrder.status === status && styles.statusFilterTextSelected,
                                                ]}
                                            >
                                                {formatStatusOrderPurchase[status]}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>
                        </ScrollView>
                        <View style={styles.modalFooter}>
                            <TouchableOpacity style={styles.btnReset} onPress={handleResetFilter}>
                                <Text style={styles.btnResetText}>Đặt lại</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.btnApply} onPress={handleApplyFilter}>
                                <Text style={styles.btnApplyText}>Áp dụng</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            <ModalSelectMissingOrder
                visible={showSelectMissingOrderModal}
                onClose={() => setShowSelectMissingOrderModal(false)}
                onSelect={handleSelectMissingOrder}
            />

            <ModalReceiveProductMissingDetail
                data={selectedOrder}
                isOpen={showDetailModal}
                onClose={() => setShowDetailModal(false)}
                reset={fetchData}
            />
        </DefaultLayout>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F3F4F6',
    },
    listContent: {
        padding: 16,
        paddingBottom: 80,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    cardId: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1F2937',
    },
    statusTag: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    statusText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '600',
    },
    cardBody: {
        gap: 4,
    },
    infoText: {
        fontSize: 14,
        color: '#4B5563',
    },
    detailButton: {
        alignItems: 'center',
        padding: 10,
        borderRadius: 8,
        backgroundColor: '#eff6ff',
        marginTop: 12,
    },
    detailButtonText: {
        color: '#2563eb',
        fontWeight: '600',
    },
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
    emptyContainer: {
        alignItems: 'center',
        marginTop: 40,
    },
    emptyText: {
        color: '#6B7280',
        fontSize: 16,
    },
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
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 8,
        backgroundColor: '#F3F4F6',
    },
    disabledBtn: {
        opacity: 0.5,
    },
    pageText: {
        marginHorizontal: 16,
        color: '#374151',
        fontWeight: '500',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        height: '80%',
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
        fontWeight: '700',
        color: '#1F2937',
    },
    modalBody: {
        flex: 1,
    },
    filterSection: {
        marginBottom: 20,
    },
    filterLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderColor: '#E5E7EB',
        padding: 12,
        borderRadius: 8,
        fontSize: 14,
        color: '#1F2937',
    },
    dateButton: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        padding: 12,
        borderRadius: 8,
    },
    dateText: {
        marginLeft: 8,
        color: '#374151',
    },
    modalFooter: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 20,
    },
    btnReset: {
        flex: 1,
        padding: 14,
        borderRadius: 10,
        backgroundColor: '#F3F4F6',
        alignItems: 'center',
    },
    btnResetText: {
        color: '#374151',
        fontWeight: '600',
    },
    btnApply: {
        flex: 1,
        padding: 14,
        borderRadius: 10,
        backgroundColor: '#2563EB',
        alignItems: 'center',
    },
    btnApplyText: {
        color: '#fff',
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
    statusFilterContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    statusFilterItem: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#F3F4F6',
        borderWidth: 1,
        borderColor: 'transparent',
    },
    statusFilterItemSelected: {
        backgroundColor: '#EFF6FF',
        borderColor: '#2563EB',
    },
    statusFilterText: {
        fontSize: 13,
        color: '#4B5563',
    },
    statusFilterTextSelected: {
        color: '#2563EB',
        fontWeight: '600',
    },
});
