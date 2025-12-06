import React, { useState, useEffect, useMemo } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { DefaultLayout } from '../layouts';
import Header from '../layouts/Header';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Scan, CheckCircle, Box, Layers, ChevronRight, ArrowLeft } from 'lucide-react-native';
import QRScanner from '../components/QRScanner';
import { completeOrderRelease } from '../service/order.service';

export default function ScanOrderRelease() {
    const navigation = useNavigation();
    const route = useRoute();
    const { orderReleaseItem } = route.params || {};

    // State
    const [boxes, setBoxes] = useState([]);
    const [selectedBoxId, setSelectedBoxId] = useState(null);
    const [isBoxVerified, setIsBoxVerified] = useState(false);

    const [selectedBatchId, setSelectedBatchId] = useState(null);
    const [showScanner, setShowScanner] = useState(false);
    const [scanMode, setScanMode] = useState(null);

    // Initialize Data: Group by Box
    useEffect(() => {
        if (orderReleaseItem) {
            const boxMap = {};

            orderReleaseItem.orderReleaseDetails.forEach((detail) => {
                if (detail.orderReleaseBatchBoxDetails && detail.orderReleaseBatchBoxDetails.length > 0) {
                    detail.orderReleaseBatchBoxDetails.forEach((boxDetail) => {
                        const boxId = boxDetail.boxID;

                        if (!boxMap[boxId]) {
                            boxMap[boxId] = {
                                id: boxId,
                                isVerified: false,
                                batches: [],
                            };
                        }

                        const existingBatchIndex = boxMap[boxId].batches.findIndex(
                            (b) => b.batchId === detail.batch.batchID,
                        );

                        if (existingBatchIndex !== -1) {
                            boxMap[boxId].batches[existingBatchIndex].targetQty += boxDetail.quantityExported;
                        } else {
                            boxMap[boxId].batches.push({
                                batchId: detail.batch.batchID,
                                productName: detail.batch.product.productName,
                                unit: detail.batch.unit.unitName,
                                targetQty: boxDetail.quantityExported,
                                scannedQty: 0,
                                isCompleted: false,
                            });
                        }
                    });
                }
            });

            setBoxes(Object.values(boxMap));
        }
    }, [orderReleaseItem]);

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
            // Already verified, just open detail
            setSelectedBoxId(boxId);
            setIsBoxVerified(true);
        } else {
            // Need to verify
            setSelectedBoxId(boxId);
            setIsBoxVerified(false);
            setScanMode('VERIFY_BOX');
            setShowScanner(true);
        }
    };

    // Handle Batch Selection (for scanning items)
    const handleBatchSelect = (batchId) => {
        const batch = currentBox.batches.find((b) => b.batchId === batchId);
        if (batch.isCompleted) {
            Alert.alert('Thông báo', 'Lô này đã quét đủ số lượng.');
            return;
        }
        setSelectedBatchId(batchId);
        setScanMode('SCAN_ITEM');
        setShowScanner(true);
    };

    // Main Scan Logic
    const handleScan = (code) => {
        if (scanMode === 'VERIFY_BOX') {
            if (code === selectedBoxId) {
                // Success
                const newBoxes = [...boxes];
                const boxIndex = newBoxes.findIndex((b) => b.id === selectedBoxId);
                if (boxIndex !== -1) {
                    newBoxes[boxIndex] = { ...newBoxes[boxIndex], isVerified: true };
                    setBoxes(newBoxes);
                    setIsBoxVerified(true);
                    setShowScanner(false);
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

                        if (batch.scannedQty < batch.targetQty) {
                            batch.scannedQty += 1;

                            if (batch.scannedQty >= batch.targetQty) {
                                batch.isCompleted = true;
                                Alert.alert('Hoàn thành', `Đã quét đủ số lượng cho lô ${batch.batchId}`);
                                setShowScanner(false);
                                setSelectedBatchId(null);
                            }
                            setBoxes(newBoxes);
                        } else {
                            Alert.alert('Thông báo', 'Đã quét đủ số lượng.');
                            setShowScanner(false);
                        }
                    }
                }
            } else {
                Alert.alert('Lỗi', `Mã quét được (${code}) không khớp với lô đang chọn (${selectedBatchId})`);
            }
        }
    };

    const allReleaseCompleted = useMemo(() => {
        return (
            boxes.length > 0 && boxes.every((box) => box.isVerified && box.batches.every((batch) => batch.isCompleted))
        );
    }, [boxes]);

    const handleFinishRelease = async () => {
        const resComp = await completeOrderRelease(orderReleaseItem.orderReleaseID);
        if (resComp.status === 'OK') {
            navigation.goBack();
            Alert.alert('Hoàn thành', 'Đã xuất kho thành công!');
        }
    };

    // --- RENDERERS ---

    const renderBoxItem = ({ item }) => {
        // Calculate progress summary for the box
        const totalItems = item.batches.reduce((sum, b) => sum + b.targetQty, 0);
        const scannedItems = item.batches.reduce((sum, b) => sum + b.scannedQty, 0);
        const isFullyDone = item.isVerified && item.batches.every((b) => b.isCompleted);

        return (
            <TouchableOpacity
                style={[styles.card, isFullyDone && styles.cardCompleted]}
                onPress={() => handleBoxSelect(item.id)}
            >
                <View style={styles.cardIcon}>
                    <Box size={24} color={isFullyDone ? '#fff' : '#4B5563'} />
                </View>
                <View style={styles.cardContent}>
                    <Text style={[styles.cardTitle, isFullyDone && styles.textWhite]}>Ô: {item.id}</Text>
                    <Text style={[styles.cardInfo, isFullyDone && styles.textWhite]}>
                        {item.batches.length} Lô hàng
                    </Text>
                    <Text style={[styles.cardSubInfo, isFullyDone && styles.textWhite]}>
                        Tiến độ: {scannedItems}/{totalItems} sản phẩm
                    </Text>
                </View>
                {isFullyDone ? <CheckCircle size={24} color="#fff" /> : <ChevronRight size={24} color="#9CA3AF" />}
            </TouchableOpacity>
        );
    };

    const renderBatchItem = ({ item }) => {
        return (
            <TouchableOpacity
                style={[styles.batchCard, item.isCompleted && styles.batchCardCompleted]}
                onPress={() => handleBatchSelect(item.batchId)}
            >
                <View style={styles.batchHeaderRow}>
                    <Text style={[styles.batchTitle, item.isCompleted && styles.textWhite]}>Lô: {item.batchId}</Text>
                    {item.isCompleted && <CheckCircle size={20} color="#fff" />}
                </View>
                <Text style={[styles.batchProduct, item.isCompleted && styles.textWhite]}>{item.productName}</Text>

                <View style={styles.progressBarContainer}>
                    <View style={styles.progressTextRow}>
                        <Text style={[styles.progressText, item.isCompleted && styles.textWhite]}>
                            Đã quét: {item.scannedQty}/{item.targetQty} {item.unit}
                        </Text>
                    </View>
                    <View style={styles.progressBarBg}>
                        <View
                            style={[
                                styles.progressBarFill,
                                { width: `${(item.scannedQty / item.targetQty) * 100}%` },
                                item.isCompleted && { backgroundColor: '#fff' },
                            ]}
                        />
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <DefaultLayout>
            {/* Header changes based on view depth */}
            <Header
                title={selectedBoxId ? `Chi tiết ô ${selectedBoxId}` : 'Danh sách ô'}
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
                            ListEmptyComponent={<Text style={styles.emptyText}>Không có hộp nào cần xuất.</Text>}
                        />
                        <View style={styles.footer}>
                            <TouchableOpacity
                                style={[styles.completeButton, { opacity: allReleaseCompleted ? 1 : 0.5 }]}
                                onPress={() => {
                                    if (allReleaseCompleted) {
                                        handleFinishRelease();
                                    } else {
                                        Alert.alert(
                                            'Thông báo',
                                            'Vui lòng hoàn thành tất cả các hộp trước khi xuất kho.',
                                        );
                                    }
                                }}
                            >
                                <Text style={styles.buttonText}>Hoàn thành phiếu xuất</Text>
                            </TouchableOpacity>
                        </View>
                    </>
                ) : (
                    // VIEW 2: INSIDE A BOX (LIST OF BATCHES)
                    <>
                        <View style={styles.boxSummary}>
                            <Text style={styles.boxSummaryTitle}>Đang xử lý: {currentBox?.id}</Text>
                            <Text style={styles.boxSummarySub}>Vui lòng chọn lô để quét sản phẩm.</Text>
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
                    // If user cancels verification of the box, go back to the list
                    if (scanMode === 'VERIFY_BOX' && !isBoxVerified) {
                        setSelectedBoxId(null);
                    }
                }}
                onScanned={handleScan}
                title={scanMode === 'VERIFY_BOX' ? `Quét mã ô: ${selectedBoxId}` : `Quét mã lô: ${selectedBatchId}`}
                descriptionText={
                    scanMode === 'SCAN_ITEM'
                        ? `Đã quét: ${currentBatch?.scannedQty || 0}/${currentBatch?.targetQty || 0}`
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
    cardCompleted: {
        backgroundColor: '#10B981',
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

    // Batch Card (Inside Box)
    batchCard: {
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    batchCardCompleted: {
        backgroundColor: '#10B981',
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
});
