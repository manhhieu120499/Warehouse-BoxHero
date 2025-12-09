import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    Alert,
    KeyboardAvoidingView,
    Platform,
    FlatList,
    Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { DefaultLayout } from '../layouts';
import Header from '../layouts/Header';
import { generateCode } from '../utilities/generate';
import { getProductById, getProductCanExportById } from '../service/product.service';
import parseToken from '../utilities/parseToken';
import { useSelector } from 'react-redux';
import { Dropdown } from 'react-native-element-dropdown';
import { getAllCustomer, getCustomerNotPagination } from '../service/customer.service';
import { createOrderReleaseProposal, updateStatusOrderReleaseProposal } from '../service/proposal.service';
import { authIsAdmin } from '../common';

export default function CreateProposalRelease({ route }) {
    const navigation = useNavigation();
    const { proposalData } = route?.params || {};
    const isViewMode = !!proposalData;

    //log
    console.log('proposalData', proposalData);

    // Form State
    const [proposalCode, setProposalCode] = useState('');
    const [createdDate, setCreatedDate] = useState(new Date().toLocaleDateString('en-US')); // MM/DD/YYYY format as in image
    const [warehouse, setWarehouse] = useState(''); // Mock data
    const creator = useSelector((state) => state.AuthSlice.user); // Mock data
    const [customerCode, setCustomerCode] = useState('');
    const [customerName, setCustomerName] = useState('');
    const [note, setNote] = useState('');
    const [customerList, setCustomerList] = useState([]);

    useEffect(() => {
        (async function getWarehouse() {
            const warehouse = await parseToken('warehouse');
            setWarehouse(warehouse);
        })();
    }, []);

    useEffect(() => {
        const fetchCustomers = async () => {
            try {
                const res = await getCustomerNotPagination(); // Fetch first page or all if API supports
                if (res && res.data) {
                    setCustomerList(res.data);
                }
            } catch (error) {
                console.log('Error fetching customers:', error);
            }
        };
        fetchCustomers();
    }, []);

    useEffect(() => {
        if (isViewMode && proposalData) {
            setProposalCode(proposalData.orderReleaseProposalID);
            setCreatedDate(new Date(proposalData.createdAt).toLocaleDateString('en-US'));
            setCustomerCode(proposalData.customerID);
            setCustomerName(proposalData.customer.customerName);
            setNote(proposalData.note);
            // Map proposal details to selectedProducts format
            if (proposalData.orderReleaseProposalDetails) {
                const products = proposalData.orderReleaseProposalDetails.map((detail) => ({
                    productID: detail.productID,
                    productName: detail.productName,
                    note: detail.note,
                    image: detail?.product?.image || '',
                }));
                setSelectedProducts(products);
            }
        }
    }, [isViewMode, proposalData]);

    // Product List State
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedProducts, setSelectedProducts] = useState([]);

    const handleGenerateCode = () => {
        const code = generateCode('PDX-XK-'); // Proposal Release prefix
        setProposalCode(code);
    };

    const handleReset = () => {
        setProposalCode('');
        setCustomerCode('');
        setCustomerName('');
        setNote('');
        setSelectedProducts([]);
        setSearchQuery('');
    };

    const handleSubmit = async () => {
        if (!proposalCode) {
            Alert.alert('Thông báo', 'Vui lòng tạo mã phiếu');
            return;
        }
        if (!customerCode) {
            Alert.alert('Thông báo', 'Vui lòng chọn khách hàng');
            return;
        }
        if (!selectedProducts.length) {
            Alert.alert('Thông báo', 'Vui lòng chọn sản phẩm');
            return;
        }
        // Call API...
        try {
            const res = await createOrderReleaseProposal({
                orderReleaseProposalID: proposalCode,
                warehouseID: warehouse.warehouseID,
                employeeIDCreate: creator.employeeID,
                customerID: customerCode,
                note: note,
                orderReleaseProposalDetails: selectedProducts.map((it) => ({
                    productID: it.productID,
                    productName: it.productName,
                    note: it.note,
                })),
                status: 'PENDING',
            });
            if (res.data.status === 'OK') {
                Alert.alert('Thông báo', 'Tạo phiếu đề xuất xuất kho thành công');
                navigation.goBack();
            }
        } catch (err) {
            console.log(err);
            return;
        }
    };

    const handleScanCode = () => {
        Alert.alert('Thông báo', 'Tính năng quét mã đang được phát triển');
    };

    const handleSearchProduct = async () => {
        try {
            if (!searchQuery) return;
            const checkExist = selectedProducts.find((item) => item.productID === searchQuery);
            if (checkExist) {
                Alert.alert('Thông báo', 'Sản phẩm đã tồn tại trong danh sách');
                return;
            }
            const warehouse = await parseToken('warehouse');
            const res = await getProductCanExportById(searchQuery, warehouse.warehouseID);
            if (res) {
                setSelectedProducts([...selectedProducts, res]);
            }
        } catch (err) {
            console.log(err);
            return;
        }
    };

    const handleApproveProposal = async (proposalID, status) => {
        try {
            const res = await updateStatusOrderReleaseProposal({
                orderReleaseProposalID: proposalID,
                employeeIDApproval: creator.employeeID,
                status: status,
            });
            if (res && res.data.status === 'OK') {
                Alert.alert('Thông báo', status === 'COMPLETED' ? 'Đã phê duyệt phiếu' : 'Đã từ chối phiếu');
                navigation.goBack();
            }
        } catch (error) {
            console.error('Error approving proposal:', error);
            Alert.alert('Lỗi', 'Có lỗi xảy ra khi cập nhật trạng thái');
        }
    };

    const renderHeader = () => (
        <View style={styles.headerContainer}>
            {/* General Info Section */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Thông tin chung</Text>

                {/* Proposal Code */}
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Mã phiếu</Text>
                    <View style={styles.rowInput}>
                        <TextInput
                            style={[styles.input, { flex: 1, marginRight: 8 }, isViewMode && styles.readOnlyInput]}
                            placeholder="Tạo mã phiếu"
                            value={proposalCode}
                            onChangeText={setProposalCode}
                            editable={!isViewMode}
                        />
                        {!isViewMode && (
                            <TouchableOpacity
                                style={[styles.blackButton, { opacity: !!proposalCode ? 0.5 : 1 }]}
                                onPress={handleGenerateCode}
                                disabled={!!proposalCode}
                            >
                                <Text style={styles.buttonTextWhite}>Tạo mã phiếu</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>

                {/* Date & Warehouse */}
                <View style={styles.rowContainer}>
                    <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                        <Text style={styles.label}>Ngày tạo phiếu</Text>
                        <TextInput style={[styles.input, styles.readOnlyInput]} value={createdDate} editable={false} />
                    </View>
                    <View style={[styles.inputGroup, { flex: 1 }]}>
                        <Text style={styles.label}>Kho xuất</Text>
                        <TextInput
                            style={[styles.input, styles.readOnlyInput]}
                            value={warehouse?.warehouseName || ''}
                            editable={false}
                        />
                    </View>
                </View>

                {/* Creator & Customer Code */}
                <View style={styles.rowContainer}>
                    <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                        <Text style={styles.label}>Người lập phiếu</Text>
                        <TextInput
                            style={[styles.input, styles.readOnlyInput]}
                            value={creator?.employeeName}
                            editable={false}
                        />
                    </View>
                    <View style={[styles.inputGroup, { flex: 1 }]}>
                        <Text style={styles.label}>Mã khách hàng</Text>
                        {isViewMode ? (
                            <TextInput
                                style={[styles.input, styles.readOnlyInput]}
                                value={customerCode}
                                editable={false}
                            />
                        ) : (
                            <Dropdown
                                style={styles.dropdown}
                                placeholderStyle={styles.placeholderStyle}
                                selectedTextStyle={styles.selectedTextStyle}
                                inputSearchStyle={styles.inputSearchStyle}
                                iconStyle={styles.iconStyle}
                                data={customerList}
                                search
                                maxHeight={300}
                                labelField="customerID"
                                valueField="customerID"
                                placeholder="Chọn mã KH"
                                searchPlaceholder="Tìm kiếm..."
                                value={customerCode}
                                onChange={(item) => {
                                    setCustomerCode(item.customerID);
                                    setCustomerName(item.customerName);
                                }}
                            />
                        )}
                    </View>
                </View>

                {/* Customer Name */}
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Tên khách hàng</Text>
                    <TextInput
                        style={[styles.input, styles.readOnlyInput]}
                        placeholder="Tên khách hàng"
                        value={customerName}
                        editable={false}
                    />
                </View>

                {/* Note */}
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Ghi chú</Text>
                    <TextInput
                        style={[styles.input, styles.textArea, isViewMode && styles.readOnlyInput]}
                        placeholder="Nhập bổ sung, trả hàng NCC, nhập khuyến mãi..."
                        value={note}
                        onChangeText={setNote}
                        multiline
                        numberOfLines={3}
                        textAlignVertical="top"
                        editable={!isViewMode}
                    />
                </View>
            </View>

            {/* Product List Header */}
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Danh sách hàng hóa đề xuất xuất</Text>
            </View>

            {/* Search Product */}
            {!isViewMode && (
                <View style={styles.searchContainer}>
                    <TextInput
                        style={[styles.input, { flex: 1, marginRight: 8 }]}
                        placeholder="Nhập mã sản phẩm"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                    <TouchableOpacity style={[styles.blackButton, { marginRight: 8 }]} onPress={handleScanCode}>
                        <Ionicons name="qr-code-outline" size={20} color="#fff" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.blackButton} onPress={handleSearchProduct}>
                        <Ionicons name="search-outline" size={20} color="#fff" />
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );

    const handleRemoveProduct = (indexToRemove) => {
        setSelectedProducts((prev) => prev.filter((_, index) => index !== indexToRemove));
    };

    const renderProductItem = ({ item, index }) => (
        <View style={styles.productCard}>
            <Image source={{ uri: item.image || 'https://via.placeholder.com/100' }} style={styles.productImage} />
            <View style={styles.productInfo}>
                <View style={styles.productHeader}>
                    <Text style={styles.productName}>{item.productName || 'Tên sản phẩm'}</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Text style={styles.productIndex}>#{index + 1}</Text>
                        {!isViewMode && (
                            <TouchableOpacity style={styles.removeButton} onPress={() => handleRemoveProduct(index)}>
                                <Ionicons name="close-circle" size={20} color="#ef4444" />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
                <Text style={styles.productCode}>Mã: {item.productID || '---'}</Text>
                <Text style={styles.productNote} numberOfLines={2}>
                    Ghi chú: {item.note || 'Không có ghi chú'}
                </Text>
            </View>
        </View>
    );

    return (
        <DefaultLayout>
            <Header
                title={isViewMode ? 'Chi tiết phiếu đề xuất xuất' : 'Phiếu đề xuất xuất kho'}
                leftIcon="arrow-back"
                handleOnPressLeftIcon={() => navigation.goBack()}
            />

            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
                <FlatList
                    data={selectedProducts}
                    renderItem={renderProductItem}
                    keyExtractor={(item, index) => index.toString()}
                    ListHeaderComponent={renderHeader()}
                    ListEmptyComponent={
                        <View style={styles.emptyState}>
                            <Ionicons name="cube-outline" size={48} color="#9ca3af" />
                            <Text style={styles.emptyText}>Chưa có sản phẩm nào</Text>
                        </View>
                    }
                    contentContainerStyle={styles.listContent}
                    ListFooterComponent={
                        <View style={styles.summaryContainer}>
                            <View style={styles.summaryBadge}>
                                <Text style={styles.summaryLabel}>Số mặt hàng:</Text>
                                <Text style={styles.summaryValue}>{selectedProducts.length}</Text>
                            </View>
                        </View>
                    }
                />
            </KeyboardAvoidingView>

            {/* Bottom Actions */}
            {/* Bottom Actions */}
            {!isViewMode ? (
                <View style={styles.bottomActions}>
                    <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
                        <Text style={styles.resetButtonText}>Làm mới</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
                        <Text style={styles.submitButtonText}>Gửi phê duyệt</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                proposalData?.status === 'PENDING' &&
                authIsAdmin(creator) && (
                    <View style={styles.bottomActions}>
                        <TouchableOpacity
                            style={styles.rejectButton}
                            onPress={() => handleApproveProposal(proposalData.orderReleaseProposalID, 'REFUSE')}
                        >
                            <Text style={styles.rejectButtonText}>Từ chối</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.approveButton}
                            onPress={() => handleApproveProposal(proposalData.orderReleaseProposalID, 'COMPLETED')}
                        >
                            <Text style={styles.approveButtonText}>Phê duyệt</Text>
                        </TouchableOpacity>
                    </View>
                )
            )}
        </DefaultLayout>
    );
}

const styles = StyleSheet.create({
    headerContainer: {
        padding: 16,
        paddingBottom: 0,
    },
    listContent: {
        paddingBottom: 100,
    },
    section: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
        paddingHorizontal: 16,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1f2937',
        marginBottom: 12,
    },
    inputGroup: {
        marginBottom: 12,
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
        color: '#374151',
        marginBottom: 6,
    },
    input: {
        borderWidth: 1,
        borderColor: '#d1d5db',
        borderRadius: 8,
        padding: 10,
        fontSize: 14,
        color: '#1f2937',
        backgroundColor: '#fff',
    },
    readOnlyInput: {
        backgroundColor: '#f9fafb',
        color: '#6b7280',
    },
    textArea: {
        height: 80,
    },
    rowInput: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    rowContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    blackButton: {
        backgroundColor: '#1f2937',
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonTextWhite: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 14,
    },
    searchContainer: {
        flexDirection: 'row',
        marginBottom: 16,
        paddingHorizontal: 16,
    },
    // Product Card Styles
    productCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 12,
        marginHorizontal: 16,
        marginBottom: 12,
        flexDirection: 'row',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    productImage: {
        width: 80,
        height: 80,
        borderRadius: 8,
        backgroundColor: '#f3f4f6',
    },
    productInfo: {
        flex: 1,
        marginLeft: 12,
        justifyContent: 'center',
    },
    productHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 4,
    },
    productName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1f2937',
        flex: 1,
        marginRight: 8,
    },
    productIndex: {
        fontSize: 12,
        color: '#6b7280',
        backgroundColor: '#f3f4f6',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    productCode: {
        fontSize: 14,
        color: '#4b5563',
        marginBottom: 4,
    },
    productNote: {
        fontSize: 13,
        color: '#6b7280',
        fontStyle: 'italic',
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: 40,
    },
    emptyText: {
        marginTop: 12,
        color: '#9ca3af',
        fontSize: 14,
    },
    summaryContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        padding: 16,
        backgroundColor: '#fff',
        marginHorizontal: 16,
        borderRadius: 12,
        marginBottom: 16,
        gap: 12,
    },
    summaryBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f3f4f6',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 20,
    },
    summaryBadgeBlue: {
        backgroundColor: '#eff6ff',
    },
    summaryLabel: {
        fontSize: 13,
        color: '#6b7280',
        marginRight: 6,
    },
    summaryValue: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#1f2937',
    },
    summaryValueBlue: {
        color: '#2563eb',
    },
    bottomActions: {
        flexDirection: 'row',
        padding: 24,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#e5e7eb',
    },
    resetButton: {
        flex: 1,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#d1d5db',
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
        marginRight: 8,
    },
    resetButtonText: {
        color: '#374151',
        fontWeight: '600',
        fontSize: 16,
    },
    submitButton: {
        flex: 1,
        backgroundColor: '#3b82f6',
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
        marginLeft: 8,
    },
    submitButtonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 16,
    },
    removeButton: {
        marginLeft: 8,
        padding: 4,
    },
    dropdown: {
        height: 40,
        borderColor: '#d1d5db',
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 8,
        backgroundColor: '#fff',
    },
    placeholderStyle: {
        fontSize: 14,
        color: '#9ca3af',
    },
    selectedTextStyle: {
        fontSize: 14,
        color: '#1f2937',
    },
    iconStyle: {
        width: 20,
        height: 20,
    },
    inputSearchStyle: {
        height: 40,
        fontSize: 14,
    },
    approveButton: {
        flex: 1,
        backgroundColor: '#10b981',
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
        marginLeft: 8,
    },
    approveButtonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 16,
    },
    rejectButton: {
        flex: 1,
        backgroundColor: '#ef4444',
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
        marginRight: 8,
    },
    rejectButtonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 16,
    },
});
