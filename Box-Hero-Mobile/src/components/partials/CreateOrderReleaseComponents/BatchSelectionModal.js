import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, FlatList, TextInput, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import { getAllBatchWithProductID, suggestBatchProductForExport } from '../../../service/batch.service';
import { addBatchProductList } from '../../../redux/batchProduct/BatchProductSlice';
import BatchBoxSelectionModal from './BatchBoxSelectionModal';
import { formatDate } from '../../../utilities/formatDate';

const BatchSelectionModal = ({ isVisible, onClose, product }) => {
    const [batchList, setBatchList] = useState([]);
    const [selectedBatches, setSelectedBatches] = useState([]);
    const [boxModalVisible, setBoxModalVisible] = useState(false);
    const [currentBatch, setCurrentBatch] = useState(null);
    const dispatch = useDispatch();
    const batchProductStore = useSelector((state) => state.BatchProductSlice.batchProductList);

    useEffect(() => {
        if (isVisible && product?.productID) {
            fetchBatches();
            // Load existing selection
            const existing = batchProductStore[product.productID] || [];
            setSelectedBatches(existing);
        }
    }, [isVisible, product]);

    const fetchBatches = async () => {
        try {
            const res = await getAllBatchWithProductID(product.productID);
            if (res) {
                const formatted = res.map((item) => ({
                    batchID: item.batchID,
                    manufactureDate: item.manufactureDate,
                    expiryDate: item.expiryDate,
                    available: item.remainAmount,
                    unitName: item.unit.unitName,
                    unitID: item.unit.unitID,
                }));
                setBatchList(formatted);
            }
        } catch (error) {
            console.log(error);
        }
    };

    const handleSuggest = async (type) => {
        try {
            const res = await suggestBatchProductForExport(product.productID, type);
            if (res) {
                const formatted = res.map((item) => ({
                    batchID: item.batchID,
                    manufactureDate: item.manufactureDate,
                    expiryDate: item.expiryDate,
                    available: item.remainAmount,
                    unitName: item.unit.unitName,
                    unitID: item.unit.unitID,
                }));
                setBatchList(formatted);
            }
        } catch (error) {
            console.log(error);
        }
    };

    const toggleBatchSelection = (batch) => {
        const index = selectedBatches.findIndex((b) => b.batchID === batch.batchID);
        if (index > -1) {
            setSelectedBatches((prev) => prev.filter((b) => b.batchID !== batch.batchID));
        } else {
            setSelectedBatches((prev) => [...prev, { ...batch, quantity: 0 }]);
        }
    };

    const updateQuantity = (batchID, quantity) => {
        const qty = parseInt(quantity) || 0;
        const batch = batchList.find((b) => b.batchID === batchID);

        if (qty > batch.available) {
            Alert.alert('Lỗi', 'Số lượng xuất không được vượt quá tồn kho');
            return;
        }

        setSelectedBatches((prev) => prev.map((b) => (b.batchID === batchID ? { ...b, quantity: qty } : b)));
    };

    const handleOpenBoxModal = (batch) => {
        const selected = selectedBatches.find((b) => b.batchID === batch.batchID);
        if (!selected || selected.quantity <= 0) {
            Alert.alert('Lỗi', 'Vui lòng chọn lô và nhập số lượng xuất trước');
            return;
        }
        setCurrentBatch(selected);
        setBoxModalVisible(true);
    };

    const handleConfirm = () => {
        const invalid = selectedBatches.some((b) => b.quantity <= 0);
        if (invalid) {
            Alert.alert('Lỗi', 'Vui lòng nhập số lượng xuất cho các lô đã chọn');
            return;
        }

        dispatch(
            addBatchProductList({
                key: product.productID,
                value: selectedBatches,
            }),
        );
        onClose();
    };

    const renderItem = ({ item }) => {
        const isSelected = selectedBatches.some((b) => b.batchID === item.batchID);
        const selectedData = selectedBatches.find((b) => b.batchID === item.batchID);
        const quantity = selectedData ? selectedData.quantity : '';

        return (
            <View style={[styles.itemCard, isSelected && styles.itemSelected]}>
                <View style={styles.itemHeader}>
                    <TouchableOpacity style={styles.checkboxContainer} onPress={() => toggleBatchSelection(item)}>
                        <Ionicons
                            name={isSelected ? 'checkbox' : 'square-outline'}
                            size={24}
                            color={isSelected ? '#007bff' : '#666'}
                        />
                        <Text style={styles.batchID}>{item.batchID}</Text>
                    </TouchableOpacity>
                    <Text style={styles.available}>
                        Tồn: {item.available} {item.unitName}
                    </Text>
                </View>

                <View style={styles.details}>
                    <Text style={styles.dateText}>NSX: {formatDate(item.manufactureDate)}</Text>
                    <Text style={styles.dateText}>HSD: {formatDate(item.expiryDate)}</Text>
                </View>

                {isSelected && (
                    <View style={styles.actions}>
                        <View style={styles.inputContainer}>
                            <Text>Xuất:</Text>
                            <TextInput
                                style={styles.input}
                                keyboardType="numeric"
                                value={quantity.toString()}
                                onChangeText={(text) => updateQuantity(item.batchID, text)}
                                placeholder="0"
                            />
                        </View>
                        <TouchableOpacity style={styles.locationBtn} onPress={() => handleOpenBoxModal(item)}>
                            <Text style={styles.locationBtnText}>Chọn vị trí</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        );
    };

    return (
        <Modal visible={isVisible} animationType="slide" transparent={true} onRequestClose={onClose}>
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <View style={styles.header}>
                        <Text style={styles.title}>Chọn lô xuất ({product?.productName})</Text>
                        <TouchableOpacity onPress={onClose}>
                            <Ionicons name="close" size={24} color="#333" />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.filterContainer}>
                        <Text style={styles.filterLabel}>Gợi ý:</Text>
                        <TouchableOpacity style={styles.filterBtn} onPress={() => handleSuggest('expirePriority')}>
                            <Text style={styles.filterText}>Hết hạn trước</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.filterBtn} onPress={() => handleSuggest('rankPriority')}>
                            <Text style={styles.filterText}>Nhập trước</Text>
                        </TouchableOpacity>
                    </View>

                    <FlatList
                        data={batchList}
                        renderItem={renderItem}
                        keyExtractor={(item) => item.batchID}
                        contentContainerStyle={styles.listContent}
                    />

                    <View style={styles.footer}>
                        <TouchableOpacity style={[styles.btn, styles.btnCancel]} onPress={onClose}>
                            <Text style={styles.btnText}>Hủy</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.btn, styles.btnConfirm]} onPress={handleConfirm}>
                            <Text style={styles.btnText}>Xác nhận</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>

            {boxModalVisible && (
                <BatchBoxSelectionModal
                    isVisible={boxModalVisible}
                    onClose={() => setBoxModalVisible(false)}
                    batch={currentBatch}
                    product={product}
                    requireQuantity={currentBatch?.quantity || 0}
                />
            )}
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        padding: 20,
    },
    modalContent: {
        backgroundColor: '#fff',
        borderRadius: 12,
        maxHeight: '90%',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    title: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        flex: 1,
    },
    filterContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        gap: 10,
    },
    filterLabel: {
        fontSize: 12,
        color: '#666',
    },
    filterBtn: {
        paddingHorizontal: 10,
        paddingVertical: 5,
        backgroundColor: '#f0f0f0',
        borderRadius: 15,
    },
    filterText: {
        fontSize: 12,
        color: '#333',
    },
    listContent: {
        padding: 15,
    },
    itemCard: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        marginBottom: 10,
    },
    itemSelected: {
        borderColor: '#007bff',
        backgroundColor: '#f0f7ff',
    },
    itemHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    checkboxContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    batchID: {
        fontWeight: 'bold',
        fontSize: 14,
    },
    available: {
        fontSize: 12,
        color: '#28a745',
        fontWeight: '500',
    },
    details: {
        marginBottom: 10,
        paddingLeft: 32,
    },
    dateText: {
        fontSize: 12,
        color: '#666',
        marginBottom: 2,
    },
    actions: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 10,
        borderTopWidth: 1,
        borderTopColor: '#eee',
        paddingLeft: 32,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 4,
        padding: 5,
        width: 60,
        textAlign: 'center',
        backgroundColor: '#fff',
    },
    locationBtn: {
        backgroundColor: '#17a2b8',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 4,
    },
    locationBtnText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '500',
    },
    footer: {
        flexDirection: 'row',
        padding: 15,
        borderTopWidth: 1,
        borderTopColor: '#eee',
        gap: 10,
    },
    btn: {
        flex: 1,
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    btnCancel: {
        backgroundColor: '#6c757d',
    },
    btnConfirm: {
        backgroundColor: '#007bff',
    },
    btnText: {
        color: '#fff',
        fontWeight: 'bold',
    },
});

export default BatchSelectionModal;
