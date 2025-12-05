import React, { useState, useEffect, useMemo, useRef } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, Alert } from 'react-native';
import { DefaultLayout } from '../layouts';
import Header from '../layouts/Header';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Scan, CheckCircle, Box, ChevronRight } from 'lucide-react-native';
import QRScanner from '../components/QRScanner';
import { submitInventoryCheck, updateInventoryCheck } from '../service/inventoryCheck.service';

export default function ScanInventoryCheck() {
    const navigation = useNavigation();
    const route = useRoute();
    const { inventoryCheckDetail } = route.params || {};
    const inventoryCheckDetailRef = useRef(inventoryCheckDetail);

    // State
    const [boxes, setBoxes] = useState([]);
    const [selectedBoxId, setSelectedBoxId] = useState(null);
    const [isBoxVerified, setIsBoxVerified] = useState(false);

    const [selectedBatchId, setSelectedBatchId] = useState(null);
    const [showScanner, setShowScanner] = useState(false);
    const [scanMode, setScanMode] = useState(null);

    // Initialize Data: Group by Box
    useEffect(() => {
        if (inventoryCheckDetail?.details) {
            const boxMap = {};

            inventoryCheckDetail.details.forEach((detail) => {
                // Safely access boxID. If not present, group under "Unassigned"
                const boxId = detail.batchBoxByBatch?.box?.boxID || 'Unassigned';
                const batch = detail.batchBoxByBatch?.batch;

                if (!boxMap[boxId]) {
                    boxMap[boxId] = {
                        id: boxId,
                        isVerified: false,
                        batches: [],
                    };
                }

                // Check if batch already exists in this box (unlikely for unique details but good to be safe)
                const existingBatch = boxMap[boxId].batches.find((b) => b.batchId === batch?.batchID);

                if (existingBatch) {
                    existingBatch.systemQty += detail.systemQuantity;
                } else {
                    boxMap[boxId].batches.push({
                        detailId: detail._id, // Keep track of detail ID if needed
                        batchId: batch?.batchID,
                        productName: batch?.product?.productName,
                        unit: batch?.unit?.unitName,
                        systemQty: detail.systemQuantity,
                        actualQty: 0, // Start counting from 0
                        isCompleted: false,
                    });
                }
            });

            setBoxes(Object.values(boxMap));
        }
    }, [inventoryCheckDetail]);

    // Helper: Get current box
    const currentBox = useMemo(() => boxes.find((b) => b.id === selectedBoxId), [boxes, selectedBoxId]);

    // Helper: Get current batch (inside current box)
    const currentBatch = useMemo(
        () => currentBox?.batches.find((b) => b.batchId === selectedBatchId),
        [currentBox, selectedBatchId],
    );

    // Handle Box Selection
    const handleBoxSelect = (boxId) => {
        const box = boxes.find((b) => b.id === boxId);
        if (box.isVerified) {
            setSelectedBoxId(boxId);
            setIsBoxVerified(true);
        } else {
            setSelectedBoxId(boxId);
            setIsBoxVerified(false);
            setScanMode('VERIFY_BOX');
            setShowScanner(true);
        }
    };

    // Handle Batch Selection
    const handleBatchSelect = (batchId) => {
        setSelectedBatchId(batchId);
        setScanMode('SCAN_ITEM');
        setShowScanner(true);
    };

    // Main Scan Logic
    const handleScan = (code) => {
        if (scanMode === 'VERIFY_BOX') {
            if (code === selectedBoxId) {
                const newBoxes = [...boxes];
                const boxIndex = newBoxes.findIndex((b) => b.id === selectedBoxId);
                if (boxIndex !== -1) {
                    newBoxes[boxIndex] = { ...newBoxes[boxIndex], isVerified: true };
                    setBoxes(newBoxes);
                    setIsBoxVerified(true);
                    setShowScanner(false);
                    Alert.alert('Thành công', `Đã xác thực ô ${code}`);
                }
            } else {
                Alert.alert('Lỗi', `Mã quét được (${code}) không khớp với hộp đang chọn (${selectedBoxId})`);
            }
        } else if (scanMode === 'SCAN_ITEM') {
            if (code === selectedBatchId) {
                const newBoxes = [...boxes];
                const boxIndex = newBoxes.findIndex((b) => b.id === selectedBoxId);

                if (boxIndex !== -1) {
                    newBoxes[boxIndex] = { ...newBoxes[boxIndex] };
                    newBoxes[boxIndex].batches = [...newBoxes[boxIndex].batches];

                    const batchIndex = newBoxes[boxIndex].batches.findIndex((b) => b.batchId === selectedBatchId);

                    if (batchIndex !== -1) {
                        newBoxes[boxIndex].batches[batchIndex] = { ...newBoxes[boxIndex].batches[batchIndex] };
                        const batch = newBoxes[boxIndex].batches[batchIndex];

                        // Increment actual quantity
                        batch.actualQty += 1;

                        // Update ref
                        if (inventoryCheckDetailRef.current?.details) {
                            const detailIndex = inventoryCheckDetailRef.current.details.findIndex(
                                (d) => d._id === batch.detailId,
                            );
                            if (detailIndex !== -1) {
                                inventoryCheckDetailRef.current.details[detailIndex].actualQuantity = batch.actualQty;
                                inventoryCheckDetailRef.current.details[detailIndex].discrepancyQuantity =
                                    batch.actualQty - batch.systemQty;
                            }
                        }

                        // Check if matched system quantity (optional visual cue)
                        if (batch.actualQty === batch.systemQty) {
                            batch.isCompleted = true; // Just a visual flag
                        }

                        setBoxes(newBoxes);
                        // Removed alert for exceeding quantity
                    }
                }
            } else {
                Alert.alert('Lỗi', `Mã quét được (${code}) không khớp với lô đang chọn (${selectedBatchId})`);
            }
        }
    };

    const handleResetBatch = (batchId) => {
        Alert.alert('Xác nhận', 'Bạn có chắc chắn muốn đặt lại số lượng quét của lô này về 0?', [
            { text: 'Hủy', style: 'cancel' },
            {
                text: 'Đồng ý',
                onPress: () => {
                    const newBoxes = [...boxes];
                    const boxIndex = newBoxes.findIndex((b) => b.id === selectedBoxId);
                    if (boxIndex !== -1) {
                        newBoxes[boxIndex] = { ...newBoxes[boxIndex] };
                        newBoxes[boxIndex].batches = [...newBoxes[boxIndex].batches];
                        const batchIndex = newBoxes[boxIndex].batches.findIndex((b) => b.batchId === batchId);
                        if (batchIndex !== -1) {
                            const batch = newBoxes[boxIndex].batches[batchIndex];
                            newBoxes[boxIndex].batches[batchIndex] = {
                                ...batch,
                                actualQty: 0,
                                isCompleted: false,
                            };

                            // Update ref
                            if (inventoryCheckDetailRef.current?.details) {
                                const detailIndex = inventoryCheckDetailRef.current.details.findIndex(
                                    (d) => d._id === batch.detailId,
                                );
                                if (detailIndex !== -1) {
                                    inventoryCheckDetailRef.current.details[detailIndex].actualQuantity = 0;
                                    inventoryCheckDetailRef.current.details[detailIndex].discrepancyQuantity =
                                        0 - batch.systemQty;
                                }
                            }

                            setBoxes(newBoxes);
                        }
                    }
                },
            },
        ]);
    };

    const handleFinishCheck = async () => {
        Alert.alert('Xác nhận', 'Bạn có chắc chắn muốn hoàn thành kiểm kê?', [
            { text: 'Hủy', style: 'cancel' },
            {
                text: 'Đồng ý',
                onPress: async () => {
                    const res = await submitInventoryCheck(inventoryCheckDetailRef.current);
                    if (res?.data?.status === 'OK') {
                        Alert.alert('Thành công', 'Đã hoàn thành kiểm kê, chờ phê duyệt');
                        navigation.goBack();
                    }
                },
            },
        ]);
    };

    const renderBoxItem = ({ item }) => {
        const totalSystem = item.batches.reduce((sum, b) => sum + b.systemQty, 0);
        const totalActual = item.batches.reduce((sum, b) => sum + b.actualQty, 0);
        const isVerified = item.isVerified;

        return (
            <TouchableOpacity
                style={[styles.card, isVerified && styles.cardVerified]}
                onPress={() => handleBoxSelect(item.id)}
            >
                <View style={styles.cardIcon}>
                    <Box size={24} color={isVerified ? '#fff' : '#4B5563'} />
                </View>
                <View style={styles.cardContent}>
                    <Text style={[styles.cardTitle, isVerified && styles.textWhite]}>Ô: {item.id}</Text>
                    <Text style={[styles.cardInfo, isVerified && styles.textWhite]}>{item.batches.length} Lô hàng</Text>
                    <Text style={[styles.cardSubInfo, isVerified && styles.textWhite]}>
                        Đã kiểm: {totalActual}/{totalSystem}
                    </Text>
                </View>
                <ChevronRight size={24} color={isVerified ? '#fff' : '#9CA3AF'} />
            </TouchableOpacity>
        );
    };

    const renderBatchItem = ({ item }) => {
        const isMatch = item.actualQty === item.systemQty;

        return (
            <View style={[styles.batchCard, isMatch && styles.batchCardMatch]}>
                <TouchableOpacity onPress={() => handleBatchSelect(item.batchId)}>
                    <View style={styles.batchHeaderRow}>
                        <Text style={[styles.batchTitle, isMatch && styles.textWhite]}>Lô: {item.batchId}</Text>
                        {isMatch && <CheckCircle size={20} color="#fff" />}
                    </View>
                    <Text style={[styles.batchProduct, isMatch && styles.textWhite]}>{item.productName}</Text>

                    <View style={styles.progressBarContainer}>
                        <View style={styles.progressTextRow}>
                            <Text style={[styles.progressText, isMatch && styles.textWhite]}>
                                Thực tế: {item.actualQty} / Hệ thống: {item.systemQty} {item.unit}
                            </Text>
                        </View>
                        <View style={styles.progressBarBg}>
                            <View
                                style={[
                                    styles.progressBarFill,
                                    { width: `${Math.min((item.actualQty / item.systemQty) * 100, 100)}%` },
                                    isMatch && { backgroundColor: '#fff' },
                                    item.actualQty > item.systemQty && { backgroundColor: '#EF4444' }, // Red if over
                                ]}
                            />
                        </View>
                    </View>
                </TouchableOpacity>
                {item.actualQty > 0 && (
                    <TouchableOpacity style={styles.resetButton} onPress={() => handleResetBatch(item.batchId)}>
                        <Text style={[styles.resetButtonText, isMatch && styles.textWhite]}>Đặt lại</Text>
                    </TouchableOpacity>
                )}
            </View>
        );
    };

    return (
        <DefaultLayout>
            <Header
                title={selectedBoxId ? `Kiểm kê ô ${selectedBoxId}` : 'Danh sách ô kiểm kê'}
                leftIcon="arrow-back"
                handleOnPressLeftIcon={() => {
                    if (selectedBoxId) {
                        setSelectedBoxId(null);
                        setIsBoxVerified(false);
                    } else {
                        navigation.goBack();
                    }
                }}
            />

            <View style={styles.container}>
                {!selectedBoxId ? (
                    // VIEW 1: LIST OF BOXES
                    <>
                        <FlatList
                            data={boxes}
                            renderItem={renderBoxItem}
                            keyExtractor={(item) => item.id}
                            contentContainerStyle={styles.listContent}
                            ListEmptyComponent={<Text style={styles.emptyText}>Không có dữ liệu.</Text>}
                        />
                        <View style={styles.footer}>
                            <TouchableOpacity style={styles.completeButton} onPress={handleFinishCheck}>
                                <Text style={styles.buttonText}>Hoàn thành kiểm kê</Text>
                            </TouchableOpacity>
                        </View>
                    </>
                ) : (
                    // VIEW 2: INSIDE A BOX
                    <>
                        <View style={styles.boxSummary}>
                            <Text style={styles.boxSummaryTitle}>Đang kiểm kê: {currentBox?.id}</Text>
                            <Text style={styles.boxSummarySub}>Chọn lô để quét sản phẩm</Text>
                        </View>

                        <FlatList
                            data={currentBox?.batches || []}
                            renderItem={renderBatchItem}
                            keyExtractor={(item) => item.batchId}
                            contentContainerStyle={styles.listContent}
                        />
                    </>
                )}
            </View>

            <QRScanner
                visible={showScanner}
                onClose={() => {
                    setShowScanner(false);
                    if (scanMode === 'VERIFY_BOX' && !isBoxVerified) {
                        setSelectedBoxId(null);
                    }
                }}
                onScanned={handleScan}
                title={scanMode === 'VERIFY_BOX' ? `Quét mã ô: ${selectedBoxId}` : `Quét mã lô: ${selectedBatchId}`}
                descriptionText={
                    scanMode === 'SCAN_ITEM'
                        ? `Đã quét: ${currentBatch?.actualQty || 0}/${currentBatch?.systemQty || 0}`
                        : 'Di chuyển camera đến mã QR'
                }
            />
        </DefaultLayout>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F3F4F6',
    },
    listContent: {
        padding: 16,
        paddingBottom: 100,
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 40,
        color: '#6B7280',
        fontSize: 16,
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#fff',
        padding: 16,
        paddingBottom: 30,
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
    },
    completeButton: {
        backgroundColor: '#10B981',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
    },
    textWhite: {
        color: '#fff',
    },

    // Box Card
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    cardVerified: {
        backgroundColor: '#3B82F6', // Blue for verified/in-progress
    },
    cardIcon: {
        marginRight: 16,
    },
    cardContent: {
        flex: 1,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1F2937',
        marginBottom: 4,
    },
    cardInfo: {
        fontSize: 14,
        color: '#6B7280',
        marginBottom: 2,
    },
    cardSubInfo: {
        fontSize: 12,
        color: '#9CA3AF',
        fontStyle: 'italic',
    },

    // Box Detail View
    boxSummary: {
        padding: 16,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    boxSummaryTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1F2937',
        marginBottom: 4,
    },
    boxSummarySub: {
        fontSize: 14,
        color: '#6B7280',
    },

    // Batch Card
    batchCard: {
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    batchCardMatch: {
        backgroundColor: '#10B981', // Green if matches
        borderColor: '#10B981',
    },
    batchHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    batchTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1F2937',
    },
    batchProduct: {
        fontSize: 14,
        color: '#4B5563',
        marginBottom: 12,
    },
    progressBarContainer: {
        marginTop: 4,
    },
    progressTextRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    progressText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#6B7280',
    },
    progressBarBg: {
        height: 8,
        backgroundColor: '#E5E7EB',
        borderRadius: 4,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: '#2563EB',
    },
    resetButton: {
        marginTop: 8,
        alignSelf: 'flex-end',
        paddingVertical: 4,
        paddingHorizontal: 8,
        backgroundColor: '#FEE2E2',
        borderRadius: 4,
    },
    resetButtonText: {
        color: '#EF4444',
        fontSize: 12,
        fontWeight: '600',
    },
});
