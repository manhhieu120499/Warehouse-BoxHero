import React, { useEffect, useState } from 'react';
import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    FlatList,
    ActivityIndicator,
    Modal,
    ScrollView,
    Platform,
    TextInput,
    TouchableWithoutFeedback,
} from 'react-native';
import { DefaultLayout } from '../layouts';
import Header from '../layouts/Header';
import { useNavigation } from '@react-navigation/native';
import { filterBatchMoveLog } from '../service/batchmovelog.service';
import { Calendar, Filter, X, ChevronRight, Eye, Check, ChevronLeft } from 'lucide-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import { convertDateVN } from './common/Common';

export default function HistoryLocation() {
    const navigation = useNavigation();
    const [listHistory, setListHistory] = useState([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [showFilter, setShowFilter] = useState(false);
    const [dataDetail, setDataDetail] = useState(null);

    // Filters
    const [startDateFilter, setStartDateFilter] = useState(null);
    const [endDateFilter, setEndDateFilter] = useState(null);
    const [showStartDatePicker, setShowStartDatePicker] = useState(false);
    const [showEndDatePicker, setShowEndDatePicker] = useState(false);
    const [typeTransactionFilter, setTypeTransactionFilter] = useState('ALL');
    const [employeeCreateFilter, setEmployeeCreateFilter] = useState('');
    const [batchFilter, setBatchFilter] = useState('');

    const transactionTypes = [
        { label: 'Tất cả', value: 'ALL' },
        { label: 'Từ kho tạm', value: 'FROM_TEMP' },
        { label: 'Từ ô chứa', value: 'FROM_BOX' },
    ];

    const fetchData = async (pageVal = 1, filterOverrides = {}) => {
        // setLoading(true);
        try {
            const dateFrom = filterOverrides.hasOwnProperty('startDateFilter')
                ? filterOverrides.startDateFilter
                : startDateFilter
                  ? format(startDateFilter, 'yyyy-MM-dd')
                  : '';

            const dateTo = filterOverrides.hasOwnProperty('endDateFilter')
                ? filterOverrides.endDateFilter
                : endDateFilter
                  ? format(endDateFilter, 'yyyy-MM-dd')
                  : '';

            const actionType = filterOverrides.hasOwnProperty('typeTransactionFilter')
                ? filterOverrides.typeTransactionFilter
                : typeTransactionFilter;

            const employee = filterOverrides.hasOwnProperty('employeeCreateFilter')
                ? filterOverrides.employeeCreateFilter
                : employeeCreateFilter;

            const batch = filterOverrides.hasOwnProperty('batchFilter') ? filterOverrides.batchFilter : batchFilter;

            console.log('dateFrom', dateFrom);
            console.log('dateTo', dateTo);

            const filters = {
                dateFrom: dateFrom,
                dateTo: dateTo,
                actionType: actionType === 'ALL' ? '' : actionType,
                employeeCreate: employee,
                batchID: batch,
                page: pageVal,
                limit: 10,
            };

            const res = await filterBatchMoveLog(filters);
            if (res.data?.status === 'OK') {
                setListHistory(res.data.data);
                setTotalPages(res.data.pagination.totalPages);
            }
        } catch (error) {
            console.log('Error fetching history:', error);
        } finally {
            // setLoading(false);
        }
    };

    useEffect(() => {
        fetchData(page);
    }, [page]);

    const handleApplyFilter = () => {
        setPage(1);
        fetchData(1);
        setShowFilter(false);
    };

    const handleResetFilter = () => {
        setStartDateFilter(null);
        setEndDateFilter(null);
        setTypeTransactionFilter('ALL');
        setEmployeeCreateFilter('');
        setBatchFilter('');
        setPage(1);
        fetchData(1, {
            startDateFilter: '',
            endDateFilter: '',
            typeTransactionFilter: 'ALL',
            employeeCreateFilter: '',
            batchFilter: '',
        });
        setShowFilter(false);
    };

    const renderItem = ({ item }) => (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <Text style={styles.batchId}>Lô: {item.batchID}</Text>
                <Text style={styles.date}>{convertDateVN(item.createdAt)}</Text>
            </View>
            <View style={styles.cardBody}>
                <Text style={styles.productName}>{item.batch?.product?.productName}</Text>
                <Text style={styles.infoText}>Mã SP: {item.batch?.product?.productID}</Text>
                <Text style={styles.infoText}>
                    Từ:{' '}
                    {item.actionType === 'FROM_TEMP'
                        ? 'Kho tạm'
                        : `${item.fromBox?.boxName} - ${item.fromBox?.floor?.floorName}`}
                </Text>
                <Text style={styles.infoText}>SL chuyển: {item.quantity}</Text>
                <Text style={styles.infoText}>Người tạo: {item.creator?.employeeName}</Text>
            </View>
            <TouchableOpacity style={styles.detailButton} onPress={() => setDataDetail(item.details)}>
                <Text style={styles.detailButtonText}>Xem chi tiết</Text>
                <Eye size={16} color="#2563eb" />
            </TouchableOpacity>
        </View>
    );

    return (
        <DefaultLayout>
            <Header
                title="Nhật ký đổi vị trí"
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
                        data={listHistory}
                        renderItem={renderItem}
                        keyExtractor={(item, index) => item._id || index.toString()}
                        contentContainerStyle={styles.listContent}
                        ListEmptyComponent={<Text style={styles.emptyText}>Không có dữ liệu</Text>}
                    />
                )}

                {/* Pagination Footer */}
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
                                <Text style={styles.filterLabel}>Thời gian</Text>
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
                            </View>

                            <View style={styles.filterSection}>
                                <Text style={styles.filterLabel}>Người tạo giao dịch</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Nhập tên người tạo"
                                    value={employeeCreateFilter}
                                    onChangeText={setEmployeeCreateFilter}
                                />
                            </View>

                            <View style={styles.filterSection}>
                                <Text style={styles.filterLabel}>Mã lô</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Nhập mã lô"
                                    value={batchFilter}
                                    onChangeText={setBatchFilter}
                                />
                            </View>

                            <View style={styles.filterSection}>
                                <Text style={styles.filterLabel}>Nơi chuyển</Text>
                                <View style={styles.typeContainer}>
                                    {transactionTypes.map((type) => (
                                        <TouchableOpacity
                                            key={type.value}
                                            style={[
                                                styles.typeButton,
                                                typeTransactionFilter === type.value && styles.typeButtonActive,
                                            ]}
                                            onPress={() => setTypeTransactionFilter(type.value)}
                                        >
                                            <Text
                                                style={[
                                                    styles.typeButtonText,
                                                    typeTransactionFilter === type.value && styles.typeButtonTextActive,
                                                ]}
                                            >
                                                {type.label}
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

            {/* Detail Modal */}
            <Modal
                visible={!!dataDetail}
                animationType="fade"
                transparent={true}
                onRequestClose={() => setDataDetail(null)}
            >
                <TouchableOpacity
                    style={[styles.modalContainer, { justifyContent: 'center' }]}
                    activeOpacity={1}
                    onPress={() => setDataDetail(null)}
                >
                    <TouchableWithoutFeedback>
                        <View style={styles.detailModalContent}>
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>Chi tiết chuyển vị trí</Text>
                                <TouchableOpacity onPress={() => setDataDetail(null)}>
                                    <X size={24} color="#333" />
                                </TouchableOpacity>
                            </View>
                            <ScrollView style={{ maxHeight: 400 }}>
                                {dataDetail?.map((detail, index) => (
                                    <View key={index} style={styles.detailItem}>
                                        <Text style={styles.detailLocation}>
                                            Đến: {detail.toBox?.boxName} - {detail.toBox?.floor?.floorName}
                                        </Text>
                                        <Text style={styles.detailQuantity}>SL: {detail.quantity}</Text>
                                    </View>
                                ))}
                            </ScrollView>
                        </View>
                    </TouchableWithoutFeedback>
                </TouchableOpacity>
            </Modal>
        </DefaultLayout>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    listContent: {
        padding: 16,
        paddingBottom: 80,
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
        marginBottom: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        paddingBottom: 8,
    },
    batchId: {
        fontWeight: 'bold',
        fontSize: 16,
        color: '#333',
    },
    date: {
        color: '#666',
        fontSize: 14,
    },
    cardBody: {
        marginBottom: 8,
    },
    productName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#2563eb',
        marginBottom: 4,
    },
    infoText: {
        fontSize: 14,
        color: '#555',
        marginBottom: 2,
    },
    detailButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        marginTop: 8,
    },
    detailButtonText: {
        color: '#2563eb',
        marginRight: 4,
        fontWeight: '500',
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 20,
        color: '#666',
    },
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
        height: '80%', // Increased height for more filters
    },
    detailModalContent: {
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 20,
        margin: 20,
        justifyContent: 'center', // Center vertically if needed
        alignSelf: 'center', // Center horizontally
        width: '90%',
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
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        padding: 12,
        borderRadius: 8,
        fontSize: 16,
        backgroundColor: '#f9f9f9',
    },
    typeContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    typeButton: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#ddd',
        backgroundColor: '#f9f9f9',
    },
    typeButtonActive: {
        backgroundColor: '#2563eb',
        borderColor: '#2563eb',
    },
    typeButtonText: {
        color: '#333',
    },
    typeButtonTextActive: {
        color: 'white',
        fontWeight: '600',
    },
    modalFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 'auto', // Push to bottom
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
    detailItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    detailLocation: {
        fontSize: 16,
        color: '#333',
        flex: 1,
    },
    detailQuantity: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#2563eb',
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
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
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
});
