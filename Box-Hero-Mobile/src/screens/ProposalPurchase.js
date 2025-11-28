import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    FlatList,
    TextInput,
    ActivityIndicator,
    Modal,
    ScrollView,
    Platform,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';

import { Filter, Plus, ChevronLeft, ChevronRight, Calendar } from 'lucide-react-native';
import { DefaultLayout } from '../layouts';
import Header from '../layouts/Header';
import { fetchFilterProposal } from '../service/proposal.service';
import { formatStatusProposal } from '../constants';

export default function ProposalPurchase() {
    const navigation = useNavigation();
    const [proposals, setProposals] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [showFilter, setShowFilter] = useState(false);

    // Filter State
    const [filterCode, setFilterCode] = useState('');
    const [filterCreator, setFilterCreator] = useState('');
    const [filterDate, setFilterDate] = useState(null);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [filterStatus, setFilterStatus] = useState('PENDING');

    const statusTabs = [
        { label: 'Chờ phê duyệt', value: 'PENDING' },
        { label: 'Đã phê duyệt', value: 'COMPLETED' },
        { label: 'Từ chối', value: 'REFUSE' },
    ];

    const fetchProposals = useCallback(
        async (page, filters = {}) => {
            try {
                const status = filters.hasOwnProperty('status') ? filters.status : filterStatus;
                const queryFilters = {
                    page,
                    status: status === 'ALL' ? '' : status,
                };

                const code = filters.hasOwnProperty('proposalID') ? filters.proposalID : filterCode;
                if (code) queryFilters.proposalID = code;

                const creator = filters.hasOwnProperty('employeeName') ? filters.employeeName : filterCreator;
                if (creator) queryFilters.employeeName = creator;

                const dateToUse = filters.hasOwnProperty('createdAt') ? filters.createdAt : filterDate;
                if (dateToUse) {
                    // Format date manually to avoid timezone issues
                    const year = dateToUse.getFullYear();
                    const month = String(dateToUse.getMonth() + 1).padStart(2, '0');
                    const day = String(dateToUse.getDate()).padStart(2, '0');
                    queryFilters.createdAt = `${year}-${month}-${day}`;
                }

                const res = await fetchFilterProposal(queryFilters);

                if (res && res.proposals) {
                    setProposals(res.proposals);
                    setTotalPages(res.pagination?.totalPages || 1);
                    setCurrentPage(page);
                } else {
                    setProposals([]);
                }
            } catch (error) {
                console.error('Error fetching proposals:', error);
            }
        },
        [filterCode, filterCreator, filterDate, filterStatus],
    );

    const fetchProposalsRef = useRef(fetchProposals);

    useEffect(() => {
        fetchProposalsRef.current = fetchProposals;
    }, [fetchProposals]);

    useFocusEffect(
        useCallback(() => {
            fetchProposalsRef.current(1);
        }, []),
    );

    const handleSearch = () => {
        fetchProposals(1);
        setShowFilter(false);
    };

    const handleReset = () => {
        setFilterCode('');
        setFilterCreator('');
        setFilterDate(null);
        setFilterStatus('PENDING');
        setShowFilter(false);
        fetchProposals(1, {
            proposalID: '',
            employeeName: '',
            createdAt: null,
            status: 'PENDING',
        });
    };

    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) {
            fetchProposals(page);
        }
    };

    const renderItem = ({ item }) => (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>{item.proposalID}</Text>
                <View
                    style={[
                        styles.statusBadge,
                        item.status === 'COMPLETED'
                            ? styles.statusSuccess
                            : item.status === 'REFUSE'
                              ? styles.statusError
                              : styles.statusPending,
                    ]}
                >
                    <Text
                        style={[
                            styles.statusText,
                            item.status === 'COMPLETED'
                                ? styles.textSuccess
                                : item.status === 'REFUSE'
                                  ? styles.textError
                                  : styles.textPending,
                        ]}
                    >
                        {formatStatusProposal[item.status] || item.status}
                    </Text>
                </View>
            </View>

            <View style={styles.cardBody}>
                <View style={styles.infoRow}>
                    <Ionicons name="calendar-outline" size={16} color="#6b7280" />
                    <Text style={styles.infoText}>{new Date(item.createdAt).toLocaleDateString('vi-VN')}</Text>
                </View>
                <View style={styles.infoRow}>
                    <Ionicons name="person-outline" size={16} color="#6b7280" />
                    <Text style={styles.infoText}>Người tạo: {item.employeeCreate?.employeeName}</Text>
                </View>
                <View style={styles.infoRow}>
                    <Ionicons name="business-outline" size={16} color="#6b7280" />
                    <Text style={styles.infoText}>Kho: {item.warehouse?.warehouseName}</Text>
                </View>
            </View>

            <TouchableOpacity
                style={styles.detailButton}
                onPress={() => {
                    navigation.navigate('CreateImportRequest', { proposalData: item });
                }}
            >
                <Text style={styles.detailButtonText}>Xem chi tiết</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <DefaultLayout>
            <Header
                title="Phiếu đề xuất nhập"
                leftIcon="arrow-back"
                handleOnPressLeftIcon={() => navigation.goBack()}
                RightComponent={
                    <TouchableOpacity onPress={() => setShowFilter(true)}>
                        <Filter size={24} color="white" />
                    </TouchableOpacity>
                }
            />

            {/* Status Tabs */}
            <View style={styles.tabContainer}>
                {statusTabs.map((tab) => (
                    <TouchableOpacity
                        key={tab.value}
                        style={[styles.tabItem, filterStatus === tab.value && styles.activeTabItem]}
                        onPress={() => {
                            setFilterStatus(tab.value);
                            fetchProposals(1, { status: tab.value });
                        }}
                    >
                        <Text style={[styles.tabText, filterStatus === tab.value && styles.activeTabText]}>
                            {tab.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            <View style={styles.container}>
                {/* List */}
                <FlatList
                    data={proposals}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.proposalID}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Ionicons name="document-text-outline" size={48} color="#9ca3af" />
                            <Text style={styles.emptyText}>Không có dữ liệu</Text>
                        </View>
                    }
                />

                {/* Floating Action Button */}
                <TouchableOpacity
                    style={styles.fab}
                    onPress={() => {
                        navigation.navigate('CreateImportRequest');
                    }}
                >
                    <Plus size={24} color="white" />
                </TouchableOpacity>

                {/* Pagination */}
                <View style={styles.paginationContainer}>
                    <TouchableOpacity
                        style={[styles.pageButton, currentPage === 1 && styles.pageButtonDisabled]}
                        onPress={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                    >
                        <ChevronLeft size={20} color={currentPage === 1 ? '#9ca3af' : '#374151'} />
                    </TouchableOpacity>
                    <Text style={styles.pageText}>
                        Trang {currentPage} / {totalPages}
                    </Text>
                    <TouchableOpacity
                        style={[styles.pageButton, currentPage === totalPages && styles.pageButtonDisabled]}
                        onPress={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                    >
                        <ChevronRight size={20} color={currentPage === totalPages ? '#9ca3af' : '#374151'} />
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
                            <Text style={styles.modalTitle}>Bộ lọc tìm kiếm</Text>
                            <TouchableOpacity onPress={() => setShowFilter(false)}>
                                <Ionicons name="close" size={24} color="#1f2937" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.modalBody}>
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Mã phiếu</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Nhập mã phiếu"
                                    value={filterCode}
                                    onChangeText={setFilterCode}
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Ngày tạo</Text>
                                <TouchableOpacity style={styles.dateButton} onPress={() => setShowDatePicker(true)}>
                                    <Calendar size={20} color="#666" />
                                    <Text style={styles.dateText}>
                                        {filterDate ? filterDate.toLocaleDateString('vi-VN') : 'dd/mm/yyyy'}
                                    </Text>
                                </TouchableOpacity>

                                {/* Date Picker Logic */}
                                {Platform.OS === 'android' && showDatePicker && (
                                    <DateTimePicker
                                        value={filterDate || new Date()}
                                        mode="date"
                                        display="default"
                                        onChange={(event, selectedDate) => {
                                            setShowDatePicker(false);
                                            if (event.type === 'set' && selectedDate) {
                                                setFilterDate(selectedDate);
                                            }
                                        }}
                                    />
                                )}

                                {/* iOS Date Picker Modal */}
                                {Platform.OS === 'ios' && showDatePicker && (
                                    <Modal transparent={true} animationType="fade">
                                        <View style={styles.iosModalContainer}>
                                            <View style={styles.iosModalContent}>
                                                <DateTimePicker
                                                    value={filterDate || new Date()}
                                                    mode="date"
                                                    display="inline"
                                                    onChange={(event, selectedDate) => {
                                                        if (selectedDate) {
                                                            setFilterDate(selectedDate);
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

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Người tạo</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Nhập mã người tạo"
                                    value={filterCreator}
                                    onChangeText={setFilterCreator}
                                />
                            </View>
                        </ScrollView>

                        <View style={styles.modalFooter}>
                            <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
                                <Text style={styles.resetButtonText}>Đặt lại</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
                                <Text style={styles.searchButtonText}>Tìm kiếm</Text>
                            </TouchableOpacity>
                        </View>
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
    cardTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1f2937',
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusPending: {
        backgroundColor: '#fef3c7',
    },
    statusSuccess: {
        backgroundColor: '#d1fae5',
    },
    statusError: {
        backgroundColor: '#fee2e2',
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
    },
    textPending: {
        color: '#d97706',
    },
    textSuccess: {
        color: '#059669',
    },
    textError: {
        color: '#dc2626',
    },
    cardBody: {
        marginBottom: 12,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    infoText: {
        marginLeft: 8,
        color: '#4b5563',
        fontSize: 14,
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
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 40,
    },
    emptyText: {
        marginTop: 12,
        color: '#9ca3af',
        fontSize: 16,
    },
    paginationContainer: {
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
    pageButton: {
        padding: 8,
        borderRadius: 8,
        backgroundColor: '#f3f4f6',
    },
    pageButtonDisabled: {
        opacity: 0.5,
    },
    pageText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#374151',
    },
    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
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
        fontWeight: 'bold',
        color: '#1f2937',
    },
    modalBody: {
        flex: 1,
    },
    inputGroup: {
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
        color: '#374151',
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderColor: '#d1d5db',
        borderRadius: 8,
        padding: 12,
        fontSize: 14,
        color: '#1f2937',
    },
    dateButton: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#d1d5db',
        padding: 12,
        borderRadius: 8,
        backgroundColor: '#fff',
    },
    dateText: {
        marginLeft: 8,
        color: '#1f2937',
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

    modalFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
        paddingBottom: 20,
    },
    resetButton: {
        flex: 1,
        backgroundColor: '#e5e7eb',
        padding: 14,
        borderRadius: 8,
        alignItems: 'center',
        marginRight: 8,
    },
    resetButtonText: {
        color: '#374151',
        fontWeight: '600',
    },
    searchButton: {
        flex: 1,
        backgroundColor: '#3b82f6',
        padding: 14,
        borderRadius: 8,
        alignItems: 'center',
        marginLeft: 8,
    },
    searchButtonText: {
        color: '#fff',
        fontWeight: '600',
    },
    tabContainer: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
    },
    tabItem: {
        marginRight: 16,
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 20,
        backgroundColor: '#f3f4f6',
    },
    activeTabItem: {
        backgroundColor: '#2563eb',
    },
    tabText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#4b5563',
    },
    activeTabText: {
        color: '#fff',
    },
});
