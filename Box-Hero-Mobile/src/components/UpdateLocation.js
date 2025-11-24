import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    TextInput,
    Alert,
    Dimensions,
    FlatList,
} from 'react-native';
import Modal from './Modal'; // Use custom Modal
import parseToken from '../utilities/parseToken';
import { updateLocationBatch } from '../service/batchBox.service';
import ModalSuggestLocation from './ModalSuggestLocation';
import { handleCopy } from './common/Common';

const { width, height } = Dimensions.get('window');

const UpdateLocation = ({ isOpen, onClose, shelvesData, batches, fetchData }) => {
    const [selectedBatch, setSelectedBatch] = useState(null);
    const [locations, setLocations] = useState([]);
    const [localBatches, setLocalBatches] = useState([]);
    const [localShelves, setLocalShelves] = useState([]);
    const [selectedShelfID, setSelectedShelfID] = useState(null);
    const [showModalSuggestLocation, setShowModalSuggestLocation] = useState(false);

    useEffect(() => {
        if (batches) {
            setLocations(batches.map((item) => ({ batchID: item.batchID, locations: [] })));
            setLocalBatches(batches.map((b) => ({ ...b })));
        }
        if (shelvesData) {
            setLocalShelves(shelvesData.map((s) => ({ ...s })));
            if (shelvesData.length > 0) {
                setSelectedShelfID(shelvesData[0].shelfID);
            }
        }
    }, [batches, shelvesData]);

    const handleSelectBatch = (batchID) => {
        setSelectedBatch(batchID);
    };

    const handleClickBox = (box) => {
        if (selectedBatch) {
            const batchLocation = locations.find((item) => item.batchID == selectedBatch);
            const batchFind = localBatches.find((item) => item.batchID === selectedBatch);
            const totalVolume = batchFind.unit.length * batchFind.unit.width * batchFind.unit.height;

            if (!batchLocation?.locations?.find((loc) => loc.boxID === box.boxID)) {
                // Logic thêm vào box
                const quantityCanAdd = Math.floor(box.remainingAcreage / totalVolume);
                let boxToAdd;
                let acreage;

                if (quantityCanAdd > batchFind.remainAmount) {
                    boxToAdd = { ...box, quantity: batchFind.remainAmount };
                    acreage = batchFind.remainAmount * totalVolume;
                    setLocalBatches((prevBatches) =>
                        prevBatches.map((b) => (b.batchID === selectedBatch ? { ...b, remainAmount: 0 } : b)),
                    );
                } else {
                    boxToAdd = { ...box, quantity: quantityCanAdd };
                    acreage = quantityCanAdd * totalVolume;
                    setLocalBatches((prevBatches) =>
                        prevBatches.map((b) =>
                            b.batchID === selectedBatch ? { ...b, remainAmount: b.remainAmount - quantityCanAdd } : b,
                        ),
                    );
                }

                setLocalShelves((prevShelves) =>
                    prevShelves.map((shelf) => ({
                        ...shelf,
                        floor: shelf.floor.map((col) => ({
                            ...col,
                            boxes: col.boxes.map((b) =>
                                b.boxID === box.boxID ? { ...b, remainingAcreage: b.remainingAcreage - acreage } : b,
                            ),
                        })),
                    })),
                );

                setLocations((prevLocations) =>
                    prevLocations.map((item) =>
                        item.batchID === selectedBatch ? { ...item, locations: [...item.locations, boxToAdd] } : item,
                    ),
                );
            } else {
                // Logic xóa khỏi box (undo)
                const quantityCanAdd = batchLocation.locations.find((loc) => loc.boxID === box.boxID).quantity;

                setLocalShelves((prevShelves) =>
                    prevShelves.map((shelf) => ({
                        ...shelf,
                        floor: shelf.floor.map((col) => ({
                            ...col,
                            boxes: col.boxes.map((b) =>
                                b.boxID === box.boxID
                                    ? { ...b, remainingAcreage: b.remainingAcreage + quantityCanAdd * totalVolume }
                                    : b,
                            ),
                        })),
                    })),
                );

                setLocalBatches((prevBatches) =>
                    prevBatches.map((b) =>
                        b.batchID === selectedBatch ? { ...b, remainAmount: b.remainAmount + quantityCanAdd } : b,
                    ),
                );

                setLocations((prevLocations) =>
                    prevLocations.map((item) =>
                        item.batchID === selectedBatch
                            ? { ...item, locations: item.locations.filter((loc) => loc.boxID !== box.boxID) }
                            : item,
                    ),
                );
            }
        }
    };

    const handleOnClose = () => {
        setSelectedBatch(null);
        onClose();
    };

    const checkBoxExists = (boxID) => {
        const locationFind = locations.find((item) => item.batchID === selectedBatch);
        const found = locationFind?.locations.find((loc) => loc.boxID === boxID);
        return !!found;
    };

    const checkEnoughCoverage = (box) => {
        const found = localBatches.find((item) => item.batchID === selectedBatch);
        if (found && found.unit.length * found.unit.width * found.unit.height <= box.remainingAcreage) {
            return true;
        }
        return false;
    };

    const checkTotalQuantity = (box) => {
        const found = localBatches.find((item) => item.batchID === selectedBatch);
        if (found?.remainAmount == 0 && !checkBoxExists(box.boxID)) {
            return true;
        }
        return false;
    };

    const handleUpdateLocation = async () => {
        // Validate
        for (const item of locations) {
            const batchFind = localBatches.find((b) => b.batchID === item.batchID);
            if (batchFind?.remainAmount > 0) {
                Alert.alert('Lỗi', `Lô ${item.batchID} còn ${batchFind?.remainAmount} sản phẩm chưa được phân bổ`);
                return;
            }
        }

        const locationToUpdate = locations.map((item) => ({
            batchID: item.batchID,
            boxes: item.locations.map((loc) => ({ boxID: loc.boxID, quantity: loc.quantity })),
        }));

        try {
            const warehouse = await parseToken('warehouse');
            const res = await updateLocationBatch(warehouse.warehouseID, locationToUpdate);

            if (res?.data?.status === 'OK') {
                Alert.alert('Thành công', 'Cập nhật vị trí thành công');
                fetchData();
                handleOnClose();
            }
        } catch (error) {
            console.error(error);
            Alert.alert('Lỗi', 'Có lỗi xảy ra khi cập nhật');
        }
    };

    const handleSuggestLocationSubmit = (dataSubmit) => {
        try {
            const localShelvesConvert = handleCopy(shelvesData);
            const localBatchesConvert = batches.map((b) => ({ ...b }));
            dataSubmit.forEach((item) => {
                const batchFind = localBatchesConvert.find((b) => b.batchID === item.batchID);
                let totalAssigned = 0;
                item.locations.forEach((loc) => {
                    totalAssigned += loc.quantity;
                    const totalVolume = batchFind.unit.length * batchFind.unit.width * batchFind.unit.height;

                    localShelvesConvert.forEach((shelf) => {
                        shelf.floor.forEach((col) => {
                            col.boxes.forEach((b) => {
                                if (b.boxID === loc.boxID) {
                                    b.remainingAcreage -= loc.quantity * totalVolume;
                                }
                            });
                        });
                    });
                });
                batchFind.remainAmount -= totalAssigned;
            });

            setLocations(dataSubmit);

            setLocalShelves(localShelvesConvert);
            setLocalBatches(localBatchesConvert);
            setSelectedBatch(dataSubmit[0]?.batchID || null);
        } catch (error) {
            console.error(error);
            Alert.alert('Lỗi', 'Có lỗi xảy ra khi gợi ý vị trí');
        }
    };

    // Render Batch Card
    const renderBatchCard = ({ item }) => {
        const isSelected = selectedBatch === item.batchID;
        return (
            <TouchableOpacity
                style={[styles.batchCard, isSelected && styles.batchCardSelected]}
                onPress={() => handleSelectBatch(item.batchID)}
            >
                <Text style={[styles.batchCardTitle, isSelected && styles.textSelected]}>Lô: {item.batchID}</Text>
                <Text style={[styles.batchCardText, isSelected && styles.textSelected]} numberOfLines={1}>
                    {item.product.productName}
                </Text>
                <Text style={[styles.batchCardText, isSelected && styles.textSelected]}>
                    Còn lại: <Text style={{ fontWeight: 'bold' }}>{item.remainAmount}</Text> {item.unit.unitName}
                </Text>
            </TouchableOpacity>
        );
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

    // Get current shelf data
    const currentShelf = localShelves.find((s) => s.shelfID === selectedShelfID);

    return (
        <Modal isOpenInfo={isOpen} onClose={handleOnClose} showButtonClose={false}>
            <View style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Phân bổ vị trí</Text>
                    <TouchableOpacity onPress={handleOnClose} style={styles.btnClose}>
                        <Text style={styles.btnCloseText}>Đóng</Text>
                    </TouchableOpacity>
                </View>

                <ScrollView style={styles.contentContainer} showsVerticalScrollIndicator={false}>
                    {/* SECTION 1: DANH SÁCH LÔ HÀNG (Horizontal List) */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>1. Chọn lô hàng</Text>
                        <FlatList
                            data={localBatches}
                            renderItem={renderBatchCard}
                            keyExtractor={(item) => item.batchID.toString()}
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={{ paddingHorizontal: 2 }}
                        />
                    </View>

                    {/* SECTION 2: DANH SÁCH VỊ TRÍ ĐÃ CHỌN */}
                    {selectedBatch && (
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>2. Vị trí đã chọn (Lô {selectedBatch})</Text>
                            <View style={styles.selectedLocationsContainer}>
                                {locations
                                    .find((item) => item.batchID === selectedBatch)
                                    ?.locations?.map((location, index) => (
                                        <View key={index} style={styles.locationTag}>
                                            <Text style={styles.locationTagText}>
                                                {location.boxName}: {location.quantity}
                                            </Text>
                                        </View>
                                    ))}
                                {locations.find((item) => item.batchID === selectedBatch)?.locations?.length === 0 && (
                                    <Text style={styles.emptyText}>Chưa chọn vị trí nào</Text>
                                )}
                            </View>
                        </View>
                    )}

                    {/* SECTION 3: VISUAL SHELF (SƠ ĐỒ - TABBED) */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>3. Sơ đồ kho (Chạm để chọn)</Text>

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
                                <ScrollView
                                    horizontal
                                    contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
                                    showsHorizontalScrollIndicator={true}
                                >
                                    <View style={styles.shelfBody}>
                                        {currentShelf.floor?.map((column, index) => (
                                            <View style={styles.floor} key={index}>
                                                {column.boxes.map((box, colIndex) => {
                                                    const isExists = checkBoxExists(box.boxID);
                                                    const isEnough = checkEnoughCoverage(box);
                                                    const isFullOrInvalid = checkTotalQuantity(box);
                                                    const isDisabled =
                                                        !selectedBatch || (!isEnough && !isExists) || isFullOrInvalid;

                                                    let boxStyle = [styles.box];
                                                    if (isExists) boxStyle.push(styles.boxActive);
                                                    else if (isEnough) boxStyle.push(styles.boxReady);
                                                    else if (box.remainingAcreage === 0) boxStyle.push(styles.boxFull);

                                                    return (
                                                        <TouchableOpacity
                                                            key={colIndex}
                                                            disabled={isDisabled}
                                                            onPress={() => handleClickBox(box)}
                                                            onLongPress={() =>
                                                                Alert.alert(
                                                                    'Thông tin hộp',
                                                                    `Tên: ${box.boxName}\nID: ${box.boxID}\nCòn trống: ${box.remainingAcreage}`,
                                                                )
                                                            }
                                                            style={[boxStyle, isDisabled && styles.boxDisabled]}
                                                        >
                                                            <Text style={styles.boxText}>{box.boxName}</Text>
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
                    <TouchableOpacity onPress={() => setShowModalSuggestLocation(true)} style={styles.btnSuggestFooter}>
                        <Text style={styles.btnUpdateFooterText}>Gợi ý vị trí</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleUpdateLocation} style={styles.btnUpdateFooter}>
                        <Text style={styles.btnUpdateFooterText}>Cập nhật</Text>
                    </TouchableOpacity>
                </View>

                {showModalSuggestLocation && (
                    <ModalSuggestLocation
                        batches={batches}
                        isOpen={showModalSuggestLocation}
                        onClose={() => setShowModalSuggestLocation(false)}
                        handleSuggestLocationSubmit={handleSuggestLocationSubmit}
                    />
                )}
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        height: height * 0.85,
        backgroundColor: '#f9fafb',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        paddingBottom: 15,
        borderBottomColor: '#e5e7eb',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#111827',
    },
    btnClose: {
        paddingHorizontal: 12,
        paddingVertical: 6,
    },
    btnCloseText: {
        color: '#ef4444',
        fontWeight: '600',
        fontSize: 16,
    },
    contentContainer: {
        flex: 1,
        padding: 12,
    },
    section: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 15,
        fontWeight: '700',
        color: '#374151',
        marginBottom: 10,
    },

    // Batch Card Styles
    batchCard: {
        backgroundColor: '#fff',
        padding: 12,
        borderRadius: 8,
        marginRight: 10,
        width: 160,
        borderWidth: 1,
        borderColor: '#e5e7eb',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    batchCardSelected: {
        borderColor: '#3b82f6',
        backgroundColor: '#eff6ff',
        borderWidth: 2,
    },
    batchCardTitle: {
        fontWeight: '700',
        fontSize: 14,
        color: '#3b82f6',
        marginBottom: 4,
    },
    batchCardText: {
        fontSize: 12,
        color: '#4b5563',
        marginBottom: 2,
    },
    textSelected: {
        color: '#1e3a8a',
    },

    // Selected Locations
    selectedLocationsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        backgroundColor: '#fff',
        padding: 10,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#e5e7eb',
    },
    locationTag: {
        backgroundColor: '#dbeafe',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#93c5fd',
    },
    locationTagText: {
        fontSize: 12,
        color: '#1e40af',
        fontWeight: '500',
    },
    emptyText: {
        fontStyle: 'italic',
        color: '#9ca3af',
        fontSize: 13,
    },

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

    // Shelf Content
    shelfContent: {
        backgroundColor: '#f8fafc', // Light background for the "room"
        padding: 20,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        minHeight: 220,
        justifyContent: 'center',
        alignItems: 'center', // Center the rack itself
    },
    shelfBody: {
        flexDirection: 'row',
        padding: 10,
        backgroundColor: '#fff', // White background for the rack
        borderRadius: 8,
        borderWidth: 4, // Thicker border for rack frame
        borderColor: '#cbd5e1', // Metal-like color
        elevation: 4, // Shadow for depth
        shadowColor: '#64748b',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    floor: {
        flexDirection: 'column',
        marginHorizontal: 6, // More spacing between columns
        borderRightWidth: 1, // Divider between columns
        borderRightColor: '#f1f5f9',
    },
    box: {
        width: 55, // Slightly larger boxes
        height: 55,
        backgroundColor: '#f1f5f9',
        marginVertical: 4,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#cbd5e1',
    },
    boxActive: {
        backgroundColor: '#22c55e', // Green
        borderColor: '#15803d',
        borderWidth: 2,
    },
    boxReady: {
        backgroundColor: '#60a5fa', // Blue
        borderColor: '#2563eb',
    },
    boxFull: {
        backgroundColor: '#ef4444', // Red
        opacity: 0.6,
    },
    boxDisabled: {
        opacity: 0.3,
        backgroundColor: '#f3f4f6',
    },
    boxText: {
        fontSize: 11,
        color: '#1f2937',
        fontWeight: '700',
    },

    // Footer
    footer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        paddingTop: 15,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#e5e7eb',
    },
    btnUpdateFooter: {
        backgroundColor: '#3b82f6',
        paddingHorizontal: 24,
        paddingVertical: 10,
        borderRadius: 8,
    },
    btnSuggestFooter: {
        backgroundColor: '#191919',
        paddingHorizontal: 24,
        paddingVertical: 10,
        borderRadius: 8,
        marginRight: 10,
    },
    btnUpdateFooterText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 16,
    },
});

export default UpdateLocation;
