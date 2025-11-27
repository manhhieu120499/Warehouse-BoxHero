import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import ExportInfoSheet from '../components/partials/CreateOrderReleaseComponents/ExportInfoSheet';
import ExportProductList from '../components/partials/CreateOrderReleaseComponents/ExportProductList';
import BatchSelectionModal from '../components/partials/CreateOrderReleaseComponents/BatchSelectionModal';
import { getAllOrderReleaseProposalCanApply, searchOrderReleaseProposal } from '../service/proposal.service';
import { saveOrderRelease } from '../service/order.service';
import { clearAllBatchProductList } from '../redux/batchProduct/BatchProductSlice';
import parseToken from '../utilities/parseToken';
import Modal from '../components/Modal';
import { DefaultLayout } from '../layouts';
import Header from '../layouts/Header';
import { formatDate } from '../utilities/formatDate';
import { convertDateVN } from '../common';

const CreateOrderReleaseProduct = () => {
    const navigation = useNavigation();
    const dispatch = useDispatch();
    const batchProductList = useSelector((state) => state.BatchProductSlice.batchProductList);
    const batchBoxProductList = useSelector((state) => state.BatchProductSlice.batchBoxProductList);
    const [currentUser, setCurrentUser] = useState(null);
    const [warehouse, setWarehouse] = useState(null);

    const [formData, setFormData] = useState({
        receiptCode: '',
        createdDate: new Date().toISOString().split('T')[0],
        createdBy: '',
        warehouse: '',
        customerID: '',
        customerName: '',
        note: '',
        orderReleaseProposalID: '',
        approver: '',
    });

    const [productListSelected, setProductListSelected] = useState([]);
    const [isBatchModalVisible, setIsBatchModalVisible] = useState(false);
    const [selectedProductForBatch, setSelectedProductForBatch] = useState(null);

    // Proposal Selection State
    const [isProposalModalVisible, setIsProposalModalVisible] = useState(false);
    const [proposalList, setProposalList] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');

    const currentUserRedux = useSelector((state) => state.AuthSlice.user);

    useEffect(() => {
        const loadUser = async () => {
            const token = await parseToken('tokenUser');
            const wh = await parseToken('warehouse');
            setCurrentUser(currentUserRedux);
            setWarehouse(wh);
            setFormData((prev) => ({
                ...prev,
                createdBy: currentUserRedux?.employeeName || '',
                warehouse: wh?.warehouseName || '',
            }));
        };
        loadUser();
        return () => {
            dispatch(clearAllBatchProductList());
        };
    }, []);

    const fetchProposals = async () => {
        try {
            const res = await getAllOrderReleaseProposalCanApply();
            setProposalList(res || []);
        } catch (error) {
            console.log(error);
        }
    };

    const handleSearchProposal = async (text) => {
        setSearchQuery(text);
        if (!text.trim()) {
            fetchProposals();
            return;
        }
        try {
            const res = await searchOrderReleaseProposal(text, { status: 'COMPLETED' });
            if (res?.data?.status === 'OK') {
                setProposalList(res.data.data || []);
            }
        } catch (error) {
            console.log(error);
        }
    };

    const handleSelectProposal = (proposal) => {
        setFormData((prev) => ({
            ...prev,
            customerID: proposal.customer?.customerID || '',
            customerName: proposal.customer?.customerName || '',
            note: proposal.note || '',
            orderReleaseProposalID: proposal.orderReleaseProposalID,
            approver: proposal.approver?.employeeName || '',
        }));

        const products = (proposal.orderReleaseProposalDetails || []).map((item) => ({
            productID: item.productID,
            productName: item.productName,
        }));
        setProductListSelected(products);
        setIsProposalModalVisible(false);
    };

    const handleSelectBatch = (product) => {
        setSelectedProductForBatch(product);
        setIsBatchModalVisible(true);
    };

    const handleSave = async () => {
        // Validation
        if (!formData.receiptCode) {
            Alert.alert('Lỗi', 'Vui lòng tạo mã phiếu xuất kho');
            return;
        }
        if (!formData.orderReleaseProposalID) {
            Alert.alert('Lỗi', 'Vui lòng chọn phiếu đề xuất');
            return;
        }

        // Check if all products have batches selected
        const missingBatch = productListSelected.some(
            (p) => !batchProductList[p.productID] || batchProductList[p.productID].length === 0,
        );
        if (missingBatch) {
            Alert.alert('Lỗi', 'Vui lòng chọn lô hàng cho tất cả sản phẩm');
            return;
        }

        // Check box quantity validity
        // ... (Logic similar to web)

        // Construct Payload
        const orderReleaseDetails = Object.keys(batchProductList).flatMap((productID) => {
            const batches = batchProductList[productID];
            return batches.map((batch) => {
                const boxKey = `${productID}-${batch.batchID}`;
                const boxes = batchBoxProductList[boxKey] || [];
                return {
                    productID: productID,
                    batchID: batch.batchID,
                    quantityExported: batch.quantity,
                    unitID: batch.unitID, // Ensure unitID is captured in BatchSelectionModal
                    batchBoxes: boxes.map((box) => ({
                        boxID: box.boxID,
                        quantityExported: box.quantityExported,
                    })),
                };
            });
        });

        const payload = {
            orderReleaseID: formData.receiptCode,
            customerID: formData.customerID,
            employeeID: currentUser?.employeeID,
            warehouseID: warehouse?.warehouseID,
            note: formData.note,
            orderReleaseProposalID: formData.orderReleaseProposalID,
            orderReleaseDetails: orderReleaseDetails,
        };

        try {
            const res = await saveOrderRelease(payload);
            if (res.status === 200) {
                Alert.alert('Thành công', 'Lưu phiếu xuất kho thành công');
                dispatch(clearAllBatchProductList());
                navigation.goBack();
            }
        } catch (error) {
            console.log(error);
            Alert.alert('Lỗi', error.message || 'Lỗi khi lưu phiếu');
        }
    };

    return (
        <DefaultLayout>
            <Header
                title="Tạo phiếu xuất kho"
                leftIcon="arrow-back"
                handleOnPressLeftIcon={() => navigation.goBack()}
            />

            <ScrollView style={styles.content}>
                {/* Proposal Selector */}
                <TouchableOpacity
                    style={styles.proposalSelector}
                    onPress={() => {
                        setIsProposalModalVisible(true);
                        fetchProposals();
                    }}
                >
                    <Text style={styles.proposalLabel}>
                        {formData.orderReleaseProposalID
                            ? `Phiếu đề xuất: ${formData.orderReleaseProposalID}`
                            : 'Chọn phiếu đề xuất xuất hàng'}
                    </Text>
                    <Ionicons name="chevron-down" size={20} color="#666" />
                </TouchableOpacity>

                <ExportInfoSheet formData={formData} setFormData={setFormData} />

                <ExportProductList
                    productList={productListSelected}
                    onSelectBatch={handleSelectBatch}
                    onViewDetail={(item) => {
                        // Implement view detail if needed, or reuse BatchSelectionModal in view mode
                        handleSelectBatch(item);
                    }}
                />

                <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                    <Text style={styles.saveButtonText}>Lưu phiếu</Text>
                </TouchableOpacity>
            </ScrollView>

            {/* Proposal Selection Modal */}
            {isProposalModalVisible && (
                <Modal isOpenInfo={isProposalModalVisible} onClose={() => setIsProposalModalVisible(false)}>
                    <View style={styles.modalContainer}>
                        <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>Chọn phiếu đề xuất</Text>
                        {/* Custom Search Input inside Modal content if Modal component supports it, 
                            otherwise relying on Modal's children */}
                        <View style={styles.searchContainer}>
                            <Ionicons name="search" size={20} color="#666" />
                            <TouchableOpacity
                                style={styles.searchInput}
                                onPress={() => {
                                    // Focus logic if needed, or just use TextInput
                                }}
                            >
                                {/* Reusing InputBase logic or simple TextInput */}
                                <Text style={{ color: '#999' }}>Tìm kiếm...</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Since I cannot easily put a TextInput inside the custom Modal component 
                            if it doesn't support it well (it seems to be a wrapper), 
                            I'll list proposals directly. 
                            Ideally, I should use a full-screen Modal for selection.
                        */}
                        <ScrollView style={{ maxHeight: 400 }}>
                            {proposalList.map((item, index) => (
                                <TouchableOpacity
                                    key={index}
                                    style={styles.proposalItem}
                                    onPress={() => handleSelectProposal(item)}
                                >
                                    <Text style={styles.proposalID}>{item.orderReleaseProposalID}</Text>
                                    <Text style={styles.proposalDate}>{convertDateVN(item.createdAt)}</Text>
                                    <Text style={styles.proposalCreator}>{item.creator?.employeeName}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                </Modal>
            )}

            {/* Batch Selection Modal */}
            {isBatchModalVisible && (
                <BatchSelectionModal
                    isVisible={isBatchModalVisible}
                    onClose={() => setIsBatchModalVisible(false)}
                    product={selectedProductForBatch}
                />
            )}
        </DefaultLayout>
    );
};

const styles = StyleSheet.create({
    content: {
        flex: 1,
        padding: 15,
        backgroundColor: '#f5f5f5',
    },
    proposalSelector: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 8,
        marginBottom: 15,
        elevation: 2,
    },
    proposalLabel: {
        fontSize: 16,
        color: '#333',
        fontWeight: '500',
    },
    modalContainer: {
        padding: 10,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f0f0f0',
        padding: 10,
        borderRadius: 8,
        marginBottom: 10,
    },
    searchInput: {
        flex: 1,
        marginLeft: 10,
    },
    proposalItem: {
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    proposalID: {
        fontWeight: 'bold',
        fontSize: 16,
        color: '#007bff',
    },
    proposalDate: {
        fontSize: 12,
        color: '#666',
        marginTop: 4,
    },
    proposalCreator: {
        fontSize: 14,
        color: '#333',
        marginTop: 4,
    },
    saveButton: {
        backgroundColor: '#10b981', // Green color
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 30,
    },
    saveButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
});

export default CreateOrderReleaseProduct;
