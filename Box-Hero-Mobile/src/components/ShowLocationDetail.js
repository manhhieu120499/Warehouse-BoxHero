import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Alert,
    FlatList,
    Dimensions,
    TextInput,
    Modal,
} from 'react-native';
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
            const tokenUser = await parseToken('tokenUser');
            const warehouse = await parseToken('warehouse');

            const data = await getAllShelfOfWarehouse({
                warehouseID: warehouse.warehouseID,
                token: tokenUser.accessToken,
                employeeID: tokenUser.employeeID,
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

    const isAllShelfSelected = () => {
        if (!currentShelf) return false;
        const validBoxes = [];
        currentShelf.floor.forEach((floor) => {
            floor.boxes.forEach((box) => {
                if (!checkBoxAvailable(box)) {
                    validBoxes.push(box);
                }
            });
        });
        if (validBoxes.length === 0) return false;
        return validBoxes.every((box) => selectedBox.some((b) => b.boxID === box.boxID));
    };

    const handleSelectAll = async () => {
        if (!currentShelf) return;

        const validBoxes = [];
        currentShelf.floor.forEach((floor) => {
            floor.boxes.forEach((box) => {
                if (!checkBoxAvailable(box)) {
                    validBoxes.push(box);
                }
            });
        });

        if (validBoxes.length === 0) {
            Alert.alert('Thông báo', 'Kệ này không có hộp nào để chọn');
            return;
        }

        const isAllSelected = validBoxes.every((box) => selectedBox.some((b) => b.boxID === box.boxID));

        if (isAllSelected) {
            // Deselect all
            const boxIDsToRemove = validBoxes.map((b) => b.boxID);
            setSelectedBox((prev) => prev.filter((b) => !boxIDsToRemove.includes(b.boxID)));
            setListBatchBoxCheck((prev) => prev.filter((b) => !boxIDsToRemove.includes(b.boxID)));
        } else {
            // Select all
            const boxesToSelect = validBoxes.filter((box) => !selectedBox.some((b) => b.boxID === box.boxID));

            try {
                const warehouse = await parseToken('warehouse');
                const promises = boxesToSelect.map((box) => getBoxDetails(warehouse.warehouseID, box.boxID));
                const responses = await Promise.all(promises);

                const newSelected = [];
                const newDetails = [];

                responses.forEach((res, index) => {
                    if (res.data.status === 'OK') {
                        const box = boxesToSelect[index];
                        const location = `${res.data.data.floor.shelf.shelfName} - ${res.data.data.floor.floorName} - ${res.data.data.boxName}`;
                        const batches = res.data.data.batches.filter((batch) => batch.batch_boxes.quantity > 0);

                        if (batches.length > 0) {
                            newSelected.push({ boxID: box.boxID });
                            newDetails.push({ boxID: box.boxID, location, batches });
                        }
                    }
                });

                setSelectedBox((prev) => [...prev, ...newSelected]);
                setListBatchBoxCheck((prev) => [...prev, ...newDetails]);
            } catch (error) {
                console.log('Error selecting all:', error);
                Alert.alert('Lỗi', 'Không thể chọn tất cả hộp. Vui lòng thử lại.');
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
                alignItems="center"
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
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <X size={24} color="#374151" />
                        </TouchableOpacity>
                    </View>
                    <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
                        <View style={styles.section}>
                            <View style={styles.sectionHeader}>
                                <Text style={styles.sectionTitle}>Sơ đồ kho</Text>
                                <TouchableOpacity onPress={handleSelectAll}>
                                    <Text style={styles.selectAllText}>
                                        {isAllShelfSelected() ? 'Bỏ chọn kệ' : 'Chọn cả kệ'}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                            {/* Shelf Tabs */}
                            <FlatList
                                data={localShelves}
                                renderItem={renderShelfTab}
                                keyExtractor={(item) => item.shelfID.toString()}
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                style={styles.shelfTabsContainer}
                                contentContainerStyle={{ paddingHorizontal: 4 }}
                            />

                            {/* Shelf Content */}
                            {currentShelf && (
                                <View style={styles.shelfContent}>
                                    <ScrollView
                                        horizontal
                                        showsHorizontalScrollIndicator={true}
                                        contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
                                    >
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
                                                                <Text
                                                                    style={[
                                                                        styles.boxText,
                                                                        isSelected && styles.boxTextSelected,
                                                                        !isAvailable && styles.boxTextOccupied,
                                                                    ]}
                                                                >
                                                                    {box.boxName}
                                                                </Text>
                                                                {isSelected && (
                                                                    <View style={styles.checkIcon}>
                                                                        <Check size={10} color="white" />
                                                                    </View>
                                                                )}
                                                            </TouchableOpacity>
                                                        );
                                                    })}
                                                </View>
                                            ))}
                                        </View>
                                    </ScrollView>
                                    <View style={styles.legendContainer}>
                                        <View style={styles.legendItem}>
                                            <View style={[styles.legendBox, styles.boxOccupied]} />
                                            <Text style={styles.legendText}>Có hàng</Text>
                                        </View>
                                        <View style={styles.legendItem}>
                                            <View style={[styles.legendBox, styles.boxSelected]} />
                                            <Text style={styles.legendText}>Đang chọn</Text>
                                        </View>
                                        <View style={styles.legendItem}>
                                            <View style={[styles.legendBox, styles.boxAvailable]} />
                                            <Text style={styles.legendText}>Trống</Text>
                                        </View>
                                    </View>
                                </View>
                            )}
                        </View>
                        <View style={{ height: 60 }} />
                    </ScrollView>

                    {/* Footer */}
                    <View style={styles.footer}>
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
        backgroundColor: '#F9FAFB',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        height: '92%',
        display: 'flex',
        flexDirection: 'column',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#111827',
    },
    closeButton: {
        padding: 4,
    },
    body: {
        flex: 1,
        padding: 16,
    },
    section: {
        marginBottom: 24,
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 5,
    },
    selectAllText: {
        color: '#3B82F6',
        fontWeight: '600',
        fontSize: 14,
    },

    // Selected List
    selectedList: {
        flexDirection: 'row',
        gap: 12,
    },
    selectedItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 12,
        backgroundColor: '#F3F4F6',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        minWidth: 160,
        marginRight: 12,
    },
    selectedItemInfo: {
        flex: 1,
    },
    selectedItemTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#111827',
        marginBottom: 2,
    },
    selectedItemSubtitle: {
        fontSize: 12,
        color: '#6B7280',
    },
    removeButton: {
        padding: 8,
        backgroundColor: '#FEE2E2',
        borderRadius: 8,
        marginLeft: 12,
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        borderWidth: 2,
        borderColor: '#F3F4F6',
        borderStyle: 'dashed',
        borderRadius: 12,
    },
    emptyText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#9CA3AF',
        marginBottom: 4,
    },
    emptySubText: {
        fontSize: 12,
        color: '#D1D5DB',
    },

    // Shelf Tabs
    shelfTabsContainer: {
        marginBottom: 16,
    },
    shelfTab: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        backgroundColor: '#F3F4F6',
        borderRadius: 20,
        marginRight: 8,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    shelfTabSelected: {
        backgroundColor: '#3B82F6',
        borderColor: '#3B82F6',
    },
    shelfTabText: {
        fontSize: 14,
        color: '#6B7280',
        fontWeight: '600',
    },
    shelfTabTextSelected: {
        color: '#fff',
    },

    // Shelf Visual
    shelfContent: {
        backgroundColor: '#F8FAFC',
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        minHeight: 220,
    },
    shelfBody: {
        flexDirection: 'row',
        padding: 12,
        backgroundColor: '#fff',
        borderRadius: 12,
        borderWidth: 4,
        borderColor: '#CBD5E1',
    },
    floor: {
        flexDirection: 'column',
        marginHorizontal: 4,
        borderRightWidth: 1,
        borderRightColor: '#F1F5F9',
    },
    box: {
        width: 56,
        height: 56,
        marginVertical: 4,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#CBD5E1',
    },
    boxAvailable: {
        backgroundColor: '#F1F5F9',
        opacity: 0.6,
    },
    boxOccupied: {
        backgroundColor: '#DCFCE7',
        borderColor: '#86EFAC',
    },
    boxSelected: {
        backgroundColor: '#3B82F6',
        borderColor: '#2563EB',
    },
    boxText: {
        fontSize: 12,
        color: '#6B7280',
        fontWeight: '600',
    },
    boxTextSelected: {
        color: '#fff',
    },
    boxTextOccupied: {
        color: '#166534',
    },
    checkIcon: {
        position: 'absolute',
        top: 4,
        right: 4,
    },
    legendContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 16,
        gap: 16,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    legendBox: {
        width: 16,
        height: 16,
        borderRadius: 4,
        borderWidth: 1,
    },
    legendText: {
        fontSize: 12,
        color: '#6B7280',
    },

    // Footer
    footer: {
        flexDirection: 'row',
        padding: 16,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
        gap: 12,
        marginBottom: 20,
    },
    btn: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
    },
    btnPrimary: {
        backgroundColor: '#3B82F6',
    },
    btnClose: {
        backgroundColor: '#F3F4F6',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        elevation: 0,
    },
    btnText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 16,
    },
});

export default ShowLocationDetail;
