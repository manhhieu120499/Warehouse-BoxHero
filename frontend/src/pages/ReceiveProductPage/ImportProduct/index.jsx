/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import classNames from 'classnames/bind';
import styles from './ImportProduct.module.scss';
import { formatStatusOrderPurchase, formatTypeOrderPurchase } from '../../../constants';
import { Button, ModelFilter, MyTable, PaginationUI } from '../../../components';
import globalStyle from '@/components/GlobalStyle/GlobalStyle.module.scss';
import { Circle, Download, Plus } from 'lucide-react';
import ModelProposalDetail from '../../ApprovePage/ModelProposalDetail';
import { fetchOrderPurchase, filterOrderPurchase } from '../../../services/order.service';
import OrderPurchaseDetail from '../OrderPurchaseDetail';
import ModelCreateOrderPurchase from '../ModelCreateOrderPurchase';

const cxGlobal = classNames.bind(globalStyle);
const cx = classNames.bind(styles);

const ImportProduct = () => {
    const [orderPurchaseList, setOrderPurchaseList] = useState([]);
    const [typeFilter, setTypeFilter] = useState('ALL');
    const [orderPurchaseDetail, setOrderPurchaseDetail] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [showCreateOrderPurchase, setShowCreateOrderPurchase] = useState(false);

    const [filter, setFilter] = useState({
        code: '',
        createdAt: '',
        employeeName: '',
        type: 'ALL',
        originalOrderPurchaseID: '',
        proposalID: '',
    });

    const handleNextPage = () => {
        setCurrentPage((prev) => prev + 1);
    };

    const handlePrevPage = () => {
        if (currentPage == 1) return;
        setCurrentPage((prev) => (prev == 1 ? 1 : prev - 1));
    };

    const columnsDefineSuggestProposal = [
        {
            title: 'Mã phiếu nhập',
            dataIndex: 'orderPurchaseID',
            key: 'orderPurchaseID',
        },
        {
            title: 'Ngày tạo',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (_, record) => <p>{record?.createdAt?.slice(0, 10)}</p>,
        },
        {
            title: 'Nhân viên lập phiếu',
            dataIndex: 'employeeIDCreate',
            key: 'employeeIDCreate',
            render: (_, record) => {
                return <p>{record?.employee?.employeeName}</p>;
            },
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: (index, record) => {
                return (
                    <div className={cx('status-proposal')}>
                        <p>{formatStatusOrderPurchase[record.status]}</p>
                    </div>
                );
            },
        },
        {
            title: 'Loại phiếu',
            dataIndex: 'type',
            key: 'type',
            render: (index, record) => {
                return <p>{formatTypeOrderPurchase[record.type]}</p>;
            },
        },
        {
            title: 'Hành động',
            dataIndex: 'action',
            key: 'action',
            render: (text, record) => {
                return (
                    <div className={cxGlobal('action-table')}>
                        <Button
                            primary
                            medium
                            onClick={() => {
                                setOrderPurchaseDetail(record);
                            }}
                        >
                            <span>Xem chi tiết</span>
                        </Button>
                    </div>
                );
            },
        },
    ];

    const fetchData = async () => {
        const res = await fetchOrderPurchase(currentPage);

        if (res.data?.status === 'OK') {
            setOrderPurchaseList(res.data.data || []);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const columnsFilter = [
        {
            id: 1,
            label: 'Mã phiếu nhập',
            dataIndex: 'orderPurchaseID',
            key: 'orderPurchaseID',
            setValue: (value) => setFilter({ ...filter, code: value }),
            value: filter.code,
        },
        {
            id: 2,
            label: 'Ngày tạo',
            dataIndex: 'createdAt',
            key: 'createdAt',
            type: 'date',
            setValue: (value) => setFilter({ ...filter, createdAt: value }),
            value: filter.createdAt,
        },
        {
            id: 3,
            label: 'Tên nhân viên lập phiếu',
            dataIndex: 'employeeName',
            key: 'employeeName',
            setValue: (value) => setFilter({ ...filter, employeeName: value }),
            value: filter.employeeName,
        },
    ];

    const columnsFilterMissing = [
        {
            id: 4,
            label: 'Mã phiếu nhập gốc',
            dataIndex: 'originalOrderPurchaseID',
            key: 'originalOrderPurchaseID',
            setValue: (value) => setFilter({ ...filter, originalOrderPurchaseID: value }),
            value: filter.originalOrderPurchaseID,
        },
    ];

    const columnsFilterProposal = [
        {
            id: 4,
            label: 'Mã phiếu đề xuất',
            dataIndex: 'proposalID',
            key: 'proposalID',
            setValue: (value) => setFilter({ ...filter, proposalID: value }),
            value: filter.proposalID,
        },
    ];

    const handleChangeTypeFilter = (value) => {
        setTypeFilter(value);
        setFilter({ ...filter, type: value });
    };

    const selectInput = [
        {
            label: 'Loại phiếu',
            value: filter.type,
            option: [
                {
                    name: 'Tất cả',
                    value: 'ALL',
                },
                {
                    name: 'Phiếu nhập mới',
                    value: 'NORMAL',
                },
                {
                    name: 'Phiếu bổ sung',
                    value: 'SUPPLEMENT',
                },
            ],
            setValue: (value) => handleChangeTypeFilter(value),
        },
    ];

    const handleSubmitFilter = async () => {
        if (Object.keys(filter).every((key) => filter[key] == '')) return;
        const filterParams = { ...filter };
        if (filter.type === 'ALL') {
            delete filterParams.type;
        } else if (filter.type === 'NORMAL') {
            delete filterParams.originalOrderPurchaseID;
        } else if (filter.type === 'SUPPLEMENT') {
            delete filterParams.proposalID;
        }
        const res = await filterOrderPurchase({ ...filterParams, page: currentPage });
        if (res.data?.status === 'OK') {
            console.log(res.data);

            setOrderPurchaseList(res.data.data || []);
        }
    };

    const handleResetFilter = () => {
        setFilter({
            code: '',
            createdAt: '',
            employeeName: '',
            type: 'ALL',
            originalOrderPurchaseID: '',
            proposalID: '',
        });
        fetchData();
        setTypeFilter('ALL');
    };

    return (
        <div className={cx('wrapper-import-product')}>
            <ModelFilter
                className={cx('header-filter')}
                columns={
                    typeFilter == 'ALL'
                        ? columnsFilter
                        : typeFilter === 'SUPPLEMENT'
                        ? [...columnsFilter, ...columnsFilterMissing]
                        : [...columnsFilter, ...columnsFilterProposal]
                }
                selectInput={selectInput}
                handleSubmitFilter={handleSubmitFilter}
                handleResetFilters={handleResetFilter}
            >
                <Button
                    primary
                    onClick={() => {
                        setShowCreateOrderPurchase(true);
                    }}
                    leftIcon={<Plus size={16} />}
                >
                    <span>Tạo phiếu nhập</span>
                </Button>
            </ModelFilter>

            <div className={cx('view-list-proposal')}>
                <div className={cx('table-header')}>
                    '<p className={cx('table-title')}>Danh sách phiếu nhập</p>
                </div>

                <MyTable data={orderPurchaseList} columns={columnsDefineSuggestProposal} />
                <div className={cx('pagination-table')}>
                    <PaginationUI
                        currentPage={currentPage}
                        handleNextPage={handleNextPage}
                        handlePrevPage={handlePrevPage}
                    />
                </div>
            </div>
            {orderPurchaseDetail && (
                <OrderPurchaseDetail
                    orderPurchaseDetail={orderPurchaseDetail}
                    isOpen={orderPurchaseDetail != null}
                    onClose={() => setOrderPurchaseDetail(null)}
                />
            )}
            {showCreateOrderPurchase && (
                <ModelCreateOrderPurchase
                    isOpen={showCreateOrderPurchase}
                    onClose={() => setShowCreateOrderPurchase(false)}
                    fetchData={fetchData}
                />
            )}
        </div>
    );
};

export default ImportProduct;
