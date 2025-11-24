import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import Modal from './Modal';
import Button from './Button';
import { suggestBoxes } from '../service/BatchBox.service';
import { ToastMessage } from './common/ToastMessage';
import { Info, ChevronDown, ChevronUp } from 'lucide-react-native';
import { COLORS } from './style/Globalstyle';

const ModalSuggestLocation = ({ batches, isOpen, onClose, handleSuggestLocationSubmit }) => {
    const [typeFilter, setTypeFilter] = useState({
        locationScore: 0,
        expiredScore: 0,
        unitScore: 0,
        productSimilarityScore: 0,
        enoughAcreageScore: 0,
    });

    const objectPriority = [
        { name: 'Không ưu tiên', value: 0 },
        { name: 'Độ ưu tiên 1', value: 1 },
        { name: 'Độ ưu tiên 2', value: 0.5 },
        { name: 'Độ ưu tiên 3', value: 0.25 },
    ];

    const handleReset = () => {
        setTypeFilter({
            locationScore: 0,
            expiredScore: 0,
            unitScore: 0,
            productSimilarityScore: 0,
            enoughAcreageScore: 0,
        });
    };

    const handleSuggestLocation = async () => {
        if (
            typeFilter.locationScore === 0 &&
            typeFilter.expiredScore === 0 &&
            typeFilter.unitScore === 0 &&
            typeFilter.productSimilarityScore === 0 &&
            typeFilter.enoughAcreageScore === 0
        ) {
            Alert.alert('Lỗi', 'Vui lòng chọn ít nhất một tiêu chí ưu tiên để gợi ý vị trí!');
            return;
        }
        const batchIDs = batches.map((batch) => batch.batchID);
        const payload = {
            batchIDs,
            ...typeFilter,
        };
        const res = await suggestBoxes(payload);

        if (res.data?.status === 'OK') {
            handleSuggestLocationSubmit(res.data.data);
            onClose();
        }
    };

    const PrioritySelector = ({ label, infoContent, value, onChange }) => {
        const [isExpanded, setIsExpanded] = useState(false);
        const selectedOption = objectPriority.find((opt) => opt.value === value) || objectPriority[0];

        const showInfo = () => {
            Alert.alert(label, infoContent);
        };

        return (
            <View style={styles.selectorContainer}>
                <View style={styles.labelContainer}>
                    <Text style={styles.label}>{label}</Text>
                    <TouchableOpacity onPress={showInfo} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                        <Info size={18} color={COLORS.textSecondary || '#666'} />
                    </TouchableOpacity>
                </View>

                <TouchableOpacity
                    style={styles.dropdownHeader}
                    onPress={() => setIsExpanded(!isExpanded)}
                    activeOpacity={0.7}
                >
                    <Text style={styles.dropdownHeaderText}>{selectedOption.name}</Text>
                    {isExpanded ? <ChevronUp size={20} color="#333" /> : <ChevronDown size={20} color="#333" />}
                </TouchableOpacity>

                {isExpanded && (
                    <View style={styles.dropdownList}>
                        {objectPriority.map((opt) => (
                            <TouchableOpacity
                                key={opt.name}
                                style={[styles.dropdownItem, value === opt.value && styles.dropdownItemActive]}
                                onPress={() => {
                                    onChange(opt.value);
                                    setIsExpanded(false);
                                }}
                            >
                                <Text
                                    style={[
                                        styles.dropdownItemText,
                                        value === opt.value && styles.dropdownItemTextActive,
                                    ]}
                                >
                                    {opt.name}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                )}
            </View>
        );
    };

    return (
        <Modal isOpenInfo={isOpen} onClose={onClose} showButtonClose={false}>
            <View style={styles.wrapper}>
                <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                    <PrioritySelector
                        label="Ưu tiên theo vị trí kệ"
                        infoContent="Ưu tiên các vị trí kệ dễ tiếp cận, thuận tiện cho việc nhập – xuất hàng."
                        value={typeFilter.locationScore}
                        onChange={(val) => setTypeFilter({ ...typeFilter, locationScore: val })}
                    />
                    <PrioritySelector
                        label="Ưu tiên theo hạn sử dụng"
                        infoContent="Ưu tiên các vị trí phù hợp với lô hàng có hạn sử dụng ngắn (để dễ xuất kho trước)"
                        value={typeFilter.expiredScore}
                        onChange={(val) => setTypeFilter({ ...typeFilter, expiredScore: val })}
                    />
                    <PrioritySelector
                        label="Ưu tiên theo đơn vị chứa"
                        infoContent="Ưu tiên các vị trí có kích thước phù hợp với đơn vị đóng gói."
                        value={typeFilter.unitScore}
                        onChange={(val) => setTypeFilter({ ...typeFilter, unitScore: val })}
                    />
                    <PrioritySelector
                        label="Ưu tiên theo tương đồng sản phẩm"
                        infoContent="Ưu tiên đặt gần các sản phẩm cùng loại hoặc tương tự để tối ưu không gian và thao tác."
                        value={typeFilter.productSimilarityScore}
                        onChange={(val) => setTypeFilter({ ...typeFilter, productSimilarityScore: val })}
                    />
                    <PrioritySelector
                        label="Ưu tiên theo đủ diện tích"
                        infoContent="Ưu tiên các vị trí còn đủ diện tích trống để chứa toàn bộ lô hàng."
                        value={typeFilter.enoughAcreageScore}
                        onChange={(val) => setTypeFilter({ ...typeFilter, enoughAcreageScore: val })}
                    />
                </ScrollView>

                <View style={styles.actionButtons}>
                    <Button medium primary style={styles.btnAction} onPress={handleReset}>
                        Đặt lại
                    </Button>
                    <Button medium success style={styles.btnAction} onPress={handleSuggestLocation}>
                        Gợi ý vị trí
                    </Button>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    wrapper: {
        width: '100%',
        maxHeight: 500, // Limit height to ensure it fits in modal
    },
    scrollView: {
        marginBottom: 20,
    },
    selectorContainer: {
        marginBottom: 16,
    },
    labelContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginRight: 8,
    },
    dropdownHeader: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    dropdownHeaderText: {
        fontSize: 14,
        color: '#333',
    },
    dropdownList: {
        marginTop: 4,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        backgroundColor: '#fff',
        overflow: 'hidden',
    },
    dropdownItem: {
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    dropdownItemActive: {
        backgroundColor: '#f0f9ff',
    },
    dropdownItemText: {
        fontSize: 14,
        color: '#333',
    },
    dropdownItemTextActive: {
        color: '#007bff',
        fontWeight: '600',
    },
    actionButtons: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 10,
        paddingTop: 10,
        borderTopWidth: 1,
        borderTopColor: '#eee',
    },
    btnAction: {
        marginLeft: 8,
    },
});

export default ModalSuggestLocation;
