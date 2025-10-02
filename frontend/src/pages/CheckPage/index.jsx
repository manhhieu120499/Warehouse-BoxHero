/* eslint-disable react-hooks/exhaustive-deps */
import React, { use, useEffect, useState } from 'react';
import classNames from 'classnames/bind';
import styles from './CheckPage.module.scss';
import { formatStatusProposal, formatStatusOrderPurchaseMissing } from '@/constants';
import { Button, ModelFilter, MyTable, PaginationUI } from '@/components';
import CreateCheckDetail from './CreateCheckDetail';
import globalStyle from '@/components/GlobalStyle/GlobalStyle.module.scss';
import ModelProposalDetail from '@/pages/ApprovePage/ModelProposalDetail';
import { getAllInventoryCheck } from '../../services/inventoryCheck.service';
import parseToken from '../../utils/parseToken';
import { formatStatusOrderPurchaseMissingInventoryCheck } from '../../constants';
import { set } from 'react-hook-form';

const cxGlobal = classNames.bind(globalStyle);
const cx = classNames.bind(styles);

const ImportProduct = () => {
    const [currentPage, setCurrentPage] = useState(1);
    const [showDetailProposal, setShowDetailProposal] = useState(false);
    const [listInventoryCheck, setListInventoryCheck] = useState([]);
    const [inventoryCheckDetail, setInventoryCheckDetail] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            const warehouseID = parseToken('warehouse').warehouseID;
            const res = await getAllInventoryCheck(warehouseID);
            if (res.status == 200) {
                setListInventoryCheck(res.data.data);
            }
        };
        fetchData();
    }, []);
    useEffect(() => {
        console.log(listInventoryCheck);
    }, [listInventoryCheck]);

    const [filterProposal, setFilterProposal] = useState({
        code: '',
        createdAt: '',
        employeeName: '',
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
                        <p>{formatStatusOrderPurchaseMissingInventoryCheck[record.status]}</p>
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
                                setShowDetailProposal(true);
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
            setValue: (value) => setFilterProposal({ ...filterProposal, code: value }),
            value: filterProposal.code,
        },
        {
            id: 2,
            label: 'Ngày tạo',
            dataIndex: 'createdAt',
            key: 'createdAt',
            type: 'date',
            setValue: (value) => setFilterProposal({ ...filterProposal, createdAt: value }),
            value: filterProposal.createdAt,
        },
        {
            id: 3,
            label: 'Tên nhân viên lập phiếu',
            dataIndex: 'employeeName',
            key: 'employeeName',
            setValue: (value) => setFilterProposal({ ...filterProposal, employeeName: value }),
            value: filterProposal.employeeName,
        },
    ];

    const selectInput = [
        {
            label: 'Trạng thái phiếu',
            option: [
                {
                    name: 'Đủ sản phẩm',
                    value: 'MATCHED',
                },
                {
                    name: 'Thiếu sản phẩm',
                    value: 'SHORTAGE',
                },
                {
                    name: 'Dư sản phẩm',
                    value: 'SURPLUS',
                },
            ],
        },
    ];

    const handleSubmitFilter = async () => {};

    const handleResetFilter = () => {
        setFilterProposal({
            code: '',
            createdAt: '',
            employeeName: '',
        });
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
                        setShowDetailProposal(true);
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

            {showDetailProposal && (
                <CreateCheckDetail
                    inventoryCheckDetail={inventoryCheckDetail}
                    isOpen={showDetailProposal}
                    onClose={() => setShowDetailProposal(false)}
                    type="detail"
                />
            )}
        </div>
    );
};

export default ImportProduct;
