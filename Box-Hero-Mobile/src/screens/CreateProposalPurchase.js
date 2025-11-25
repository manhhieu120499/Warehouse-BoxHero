import React, { useState, useEffect, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TextInput,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Dropdown } from 'react-native-element-dropdown';
import { useSelector } from 'react-redux';
import { DefaultLayout } from '../layouts';
import Header from '../layouts/Header';
import { generateCode } from '../utilities/generate';
import request from '../config/axiosConfig';
import parseToken from '../utilities/parseToken';
import { createProposal, updateStatusProposal, getProposalDetail } from '../service/proposal.service';
import { authIsAdmin } from '../common';

const emptyItem = () => ({ sku: '', name: '', uom: '', qty: '1', note: '', listUom: [] });

export default function CreateProposalPurchase() {
    const navigation = useNavigation();
    const route = useRoute();
    const { proposalData } = route.params || {};

    const currentUser = useSelector((state) => state.AuthSlice.user);

    const [code, setCode] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [creator, setCreator] = useState(null);
    const [warehouse, setWarehouse] = useState(null);
    const [reason, setReason] = useState('');
    const [items, setItems] = useState([]);
    const [productIDSearch, setProductIDSearch] = useState('');
    const [listUnitUOM, setListUnitUOM] = useState([]);
    const [isDetailMode, setIsDetailMode] = useState(false);
    const [proposalDetail, setProposalDetail] = useState(null);

    useEffect(() => {
        const fetchWarehouse = async () => {
            const warehouseParse = await parseToken('warehouse');
            if (warehouseParse) setWarehouse(warehouseParse);
        };

        fetchWarehouse();

        if (currentUser) setCreator(currentUser);
        fetchUnitUOM();

        if (proposalData) {
            setIsDetailMode(true);
            fetchProposalDetailData(proposalData.proposalID);
        } else {
            setCode(generateCode('PDX-'));
        }
    }, [currentUser, proposalData]);

    const fetchUnitUOM = async () => {
        try {
            const res = await request.get('/unit/get-all');
            if (res.data && res.data.data) {
                setListUnitUOM(res.data.data.map((it) => ({ label: it.unitName, value: it.unitID })));
            }
        } catch (err) {
            console.log('Error fetching units:', err);
        }
    };

    const fetchProposalDetailData = async (id) => {
        try {
            const res = await getProposalDetail(id);
            if (res && res.proposal) {
                const data = res.proposal;
                setProposalDetail(data);
                setCode(data.proposalID);
                setDate(new Date(data.createdAt).toISOString().split('T')[0]);
                setReason(data.note || '');
                setWarehouse(data.warehouse);
                setCreator(data.employeeCreate);

                const mappedItems = data.proposalDetails.map((item) => ({
                    sku: item.product.productID,
                    name: item.product.productName,
                    uom: item.unit.unitID,
                    qty: String(item.quantity),
                    note: item.note || '',
                    listUom: [], // Detail mode doesn't need listUom for dropdown if read-only
                    unitName: item.unit.unitName,
                }));
                setItems(mappedItems);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const fetchProduct = async (productID) => {
        if (!productID) return;

        // Check if product already exists
        if (items.find((it) => it.sku === productID)) {
            Alert.alert('Thông báo', 'Sản phẩm này đã tồn tại trong danh sách');
            return;
        }

        try {
            const token = await parseToken('tokenUser');
            const [resProduct, resBatchUnit] = await Promise.all([
                request.get(`/product?productID=${productID}`, {
                    headers: {
                        token: `Bearer ${token.accessToken}`,
                        employeeid: token.employeeID,
                        warehouse: warehouse?.warehouseID,
                    },
                }),
                request.get(`/batch/list-units`, {
                    params: {
                        warehouseID: warehouse?.warehouseID,
                        productID: productID,
                    },
                    headers: {
                        token: `Bearer ${token.accessToken}`,
                        employeeid: token.employeeID,
                    },
                }),
            ]);

            if (resProduct.data && resProduct.data.product) {
                const product = resProduct.data.product;
                const newItem = emptyItem();
                newItem.sku = product.productID;
                newItem.name = product.productName;
                newItem.listUom = listUnitUOM;

                setItems((prev) => [...prev, newItem]);
                setProductIDSearch('');
            } else {
                Alert.alert('Lỗi', 'Không tìm thấy sản phẩm');
            }
        } catch (err) {
            console.log(err);
            Alert.alert('Lỗi', 'Không tìm thấy sản phẩm hoặc có lỗi xảy ra');
        }
    };

    const handleRemoveItem = (index) => {
        const newItems = [...items];
        newItems.splice(index, 1);
        setItems(newItems);
    };

    const handleUpdateItem = (index, field, value) => {
        const newItems = [...items];
        newItems[index][field] = value;
        setItems(newItems);
    };

    const validate = () => {
        if (!code) return 'Vui lòng tạo mã phiếu';
        if (items.length === 0) return 'Danh sách hàng hóa đang trống';
        const checkRow = items.every((row) => row.sku && row.name && row.uom && Number(row.qty) > 0);
        if (!checkRow) return 'Vui lòng điền đầy đủ thông tin chi tiết sản phẩm và số lượng > 0';
        return null;
    };

    const handleSubmit = async () => {
        const error = validate();
        if (error) {
            Alert.alert('Lỗi', error);
            return;
        }

        try {
            const payload = {
                proposalID: code,
                employeeIDCreate: creator?.employeeID,
                warehouseID: warehouse?.warehouseID,
                note: reason,
                proposalDetails: items.map((it) => ({
                    productID: it.sku,
                    unitID: it.uom,
                    quantity: Number(it.qty),
                })),
            };

            const res = await createProposal(payload);
            if (res.data.status === 'OK') {
                navigation.goBack();
                Alert.alert('Thành công', 'Tạo phiếu đề xuất thành công');
            }
        } catch (err) {
            Alert.alert('Lỗi', err.message || 'Có lỗi xảy ra');
        }
    };

    const handleApprove = async (status) => {
        try {
            const res = await updateStatusProposal({
                proposalID: code,
                employeeIDApproval: currentUser.employeeID,
                status: status,
            });
            if (res && res.status === 'OK') {
                navigation.goBack();
            }
        } catch (err) {
            console.log(err);
        }
    };

    const totals = useMemo(() => {
        const unique = items.length;
        const totalQty = items.reduce((sum, item) => sum + Number(item.qty || 0), 0);
        return { unique, totalQty };
    }, [items]);

    return (
        <DefaultLayout>
            <Header
                title={isDetailMode ? 'Chi tiết phiếu đề xuất' : 'Tạo phiếu đề xuất nhập'}
                leftIcon="arrow-back"
                handleOnPressLeftIcon={() => navigation.goBack()}
            />

            <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
                {/* General Info */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Thông tin chung</Text>

                    <View style={styles.row}>
                        <View style={styles.col}>
                            <Text style={styles.label}>Mã phiếu</Text>
                            <View style={styles.inputGroup}>
                                <TextInput style={[styles.input, styles.readOnly]} value={code} editable={false} />
                                {!isDetailMode && (
                                    <TouchableOpacity
                                        style={styles.genButton}
                                        onPress={() => setCode(generateCode('PDX-'))}
                                    >
                                        <Ionicons name="refresh" size={18} color="#fff" />
                                    </TouchableOpacity>
                                )}
                            </View>
                        </View>
                        <View style={styles.col}>
                            <Text style={styles.label}>Ngày tạo</Text>
                            <TextInput style={[styles.input, styles.readOnly]} value={date} editable={false} />
                        </View>
                    </View>

                    <View style={styles.row}>
                        <View style={styles.col}>
                            <Text style={styles.label}>Kho nhập</Text>
                            <TextInput
                                style={[styles.input, styles.readOnly]}
                                value={warehouse?.warehouseName || ''}
                                editable={false}
                            />
                        </View>
                        <View style={styles.col}>
                            <Text style={styles.label}>Người lập</Text>
                            <TextInput
                                style={[styles.input, styles.readOnly]}
                                value={creator?.employeeName || ''}
                                editable={false}
                            />
                        </View>
                    </View>

                    <View style={styles.field}>
                        <Text style={styles.label}>Ghi chú</Text>
                        <TextInput
                            style={[styles.input, styles.textArea, isDetailMode && styles.readOnly]}
                            value={reason || 'Không có ghi chú'}
                            onChangeText={setReason}
                            multiline
                            numberOfLines={3}
                            placeholder="Nhập ghi chú..."
                            editable={!isDetailMode}
                        />
                    </View>
                </View>

                {/* Product List */}
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <Text style={styles.cardTitle}>Danh sách hàng hóa</Text>
                    </View>

                    {!isDetailMode && (
                        <View style={styles.searchContainer}>
                            <TextInput
                                style={styles.searchInput}
                                placeholder="Nhập mã sản phẩm..."
                                value={productIDSearch}
                                onChangeText={setProductIDSearch}
                            />
                            <TouchableOpacity style={styles.searchButton} onPress={() => fetchProduct(productIDSearch)}>
                                <Text style={styles.searchButtonText}>Tìm kiếm</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    <View style={styles.listContainer}>
                        {items.map((item, index) => (
                            <View key={index} style={styles.itemCard}>
                                <View style={styles.itemCardHeader}>
                                    <View style={{ flex: 1, marginRight: 8 }}>
                                        <Text style={styles.itemName}>{item.name}</Text>
                                        <View style={styles.skuBadge}>
                                            <Text style={styles.skuText}>{item.sku}</Text>
                                        </View>
                                    </View>
                                    {!isDetailMode && (
                                        <TouchableOpacity
                                            onPress={() => handleRemoveItem(index)}
                                            style={styles.removeBtn}
                                        >
                                            <Ionicons name="close" size={18} color="#ef4444" />
                                        </TouchableOpacity>
                                    )}
                                </View>

                                <View style={styles.divider} />

                                <View style={styles.quantityContainer}>
                                    <View style={styles.qBox}>
                                        <Text style={styles.qLabel}>Đơn vị</Text>
                                        {isDetailMode ? (
                                            <Text style={styles.qValue}>{item.unitName || item.uom}</Text>
                                        ) : (
                                            <Dropdown
                                                style={styles.dropdown}
                                                data={item.listUom || listUnitUOM}
                                                labelField="label"
                                                valueField="value"
                                                placeholder="ĐVT"
                                                value={item.uom}
                                                onChange={(itemVal) => handleUpdateItem(index, 'uom', itemVal.value)}
                                            />
                                        )}
                                    </View>
                                    <View style={styles.qBox}>
                                        <Text style={styles.qLabel}>Số lượng</Text>
                                        <TextInput
                                            style={[styles.qInput, isDetailMode && styles.readOnly]}
                                            value={item.qty}
                                            onChangeText={(text) => handleUpdateItem(index, 'qty', text)}
                                            keyboardType="numeric"
                                            editable={!isDetailMode}
                                            textAlign="center"
                                        />
                                    </View>
                                </View>

                                <TextInput
                                    style={[styles.noteInput, isDetailMode && styles.readOnly]}
                                    placeholder="Ghi chú sản phẩm..."
                                    value={item.note}
                                    onChangeText={(text) => handleUpdateItem(index, 'note', text)}
                                    editable={!isDetailMode}
                                />
                            </View>
                        ))}
                        {items.length === 0 && <Text style={styles.emptyText}>Chưa có sản phẩm nào</Text>}
                    </View>

                    <View style={styles.summary}>
                        <Text style={styles.summaryText}>
                            Số mặt hàng: <Text style={styles.bold}>{totals.unique}</Text>
                        </Text>
                        <Text style={styles.summaryText}>
                            Tổng số lượng: <Text style={styles.bold}>{totals.totalQty}</Text>
                        </Text>
                    </View>
                </View>
            </ScrollView>

            {/* Footer Actions */}
            <View style={styles.footer}>
                {!isDetailMode ? (
                    <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
                        <Text style={styles.submitButtonText}>Gửi phê duyệt</Text>
                    </TouchableOpacity>
                ) : (
                    proposalDetail?.status === 'PENDING' &&
                    authIsAdmin(currentUser) && (
                        <View style={styles.approveActions}>
                            <TouchableOpacity
                                style={[styles.actionBtn, styles.rejectBtn]}
                                onPress={() => handleApprove('REFUSE')}
                            >
                                <Text style={styles.actionBtnText}>Từ chối</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.actionBtn, styles.approveBtn]}
                                onPress={() => handleApprove('COMPLETED')}
                            >
                                <Text style={styles.actionBtnText}>Phê duyệt</Text>
                            </TouchableOpacity>
                        </View>
                    )
                )}
            </View>
        </DefaultLayout>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f3f4f6',
        padding: 16,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 12,
    },
    row: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 12,
    },
    col: {
        flex: 1,
    },
    label: {
        fontSize: 13,
        fontWeight: '500',
        color: '#4b5563',
        marginBottom: 4,
    },
    inputGroup: {
        flexDirection: 'row',
        gap: 8,
    },
    input: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#d1d5db',
        borderRadius: 8,
        padding: 8,
        fontSize: 14,
        color: '#1f2937',
        backgroundColor: '#fff',
    },
    readOnly: {
        backgroundColor: '#f9fafb',
        color: '#6b7280',
    },
    genButton: {
        backgroundColor: '#3b82f6',
        padding: 8,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    textArea: {
        height: 60,
        textAlignVertical: 'top',
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    searchContainer: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 12,
    },
    searchInput: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#d1d5db',
        borderRadius: 8,
        padding: 8,
        fontSize: 14,
    },
    searchButton: {
        backgroundColor: '#3b82f6',
        paddingHorizontal: 16,
        justifyContent: 'center',
        borderRadius: 8,
    },
    searchButtonText: {
        color: '#fff',
        fontWeight: '600',
    },
    listContainer: {
        gap: 12,
    },
    itemCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 12,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
        borderWidth: 1,
        borderColor: '#e5e7eb',
    },
    itemCardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 6,
    },
    itemName: {
        fontSize: 16,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 2,
    },
    skuBadge: {
        backgroundColor: '#e0f2fe',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 6,
        alignSelf: 'flex-start',
    },
    skuText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#0369a1',
    },
    removeBtn: {
        padding: 4,
        backgroundColor: '#fee2e2',
        borderRadius: 12,
    },
    divider: {
        height: 1,
        backgroundColor: '#f3f4f6',
        marginVertical: 8,
    },
    quantityContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
        gap: 12,
    },
    qBox: {
        flex: 1,
    },
    qLabel: {
        fontSize: 12,
        color: '#6b7280',
        marginBottom: 4,
        textTransform: 'uppercase',
        fontWeight: '600',
    },
    qValue: {
        fontSize: 15,
        fontWeight: '600',
        color: '#111827',
        paddingVertical: 4,
    },
    qInput: {
        height: 40,
        borderWidth: 1,
        borderColor: '#3b82f6',
        borderRadius: 8,
        paddingVertical: 4,
        paddingHorizontal: 8,
        fontSize: 15,
        fontWeight: '600',
        color: '#111827',
        backgroundColor: '#eff6ff',
        textAlign: 'center',
    },
    dropdown: {
        height: 40,
        borderColor: '#d1d5db',
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 8,
        backgroundColor: '#fff',
    },
    noteInput: {
        backgroundColor: '#f9fafb',
        borderWidth: 1,
        borderColor: '#e5e7eb',
        borderRadius: 8,
        padding: 10,
        fontSize: 14,
        color: '#111827',
    },
    emptyText: {
        textAlign: 'center',
        color: '#9ca3af',
        padding: 20,
    },
    summary: {
        marginTop: 16,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: '#e5e7eb',
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    summaryText: {
        fontSize: 14,
        color: '#4b5563',
    },
    bold: {
        fontWeight: '700',
        color: '#1f2937',
    },
    footer: {
        padding: 16,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#e5e7eb',
    },
    submitButton: {
        backgroundColor: '#10b981',
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    submitButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    approveActions: {
        flexDirection: 'row',
        gap: 12,
    },
    actionBtn: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    rejectBtn: {
        backgroundColor: '#ef4444',
    },
    approveBtn: {
        backgroundColor: '#10b981',
    },
    actionBtnText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});
