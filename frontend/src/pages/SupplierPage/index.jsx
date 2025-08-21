import React, { useState, useEffect } from 'react';
import classNames from 'classnames/bind';
import { MyTable, Button, Popper, Modal, ModalOrder } from '@/components';
import { CakeSlice, Eye, PencilIcon } from 'lucide-react';
import { Trash2 } from 'lucide-react';
import styles from './SupplierPage.module.scss';
import globalStyle from '../../components/GlobalStyle/GlobalStyle.module.scss';
import Tippy from '@tippyjs/react';
import ModalUpdate from '../../components/ModalUpdate';
import { ModelFilter } from '../../components';
import { get, post } from '@/utils/httpRequest';
import { del } from '@/utils/httpRequest';
import axios from 'axios';
import request, { put } from '../../utils/httpRequest';
import { set } from 'react-hook-form';
import toast from 'react-hot-toast';
import { styleMessage, formatStatusProduct } from '../../constants';
import { message } from 'antd';
import PopupMessage from '../../components/PopupMessage';
import parseToken from '../../utils/parseToken';
const cxGlobal = classNames.bind(globalStyle);
import { useNavigate } from 'react-router-dom';
import ProductDetailDTO from '../../dtos/ProductDetailDTO';
import { useDispatch, useSelector } from 'react-redux';
import BatchDTO from '../../dtos/BatchDTO';
import { removeItemDrop } from '../../lib/redux/dropSidebar/dropSidebarSlice';

const cx = classNames.bind(styles);

const SupplierPage = () => {
    const currentUser = useSelector((state) => state.AuthSlice.user);
    const [page, setPage] = useState(1);
    const [data, setData] = useState([]);
    const [total, setTotal] = useState(0);
    const pageSize = 9;
    const [supplierId, setSupplierId] = useState(null);
    const [supplierName, setSupplierName] = useState('');
    const [supplierPhone, setSupplierPhone] = useState('');
    const [supplierAddress, setSupplierAddress] = useState('');
    const [supplierEmail, setSupplierEmail] = useState('');
    const [supplierStatus, setSupplierStatus] = useState('Đang hoạt động');
    //const [updateError, setUpdateError] = useState('');
    const [isOpenInfo, setIsOpenInfo] = useState(false);
    const [isOpenCreate, setIsOpenCreate] = useState(false);
    const [showPopupConfirm, setShowPopupConfirm] = useState(false);
    const navigate = useNavigate();
    const [filters, setFilters] = useState({
        supplierId: '',
        phoneNumber: '',
        email: '',
    });
    const dispatch = useDispatch()

    // product state
    const productPageSize = 10;
    const [productPage, setProductPage] = useState(1);
    const [showProductTable, setShowProductTable] = useState(false);
    const [productData, setProductData] = useState([]);

    const onChangeProductTable = (newPage, pageSize) => {
        setProductPage(newPage);
    };

    // fetch product by supplier id
    const openProductTableBySupplier = async (supplierId) => {
        try {
            const tokenUser = parseToken('tokenUser');
            // call api
            const response = await request.get(`/api/supplier/provided-products/${supplierId}`, {
                headers: {
                    token: `Beare ${tokenUser.accessToken}`,
                    employeeid: tokenUser.employeeID,
                },
            });
         
            const formatProductsData = response.data.products.map((item) => {
                return {
                    key: item.productID,
                    productID: item.productID,
                    productName: item.productName,
                    productDes: item.description,
                    statusProduct: formatStatusProduct[item.status],
                    categoryID: item.categoryID,
                    price: new Intl.NumberFormat('vi-VN').format(Number(item.price)),
                };
            });

            setProductData(formatProductsData);
            setShowProductTable(true);
        } catch (err) {
            console.log(err);
            setShowProductTable(false);
        }
    };
    // ------------------------------------

    // Hàm tạo mã NCC ngẫu nhiên
    // const generateSupplierId = () => {
    //     const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    //     let result = '';
    //     for (let i = 0; i < 5; i++) {
    //         result += chars.charAt(Math.floor(Math.random() * chars.length));
    //     }
    //     return 'NCC' + result;
    // };
    // Xử lý mở modal tạo mới
    const openCreateModal = () => {
        setIsOpenCreate(true);
    };

    // Xử lý đóng modal tạo mới
    const closeCreateModal = () => {
        setIsOpenCreate(false);
    };

    // Xử lý submit tạo mới
    const handleCreateSupplier = async (data) => {
        try {
            const tokenUser = JSON.parse(localStorage.getItem('tokenUser'));
            //const employeeId = JSON.parse(localStorage.getItem('employeeID'));
            const res = await post(
                '/api/supplier',
                {
                    supplierID: data.supplierId,
                    supplierName: data.supplierName,
                    address: data.supplierAddress,
                    phoneNumber: data.supplierPhone,
                    email: data.supplierEmail,
                    status: 'ACTIVE',
                },
                tokenUser.accessToken,
                tokenUser.employeeID,
            );
            console.log('123' + res);
            if (res.status === 'ERR') {
                toast.error(res.message, styleMessage);
                console.log('123');
            } else {
                toast.success('Thêm nhà cung cấp thành công', styleMessage);
                fetchSuppliers(page);
                setIsOpenCreate(false);
            }
        } catch (error) {
            console.error('Error occurred while creating supplier:', error.response.data.messages);
            toast.error(error.response.data.messages[0], styleMessage);
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
            title: 'Trạng thái',
            dataIndex: 'statusWork',
            key: 'statusWork',
            width: '12%',
            ellipsis: true,
        },
        {
            title: 'Thao tác',
            dataIndex: 'transactionHistory',
            key: 'transactionHistory',
            width: '10%',
            ellipsis: true,
            className: cx('transaction-history'),
            render: (_, record) => {
                return (
                    <div className={cxGlobal('action-table')}>
                        <Tippy content={'Xem danh sách sản phẩm'} placement="bottom-end">
                            <button
                                className={cxGlobal('action-table-icon')}
                                onClick={() => {
                                    setSupplierId(record.supplierId);
                                    openProductTableBySupplier(record.supplierId);
                                }}
                            >
                                <CakeSlice size={20} />
                            </button>
                        </Tippy>
                        <Tippy content={'Chỉnh sửa'} placement="bottom-end">
                            <button
                                className={cxGlobal('action-table-icon')}
                                onClick={() => {
                                    setSupplierId(record.supplierId);
                                    setSupplierName(record.name);
                                    setSupplierPhone(record.phone);
                                    setSupplierAddress(record.address);
                                    setSupplierEmail(record.email);
                                    setSupplierStatus(record.statusWork);
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
                                onClick={() => {
                                    setSupplierId(record.supplierId);
                                    setShowPopupConfirm(true);
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

    const handelDeleteSupplier = async () => {
        try {
            const tokenUser = JSON.parse(localStorage.getItem('tokenUser'));
            const employeeId = tokenUser.employeeID;
            await del(`/api/supplier/${supplierId}`, tokenUser.accessToken, employeeId);
            toast.success('Xoá nhà cung cấp thành công', styleMessage);
            fetchSuppliers(page);
            setShowPopupConfirm(false);
        } catch (err) {
            toast.error(err.response.data.message, styleMessage);
            setSupplierId('');
            setShowPopupConfirm(false);
        }
    };
    const fetchSuppliers = async (pageReload = page) => {
        try {
            const res = await get('/api/supplier?page=' + pageReload + '&limit=' + pageSize);
            setData(
                res.suppliers.map((item, idx) => ({
                    supplierId: item.supplierID || '',
                    name: item.supplierName || '',
                    phone: item.phoneNumber || '',
                    address: item.address || '',
                    email: item.email || '',
                    key: item.supplierId,
                    statusWork: item.status == 'ACTIVE' ? 'Đang hoạt động' : 'Ngừng hoạt động',
                    transactionHistory: (
                        <Button onClick={() => setIsOpenInfo(true)} small leftIcon={<Eye size={20} />} />
                    ),
                })),
            );
            setTotal(res.total || 0);
        } catch (err) {
            setData([]);
            console.log(err);
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
                const { supplierId, ...rest } = filters;
                const params = {
                    ...rest,
                    supplierID: supplierId,
                    page: 1,
                    limit: pageSize,
                };
                const res = await get('/api/supplier', { params });
                if (res.suppliers && res.suppliers.length > 0) {
                    setData(
                        res.suppliers.map((item) => ({
                            supplierId: item.supplierID || '',
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
            name: 'supplierId',
            pattern: null,
            message: '',
            readOnly: true,
        },
        {
            id: 2,
            label: 'Tên nhà cung cấp',
            name: 'supplierName',
            pattern: null,
            message: '',
            readOnly: false,
        },
        {
            id: 3,
            label: 'SDT',
            name: 'supplierPhone',
            pattern: /^(03|07|08|09)\d{8}/,
            message: 'Số điện thoại phải bắt đầu bằng 03 hoặc 07 hoặc 08 hoặc 09 và có độ dài tối đa 10 chữ số',
            readOnly: false,
        },
        {
            id: 4,
            label: 'Địa chỉ',
            name: 'supplierAddress',
            pattern: null,
            message: '',
            readOnly: false,
        },
        {
            id: 5,
            label: 'Email',
            name: 'supplierEmail',
            pattern: /^\w+@\w+(.com|.vn)$/,
            message: 'Email không hợp lệ',
            readOnly: false,
        },
        {
            id: 6,
            label: 'Trạng thái',
            name: 'supplierStatus',
            pattern: null,
            message: '',
            option: [
                {
                    name: 'Đang hoạt động',
                    value: 'ACTIVE',
                },
                {
                    name: 'Ngừng hoạt động',
                    value: 'INACTIVE',
                },
            ],
        },
    ];

    const columnCreate = [
        {
            id: 1,
            label: 'Mã NCC',
            name: 'supplierId',
            pattern: null,
            message: '',
            readOnly: false,
        },
        {
            id: 2,
            label: 'Tên nhà cung cấp',
            name: 'supplierName',
            pattern: null,
            message: '',
            readOnly: false,
        },
        {
            id: 3,
            label: 'SDT',
            name: 'supplierPhone',
            pattern: /^(03|07|08|09)\d{8}/,
            message: 'Số điện thoại phải bắt đầu bằng 03 hoặc 07 hoặc 08 hoặc 09 và có độ dài tối đa 10 chữ số',
            readOnly: false,
        },
        {
            id: 4,
            label: 'Địa chỉ',
            name: 'supplierAddress',
            pattern: null,
            message: '',
            readOnly: false,
        },
        {
            id: 5,
            label: 'Email',
            name: 'supplierEmail',
            pattern: /^\w+@\w+(.com|.vn)$/,
            message: 'Email không hợp lệ',
            readOnly: false,
        },
    ];

    const handleUpdateSupplier = async (data) => {
        console.log(data);
        //setUpdateError('');
        const { supplierId, supplierName, supplierAddress, supplierEmail, supplierStatus } = data;
        console.log('supplierId', supplierId);
        const tokenUser = JSON.parse(localStorage.getItem('tokenUser'));
        const employeeId = tokenUser.employeeID;
        try {
            const res = await put(
                '/api/supplier/' + supplierId,
                {
                    supplierID: supplierId,
                    supplierName,
                    address: supplierAddress,
                    phoneNumber: supplierPhone,
                    email: supplierEmail,
                    status: supplierStatus,
                },
                tokenUser.accessToken,
                employeeId,
            );

            if (res.status === 'ERR') {
                toast.error(res.message, styleMessage);
            } else {
                toast.success('Cập nhật nhà cung cấp thành công', styleMessage);
                setIsOpenInfo(false);
                fetchSuppliers(page);
            }
        } catch (error) {
            console.error('Error occurred while updating supplier:', error.response.data.messages);
            toast.error(error.response.data.messages[0], styleMessage);
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

    // columns product table
    const columnsProduct = [
        {
            title: 'Mã nhóm sản phẩm',
            dataIndex: 'categoryID',
            key: 'categoryID',
        },
        {
            title: 'Mã sản phẩm',
            dataIndex: 'productID',
            key: 'productID',
        },
        {
            title: 'Tên sản phẩm',
            dataIndex: 'productName',
            key: 'productName',
        },
        {
            title: 'Mô tả',
            dataIndex: 'productDes',
            key: 'productDes',
        },
        {
            title: 'Trạng thái',
            dataIndex: 'statusProduct',
            key: 'statusProduct',
        },
        {
            title: 'Chi tiết',
            dataIndex: 'transactionHistory',
            key: 'transactionHistory',
            render: (_, record) => {
                return (
                    <div className={cxGlobal('action-table')}>
                        <Tippy content={'Xem chi tiết sản phẩm'} placement="bottom-end">
                            <button
                                className={cxGlobal('action-table-icon')}
                                onClick={async () => {
                                    try {
                                        const tokenUser = parseToken('tokenUser');
                                        //useDispatch(startLoading());
                                        // call api lấy thông tin product
                                        const res = await request.get(`/api/product?productID=${record.productID}`, {
                                            headers: {
                                                token: `Beare ${tokenUser.accessToken}`,
                                                employeeid: tokenUser.employeeID,
                                                warehouseid: currentUser.warehouseId ? currentUser.warehouseId : null,
                                            },
                                        });
                                        console.log(res.data);
                                        const { batches, ...rest } = res.data.product;
                                        const formatBatch = batches.map((item) => {
                                            const batch = new BatchDTO(item);
                                            return { ...batch };
                                        });
                                        const productDetail = new ProductDetailDTO({ ...rest, listBatch: formatBatch });
                                        //navigate(`/products?productID=${record.productID}`);
                                        navigate('/products', { state: productDetail });
                                        dispatch(removeItemDrop(2))
                                    } catch (err) {
                                        console.log(err);
                                    }
                                }}
                            >
                                <Eye size={20} />
                            </button>
                        </Tippy>
                    </div>
                );
            },
        },
    ];

    const dataProduct = [
        {
            key: 1,
            productID: 'SP01',
            productName: 'Sữa Vina Milk',
            productDes: 'Sản phẩm tuyệt trùng phù hợp cho mọi lứa tuổi',
            statusProduct: 'Đang kinh doanh',
        },
    ];

    return (
        <div className={cx('wrapper-report')}>
            {showPopupConfirm && (
                <PopupMessage>
                    <div className={cx('wrapper-message')}>
                        <h1>Thông báo</h1>
                        <p className={cx('des')}>Bạn có chắc muốn xoá nhà cung cấp này không?</p>
                        <div className={cx('action-confirm')}>
                            <Button primary onClick={handelDeleteSupplier}>
                                <span>Có</span>
                            </Button>
                            <Button outline onClick={() => setShowPopupConfirm(false)}>
                                <span>Không</span>
                            </Button>
                        </div>
                    </div>
                </PopupMessage>
            )}
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
                <ModalUpdate
                    columns={columnCreate}
                    label={'Thêm mới nhà cung cấp'}
                    onClose={closeCreateModal}
                    onSubmit={handleCreateSupplier}
                />
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
                <ModalUpdate
                    columns={columnUpdate}
                    label={'Cập nhật nhà cung cấp'}
                    onClose={closeModal}
                    onSubmit={handleUpdateSupplier}
                    defaultValue={{
                        supplierId,
                        supplierEmail,
                        supplierAddress,
                        supplierPhone,
                        supplierName,
                        supplierStatus: supplierStatus == 'Đang hoạt động' ? 'ACTIVE' : 'INACTIVE',
                    }}
                    type={'update'}
                />
            </Modal>

            {/** danh sách sản phẩm của nhà cung cấp */}
            <Modal isOpenInfo={showProductTable} onClose={() => setShowProductTable(false)}>
                <div className={cx('wrapper-product-supplier')}>
                    <h1>Danh sách sản phẩm thuộc về nhà cung cấp</h1>
                    <MyTable
                        className={cx('product-supplier-table')}
                        columns={columnsProduct}
                        data={productData}
                        pageSize={productPageSize}
                        onChangePage={onChangeProductTable}
                        pagination
                        currentPage={productPage}
                    />
                </div>
            </Modal>
        </div>
    );
};

export default SupplierPage;
