import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, FlatList, TextInput, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import { getBoxesByBatchID } from '../../../service/box.service';
import { addLocationInBatchProductList } from '../../../redux/batchProduct/BatchProductSlice';

const BatchBoxSelectionModal = ({ isVisible, onClose, batch, product, requireQuantity }) => {
    const [boxList, setBoxList] = useState([]);
    const [selectedBoxes, setSelectedBoxes] = useState({}); // { boxID: quantity }
    const dispatch = useDispatch();
    const batchBoxProductList = useSelector((state) => state.BatchProductSlice.batchBoxProductList);

    useEffect(() => {
        if (isVisible && batch?.batchID) {
            fetchBoxes();
        }
    }, [isVisible, batch]);

    const fetchBoxes = async () => {
        try {
            const boxes = await getBoxesByBatchID(batch.batchID);
            // Format data
            const formattedBoxes = boxes.map((box) => ({
                boxID: box.boxID,
                boxName: box.boxName,
                floor: box.floorID,
                amountAvailable: box.batch_boxes.quantity,
            }));

            // Load existing selection from Redux if any
            const key = `${product.productID}-${batch.batchID}`;
            const existingSelection = batchBoxProductList[key] || [];
            const selectionMap = {};
            existingSelection.forEach((item) => {
                selectionMap[item.boxID] = item.quantityExported;
            });

            setSelectedBoxes(selectionMap);
            setBoxList(formattedBoxes);
        } catch (error) {
            console.log(error);
        }
    };

    const handleQuantityChange = (boxID, quantity, max) => {
        const qty = parseInt(quantity) || 0;
        if (qty > max) {
            Alert.alert('Lỗi', 'Số lượng không được vượt quá tồn kho');
            return;
        }

        setSelectedBoxes((prev) => {
            const newSelection = { ...prev };
            if (qty > 0) {
                newSelection[boxID] = qty;
            } else {
                delete newSelection[boxID];
            }
            return newSelection;
        });
    };

    const calculateTotalSelected = () => {
        return Object.values(selectedBoxes).reduce((sum, qty) => sum + qty, 0);
    };

    const handleConfirm = () => {
        const total = calculateTotalSelected();
        if (total !== requireQuantity) {
            Alert.alert('Lỗi', `Tổng số lượng xuất phải bằng ${requireQuantity}. Hiện tại: ${total}`);
            return;
        }

        const locationList = Object.keys(selectedBoxes).map((boxID) => {
            const box = boxList.find((b) => b.boxID === boxID);
            return {
                boxID: boxID,
                boxName: box.boxName,
                boxFloor: box.floor,
                quantityExported: selectedBoxes[boxID],
            };
        });

        dispatch(
            addLocationInBatchProductList({
                key: product.productID,
                batchID: batch.batchID,
                newLocation: locationList,
            }),
        );
        onClose();
    };

    const renderItem = ({ item }) => {
        const isSelected = !!selectedBoxes[item.boxID];
        const currentQty = selectedBoxes[item.boxID] || '';

        return (
            <View style={[styles.itemCard, isSelected && styles.itemSelected]}>
                <View style={styles.itemHeader}>
                    <Text style={styles.boxName}>{item.boxName}</Text>
                    <Text style={styles.boxID}>{item.boxID}</Text>
                </View>
                <View style={styles.itemInfo}>
                    <Text style={styles.infoText}>Vị trí: {item.floor}</Text>
                    <Text style={styles.infoText}>Tồn: {item.amountAvailable}</Text>
                </View>
                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Xuất:</Text>
                    <TextInput
                        style={styles.input}
                        keyboardType="numeric"
                        value={currentQty.toString()}
                        onChangeText={(text) => handleQuantityChange(item.boxID, text, item.amountAvailable)}
                        placeholder="0"
                    />
                </View>
            </View>
        );
    };

    return (
        <Modal visible={isVisible} animationType="slide" transparent={true} onRequestClose={onClose}>
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <View style={styles.header}>
                        <Text style={styles.title}>Chọn vị trí xuất (Lô: {batch?.batchID})</Text>
                        <TouchableOpacity onPress={onClose}>
                            <Ionicons name="close" size={24} color="#333" />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.summary}>
                        <Text style={styles.summaryText}>Yêu cầu: {requireQuantity}</Text>
                        <Text
                            style={[
                                styles.summaryText,
                                calculateTotalSelected() !== requireQuantity ? styles.textError : styles.textSuccess,
                            ]}
                        >
                            Đã chọn: {calculateTotalSelected()}
                        </Text>
                    </View>

                    <FlatList
                        data={boxList}
                        renderItem={renderItem}
                        keyExtractor={(item) => item.boxID}
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
        maxHeight: '80%',
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
    },
    summary: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 10,
        backgroundColor: '#f9f9f9',
    },
    summaryText: {
        fontSize: 14,
        fontWeight: '600',
    },
    textError: { color: 'red' },
    textSuccess: { color: 'green' },
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
        marginBottom: 5,
    },
    boxName: {
        fontWeight: 'bold',
        fontSize: 14,
    },
    boxID: {
        fontSize: 12,
        color: '#666',
    },
    itemInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    infoText: {
        fontSize: 12,
        color: '#555',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        gap: 10,
    },
    label: {
        fontSize: 14,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 4,
        padding: 5,
        width: 80,
        textAlign: 'center',
        backgroundColor: '#fff',
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

export default BatchBoxSelectionModal;
