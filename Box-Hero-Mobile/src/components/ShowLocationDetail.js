import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, FlatList, Dimensions, Modal } from 'react-native';
import { X, Check } from 'lucide-react-native';
import { getAllShelfOfWarehouse } from '../service/shelf.service';
import { getBoxContainProduct } from '../service/batch.service';
import { getBoxDetails } from '../service/box.service';
import parseToken from '../utilities/parseToken';
import CreateCheckDetail from './CreateCheckDetail';

const { width, height } = Dimensions.get('window');

const ShowLocationDetail = ({ isOpen, onClose, fetchData }) => {
    const [localShelves, setLocalShelves] = useState([]);
    const [selectedShelfID, setSelectedShelfID] = useState(null);
    const [selectedBox, setSelectedBox] = useState([]);
    const [listBatchBoxCheck, setListBatchBoxCheck] = useState([]);
    const [showCreateInventoryCheck, setShowCreateInventoryCheck] = useState(false);
    const [selectedAll, setSelectedAll] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchShelfData();
        }
    }, [isOpen]);

    const fetchShelfData = async () => {
        try {
            const userJSON = await parseToken('tokenUser');
            const warehouse = await parseToken('warehouse');

            const headers = {
                token: `Bearer ${userJSON.accessToken}`,
                employeeID: userJSON.employeeID,
                warehouseID: warehouse.warehouseID,
            };
            const data = await getAllShelfOfWarehouse({
                warehouseID: warehouse.warehouseID,
                headers,
            });
            if (data.status === 'OK') {
                setLocalShelves(data.data);
                if (data.data.length > 0) {
                    setSelectedShelfID(data.data[0].shelfID);
                }
            }
        } catch (error) {
            console.log('Error fetching shelves:', error);
        }
    };

    const checkBoxAvailable = (box) => {
        const validQuantity = box.batchBoxes?.every((item) => item.quantity === 0);
        return box.status === 'AVAILABLE' || validQuantity;
    };

    const handleClickBox = async (box) => {
        if (checkBoxAvailable(box)) return;

        const boxExists = selectedBox.find((b) => b.boxID === box.boxID);
        if (boxExists) {
            setSelectedBox(selectedBox.filter((b) => b.boxID !== box.boxID));
            setListBatchBoxCheck(listBatchBoxCheck.filter((b) => b.boxID !== box.boxID));
        } else {
            try {
                const warehouse = await parseToken('warehouse');
                const res = await getBoxDetails(warehouse.warehouseID, box.boxID);

                if (res.data.status === 'OK') {
                    const location = `${res.data.data.floor.shelf.shelfName} - ${res.data.data.floor.floorName} - ${res.data.data.boxName}`;
                    const batches = res.data.data.batches.filter((batch) => batch.batch_boxes.quantity > 0);

                    if (batches.length > 0) {
                        setSelectedBox([...selectedBox, { boxID: box.boxID }]);
                        setListBatchBoxCheck([...listBatchBoxCheck, { boxID: box.boxID, location, batches }]);
                    } else {
                        Alert.alert('Thông báo', 'Hộp này không có sản phẩm nào');
                    }
                }
            } catch (error) {
                console.log('Error getting box details:', error);
            }
        }
    };

    const handleCreateInventoryCheck = () => {
        if (listBatchBoxCheck.length === 0) {
            Alert.alert('Lỗi', 'Vui lòng chọn vị trí để kiểm kê');
        } else {
            setShowCreateInventoryCheck(true);
        }
    };

    const handleCloseCreate = () => {
        setShowCreateInventoryCheck(false);
        onClose();
    };

    // Render Shelf Tab
    const renderShelfTab = ({ item }) => {
        const isSelected = selectedShelfID === item.shelfID;
        return (
            <TouchableOpacity
                style={[styles.shelfTab, isSelected && styles.shelfTabSelected]}
                onPress={() => setSelectedShelfID(item.shelfID)}
            >
                <Text style={[styles.shelfTabText, isSelected && styles.shelfTabTextSelected]}>{item.shelfName}</Text>
            </TouchableOpacity>
        );
    };

    const currentShelf = localShelves.find((s) => s.shelfID === selectedShelfID);

    return (
        <Modal visible={isOpen} animationType="slide" transparent={true} onRequestClose={onClose}>
            <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={styles.headerTitle}>Chọn vị trí kiểm kê</Text>
                        <TouchableOpacity onPress={onClose}>
                            <X size={24} color="#374151" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
                        {/* Selected List Summary */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Danh sách lô hàng cần kiểm kê</Text>
                            <View style={styles.tableContainer}>
                                <View style={styles.tableHeader}>
                                    <Text style={[styles.th, styles.wLocation]}>Vị trí</Text>
                                    <Text style={[styles.th, styles.wBatch]}>Mã lô</Text>
                                    <Text style={[styles.th, styles.wName]}>Tên SP</Text>
                                    <Text style={[styles.th, styles.wNum]}>SL</Text>
                                </View>
                                {listBatchBoxCheck.length === 0 ? (
                                    <Text style={styles.emptyText}>Chưa chọn vị trí nào</Text>
                                ) : (
                                    listBatchBoxCheck.map((boxItem) =>
                                        boxItem.batches.map((batch, idx) => (
                                            <View key={`${boxItem.boxID}-${idx}`} style={styles.tableRow}>
                                                <Text style={[styles.td, styles.wLocation]}>{boxItem.location}</Text>
                                                <Text style={[styles.td, styles.wBatch]}>{batch.batchID}</Text>
                                                <Text style={[styles.td, styles.wName]}>
                                                    {batch.product.productName}
                                                </Text>
                                                <Text style={[styles.td, styles.wNum]}>
                                                    {batch.batch_boxes.quantity}
                                                </Text>
                                            </View>
                                        )),
                                    )
                                )}
                            </View>
                        </View>

                        {/* Shelf Visual */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Sơ đồ kho (Chạm để chọn)</Text>

                            {/* Shelf Tabs */}
                            <FlatList
                                data={localShelves}
                                renderItem={renderShelfTab}
                                keyExtractor={(item) => item.shelfID.toString()}
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                style={styles.shelfTabsContainer}
                            />

                            {/* Shelf Content */}
                            {currentShelf && (
                                <View style={styles.shelfContent}>
                                    <ScrollView horizontal showsHorizontalScrollIndicator={true}>
                                        <View style={styles.shelfBody}>
                                            {currentShelf.floor?.map((column, index) => (
                                                <View style={styles.floor} key={index}>
                                                    {column.boxes.map((box, colIndex) => {
                                                        const isAvailable = checkBoxAvailable(box);
                                                        const isSelected = selectedBox.some(
                                                            (b) => b.boxID === box.boxID,
                                                        );

                                                        let boxStyle = [styles.box];
                                                        if (isSelected) boxStyle.push(styles.boxSelected);
                                                        else if (!isAvailable) boxStyle.push(styles.boxOccupied);
                                                        else boxStyle.push(styles.boxAvailable);

                                                        return (
                                                            <TouchableOpacity
                                                                key={colIndex}
                                                                disabled={isAvailable}
                                                                onPress={() => handleClickBox(box)}
                                                                style={boxStyle}
                                                            >
                                                                <Text style={styles.boxText}>{box.boxName}</Text>
                                                                {isSelected && (
                                                                    <View style={styles.checkIcon}>
                                                                        <Check size={12} color="white" />
                                                                    </View>
                                                                )}
                                                            </TouchableOpacity>
                                                        );
                                                    })}
                                                </View>
                                            ))}
                                        </View>
                                    </ScrollView>
                                </View>
                            )}
                        </View>
                        <View style={{ height: 60 }} />
                    </ScrollView>

                    {/* Footer */}
                    <View style={styles.footer}>
                        <TouchableOpacity style={[styles.btn, styles.btnClose]} onPress={onClose}>
                            <Text style={[styles.btnText, { color: '#374151' }]}>Hủy</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.btn, styles.btnPrimary]} onPress={handleCreateInventoryCheck}>
                            <Text style={styles.btnText}>Tạo đơn kiểm kê</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>

            {showCreateInventoryCheck && (
                <CreateCheckDetail
                    isOpen={showCreateInventoryCheck}
                    onClose={() => setShowCreateInventoryCheck(false)}
                    listBatchBoxCheck={listBatchBoxCheck}
                    handleOnclose={handleCloseCreate}
                    fetchData={fetchData}
                    type="create"
                />
            )}
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        height: '95%',
        display: 'flex',
        flexDirection: 'column',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#111827',
    },
    body: {
        flex: 1,
        padding: 16,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 12,
        color: '#374151',
    },
    emptyText: {
        textAlign: 'center',
        color: '#9ca3af',
        padding: 20,
        fontStyle: 'italic',
    },

    // Table
    tableContainer: {
        borderWidth: 1,
        borderColor: '#e5e7eb',
        borderRadius: 8,
        overflow: 'hidden',
    },
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: '#f3f4f6',
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
    },
    tableRow: {
        flexDirection: 'row',
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
    },
    th: { fontSize: 12, fontWeight: '600', color: '#4b5563' },
    td: { fontSize: 12, color: '#1f2937' },
    wLocation: { flex: 2 },
    wBatch: { flex: 1 },
    wName: { flex: 2 },
    wNum: { flex: 0.5, textAlign: 'right' },

    // Shelf Tabs
    shelfTabsContainer: {
        marginBottom: 10,
    },
    shelfTab: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        backgroundColor: '#e5e7eb',
        borderRadius: 20,
        marginRight: 8,
    },
    shelfTabSelected: {
        backgroundColor: '#3b82f6',
    },
    shelfTabText: {
        fontSize: 14,
        color: '#4b5563',
        fontWeight: '600',
    },
    shelfTabTextSelected: {
        color: '#fff',
    },

    // Shelf Visual
    shelfContent: {
        backgroundColor: '#f8fafc',
        padding: 20,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        minHeight: 220,
        justifyContent: 'center',
        alignItems: 'center',
    },
    shelfBody: {
        flexDirection: 'row',
        padding: 10,
        backgroundColor: '#fff',
        borderRadius: 8,
        borderWidth: 4,
        borderColor: '#cbd5e1',
    },
    floor: {
        flexDirection: 'column',
        marginHorizontal: 6,
        borderRightWidth: 1,
        borderRightColor: '#f1f5f9',
    },
    box: {
        width: 50,
        height: 50,
        marginVertical: 4,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 6,
        borderWidth: 1,
        borderColor: '#cbd5e1',
    },
    boxAvailable: {
        backgroundColor: '#f1f5f9', // Empty/Available
        opacity: 0.5,
    },
    boxOccupied: {
        backgroundColor: '#cce5cc', // Has items
        borderColor: '#86efac',
    },
    boxSelected: {
        backgroundColor: '#3b82f6',
        borderColor: '#2563eb',
    },
    boxText: {
        fontSize: 10,
        color: '#1f2937',
        fontWeight: '700',
    },
    checkIcon: {
        position: 'absolute',
        top: 2,
        right: 2,
    },

    // Footer
    footer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: '#e5e7eb',
        gap: 10,
    },
    btn: {
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    btnPrimary: {
        backgroundColor: '#3b82f6',
    },
    btnClose: {
        backgroundColor: '#e5e7eb',
    },
    btnText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 14,
    },
});

export default ShowLocationDetail;
