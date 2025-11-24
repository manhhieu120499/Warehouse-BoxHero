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
    Modal,
} from 'react-native';
import { DefaultLayout } from '../layouts';
import Header from '../layouts/Header';
import { COLORS } from '../components/style/Globalstyle';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { ChevronLeft, Filter, X, ChevronRight, Plus } from 'lucide-react-native';
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
    const [showFilter, setShowFilter] = useState(false);

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
        setShowFilter(false);
    };

    const handleApplyFilter = () => {
        handleSearch();
        setShowFilter(false);
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
                <Text style={styles.cardId}>{item.supplierID}</Text>
                <View style={[styles.statusTag, { backgroundColor: item.status === 'ACTIVE' ? '#10b981' : '#ef4444' }]}>
                    <Text style={styles.statusText}>{formatStatusSupplier[item.status]}</Text>
                </View>
            </View>

            <View style={styles.cardBody}>
                <Text style={styles.infoText}>Tên NCC: {item.supplierName}</Text>
                <Text style={styles.infoText}>SĐT: {item.phoneNumber}</Text>
                <Text style={styles.infoText}>Địa chỉ: {item.address}</Text>
                <Text style={styles.infoText}>Email: {item.email}</Text>
            </View>

            <View style={styles.cardFooter}>
                <TouchableOpacity
                    style={[styles.detailButton, { flex: 1, marginRight: 6 }]}
                    onPress={() => handleViewProduct(item)}
                >
                    <Text style={styles.detailButtonText}>Sản phẩm</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.detailButton, { flex: 1, marginLeft: 6 }]}
                    onPress={() => handleViewDetails(item)}
                >
                    <Text style={styles.detailButtonText}>Chỉnh sửa</Text>
                </TouchableOpacity>
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
            <Header
                title="Nhà cung cấp"
                leftIcon="arrow-back"
                handleOnPressLeftIcon={() => navigation.goBack()}
                RightComponent={
                    <TouchableOpacity onPress={() => setShowFilter(true)}>
                        <Filter size={24} color="white" />
                    </TouchableOpacity>
                }
            />
            <View style={styles.container}>
                {/* Scrollable Content */}
                <KeyboardAvoidingView behavior="padding" style={styles.keyboardAvoidingView} keyboardVerticalOffset={0}>
                    <ScrollView
                        style={styles.scrollView}
                        contentContainerStyle={{ paddingBottom: 100 }}
                        showsVerticalScrollIndicator={false}
                        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
                    >
                        {/* Supplier List */}
                        <View style={styles.listHeader}>
                            <Text style={styles.listTitle}>Danh sách nhà cung cấp</Text>
                        </View>

                        {refreshing ? (
                            <View style={styles.loadingContainer}>
                                <ActivityIndicator size="large" color={COLORS.primary} />
                            </View>
                        ) : suppliers?.length > 0 ? (
                            <View style={styles.listContainer}>
                                {suppliers.map((item, index) => (
                                    <View key={item.supplierID || index}>{renderSupplierCard({ item })}</View>
                                ))}
                            </View>
                        ) : (
                            renderEmptyList()
                        )}
                    </ScrollView>
                </KeyboardAvoidingView>

                {/* Floating Action Button */}
                <TouchableOpacity style={styles.fab} onPress={handleCreateSupplier}>
                    <Plus size={24} color="white" />
                </TouchableOpacity>

                {/* Pagination */}
                <View style={styles.footer}>
                    <TouchableOpacity
                        disabled={currentPage <= 1}
                        onPress={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        style={[styles.pageBtn, currentPage <= 1 && styles.disabledBtn]}
                    >
                        <ChevronLeft size={20} color={currentPage <= 1 ? '#9ca3af' : '#374151'} />
                    </TouchableOpacity>
                    <Text style={styles.pageText}>
                        Trang {currentPage} / {totalPages || 1}
                    </Text>
                    <TouchableOpacity
                        disabled={currentPage >= totalPages}
                        onPress={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                        style={[styles.pageBtn, currentPage >= totalPages && styles.disabledBtn]}
                    >
                        <ChevronRight size={20} color={currentPage >= totalPages ? '#9ca3af' : '#374151'} />
                    </TouchableOpacity>
                </View>
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
                                <View style={styles.inputGroup}>
                                    <Text style={styles.inputLabel}>Mã nhà cung cấp</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Nhập Mã nhà cung cấp"
                                        value={filters.supplierID}
                                        onChangeText={(text) => setFilters({ ...filters, supplierID: text })}
                                    />
                                </View>

                                <View style={styles.inputGroup}>
                                    <Text style={styles.inputLabel}>Số điện thoại</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Nhập Số điện thoại"
                                        value={filters.phone}
                                        onChangeText={(text) => setFilters({ ...filters, phone: text })}
                                        keyboardType="phone-pad"
                                    />
                                </View>

                                <View style={styles.inputGroup}>
                                    <Text style={styles.inputLabel}>Email</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Nhập Email"
                                        value={filters.email}
                                        onChangeText={(text) => setFilters({ ...filters, email: text })}
                                        keyboardType="email-address"
                                    />
                                </View>
                            </View>
                        </ScrollView>
                        <View style={styles.modalFooter}>
                            <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
                                <Text style={styles.resetButtonText}>Đặt lại</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.applyButton} onPress={handleApplyFilter}>
                                <Text style={styles.applyButtonText}>Áp dụng</Text>
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
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
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
    listHeader: {
        paddingHorizontal: 12,
        paddingTop: 16,
        paddingBottom: 8,
    },
    listTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
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
    inputGroup: {
        marginBottom: 16,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '500',
        marginBottom: 6,
        color: '#555',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 6,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 14,
        backgroundColor: '#fff',
    },
    modalFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 'auto',
        paddingTop: 20,
        marginBottom: 15,
    },
    resetButton: {
        padding: 15,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#ddd',
        flex: 1,
        marginRight: 10,
        alignItems: 'center',
        backgroundColor: 'white',
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
