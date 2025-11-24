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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
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
    const [statusFilter, setStatusFilter] = useState('ACTIVE');

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(5);
    const [totalPages, setTotalPages] = useState(1);

    // Modal state
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);

    const [selectedEmployee, setSelectedEmployee] = useState(null);
    // Dropdown data
    const statusData = [
        { label: 'Đang làm', value: 'ACTIVE' },
        { label: 'Đã nghỉ', value: 'INACTIVE' },
    ];

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

    const handleSearch = async (page = 1) => {
        try {
            const res = await searchEmployee({
                employeeID: searchId,
                phoneNumber: searchPhone,
                status: statusFilter,
                page,
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
    };

    const handleReset = async () => {
        setSearchId('');
        setSearchPhone('');
        setStatusFilter('ACTIVE');

        await handleSearch(1);
        setCurrentPage(1);
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

    const renderPagination = () => {
        if (totalPages < 1) return null;

        const pages = [];
        for (let i = 1; i <= totalPages; i++) {
            pages.push(i);
        }

        return (
            <View style={styles.paginationContainer}>
                <TouchableOpacity
                    style={[styles.paginationButton, currentPage === 1 && styles.paginationButtonDisabled]}
                    onPress={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                >
                    <Ionicons name="chevron-back" size={20} color={currentPage === 1 ? '#ccc' : '#374151'} />
                </TouchableOpacity>

                <View style={styles.pageNumbersContainer}>
                    {pages.map((page) => (
                        <TouchableOpacity
                            key={page}
                            style={[styles.pageNumber, currentPage === page && styles.pageNumberActive]}
                            onPress={() => setCurrentPage(page)}
                        >
                            <Text style={[styles.pageNumberText, currentPage === page && styles.pageNumberTextActive]}>
                                {page}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <TouchableOpacity
                    style={[styles.paginationButton, currentPage === totalPages && styles.paginationButtonDisabled]}
                    onPress={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                >
                    <Ionicons
                        name="chevron-forward"
                        size={20}
                        color={currentPage === totalPages ? '#ccc' : '#374151'}
                    />
                </TouchableOpacity>
            </View>
        );
    };

    return (
        <DefaultLayout>
            <Header title="Nhân viên" leftIcon="arrow-back" handleOnPressLeftIcon={() => navigation.goBack()} />
            <View style={styles.container}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.keyboardAvoidingView}
                    keyboardVerticalOffset={0}
                >
                    <ScrollView
                        style={styles.scrollView}
                        showsVerticalScrollIndicator={false}
                        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                    >
                        {/* Search Filters */}
                        <View style={styles.filtersContainer}>
                            <View style={styles.filterRow}>
                                <View style={styles.filterItem}>
                                    <Text style={styles.filterLabel}>Mã nhân viên</Text>
                                    <TextInput
                                        style={styles.filterInput}
                                        placeholder="Nhập mã nhân viên"
                                        placeholderTextColor="#9ca3af"
                                        value={searchId}
                                        onChangeText={setSearchId}
                                    />
                                </View>

                                <View style={styles.filterItem}>
                                    <Text style={styles.filterLabel}>Số điện thoại</Text>
                                    <TextInput
                                        style={styles.filterInput}
                                        placeholder="Nhập số điện thoại"
                                        placeholderTextColor="#9ca3af"
                                        value={searchPhone}
                                        onChangeText={setSearchPhone}
                                        keyboardType="phone-pad"
                                    />
                                </View>
                            </View>

                            <View style={styles.filterRow}>
                                <View style={styles.filterItem}>
                                    <Text style={styles.filterLabel}>Trạng thái làm việc</Text>
                                    <Dropdown
                                        style={styles.dropdown}
                                        placeholderStyle={styles.dropdownPlaceholder}
                                        selectedTextStyle={styles.dropdownSelectedText}
                                        iconStyle={styles.dropdownIcon}
                                        data={statusData}
                                        maxHeight={300}
                                        labelField="label"
                                        valueField="value"
                                        placeholder="Chọn trạng thái"
                                        value={statusFilter}
                                        onChange={(item) => setStatusFilter(item.value)}
                                        renderLeftIcon={() => (
                                            <Ionicons
                                                name="briefcase-outline"
                                                size={18}
                                                color="#6b7280"
                                                style={{ marginRight: 8 }}
                                            />
                                        )}
                                    />
                                </View>
                            </View>

                            {/* Action Buttons */}
                            <View style={styles.actionButtons}>
                                <TouchableOpacity style={styles.searchButton} onPress={() => handleSearch(currentPage)}>
                                    <Ionicons name="search" size={18} color="#fff" />
                                    <Text style={styles.searchButtonText}>Tìm kiếm</Text>
                                </TouchableOpacity>

                                <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
                                    <Ionicons name="refresh" size={18} color="#374151" />
                                    <Text style={styles.resetButtonText}>Đặt lại</Text>
                                </TouchableOpacity>
                            </View>

                            {/* Add Employee Button - Full Width */}
                            <TouchableOpacity style={styles.addEmployeeButton} onPress={handleAddEmployee}>
                                <Ionicons name="person-add" size={20} color="#fff" />
                                <Text style={styles.addEmployeeButtonText}>Thêm nhân viên</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Employee List */}
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
                                    <View key={employee.id} style={styles.employeeCard}>
                                        <View style={styles.cardHeader}>
                                            <View style={styles.cardHeaderLeft}>
                                                <Text style={styles.employeeId}>{employee.id}</Text>
                                                <Text style={styles.employeeName}>{employee.name}</Text>
                                            </View>
                                            <TouchableOpacity
                                                style={styles.viewButton}
                                                onPress={() => handleViewEmployee(employee)}
                                            >
                                                <Ionicons name="pencil" size={20} color="#fff" />
                                            </TouchableOpacity>
                                        </View>

                                        <View style={styles.cardBody}>
                                            {/* Roles Section */}
                                            {employee.roles && employee.roles.length > 0 && (
                                                <View style={styles.rolesSection}>
                                                    <Text style={styles.rolesLabel}>Vai trò:</Text>
                                                    <View style={styles.rolesContainer}>
                                                        {employee.roles.map((role, idx) => (
                                                            <View
                                                                key={idx}
                                                                style={[
                                                                    styles.roleBadge,
                                                                    { backgroundColor: getRoleColor(role) },
                                                                ]}
                                                            >
                                                                <Text style={styles.roleText}>
                                                                    {formatRole[role.roleName]}
                                                                </Text>
                                                            </View>
                                                        ))}
                                                    </View>
                                                </View>
                                            )}

                                            <View style={styles.infoRow}>
                                                <View style={styles.infoItem}>
                                                    <Text style={styles.infoLabel}>Ngày sinh</Text>
                                                    <Text style={styles.infoValue}>{employee.birthDate}</Text>
                                                </View>
                                                <View style={styles.infoItem}>
                                                    <Text style={styles.infoLabel}>Giới tính</Text>
                                                    <Text style={styles.infoValue}>
                                                        {employee.gender == 'male' ? 'Nam' : 'Nữ'}
                                                    </Text>
                                                </View>
                                            </View>

                                            <View style={styles.infoRow}>
                                                <View style={styles.infoItem}>
                                                    <Text style={styles.infoLabel}>Số điện thoại</Text>
                                                    <Text style={styles.infoValue}>{employee.phone}</Text>
                                                </View>
                                                <View style={styles.infoItem}>
                                                    <Text style={styles.infoLabel}>Ngày vào làm</Text>
                                                    <Text style={styles.infoValue}>{employee.startDate}</Text>
                                                </View>
                                            </View>

                                            <View style={styles.infoRow}>
                                                <View style={styles.infoItem}>
                                                    <Text style={styles.infoLabel}>Mã kho</Text>
                                                    <Text style={styles.infoValue}>{employee.warehouse}</Text>
                                                </View>
                                                <View style={styles.infoItem}>
                                                    <Text style={styles.infoLabel}>Trạng thái</Text>
                                                    <View
                                                        style={[
                                                            styles.statusBadge,
                                                            employee.status === 'ACTIVE'
                                                                ? styles.statusActive
                                                                : styles.statusInactive,
                                                        ]}
                                                    >
                                                        <Text style={styles.statusText}>
                                                            {employeeStatus[employee.status]}
                                                        </Text>
                                                    </View>
                                                </View>
                                            </View>
                                        </View>
                                    </View>
                                ))}

                                {renderPagination()}
                            </View>
                        )}
                    </ScrollView>
                </KeyboardAvoidingView>
            </View>

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
    employeeCard: {
        backgroundColor: '#fff',
        borderRadius: 8,
        marginBottom: 12,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    cardHeader: {
        backgroundColor: '#1f2937',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 10,
    },
    cardHeaderLeft: {
        flex: 1,
    },
    employeeId: {
        fontSize: 14,
        fontWeight: '600',
        color: '#fff',
        marginBottom: 2,
    },
    employeeName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#fff',
    },
    viewButton: {
        padding: 4,
    },
    cardBody: {
        padding: 12,
        gap: 10,
    },
    rolesSection: {
        marginBottom: 8,
    },
    rolesLabel: {
        fontSize: 12,
        color: '#6b7280',
        marginBottom: 6,
        fontWeight: '500',
    },
    rolesContainer: {
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
        fontSize: 11,
        fontWeight: '600',
        color: '#fff',
    },
    infoRow: {
        flexDirection: 'row',
        gap: 12,
    },
    infoItem: {
        flex: 1,
    },
    infoLabel: {
        fontSize: 12,
        color: '#6b7280',
        marginBottom: 4,
    },
    infoValue: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1f2937',
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
        alignSelf: 'flex-start',
    },
    statusActive: {
        backgroundColor: '#dcfce7',
    },
    statusInactive: {
        backgroundColor: '#fee2e2',
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#1f2937',
    },
    paginationContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 20,
        paddingVertical: 10,
        gap: 10,
    },
    paginationButton: {
        padding: 8,
        borderRadius: 6,
        minWidth: 36,
        minHeight: 36,
        justifyContent: 'center',
        alignItems: 'center',
    },
    paginationButtonDisabled: {
        opacity: 0.5,
    },
    pageNumbersContainer: {
        flexDirection: 'row',
        gap: 8,
    },
    pageNumber: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 6,
        backgroundColor: '#f5f5f5',
        minWidth: 36,
        minHeight: 36,
        justifyContent: 'center',
        alignItems: 'center',
    },
    pageNumberActive: {
        backgroundColor: '#60a5fa',
    },
    pageNumberText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#666',
    },
    pageNumberTextActive: {
        color: '#fff',
    },
});
