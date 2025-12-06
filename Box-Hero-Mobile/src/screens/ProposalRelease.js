import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    FlatList,
    TextInput,
    ActivityIndicator,
    Platform,
    Modal,
    ScrollView,
    KeyboardAvoidingView,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Dropdown } from 'react-native-element-dropdown';
import { DefaultLayout } from '../layouts';
import Header from '../layouts/Header';
import { getAllOrderReleaseProposal, updateStatusOrderReleaseProposal } from '../service/proposal.service';
import { formatStatusProposalRelease } from '../constants';
import { authIsAdmin } from '../common';
import { useSelector } from 'react-redux';
import { Filter } from 'lucide-react-native';

export default function ProposalRelease() {
    const navigation = useNavigation();
    const [proposals, setProposals] = useState([]);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [showFilter, setShowFilter] = useState(false);

    // Filter State
    const [filterCode, setFilterCode] = useState(null);
    const [filterCreator, setFilterCreator] = useState(null);
    const [filterDate, setFilterDate] = useState(null);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [tempDate, setTempDate] = useState(new Date());
    const [activeTab, setActiveTab] = useState('PENDING');

    const tabs = [
        { key: 'PENDING', title: 'Chờ phê duyệt' },
        { key: 'COMPLETED', title: 'Đã phê duyệt' },
        { key: 'REFUSE', title: 'Từ chối' },
    ];

    const currentUser = useSelector((state) => state.AuthSlice.user);
    console.log(currentUser);

    const fetchProposals = useCallback(
        async (page, filters = {}) => {
            try {
                const status = filters.hasOwnProperty('status') ? filters.status : activeTab;
                const queryFilters = {
                    status: status === 'ALL' ? '' : status,
                };

                if (filterCode) queryFilters.orderReleaseProposalID = filterCode;
                if (filterCreator) queryFilters.employeeIDCreate = filterCreator;
                if (filterDate) queryFilters.createdAt = filterDate.toISOString().split('T')[0];

                const res = await getAllOrderReleaseProposal(page, queryFilters);
                if (res && res.data) {
                    setProposals(res.data);
                    setTotalPages(res.pagination?.totalPages || 1);
                    setCurrentPage(page);
                }
            } catch (error) {
                console.error('Error fetching proposals:', error);
            }
        },
        [filterCode, filterCreator, filterDate, activeTab],
    );

    useFocusEffect(
        useCallback(() => {
            fetchProposals(1);
        }, []),
    );

    const handleSearch = () => {
        fetchProposals(1);
        setShowFilter(false);
    };

    const handleReset = () => {
        setFilterCode(null);
        setFilterCreator(null);
        setFilterDate(null);
        setTempDate(new Date());
        fetchProposals(1);
        setShowFilter(false);
    };

    const onDateChange = (event, selectedDate) => {
        setShowDatePicker(false);
        if (selectedDate) {
            setFilterDate(selectedDate);
            setTempDate(selectedDate);
        }
    };

    const handleApproveProposal = async (proposalID, status) => {
        try {
            const res = await updateStatusOrderReleaseProposal({
                orderReleaseProposalID: proposalID,
                employeeIDApproval: currentUser.employeeID,
                status: status,
            });
            if (res && res.data.status === 'OK') {
                fetchProposals(currentPage);
            }
        } catch (error) {
            console.error('Error approving proposal:', error);
        }
    };

    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) {
            fetchProposals(page);
        }
    };

    const renderItem = ({ item }) => (
        <TouchableOpacity
            style={styles.card}
            onPress={() => {
                navigation.navigate('CreateExportRequest', { proposalData: item });
            }}
        >
            <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>{item.orderReleaseProposalID}</Text>
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
                        {formatStatusProposalRelease[item.status] || item.status}
                    </Text>
                </View>
            </View>

            <View style={styles.cardBody}>
                <View style={styles.infoRow}>
                    <Ionicons name="calendar-outline" size={16} color="#6b7280" />
                    <Text style={styles.infoText}>
                        Ngày tạo: {new Date(item.createdAt).toLocaleDateString('vi-VN')}
                    </Text>
                </View>
                {item.status === 'COMPLETED' && (
                    <View style={styles.infoRow}>
                        <Ionicons name="checkmark-circle-outline" size={16} color="#10b981" />
                        <Text style={styles.infoText}>
                            Ngày phê duyệt: {new Date(item.updatedAt).toLocaleDateString('vi-VN')}{' '}
                            {new Date(item.updatedAt).toLocaleTimeString('vi-VN', {
                                hour: '2-digit',
                                minute: '2-digit',
                            })}
                        </Text>
                    </View>
                )}
                <View style={styles.infoRow}>
                    <Ionicons name="person-outline" size={16} color="#6b7280" />
                    <Text style={styles.infoText}>
                        Người tạo: {item.creator.employeeID} - {item.creator.employeeName}
                    </Text>
                </View>
                <View style={styles.infoRow}>
                    <Ionicons name="business-outline" size={16} color="#6b7280" />
                    <Text style={styles.infoText}>
                        Kho: {item.warehouse.warehouseID} - {item.warehouse.warehouseName}
                    </Text>
                </View>
            </View>

            <View style={styles.cardFooter}>
                <TouchableOpacity
                    style={styles.detailButton}
                    onPress={() => {
                        navigation.navigate('CreateExportRequest', { proposalData: item });
                    }}
                >
                    <Text style={styles.detailButtonText}>Xem chi tiết</Text>
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );

    return (
        <DefaultLayout>
            <Header
                title="Phiếu đề xuất xuất"
                leftIcon="arrow-back"
                handleOnPressLeftIcon={() => navigation.goBack()}
                RightComponent={
                    <TouchableOpacity onPress={() => setShowFilter(true)}>
                        <Filter size={24} color="white" />
                    </TouchableOpacity>
                }
            />

            <View style={styles.tabContainer}>
                {tabs.map((tab) => (
                    <TouchableOpacity
                        key={tab.key}
                        style={[styles.tabItem, activeTab === tab.key && styles.activeTabItem]}
                        onPress={() => {
                            setActiveTab(tab.key);
                            fetchProposals(1, { status: tab.key });
                        }}
                    >
                        <Text style={[styles.tabTitle, activeTab === tab.key && styles.activeTabTitle]}>
                            {tab.title}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            <View style={styles.container}>
                {/* Search & Filter Bar */}

                {/* List */}
                {loading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#3b82f6" />
                    </View>
                ) : (
                    <FlatList
                        data={proposals}
                        renderItem={renderItem}
                        keyExtractor={(item) => item.orderReleaseProposalID}
                        contentContainerStyle={styles.listContent}
                        ListEmptyComponent={
                            <View style={styles.emptyContainer}>
                                <Ionicons name="document-text-outline" size={48} color="#9ca3af" />
                                <Text style={styles.emptyText}>Không có dữ liệu</Text>
                            </View>
                        }
                        showsVerticalScrollIndicator={false}
                    />
                )}

                <TouchableOpacity
                    style={styles.fab}
                    onPress={() => {
                        navigation.navigate('CreateExportRequest');
                    }}
                >
                    <Ionicons name="add" size={30} color="#fff" />
                </TouchableOpacity>

                {/* Pagination */}
                {!loading && proposals.length > 0 && (
                    <View style={styles.paginationContainer}>
                        <TouchableOpacity
                            style={[styles.pageButton, currentPage === 1 && styles.pageButtonDisabled]}
                            onPress={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                        >
                            <Ionicons name="chevron-back" size={20} color={currentPage === 1 ? '#9ca3af' : '#1f2937'} />
                        </TouchableOpacity>
                        <Text style={styles.pageText}>
                            Trang {currentPage} / {totalPages}
                        </Text>
                        <TouchableOpacity
                            style={[styles.pageButton, currentPage === totalPages && styles.pageButtonDisabled]}
                            onPress={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                        >
                            <Ionicons
                                name="chevron-forward"
                                size={20}
                                color={currentPage === totalPages ? '#9ca3af' : '#1f2937'}
                            />
                        </TouchableOpacity>
                    </View>
                )}
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
                                <Text style={styles.label}>Mã phiếu đề xuất</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Nhập mã phiếu"
                                    value={filterCode}
                                    onChangeText={setFilterCode}
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Ngày tạo</Text>
                                <TouchableOpacity
                                    style={styles.dateInput}
                                    onPress={() => {
                                        setTempDate(filterDate || new Date());
                                        setShowDatePicker(true);
                                    }}
                                >
                                    <Text style={filterDate ? styles.dateText : styles.placeholderText}>
                                        {filterDate ? filterDate.toLocaleDateString('vi-VN') : 'dd/mm/yyyy'}
                                    </Text>
                                    <Ionicons name="calendar-outline" size={20} color="#6b7280" />
                                </TouchableOpacity>
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Mã người tạo</Text>
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

                    {Platform.OS === 'android' && showDatePicker && (
                        <DateTimePicker value={tempDate} mode="date" display="default" onChange={onDateChange} />
                    )}

                    {Platform.OS === 'ios' && showDatePicker && (
                        <View
                            style={[
                                styles.iosModalContainer,
                                { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 10 },
                            ]}
                        >
                            <View style={styles.iosModalContent}>
                                <DateTimePicker
                                    value={tempDate}
                                    mode="date"
                                    display="inline"
                                    onChange={(event, selectedDate) => {
                                        if (selectedDate) setTempDate(selectedDate);
                                    }}
                                    style={{ height: 300, width: '100%' }}
                                />
                                <TouchableOpacity
                                    style={styles.iosConfirmButton}
                                    onPress={() => {
                                        setFilterDate(tempDate);
                                        setShowDatePicker(false);
                                    }}
                                >
                                    <Text style={styles.iosConfirmText}>Xong</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}
                </View>
            </Modal>
        </DefaultLayout>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f3f4f6',
        padding: 16,
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
        zIndex: 100,
    },
    listContent: {
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
    cardFooter: {
        borderTopWidth: 1,
        borderTopColor: '#e5e7eb',
        paddingTop: 12,
        alignItems: 'flex-end',
    },
    detailLink: {
        color: '#3b82f6',
        fontWeight: '600',
        fontSize: 14,
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
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 16,
        borderTopWidth: 1,
        borderTopColor: '#e5e7eb',
        backgroundColor: '#f3f4f6',
    },
    pageButton: {
        padding: 8,
        borderRadius: 8,
        backgroundColor: '#e5e7eb',
        marginHorizontal: 12,
    },
    pageButtonDisabled: {
        opacity: 0.5,
    },
    pageText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1f2937',
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
    dateInput: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#d1d5db',
        borderRadius: 8,
        padding: 12,
    },
    dateText: {
        color: '#1f2937',
    },
    placeholderText: {
        color: '#9ca3af',
    },
    dropdown: {
        borderWidth: 1,
        borderColor: '#d1d5db',
        borderRadius: 8,
        padding: 12,
    },
    placeholderStyle: {
        fontSize: 14,
        color: '#9ca3af',
    },
    selectedTextStyle: {
        fontSize: 14,
        color: '#1f2937',
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
    detailButton: {
        backgroundColor: '#eff6ff',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 8,
        alignItems: 'center',
        width: '100%',
    },
    detailButtonText: {
        color: '#2563eb',
        fontWeight: '600',
        fontSize: 14,
    },
    tabContainer: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
        gap: 8,
    },
    tabItem: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#f3f4f6',
    },
    activeTabItem: {
        backgroundColor: '#2563eb',
    },
    tabTitle: {
        fontSize: 14,
        fontWeight: '500',
        color: '#4b5563',
    },
    activeTabTitle: {
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
});
