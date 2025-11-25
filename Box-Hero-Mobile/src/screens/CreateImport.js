import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TextInput,
    TouchableOpacity,
    Alert,
    Platform,
    KeyboardAvoidingView,
    FlatList,
    Modal,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { DefaultLayout } from '../layouts';
import Header from '../layouts/Header';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { Filter, Plus, X, ChevronRight, ChevronLeft, Calendar } from 'lucide-react-native';
import { format } from 'date-fns';
import ModalSelectProposal from '../components/ModalSelectProposal';
import { fetchOrderPurchase, filterOrderPurchase } from '../service/order.service';
import { formatDate } from '../utilities/formatDate';

const formatStatusOrderPurchase = {
    PENDING: 'Chờ duyệt',
    COMPLETED: 'Đã hoàn thành',
    INCOMPLETE: 'Chưa hoàn thành',
    REFUSE: 'Đã từ chối',
};

const statusColors = {
    PENDING: '#f59e0b',
    COMPLETED: '#10b981',
    INCOMPLETE: '#ef4444',
    REFUSE: '#6b7280',
};

export default function CreateImport() {
    const navigation = useNavigation();
    const currentUser = useSelector((state) => state.AuthSlice.user);
    const warehouse = useSelector((state) => state.warehouseReducer.warehouse);
    // List State
    const [listOrderPurchase, setListOrderPurchase] = useState([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [showFilter, setShowFilter] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedOrderDetail, setSelectedOrderDetail] = useState(null);
    const [showSelectProposalModal, setShowSelectProposalModal] = useState(false);

    // Filter State
    const [filterOrder, setFilterOrder] = useState({
        code: '',
        createdAt: null,
        employeeName: '',
        type: 'ALL',
    });
    const [appliedFilter, setAppliedFilter] = useState({
        code: '',
        createdAt: null,
        employeeName: '',
        type: 'ALL',
    });
    const [showDatePickerFilter, setShowDatePickerFilter] = useState(false);

    useFocusEffect(
        React.useCallback(() => {
            fetchData(page);
        }, [page, appliedFilter]),
    );

    const fetchData = async (currentPage = 1) => {
        try {
            if (
                appliedFilter.code ||
                appliedFilter.createdAt ||
                appliedFilter.employeeName ||
                appliedFilter.type !== 'ALL'
            ) {
                const res = await filterOrderPurchase({
                    page: currentPage,
                    code: appliedFilter.code,
                    createdAt: appliedFilter.createdAt ? format(appliedFilter.createdAt, 'yyyy-MM-dd') : '',
                    employeeName: appliedFilter.employeeName,
                    type: appliedFilter.type === 'ALL' ? '' : appliedFilter.type,
                });

                if (res?.data?.status === 'OK') {
                    setListOrderPurchase(res.data.data || []);
                    setTotalPages(res.data.pagination?.totalPages || 0);
                }
            } else {
                const res = await fetchOrderPurchase(currentPage);
                if (res?.data?.status === 'OK') {
                    setListOrderPurchase(res.data.data || []);
                    setTotalPages(res.data.pagination?.totalPages || 0);
                }
            }
        } catch (error) {
            console.log('Error fetching order purchase:', error);
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
            type: 'ALL',
        };
        setFilterOrder(resetState);
        setAppliedFilter(resetState);
        setPage(1);
        setShowFilter(false);
    };

    const handleOpenCreate = () => {
        setShowSelectProposalModal(true);
    };

    const handleSelectProposal = (proposal) => {
        navigation.navigate('CreateImportDetail', { proposal });
    };

    const handleViewDetail = (item) => {
        setSelectedOrderDetail(item);
        setShowDetailModal(true);
    };

    const renderItem = ({ item }) => (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <Text style={styles.cardId}>{item.orderPurchaseID}</Text>
                <View style={[styles.statusTag, { backgroundColor: statusColors[item.status] || '#9ca3af' }]}>
                    <Text style={styles.statusText}>{formatStatusOrderPurchase[item.status]}</Text>
                </View>
            </View>
            <View style={styles.cardBody}>
                <Text style={styles.infoText}>Ngày tạo: {formatDate(item.createdAt)}</Text>
                <Text style={styles.infoText}>Người tạo: {item.employee?.employeeName}</Text>
                <Text style={styles.infoText}>Loại phiếu: {item.type === 'NORMAL' ? 'Nhập mới' : 'Bổ sung'}</Text>
            </View>
            <TouchableOpacity style={styles.detailButton} onPress={() => handleViewDetail(item)}>
                <Text style={styles.detailButtonText}>Xem chi tiết</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <DefaultLayout>
            <Header
                title="Quản lý nhập kho"
                leftIcon="arrow-back"
                handleOnPressLeftIcon={() => navigation.goBack()}
                RightComponent={
                    <TouchableOpacity onPress={() => setShowFilter(true)}>
                        <Filter size={24} color="white" />
                    </TouchableOpacity>
                }
            />

            <View style={styles.container}>
                <FlatList
                    data={listOrderPurchase}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.orderPurchaseID}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={<Text style={styles.emptyText}>Không có phiếu nhập nào</Text>}
                />

                <TouchableOpacity style={styles.fab} onPress={handleOpenCreate}>
                    <Plus size={24} color="white" />
                </TouchableOpacity>

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
                        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 16 }}>
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
                                <Text style={styles.filterLabel}>Người tạo</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Nhập tên nhân viên"
                                    value={filterOrder.employeeName}
                                    onChangeText={(text) => setFilterOrder({ ...filterOrder, employeeName: text })}
                                />
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

            <ModalSelectProposal
                visible={showSelectProposalModal}
                onClose={() => setShowSelectProposalModal(false)}
                onSelect={handleSelectProposal}
            />

            {/* Detail Modal */}
            <Modal
                visible={showDetailModal}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setShowDetailModal(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Chi tiết phiếu nhập</Text>
                            <TouchableOpacity onPress={() => setShowDetailModal(false)} style={styles.closeButton}>
                                <X size={24} color="#374151" />
                            </TouchableOpacity>
                        </View>

                        {selectedOrderDetail && (
                            <ScrollView
                                showsVerticalScrollIndicator={false}
                                contentContainerStyle={{ padding: 16, paddingBottom: 20 }}
                            >
                                <View style={styles.detailSection}>
                                    <Text style={styles.sectionTitle}>Thông tin chung</Text>
                                    <View style={styles.row}>
                                        <View style={{ flex: 1, marginRight: 12 }}>
                                            <Text style={styles.label}>Mã phiếu</Text>
                                            <TextInput
                                                style={[styles.input, styles.readOnly]}
                                                value={selectedOrderDetail.orderPurchaseID}
                                                editable={false}
                                            />
                                        </View>
                                        <View style={{ flex: 1 }}>
                                            <Text style={styles.label}>Ngày lập</Text>
                                            <TextInput
                                                style={[styles.input, styles.readOnly]}
                                                value={formatDate(selectedOrderDetail.createdAt)}
                                                editable={false}
                                            />
                                        </View>
                                    </View>
                                    <View style={styles.row}>
                                        <View style={{ flex: 1, marginRight: 12 }}>
                                            <Text style={styles.label}>Kho nhập</Text>
                                            <TextInput
                                                style={[styles.input, styles.readOnly]}
                                                value={selectedOrderDetail.warehouse?.warehouseName}
                                                editable={false}
                                            />
                                        </View>
                                        <View style={{ flex: 1 }}>
                                            <Text style={styles.label}>Người lập</Text>
                                            <TextInput
                                                style={[styles.input, styles.readOnly]}
                                                value={selectedOrderDetail.employee?.employeeName}
                                                editable={false}
                                            />
                                        </View>
                                    </View>
                                    <View style={styles.row}>
                                        <View style={{ flex: 1, marginRight: 12 }}>
                                            <Text style={styles.label}>Loại phiếu</Text>
                                            <TextInput
                                                style={[styles.input, styles.readOnly]}
                                                value={selectedOrderDetail.type === 'NORMAL' ? 'Nhập mới' : 'Bổ sung'}
                                                editable={false}
                                            />
                                        </View>
                                        <View style={{ flex: 1 }}>
                                            <Text style={styles.label}>Trạng thái</Text>
                                            <View
                                                style={[
                                                    styles.statusBadge,
                                                    {
                                                        backgroundColor:
                                                            statusColors[selectedOrderDetail.status] + '20',
                                                    },
                                                ]}
                                            >
                                                <Text
                                                    style={[
                                                        styles.statusText,
                                                        {
                                                            color: statusColors[selectedOrderDetail.status],
                                                            fontSize: 14,
                                                        },
                                                    ]}
                                                >
                                                    {formatStatusOrderPurchase[selectedOrderDetail.status]}
                                                </Text>
                                            </View>
                                        </View>
                                    </View>
                                    <Text style={styles.label}>Ghi chú</Text>
                                    <TextInput
                                        style={[
                                            styles.input,
                                            { height: 60, textAlignVertical: 'top' },
                                            styles.readOnly,
                                        ]}
                                        multiline
                                        value={selectedOrderDetail.note}
                                        editable={false}
                                    />
                                </View>

                                <View style={styles.detailSection}>
                                    <Text style={styles.sectionTitle}>
                                        Danh sách sản phẩm ({selectedOrderDetail.orderPurchaseDetail?.length})
                                    </Text>
                                    {selectedOrderDetail.orderPurchaseDetail?.map((item, index) => (
                                        <View key={index} style={styles.whiteCard}>
                                            <View style={styles.productHeader}>
                                                <Text style={styles.productName}>
                                                    {item.batch?.product?.productName}
                                                </Text>
                                                <Text style={styles.productSku}>#{item.batch?.productID}</Text>
                                            </View>
                                            <Text style={styles.unitText}>Đơn vị: {item.batch?.unit?.unitName}</Text>

                                            <View style={styles.gridRow}>
                                                <View style={styles.gridCol}>
                                                    <Text style={styles.labelSmall}>Yêu cầu</Text>
                                                    <Text style={styles.valueText}>{item.requestedQuantity}</Text>
                                                </View>
                                                <View style={styles.gridCol}>
                                                    <Text style={styles.labelSmall}>Thực tế</Text>
                                                    <Text style={styles.valueText}>{item.actualQuantity}</Text>
                                                </View>
                                                <View style={styles.gridCol}>
                                                    <Text style={styles.labelSmall}>Thiếu</Text>
                                                    <Text
                                                        style={[
                                                            styles.valueText,
                                                            item.defectiveQuantity > 0 && {
                                                                color: '#EF4444',
                                                                fontWeight: 'bold',
                                                            },
                                                        ]}
                                                    >
                                                        {item.defectiveQuantity || 0}
                                                    </Text>
                                                </View>
                                            </View>

                                            <View style={styles.divider} />

                                            <View style={styles.row}>
                                                <View style={styles.col}>
                                                    <Text style={styles.labelSmall}>Mã lô</Text>
                                                    <Text style={styles.valueText}>{item.batch?.batchID}</Text>
                                                </View>
                                                <View style={styles.col}>
                                                    <Text style={styles.labelSmall}>Mã NCC</Text>
                                                    <Text style={styles.valueText}>{item.batch?.supplierID}</Text>
                                                </View>
                                            </View>

                                            <View style={styles.row}>
                                                <View style={styles.col}>
                                                    <Text style={styles.labelSmall}>NSX</Text>
                                                    <Text style={styles.valueText}>
                                                        {formatDate(item.batch?.manufactureDate)}
                                                    </Text>
                                                </View>
                                                <View style={styles.col}>
                                                    <Text style={styles.labelSmall}>HSD</Text>
                                                    <Text style={styles.valueText}>
                                                        {formatDate(item.batch?.expiryDate)}
                                                    </Text>
                                                </View>
                                            </View>
                                        </View>
                                    ))}
                                </View>
                            </ScrollView>
                        )}
                    </View>
                </View>
            </Modal>
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
    emptyText: {
        textAlign: 'center',
        marginTop: 20,
        color: '#6b7280',
    },
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
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
    },
    modalHeader: {
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
        padding: 16,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
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
    // Create Modal Styles
    createHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    createTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#111827',
    },
    closeButton: {
        padding: 4,
        borderRadius: 20,
        backgroundColor: '#F3F4F6',
    },
    createContainer: {
        flex: 1,
        padding: 16,
    },
    section: {
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 12,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
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
    label: {
        fontSize: 13,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 6,
    },
    labelSmall: {
        fontSize: 11,
        fontWeight: '500',
        color: '#6B7280',
        marginBottom: 4,
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
    inputSmall: {
        borderWidth: 1,
        borderColor: '#E5E7EB',
        padding: 8,
        borderRadius: 6,
        fontSize: 14,
        backgroundColor: '#fff',
        color: '#1F2937',
        textAlign: 'center',
    },
    readOnly: {
        backgroundColor: '#F9FAFB',
        color: '#6B7280',
    },
    dropdown: {
        height: 50,
        borderColor: '#E5E7EB',
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 12,
        backgroundColor: '#fff',
    },
    placeholderStyle: {
        fontSize: 14,
        color: '#9CA3AF',
    },
    selectedTextStyle: {
        fontSize: 14,
        color: '#1F2937',
    },
    inputSearchStyle: {
        height: 40,
        fontSize: 14,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    gridRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 10,
        marginBottom: 12,
    },
    gridCol: {
        flex: 1,
    },
    col: {
        flex: 1,
        marginRight: 8,
    },
    codeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    btnGenerate: {
        backgroundColor: '#2563EB',
        padding: 12,
        borderTopRightRadius: 8,
        borderBottomRightRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    productCard: {
        backgroundColor: '#F9FAFB',
        padding: 12,
        borderRadius: 10,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#E5E7EB',
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
    divider: {
        height: 1,
        backgroundColor: '#E5E7EB',
        marginVertical: 12,
    },
    dateInput: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        padding: 10,
        borderRadius: 8,
        backgroundColor: '#fff',
    },
    dateInputText: {
        fontSize: 13,
        color: '#374151',
    },
    createFooter: {
        marginTop: 10,
        marginBottom: 30,
    },
    btnSave: {
        backgroundColor: '#10B981',
        paddingVertical: 14,
        borderRadius: 10,
        alignItems: 'center',
        shadowColor: '#10B981',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
    },
    btnText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
    },
    valueText: {
        fontSize: 14,
        color: '#1F2937',
        fontWeight: '500',
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 6,
        alignSelf: 'flex-start',
    },
    detailSection: {
        marginBottom: 24,
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
