import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const ExportProductList = ({ productList, onSelectBatch, onViewDetail }) => {
    return (
        <View style={styles.container}>
            <Text style={styles.headerTitle}>Danh sách sản phẩm xuất kho</Text>

            {productList.length > 0 ? (
                productList.map((item, index) => (
                    <View key={index} style={styles.productCard}>
                        <View style={styles.cardHeader}>
                            <Text style={styles.index}>#{index + 1}</Text>
                            <Text style={styles.productName}>{item.productName}</Text>
                        </View>
                        <Text style={styles.productID}>Mã: {item.productID}</Text>

                        <View style={styles.actionContainer}>
                            <TouchableOpacity
                                style={[styles.btn, styles.btnSuccess]}
                                onPress={() => onSelectBatch(item)}
                            >
                                <Ionicons name="cube-outline" size={16} color="#fff" />
                                <Text style={styles.btnText}>Chọn lô</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.btn, styles.btnPrimary]}
                                onPress={() => onViewDetail(item)}
                            >
                                <Ionicons name="eye-outline" size={16} color="#fff" />
                                <Text style={styles.btnText}>Chi tiết</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                ))
            ) : (
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>Chưa có sản phẩm nào</Text>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 15,
        backgroundColor: '#fff',
        borderRadius: 8,
        marginBottom: 15,
        elevation: 2,
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 15,
        color: '#333',
    },
    productCard: {
        backgroundColor: '#f9f9f9',
        borderRadius: 8,
        padding: 12,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#eee',
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 5,
    },
    index: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#666',
        marginRight: 8,
        backgroundColor: '#e0e0e0',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    productName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        flex: 1,
    },
    productID: {
        fontSize: 12,
        color: '#666',
        marginBottom: 10,
    },
    actionContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 10,
    },
    btn: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 6,
        gap: 5,
    },
    btnSuccess: {
        backgroundColor: '#28a745',
    },
    btnPrimary: {
        backgroundColor: '#007bff',
    },
    btnText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '500',
    },
    emptyContainer: {
        padding: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyText: {
        color: '#999',
        fontStyle: 'italic',
    },
});

export default ExportProductList;
