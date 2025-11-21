import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    FlatList,
    StyleSheet,
    ActivityIndicator,
    ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { formatStatusProduct } from '../constants';
import { DefaultLayout } from '../layouts';
import { Archive, ChevronLeft, TriangleAlert } from 'lucide-react-native';
import { fetchProduct, fetchProductById, getProductById, handleFilterProduct } from '../service/product.service';
import ProductDetail from '../components/partials/ProductScreenComponents/ProductDetail';
import ProductEdit from '../components/partials/ProductScreenComponents/ProductEdit';
import ProductImportExportHistory from '../components/partials/ProductScreenComponents/ProductImportExportHistory';
import { getLogByProductID } from '../service/productquantitylog.service';
import CreateProduct from '../components/partials/ProductScreenComponents/CreateProduct';
import parseToken from '../utilities/parseToken';

export default function Product() {
    const [loading, setLoading] = useState(false);
    const [products, setProducts] = useState([]);

    // Filter states
    const [productCode, setProductCode] = useState('');
    const [productName, setProductName] = useState('');
    const [minStock, setMinStock] = useState('');

    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    // open modal detail
    const [openModalDetail, setOpenModalDetail] = useState(null); // product id select
    const [productDetail, setProductDetail] = useState(null);

    // open modal edit
    const [productEdit, setProductEdit] = useState(null);

    // open modal import export history
    const [productImportExportHistory, setProductImportExportHistory] = useState(null);
    const [productHistorySelected, setProductHistorySelected] = useState(null);

    // open modal create product
    const [openModalCreateProduct, setOpenCreateProduct] = useState(false);

    const navigation = useNavigation();

    // Mock data - thay bằng API call thực tế
    useEffect(() => {
        fetchProducts(currentPage);
    }, [currentPage]);

    const fetchProducts = async () => {
        setLoading(true);
        // TODO: Replace with actual API call
        try {
            const res = await fetchProduct(currentPage);
            setProducts(res?.products || []);
            setTotalPages(res?.pagination?.totalPages || 1);
            setLoading(false);
        } catch (err) {
            console.log(err);
            setLoading(false);
        }
    };

    const handleSearch = async (keyword) => {
        // TODO: Implement search logic with filters
        const isNotSearch = keyword.productCode === '' && keyword.productName === '' && keyword.minStock === '';
        if (isNotSearch) return;
        try {
            const result = await handleFilterProduct(keyword);
            setProducts(result.products);
            setTotalPages(result.pagination.totalPages);
            setCurrentPage(1);
        } catch (err) {
            console.log(err);
        }
    };

    const handleReset = () => {
        setProductCode('');
        setProductName('');
        setMinStock('');
        setCurrentPage(1);
        // refetch data product
        fetchProducts(1);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'AVAILABLE':
                return '#4CAF50';
            case 'OUT_OF_STOCK':
                return '#FF9800';
            case 'DISCONTINUED':
                return '#F44336';
            default:
                return '#757575';
        }
    };

    // Pagination handlers
    const handleNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    const handlePrevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    const handlePageClick = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    const renderProductCard = ({ item }) => (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <View style={styles.cardHeaderLeft}>
                    <Text style={styles.productGroup}>{item?.category?.categoryName}</Text>
                    <Text style={styles.productCode}>{item.productID}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
                    <Text style={styles.statusText}>{formatStatusProduct[item.status]}</Text>
                </View>
            </View>

            <Text style={styles.productName}>{item.productName}</Text>

            <View style={styles.cardDetails}>
                <View style={styles.detailItem}>
                    <Archive size={16} color="#666" />
                    <Text style={styles.detailLabel}>Đơn vị tính:</Text>
                    <Text style={styles.detailValue}>{item?.baseUnitProducts?.baseUnitName}</Text>
                </View>
                <View style={styles.detailItem}>
                    <TriangleAlert size={16} color="#FF9800" />
                    <Text style={styles.detailLabel}>Tồn kho tối thiểu:</Text>
                    <Text style={styles.detailValue}>{item.minStock}</Text>
                </View>
            </View>

            <View style={styles.cardActions}>
                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => {
                        setOpenModalDetail(item.productID);
                    }}
                >
                    <Icon name="visibility" size={20} color="#2196F3" />
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => {
                        setProductEdit(item);
                    }}
                >
                    <Icon name="edit" size={20} color="#4CAF50" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton} onPress={() => setProductHistorySelected(item.productID)}>
                    <Icon name="history" size={20} color="#FF9800" />
                </TouchableOpacity>
            </View>
        </View>
    );

    useEffect(() => {
        if (!openModalDetail) return;
        async function getProductDetail(productID) {
            try {
                const res = await getProductById(productID);
                setProductDetail(res);
            } catch (err) {
                console.log(err);
                return;
            }
        }
        getProductDetail(openModalDetail);
    }, [openModalDetail]);

    useEffect(() => {
        if (!productHistorySelected) return;
        async function getProductHistory(productID) {
            try {
                const page = 1;
                const res = await getLogByProductID({ productID, page });
                setProductImportExportHistory(res);
            } catch (err) {
                console.log(err);
                return;
            }
        }
        getProductHistory(productHistorySelected);
    }, [productHistorySelected]);

    return (
        <DefaultLayout>
            <View style={styles.container}>
                {/* Header with Search */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <ChevronLeft size={24} color="black" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Sản phẩm</Text>
                </View>

                <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                    {/* Filter Section */}
                    <View style={styles.filterSection}>
                        <Text style={styles.filterTitle}>Bộ lọc</Text>

                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Mã sản phẩm</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Nhập Mã sản phẩm"
                                value={productCode}
                                onChangeText={setProductCode}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Tên sản phẩm</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Nhập Tên sản phẩm"
                                value={productName}
                                onChangeText={setProductName}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Tồn kho tối thiểu</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Nhập Tồn kho tối thiểu"
                                value={minStock}
                                onChangeText={setMinStock}
                                keyboardType="numeric"
                            />
                        </View>

                        {/* Action Buttons */}
                        <View style={styles.actionButtonsRow}>
                            {/* <TouchableOpacity
                                style={[styles.primaryButton, styles.buttonFlex]}
                                onPress={async () => {
                                    const token = await parseToken('user');
                                    console.log(token);
                                }}
                            >
                                <Icon name="add" size={18} color="#fff" />
                                <Text style={styles.primaryButtonText}>Tạo nhóm SP</Text>
                            </TouchableOpacity> */}
                            <TouchableOpacity
                                style={[styles.primaryButton, styles.buttonFlex]}
                                onPress={() => setOpenCreateProduct(true)}
                            >
                                <Icon name="add" size={18} color="#fff" />
                                <Text style={styles.primaryButtonText}>Tạo SP</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.actionButtonsRow}>
                            <TouchableOpacity
                                style={[styles.secondaryButton, styles.buttonFlex]}
                                onPress={() =>
                                    handleSearch({ productID: productCode, productName, minStock, page: currentPage })
                                }
                            >
                                <Icon name="search" size={18} color="#fff" />
                                <Text style={styles.secondaryButtonText}>Tìm kiếm</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.outlineButton, styles.buttonFlex]} onPress={handleReset}>
                                <Icon name="refresh" size={18} color="#666" />
                                <Text style={styles.outlineButtonText}>Đặt lại</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Product List */}
                    <View style={styles.listSection}>
                        <Text style={styles.listTitle}>Danh sách sản phẩm</Text>

                        {loading ? (
                            <ActivityIndicator size="large" color="#2196F3" style={styles.loader} />
                        ) : (
                            <>
                                {products.length > 0 ? (
                                    <FlatList
                                        data={products}
                                        renderItem={renderProductCard}
                                        keyExtractor={(item, index) => index.toString()}
                                        scrollEnabled={false}
                                        contentContainerStyle={styles.listContainer}
                                    />
                                ) : (
                                    <View style={styles.noProductContainer}>
                                        <Text style={styles.noProductText}>Không có sản phẩm</Text>
                                    </View>
                                )}

                                {/* Pagination Controls */}
                                {totalPages >= 1 && (
                                    <View style={styles.paginationContainer}>
                                        <TouchableOpacity
                                            style={[
                                                styles.paginationButton,
                                                currentPage === 1 && styles.paginationButtonDisabled,
                                            ]}
                                            onPress={handlePrevPage}
                                            disabled={currentPage === 1}
                                        >
                                            <Icon
                                                name="chevron-left"
                                                size={20}
                                                color={currentPage === 1 ? '#ccc' : '#2196F3'}
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
                                                        onPress={() => handlePageClick(pageNumber)}
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
                                            onPress={handleNextPage}
                                            disabled={currentPage === totalPages}
                                        >
                                            <Icon
                                                name="chevron-right"
                                                size={20}
                                                color={currentPage === totalPages ? '#ccc' : '#2196F3'}
                                            />
                                        </TouchableOpacity>
                                    </View>
                                )}
                            </>
                        )}
                    </View>
                </ScrollView>
            </View>
            {productDetail && (
                <ProductDetail
                    isOpen={!!productDetail}
                    onClose={() => {
                        setOpenModalDetail(null);
                        setProductDetail(null);
                    }}
                    productData={productDetail}
                />
            )}
            {productEdit && (
                <ProductEdit
                    isOpen={!!productEdit}
                    onClose={() => {
                        setProductEdit(null);
                    }}
                    productData={productEdit}
                    refetchData={fetchProducts}
                />
            )}
            {productImportExportHistory && (
                <ProductImportExportHistory
                    isOpen={!!productImportExportHistory}
                    onClose={() => {
                        setProductImportExportHistory(null);
                        setProductHistorySelected(null);
                    }}
                    historyData={productImportExportHistory}
                />
            )}
            {openModalCreateProduct && (
                <CreateProduct
                    isOpen={!!openModalCreateProduct}
                    onClose={() => {
                        setOpenCreateProduct(false);
                    }}
                    refetchData={fetchProducts}
                />
            )}
        </DefaultLayout>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
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
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
        borderRadius: 8,
        paddingHorizontal: 12,
        height: 40,
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        fontSize: 14,
        color: '#333',
    },
    content: {
        flex: 1,
    },
    filterSection: {
        backgroundColor: '#fff',
        padding: 16,
        marginTop: 8,
        marginBottom: 8,
    },
    filterTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 16,
        color: '#333',
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
    actionButtonsRow: {
        flexDirection: 'row',
        gap: 10,
        marginBottom: 10,
    },
    buttonFlex: {
        flex: 1,
    },
    primaryButton: {
        backgroundColor: '#000',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderRadius: 6,
        gap: 6,
    },
    primaryButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
    secondaryButton: {
        backgroundColor: '#2196F3',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderRadius: 6,
        gap: 6,
    },
    secondaryButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
    outlineButton: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#ddd',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderRadius: 6,
        gap: 6,
    },
    outlineButtonText: {
        color: '#666',
        fontSize: 14,
        fontWeight: '600',
    },
    listSection: {
        backgroundColor: '#fff',
        padding: 16,
        marginBottom: 16,
    },
    listTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 16,
        color: '#333',
    },
    loader: {
        marginTop: 32,
    },
    listContainer: {
        gap: 12,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 16,
        borderWidth: 1,
        borderColor: '#e0e0e0',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    cardHeaderLeft: {
        flex: 1,
    },
    productGroup: {
        fontSize: 12,
        color: '#999',
        marginBottom: 2,
    },
    productCode: {
        fontSize: 14,
        fontWeight: '600',
        color: '#2196F3',
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    statusText: {
        color: '#fff',
        fontSize: 11,
        fontWeight: '600',
    },
    productName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 12,
    },
    cardDetails: {
        gap: 8,
        marginBottom: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    detailItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    detailLabel: {
        fontSize: 13,
        color: '#666',
    },
    detailValue: {
        fontSize: 13,
        fontWeight: '600',
        color: '#333',
    },
    cardActions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 16,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
    },
    actionButton: {
        padding: 8,
    },
    paginationContainer: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 20,
        paddingVertical: 10,
        gap: 10,
    },
    paginationButton: {
        padding: 8,
        borderRadius: 6,
        //backgroundColor: '#f5f5f5',
        minWidth: 36,
        minHeight: 36,
        justifyContent: 'center',
        alignItems: 'center',
    },
    paginationButtonDisabled: {
        //backgroundColor: '#f9f9f9',
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
        backgroundColor: '#2196F3',
    },
    pageNumberText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#666',
    },
    pageNumberTextActive: {
        color: '#fff',
    },
    noProductContainer: {
        flex: 1,
        height: 100,
        justifyContent: 'center',
        alignItems: 'center',
    },
    noProductText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#666',
    },
});
