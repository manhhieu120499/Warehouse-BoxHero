import React, { useEffect, useState } from 'react';
import classNames from 'classnames/bind';
import styles from './ReleaseProductPage.module.scss';
import { MyTable, Button, Modal, Select, ModelFilter, PaginationUI } from '../../components';
import { ClipboardClock, Eye, PlusCircle, FileMinus, Search, RotateCcw, SquareKanban, Plus } from 'lucide-react';
import globalStyle from '@/components/GlobalStyle/GlobalStyle.module.scss';
import Tippy from '@tippyjs/react';
//import { fetchProduct } from '../../services/product.service';
import ProductDTO from '../../dtos/ProductDTO';
import ProposalStatus from '../../components/ProposalStatus';
import CreateExportProductDialog from './CreateExportProductDialog';
import request from '../../utils/httpRequest';
import parseToken from '../../utils/parseToken';
import ModalOrderReleaseDetail from './ModalOrderReleaseDetail';
import { filterOrderRelease } from '../../services/order.service';

const cx = classNames.bind(styles);
const cxGlb = classNames.bind(globalStyle);

const ReleaseProductPage = () => {
    //const [productList, setProductList] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedRow, setSelectedRow] = useState([]);
    const [filterProposalRelease, setFilterProposalRelease] = useState({
        orderReleaseID: '',
        receiverName: '',
        employeeNameRelease: '',
        createdAt: '',
    });
    const [showModalCreateReleaseProposal, setShowModalCreateReleaseProposal] = useState(false);
    const [orderReleaseList, setOrderReleaseList] = useState([]);
    const [showOrderReleaseDetail, setShowOrderReleaseDetail] = useState(false);

    const handleNextPage = () => {
        setCurrentPage((prev) => prev + 1);
    };

    const handlePrevPage = () => {
        if (currentPage == 1) return;
        setCurrentPage((prev) => (prev == 1 ? 1 : prev - 1));
    };

    const columnsFilter = [
        {
            id: 1,
            label: 'Mã phiếu',
            dataIndex: 'orderReleaseID',
            key: 'orderReleaseID',
            setValue: (value) => setFilterProposalRelease({ ...filterProposalRelease, orderReleaseID: value }),
            value: filterProposalRelease.orderReleaseID,
        },
        {
            id: 2,
            label: 'Ngày tạo',
            type: 'date',
            dataIndex: 'createdAt',
            key: 'createdAt',
            setValue: (value) => setFilterProposalRelease({ ...filterProposalRelease, createdAt: value }),
            value: filterProposalRelease.createdAt,
        },
        {
            id: 3,
            label: 'Tên người tạo',
            dataIndex: 'employeeName',
            key: 'employeeName',
            setValue: (value) => setFilterProposalRelease({ ...filterProposalRelease, employeeNameRelease: value }),
            value: filterProposalRelease.employeeNameRelease,
            render: (_, record) => <span>{record.employee.employeeName}</span>,
        },
        {
            id: 4,
            label: 'Tên người nhận',
            dataIndex: 'customerName',
            key: 'customerName',
            setValue: (value) => setFilterProposalRelease({ ...filterProposalRelease, receiverName: value }),
            value: filterProposalRelease.receiverName,
            render: (_, record) => <span>{record.customer.customerName}</span>,
        },
    ];

    const tableColumnsExportProduct = [
        {
            title: 'Mã phiếu xuất',
            dataIndex: 'orderReleaseID',
            key: 'orderReleaseID',
        },
        {
            title: 'Ngày lập',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (text) => <span>{text.split('T')[0]}</span>,
            width: '15%',
        },
        {
            title: 'Người tạo',
            dataIndex: 'employeeName',
            key: 'employeeName',
            render: (_, record) => <span>{record.employees.employeeName}</span>,
        },
        {
            title: 'Người nhận',
            dataIndex: 'customerName',
            key: 'customerName',
            render: (_, record) => <span>{record.customers.customerName}</span>,
            width: '25%',
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: (index, record) => <span>Đã xuất kho</span>,
            width: '20%',
        },
        {
            title: 'Thao tác',
            dataIndex: 'action',
            key: 'action',
            render: (text, record) => {
                return (
                    <div
                        className={cxGlb('action-table')}
                        onClick={() => {
                            setSelectedRow(record);
                            setShowOrderReleaseDetail(true);
                        }}
                    >
                        <Button primary medium>
                            <span>Xem chi tiết</span>
                        </Button>
                    </div>
                );
            },
        },
    ];

    const handleSubmitFilter = async () => {
        if (Object.keys(filterProposalRelease).every((key) => filterProposalRelease[key] == '')) return;
        try {
            let params = {};
            if (filterProposalRelease.orderReleaseID) params.orderReleaseID = filterProposalRelease.orderReleaseID;
            if (filterProposalRelease.createdAt) params.createdAt = filterProposalRelease.createdAt;
            if (filterProposalRelease.employeeNameRelease)
                params.employeeName = filterProposalRelease.employeeNameRelease;
            if (filterProposalRelease.receiverName) params.customerName = filterProposalRelease.receiverName;

            const res = await filterOrderRelease(params);
            setOrderReleaseList(res);
        } catch (err) {
            console.log(err);
        }
    };

    const handleResetFilter = () => {
        // tránh spam request
        if (Object.keys(filterProposalRelease).every((key) => filterProposalRelease[key] == '')) return;
        setFilterProposalRelease({
            orderReleaseID: '',
            createdAt: '',
            employeeNameRelease: '',
            receiverName: '',
        });
        setCurrentPage(1);
        fetchOrderRelease(currentPage);
    };

    // useEffect(() => {
    //     const fetchData = async (page = 1) => {
    //         try {
    //             const products = await fetchProduct(page);
    //             const formatProducts =
    //                 products?.map((item) => {
    //                     const product = new ProductDTO(item);
    //                     return { key: product.sku, ...product };
    //                 }) || [];
    //             setProductList(formatProducts);
    //         } catch (err) {
    //             console.log('Failed to fetch product: ', err);
    //         }
    //     };
    //     fetchData();
    // }, []);

    const fetchOrderRelease = async (page = 1) => {
        try {
            const warehouse = parseToken('warehouse');
            const token = parseToken('tokenUser');
            const res = await request.get(
                `/api/order-release/get-all-order-release?warehouseID=${warehouse.warehouseID}&page=${page}`,
                {
                    headers: {
                        token: `Bearer ${token.accessToken}`,
                        employeeID: token.employeeID,
                        warehouseID: warehouse.warehouseID,
                    },
                },
            );
            console.log('res', res);
            setOrderReleaseList(res.data.data || []);
        } catch (err) {
            console.log(err);
        }
    };

    useEffect(() => {
        fetchOrderRelease(currentPage);
    }, [currentPage]);

    return (
        <div className={cx('wrapper-release-product')}>
            <ModelFilter
                columns={columnsFilter}
                handleSubmitFilter={handleSubmitFilter}
                handleResetFilters={handleResetFilter}
            >
                <Button
                    type="button"
                    primary
                    onClick={() => {
                        setShowModalCreateReleaseProposal(true);
                    }}
                    leftIcon={<Plus size={16} />}
                >
                    Tạo phiếu xuất kho
                </Button>
            </ModelFilter>

            {/** danh sách phiếu đề xuất hoặc phiếu thiếu */}
            <div className={cx('view-list-proposal')}>
                <div className={cx('table-header')}>
                    <p className={cx('table-title')}>Danh sách phiếu xuất kho</p>
                </div>

                <MyTable data={orderReleaseList} columns={tableColumnsExportProduct} />
                <div className={cx('pagination-table')}>
                    <PaginationUI
                        currentPage={currentPage}
                        handleNextPage={handleNextPage}
                        handlePrevPage={handlePrevPage}
                    />
                </div>
            </div>

            {/* Modal tạo phiếu xuất */}
            {showModalCreateReleaseProposal && (
                <CreateExportProductDialog
                    isOpen={showModalCreateReleaseProposal}
                    onClose={() => {
                        setShowModalCreateReleaseProposal(false);
                    }}
                    fetchData={fetchOrderRelease}
                />
            )}

            {showOrderReleaseDetail && (
                <ModalOrderReleaseDetail
                    isOpen={showOrderReleaseDetail}
                    onClose={() => setShowOrderReleaseDetail(false)}
                    orderReleaseItem={selectedRow} // phiếu được chọn
                />
            )}
        </div>
    );
};

export default ReleaseProductPage;
