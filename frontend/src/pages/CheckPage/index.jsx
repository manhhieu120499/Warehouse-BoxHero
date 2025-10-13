/* eslint-disable react-hooks/exhaustive-deps */
import React, { use, useEffect, useState } from 'react';
import classNames from 'classnames/bind';
import styles from './CheckPage.module.scss';
import { Button, ModelFilter, MyTable, PaginationUI } from '@/components';
import CreateCheckDetail from './CreateCheckDetail';
import globalStyle from '@/components/GlobalStyle/GlobalStyle.module.scss';
import ModelProposalDetail from '@/pages/ApprovePage/ModelProposalDetail';
import { getAllInventoryCheck, getFilterInventoryCheck } from '../../services/inventoryCheck.service';
import parseToken from '../../utils/parseToken';
import { formatStatusInventoryCheck, formatStatusOrderPurchaseMissingInventoryCheck } from '../../constants';
import ShowLocationDetail from './ShowLocationDetail';

const cxGlobal = classNames.bind(globalStyle);
const cx = classNames.bind(styles);

const ImportProduct = () => {
    const [showDetailInventoryCheck, setShowDetailInventoryCheck] = useState(false);
    const [showCreateInventoryCheck, setShowCreateInventoryCheck] = useState(false);
    const [listInventoryCheck, setListInventoryCheck] = useState([]);
    const [inventoryCheckDetail, setInventoryCheckDetail] = useState('');
    const [currentPage, setCurrentPage] = useState(1);

    const handleNextPage = () => {
        setCurrentPage(currentPage + 1);
    };

    const handlePrevPage = () => {
        if (currentPage - 1 == 0) return;
        setCurrentPage(currentPage - 1);
    };

    useEffect(() => {
        fetchData(currentPage);
    }, [currentPage]);

    const fetchData = async (currentPage) => {
        console.log('fetch data');

        const warehouseID = parseToken('warehouse').warehouseID;
        const res = await getAllInventoryCheck(warehouseID, currentPage);
        if (res.status == 200) {
            setListInventoryCheck(res.data.data);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        console.log(listInventoryCheck);
    }, [listInventoryCheck]);

    const [filterInventoryCheck, setFilterInventoryCheck] = useState({
        inventoryCheckID: '',
        status: 'ALL',
        checkStatus: 'ALL',
        createdAt: '',
        employeeName: '',
    });

    const columnsDefineSuggestProposal = [
        {
            title: 'Mã phiếu kiểm kê',
            dataIndex: 'inventoryCheckID',
            key: 'inventoryCheckID',
            className: cx('col-inventory-check-id'),
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
                        <div className={cx('status-indicator', record.status)}></div>
                        <p>{formatStatusInventoryCheck[record.status]}</p>
                    </div>
                );
            },
        },
        {
            title: 'Kiểm kê thực tế',
            dataIndex: 'checkStatus',
            key: 'checkStatus',
            render: (index, record) => {
                return (
                    <div className={cx('status-proposal')}>
                        <div className={cx('status-indicator', record.checkStatus)}></div>
                        <p>{formatStatusOrderPurchaseMissingInventoryCheck[record.checkStatus]}</p>
                    </div>
                );
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
                                setInventoryCheckDetail(record);
                                setShowDetailInventoryCheck(true);
                            }}
                        >
                            <span>Xem chi tiết</span>
                        </Button>
                    </div>
                );
            },
        },
    ];

    const columnsFilter = [
        {
            id: 1,
            label: 'Mã phiếu kiểm kê',
            dataIndex: 'inventoryCheckID',
            key: 'inventoryCheckID',
            setValue: (value) => setFilterInventoryCheck({ ...filterInventoryCheck, inventoryCheckID: value }),
            value: filterInventoryCheck.inventoryCheckID,
        },
        {
            id: 2,
            label: 'Ngày tạo',
            dataIndex: 'createdAt',
            key: 'createdAt',
            type: 'date',
            setValue: (value) => setFilterInventoryCheck({ ...filterInventoryCheck, createdAt: value }),
            value: filterInventoryCheck.createdAt,
        },
        {
            id: 3,
            label: 'Tên nhân viên lập phiếu',
            dataIndex: 'employeeName',
            key: 'employeeName',
            setValue: (value) => setFilterInventoryCheck({ ...filterInventoryCheck, employeeName: value }),
            value: filterInventoryCheck.employeeName,
        },
    ];

    const selectInput = [
        {
            label: 'Trạng thái phiếu',
            value: filterInventoryCheck.status,
            option: [
                {
                    name: 'Tất cả',
                    value: 'ALL',
                },
                {
                    name: 'Chờ phê duyệt',
                    value: 'PENDING',
                },
                {
                    name: 'Đã phê duyệt',
                    value: 'COMPLETED',
                },
                {
                    name: 'Từ chối',
                    value: 'REFUSE',
                },
            ],
            setValue: (value) => setFilterInventoryCheck({ ...filterInventoryCheck, status: value }),
        },
        {
            label: 'Kiểm kê thực tế',
            value: filterInventoryCheck.checkStatus,
            option: [
                {
                    name: 'Tất cả',
                    value: 'ALL',
                },
                {
                    name: 'Đủ sản phẩm',
                    value: 'BALANCED',
                },
                {
                    name: 'Chênh lệch',
                    value: 'DISCREPANCY',
                },
            ],
            setValue: (value) => setFilterInventoryCheck({ ...filterInventoryCheck, checkStatus: value }),
        },
    ];

    const handleSubmitFilter = async () => {
        const warehouse = parseToken('warehouse');
        const warehouseID = warehouse.warehouseID;
        let status = '';
        let checkStatus = '';
        if (filterInventoryCheck.status === 'ALL') {
            status = '';
        } else {
            status = filterInventoryCheck.status;
        }
        if (filterInventoryCheck.checkStatus === 'ALL') {
            checkStatus = '';
        } else {
            checkStatus = filterInventoryCheck.checkStatus;
        }
        console.log({
            ...filterInventoryCheck,
            warehouseID,
            currentPage,
            status,
            checkStatus,
        });

        const res = await getFilterInventoryCheck({
            ...filterInventoryCheck,
            warehouseID,
            currentPage,
            status,
            checkStatus,
        });

        if (res?.data?.status == 'OK') {
            setListInventoryCheck(res.data.data);
        }
    };

    const handleResetFilter = () => {
        setFilterInventoryCheck({
            inventoryCheckID: '',
            status: 'ALL',
            checkStatus: 'ALL',
            createdAt: '',
            employeeName: '',
        });
        fetchData();
        setCurrentPage(1);
    };

    return (
        <div className={cx('wrapper-import-product')}>
            <ModelFilter
                columns={columnsFilter}
                selectInput={selectInput}
                handleSubmitFilter={handleSubmitFilter}
                handleResetFilters={handleResetFilter}
            >
                <Button
                    primary
                    onClick={() => {
                        setShowCreateInventoryCheck(true);
                    }}
                >
                    <span>Tạo phiếu kiểm kê</span>
                </Button>
            </ModelFilter>

            <div className={cx('view-list-proposal')}>
                <div className={cx('table-header')}>
                    <p className={cx('table-title')}>Danh sách phiếu kiểm kê</p>
                </div>

                <MyTable data={listInventoryCheck} columns={columnsDefineSuggestProposal} />
                <div className={cx('pagination-table')}>
                    <PaginationUI
                        currentPage={currentPage}
                        handleNextPage={handleNextPage}
                        handlePrevPage={handlePrevPage}
                    />
                </div>
            </div>

            {showDetailInventoryCheck && (
                <CreateCheckDetail
                    inventoryCheckDetail={inventoryCheckDetail}
                    isOpen={showDetailInventoryCheck}
                    onClose={() => setShowDetailInventoryCheck(false)}
                    fetchData={fetchData}
                    type="detail"
                />
            )}

            {showCreateInventoryCheck && (
                <ShowLocationDetail
                    fetchData={fetchData}
                    isOpen={true}
                    onClose={() => setShowCreateInventoryCheck(null)}
                />
            )}
        </div>
    );
};

export default ImportProduct;
