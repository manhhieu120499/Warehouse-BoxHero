import React, { useEffect, useState } from 'react';
import {
    StyleSheet,
    Text,
    View,
    FlatList,
    TouchableOpacity,
    TextInput,
    Modal,
    ScrollView,
    Platform,
    ActivityIndicator,
} from 'react-native';
import { Filter, X, Calendar, ChevronLeft, ChevronRight } from 'lucide-react-native';
import { DefaultLayout } from '../layouts';
import Header from '../layouts/Header';
import { convertDateVN } from './common/Common';
import { filterProductQuantityLog } from '../service/Productquantitylog.service';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';

const typeTransaction = {
    PURCHASE: 'Nhập hàng',
    RELEASE: 'Xuất hàng',
    INVENTORY_CHECK: 'Kiểm kê',
};

const typeTransactionColors = {
    PURCHASE: '#22c55e', // Green
    RELEASE: '#ef4444', // Red
    INVENTORY_CHECK: '#6366f1', // Indigo
};

export default function HistoryTransaction({ navigation }) {
    const [page, setPage] = useState(1);
    const [listHistory, setListHistory] = useState([]);
    const [totalPage, setTotalPage] = useState(0);
    const [loading, setLoading] = useState(false);
    const [showFilter, setShowFilter] = useState(false);

    // Filter States
    const [startDateFilter, setStartDateFilter] = useState(null);
    const [endDateFilter, setEndDateFilter] = useState(null);
    const [showStartDatePicker, setShowStartDatePicker] = useState(false);
    const [showEndDatePicker, setShowEndDatePicker] = useState(false);
    const [typeTransactionFilter, setTypeTransactionFilter] = useState('ALL');
    const [employeeCreateFilter, setEmployeeCreateFilter] = useState('');
    const [productFilter, setProductFilter] = useState('');

    const fetchData = async () => {
        // setLoading(true);
        try {
            const res = await filterProductQuantityLog({
                dateFrom: startDateFilter ? format(startDateFilter, 'yyyy-MM-dd') : '',
                dateTo: endDateFilter ? format(endDateFilter, 'yyyy-MM-dd') : '',
                actionType: typeTransactionFilter === 'ALL' ? '' : typeTransactionFilter,
                employeeCreate: employeeCreateFilter,
                productID: productFilter,
                page: page,
                limit: 10,
            });

            console.log(res);

            if (res.data?.status === 'OK') {
                setListHistory(res.data?.data || []);
                setTotalPage(res.data?.pagination?.totalPages || 0);
            }
        } catch (error) {
            console.log('Error fetching history:', error);
        } finally {
            // setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [page]);

    const handleApplyFilter = () => {
        setPage(1);
        fetchData();
        setShowFilter(false);
    };

    const handleResetFilter = () => {
        setStartDateFilter(null);
        setEndDateFilter(null);
        setTypeTransactionFilter('ALL');
        setEmployeeCreateFilter('');
        setProductFilter('');
        setPage(1);
        setShowFilter(false);
        setLoading(true);
        filterProductQuantityLog({
            dateFrom: '',
            dateTo: '',
            actionType: '',
            employeeCreate: '',
            productID: '',
            page: 1,
        }).then((res) => {
            if (res.data?.status === 'OK') {
                setListHistory(res.data?.data || []);
                setTotalPage(res.data?.pagination?.totalPages || 0);
            }
            setLoading(false);
        });
    };

    const renderItem = ({ item }) => {
        let employeeName = '';
        if (item.orderPurchase) employeeName = item.orderPurchase.employee?.employeeName;
        else if (item.orderRelease) employeeName = item.orderRelease.employees?.employeeName;
        else if (item.inventoryCheck) employeeName = item.inventoryCheck.employee?.employeeName;

        const realChange = item.newAmount - item.previousAmount;
        const isPositive = realChange > 0;

        return (
            <View style={styles.card}>
                <View style={styles.cardHeader}>
                    <View
                        style={[styles.tag, { backgroundColor: typeTransactionColors[item.actionType] || '#9ca3af' }]}
                    >
                        <Text style={styles.tagText}>{typeTransaction[item.actionType] || item.actionType}</Text>
                    </View>
                    <Text style={styles.dateText}>{convertDateVN(item.createdAt)}</Text>
                </View>

                <View style={styles.cardBody}>
                    <Text style={styles.productName}>{item.product.productName}</Text>
                    <Text style={styles.productCode}>Mã: {item.product.productID}</Text>

                    <View style={styles.rowBetween}>
                        <View>
                            <Text style={styles.label}>Thay đổi:</Text>
                            <Text
                                style={[
                                    styles.value,
                                    { color: isPositive ? '#16a34a' : '#dc2626', fontWeight: 'bold' },
                                ]}
                            >
                                {isPositive ? '+' : ''}
                                {realChange}
                            </Text>
                        </View>
                        <View>
                            <Text style={styles.label}>Tồn kho:</Text>
                            <Text style={styles.value}>
                                {item.previousAmount} {'->'} {item.newAmount}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.rowBetween}>
                        <Text style={styles.subText}>Ref: {item.referenceID}</Text>
                        <Text style={styles.subText}>Bởi: {employeeName}</Text>
                    </View>
                </View>
            </View>
        );
    };

    return (
        <DefaultLayout>
            <Header
                title="Nhật ký nhập xuất"
                leftIcon="arrow-back"
                handleOnPressLeftIcon={() => navigation.goBack()}
                RightComponent={
                    <TouchableOpacity onPress={() => setShowFilter(true)}>
                        <Filter size={20} color="#fff" />
                    </TouchableOpacity>
                }
            />
            <View style={styles.container}>
                {/* Content */}
                {loading ? (
                    <View style={styles.center}>
                        <ActivityIndicator size="large" color="#3b82f6" />
                    </View>
                ) : (
                    <FlatList
                        data={listHistory}
                        renderItem={renderItem}
                        keyExtractor={(item, index) => item._id || index.toString()}
                        contentContainerStyle={styles.listContent}
                        ListEmptyComponent={<Text style={styles.emptyText}>Không có dữ liệu</Text>}
                    />
                )}

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
                        Trang {page} / {totalPage || 1}
                    </Text>
                    <TouchableOpacity
                        disabled={page >= totalPage}
                        onPress={() => setPage((p) => p + 1)}
                        style={[styles.pageBtn, page >= totalPage && styles.disabledBtn]}
                    >
                        <ChevronRight size={20} color={page >= totalPage ? '#9ca3af' : '#374151'} />
                    </TouchableOpacity>
                </View>

                {/* Filter Modal */}
                <Modal visible={showFilter} animationType="slide" transparent={true}>
                    <View style={styles.modalContainer}>
                        <View style={styles.modalContent}>
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>Bộ lọc</Text>
                                <TouchableOpacity onPress={() => setShowFilter(false)}>
                                    <X size={24} color="#374151" />
                                </TouchableOpacity>
                            </View>

                            <ScrollView style={styles.modalBody}>
                                <Text style={styles.inputLabel}>Loại giao dịch</Text>
                                <View style={styles.typeContainer}>
                                    {['ALL', 'PURCHASE', 'RELEASE', 'INVENTORY_CHECK'].map((type) => (
                                        <TouchableOpacity
                                            key={type}
                                            style={[
                                                styles.typeBtn,
                                                typeTransactionFilter === type && styles.typeBtnActive,
                                            ]}
                                            onPress={() => setTypeTransactionFilter(type)}
                                        >
                                            <Text
                                                style={[
                                                    styles.typeBtnText,
                                                    typeTransactionFilter === type && styles.typeBtnTextActive,
                                                ]}
                                            >
                                                {type === 'ALL' ? 'Tất cả' : typeTransaction[type]}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>

                                <Text style={styles.inputLabel}>Mã sản phẩm</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Nhập mã sản phẩm..."
                                    value={productFilter}
                                    onChangeText={setProductFilter}
                                />

                                <Text style={styles.inputLabel}>Người tạo</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Tên nhân viên..."
                                    value={employeeCreateFilter}
                                    onChangeText={setEmployeeCreateFilter}
                                />

                                <Text style={styles.inputLabel}>Thời gian</Text>
                                <View style={styles.dateRow}>
                                    <TouchableOpacity
                                        style={styles.dateButton}
                                        onPress={() => setShowStartDatePicker(true)}
                                    >
                                        <Calendar size={20} color="#666" />
                                        <Text style={styles.dateText}>
                                            {startDateFilter ? format(startDateFilter, 'dd/MM/yyyy') : 'Từ ngày'}
                                        </Text>
                                    </TouchableOpacity>
                                    <Text style={{ marginHorizontal: 10 }}>-</Text>
                                    <TouchableOpacity
                                        style={styles.dateButton}
                                        onPress={() => setShowEndDatePicker(true)}
                                    >
                                        <Calendar size={20} color="#666" />
                                        <Text style={styles.dateText}>
                                            {endDateFilter ? format(endDateFilter, 'dd/MM/yyyy') : 'Đến ngày'}
                                        </Text>
                                    </TouchableOpacity>
                                </View>

                                {/* Date Picker Logic */}
                                {Platform.OS === 'android' && showStartDatePicker && (
                                    <DateTimePicker
                                        value={startDateFilter || new Date()}
                                        mode="date"
                                        display="default"
                                        onChange={(event, selectedDate) => {
                                            setShowStartDatePicker(false);
                                            if (event.type === 'set' && selectedDate) {
                                                setStartDateFilter(selectedDate);
                                            }
                                        }}
                                    />
                                )}
                                {Platform.OS === 'android' && showEndDatePicker && (
                                    <DateTimePicker
                                        value={endDateFilter || new Date()}
                                        mode="date"
                                        display="default"
                                        onChange={(event, selectedDate) => {
                                            setShowEndDatePicker(false);
                                            if (event.type === 'set' && selectedDate) {
                                                setEndDateFilter(selectedDate);
                                            }
                                        }}
                                    />
                                )}

                                {/* iOS Date Picker Modal */}
                                {Platform.OS === 'ios' && (showStartDatePicker || showEndDatePicker) && (
                                    <Modal transparent={true} animationType="fade">
                                        <View style={styles.iosModalContainer}>
                                            <View style={styles.iosModalContent}>
                                                <DateTimePicker
                                                    value={
                                                        showStartDatePicker
                                                            ? startDateFilter || new Date()
                                                            : endDateFilter || new Date()
                                                    }
                                                    mode="date"
                                                    display="inline"
                                                    onChange={(event, selectedDate) => {
                                                        if (selectedDate) {
                                                            if (showStartDatePicker) setStartDateFilter(selectedDate);
                                                            if (showEndDatePicker) setEndDateFilter(selectedDate);
                                                        }
                                                    }}
                                                    style={{ height: 300, width: '100%' }}
                                                />
                                                <TouchableOpacity
                                                    style={styles.iosConfirmButton}
                                                    onPress={() => {
                                                        setShowStartDatePicker(false);
                                                        setShowEndDatePicker(false);
                                                    }}
                                                >
                                                    <Text style={styles.iosConfirmText}>Xong</Text>
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                    </Modal>
                                )}
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
            </View>
        </DefaultLayout>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f3f4f6',
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContent: {
        padding: 12,
        paddingBottom: 80,
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 20,
        color: '#6b7280',
    },

    // Card Styles
    card: {
        backgroundColor: '#fff',
        borderRadius: 12,
        marginBottom: 12,
        padding: 12,
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
        marginBottom: 8,
    },
    tag: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    tagText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '600',
    },
    dateText: {
        fontSize: 12,
        color: '#6b7280',
    },
    cardBody: {
        gap: 4,
    },
    productName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1f2937',
    },
    productCode: {
        fontSize: 13,
        color: '#6b7280',
        marginBottom: 4,
    },
    rowBetween: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    label: {
        fontSize: 12,
        color: '#6b7280',
    },
    value: {
        fontSize: 14,
        color: '#1f2937',
    },
    divider: {
        height: 1,
        backgroundColor: '#f3f4f6',
        marginVertical: 8,
    },
    subText: {
        fontSize: 12,
        color: '#9ca3af',
    },

    // Footer Pagination
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

    // Modal Styles
    modalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        height: '80%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#111827',
    },
    modalBody: {
        padding: 16,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 8,
        marginTop: 12,
    },
    input: {
        borderWidth: 1,
        borderColor: '#d1d5db',
        borderRadius: 8,
        padding: 10,
        fontSize: 14,
        color: '#1f2937',
    },
    typeContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    typeBtn: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#d1d5db',
        backgroundColor: '#fff',
    },
    typeBtnActive: {
        borderColor: '#3b82f6',
        backgroundColor: '#eff6ff',
    },
    typeBtnText: {
        fontSize: 13,
        color: '#4b5563',
    },
    typeBtnTextActive: {
        color: '#3b82f6',
        fontWeight: '600',
    },
    modalFooter: {
        flexDirection: 'row',
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: '#e5e7eb',
        gap: 12,
    },
    btnReset: {
        flex: 1,
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#d1d5db',
        alignItems: 'center',
    },
    btnResetText: {
        color: '#4b5563',
        fontWeight: '600',
    },
    btnApply: {
        flex: 1,
        padding: 12,
        borderRadius: 8,
        backgroundColor: '#3b82f6',
        alignItems: 'center',
    },
    btnApplyText: {
        color: '#fff',
        fontWeight: '600',
    },
    dateRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    dateButton: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ddd',
        padding: 12,
        borderRadius: 8,
        flex: 1,
        backgroundColor: '#f9f9f9',
    },
    dateText: {
        marginLeft: 8,
        color: '#333',
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
