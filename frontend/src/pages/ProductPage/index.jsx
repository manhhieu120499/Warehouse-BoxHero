/* eslint-disable no-unused-vars */
import React, { use, useCallback, useEffect, useState } from 'react';
import classNames from 'classnames/bind';
import styles from './ProductPage.module.scss';
import MyTable from '../../components/MyTable';
import Tippy from '@tippyjs/react';
import { Eye, PencilIcon } from 'lucide-react';
import { ProductDetail, ProductEdit, ModelFilter, Button } from '@/components';
import { useDispatch, useSelector } from 'react-redux';
import { startLoading, stopLoading } from '../../lib/redux/loading/slice';
import toast from 'react-hot-toast';
import request from '../../utils/httpRequest';
import parseToken from '../../utils/parseToken';
import ProductDTO from '../../dtos/ProductDTO';
import BatchDTO from '../../dtos/BatchDTO';
import ProductDetailDTO from '../../dtos/ProductDetailDTO';
import { useLocation } from 'react-router-dom';

const cx = classNames.bind(styles);

// const dataSource = [
//     { sku: 'SP001', productName: 'Gạo thơm', minStock: 20 },
//     { sku: 'SP002', productName: 'Nước mắm Nam Ngư', minStock: 15 },
//     { sku: 'SP003', productName: 'Đường trắng', minStock: 25 },
//     { sku: 'SP004', productName: 'Muối i-ốt', minStock: 30 },
//     { sku: 'SP005', productName: 'Bột ngọt Ajinomoto', minStock: 12 },
//     { sku: 'SP006', productName: 'Dầu ăn Tường An', minStock: 18 },
//     { sku: 'SP007', productName: 'Sữa ông thọ', minStock: 10 },
//     { sku: 'SP008', productName: 'Mì gói Hảo Hảo', minStock: 50 },
//     { sku: 'SP009', productName: 'Nước suối Lavie', minStock: 40 },
//     { sku: 'SP010', productName: 'Bánh tráng', minStock: 22 },
//     { sku: 'SP011', productName: 'Cà phê G7', minStock: 16 },
//     { sku: 'SP012', productName: 'Trà xanh', minStock: 14 },
//     { sku: 'SP013', productName: 'Nước ngọt Coca', minStock: 35 },
//     { sku: 'SP014', productName: 'Khăn giấy', minStock: 28 },
//     { sku: 'SP015', productName: 'Bột giặt OMO', minStock: 13 },
// ];

// mockdata
const api = () => {
    return new Promise((resolve, reject) => {
        const isResult = true;
        if (isResult) {
            setTimeout(() => {
                resolve({
                    skug: 'SPG001',
                    sku: 'SP001',
                    productName: 'Gạo thơm',
                    image: 'https://marketplace.canva.com/EAFALM0AfOs/1/0/900w/canva-m%C3%A0u-n%C3%A2u-be-h%C3%ACnh-n%E1%BB%81n-%C4%91i%E1%BB%87n-tho%E1%BA%A1i-d%E1%BB%85-th%C6%B0%C6%A1ng-y%C3%AAu-%C4%91%E1%BB%9Di-iSucd-62myg.jpg',
                    des: 'Haha',
                    price: 10,
                    minStock: 20,
                    supplierId: 'NCC20',
                    listBatch: [
                        {
                            sbu: 'SPG001',
                            macDate: '12-03-2025',
                            expiredDate: '12-3-2026',
                            receive: 20,
                            available: 15,
                            location: 'Khu A',
                            wareId: 'WH123',
                            unit: 'Thùng 12',
                        },
                    ],
                });
            }, 2000);
        } else {
            reject(null);
        }
    });
};

const ProductPage = () => {
    const currentUser = useSelector((state) => state.AuthSlice.user);
    const [currentPage, setCurrentPage] = useState(1);
    const [action, setAction] = useState({
        productId: '',
        actionName: '',
    });
    const [productData, setProductData] = useState(null);
    const [productList, setProductList] = useState([]);
    const [filterProduct, setFilterProduct] = useState({
        productID: '',
        productName: '',
        categoryID: '',
        minStock: '',
    });
    const query = new URLSearchParams(location.search);
    const productID = query.get('productID');
    const dispatch = useDispatch();

    const handleOnChange = useCallback((page, pageSize) => {
        setCurrentPage(page);
    }, []);

    useEffect(() => {
        if (productID) {
            handleShowProductDetail(productID);
        }
    }, [productID]);

    const handleShowProductDetail = async (productId) => {
        try {
            const tokenUser = parseToken('tokenUser');
            dispatch(startLoading());
            // call api lấy thông tin product
            const res = await request.get(`/api/product?productID=${productId}`, {
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
            setProductData(productDetail);
        } catch (err) {
            console.log(err);
        } finally {
            setAction({
                productId,
                actionName: 'view',
            });
            dispatch(stopLoading());
        }
    };

    const handleShowEditProduct = async (productId) => {
        try {
            dispatch(startLoading());
            // call api lấy thông tin product
            const res = await api();
            setProductData(res);
        } catch (err) {
            throw new Error(err);
        } finally {
            setAction({
                productId,
                actionName: 'edit',
            });
            dispatch(stopLoading());
        }
    };

    const columnsModelFilter = [
        {
            id: 1,
            label: 'Mã sản phẩm',
            value: filterProduct.productID,
            setValue: (value) => setFilterProduct((prev) => ({ ...prev, productID: value })),
        },
        {
            id: 2,
            label: 'Tên sản phẩm',
            value: filterProduct.productName,
            setValue: (value) => setFilterProduct((prev) => ({ ...prev, productName: value })),
        },
        {
            id: 3,
            label: 'Tồn kho tối thiểu',
            value: filterProduct.minStock,
            setValue: (value) => setFilterProduct((prev) => ({ ...prev, minStock: value })),
        },
    ];
    const tableColumns = [
        {
            title: 'Tên nhóm sản phẩm',
            dataIndex: 'skgu',
            key: 'skgu',
        },
        {
            title: 'Mã sản phẩm',
            dataIndex: 'sku',
            key: 'sku',
        },
        {
            title: 'Tên sản phẩm',
            dataIndex: 'productName',
            key: 'productName',
        },
        {
            title: 'Tồn kho tối thiểu',
            dataIndex: 'minStock',
            key: 'minStock',
            render: (text) => <p className={cx('min-stock-product')}>{text}</p>,
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: (text) => <p className={cx('status-product')}>{text}</p>,
        },
        {
            title: 'Thao tác',
            dataIndex: 'action',
            key: 'action',
            render: (text, record) => {
                return (
                    <div className={cx('action-table')}>
                        <Tippy content={'Xem chi tiết'} placement="bottom-end">
                            <button
                                className={cx('action-table-icon')}
                                onClick={() => handleShowProductDetail(record.sku)}
                            >
                                <Eye size={20} />
                            </button>
                        </Tippy>
                        <Tippy content={'Chỉnh sửa'} placement="bottom-end">
                            <button className={cx('action-table-icon')} onClick={handleShowEditProduct}>
                                <PencilIcon size={20} />
                            </button>
                        </Tippy>
                    </div>
                );
            },
        },
    ];

    const handleOpenModalCreateCategory = () => {
        setShowModalCreateCategory((prev) => !prev);
    };

    const handleCreateCategory = async (category) => {
        try {
            // call api create category
            // fetch again list category
        } catch (err) {
            toast.error(err);
            return;
        }
    };

    const fetchProducts = async () => {
        try {
            const tokenUser = parseToken('tokenUser');
            const result = await request.get('/api/product/list', {
                headers: {
                    token: `Beare ${tokenUser.accessToken}`,
                    employeeid: tokenUser.employeeID,
                },
            });
            const formatProducts = result.data.products.map((item) => {
                const product = new ProductDTO(item);
                return { ...product };
            });
            setProductList(formatProducts);
        } catch (err) {
            console.log('fetch err', err);
        }
    };

    const handleSearch = async () => {
        try {
            const params = {
                ...filterProduct,
            };
            const tokenUser = parseToken('tokenUser');
            const res = await request.get('/api/product/filter', {
                params,
                headers: {
                    token: `Beare ${tokenUser.accessToken}`,
                    employeeid: tokenUser.employeeID,
                    warehouseid: currentUser.warehouseId ? currentUser.warehouseId : null,
                },
            });
            //console.log(res.data)
            setProductList(res.data.products || []);
        } catch (err) {
            console.log(err);
            fetchProducts();
        }
    };

    const handleResetFilterProduct = () => {
        setFilterProduct({
            productID: '',
            productName: '',
            minStock: '',
        });
        fetchProducts();
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    return (
        <div className={cx('wrapper-product')}>
            <ModelFilter
                columns={columnsModelFilter}
                handleSubmitFilter={handleSearch}
                handleResetFilters={handleResetFilterProduct}
            ></ModelFilter>
            <h1>Danh sách sản phẩm</h1>
            <MyTable
                className={cx('my-table')}
                columns={tableColumns}
                data={productList}
                pageSize={15}
                pagination
                onChangePage={handleOnChange}
                currentPage={currentPage}
            />
            {action.productId && action.actionName === 'view' && (
                <ProductDetail
                    data={productData}
                    onClose={() => setAction({ productId: null, actionName: null })}
                    classname={cx('modal-product-detail')}
                />
            )}
            {action.productId && action.actionName === 'edit' && (
                <ProductEdit data={productData} onClose={() => setAction({ productId: null, actionName: null })} />
            )}
        </div>
    );
};

export default ProductPage;
