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
import Modal from './Modal';
import { changeLocationBatch } from '../service/BatchBox.service';

const { width, height } = Dimensions.get('window');

const ChangeLocation = ({ isOpen, onClose, shelvesData, batches, fetchData }) => {
    const [selectedBatch, setSelectedBatch] = useState(null);
    const [locations, setLocations] = useState([]);
    const [localBatches, setLocalBatches] = useState([]);
    const [localShelves, setLocalShelves] = useState([]);
    const [selectedShelfID, setSelectedShelfID] = useState(null);

    // Init Data
    useEffect(() => {
        if (batches?.batches) {
            setLocations(batches.batches.map((item) => ({ batchID: item.batchID, locations: [] })));
            setLocalBatches(batches.batches.map((b) => ({ ...b })));
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
        if (found?.batch_boxes?.quantity == 0 && !checkBoxExists(box.boxID)) {
            return true;
        }
        return false;
    };

    const handleClickBox = (box) => {
        if (selectedBatch) {
            const batchLocation = locations.find((item) => item.batchID == selectedBatch);
            const batchFind = localBatches.find((item) => item.batchID === selectedBatch);
            const totalVolume = batchFind.unit.length * batchFind.unit.width * batchFind.unit.height;

            // Logic thêm vào box
            if (!batchLocation?.locations?.find((loc) => loc.boxID === box.boxID)) {
                const quantityCanAdd = Math.floor(box.remainingAcreage / totalVolume);
                let boxToAdd;
                let acreage;

                if (quantityCanAdd > batchFind.batch_boxes.quantity) {
                    boxToAdd = { ...box, quantity: batchFind.batch_boxes.quantity };
                    acreage = batchFind.batch_boxes.quantity * totalVolume;
                    setLocalBatches((prevBatches) =>
                        prevBatches.map((b) =>
                            b.batchID === selectedBatch ? { ...b, batch_boxes: { quantity: 0 } } : b,
                        ),
                    );
                } else {
                    boxToAdd = { ...box, quantity: quantityCanAdd };
                    acreage = quantityCanAdd * totalVolume;
                    setLocalBatches((prevBatches) =>
                        prevBatches.map((b) =>
                            b.batchID === selectedBatch
                                ? { ...b, batch_boxes: { quantity: b.batch_boxes.quantity - quantityCanAdd } }
                                : b,
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
                // Logic xóa khỏi box (Undo)
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
                        b.batchID === selectedBatch
                            ? { ...b, batch_boxes: { quantity: b.batch_boxes.quantity + quantityCanAdd } }
                            : b,
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

    const handleChangeInputQuantity = (boxID, value) => {
        const newQuantity = parseInt(value);
        if (isNaN(newQuantity)) return;

        const batchLocation = locations.find((item) => item.batchID == selectedBatch);
        const batchFind = localBatches.find((item) => item.batchID === selectedBatch);
        const locationFind = batchLocation.locations.find((loc) => loc.boxID === boxID);
        console.log('batchFind ', batchFind);

        const boxFind = localShelves
            .flatMap((shelf) => shelf.floor)
            .flatMap((col) => col.boxes)
            .find((b) => b.boxID === boxID);

        const totalVolume = batchFind.unit.length * batchFind.unit.width * batchFind.unit.height;
        const quantityDiff = newQuantity - locationFind.quantity;
        const acreageDiff = quantityDiff * totalVolume;

        if (newQuantity <= 0) {
            Alert.alert('Lỗi', 'Số lượng phải lớn hơn 0');
            return;
        } else if (quantityDiff > batchFind.batch_boxes.quantity) {
            Alert.alert('Lỗi', `Số lượng vượt quá số lượng còn lại (${batchFind.batch_boxes.quantity})`);
            return;
        }

        if (newQuantity * totalVolume > boxFind.remainingAcreage + locationFind.quantity * totalVolume) {
            Alert.alert('Lỗi', 'Số lượng vượt quá sức chứa của ô');
            return;
        }

        // Update State Logic
        setLocalBatches((prevBatches) =>
            prevBatches.map((b) =>
                b.batchID === selectedBatch
                    ? { ...b, batch_boxes: { quantity: b.batch_boxes.quantity - quantityDiff } }
                    : b,
            ),
        );

        setLocalShelves((prevShelves) =>
            prevShelves.map((shelf) => ({
                ...shelf,
                floor: shelf.floor.map((col) => ({
                    ...col,
                    boxes: col.boxes.map((b) =>
                        b.boxID === boxID ? { ...b, remainingAcreage: b.remainingAcreage - acreageDiff } : b,
                    ),
                })),
            })),
        );

        setLocations((prevLocations) =>
            prevLocations.map((item) =>
                item.batchID === selectedBatch
                    ? {
                          ...item,
                          locations: item.locations.map((loc) =>
                              loc.boxID === boxID ? { ...loc, quantity: newQuantity } : loc,
                          ),
                      }
                    : item,
            ),
        );
    };

    const handleUpdateLocation = async () => {
        const locationToUpdate = locations.map((item) => ({
            batchID: item.batchID,
            boxes: item.locations.map((loc) => ({ boxID: loc.boxID, quantity: loc.quantity })),
        }));

        const oldLocations = localBatches.map((item) => ({
            batchID: item.batchID,
            quantity: item.batch_boxes.quantity,
        }));

        const newLocations = locationToUpdate.map((item) => ({
            batchID: item.batchID,
            boxes: item.boxes.map((box) => ({ boxID: box.boxID, quantity: box.quantity })),
        }));

        try {
            const res = await changeLocationBatch({
                oldLocations,
                newLocations,
                boxID: batches.boxID,
            });

            if (res.data.status === 'OK') {
                Alert.alert('Thành công', 'Chuyển vị trí thành công');
                fetchData();
                handleOnClose();
            }
        } catch (error) {
            console.log(error);
            Alert.alert('Lỗi', 'Có lỗi xảy ra khi cập nhật');
        }
    };

    const handleOnClose = () => {
        setSelectedBatch(null);
        onClose();
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
                    Còn lại: <Text style={{ fontWeight: 'bold' }}>{item.batch_boxes.quantity}</Text>{' '}
                    {item.unit.unitName}
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

    const currentShelf = localShelves.find((s) => s.shelfID === selectedShelfID);

    return (
        <Modal isOpenInfo={isOpen} onClose={handleOnClose} showButtonClose={false}>
            <View style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Chuyển vị trí</Text>
                    <TouchableOpacity onPress={handleOnClose} style={styles.btnClose}>
                        <Text style={styles.btnCloseText}>Đóng</Text>
                    </TouchableOpacity>
                </View>
                <Text style={styles.subHeader}>Từ vị trí: {batches?.location}</Text>

                <ScrollView style={styles.contentContainer} showsVerticalScrollIndicator={false}>
                    {/* SECTION 1: DANH SÁCH LÔ HÀNG (Horizontal List) */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>1. Chọn lô hàng cần chuyển</Text>
                        <FlatList
                            data={localBatches}
                            renderItem={renderBatchCard}
                            keyExtractor={(item) => item.batchID.toString()}
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={{ paddingHorizontal: 2 }}
                        />
                    </View>

                    {/* SECTION 2: DANH SÁCH VỊ TRÍ ĐÍCH (Đã chọn) */}
                    {selectedBatch && (
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>2. Vị trí đích cho lô: {selectedBatch}</Text>
                            <View style={styles.selectedLocationsContainer}>
                                {locations
                                    .find((item) => item.batchID === selectedBatch)
                                    ?.locations?.map((location, index) => {
                                        const unit = localBatches.find((b) => b.batchID === selectedBatch)?.unit;
                                        const totalVolume = unit ? unit.length * unit.width * unit.height : 0;
                                        return (
                                            <View key={index} style={styles.locationCard}>
                                                <View style={styles.cardRowBetween}>
                                                    <Text style={styles.cardTitle}>{location.boxName}</Text>
                                                    <Text style={styles.textSmall}>
                                                        Dư: {location.remainingAcreage}
                                                    </Text>
                                                </View>
                                                <View style={styles.cardRowBetween}>
                                                    <Text style={styles.textSmall}>
                                                        Tiêu hao: {location.quantity * totalVolume}
                                                    </Text>
                                                    <View style={styles.inputContainer}>
                                                        <Text style={styles.textSmall}>SL chuyển: </Text>
                                                        <TextInput
                                                            style={styles.input}
                                                            value={String(location.quantity)}
                                                            keyboardType="numeric"
                                                            onChangeText={(val) =>
                                                                handleChangeInputQuantity(location.boxID, val)
                                                            }
                                                        />
                                                    </View>
                                                </View>
                                            </View>
                                        );
                                    })}
                                {locations.find((item) => item.batchID === selectedBatch)?.locations?.length === 0 && (
                                    <Text style={styles.emptyText}>Chưa chọn vị trí nào</Text>
                                )}
                            </View>
                        </View>
                    )}

                    {/* SECTION 3: SƠ ĐỒ KHO (VISUAL MAP) */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>3. Sơ đồ kệ hàng (Chạm để chọn)</Text>

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
                                                    const isCurrentSource = batches.boxID === box.boxID;

                                                    const isDisabled =
                                                        !selectedBatch ||
                                                        (!isEnough && !isExists) ||
                                                        isFullOrInvalid ||
                                                        isCurrentSource;

                                                    let boxStyle = [styles.box];
                                                    if (isExists) boxStyle.push(styles.boxActive);
                                                    else if (isEnough) boxStyle.push(styles.boxReady);
                                                    if (isDisabled) boxStyle.push(styles.boxDisabled);

                                                    return (
                                                        <TouchableOpacity
                                                            key={colIndex}
                                                            style={boxStyle}
                                                            disabled={isDisabled}
                                                            onPress={() => handleClickBox(box)}
                                                            onLongPress={() =>
                                                                Alert.alert(
                                                                    'Thông tin ô',
                                                                    `Mã: ${box.boxID}\nSức chứa còn: ${box.remainingAcreage}`,
                                                                )
                                                            }
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

                {/* Footer Action */}
                <View style={styles.footer}>
                    <TouchableOpacity style={styles.btnUpdateFooter} onPress={handleUpdateLocation}>
                        <Text style={styles.btnUpdateFooterText}>Cập nhật vị trí</Text>
                    </TouchableOpacity>
                </View>
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
    subHeader: {
        padding: 10,
        fontStyle: 'italic',
        color: '#2563eb',
        textAlign: 'center',
        backgroundColor: '#eff6ff',
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
        gap: 10,
    },
    locationCard: {
        backgroundColor: '#fff',
        padding: 10,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#e5e7eb',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    cardRowBetween: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 5,
    },
    cardTitle: {
        fontWeight: 'bold',
        fontSize: 14,
        color: '#1f2937',
    },
    textSmall: {
        fontSize: 12,
        color: '#6b7280',
    },
    emptyText: {
        fontStyle: 'italic',
        color: '#9ca3af',
        fontSize: 13,
        textAlign: 'center',
        marginTop: 10,
    },

    // Input
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    input: {
        borderWidth: 1,
        borderColor: '#d1d5db',
        borderRadius: 5,
        paddingVertical: 2,
        paddingHorizontal: 8,
        width: 60,
        textAlign: 'center',
        color: '#000',
        marginLeft: 5,
        fontSize: 13,
        backgroundColor: '#fff',
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
        elevation: 4,
        shadowColor: '#64748b',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    floor: {
        flexDirection: 'column',
        marginHorizontal: 6,
        borderRightWidth: 1,
        borderRightColor: '#f1f5f9',
    },
    box: {
        width: 55,
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
        paddingTop: 15,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#e5e7eb',
        alignItems: 'flex-end',
    },
    btnUpdateFooter: {
        backgroundColor: '#3b82f6',
        paddingHorizontal: 24,
        paddingVertical: 10,
        borderRadius: 8,
    },
    btnUpdateFooterText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 16,
    },
});

export default ChangeLocation;
