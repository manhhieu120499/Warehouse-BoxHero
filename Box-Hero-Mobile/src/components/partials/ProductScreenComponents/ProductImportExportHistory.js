import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    FlatList,
    TouchableOpacity,
    Dimensions,
    ActivityIndicator,
} from 'react-native';
import Modal from '../../Modal';
import { COLORS } from '../../style/Globalstyle';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { formatDate } from '../../../utilities/formatDate';
import { typeTransaction } from '../../../constants';

const { width } = Dimensions.get('window');

const ProductImportExportHistory = ({ isOpen, onClose, historyData }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredData, setFilteredData] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    const mockHistory = historyData.data.map((item, index) => ({
        id: index + 1,
        transactionType: typeTransaction[item.actionType],
        quantityBefore: item.previousAmount,
        quantityAfter: item.newAmount,
        quantityChanged: item.previousAmount < item.newAmount ? item.quantityChange : item.quantityChange * -1,
        transactionCode: item.referenceID,
        transactionDate: formatDate(item.createdAt),
        creator: item.employeeName,
        note: item.note,
    }));

    useEffect(() => {
        // Filter data based on search query
        if (searchQuery.trim() === '') {
            setFilteredData(mockHistory);
        } else {
            const filtered = mockHistory.filter(
                (item) =>
                    item.transactionType.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    item.transactionCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    item.creator.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    item.note.toLowerCase().includes(searchQuery.toLowerCase()),
            );
            setFilteredData(filtered);
        }
        setCurrentPage(1); // Reset to first page when searching
    }, [searchQuery, historyData]);

    // Pagination
    const totalPages = historyData.pagination.totalPages;
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentData = filteredData.slice(startIndex, endIndex);

    const getTransactionTypeColor = (type) => {
        switch (type.toLowerCase()) {
            case 'xuất hàng':
                return '#ef4444'; // red
            case 'nhập hàng':
                return '#22c55e'; // green
            case 'kiểm kho':
                return '#3b82f6'; // blue
            default:
                return '#6b7280'; // gray
        }
    };

    const getTransactionTypeIcon = (type) => {
        switch (type.toLowerCase()) {
            case 'xuất hàng':
                return 'arrow-up-bold';
            case 'nhập hàng':
                return 'arrow-down-bold';
            case 'kiểm kho':
                return 'clipboard-check-outline';
            default:
                return 'swap-horizontal';
        }
    };

    const renderHistoryCard = ({ item, index }) => (
        <View style={styles.card}>
            {/* Header with transaction type */}
            <View style={styles.cardHeader}>
                <View style={styles.transactionTypeContainer}>
                    <Icon
                        name={getTransactionTypeIcon(item.transactionType)}
                        size={20}
                        color={getTransactionTypeColor(item.transactionType)}
                    />
                    <Text style={[styles.transactionType, { color: getTransactionTypeColor(item.transactionType) }]}>
                        {item.transactionType}
                    </Text>
                </View>
                <Text style={styles.sttText}>#{startIndex + index + 1}</Text>
            </View>

            {/* Card Content */}
            <View style={styles.cardContent}>
                {/* Quantity Info */}
                <View style={styles.quantitySection}>
                    <View style={styles.quantityItem}>
                        <Text style={styles.quantityLabel}>Số lượng trước</Text>
                        <Text style={styles.quantityValue}>{item.quantityBefore}</Text>
                    </View>
                    <Icon name="arrow-right" size={20} color={COLORS.gray} />
                    <View style={styles.quantityItem}>
                        <Text style={styles.quantityLabel}>Số lượng sau</Text>
                        <Text style={styles.quantityValue}>{item.quantityAfter}</Text>
                    </View>
                    <View style={styles.quantityChangedContainer}>
                        <Text style={styles.quantityChangedLabel}>Thay đổi</Text>
                        <Text
                            style={[
                                styles.quantityChangedValue,
                                {
                                    color:
                                        item.quantityChanged > 0
                                            ? '#22c55e'
                                            : item.quantityChanged < 0
                                              ? '#ef4444'
                                              : '#6b7280',
                                },
                            ]}
                        >
                            {item.quantityChanged > 0 ? '+' : ''}
                            {item.quantityChanged}
                        </Text>
                    </View>
                </View>

                {/* Transaction Details */}
                <View style={styles.detailsSection}>
                    <View style={styles.detailRow}>
                        <Icon name="barcode" size={16} color={COLORS.gray} />
                        <Text style={styles.detailLabel}>Mã giao dịch:</Text>
                        <Text style={styles.detailValue}>{item.transactionCode}</Text>
                    </View>

                    <View style={styles.detailRow}>
                        <Icon name="calendar" size={16} color={COLORS.gray} />
                        <Text style={styles.detailLabel}>Ngày giao dịch:</Text>
                        <Text style={styles.detailValue}>{item.transactionDate}</Text>
                    </View>

                    <View style={styles.detailRow}>
                        <Icon name="account" size={16} color={COLORS.gray} />
                        <Text style={styles.detailLabel}>Người tạo:</Text>
                        <Text style={styles.detailValue}>{item.creator}</Text>
                    </View>

                    {item.note && (
                        <View style={styles.detailRow}>
                            <Icon name="note-text" size={16} color={COLORS.gray} />
                            <Text style={styles.detailLabel}>Ghi chú:</Text>
                            <Text style={[styles.detailValue, styles.noteText]}>{item.note}</Text>
                        </View>
                    )}
                </View>
            </View>
        </View>
    );

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

                {[...Array(totalPages)].map((_, index) => {
                    // Show only 5 page numbers at a time
                    if (
                        index + 1 === 1 ||
                        index + 1 === totalPages ||
                        (index + 1 >= currentPage - 1 && index + 1 <= currentPage + 1)
                    ) {
                        return (
                            <TouchableOpacity
                                key={index}
                                style={[
                                    styles.pageNumberButton,
                                    currentPage === index + 1 && styles.pageNumberButtonActive,
                                ]}
                                onPress={() => setCurrentPage(index + 1)}
                            >
                                <Text
                                    style={[
                                        styles.pageNumberText,
                                        currentPage === index + 1 && styles.pageNumberTextActive,
                                    ]}
                                >
                                    {index + 1}
                                </Text>
                            </TouchableOpacity>
                        );
                    } else if (index + 1 === currentPage - 2 || index + 1 === currentPage + 2) {
                        return (
                            <Text key={index} style={styles.paginationDots}>
                                ...
                            </Text>
                        );
                    }
                    return null;
                })}

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

    const renderEmptyList = () => (
        <View style={styles.emptyContainer}>
            <Icon name="history" size={60} color={COLORS.gray} />
            <Text style={styles.emptyText}>Không tìm thấy lịch sử giao dịch</Text>
        </View>
    );

    return (
        <Modal isOpenInfo={isOpen} onClose={onClose} showButtonClose={true} arrButton={[]}>
            <View style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Lịch sử thay đổi số lượng sản phẩm</Text>
                </View>

                {/* Search Bar */}
                <View style={styles.searchContainer}>
                    <Icon name="magnify" size={20} color={COLORS.gray} style={styles.searchIcon} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Tìm kiếm theo loại, mã giao dịch, người tạo..."
                        placeholderTextColor={'black'}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => setSearchQuery('')}>
                            <Icon name="close-circle" size={20} color={COLORS.gray} />
                        </TouchableOpacity>
                    )}
                </View>

                {/* Results Count */}
                <Text style={styles.resultsCount}>Tìm thấy {filteredData.length} kết quả</Text>

                {/* History List */}
                <FlatList
                    data={currentData}
                    renderItem={renderHistoryCard}
                    keyExtractor={(item, index) => index.toString()}
                    ListEmptyComponent={renderEmptyList}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.listContainer}
                />

                {/* Pagination */}
                {renderPagination()}
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        maxHeight: Dimensions.get('window').height * 0.85,
    },
    header: {
        marginBottom: 15,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: 'black',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.white,
        borderWidth: 1,
        borderColor: '#d0d0d0',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 8,
        marginBottom: 12,
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        fontSize: 14,
        color: 'black',
        padding: 0,
    },
    resultsCount: {
        fontSize: 13,
        color: COLORS.gray,
        marginBottom: 10,
    },
    listContainer: {
        paddingBottom: 10,
    },
    card: {
        backgroundColor: COLORS.white,
        borderRadius: 8,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#e0e0e0',
        overflow: 'hidden',
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 12,
        backgroundColor: '#f9fafb',
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    transactionTypeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    transactionType: {
        fontSize: 15,
        fontWeight: 'bold',
        marginLeft: 8,
    },
    sttText: {
        fontSize: 13,
        color: COLORS.gray,
        fontWeight: '500',
    },
    cardContent: {
        padding: 12,
    },
    quantitySection: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 12,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    quantityItem: {
        alignItems: 'center',
    },
    quantityLabel: {
        fontSize: 11,
        color: COLORS.gray,
        marginBottom: 4,
    },
    quantityValue: {
        fontSize: 16,
        fontWeight: 'bold',
        color: 'black',
    },
    quantityChangedContainer: {
        alignItems: 'center',
    },
    quantityChangedLabel: {
        fontSize: 11,
        color: COLORS.gray,
        marginBottom: 4,
    },
    quantityChangedValue: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    detailsSection: {
        gap: 8,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 6,
    },
    detailLabel: {
        fontSize: 13,
        color: COLORS.gray,
        fontWeight: '500',
        minWidth: 100,
    },
    detailValue: {
        flex: 1,
        fontSize: 13,
        color: 'black',
    },
    noteText: {
        fontStyle: 'italic',
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 40,
    },
    emptyText: {
        fontSize: 14,
        color: COLORS.gray,
        marginTop: 12,
    },
    paginationContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 15,
        paddingTop: 15,
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
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
        borderColor: '#d0d0d0',
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
    paginationDots: {
        fontSize: 14,
        color: COLORS.gray,
        marginHorizontal: 5,
    },
});

export default ProductImportExportHistory;
