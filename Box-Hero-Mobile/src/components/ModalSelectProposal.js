import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, FlatList, TextInput, ActivityIndicator } from 'react-native';
import { X, Search, FileText } from 'lucide-react-native';
import { fetchProposalMissingOrderPurchase } from '../service/proposal.service';
import { formatDate } from '../utilities/formatDate';

const ModalSelectProposal = ({ visible, onClose, onSelect }) => {
    const [proposals, setProposals] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredProposals, setFilteredProposals] = useState([]);

    useEffect(() => {
        if (visible) {
            loadProposals();
        }
    }, [visible]);

    useEffect(() => {
        if (searchQuery) {
            const lower = searchQuery.toLowerCase();
            const filtered = proposals.filter(
                (p) =>
                    p.proposalID?.toLowerCase().includes(lower) ||
                    p.employeeCreate?.employeeName?.toLowerCase().includes(lower),
            );
            setFilteredProposals(filtered);
        } else {
            setFilteredProposals(proposals);
        }
    }, [searchQuery, proposals]);

    const loadProposals = async () => {
        try {
            const res = await fetchProposalMissingOrderPurchase();

            if (res && res.proposals) {
                setProposals(res.proposals);
                setFilteredProposals(res.proposals);
            }
        } catch (error) {
            console.log('Error loading proposals:', error);
        }
    };

    const renderItem = ({ item }) => (
        <TouchableOpacity
            style={styles.itemContainer}
            onPress={() => {
                onSelect(item);
                onClose();
            }}
        >
            <View style={styles.iconContainer}>
                <FileText size={24} color="#2563EB" />
            </View>
            <View style={styles.itemContent}>
                <Text style={styles.itemTitle}>{item.proposalID}</Text>
                <Text style={styles.itemSubtitle}>
                    Người tạo: {item.employeeCreate?.employeeName} • {formatDate(item.createdAt)}
                </Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <Modal visible={visible} animationType="fade" transparent={true} onRequestClose={onClose}>
            <View style={styles.modalOverlay}>
                <View style={styles.modalContainer}>
                    <View style={styles.header}>
                        <Text style={styles.headerTitle}>Chọn phiếu đề xuất</Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <X size={20} color="#6B7280" />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.searchContainer}>
                        <Search size={20} color="#9CA3AF" style={styles.searchIcon} />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Tìm kiếm mã phiếu, người tạo..."
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                    </View>
                    <FlatList
                        data={filteredProposals}
                        renderItem={renderItem}
                        keyExtractor={(item) => item.proposalID}
                        contentContainerStyle={styles.listContent}
                        ListEmptyComponent={<Text style={styles.emptyText}>Không tìm thấy phiếu đề xuất nào</Text>}
                    />
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContainer: {
        width: '100%',
        maxWidth: 400,
        backgroundColor: '#fff',
        borderRadius: 16,
        overflow: 'hidden',
        maxHeight: '80%',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#111827',
    },
    closeButton: {
        padding: 4,
        borderRadius: 20,
        backgroundColor: '#F3F4F6',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
        margin: 16,
        paddingHorizontal: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        height: 44,
        fontSize: 14,
        color: '#111827',
    },
    listContent: {
        paddingHorizontal: 16,
        paddingBottom: 16,
    },
    itemContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#EFF6FF',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    itemContent: {
        flex: 1,
    },
    itemTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1F2937',
        marginBottom: 2,
    },
    itemSubtitle: {
        fontSize: 13,
        color: '#6B7280',
    },
    emptyText: {
        textAlign: 'center',
        color: '#6B7280',
        marginTop: 20,
        fontSize: 14,
    },
});

export default ModalSelectProposal;
