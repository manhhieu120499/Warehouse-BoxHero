import React, { useEffect, useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Dimensions,
    SafeAreaView,
    FlatList,
    Modal,
    Platform,
    StatusBar,
    ActivityIndicator,
} from 'react-native';
import { Package, ArrowUpCircle, ArrowDownCircle, X, Info, RotateCcw, MapPin } from 'lucide-react-native';
import parseToken from '../utilities/parseToken';
import { getAllShelfOfWarehouse } from '../service/shelf.service';
import BoxDetail from '../components/BoxDetail';
import UpdateLocation from '../components/UpdateLocation';
import ChangeLocation from '../components/ChangeLocation';
import { DefaultLayout } from '../layouts';
import Header from '../layouts/Header';

const { width } = Dimensions.get('window');
const GAP = 12;
// Tính toán chia 2 cột
const ITEM_WIDTH = (width - GAP * 3) / 2;

const BatchPage = () => {
    const [shelvesData, setShelvesData] = useState([]);
    const [selectedBox, setSelectedBox] = useState(null);
    const [showWareHouseTemp, setShowWareHouseTemp] = useState(false);
    const [showUpdateLocation, setShowUpdateLocation] = useState(false);
    const [batchesUpdate, setBatchesUpdate] = useState([]);
    const [batchesMove, setBatchesMove] = useState([]);
    const [showChangeLocation, setShowChangeLocation] = useState(false);

    // --- LOGIC MÀU SẮC ---
    const getBoxStyle = (maxAcreage, remainingAcreage) => {
        const volume = (remainingAcreage / maxAcreage) * 100;
        if (volume === 100) return { backgroundColor: '#a3e4d7', borderColor: 'transparent', color: '#0F766E' }; // Empty - Dark Teal Text
        if (volume >= 65) return { backgroundColor: '#10B981', borderColor: '#059669', color: '#FFFFFF' }; // Emerald - White Text
        if (volume >= 30) return { backgroundColor: '#FBBF24', borderColor: '#D97706', color: '#78350F' }; // Amber - Dark Brown Text
        return { backgroundColor: '#F43F5E', borderColor: '#E11D48', color: '#FFFFFF' }; // Rose - White Text
    };

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        const token = await parseToken('tokenUser');

        const warehouse = await parseToken('warehouse');

        if (!token || !warehouse) {
            return;
        }

        try {
            const data = await getAllShelfOfWarehouse({
                warehouseID: warehouse.warehouseID,

                token: token.accessToken,

                employeeID: token.employeeID,
            });

            if (data && data.status === 'OK') {
                setShelvesData(data.data);
            }
        } catch (error) {
            console.log('Lỗi lấy dữ liệu kệ:', error);
        }
    };

    // --- RENDER ITEMS ---
    const renderHeader = () => (
        <View style={styles.headerContainer}>
            <TouchableOpacity
                style={styles.tempWarehouseCard}
                onPress={() => {
                    setShowWareHouseTemp(true);
                }}
                activeOpacity={0.9}
            >
                <View style={styles.iconWrapper}>
                    <Text style={{ fontSize: 24 }}>📦</Text>
                </View>
                <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Text style={styles.cardTitle}>KHU VỰC KHO TẠM</Text>
                    </View>
                    <Text style={styles.cardSubtitle}>Chạm để kiểm tra hàng chờ nhập vào kệ</Text>
                </View>
            </TouchableOpacity>

            {/* Legend */}
            <View style={styles.legendContainer}>
                <LegendItem color="#a3e4d7" label="Chưa có SP" isBorder />
                <LegendItem color="#10B981" label="Còn trống" />
                <LegendItem color="#FBBF24" label="Còn một nửa" />
                <LegendItem color="#F43F5E" label="Sắp hết" />
            </View>
        </View>
    );

    const LegendItem = ({ color, label, isBorder }) => (
        <View style={styles.legendItem}>
            <View
                style={[
                    styles.legendDot,
                    { backgroundColor: color },
                    isBorder && { borderWidth: 1, borderColor: '#CBD5E1' },
                ]}
            />
            <Text style={styles.legendText}>{label}</Text>
        </View>
    );

    const renderShelfItem = ({ item }) => (
        <View style={styles.shelfCard}>
            <View style={styles.shelfHeader}>
                <View style={styles.shelfTitleRow}>
                    <View style={styles.shelfIconContainer}>
                        <Package size={16} color="#3B82F6" />
                    </View>
                    <Text style={styles.shelfName}>Kệ {item.shelfID}</Text>
                </View>
                <View style={styles.shelfStats}>
                    <Text style={styles.shelfStatsText}>{item.floor?.length || 0} tầng</Text>
                </View>
            </View>

            <View style={styles.shelfFrame}>
                <View style={styles.shelfInner}>
                    {item.floor?.map((column, colIdx) => (
                        <View style={styles.shelfColumn} key={colIdx}>
                            {column.boxes.map((box, boxIdx) => {
                                const boxStyle = getBoxStyle(box.maxAcreage, box.remainingAcreage);
                                return (
                                    <TouchableOpacity
                                        key={boxIdx}
                                        activeOpacity={0.7}
                                        onPress={() => {
                                            setSelectedBox(box.boxID);
                                        }}
                                        style={[
                                            styles.boxItem,
                                            {
                                                backgroundColor: boxStyle.backgroundColor,
                                                borderColor: boxStyle.borderColor,
                                            },
                                        ]}
                                    >
                                        <Text style={[styles.boxText, { color: boxStyle.color }]}>{box.boxID}</Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    ))}
                </View>
            </View>

            <View style={styles.shelfLegsContainer}>
                <View style={styles.shelfLeg} />
                <View style={styles.shelfLeg} />
            </View>
        </View>
    );

    return (
        <DefaultLayout>
            <Header title="Quản lý kệ hàng" />
            <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />

            <FlatList
                data={shelvesData}
                renderItem={renderShelfItem}
                keyExtractor={(item) => item.shelfID}
                numColumns={2}
                columnWrapperStyle={{ justifyContent: 'space-between' }}
                contentContainerStyle={{ padding: GAP, paddingBottom: 100 }}
                ListHeaderComponent={renderHeader}
                showsVerticalScrollIndicator={false}
            />

            <BoxDetail
                isOpen={!!selectedBox}
                onClose={() => setSelectedBox(null)}
                boxID={selectedBox}
                setBatchesUpdate={setBatchesMove}
                setShowChangeLocation={setShowChangeLocation}
            />

            <BoxDetail
                isOpen={showWareHouseTemp}
                onClose={() => setShowWareHouseTemp(false)}
                setShowUpdateLocation={setShowUpdateLocation}
                setBatchesUpdate={setBatchesUpdate}
            />
            <UpdateLocation
                isOpen={showUpdateLocation}
                onClose={() => setShowUpdateLocation(false)}
                batches={batchesUpdate}
                shelvesData={shelvesData}
                fetchData={fetchData}
            />
            <ChangeLocation
                isOpen={showChangeLocation}
                onClose={() => setShowChangeLocation(false)}
                batches={batchesMove}
                shelvesData={shelvesData}
                fetchData={fetchData}
            />
        </DefaultLayout>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8FAFC' },
    appBar: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#F8FAFC',
    },
    appTitle: { fontSize: 20, fontWeight: '900', color: '#1E293B' },
    locationRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
    locationText: { fontSize: 12, color: '#64748B', fontWeight: '500' },
    refreshBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    headerContainer: { marginBottom: 16 },
    tempWarehouseCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#F1F5F9',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
        elevation: 3,
        marginBottom: 12,
    },
    iconWrapper: {
        width: 48,
        height: 48,
        borderRadius: 12,
        backgroundColor: '#EFF6FF',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    cardTitle: { fontSize: 16, fontWeight: '900', color: '#1E293B' },
    cardSubtitle: { fontSize: 12, color: '#64748B', marginTop: 4, fontWeight: '500' },
    legendContainer: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        borderWidth: 1,
        borderColor: '#F1F5F9',
    },
    legendItem: { flexDirection: 'row', alignItems: 'center' },
    legendDot: { width: 10, height: 10, borderRadius: 5, marginRight: 6 },
    legendText: { fontSize: 11, fontWeight: '700', color: '#475569' },
    shelfCard: {
        width: ITEM_WIDTH,
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 12,
        marginBottom: GAP,
        shadowColor: '#64748B',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
        borderWidth: 1,
        borderColor: '#F1F5F9',
    },
    shelfHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    shelfTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    shelfIconContainer: {
        width: 28,
        height: 28,
        borderRadius: 8,
        backgroundColor: '#EFF6FF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    shelfName: {
        fontSize: 14,
        fontWeight: '800',
        color: '#1E293B',
    },
    shelfStats: {
        backgroundColor: '#F8FAFC',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    shelfStatsText: {
        fontSize: 10,
        fontWeight: '600',
        color: '#64748B',
    },
    shelfFrame: {
        backgroundColor: '#334155',
        borderRadius: 8,
        padding: 6,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 2,
    },
    shelfInner: {
        flexDirection: 'row',
        gap: 4,
    },
    shelfColumn: {
        flex: 1,
        flexDirection: 'column',
        gap: 4,
    },
    boxItem: {
        flex: 1,
        height: 32, // Fixed height for consistency
        borderRadius: 4,
        borderWidth: 1, // Thicker bottom border for 3D effect
        borderBottomWidth: 3,
        position: 'relative',
        overflow: 'hidden',
        justifyContent: 'center',
        alignItems: 'center',
    },
    boxText: {
        fontSize: 10,
        fontWeight: '800',
    },
    shelfLegsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 12,
        marginTop: -2, // Tuck under the shelf frame
        zIndex: -1,
    },
    shelfLeg: {
        width: 8,
        height: 12,
        backgroundColor: '#94A3B8',
        borderBottomLeftRadius: 4,
        borderBottomRightRadius: 4,
    },
    bottomDock: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#FFFFFF',
        flexDirection: 'row',
        paddingTop: 16,
        paddingBottom: Platform.OS === 'ios' ? 32 : 16,
        paddingHorizontal: 24,
        borderTopWidth: 1,
        borderTopColor: '#F1F5F9',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
        elevation: 20,
    },
    dockButton: { flex: 1, alignItems: 'center' },
    dockIconWrapper: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 6,
    },
    dockLabel: { fontSize: 11, fontWeight: '800', color: '#475569' },
    divider: { width: 1, height: 30, backgroundColor: '#F1F5F9', marginHorizontal: 16, alignSelf: 'center' },
    modalOverlay: { flex: 1, justifyContent: 'flex-end' },
    modalBackdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.4)' },
    modalContent: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        padding: 24,
        paddingBottom: 40,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 20,
    },
    handleBar: {
        width: 48,
        height: 6,
        backgroundColor: '#E2E8F0',
        borderRadius: 3,
        alignSelf: 'center',
        marginBottom: 24,
    },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 },
    modalTitle: { fontSize: 20, fontWeight: '900', color: '#1E293B' },
    modalSubtitleRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4, gap: 6 },
    modalBoxId: {
        fontSize: 14,
        fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
        fontWeight: '600',
        color: '#64748B',
    },
    closeBtn: { padding: 8, backgroundColor: '#F1F5F9', borderRadius: 20 },
    statusCard: {
        backgroundColor: '#F8FAFC',
        borderWidth: 1,
        borderColor: '#F1F5F9',
        borderRadius: 16,
        padding: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    statusLabel: { fontSize: 12, fontWeight: '800', color: '#94A3B8', marginBottom: 4 },
    statusValue: { fontSize: 24, fontWeight: '900' },
    circleChart: {
        width: 56,
        height: 56,
        borderRadius: 28,
        borderWidth: 4,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
        position: 'relative',
    },
    circleFill: { position: 'absolute', bottom: 0, left: 0, right: 0 },
    modalActions: { flexDirection: 'row', gap: 12 },
    btnPrimary: { flex: 1, backgroundColor: '#1E293B', paddingVertical: 16, borderRadius: 14, alignItems: 'center' },
    btnPrimaryText: { color: '#FFFFFF', fontWeight: '700', fontSize: 16 },
    btnSecondary: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        paddingVertical: 16,
        borderRadius: 14,
        alignItems: 'center',
    },
    btnSecondaryText: { color: '#334155', fontWeight: '700', fontSize: 16 },
});

export default BatchPage;
