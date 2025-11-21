import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Dimensions } from 'react-native';
import Modal from '../../Modal';
import { COLORS } from '../../style/Globalstyle';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { formatDate } from '../../../utilities/formatDate';

const { width } = Dimensions.get('window');

const ProductDetail = ({ isOpen, onClose, productData }) => {
    const [currentPage, setCurrentPage] = useState(1);

    const product = {
        productImage: productData.image,
        productCode: productData.categoryID,
        productID: productData.productID,
        description: productData.description,
        baseUnit: productData.baseUnitProducts.baseUnitName,
        productName: productData.productName,
        totalStock: productData.amount,
        batches: productData.batches.map((batch) => ({
            batchCode: batch.batchID,
            importDate: formatDate(batch.createdAt),
            manufactureDate: formatDate(batch.manufactureDate),
            expiryDate: formatDate(batch.expiryDate),
            importQuantity: batch.importAmount,
            stockQuantity: batch.remainAmount,
            importUnit: batch.unitName,
            totalProducts: batch.totalProductRemain,
            location: batch.locationBatch.map((loca) => loca.location),
            warehouseCode: batch.warehouseID,
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
                <View style={styles.productInfoSection}>
                    {/* Product Image */}
                    <View style={styles.imageContainer}>
                        {product.productImage ? (
                            <Image source={{ uri: product.productImage }} style={styles.productImage} />
                        ) : (
                            <View style={styles.placeholderImage}>
                                <Icon name="image-outline" size={60} color={COLORS.gray} />
                            </View>
                        )}
                    </View>

                    {/* Product Details */}
                    <View style={styles.detailsContainer}>
                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Mã nhóm sản phẩm:</Text>
                            <Text style={styles.detailValue}>{product.productCode}</Text>
                        </View>

                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Mã sản phẩm:</Text>
                            <Text style={styles.detailValue}>{product.productID}</Text>
                        </View>

                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Mô tả:</Text>
                            <Text style={styles.detailValue}>{product.description}</Text>
                        </View>

                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Đơn vị cơ bản:</Text>
                            <Text style={styles.detailValue}>{product.baseUnit}</Text>
                        </View>

                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Tên sản phẩm:</Text>
                            <Text style={styles.detailValue}>{product.productName}</Text>
                        </View>

                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Tổng lượng tồn kho:</Text>
                            <Text style={styles.detailValue}>{product.totalStock}</Text>
                        </View>
                    </View>
                </View>

                {/* Batch List Section */}
                <View style={styles.batchSection}>
                    <Text style={styles.sectionTitle}>Danh sách lô hàng</Text>

                    {/* Table Header */}
                    <ScrollView horizontal showsHorizontalScrollIndicator={true}>
                        <View>
                            <View style={styles.tableHeader}>
                                <Text style={[styles.tableHeaderCell, { width: 80 }]}>Mã lô hàng</Text>
                                <Text style={[styles.tableHeaderCell, { width: 100 }]}>Ngày nhập</Text>
                                <Text style={[styles.tableHeaderCell, { width: 100 }]}>Ngày sản xuất</Text>
                                <Text style={[styles.tableHeaderCell, { width: 100 }]}>Hạn sử dụng</Text>
                                <Text style={[styles.tableHeaderCell, { width: 80 }]}>Số lượng nhập</Text>
                                <Text style={[styles.tableHeaderCell, { width: 80 }]}>Số lượng tồn</Text>
                                <Text style={[styles.tableHeaderCell, { width: 100 }]}>Đơn vị nhập</Text>
                                <Text style={[styles.tableHeaderCell, { width: 100 }]}>Tổng sản phẩm</Text>
                                <Text style={[styles.tableHeaderCell, { width: 170 }]}>Vị trí</Text>
                                <Text style={[styles.tableHeaderCell, { width: 80 }]}>Mã kho</Text>
                            </View>

                            {/* Table Rows */}
                            {currentBatches.map((batch, index) => (
                                <View key={index} style={[styles.tableRow, index % 2 === 0 && styles.tableRowEven]}>
                                    <Text style={[styles.tableCell, { width: 80 }]}>{batch.batchCode}</Text>
                                    <Text style={[styles.tableCell, { width: 100 }]}>{batch.importDate}</Text>
                                    <Text style={[styles.tableCell, { width: 100 }]}>{batch.manufactureDate}</Text>
                                    <Text style={[styles.tableCell, { width: 100 }]}>{batch.expiryDate}</Text>
                                    <Text style={[styles.tableCell, { width: 80 }]}>{batch.importQuantity}</Text>
                                    <Text style={[styles.tableCell, { width: 80 }]}>{batch.stockQuantity}</Text>
                                    <Text style={[styles.tableCell, { width: 100 }]}>{batch.importUnit}</Text>
                                    <Text style={[styles.tableCell, { width: 100 }]}>{batch.totalProducts}</Text>
                                    <View
                                        style={[styles.tableCell, { width: 170, flexDirection: 'column', rowGap: 5 }]}
                                    >
                                        {batch.location.map((it) => (
                                            <Text key={it}>{it}</Text>
                                        ))}
                                    </View>
                                    <Text style={[styles.tableCell, { width: 80 }]}>{batch.warehouseCode}</Text>
                                </View>
                            ))}
                        </View>
                    </ScrollView>

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
    productInfoSection: {
        marginBottom: 20,
    },
    imageContainer: {
        alignItems: 'center',
        marginBottom: 15,
    },
    productImage: {
        width: 120,
        height: 120,
        borderRadius: 8,
        resizeMode: 'cover',
    },
    placeholderImage: {
        width: 120,
        height: 120,
        borderRadius: 8,
        backgroundColor: COLORS.white,
        justifyContent: 'center',
        alignItems: 'center',
    },
    detailsContainer: {
        backgroundColor: COLORS.white,
    },
    detailRow: {
        flexDirection: 'row',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: 'black',
    },
    detailLabel: {
        flex: 1,
        fontSize: 14,
        color: 'black',
        fontWeight: '500',
    },
    detailValue: {
        flex: 1,
        fontSize: 14,
        color: 'black',
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
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: 'black',
        paddingVertical: 10,
        paddingHorizontal: 5,
    },
    tableHeaderCell: {
        fontSize: 12,
        fontWeight: 'bold',
        color: COLORS.white,
        textAlign: 'center',
        paddingHorizontal: 5,
    },
    tableRow: {
        flexDirection: 'row',
        paddingVertical: 10,
        paddingHorizontal: 5,
        borderBottomWidth: 1,
    },
    tableRowEven: {
        backgroundColor: '#f9f9f9',
    },
    tableCell: {
        fontSize: 12,
        color: 'black',
        textAlign: 'center',
        paddingHorizontal: 5,
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
});

export default ProductDetail;
