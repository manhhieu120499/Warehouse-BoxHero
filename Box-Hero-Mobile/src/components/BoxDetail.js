import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, TextInput, StyleSheet, FlatList, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { useSelector } from 'react-redux';
import { MapPinPen, MoveIcon } from 'lucide-react-native';
import Button from './Button';
import Modal from './Modal';
import { getBoxDetails } from '../service/box.service';
import parseToken from '../utilities/parseToken';
import { authIsAdmin, convertDateVN } from './common/Common';
import { getBatchesWithoutLocation } from '../service/batch.service';

// Header cho FlatList (Mô phỏng <thead>)
const TableHeader = React.memo(({ handleSelectAllChange, selectAll, currentUser, boxID }) => {
    const isAdmin = authIsAdmin(currentUser);
    return (
        <View style={[styles.tableRow, styles.tableHeader]}>
            {isAdmin && (
                <View style={styles.tableHeadCellCheckbox}>
                    <TouchableOpacity onPress={handleSelectAllChange}>
                        <View style={[styles.checkboxRN, selectAll && styles.checkboxCheckedRN]} />
                    </TouchableOpacity>
                </View>
            )}
            <Text style={[styles.tableHeadCell, styles.stt]}>Mã lô</Text>
            <Text style={[styles.tableHeadCell, styles.productID]}>Mã SP</Text>
            <Text style={[styles.tableHeadCell, styles.productName]}>Tên SP</Text>
            <Text style={[styles.tableHeadCell, styles.unit]}>ĐVT</Text>
            <Text style={[styles.tableHeadCell, styles.numHeader]}>SL</Text>
            <Text style={[styles.tableHeadCell, styles.note]}>Ngày sản xuất</Text>
            <Text style={[styles.tableHeadCell, styles.note]}>Ngày hết hạn</Text>
        </View>
    );
});

// Item cho FlatList (Mô phỏng <tr>)
const BatchRow = React.memo(({ batch, isSelected, onCheckboxChange, currentUser, boxID }) => {
    const isAdmin = authIsAdmin(currentUser);
    const quantity = boxID ? batch.batch_boxes?.quantity : batch.remainAmount;

    // Chỉ hiển thị các lô có số lượng > 0 trong box detail
    if (boxID && quantity <= 0) {
        return null;
    }

    return (
        <View style={styles.tableRow}>
            {isAdmin && (
                <View style={styles.tableCellCheckbox}>
                    <TouchableOpacity onPress={() => onCheckboxChange(batch)}>
                        <View style={[styles.checkboxRN, isSelected && styles.checkboxCheckedRN]} />
                    </TouchableOpacity>
                </View>
            )}
            <Text style={[styles.tableCell, styles.stt]}>{batch.batchID}</Text>
            <Text style={[styles.tableCell, styles.productID]}>{batch.product?.productID}</Text>
            <Text style={[styles.tableCell, styles.productName]}>{batch.product?.productName}</Text>
            <Text style={[styles.tableCell, styles.unit]}>{batch.unit?.unitName}</Text>
            <Text style={[styles.tableCell, styles.numCell]}>{quantity}</Text>
            <Text style={[styles.tableCell, styles.note]}>{convertDateVN(batch.manufactureDate)}</Text>
            <Text style={[styles.tableCell, styles.note]}>{convertDateVN(batch.expiryDate)}</Text>
        </View>
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

    // Giả định: Lấy currentUser từ Redux store
    const currentUser = useSelector((state) => state.AuthSlice.user);

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

                // Cập nhật lại trạng thái checkbox tổng
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
            const warehouse = parseToken('warehouse');
            const warehouseID = warehouse?.warehouseID;

            if (boxID) {
                // fetch box details
                const fetchBoxDetails = async () => {
                    const res = await getBoxDetails(warehouseID, boxID);
                    if (res?.data?.data) {
                        setBoxDetail(res.data.data);
                        setBatches(res.data.data.batches);
                    }
                };
                fetchBoxDetails();
            } else {
                // fetch batches without location (kho tạm)
                const fetchBatchesWithoutLocation = async () => {
                    const res = await getBatchesWithoutLocation(warehouseID);
                    if (res?.data?.data) {
                        setBatchesWithoutLocation(res.data.data);
                        setBatches(res.data.data);
                    }
                };
                fetchBatchesWithoutLocation();
            }
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
            const batchIdMatch = searchBatchID.test(batch.batchID ?? '');
            const productIdMatch = searchProductID.test(batch.product?.productID ?? '');
            return batchIdMatch && productIdMatch;
        });

        setBatches(filteredBatches);
        setSelectedBatches([]);
        setSelectAll(false);
    }, [batchID, productID, boxID, boxDetail.batches, batchesWithoutLocation]);

    const handleReset = useCallback(() => {
        setBatchID('');
        setProductID('');
        if (!boxID) {
            setBatches(batchesWithoutLocation);
        } else {
            setBatches(boxDetail.batches || []);
        }
        setSelectedBatches([]);
        setSelectAll(false);
    }, [boxID, boxDetail.batches, batchesWithoutLocation]);

    const handleUpdateLocation = useCallback(() => {
        if (selectedBatches.length === 0) {
            Alert.alert('Lỗi', 'Vui lòng chọn ít nhất một lô hàng.');
            return;
        }

        if (boxID) {
            const location =
                boxDetail?.boxName + ' - ' + boxDetail?.floor?.floorName + ' - ' + boxDetail?.floor?.shelf?.shelfName;

            if (setBatchesUpdate) {
                setBatchesUpdate({
                    boxID: boxID,
                    batches: selectedBatches,
                    location,
                });
            }
            if (setShowChangeLocation) {
                setShowChangeLocation(true);
            }
        } else {
            // chuyển vị trí kho tạm
            if (setBatchesUpdate) {
                setBatchesUpdate(selectedBatches);
            }
            if (setShowUpdateLocation) {
                setShowUpdateLocation(true);
            }
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

    const visibleBatches = batches; // Logic lọc quantity > 0 đã được đưa vào BatchRow

    return (
        <Modal isOpenInfo={isOpen} onClose={handleCLoseModel} showButtonClose={false}>
            {boxID && (
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Thông tin chung</Text>
                    <View style={styles.grid4}>
                        <View style={styles.field}>
                            <Text style={styles.label}>Vị trí</Text>
                            <TextInput
                                editable={false}
                                value={
                                    (boxDetail?.boxName || '') +
                                    ' - ' +
                                    (boxDetail?.floor?.floorName || '') +
                                    ' - ' +
                                    (boxDetail?.floor?.shelf?.shelfName || '')
                                }
                                style={styles.inputReadOnly}
                            />
                        </View>
                        <View style={styles.field}>
                            <Text style={styles.label}>Chiều rộng</Text>
                            <TextInput
                                editable={false}
                                value={String(boxDetail?.width || '')}
                                style={styles.inputReadOnly}
                            />
                        </View>
                        <View style={styles.field}>
                            <Text style={styles.label}>Chiều dài</Text>
                            <TextInput
                                editable={false}
                                value={String(boxDetail?.length || '')}
                                style={styles.inputReadOnly}
                            />
                        </View>
                        <View style={styles.field}>
                            <Text style={styles.label}>Chiều cao</Text>
                            <TextInput editable={false} value={'10'} style={styles.inputReadOnly} />
                        </View>
                        <View style={styles.field}>
                            <Text style={styles.label}>Tổng thể tích</Text>
                            <TextInput
                                editable={false}
                                value={String(boxDetail?.maxAcreage || '')}
                                style={styles.inputReadOnly}
                            />
                        </View>
                        <View style={styles.field}>
                            <Text style={styles.label}>Thể tích còn lại</Text>
                            <TextInput
                                editable={false}
                                value={String(boxDetail?.remainingAcreage || '')}
                                style={styles.inputReadOnly}
                            />
                        </View>
                    </View>
                </View>
            )}

            <View style={[styles.card, styles.boxDetail]}>
                <View style={styles.boxDetailFilter}>
                    <View style={styles.formGroup}>
                        <Text style={styles.formLabel}>Mã lô</Text>
                        <TextInput
                            style={styles.formInput}
                            placeholder={`Nhập mã lô cần tìm`}
                            value={batchID}
                            onChangeText={setBatchID}
                        />
                    </View>
                    <View style={[styles.formGroup, styles.formGroupMargin]}>
                        <Text style={styles.formLabel}>Mã sản phẩm</Text>
                        <TextInput
                            style={styles.formInput}
                            placeholder={`Nhập mã sản phẩm cần tìm`}
                            value={productID}
                            onChangeText={setProductID}
                        />
                    </View>
                </View>

                <View style={styles.formActions}>
                    <Button primary onPress={handleSearch} style={styles.btnSearch}>
                        Tìm kiếm
                    </Button>
                    <Button primary onPress={handleReset} style={styles.btnSearch}>
                        Đặt lại
                    </Button>
                    {authIsAdmin(currentUser) && (
                        <Button
                            disabled={selectedBatches.length === 0}
                            primary
                            onPress={handleUpdateLocation}
                            style={styles.btnSearch}
                        >
                            {!boxID ? 'Cập nhật vị trí' : 'Chuyển vị trí'}
                        </Button>
                    )}
                </View>

                <Text style={styles.boxDetailContent}>
                    {boxID ? 'Nội dung chi tiết ô' : 'Danh sách sản phẩm trong kho tạm'}
                </Text>

                <View style={[styles.tableWrap, !boxID && styles.tableWrapNoBox]}>
                    <FlatList
                        data={visibleBatches}
                        keyExtractor={(item) => item.batchID}
                        ListHeaderComponent={() => (
                            <TableHeader
                                handleSelectAllChange={handleSelectAllChange}
                                selectAll={selectAll}
                                currentUser={currentUser}
                                boxID={boxID}
                            />
                        )}
                        stickyHeaderIndices={[0]}
                        renderItem={({ item }) => (
                            <BatchRow
                                batch={item}
                                isSelected={selectedBatches.some((b) => b.batchID === item.batchID)}
                                onCheckboxChange={handleCheckboxChange}
                                currentUser={currentUser}
                                boxID={boxID}
                            />
                        )}
                        ListEmptyComponent={() => <Text style={styles.emptyTableText}>Không có lô hàng nào.</Text>}
                    />
                </View>
            </View>
        </Modal>
    );
};

export default BoxDetail;
