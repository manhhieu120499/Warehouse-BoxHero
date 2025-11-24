import React, { useEffect, useState, useCallback } from 'react';
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Alert,
    ScrollView,
    Dimensions,
    Keyboard,
    TouchableWithoutFeedback,
    ActivityIndicator,
} from 'react-native';
import { Search, RotateCcw } from 'lucide-react-native';
import Button from './Button';
import Modal from './Modal';
import parseToken from '../utilities/parseToken';
import { authIsAdmin, convertDateVN } from './common/Common';
import { getBatchesWithoutLocation } from '../service/Batch.service';
import { getBoxDetails } from '../service/Box.service';

// Card Item cho danh sách Batch
const BatchCard = React.memo(({ batch, isSelected, onCheckboxChange, currentUser, boxID }) => {
    const isAdmin = authIsAdmin(currentUser);
    const quantity = boxID ? batch.batch_boxes?.quantity : batch.remainAmount;

    if (boxID && quantity <= 0) {
        return null;
    }

    return (
        <TouchableOpacity
            style={[styles.batchCard, isSelected && styles.batchCardSelected]}
            onPress={() => isAdmin && onCheckboxChange(batch)}
            activeOpacity={0.7}
        >
            <View style={styles.batchCardHeader}>
                <View style={{ flex: 1 }}>
                    <Text style={styles.batchIdText}>Lô: {batch.batchID}</Text>
                    <Text style={styles.productNameText} numberOfLines={1}>
                        {batch.product?.productName}
                    </Text>
                </View>
                {isAdmin && (
                    <View style={[styles.checkbox, isSelected && styles.checkboxChecked]}>
                        {isSelected && <View style={styles.checkboxInner} />}
                    </View>
                )}
            </View>

            <View style={styles.divider} />

            <View style={styles.batchCardBody}>
                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Mã SP:</Text>
                    <Text style={styles.infoValue}>{batch.product?.productID}</Text>
                </View>
                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Số lượng:</Text>
                    <Text style={[styles.infoValue, styles.highlightText]}>
                        {quantity} {batch.unit?.unitName}
                    </Text>
                </View>
                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>NSX:</Text>
                    <Text style={styles.infoValue}>{convertDateVN(batch.manufactureDate)}</Text>
                </View>
                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>HSD:</Text>
                    <Text style={styles.infoValue}>{convertDateVN(batch.expiryDate)}</Text>
                </View>
            </View>
        </TouchableOpacity>
    );
});

const BoxDetail = ({ isOpen, onClose, boxID, setShowUpdateLocation, setShowChangeLocation, setBatchesUpdate }) => {
    const [batchID, setBatchID] = useState('');
    const [productID, setProductID] = useState('');
    const [boxDetail, setBoxDetail] = useState({});
    const [batches, setBatches] = useState([]);
    const [batchesWithoutLocation, setBatchesWithoutLocation] = useState([]);
    const [selectedBatches, setSelectedBatches] = useState([]);
    const [selectAll, setSelectAll] = useState(false);
    const [loading, setLoading] = useState(false);

    const currentUser = { empRole: [{ roleName: 'SYSTEM_ADMIN' }] }; // Mock data

    const handleSelectAllChange = useCallback(() => {
        if (selectAll) {
            setSelectedBatches([]);
            setSelectAll(false);
        } else {
            const batchesToSelect = boxID ? batches.filter((batch) => batch.batch_boxes?.quantity > 0) : batches;
            setSelectedBatches(batchesToSelect);
            setSelectAll(true);
        }
    }, [selectAll, batches, boxID]);

    const handleCheckboxChange = useCallback(
        (batch) => {
            setSelectedBatches((prev) => {
                const isSelected = prev.some((item) => item.batchID === batch.batchID);
                let updated;
                if (isSelected) {
                    updated = prev.filter((item) => item.batchID !== batch.batchID);
                } else {
                    updated = [...prev, batch];
                }
                const visibleBatchesCount = boxID
                    ? batches.filter((b) => b.batch_boxes?.quantity > 0).length
                    : batches.length;
                setSelectAll(updated.length > 0 && updated.length === visibleBatchesCount);
                return updated;
            });
        },
        [batches, boxID],
    );

    useEffect(() => {
        if (isOpen) {
            const fetchBoxDetails = async () => {
                const warehouse = await parseToken('warehouse');

                if (boxID) {
                    setLoading(true);
                    const res = await getBoxDetails(warehouse.warehouseID, boxID);
                    if (res?.data?.data) {
                        setBoxDetail(res.data.data);
                        setBatches(res.data.data.batches);
                    }
                    setLoading(false);
                } else {
                    setLoading(true);
                    const res = await getBatchesWithoutLocation(warehouse.warehouseID);
                    if (res?.data?.data) {
                        setBatchesWithoutLocation(res.data.data);
                        setBatches(res.data.data);
                    }
                    setLoading(false);
                }
            };
            fetchBoxDetails();
        }
    }, [isOpen, boxID]);

    const handleCLoseModel = useCallback(() => {
        setBatchID('');
        setProductID('');
        setBoxDetail({});
        setBatches([]);
        setSelectedBatches([]);
        setSelectAll(false);
        onClose();
    }, [onClose]);

    const handleSearch = useCallback(() => {
        const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const searchBatchID = new RegExp(escapeRegex(batchID), 'i');
        const searchProductID = new RegExp(escapeRegex(productID), 'i');
        const sourceBatches = boxID ? boxDetail.batches : batchesWithoutLocation;

        const filteredBatches = (sourceBatches || []).filter((batch) => {
            return searchBatchID.test(batch.batchID ?? '') && searchProductID.test(batch.product?.productID ?? '');
        });
        setBatches(filteredBatches);
        setSelectedBatches([]);
        setSelectAll(false);
        Keyboard.dismiss();
    }, [batchID, productID, boxID, boxDetail.batches, batchesWithoutLocation]);

    const handleReset = useCallback(() => {
        setBatchID('');
        setProductID('');
        setBatches(boxID ? boxDetail.batches || [] : batchesWithoutLocation);
        setSelectedBatches([]);
        setSelectAll(false);
        Keyboard.dismiss();
    }, [boxID, boxDetail.batches, batchesWithoutLocation]);

    const handleUpdateLocation = useCallback(() => {
        if (selectedBatches.length === 0) {
            Alert.alert('Lỗi', 'Vui lòng chọn ít nhất một lô hàng.');
            return;
        }
        if (boxID) {
            const location =
                boxDetail?.boxName + ' - ' + boxDetail?.floor?.floorName + ' - ' + boxDetail?.floor?.shelf?.shelfName;
            if (setBatchesUpdate) setBatchesUpdate({ boxID: boxID, batches: selectedBatches, location });
            if (setShowChangeLocation) setShowChangeLocation(true);
        } else {
            if (setBatchesUpdate) setBatchesUpdate(selectedBatches);
            if (setShowUpdateLocation) setShowUpdateLocation(true);
        }
        handleCLoseModel();
    }, [
        boxID,
        boxDetail,
        selectedBatches,
        setShowChangeLocation,
        setShowUpdateLocation,
        setBatchesUpdate,
        handleCLoseModel,
    ]);

    const visibleBatches = batches;

    return (
        <Modal isOpenInfo={isOpen} onClose={handleCLoseModel} showButtonClose={false}>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={styles.container}>
                    {loading ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color="#3B82F6" />
                            <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
                        </View>
                    ) : (
                        <>
                            {/* --- CARD THÔNG TIN CHUNG --- */}
                            {boxID && (
                                <View style={styles.card}>
                                    <View style={styles.cardHeader}>
                                        <Text style={styles.cardTitle}>Thông tin chung</Text>

                                        <TouchableOpacity onPress={handleCLoseModel} style={styles.btnClose}>
                                            <Text style={styles.btnCloseText}>Đóng</Text>
                                        </TouchableOpacity>
                                    </View>
                                    <View style={styles.infoGrid}>
                                        <View style={styles.infoItemFull}>
                                            <Text style={styles.label}>Vị trí:</Text>
                                            <Text style={styles.valueText}>
                                                {`${boxDetail?.boxName || ''} - ${boxDetail?.floor?.floorName || ''} - ${boxDetail?.floor?.shelf?.shelfName || ''}`}
                                            </Text>
                                        </View>
                                        <View style={styles.infoItem}>
                                            <Text style={styles.label}>Rộng:</Text>
                                            <Text style={styles.valueText}>{boxDetail?.width}</Text>
                                        </View>
                                        <View style={styles.infoItem}>
                                            <Text style={styles.label}>Dài:</Text>
                                            <Text style={styles.valueText}>{boxDetail?.length}</Text>
                                        </View>
                                        <View style={styles.infoItem}>
                                            <Text style={styles.label}>Cao:</Text>
                                            <Text style={styles.valueText}>2</Text>
                                        </View>
                                        <View style={styles.infoItem}>
                                            <Text style={styles.label}>Tổng V:</Text>
                                            <Text style={styles.valueText}>{boxDetail?.maxAcreage}</Text>
                                        </View>
                                        <View style={styles.infoItem}>
                                            <Text style={styles.label}>Còn lại:</Text>
                                            <Text style={[styles.valueText, { color: '#ef4444' }]}>
                                                {boxDetail?.remainingAcreage}
                                            </Text>
                                        </View>
                                    </View>
                                </View>
                            )}

                            {/* --- CARD CHI TIẾT LÔ --- */}
                            <View style={[styles.card, { flex: 1 }]}>
                                <View style={styles.cardHeader}>
                                    <Text style={styles.cardTitle}>
                                        {boxID ? 'Danh sách lô trong ô' : 'Danh sách lô chưa có vị trí'}
                                    </Text>
                                    {!boxID && (
                                        <TouchableOpacity onPress={handleCLoseModel} style={styles.btnClose}>
                                            <Text style={styles.btnCloseText}>Đóng</Text>
                                        </TouchableOpacity>
                                    )}
                                </View>

                                {/* Filter Area */}
                                <View style={styles.filterContainer}>
                                    <View style={styles.inputRow}>
                                        <TextInput
                                            style={styles.input}
                                            placeholder="Mã lô"
                                            value={batchID}
                                            onChangeText={setBatchID}
                                        />
                                        <TextInput
                                            style={styles.input}
                                            placeholder="Mã SP"
                                            value={productID}
                                            onChangeText={setProductID}
                                        />
                                        <TouchableOpacity onPress={handleSearch} style={styles.iconBtn}>
                                            <Search size={20} color="#FFFFFF" />
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            onPress={handleReset}
                                            style={[styles.iconBtn, styles.resetBtn]}
                                        >
                                            <RotateCcw size={20} color="#334155" />
                                        </TouchableOpacity>
                                    </View>
                                </View>

                                {/* Action Bar */}
                                {authIsAdmin(currentUser) && (
                                    <View style={styles.actionBar}>
                                        <TouchableOpacity onPress={handleSelectAllChange} style={styles.selectAllBtn}>
                                            <View style={[styles.checkbox, selectAll && styles.checkboxChecked]}>
                                                {selectAll && <View style={styles.checkboxInner} />}
                                            </View>
                                            <Text style={styles.selectAllText}>Chọn tất cả</Text>
                                        </TouchableOpacity>

                                        <Button
                                            disabled={selectedBatches.length === 0}
                                            primary
                                            onPress={handleUpdateLocation}
                                            style={[
                                                styles.actionButton,
                                                selectedBatches.length === 0 && { opacity: 0.5 },
                                            ]}
                                        >
                                            {!boxID ? 'Cập nhật' : 'Chuyển kho'}
                                        </Button>
                                    </View>
                                )}

                                {/* --- LIST AREA --- */}
                                <FlatList
                                    data={visibleBatches}
                                    keyExtractor={(item) => item.batchID.toString()}
                                    renderItem={({ item }) => (
                                        <BatchCard
                                            batch={item}
                                            isSelected={selectedBatches.some((b) => b.batchID === item.batchID)}
                                            onCheckboxChange={handleCheckboxChange}
                                            currentUser={currentUser}
                                            boxID={boxID}
                                        />
                                    )}
                                    ListEmptyComponent={<Text style={styles.emptyText}>Không có dữ liệu.</Text>}
                                    contentContainerStyle={{ paddingBottom: 20 }}
                                    showsVerticalScrollIndicator={false}
                                />
                            </View>
                        </>
                    )}
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        height: Dimensions.get('window').height * 0.85,
        backgroundColor: '#f3f4f6',
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        overflow: 'hidden',
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
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
    card: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 12,
        marginBottom: 12,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1f2937',
        borderLeftWidth: 4,
        borderLeftColor: '#3b82f6',
        paddingLeft: 8,
    },
    // Info Grid
    infoGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    infoItem: {
        width: '30%',
        backgroundColor: '#f9fafb',
        padding: 8,
        borderRadius: 8,
    },
    infoItemFull: {
        width: '100%',
        backgroundColor: '#f9fafb',
        padding: 8,
        borderRadius: 8,
        marginBottom: 4,
    },
    label: {
        fontSize: 12,
        color: '#6b7280',
        marginBottom: 2,
    },
    valueText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#111827',
    },

    // Filter
    filterContainer: {
        marginBottom: 12,
    },
    inputRow: {
        flexDirection: 'row',
        gap: 8,
        alignItems: 'center',
    },
    input: {
        flex: 1,
        backgroundColor: '#f9fafb',
        borderWidth: 1,
        borderColor: '#e5e7eb',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 14,
    },
    iconBtn: {
        width: 42,
        height: 42,
        backgroundColor: '#3B82F6',
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    resetBtn: {
        backgroundColor: '#F1F5F9',
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },

    // Action Bar
    actionBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
    },
    selectAllBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    selectAllText: {
        fontSize: 14,
        color: '#374151',
        fontWeight: '500',
    },
    actionButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
    },

    // Batch Card
    batchCard: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#e5e7eb',
        borderRadius: 10,
        padding: 12,
        marginBottom: 10,
    },
    batchCardSelected: {
        borderColor: '#3b82f6',
        backgroundColor: '#eff6ff',
    },
    batchCardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    batchIdText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#3b82f6',
    },
    productNameText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#1f2937',
        marginTop: 2,
    },
    divider: {
        height: 1,
        backgroundColor: '#f3f4f6',
        marginVertical: 8,
    },
    batchCardBody: {
        gap: 4,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    infoLabel: {
        fontSize: 13,
        color: '#6b7280',
    },
    infoValue: {
        fontSize: 13,
        color: '#374151',
        fontWeight: '500',
    },
    highlightText: {
        color: '#059669',
        fontWeight: '700',
    },

    // Checkbox
    checkbox: {
        width: 20,
        height: 20,
        borderWidth: 2,
        borderColor: '#d1d5db',
        borderRadius: 4,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff',
    },
    checkboxChecked: {
        borderColor: '#3b82f6',
        backgroundColor: '#3b82f6',
    },
    checkboxInner: {
        width: 10,
        height: 10,
        backgroundColor: '#fff',
        borderRadius: 2,
    },

    emptyText: {
        textAlign: 'center',
        color: '#9ca3af',
        marginTop: 20,
        fontStyle: 'italic',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 12,
        fontSize: 14,
        color: '#6B7280',
        fontWeight: '500',
    },
});

export default BoxDetail;
