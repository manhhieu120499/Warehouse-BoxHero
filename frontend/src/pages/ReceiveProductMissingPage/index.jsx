import React, { useEffect, useState } from 'react';
import classNames from 'classnames/bind';
import styles from './ReceiveProductMissingPage.module.scss';
import { Button, ModelFilter, MyTable, PaginationUI } from '../../components';
import request, { post } from '../../utils/httpRequest';
import parseToken from '../../utils/parseToken';
import { formatStatusOrderPurchaseMissing } from '../../constants';
import ModalReceiveProductMissingDetail from '../../components/ModalReceiveProductMissingDetail';

const cx = classNames.bind(styles);

const ReceiveProductMissingPage = () => {
    const pageSize = 5;
    const [page, setPage] = useState(1);
    const [receiverPurchaseList, setReceiverPurchaseList] = useState([]);
    const [showDetail, setShowDetail] = useState(false);
    const [indexDetail, setIndexDetail] = useState({});
    const [filterReceiverPurchase, setFilterReceiverPurchase] = useState({
        proposalID: '',
        createdAt: '',
        status: 'Đang xử lý',
        employeeName: '',
    });
    const columnsFilter = [
        {
            id: 1,
            label: 'Mã phiếu nhập',
            value: filterReceiverPurchase.proposalID,
            name: 'proposalID',
            setValue: (value) => setFilterReceiverPurchase((prev) => ({ ...prev, proposalID: value })),
        },
        {
            id: 2,
            label: 'Ngày lập',
            type: 'date',
            value: filterReceiverPurchase.createdAt,
            name: 'createdAt',
            setValue: (value) => setFilterReceiverPurchase((prev) => ({ ...prev, createdAt: value })),
        },
        {
            id: 3,
            label: 'Tên người tạo',
            value: filterReceiverPurchase.employeeName,
            name: 'employeeName',
            setValue: (value) => setFilterReceiverPurchase((prev) => ({ ...prev, employeeName: value })),
        },
    ];

    const selectFilter = [
        {
            id: 3,
            label: 'Trạng thái',
            value: filterReceiverPurchase.status,
            name: 'status',
            setValue: (value) => setFilterReceiverPurchase((prev) => ({ ...prev, status: value })),
            option: [
                {
                    name: 'Đang xử lý',
                    value: 'PENDING',
                },
                {
                    name: 'Đã giải quyết',
                    value: 'RESOLVED',
                },
                {
                    name: 'Đã hủy',
                    value: 'CANCELED',
                },
            ],
        },
    ];

    const columnsTable = [
        {
            title: 'Mã phiếu nhập thiếu',
            dataIndex: 'orderPurchaseMissingID',
            key: 'orderPurchaseMissingID',
        },
        {
            title: 'Ngày lập',
            dataIndex: 'createdAt',
            key: 'createAt',
            render: (text) => <p>{text.slice(0, 10)}</p>,
        },
        {
            title: 'Tên người tạo',
            dataIndex: 'employeeName',
            key: 'employeeName',
            render: (_, record) => <p>{record.orderPurchase.employee.employeeName}</p>,
        },
        {
            title: 'Mã kho',
            dataIndex: 'warehouseID',
            key: 'warehouseID',
            render: (_, record) => <p>{record.orderPurchase.warehouseID}</p>,
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: (text) => <p>{formatStatusOrderPurchaseMissing[text]}</p>,
        },
        {
            title: 'Chi tiết',
            dataIndex: 'detail',
            key: 'detail',
            render: (text, record) => (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
                    <Button
                        primary
                        small
                        onClick={() => {
                            setIndexDetail(record);
                            setShowDetail(true);
                        }}
                    >
                        <span>Xem</span>
                    </Button>
                </div>
            ),
        },
    ];

    const fetchProposals = async () => {
        try {
            console.log(page);
            const token = parseToken('tokenUser');
            const warehouse = parseToken('warehouse');
            const res = await request.get('/api/order-purchase-missing/filter', {
                params: {
                    warehouseID: warehouse.warehouseID,
                    status: 'PENDING',
                },
                headers: {
                    token: `Beare ${token.accessToken}`,
                    employeeid: token.employeeID,
                    warehouseID: warehouse.warehouseID,
                },
            });
            setReceiverPurchaseList(res.data.data);
            setPage(page);
        } catch (err) {
            console.log(err);
        }
    };

    const handleFilter = async () => {
        try {
            const token = parseToken('tokenUser');
            const warehouse = parseToken('warehouse');
            const filterParam = {};
            if(filterReceiverPurchase.proposalID) filterParam.orderPurchaseMissingID = filterReceiverPurchase.proposalID;
            if(filterReceiverPurchase.createdAt) filterParam.createdAt = filterReceiverPurchase.createdAt;
            if(filterReceiverPurchase.status) filterParam.status = filterReceiverPurchase.status === "Đang xử lý" ? "PENDING" : filterReceiverPurchase.status;
            if(filterReceiverPurchase.employeeName) filterParam.employeeName = filterReceiverPurchase.employeeName;

            const params = { ...filterParam, warehouseID: warehouse.warehouseID };
            const res = await request.get(`/api/order-purchase-missing/filter`, {
                params,
                headers: {
                    token: `Beare ${token.accessToken}`,
                    employeeid: token.employeeID
                }
            })
            console.log(res.data)
            setReceiverPurchaseList(res.data.data || [])
        }catch(err) {   
            console.log(err);
            fetchProposals(1);
        }
    };

    const handleResetFilter = () => {
        setFilterReceiverPurchase({
            proposalID: '',
            createdAt: '',
            status: 'Đang xử lý',
            employeeName: '',
        });
        setPage(1);
        fetchProposals();
    };

    const handleNextPage = () => {
        fetchProposals(page + 1);
    };

    const handlePrevPage = async () => {
        if (page - 1 <= 0) return;
        fetchProposals(page - 1);
    };

    useEffect(() => {
        fetchProposals(page);
    }, [page]);

    return (
        <div className={cx('wrapper-approve')}>
            <ModelFilter
                className={cx('model-filter')}
                columns={columnsFilter}
                handleResetFilters={handleResetFilter}
                selectInput={selectFilter}
                handleSubmitFilter={handleFilter}
            />
            <div className={cx('table-container-header')}>
                <h1 className={cx('title-approve')}>Danh sách phiếu nhập thiếu</h1>
            </div>
            <div className={cx('table-container')}>
                <MyTable
                    className={cx('my-table')}
                    columns={columnsTable}
                    data={receiverPurchaseList}
                    pageSize={pageSize}
                />
                <PaginationUI currentPage={page} handleNextPage={handleNextPage} handlePrevPage={handlePrevPage} />
            </div>

            <ModalReceiveProductMissingDetail
                data={indexDetail}
                isOpen={showDetail}
                onClose={() => setShowDetail(false)}
                reset={handleFilter}
            />
        </div>
    );
};

export default ReceiveProductMissingPage;
