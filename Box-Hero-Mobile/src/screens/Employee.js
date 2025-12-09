import React, { useState, useEffect, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
    RefreshControl,
    KeyboardAvoidingView,
    Platform,
    Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ChevronLeft, Filter, X, ChevronRight, Plus } from 'lucide-react-native';
import { Dropdown } from 'react-native-element-dropdown';
import { useNavigation } from '@react-navigation/native';
import { DefaultLayout } from '../layouts';
import Header from '../layouts/Header';
import { createEmployee, getEmployeeList, searchEmployee, updateEmployee } from '../service/employee.service';
import { employeeStatus, formatRole } from '../constants';
import CreateEmployee from '../components/partials/EmployeeScreenComponents/CreateEmployee';
import { uploadImageFromURI } from '../utilities/uploadImageRN';

export default function Employee() {
    const navigation = useNavigation();

    // State management
    const [employees, setEmployees] = useState([]);
    //const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [searchId, setSearchId] = useState('');
    const [searchPhone, setSearchPhone] = useState('');
    const [activeTab, setActiveTab] = useState('ACTIVE');

    const tabs = [
        { key: 'ACTIVE', title: 'Đang làm việc' },
        { key: 'INACTIVE', title: 'Nghỉ việc' },
    ];

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(5);
    const [totalPages, setTotalPages] = useState(1);

    // Modal state
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showFilter, setShowFilter] = useState(false);

    const [selectedEmployee, setSelectedEmployee] = useState(null);

    // Mock data - Replace with actual API call
    // const mockEmployees = [
    //     {
    //         id: 'NV12022',
    //         name: 'Hiếu',
    //         birthDate: '2006-01-12',
    //         gender: 'Nam',
    //         phone: '0912347122',
    //         startDate: '2020-12-12',
    //         warehouse: 'WH1',
    //         status: 'Đang làm',
    //         roles: ['Quản lý', 'Nhân viên kho'],
    //     },
    //     {
    //         id: 'NV12Sad',
    //         name: 'Quốc Bảo',
    //         birthDate: '2006-01-15',
    //         gender: 'Nam',
    //         phone: '0912347182',
    //         startDate: '2025-10-16',
    //         warehouse: 'WH1',
    //         status: 'Đang làm',
    //         roles: ['Nhân viên bán hàng'],
    //     },
    //     {
    //         id: 'NV6962',
    //         name: 'Hùng',
    //         birthDate: '2004-02-15',
    //         gender: 'Nam',
    //         phone: '0886441290',
    //         startDate: '2025-10-16',
    //         warehouse: 'WH1',
    //         status: 'Đang làm',
    //         roles: ['Nhân viên kho', 'Thủ kho'],
    //     },
    // ];

    useEffect(() => {
        handleSearch(currentPage);
    }, [currentPage]);

    const onRefresh = async () => {
        setRefreshing(true);
        await handleSearch(1);
        setRefreshing(false);
    };

    const handleSearch = async (page = 1, statusOverride = null) => {
        try {
            const status = statusOverride !== null ? statusOverride : activeTab;
            const res = await searchEmployee({
                employeeID: searchId,
                phoneNumber: searchPhone,
                status: status,
                page,
            });
            setShowFilter(false);
            const formatDataFilter = res.employeeFilter.map((it) => ({
                id: it.employeeID,
                name: it.employeeName,
                birthDate: new Date(it.dob).toISOString().split('T')[0],
                gender: it.gender,
                phone: it.phoneNumber,
                startDate: new Date(it.startDate).toISOString().split('T')[0],
                endDate: new Date(it?.endDate).toISOString().split('T')[0] || '',
                warehouse: it.warehouseID,
                status: it.status,
                roles: it.roles,
                image: it.image,
                cccd: it.cccd,
                address: it.address,
                username: it.account.email,
            }));
            setEmployees(formatDataFilter);
            setCurrentPage(res?.pagination?.currentPage || 1);
            setTotalPages(res?.pagination?.totalPages || 1);
        } catch (err) {
            console.log('err', err);
        }
    };

    const handleReset = async () => {
        setSearchId('');
        setSearchPhone('');
        setActiveTab('ACTIVE');

        // Reset search immediately with default values
        try {
            const res = await searchEmployee({
                employeeID: '',
                phoneNumber: '',
                status: 'ACTIVE',
                page: 1,
            });
            const formatDataFilter = res.employeeFilter.map((it) => ({
                id: it.employeeID,
                name: it.employeeName,
                birthDate: new Date(it.dob).toISOString().split('T')[0],
                gender: it.gender,
                phone: it.phoneNumber,
                startDate: new Date(it.startDate).toISOString().split('T')[0],
                endDate: new Date(it?.endDate).toISOString().split('T')[0] || '',
                warehouse: it.warehouseID,
                status: it.status,
                roles: it.roles,
                image: it.image,
                cccd: it.cccd,
                address: it.address,
                username: it.account.email,
            }));
            setEmployees(formatDataFilter);
            setCurrentPage(res?.pagination?.currentPage || 1);
            setTotalPages(res?.pagination?.totalPages || 1);
        } catch (err) {
            console.log('err', err);
        }
        setShowFilter(false);
    };

    const handleApplyFilter = () => {
        handleSearch(1);
    };

    const handleViewEmployee = (employee) => {
        setSelectedEmployee(employee);
        setShowEditModal(true);
    };

    const handleAddEmployee = () => {
        console.log('Add employee');
        setShowCreateModal(true);
    };

    const handleCreateEmployee = async (employeeData) => {
        console.log('Create employee:', employeeData);
        // TODO: Call API to create employee
        try {
            // upload image
            const resultImage = await uploadImageFromURI(employeeData.image);
            const res = await createEmployee({ ...employeeData, image: resultImage });
            if (res) {
                await handleSearch(1);
                setShowCreateModal(false);
            }
        } catch (err) {
            console.log(err);
            return;
        }
    };

    const handleEditEmployee = async (updateEmployeeData) => {
        console.log('Edit employee:', updateEmployeeData);
        try {
            // upload image
            let resultImage = '';

            if (updateEmployeeData.image !== selectedEmployee.image || updateEmployeeData.image === null) {
                resultImage = await uploadImageFromURI(updateEmployeeData.image);
            }

            const res = await updateEmployee({
                ...updateEmployeeData,
                image: resultImage ? resultImage : selectedEmployee.image,
            });
            if (res) {
                await handleSearch(1);
                setShowEditModal(false);
                setSelectedEmployee(null);
            }
        } catch (err) {
            console.log(err);
            return;
        }
    };

    const filteredEmployees = useMemo(() => employees, [employees]);

    // Function to get role badge color
    const getRoleColor = (role) => {
        const roleColors = {
            'Quản lý kho': '#8b5cf6',
            'Nhân viên xuất hàng': '#3b82f6',
            'Nhân viên nhận hàng': '#10b981',
            'Kế toán': '#f59e0b',
            'Quản trị viên': '#1e40af',
        };
        return roleColors[formatRole[role.roleName]] || '#6b7280';
    };

    return (
        <DefaultLayout>
            <Header
                title="Nhân viên"
                leftIcon="arrow-back"
                handleOnPressLeftIcon={() => navigation.goBack()}
                RightComponent={
                    <TouchableOpacity onPress={() => setShowFilter(true)}>
                        <Filter size={24} color="white" />
                    </TouchableOpacity>
                }
            />
            <View style={styles.tabContainer}>
                {tabs.map((tab) => (
                    <TouchableOpacity
                        key={tab.key}
                        style={[styles.tabItem, activeTab === tab.key && styles.activeTabItem]}
                        onPress={() => {
                            setActiveTab(tab.key);
                            setCurrentPage(1);
                            handleSearch(1, tab.key);
                        }}
                    >
                        <Text style={[styles.tabTitle, activeTab === tab.key && styles.activeTabTitle]}>
                            {tab.title}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
            <View style={styles.container}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.keyboardAvoidingView}
                    keyboardVerticalOffset={0}
                >
                    <ScrollView
                        style={styles.scrollView}
                        contentContainerStyle={{ paddingBottom: 100 }}
                        showsVerticalScrollIndicator={false}
                        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                    >
                        {/* Employee List */}
                        <View style={styles.listHeader}>
                            <Text style={styles.listTitle}>Danh sách nhân viên</Text>
                        </View>

                        {refreshing ? (
                            <View style={styles.loadingContainer}>
                                <ActivityIndicator size="large" color="#1e40af" />
                            </View>
                        ) : filteredEmployees.length === 0 ? (
                            <View style={styles.emptyState}>
                                <Ionicons name="people-outline" size={64} color="#ccc" />
                                <Text style={styles.emptyStateText}>Không có nhân viên nào</Text>
                            </View>
                        ) : (
                            <View style={styles.listContainer}>
                                {filteredEmployees.map((employee, index) => (
                                    <View key={employee.id} style={styles.card}>
                                        <View style={styles.cardHeader}>
                                            <Text style={styles.cardId}>{employee.id}</Text>
                                            <View
                                                style={[
                                                    styles.statusTag,
                                                    {
                                                        backgroundColor:
                                                            employee.status === 'ACTIVE' ? '#10b981' : '#ef4444',
                                                    },
                                                ]}
                                            >
                                                <Text style={styles.statusText}>{employeeStatus[employee.status]}</Text>
                                            </View>
                                        </View>

                                        <View style={styles.cardBody}>
                                            <View style={styles.infoRow}>
                                                <Ionicons name="person-outline" size={16} color="#6b7280" />
                                                <Text style={styles.infoText}>Họ tên: {employee.name}</Text>
                                            </View>
                                            <View style={styles.infoRow}>
                                                <Ionicons name="call-outline" size={16} color="#6b7280" />
                                                <Text style={styles.infoText}>SĐT: {employee.phone}</Text>
                                            </View>
                                            <View style={styles.infoRow}>
                                                <Ionicons name="business-outline" size={16} color="#6b7280" />
                                                <Text style={styles.infoText}>Kho: {employee.warehouse}</Text>
                                            </View>
                                            <View style={styles.infoRow}>
                                                <Ionicons name="calendar-outline" size={16} color="#6b7280" />
                                                <Text style={styles.infoText}>Ngày sinh: {employee.birthDate}</Text>
                                            </View>
                                            <View style={styles.infoRow}>
                                                <Ionicons name="male-female-outline" size={16} color="#6b7280" />
                                                <Text style={styles.infoText}>
                                                    Giới tính: {employee.gender == 'male' ? 'Nam' : 'Nữ'}
                                                </Text>
                                            </View>
                                            <View style={styles.infoRow}>
                                                <Ionicons name="time-outline" size={16} color="#6b7280" />
                                                <Text style={styles.infoText}>Ngày vào làm: {employee.startDate}</Text>
                                            </View>

                                            <View style={styles.roleContainer}>
                                                <Text style={styles.roleLabel}>Vai trò:</Text>
                                                <View style={styles.roleBadgeContainer}>
                                                    {employee.roles.map((r, idx) => (
                                                        <View
                                                            key={idx}
                                                            style={[
                                                                styles.roleBadge,
                                                                { backgroundColor: getRoleColor(r) },
                                                            ]}
                                                        >
                                                            <Text style={styles.roleText}>
                                                                {formatRole[r.roleName]}
                                                            </Text>
                                                        </View>
                                                    ))}
                                                </View>
                                            </View>
                                        </View>

                                        <View style={styles.cardFooter}>
                                            <TouchableOpacity
                                                style={styles.detailButton}
                                                onPress={() => handleViewEmployee(employee)}
                                            >
                                                <Text style={styles.detailButtonText}>Chỉnh sửa</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                ))}
                            </View>
                        )}
                    </ScrollView>
                </KeyboardAvoidingView>

                {/* Floating Action Button */}
                <TouchableOpacity style={styles.fab} onPress={handleAddEmployee}>
                    <Plus size={24} color="white" />
                </TouchableOpacity>

                {/* Pagination */}
                <View style={styles.footer}>
                    <TouchableOpacity
                        disabled={currentPage <= 1}
                        onPress={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        style={[styles.pageBtn, currentPage <= 1 && styles.disabledBtn]}
                    >
                        <ChevronLeft size={20} color={currentPage <= 1 ? '#9ca3af' : '#374151'} />
                    </TouchableOpacity>
                    <Text style={styles.pageText}>
                        Trang {currentPage} / {totalPages || 1}
                    </Text>
                    <TouchableOpacity
                        disabled={currentPage >= totalPages}
                        onPress={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                        style={[styles.pageBtn, currentPage >= totalPages && styles.disabledBtn]}
                    >
                        <ChevronRight size={20} color={currentPage >= totalPages ? '#9ca3af' : '#374151'} />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Filter Modal */}
            <Modal visible={showFilter} animationType="slide" transparent={true}>
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Bộ lọc</Text>
                            <TouchableOpacity onPress={() => setShowFilter(false)}>
                                <X size={24} color="#333" />
                            </TouchableOpacity>
                        </View>
                        <ScrollView showsVerticalScrollIndicator={false}>
                            <View style={styles.filterSection}>
                                <View style={styles.inputGroup}>
                                    <Text style={styles.inputLabel}>Mã nhân viên</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Nhập mã nhân viên"
                                        value={searchId}
                                        onChangeText={setSearchId}
                                    />
                                </View>

                                <View style={styles.inputGroup}>
                                    <Text style={styles.inputLabel}>Số điện thoại</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Nhập số điện thoại"
                                        value={searchPhone}
                                        onChangeText={setSearchPhone}
                                        keyboardType="phone-pad"
                                    />
                                </View>
                            </View>
                        </ScrollView>
                        <View style={styles.modalFooter}>
                            <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
                                <Text style={styles.resetButtonText}>Đặt lại</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.applyButton} onPress={handleApplyFilter}>
                                <Text style={styles.applyButtonText}>Áp dụng</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Create Employee Modal */}
            {showCreateModal && (
                <CreateEmployee
                    visible={showCreateModal}
                    onClose={() => setShowCreateModal(false)}
                    onSubmit={handleCreateEmployee}
                />
            )}
            {showEditModal && (
                <CreateEmployee
                    visible={showEditModal}
                    onClose={() => setShowEditModal(false)}
                    onSubmit={handleEditEmployee}
                    initialData={selectedEmployee}
                    mode={'update'}
                />
            )}
        </DefaultLayout>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f3f4f6',
    },
    keyboardAvoidingView: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
    },
    filtersContainer: {
        backgroundColor: '#fff',
        padding: 16,
        marginBottom: 12,
        borderRadius: 8,
        marginHorizontal: 12,
        marginTop: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    filterRow: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 12,
    },
    filterItem: {
        flex: 1,
    },
    filterLabel: {
        fontSize: 13,
        fontWeight: '500',
        color: '#374151',
        marginBottom: 6,
    },
    filterInput: {
        borderWidth: 1,
        borderColor: '#d1d5db',
        borderRadius: 6,
        paddingHorizontal: 12,
        paddingVertical: 8,
        fontSize: 14,
        color: '#1f2937',
        backgroundColor: '#fff',
    },
    dropdown: {
        borderWidth: 1,
        borderColor: '#d1d5db',
        borderRadius: 6,
        paddingHorizontal: 12,
        paddingVertical: 8,
        backgroundColor: '#fff',
    },
    dropdownPlaceholder: {
        fontSize: 14,
        color: '#9ca3af',
    },
    dropdownSelectedText: {
        fontSize: 14,
        color: '#1f2937',
        fontWeight: '500',
    },
    dropdownIcon: {
        width: 20,
        height: 20,
    },
    actionButtons: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 4,
    },
    searchButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#1f2937',
        paddingVertical: 10,
        borderRadius: 6,
        gap: 6,
    },
    searchButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
    resetButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#d1d5db',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 6,
        gap: 6,
    },
    resetButtonText: {
        color: '#374151',
        fontSize: 14,
        fontWeight: '600',
    },
    addEmployeeButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#1e40af',
        paddingVertical: 12,
        borderRadius: 6,
        marginTop: 12,
        gap: 8,
    },
    addEmployeeButtonText: {
        color: '#fff',
        fontSize: 15,
        fontWeight: '600',
    },
    listContainer: {
        paddingHorizontal: 12,
        paddingBottom: 20,
    },
    loadingContainer: {
        paddingVertical: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
    },
    emptyStateText: {
        fontSize: 16,
        color: '#9ca3af',
        marginTop: 12,
    },
    card: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    cardId: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1f2937',
    },
    statusTag: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusText: {
        color: 'white',
        fontSize: 12,
        fontWeight: '600',
    },
    cardBody: {
        marginBottom: 12,
        gap: 8,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    infoText: {
        fontSize: 14,
        color: '#4b5563',
    },
    roleContainer: {
        marginTop: 4,
    },
    roleLabel: {
        fontSize: 14,
        color: '#4b5563',
        marginBottom: 6,
        fontWeight: '500',
    },
    roleBadgeContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 6,
    },
    roleBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    roleText: {
        color: 'white',
        fontSize: 11,
        fontWeight: '600',
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
    },
    detailButton: {
        alignItems: 'center',
        padding: 10,
        borderRadius: 8,
        backgroundColor: '#eff6ff',
        width: '100%',
    },
    detailButtonText: {
        color: '#2563eb',
        fontWeight: '600',
    },
    listHeader: {
        paddingHorizontal: 12,
        paddingTop: 16,
        paddingBottom: 8,
    },
    listTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    // FAB
    fab: {
        position: 'absolute',
        bottom: 80,
        right: 20,
        backgroundColor: '#2563eb',
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    // Pagination
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#fff',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 12,
        borderTopWidth: 1,
        borderTopColor: '#e5e7eb',
        gap: 20,
        paddingBottom: 20,
    },
    pageBtn: {
        padding: 8,
        borderRadius: 8,
        backgroundColor: '#f3f4f6',
    },
    disabledBtn: {
        opacity: 0.5,
    },
    pageText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#374151',
    },
    // Filter Modal
    modalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: 'white',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
        height: '80%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    filterSection: {
        marginBottom: 20,
    },
    inputGroup: {
        marginBottom: 16,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '500',
        marginBottom: 6,
        color: '#555',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 6,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 14,
        backgroundColor: '#fff',
    },
    modalFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 'auto',
        paddingTop: 20,
        marginBottom: 15,
    },
    resetButton: {
        padding: 15,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#ddd',
        flex: 1,
        marginRight: 10,
        alignItems: 'center',
        backgroundColor: 'white',
    },
    resetButtonText: {
        color: '#666',
        fontWeight: '600',
    },
    applyButton: {
        backgroundColor: '#2563eb',
        padding: 15,
        borderRadius: 10,
        flex: 1,
        marginLeft: 10,
        alignItems: 'center',
    },
    applyButtonText: {
        color: 'white',
        fontWeight: '600',
    },
    tabContainer: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
        gap: 8,
    },
    tabItem: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#f3f4f6',
    },
    activeTabItem: {
        backgroundColor: '#2563eb',
    },
    tabTitle: {
        fontSize: 14,
        fontWeight: '500',
        color: '#4b5563',
    },
    activeTabTitle: {
        color: '#fff',
        fontWeight: '600',
    },
});
