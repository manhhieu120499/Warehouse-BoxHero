import React, { useEffect, useState } from 'react';
import classNames from 'classnames/bind';
import styles from './ProductExportList.module.scss';
import { MyTable } from '../../../../components';
import { Trash2 } from 'lucide-react';
import { fetchAllProductCanExport, fetchProductById } from '../../../../services/product.service';
import { styleMessage } from '../../../../constants';
import toast from 'react-hot-toast';
import InputBase from '../../../../components/InputBase';

const cx = classNames.bind(styles);

const minScrollHeightTable = 300;

const ProductExportList = ({ productListSelected, setProductListResult }) => {
    const [products, setProducts] = useState([]);
    const [selectedRow, setSelectedRow] = useState([]);
    const [searchProductValue, setSearchProductValue] = useState('');
    const rowSelection = {
        type: 'checkbox',
        selectedRowKeys: selectedRow,
        onChange: (newSelectedRowKey) => {
            const selectedProducts = products.filter((product) => newSelectedRowKey.includes(product.key));
            const updateSelectedProducts = new Set([...selectedProducts]);
            setSelectedRow(newSelectedRowKey);
            setProductListResult([...updateSelectedProducts]); // danh sách nháp
        },
    };

    const tableColumns = [
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
            title: 'Đơn vị tính',
            dataIndex: 'uom',
            key: 'uom',
            render: (_, record) => <span>{record.baseUnitProducts.baseUnitName}</span>,
        },
    ];

    const fetchProducts = async () => {
        try {
            const res = await fetchAllProductCanExport();
            const formatProducts = res.map((item) => ({
                key: item.productID,
                ...item,
            }));
            setProducts(formatProducts);
        } catch (err) {
            console.log(err);
        }
    };

    const handleSearchProduct = async (searchValue) => {
        if (!searchValue) return;
        try {
            const checkExist = products.find((item) => item.productID === searchValue.toUpperCase());
            if (checkExist) {
                setProducts([checkExist]);
                return;
            }
            const res = await fetchProductById(searchValue);
            if (!res) {
                toast.error('Không tìm thấy sản phẩm', styleMessage);
                return;
            }
            setProducts([{ ...res, key: res.productID }]);
        } catch (err) {
            console.error('Error searching products:', err);
        }
    };

    const prefetchProductsData = async () => {
        try {
            const selectedProductIDs = productListSelected.map((item) => item.productID);
            const res = await fetchAllProductCanExport();
            const formatProducts = res.map((item) => ({
                key: item.productID,
                ...item,
            }));
            setProducts(formatProducts);
            setSelectedRow(selectedProductIDs);
        } catch (err) {
            console.log(err);
        }
    };

    useEffect(() => {
        const selectedProductIDs = productListSelected.map((item) => item.productID);
        setSelectedRow(selectedProductIDs);
    }, [productListSelected]);

    useEffect(() => {
        fetchProducts();
    }, []);

    return (
        <section className={cx('wrapper-list-product')}>
            <h3 className={cx('title-list-product')}>Chọn sản phẩm xuất kho</h3>
            <div className={cx('table-search-product')}>
                <InputBase
                    placeholder="Tìm kiếm sản phẩm..."
                    onChange={(e) => {
                        if (!e.target.value) prefetchProductsData();
                        setSearchProductValue(e.target.value);
                    }}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearchProduct(searchProductValue)}
                    value={searchProductValue || ''}
                />
            </div>
            <div className={cx('content-table')}>
                <MyTable
                    data={products}
                    columns={tableColumns}
                    rowSelection={rowSelection}
                    scroll={{ y: minScrollHeightTable }}
                />
            </div>
        </section>
    );
};

export default ProductExportList;
