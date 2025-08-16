import React, { useState, useEffect } from 'react';
import classNames from 'classnames/bind';
import { MyTable, Button, Popper, Modal, ModalOrder } from '@/components';
import { Eye, PencilIcon } from 'lucide-react';
import { Trash2 } from 'lucide-react';
import styles from './SupplierPage.module.scss';
import globalStyle from '../../components/GlobalStyle/GlobalStyle.module.scss';
import Tippy from '@tippyjs/react';
import ModalUpdate from '../../components/ModalUpdate';
import { ModelFilter } from '../../components';
import { get, post } from '@/utils/httpRequest';
import { del } from '@/utils/httpRequest';
import axios from 'axios';
import { put } from '../../utils/httpRequest';
import { set } from 'react-hook-form';
const cxGlobal = classNames.bind(globalStyle);

const cx = classNames.bind(styles);

const SupplierPage = () => {
    const [page, setPage] = useState(1);
    const [data, setData] = useState([]);
    const [total, setTotal] = useState(0);
    const pageSize = 10;
    const [supplierId, setSupplierId] = useState(null);
    const [supplierName, setSupplierName] = useState('');
    const [supplierPhone, setSupplierPhone] = useState('');
    const [supplierAddress, setSupplierAddress] = useState('');
    const [supplierEmail, setSupplierEmail] = useState('');
    const [updateError, setUpdateError] = useState('');
    const [isOpenInfo, setIsOpenInfo] = useState(false);
    const [isOpenCreate, setIsOpenCreate] = useState(false);
    const [newSupplier, setNewSupplier] = useState({
        supplierId: '',
        supplierName: '',
        address: '',
        phoneNumber: '',
        email: '',
    });
    const [createError, setCreateError] = useState('');
    const [filters, setFilters] = useState({
        supplierId: '',
        phoneNumber: '',
        email: '',
    });
    // Hàm tạo mã NCC ngẫu nhiên
    const generateSupplierId = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let result = '';
        for (let i = 0; i < 5; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return 'NCC' + result;
    };
    // Xử lý mở modal tạo mới
    const openCreateModal = () => {
        setNewSupplier({
            supplierId: generateSupplierId(),
            supplierName: '',
            address: '',
            phoneNumber: '',
            email: '',
        });
        setIsOpenCreate(true);
    };

    // Xử lý đóng modal tạo mới
    const closeCreateModal = () => {
        setIsOpenCreate(false);
    };

    // Xử lý thay đổi input
    const handleChangeNewSupplier = (field, value) => {
        setNewSupplier((prev) => ({ ...prev, [field]: value }));
    };

    // Xử lý submit tạo mới
    const handleCreateSupplier = async () => {
        setCreateError('');
        try {
            const tokenUser = JSON.parse(localStorage.getItem('tokenUser'));
            //const employeeId = JSON.parse(localStorage.getItem('employeeID'));
            const res = await post('/api/supplier', newSupplier, tokenUser.accessToken, tokenUser.employeeID);
            console.log('123' + res);
            if (res.status === 'ERR') {
                setCreateError(res.message);
                console.log('123');
            } else {
                setIsOpenCreate(false);
                fetchSuppliers(page);
            }
        } catch (error) {
            console.error('Error occurred while creating supplier:', error.response.data.messages);
            setCreateError(error.response.data.messages[0]);
        }
    };

    const columns = [
        {
            title: 'Mã NCC',
            dataIndex: 'supplierId',
            key: 'supplierId',
            width: '10%',
            ellipsis: true,
        },
        {
            title: 'Tên nhà cung cấp',
            dataIndex: 'name',
            key: 'name',
            width: '20%',
            ellipsis: true,
        },
        {
            title: 'SDT',
            dataIndex: 'phone',
            key: 'phone',
            width: '10%',
            ellipsis: true,
        },
        {
            title: 'Địa chỉ',
            dataIndex: 'address',
            key: 'address',
            width: '30%',
            ellipsis: true,
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
            width: '20%',
            ellipsis: true,
        },
        {
            title: 'Lịch sử GD',
            dataIndex: 'transactionHistory',
            key: 'transactionHistory',
            width: '10%',
            ellipsis: true,
            className: cx('transaction-history'),
            render: (_, record) => {
                return (
                    <div className={cxGlobal('action-table')}>
                        <Tippy content={'Chỉnh sửa'} placement="bottom-end">
                            <button
                                className={cxGlobal('action-table-icon')}
                                onClick={() => {
                                    setSupplierId(record.supplierId);
                                    setSupplierName(record.name);
                                    setSupplierPhone(record.phone);
                                    setSupplierAddress(record.address);
                                    setSupplierEmail(record.email);
                                    setIsOpenInfo(true);
                                }}
                            >
                                <PencilIcon size={20} />
                            </button>
                        </Tippy>
                        <Tippy content={'Xóa'} placement="bottom-end">
                            <button
                                className={cxGlobal('action-table-icon')}
                                style={{ color: 'red' }}
                                onClick={async () => {
                                    if (window.confirm('Bạn có chắc muốn xóa nhà cung cấp này?')) {
                                        const tokenUser = JSON.parse(localStorage.getItem('tokenUser'));
                                        const employeeId = tokenUser.employeeID
                                        await del(
                                            `/api/supplier/${record.supplierId}`,
                                            tokenUser.accessToken,
                                            employeeId,
                                        );
                                        fetchSuppliers(page);
                                    }
                                }}
                            >
                                <Trash2 size={20} />
                            </button>
                        </Tippy>
                    </div>
                );
            },
        },
    ];
    const fetchSuppliers = async (pageReload = page) => {
        try {
            const res = await get('/api/supplier?page=' + pageReload + '&limit=' + pageSize);
            console.log(res)
            setData(
                res.suppliers.map((item, idx) => ({
                    supplierId: item.supplierId || '',
                    name: item.supplierName || '',
                    phone: item.phoneNumber || '',
                    address: item.address || '',
                    email: item.email || '',
                    key: item.supplierId,
                    transactionHistory: (
                        <Button onClick={() => setIsOpenInfo(true)} small leftIcon={<Eye size={20} />} />
                    ),
                })),
            );
            setTotal(res.total || 0);
        } catch (err) {
            setData([]);
            console.log(err)
            setTotal(0);
        }
    };
    useEffect(() => {
        fetchSuppliers(page);
    }, [page]);

    const handleFilterChange = (field, value) => {
        setFilters((prev) => ({ ...prev, [field]: value }));
    };

    const handleSearch = async () => {
        if (Object.values(filters).some((value) => value)) {
            // Check if there is any filter input
            console.log(filters);
            setPage(1);
            try {
                const params = {
                    ...filters,
                    page: 1,
                    limit: pageSize,
                };
                const res = await get('/api/supplier', { params });
                if (res.suppliers && res.suppliers.length > 0) {
                    setData(
                        res.suppliers.map((item) => ({
                            supplierId: item.supplierId || '',
                            name: item.supplierName || '',
                            phone: item.phoneNumber || '',
                            address: item.address || '',
                            email: item.email || '',
                            key: item.supplierId,
                            transactionHistory: (
                                <Button onClick={() => setIsOpenInfo(true)} small leftIcon={<Eye size={20} />} />
                            ),
                        })),
                    );
                    setTotal(res.total || 0);
                } else {
                    setData([]);
                    setTotal(0);
                }
            } catch (err) {
                setData([]);
                setTotal(0);
            }
        } else {
            fetchSuppliers(1); // Render all data if no filter input
        }
    };

    const handleResetFilters = () => {
        setFilters({
            supplierId: '',
            phoneNumber: '',
            email: '',
        });
        console.log('Reset filters to default:', filters);
        columnsFilter.forEach((item) => {
            item.setValue('');
            console.log('Reset filter:', item);
        });
        fetchSuppliers(1); // Fetch all suppliers
    };

    const onChangePage = (newPage, newPageSize) => {
        setPage(newPage);
    };

    const closeModal = () => {
        setIsOpenInfo(false);
    };

    const columnUpdate = [
        {
            id: 1,
            label: 'Mã NCC',
            value: supplierId,
            setValue: setSupplierId,
        },
        {
            id: 2,
            label: 'Tên nhà cung cấp',
            value: supplierName,
            setValue: setSupplierName,
        },
        {
            id: 3,
            label: 'SDT',
            value: supplierPhone,
            setValue: setSupplierPhone,
        },
        {
            id: 4,
            label: 'Địa chỉ',
            value: supplierAddress,
            setValue: setSupplierAddress,
        },
        {
            id: 5,
            label: 'Email',
            value: supplierEmail,
            setValue: setSupplierEmail,
        },
    ];

    const handleUpdateSupplier = async () => {
        setUpdateError('');
        console.log('supplierId', supplierId);
        const tokenUser = JSON.parse(localStorage.getItem('tokenUser'));
        const employeeId = tokenUser.employeeID;
        try {
            const res = await put(
                '/api/supplier/' + supplierId,
                {
                    supplierId,
                    supplierName,
                    address: supplierAddress,
                    phoneNumber: supplierPhone,
                    email: supplierEmail,
                },
                tokenUser.accessToken,
                employeeId,
            );

            if (res.status === 'ERR') {
                setUpdateError(res.message);
            } else {
                setIsOpenInfo(false);
                fetchSuppliers(page);
            }
        } catch (error) {
            console.error('Error occurred while updating supplier:', error.response.data.messages);
            setUpdateError(error.response.data.messages[0]);
        }
    };

    const columnsFilter = [
        {
            id: 1,
            label: 'Mã nhà cung cấp',
            setValue: (value) => handleFilterChange('supplierId', value),
            value: filters.supplierId,
        },
        {
            id: 2,
            label: 'Số điện thoại',
            setValue: (value) => handleFilterChange('phoneNumber', value),
            value: filters.phoneNumber,
        },
        {
            id: 3,
            label: 'Email',
            setValue: (value) => handleFilterChange('email', value),
            value: filters.email,
        },
    ];

    return (
        <div className={cx('wrapper-report')}>
            <ModelFilter
                handleSubmitFilter={handleSearch}
                handleResetFilters={handleResetFilters}
                columns={columnsFilter}
            >
                <Button primary onClick={openCreateModal}>
                    <span>Thêm nhà cung cấp</span>
                </Button>
            </ModelFilter>
            {/* Modal tạo mới nhà cung cấp */}
            <Modal showButtonClose={false} isOpenInfo={isOpenCreate} onClose={closeCreateModal}>
                <div
                    style={{
                        position: 'relative',
                        padding: 32,
                        minWidth: 420,
                        maxWidth: 480,
                        background: '#fff',
                        borderRadius: 12,
                    }}
                >
                    <button
                        style={{
                            position: 'absolute',
                            top: 16,
                            right: 16,
                            background: 'transparent',
                            border: 'none',
                            fontSize: 22,
                            cursor: 'pointer',
                            color: '#333',
                        }}
                        onClick={closeCreateModal}
                        aria-label="Đóng"
                    >
                        ×
                    </button>
                    <h2 style={{ marginBottom: 24, textAlign: 'center' }}>Thêm nhà cung cấp</h2>
                    <div style={{ marginBottom: 18 }}>
                        <label style={{ fontWeight: 500 }}>Mã NCC</label>
                        <input
                            value={newSupplier.supplierId}
                            disabled
                            style={{
                                width: '100%',
                                padding: '8px',
                                borderRadius: 6,
                                border: '1px solid #ccc',
                                marginTop: 4,
                            }}
                        />
                    </div>
                    <div style={{ marginBottom: 18 }}>
                        <label style={{ fontWeight: 500 }}>Tên nhà cung cấp</label>
                        <input
                            value={newSupplier.supplierName}
                            onChange={(e) => handleChangeNewSupplier('supplierName', e.target.value)}
                            style={{
                                width: '100%',
                                padding: '8px',
                                borderRadius: 6,
                                border: '1px solid #ccc',
                                marginTop: 4,
                            }}
                        />
                    </div>
                    <div style={{ marginBottom: 18 }}>
                        <label style={{ fontWeight: 500 }}>Số điện thoại</label>
                        <input
                            value={newSupplier.phoneNumber}
                            onChange={(e) => handleChangeNewSupplier('phoneNumber', e.target.value)}
                            style={{
                                width: '100%',
                                padding: '8px',
                                borderRadius: 6,
                                border: '1px solid #ccc',
                                marginTop: 4,
                            }}
                        />
                    </div>
                    <div style={{ marginBottom: 18 }}>
                        <label style={{ fontWeight: 500 }}>Địa chỉ</label>
                        <input
                            value={newSupplier.address}
                            onChange={(e) => handleChangeNewSupplier('address', e.target.value)}
                            style={{
                                width: '100%',
                                padding: '8px',
                                borderRadius: 6,
                                border: '1px solid #ccc',
                                marginTop: 4,
                            }}
                        />
                    </div>
                    <div style={{ marginBottom: 18 }}>
                        <label style={{ fontWeight: 500 }}>Email</label>
                        <input
                            value={newSupplier.email}
                            onChange={(e) => handleChangeNewSupplier('email', e.target.value)}
                            style={{
                                width: '100%',
                                padding: '8px',
                                borderRadius: 6,
                                border: '1px solid #ccc',
                                marginTop: 4,
                            }}
                        />
                    </div>
                    {createError && <div style={{ marginBottom: 18, color: 'red', fontSize: 14 }}>{createError}</div>}
                    <div style={{ textAlign: 'right', marginTop: 24 }}>
                        <Button primary onClick={handleCreateSupplier}>
                            Tạo mới
                        </Button>
                    </div>
                </div>
            </Modal>
            {/* <div className={cx('header')}>
                <Popper>
                    <div>
                        <span className={cx('title')}>Tên khách hàng</span>
                        <input type="text" className={cx('input')} placeholder="Nhập tên khách hàng" />
                    </div>
                </Popper>
            </div> */}
            <div className={cx('content')}>
                <MyTable
                    currentPage={page}
                    columns={columns}
                    data={data}
                    pagination
                    pageSize={pageSize}
                    onChangePage={onChangePage}
                    total={total}
                />
            </div>
            <Modal showButtonClose={false} isOpenInfo={isOpenInfo} onClose={closeModal}>
                <div
                    style={{
                        position: 'relative',
                        padding: 32,
                        minWidth: 420,
                        maxWidth: 480,
                        background: '#fff',
                        borderRadius: 12,
                    }}
                >
                    <button
                        style={{
                            position: 'absolute',
                            top: 16,
                            right: 16,
                            background: 'transparent',
                            border: 'none',
                            fontSize: 22,
                            cursor: 'pointer',
                            color: '#333',
                        }}
                        onClick={closeModal}
                        aria-label="Đóng"
                    >
                        ×
                    </button>
                    <h2 style={{ marginBottom: 24, textAlign: 'center' }}>Cập nhật nhà cung cấp</h2>
                    {updateError && (
                        <div style={{ color: 'red', marginBottom: 12, textAlign: 'center' }}>{updateError}</div>
                    )}
                    <div style={{ marginBottom: 18 }}>
                        <label style={{ fontWeight: 500 }}>Mã NCC</label>
                        <input
                            value={supplierId}
                            disabled
                            style={{
                                width: '100%',
                                padding: '8px',
                                borderRadius: 6,
                                border: '1px solid #ccc',
                                marginTop: 4,
                            }}
                        />
                    </div>
                    <div style={{ marginBottom: 18 }}>
                        <label style={{ fontWeight: 500 }}>Tên nhà cung cấp</label>
                        <input
                            value={supplierName}
                            onChange={(e) => setSupplierName(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '8px',
                                borderRadius: 6,
                                border: '1px solid #ccc',
                                marginTop: 4,
                            }}
                        />
                    </div>
                    <div style={{ marginBottom: 18 }}>
                        <label style={{ fontWeight: 500 }}>Số điện thoại</label>
                        <input
                            value={supplierPhone}
                            onChange={(e) => setSupplierPhone(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '8px',
                                borderRadius: 6,
                                border: '1px solid #ccc',
                                marginTop: 4,
                            }}
                        />
                    </div>
                    <div style={{ marginBottom: 18 }}>
                        <label style={{ fontWeight: 500 }}>Địa chỉ</label>
                        <input
                            value={supplierAddress}
                            onChange={(e) => setSupplierAddress(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '8px',
                                borderRadius: 6,
                                border: '1px solid #ccc',
                                marginTop: 4,
                            }}
                        />
                    </div>
                    <div style={{ marginBottom: 18 }}>
                        <label style={{ fontWeight: 500 }}>Email</label>
                        <input
                            value={supplierEmail}
                            onChange={(e) => setSupplierEmail(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '8px',
                                borderRadius: 6,
                                border: '1px solid #ccc',
                                marginTop: 4,
                            }}
                        />
                    </div>
                    <div style={{ textAlign: 'right', marginTop: 24 }}>
                        <Button primary onClick={handleUpdateSupplier}>
                            Cập nhật
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default SupplierPage;
