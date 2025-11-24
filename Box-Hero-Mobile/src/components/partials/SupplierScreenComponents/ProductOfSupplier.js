import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Modal from '../../Modal';
import Button from '../../Button';
import { formatStatusProduct } from '../../../constants';

/**
 * ProductOfSupplier Component
 * Displays list of products from a specific supplier
 *
 * @param {boolean} isOpen - Controls modal visibility
 * @param {function} onClose - Callback when modal closes
 * @param {object} supplierData - Supplier information
 * @param {array} products - List of products from this supplier
 */
const ProductOfSupplier = ({ isOpen, onClose, supplierData, products = [], refetchData }) => {
    const [refreshing, setRefreshing] = useState(false);
    const [productList, setProductList] = useState([]);

    useEffect(() => {
        if (products && products.length > 0) {
            setProductList(products);
        }
    }, [products]);

    const handleRefresh = async () => {
        setRefreshing(true);
        // TODO: Fetch products from API
        await refetchData(supplierData?.supplierID);
        setRefreshing(false);
    };

    const handleViewProduct = (product) => {
        console.log('View product:', product);
        // TODO: Navigate to product detail or open detail modal
    };

    const renderProductCard = ({ item, index }) => (
        <View style={styles.card}>
            {/* Card Header */}
            <View style={styles.cardHeader}>
                <View style={styles.productCodeContainer}>
                    <Icon name="inventory-2" size={16} color="#ffffff" />
                    <Text style={styles.productCode}>{item.productID || `SP${index + 1}`}</Text>
                </View>
                <TouchableOpacity style={styles.viewButton} onPress={() => handleViewProduct(item)}>
                    <Icon name="visibility" size={18} color="#ffffff" />
                </TouchableOpacity>
            </View>

            {/* Card Content */}
            <View style={styles.cardContent}>
                {/* Category */}
                <View style={styles.infoRow}>
                    <Icon name="category" size={18} color="#6b7280" />
                    <Text style={styles.infoLabel}>Mã nhóm SP:</Text>
                    <Text style={styles.infoValue}>{item.categoryID || 'N/A'}</Text>
                </View>

                {/* Product Name */}
                <View style={styles.infoRow}>
                    <Icon name="shopping-bag" size={18} color="#6b7280" />
                    <Text style={styles.infoLabel}>Tên sản phẩm:</Text>
                    <Text style={styles.infoValue} numberOfLines={2}>
                        {item.productName || 'Chưa có tên'}
                    </Text>
                </View>

                {/* Description */}
                <View style={styles.infoRow}>
                    <Icon name="description" size={18} color="#6b7280" />
                    <Text style={styles.infoLabel}>Mô tả:</Text>
                    <Text style={styles.infoValue} numberOfLines={2}>
                        {item.description || 'Không có mô tả'}
                    </Text>
                </View>

                {/* Status */}
                <View style={styles.infoRow}>
                    <Icon
                        name="toggle-on"
                        size={18}
                        color={formatStatusProduct[item.status] === 'Đang kinh doanh' ? '#22c55e' : '#ef4444'}
                    />
                    <Text style={styles.infoLabel}>Trạng thái:</Text>
                    <View
                        style={[
                            styles.statusBadge,
                            {
                                backgroundColor:
                                    formatStatusProduct[item.status] === 'Đang kinh doanh' ? '#22c55e' : '#ef4444',
                            },
                        ]}
                    >
                        <Text style={styles.statusText}>{formatStatusProduct[item.status] || 'N/A'}</Text>
                    </View>
                </View>
            </View>
        </View>
    );

    const renderEmptyList = () => (
        <View style={styles.emptyContainer}>
            <Icon name="inventory" size={60} color="#d1d5db" />
            <Text style={styles.emptyText}>Không có sản phẩm nào</Text>
            <Text style={styles.emptySubtext}>Nhà cung cấp này chưa có sản phẩm nào</Text>
        </View>
    );

    const renderHeader = () => (
        <View style={styles.listHeader}>
            <Icon name="store" size={20} color="#374151" />
            <Text style={styles.listHeaderText}>Danh sách sản phẩm thuộc về nhà cung cấp</Text>
        </View>
    );

    return (
        <Modal
            isOpenInfo={isOpen}
            onClose={onClose}
            showButtonClose={false}
            arrButton={[
                (index) => (
                    <Button key={index} outline medium borderRadiusSmall onPress={onClose}>
                        Đóng
                    </Button>
                ),
            ]}
        >
            <View style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.headerIconContainer}>
                        <Icon name="business" size={24} color="#60a5fa" />
                    </View>
                    <View style={styles.headerTextContainer}>
                        <Text style={styles.title}>{supplierData?.supplierName || 'Nhà cung cấp'}</Text>
                        <Text style={styles.subtitle}>Mã NCC: {supplierData?.supplierID || 'N/A'}</Text>
                    </View>
                </View>

                {/* Product List */}
                <FlatList
                    data={productList}
                    renderItem={renderProductCard}
                    keyExtractor={(item, index) => item.productID || `product-${index}`}
                    ListHeaderComponent={renderHeader}
                    ListEmptyComponent={renderEmptyList}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.listContent}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
                />
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        maxHeight: '90%',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingBottom: 12,
        marginBottom: 12,
        borderBottomWidth: 2,
        borderBottomColor: '#e5e7eb',
    },
    headerIconContainer: {
        width: 44,
        height: 44,
        borderRadius: 10,
        backgroundColor: '#eff6ff',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    headerTextContainer: {
        flex: 1,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#111827',
        marginBottom: 3,
    },
    subtitle: {
        fontSize: 12,
        color: '#6b7280',
        lineHeight: 16,
    },
    listHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingVertical: 8,
        paddingHorizontal: 4,
        marginBottom: 8,
    },
    listHeaderText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
    },
    listContent: {
        paddingBottom: 5,
    },
    card: {
        backgroundColor: '#ffffff',
        borderRadius: 8,
        marginBottom: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
        overflow: 'hidden',
        borderColor: '#e5e7eb',
        borderWidth: 1,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#60a5fa',
        paddingHorizontal: 12,
        paddingVertical: 10,
    },
    productCodeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    productCode: {
        color: '#ffffff',
        fontSize: 14,
        fontWeight: '600',
    },
    viewButton: {
        padding: 4,
    },
    cardContent: {
        padding: 12,
        gap: 10,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
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
        fontWeight: '400',
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#ffffff',
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
    },
    emptyText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#6b7280',
        marginTop: 12,
    },
    emptySubtext: {
        fontSize: 13,
        color: '#9ca3af',
        marginTop: 4,
    },
});

export default ProductOfSupplier;
