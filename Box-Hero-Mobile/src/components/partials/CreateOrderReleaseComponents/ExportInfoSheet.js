import React from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { generateCode } from '../../../utilities/generate';
import Button from '../../Button';

const ExportInfoSheet = ({ formData, setFormData }) => {
    const handleGenerateCode = () => {
        setFormData((prev) => ({
            ...prev,
            receiptCode: generateCode('PX-'),
        }));
    };

    console.log('form', formData);

    const handleChange = (key, value) => {
        setFormData((prev) => ({
            ...prev,
            [key]: value,
        }));
    };

    return (
        <View style={styles.container}>
            <Text style={styles.headerTitle}>Thông tin chung</Text>

            <View style={styles.row}>
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Mã phiếu</Text>
                    <View style={styles.codeContainer}>
                        <TextInput
                            style={[styles.input, styles.codeInput]}
                            placeholder="Tạo mã phiếu"
                            value={formData.receiptCode}
                            editable={false}
                        />
                        <Button primary small rounded onPress={handleGenerateCode} style={styles.generateBtn}>
                            <Text style={styles.btnText}>Tạo</Text>
                        </Button>
                    </View>
                </View>
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Ngày lập</Text>
                    <TextInput
                        style={[styles.input, styles.readOnly]}
                        value={new Date().toISOString().split('T')[0]}
                        editable={false}
                    />
                </View>
            </View>

            <View style={styles.row}>
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Kho</Text>
                    <TextInput style={[styles.input, styles.readOnly]} value={formData.warehouse} editable={false} />
                </View>
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Người duyệt</Text>
                    <TextInput
                        style={[styles.input, styles.readOnly]}
                        value={formData.approver || 'N/A'}
                        editable={false}
                    />
                </View>
            </View>

            <View style={styles.row}>
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Người lập</Text>
                    <TextInput style={[styles.input, styles.readOnly]} value={formData.createdBy} editable={false} />
                </View>
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Mã KH</Text>
                    <TextInput style={[styles.input, styles.readOnly]} value={formData.customerID} editable={false} />
                </View>
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.label}>Tên khách hàng</Text>
                <TextInput style={[styles.input, styles.readOnly]} value={formData.customerName} editable={false} />
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.label}>Mã phiếu đề xuất</Text>
                <TextInput
                    style={[styles.input, styles.readOnly]}
                    value={formData.orderReleaseProposalID}
                    editable={false}
                />
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.label}>Ghi chú</Text>
                <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="Nhập ghi chú"
                    value={formData.note}
                    onChangeText={(text) => handleChange('note', text)}
                    multiline
                    numberOfLines={3}
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 15,
        backgroundColor: '#fff',
        borderRadius: 8,
        marginBottom: 15,
        elevation: 2,
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 15,
        color: '#333',
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
        gap: 10,
    },
    inputGroup: {
        flex: 1,
        marginBottom: 10,
    },
    label: {
        fontSize: 12,
        color: '#666',
        marginBottom: 5,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 6,
        padding: 8,
        fontSize: 14,
        color: '#333',
        backgroundColor: '#fff',
    },
    readOnly: {
        backgroundColor: '#f5f5f5',
        color: '#888',
    },
    codeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
    },
    codeInput: {
        flex: 1,
    },
    generateBtn: {
        paddingHorizontal: 10,
        paddingVertical: 8,
    },
    btnText: {
        color: '#fff',
        fontSize: 12,
    },
    textArea: {
        height: 80,
        textAlignVertical: 'top',
    },
});

export default ExportInfoSheet;
