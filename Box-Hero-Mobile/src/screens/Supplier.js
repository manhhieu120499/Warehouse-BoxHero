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
import { COLORS } from '../components/style/Globalstyle';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { ChevronLeft } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import {
    getAllSupplier,
    filterSupplier,
    createSupplier,
    updateSupplier,
    findProductOfSupplier,
} from '../service/supplier.service';
import CreateSupplier from '../components/partials/SupplierScreenComponents/CreateSupplier';
import { formatStatusSupplier } from '../constants';
import ProductOfSupplier from '../components/partials/SupplierScreenComponents/ProductOfSupplier';

const LIMIT_PAGE = 5;

export default function Supplier() {
    const navigation = useNavigation();
    const [suppliers, setSuppliers] = useState([]);
    const [refreshing, setRefreshing] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    // Search filters
    const [filters, setFilters] = useState({
        supplierID: '',
        phone: '',
        email: '',
    });

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedSupplier, setSelectedSupplier] = useState(null);

    // Modal product
    const [isModalProductOpen, setIsModalProductOpen] = useState(false);
    const [productList, setProductList] = useState([]);

    useEffect(() => {
        fetchSuppliers(currentPage);
    }, [currentPage]);

    const fetchSuppliers = async (currentPage) => {
        try {
            const res = await getAllSupplier(currentPage);
            setSuppliers(res.suppliers.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
            setTotalPages(res?.totalPages || 1);
            setCurrentPage(res?.page || 1);
        } catch (error) {
            console.error('Error fetching suppliers:', error);
        }
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        await fetchSuppliers(1);
        setRefreshing(false);
    };

    const handleSearch = async () => {
        const optionFilter = {};
        if (!filters.supplierID && !filters.phone && !filters.email) return;
        if (filters.supplierID) optionFilter.supplierID = filters.supplierID;
        if (filters.phone) optionFilter.phoneNumber = filters.phone;
        if (filters.email) optionFilter.email = filters.email;
        try {
            const res = await filterSupplier({ ...optionFilter, page: currentPage, limit: LIMIT_PAGE });
            console.log('data search', res);
            setSuppliers(res?.suppliers || []);
            setTotalPages(res?.totalPages || 1);
            setCurrentPage(res?.page || 1);
        } catch (err) {
            console.log(err);
        }
    };

    const handleReset = () => {
        setFilters({
            supplierID: '',
            phone: '',
            email: '',
        });
        setCurrentPage(1);
        fetchSuppliers(1);
    };

    const handleCreateSupplier = () => {
        setSelectedSupplier(null);
        setIsModalOpen(true);
    };

    const handleViewDetails = (supplier) => {
        setSelectedSupplier(supplier);
        setIsModalOpen(true);
    };

    const handleViewProduct = (supplier) => {
        setSelectedSupplier(supplier);
        setIsModalProductOpen(true);
    };

    const handleSubmitSupplier = async (formData, isUpdateMode) => {
        try {
            if (isUpdateMode) {
                await updateSupplier(formData.supplierID, formData);
            } else {
                await createSupplier({ ...formData, status: 'ACTIVE' });
            }
            // Refresh list after create/update
            await fetchSuppliers(currentPage);
        } catch (error) {
            console.error('Error submitting supplier:', error);
        }
    };

    const fetchProductOfSupplier = async (supplierID) => {
        try {
            const res = await findProductOfSupplier(supplierID);
            setProductList(res);
        } catch (err) {
            console.log(err);
        }
    };

    useEffect(() => {
        if (isModalProductOpen) {
            fetchProductOfSupplier(selectedSupplier?.supplierID);
        }
    }, [selectedSupplier]);

    const renderSupplierCard = ({ item }) => (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <View style={styles.supplierIDContainer}>
                    <Icon name="business" size={16} color={COLORS.white} />
                    <Text style={styles.supplierID}>{item.supplierID}</Text>
                </View>
                <View style={styles.actionButtons}>
                    <TouchableOpacity style={styles.detailsButton} onPress={() => handleViewProduct(item)}>
                        <Icon name="visibility" size={20} color="#ffffff" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.detailsButton} onPress={() => handleViewDetails(item)}>
                        <Icon name="edit" size={20} color="#ffffff" />
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.cardContent}>
                <View style={styles.infoRow}>
                    <Icon name="store" size={18} color="#6b7280" />
                    <Text style={styles.infoLabel}>Tên nhà cung cấp:</Text>
                    <Text style={styles.infoValue}>{item.supplierName}</Text>
                </View>

                <View style={styles.infoRow}>
                    <Icon name="phone" size={18} color="#6b7280" />
                    <Text style={styles.infoLabel}>SĐT:</Text>
                    <Text style={styles.infoValue}>{item.phoneNumber}</Text>
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

                <View style={styles.infoRow}>
                    <Icon name="toggle-on" size={18} color={item.status === 'ACTIVE' ? '#22c55d' : '#ef4444'} />
                    <Text style={styles.infoLabel}>Trạng thái:</Text>
                    <View
                        style={[
                            styles.statusBadge,
                            { backgroundColor: item.status === 'ACTIVE' ? '#22c55d' : '#ef4444' },
                        ]}
                    >
                        <Text style={styles.statusText}>{formatStatusSupplier[item.status]}</Text>
                    </View>
                </View>
            </View>
        </View>
    );

    const renderEmptyList = () => (
        <View style={styles.emptyContainer}>
            <Icon name="store" size={60} color="#d1d5db" />
            <Text style={styles.emptyText}>Không tìm thấy nhà cung cấp</Text>
        </View>
    );

    return (
        <DefaultLayout>
            <View style={styles.container}>
                {/* Header - Fixed */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <ChevronLeft size={24} color="black" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Nhà cung cấp</Text>
                </View>

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
                                    <Text style={styles.filterLabel}>Mã nhà cung cấp</Text>
                                    <TextInput
                                        style={styles.filterInput}
                                        placeholder="Nhập Mã nhà cung cấp"
                                        placeholderTextColor="#9ca3af"
                                        value={filters.supplierID}
                                        onChangeText={(text) => setFilters({ ...filters, supplierID: text })}
                                    />
                                </View>

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
                            </View>

                            {/* Email Full Width */}
                            <View style={styles.filterRowFull}>
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

                            {/* Search and Reset Buttons */}
                            <View style={styles.actionButtonsRow}>
                                <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
                                    <Icon name="search" size={18} color={COLORS.white} />
                                    <Text style={styles.searchButtonText}>Tìm kiếm</Text>
                                </TouchableOpacity>

                                <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
                                    <Icon name="refresh" size={18} color="#374151" />
                                    <Text style={styles.resetButtonText}>Đặt lại</Text>
                                </TouchableOpacity>
                            </View>

                            {/* Create Button */}
                            <TouchableOpacity style={styles.createButtonFull} onPress={handleCreateSupplier}>
                                <Icon name="add" size={18} color={COLORS.white} />
                                <Text style={styles.createButtonText}>Tạo nhà cung cấp</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Supplier List */}
                        {refreshing ? (
                            <View style={styles.loadingContainer}>
                                <ActivityIndicator size="large" color={COLORS.primary} />
                            </View>
                        ) : suppliers?.length > 0 ? (
                            <View style={styles.listContainer}>
                                {suppliers.map((item, index) => (
                                    <View key={item.supplierID || index}>{renderSupplierCard({ item })}</View>
                                ))}

                                {/* Pagination Controls */}
                                {totalPages >= 1 && (
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

            {/* Create/Update Supplier Modal */}
            <CreateSupplier
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleSubmitSupplier}
                supplierData={selectedSupplier}
            />

            <ProductOfSupplier
                isOpen={isModalProductOpen}
                onClose={() => setIsModalProductOpen(false)}
                supplierData={selectedSupplier}
                products={productList}
                refetchData={fetchProductOfSupplier}
            />
        </DefaultLayout>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f9fafb',
    },
    header: {
        backgroundColor: '#fff',
        paddingHorizontal: 10,
        paddingTop: 16,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
        flexDirection: 'row',
        alignItems: 'flex-end',
        height: 85,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        marginStart: 15,
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
    filterRowFull: {
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
    actionButtonsRow: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 4,
        marginBottom: 12,
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
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#d1d5db',
        paddingVertical: 10,
        borderRadius: 6,
        gap: 6,
    },
    resetButtonText: {
        color: '#374151',
        fontSize: 14,
        fontWeight: '600',
    },
    createButtonFull: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#16a34a',
        paddingVertical: 10,
        borderRadius: 6,
        gap: 6,
    },
    createButtonText: {
        color: COLORS.white,
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
    supplierIDContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    supplierID: {
        color: COLORS.white,
        fontSize: 14,
        fontWeight: '600',
    },
    actionButtons: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 15,
    },
    detailsButton: {
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
        minWidth: 130,
    },
    infoValue: {
        flex: 1,
        fontSize: 13,
        color: '#1f2937',
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        backgroundColor: '#16a34a',
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#ffffff',
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
