import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
    RefreshControl,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
} from 'react-native';
import { DefaultLayout } from '../layouts';
import Header from '../layouts/Header';
import { COLORS } from '../components/style/Globalstyle';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { ChevronLeft } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { filterCustomer, getAllCustomer } from '../service/customer.service';

export default function Customer() {
    const navigation = useNavigation();
    const [customers, setCustomers] = useState([]);
    const [refreshing, setRefreshing] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    // Search filters
    const [filters, setFilters] = useState({
        customerCode: '',
        customerName: '',
        phone: '',
        email: '',
    });

    useEffect(() => {
        fetchCustomers(currentPage);
    }, [currentPage]);

    const fetchCustomers = async (currentPage) => {
        try {
            const res = await getAllCustomer(currentPage);
            setCustomers(res.data);
            setTotalPages(res?.pagination?.totalPages || 1);
            setCurrentPage(res?.pagination?.currentPage || 1);
        } catch (error) {
            console.error('Error fetching customers:', error);
        }
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        await fetchCustomers(1);
        setRefreshing(false);
    };

    const handleSearch = async () => {
        const optionFilter = {};
        if (!filters.customerCode && !filters.customerName && !filters.phone && !filters.email) return;
        if (filters.customerCode) optionFilter.customerID = filters.customerCode;
        if (filters.customerName) optionFilter.customerName = filters.customerName;
        if (filters.phone) optionFilter.customerPhone = filters.phone;
        if (filters.email) optionFilter.email = filters.email;
        try {
            const res = await filterCustomer(optionFilter);
            console.log('data search', res);
            setCustomers(res);
            setTotalPages(1);
            setCurrentPage(1);
        } catch (err) {
            console.log(err);
        }
    };

    const handleReset = () => {
        setFilters({
            customerCode: '',
            customerName: '',
            phone: '',
            email: '',
        });
        setCurrentPage(1);
        fetchCustomers(1);
    };

    const handleViewHistory = (customer) => {
        console.log('View history for:', customer.customerID);
    };

    const renderCustomerCard = ({ item }) => (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <View style={styles.customerCodeContainer}>
                    <Icon name="badge" size={16} color={COLORS.white} />
                    <Text style={styles.customerCode}>{item.customerID}</Text>
                </View>
                <TouchableOpacity style={styles.historyButton} onPress={() => handleViewHistory(item)}>
                    <Icon name="visibility" size={20} color="#ffffff" />
                </TouchableOpacity>
            </View>

            <View style={styles.cardContent}>
                <View style={styles.infoRow}>
                    <Icon name="person" size={18} color="#6b7280" />
                    <Text style={styles.infoLabel}>Tên khách hàng:</Text>
                    <Text style={styles.infoValue}>{item.customerName}</Text>
                </View>

                <View style={styles.infoRow}>
                    <Icon name="phone" size={18} color="#6b7280" />
                    <Text style={styles.infoLabel}>SĐT:</Text>
                    <Text style={styles.infoValue}>{item.phone}</Text>
                </View>

                <View style={styles.infoRow}>
                    <Icon name="location-on" size={18} color="#6b7280" />
                    <Text style={styles.infoLabel}>Địa chỉ:</Text>
                    <Text style={styles.infoValue}>{item.address}</Text>
                </View>

                <View style={styles.infoRow}>
                    <Icon name="email" size={18} color="#6b7280" />
                    <Text style={styles.infoLabel}>Email:</Text>
                    <Text style={styles.infoValue}>{item.email}</Text>
                </View>
            </View>
        </View>
    );

    const renderEmptyList = () => (
        <View style={styles.emptyContainer}>
            <Icon name="people-outline" size={60} color="#d1d5db" />
            <Text style={styles.emptyText}>Không tìm thấy khách hàng</Text>
        </View>
    );

    return (
        <DefaultLayout>
            <Header title="Khách hàng" leftIcon="arrow-back" handleOnPressLeftIcon={() => navigation.goBack()} />
            <View style={styles.container}>
                {/* Scrollable Content */}
                <KeyboardAvoidingView behavior="padding" style={styles.keyboardAvoidingView} keyboardVerticalOffset={0}>
                    <ScrollView
                        style={styles.scrollView}
                        showsVerticalScrollIndicator={false}
                        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
                    >
                        {/* Search Filters */}
                        <View style={styles.filtersContainer}>
                            <View style={styles.filterRow}>
                                <View style={styles.filterItem}>
                                    <Text style={styles.filterLabel}>Mã khách hàng</Text>
                                    <TextInput
                                        style={styles.filterInput}
                                        placeholder="Nhập Mã khách hàng"
                                        placeholderTextColor="#9ca3af"
                                        value={filters.customerCode}
                                        onChangeText={(text) => setFilters({ ...filters, customerCode: text })}
                                    />
                                </View>

                                <View style={styles.filterItem}>
                                    <Text style={styles.filterLabel}>Tên khách hàng</Text>
                                    <TextInput
                                        style={styles.filterInput}
                                        placeholder="Nhập Tên khách hàng"
                                        placeholderTextColor="#9ca3af"
                                        value={filters.customerName}
                                        onChangeText={(text) => setFilters({ ...filters, customerName: text })}
                                    />
                                </View>
                            </View>

                            <View style={styles.filterRow}>
                                <View style={styles.filterItem}>
                                    <Text style={styles.filterLabel}>Số điện thoại</Text>
                                    <TextInput
                                        style={styles.filterInput}
                                        placeholder="Nhập Số điện thoại"
                                        placeholderTextColor="#9ca3af"
                                        value={filters.phone}
                                        onChangeText={(text) => setFilters({ ...filters, phone: text })}
                                        keyboardType="phone-pad"
                                    />
                                </View>

                                <View style={styles.filterItem}>
                                    <Text style={styles.filterLabel}>Email</Text>
                                    <TextInput
                                        style={styles.filterInput}
                                        placeholder="Nhập Email"
                                        placeholderTextColor="#9ca3af"
                                        value={filters.email}
                                        onChangeText={(text) => setFilters({ ...filters, email: text })}
                                        keyboardType="email-address"
                                    />
                                </View>
                            </View>

                            {/* Action Buttons */}
                            <View style={styles.actionButtons}>
                                <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
                                    <Icon name="search" size={18} color={COLORS.white} />
                                    <Text style={styles.searchButtonText}>Tìm kiếm</Text>
                                </TouchableOpacity>

                                <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
                                    <Icon name="refresh" size={18} color="#374151" />
                                    <Text style={styles.resetButtonText}>Đặt lại</Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Customer List */}
                        {refreshing ? (
                            <View style={styles.loadingContainer}>
                                <ActivityIndicator size="large" color={COLORS.primary} />
                            </View>
                        ) : customers.length > 0 ? (
                            <View style={styles.listContainer}>
                                {customers.map((item, index) => (
                                    <View key={item.customerID || index}>{renderCustomerCard({ item })}</View>
                                ))}

                                {/* Pagination Controls */}
                                {totalPages > 1 && (
                                    <View style={styles.paginationContainer}>
                                        <TouchableOpacity
                                            style={[
                                                styles.paginationButton,
                                                currentPage === 1 && styles.paginationButtonDisabled,
                                            ]}
                                            onPress={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                            disabled={currentPage === 1}
                                        >
                                            <Icon
                                                name="chevron-left"
                                                size={20}
                                                color={currentPage === 1 ? '#ccc' : '#374151'}
                                            />
                                        </TouchableOpacity>

                                        <View style={styles.pageNumbersContainer}>
                                            {[...Array(totalPages)].map((_, index) => {
                                                const pageNumber = index + 1;
                                                return (
                                                    <TouchableOpacity
                                                        key={pageNumber}
                                                        style={[
                                                            styles.pageNumber,
                                                            currentPage === pageNumber && styles.pageNumberActive,
                                                        ]}
                                                        onPress={() => setCurrentPage(pageNumber)}
                                                    >
                                                        <Text
                                                            style={[
                                                                styles.pageNumberText,
                                                                currentPage === pageNumber &&
                                                                    styles.pageNumberTextActive,
                                                            ]}
                                                        >
                                                            {pageNumber}
                                                        </Text>
                                                    </TouchableOpacity>
                                                );
                                            })}
                                        </View>

                                        <TouchableOpacity
                                            style={[
                                                styles.paginationButton,
                                                currentPage === totalPages && styles.paginationButtonDisabled,
                                            ]}
                                            onPress={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                                            disabled={currentPage === totalPages}
                                        >
                                            <Icon
                                                name="chevron-right"
                                                size={20}
                                                color={currentPage === totalPages ? '#ccc' : '#374151'}
                                            />
                                        </TouchableOpacity>
                                    </View>
                                )}
                            </View>
                        ) : (
                            renderEmptyList()
                        )}
                    </ScrollView>
                </KeyboardAvoidingView>
            </View>
        </DefaultLayout>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f9fafb',
    },
    keyboardAvoidingView: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
    },
    filtersContainer: {
        backgroundColor: COLORS.white,
        padding: 16,
        marginBottom: 12,
        borderRadius: 8,
        marginHorizontal: 12,
        marginTop: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    filterRow: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 12,
    },
    filterItem: {
        flex: 1,
    },
    filterLabel: {
        fontSize: 13,
        fontWeight: '500',
        color: '#374151',
        marginBottom: 6,
    },
    filterInput: {
        borderWidth: 1,
        borderColor: '#d1d5db',
        borderRadius: 6,
        paddingHorizontal: 12,
        paddingVertical: 8,
        fontSize: 14,
        color: '#1f2937',
        backgroundColor: COLORS.white,
    },
    actionButtons: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 4,
    },
    searchButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#1f2937',
        paddingVertical: 10,
        borderRadius: 6,
        gap: 6,
    },
    searchButtonText: {
        color: COLORS.white,
        fontSize: 14,
        fontWeight: '600',
    },
    resetButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#d1d5db',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 6,
        gap: 6,
    },
    resetButtonText: {
        color: '#374151',
        fontSize: 14,
        fontWeight: '600',
    },
    listContainer: {
        paddingHorizontal: 12,
        paddingBottom: 20,
    },
    card: {
        backgroundColor: COLORS.white,
        borderRadius: 8,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
        overflow: 'hidden',
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#60a5fa',
        paddingHorizontal: 12,
        paddingVertical: 10,
    },
    customerCodeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    customerCode: {
        color: COLORS.white,
        fontSize: 14,
        fontWeight: '600',
    },
    historyButton: {
        padding: 4,
    },
    cardContent: {
        padding: 12,
        gap: 10,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    infoLabel: {
        fontSize: 13,
        color: '#6b7280',
        fontWeight: '500',
        minWidth: 110,
    },
    infoValue: {
        flex: 1,
        fontSize: 13,
        color: '#1f2937',
    },
    loadingContainer: {
        paddingVertical: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
    },
    emptyText: {
        fontSize: 14,
        color: '#9ca3af',
        marginTop: 12,
    },
    paginationContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 20,
        paddingVertical: 10,
        gap: 10,
    },
    paginationButton: {
        padding: 8,
        borderRadius: 6,
        minWidth: 36,
        minHeight: 36,
        justifyContent: 'center',
        alignItems: 'center',
    },
    paginationButtonDisabled: {
        opacity: 0.5,
    },
    pageNumbersContainer: {
        flexDirection: 'row',
        gap: 8,
    },
    pageNumber: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 6,
        backgroundColor: '#f5f5f5',
        minWidth: 36,
        minHeight: 36,
        justifyContent: 'center',
        alignItems: 'center',
    },
    pageNumberActive: {
        backgroundColor: '#60a5fa',
    },
    pageNumberText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#666',
    },
    pageNumberTextActive: {
        color: '#fff',
    },
});
