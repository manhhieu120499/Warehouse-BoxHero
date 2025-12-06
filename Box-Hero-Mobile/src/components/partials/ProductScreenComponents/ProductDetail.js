import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Dimensions } from 'react-native';
import Modal from '../../Modal';
import { COLORS } from '../../style/Globalstyle';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { formatDate } from '../../../utilities/formatDate';

const { width } = Dimensions.get('window');

const ProductDetail = ({ isOpen, onClose, productData }) => {
    const [currentPage, setCurrentPage] = useState(1);

    console.log('product ', productData);

    const product = {
        productImage: productData?.image,
        productCode: productData?.categoryID,
        productID: productData?.productID,
        description: productData?.description,
        baseUnit: productData?.baseUnitProducts?.baseUnitName,
        productName: productData?.productName,
        totalStock: productData?.amount,
        batches: productData?.batches?.map((batch) => ({
            batchCode: batch?.batchID,
            importDate: formatDate(batch?.createdAt),
            manufactureDate: formatDate(batch?.manufactureDate),
            expiryDate: formatDate(batch?.expiryDate),
            importQuantity: batch?.importAmount,
            stockQuantity: batch?.remainAmount,
            importUnit: batch?.unitName,
            totalProducts: batch?.totalProductRemain,
            location: batch?.locationBatch?.map((loca) => loca?.location) || [],
            warehouseCode: batch?.warehouseID,
        })),
    };

    const itemsPerPage = 3;
    const totalPages = Math.ceil((product.batches?.length || 0) / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentBatches = product.batches?.slice(startIndex, endIndex) || [];

    const handleQRCode = () => {
        // Handle QR code generation
        console.log('Generate QR Code');
    };

    const renderPagination = () => {
        if (totalPages <= 1) return null;

        return (
            <View style={styles.paginationContainer}>
                <TouchableOpacity
                    style={[styles.paginationButton, currentPage === 1 && styles.paginationButtonDisabled]}
                    onPress={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                >
                    <Icon name="chevron-left" size={20} color={currentPage === 1 ? COLORS.gray : COLORS.primary} />
                </TouchableOpacity>

                {[...Array(totalPages)].map((_, index) => (
                    <TouchableOpacity
                        key={index}
                        style={[styles.pageNumberButton, currentPage === index + 1 && styles.pageNumberButtonActive]}
                        onPress={() => setCurrentPage(index + 1)}
                    >
                        <Text style={[styles.pageNumberText, currentPage === index + 1 && styles.pageNumberTextActive]}>
                            {index + 1}
                        </Text>
                    </TouchableOpacity>
                ))}

                <TouchableOpacity
                    style={[styles.paginationButton, currentPage === totalPages && styles.paginationButtonDisabled]}
                    onPress={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                >
                    <Icon
                        name="chevron-right"
                        size={20}
                        color={currentPage === totalPages ? COLORS.gray : COLORS.primary}
                    />
                </TouchableOpacity>
            </View>
        );
    };

    return (
        <Modal isOpenInfo={isOpen} onClose={onClose} showButtonClose={true} arrButton={[]}>
            <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Chi tiết sản phẩm</Text>
                    {/* <TouchableOpacity style={styles.qrButton} onPress={handleQRCode}>
                        <Icon name="qrcode" size={20} color={COLORS.white} />
                        <Text style={styles.qrButtonText}>QR Code</Text>
                    </TouchableOpacity> */}
                </View>

                {/* Product Info Section */}
                <View style={styles.infoCard}>
                    {/* Product Image */}
                    <View style={styles.imageWrapper}>
                        {product.productImage ? (
                            <Image source={{ uri: product.productImage }} style={styles.productImage} />
                        ) : (
                            <View style={styles.placeholderImage}>
                                <Icon name="image-outline" size={50} color="#9ca3af" />
                            </View>
                        )}
                    </View>

                    <Text style={styles.productNameTitle}>{product.productName}</Text>
                    <Text style={styles.productIDSubtitle}>{product.productID}</Text>

                    <View style={styles.divider} />

                    <View style={styles.gridContainer}>
                        <View style={styles.gridItem}>
                            <View style={styles.iconCircle}>
                                <Icon name="shape-outline" size={20} color="#2563eb" />
                            </View>
                            <View style={styles.gridTextContainer}>
                                <Text style={styles.gridLabel}>Nhóm hàng</Text>
                                <Text style={styles.gridValue}>{product.productCode || '---'}</Text>
                            </View>
                        </View>

                        <View style={styles.gridItem}>
                            <View style={styles.iconCircle}>
                                <Icon name="ruler-square" size={20} color="#2563eb" />
                            </View>
                            <View style={styles.gridTextContainer}>
                                <Text style={styles.gridLabel}>Đơn vị tính</Text>
                                <Text style={styles.gridValue}>{product.baseUnit || '---'}</Text>
                            </View>
                        </View>

                        <View style={styles.gridItem}>
                            <View style={styles.iconCircle}>
                                <Icon name="package-variant-closed" size={20} color="#2563eb" />
                            </View>
                            <View style={styles.gridTextContainer}>
                                <Text style={styles.gridLabel}>Tồn kho</Text>
                                <Text style={[styles.gridValue, { color: '#2563eb', fontWeight: 'bold' }]}>
                                    {product.totalStock}
                                </Text>
                            </View>
                        </View>
                    </View>

                    {product.description ? (
                        <View style={styles.descriptionBox}>
                            <Text style={styles.descriptionLabel}>Mô tả:</Text>
                            <Text style={styles.descriptionText}>{product.description}</Text>
                        </View>
                    ) : null}
                </View>

                {/* Batch List Section */}
                <View style={styles.batchSection}>
                    <Text style={styles.sectionTitle}>Danh sách lô hàng</Text>

                    {/* Batch List */}
                    {currentBatches && currentBatches.length > 0 ? (
                        currentBatches.map((batch, index) => (
                            <View key={index} style={styles.batchCard}>
                                <View style={styles.batchHeader}>
                                    <Text style={styles.batchTitle}>Lô: {batch.batchCode}</Text>
                                    <Text style={styles.batchWarehouse}>{batch.warehouseCode}</Text>
                                </View>

                                <View style={styles.batchBody}>
                                    <View style={styles.batchRow}>
                                        <View style={styles.batchCol}>
                                            <Text style={styles.batchLabel}>Ngày nhập:</Text>
                                            <Text style={styles.batchValue}>{batch.importDate}</Text>
                                        </View>
                                        <View style={styles.batchCol}>
                                            <Text style={styles.batchLabel}>Hạn sử dụng:</Text>
                                            <Text style={styles.batchValue}>{batch.expiryDate}</Text>
                                        </View>
                                    </View>

                                    <View style={styles.batchRow}>
                                        <View style={styles.batchCol}>
                                            <Text style={styles.batchLabel}>Ngày sản xuất:</Text>
                                            <Text style={styles.batchValue}>{batch.manufactureDate}</Text>
                                        </View>
                                        <View style={styles.batchCol}>
                                            <Text style={styles.batchLabel}>Đơn vị:</Text>
                                            <Text style={styles.batchValue}>{batch.importUnit}</Text>
                                        </View>
                                    </View>

                                    <View style={styles.batchRow}>
                                        <View style={styles.batchCol}>
                                            <Text style={styles.batchLabel}>SL nhập:</Text>
                                            <Text style={styles.batchValue}>{batch.importQuantity}</Text>
                                        </View>
                                        <View style={styles.batchCol}>
                                            <Text style={styles.batchLabel}>SL tồn:</Text>
                                            <Text style={[styles.batchValue, { color: '#2563eb', fontWeight: 'bold' }]}>
                                                {batch.stockQuantity}
                                            </Text>
                                        </View>
                                    </View>

                                    <View style={styles.batchRow}>
                                        <View style={styles.batchCol}>
                                            <Text style={styles.batchLabel}>Tổng SP:</Text>
                                            <Text style={styles.batchValue}>{batch.totalProducts}</Text>
                                        </View>
                                    </View>

                                    <View style={styles.batchLocation}>
                                        <Text style={styles.batchLabel}>Vị trí:</Text>
                                        <View style={styles.locationTags}>
                                            {batch.location && batch.location.length > 0 ? (
                                                batch.location.map((loc, idx) => (
                                                    <View key={idx} style={styles.locationTag}>
                                                        <Text style={styles.locationText}>{loc}</Text>
                                                    </View>
                                                ))
                                            ) : (
                                                <Text style={{ fontSize: 13, color: '#9ca3af', fontStyle: 'italic' }}>
                                                    Chưa cập nhật
                                                </Text>
                                            )}
                                        </View>
                                    </View>
                                </View>
                            </View>
                        ))
                    ) : (
                        <View style={styles.emptyBatchContainer}>
                            <Text style={styles.emptyBatchText}>Không có lô hàng nào</Text>
                        </View>
                    )}

                    {/* Pagination */}
                    {renderPagination()}
                </View>
            </ScrollView>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        maxHeight: Dimensions.get('window').height * 0.8,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
        paddingBottom: 15,
        borderBottomWidth: 1,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: 'black',
    },
    qrButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'black',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 4,
    },
    qrButtonText: {
        color: COLORS.white,
        marginLeft: 5,
        fontSize: 12,
        fontWeight: '500',
    },
    infoCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#e5e7eb',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
        alignItems: 'center',
    },
    imageWrapper: {
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 5,
        backgroundColor: '#fff',
        borderRadius: 12,
    },
    productImage: {
        width: 140,
        height: 140,
        borderRadius: 12,
        resizeMode: 'cover',
    },
    placeholderImage: {
        width: 140,
        height: 140,
        borderRadius: 12,
        backgroundColor: '#f3f4f6',
        justifyContent: 'center',
        alignItems: 'center',
    },
    productNameTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1f2937',
        textAlign: 'center',
        marginBottom: 4,
    },
    productIDSubtitle: {
        fontSize: 14,
        color: '#6b7280',
        marginBottom: 16,
    },
    divider: {
        height: 1,
        backgroundColor: '#e5e7eb',
        width: '100%',
        marginBottom: 16,
    },
    gridContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        width: '100%',
        justifyContent: 'space-between',
    },
    gridItem: {
        width: '48%',
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        backgroundColor: '#f9fafb',
        padding: 10,
        borderRadius: 8,
    },
    iconCircle: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#eff6ff',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    gridTextContainer: {
        flex: 1,
    },
    gridLabel: {
        fontSize: 11,
        color: '#6b7280',
        marginBottom: 2,
    },
    gridValue: {
        fontSize: 13,
        fontWeight: '600',
        color: '#1f2937',
    },
    descriptionBox: {
        width: '100%',
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#e5e7eb',
        borderRadius: 8,
        padding: 12,
        marginTop: 4,
    },
    descriptionLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 4,
    },
    descriptionText: {
        fontSize: 13,
        color: '#4b5563',
        lineHeight: 20,
    },
    batchSection: {
        marginTop: 10,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: 'black',
        marginBottom: 10,
    },
    batchCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#e5e7eb',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    batchHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
        paddingBottom: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#f3f4f6',
    },
    batchTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1f2937',
    },
    batchWarehouse: {
        fontSize: 12,
        color: '#6b7280',
        backgroundColor: '#f3f4f6',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    batchBody: {
        gap: 8,
    },
    batchRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    batchCol: {
        flex: 1,
    },
    batchLabel: {
        fontSize: 12,
        color: '#6b7280',
        marginBottom: 2,
    },
    batchValue: {
        fontSize: 14,
        color: '#1f2937',
        fontWeight: '500',
    },
    batchLocation: {
        marginTop: 4,
    },
    locationTags: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 6,
        marginTop: 4,
    },
    locationTag: {
        backgroundColor: '#eff6ff',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: '#bfdbfe',
    },
    locationText: {
        fontSize: 12,
        color: '#1e40af',
        fontWeight: '500',
    },
    paginationContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 15,
        paddingVertical: 10,
    },
    paginationButton: {
        padding: 8,
        marginHorizontal: 5,
    },
    paginationButtonDisabled: {
        opacity: 0.3,
    },
    pageNumberButton: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        marginHorizontal: 3,
        borderRadius: 4,
        borderWidth: 1,
        backgroundColor: 'white',
    },
    pageNumberButtonActive: {
        backgroundColor: COLORS.activePagination,
        borderColor: 'black',
    },
    pageNumberText: {
        fontSize: 14,
        color: 'black',
    },
    pageNumberTextActive: {
        color: 'white',
        fontWeight: 'bold',
    },
    emptyBatchContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 20,
        backgroundColor: '#f9fafb',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#e5e7eb',
        borderStyle: 'dashed',
    },
    emptyBatchText: {
        color: '#6b7280',
        fontSize: 14,
    },
});

export default ProductDetail;
