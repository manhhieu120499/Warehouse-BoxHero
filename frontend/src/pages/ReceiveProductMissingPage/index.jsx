import React, { useEffect, useState } from 'react';
import classNames from 'classnames/bind';
import styles from './ReceiveProductMissingPage.module.scss';
import { Button, ModelFilter, MyTable, PaginationUI } from '../../components';
import request, { post } from '../../utils/httpRequest';
import parseToken from '../../utils/parseToken';
import { formatStatusOrderPurchaseMissing, styleMessage } from '../../constants';
import toast from 'react-hot-toast';
import Select from '../../components/Select';
import Tippy from '@tippyjs/react';
import { CakeSlice } from 'lucide-react';
import ModalReceiveProductMissingDetail from '../../components/ModalReceiveProductMissingDetail';
import { set } from 'react-hook-form';

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
        employeeIDCreate: '',
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
            value: filterReceiverPurchase.createdAt,
            name: 'createdAt',
            setValue: (value) => setFilterReceiverPurchase((prev) => ({ ...prev, createdAt: value })),
        },
        {
            id: 3,
            label: 'Mã người tạo',
            value: filterReceiverPurchase.employeeIDCreate,
            name: 'employeeIDCreate',
            setValue: (value) => setFilterReceiverPurchase((prev) => ({ ...prev, employeeIDCreate: value })),
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
            title: 'Mã người tạo',
            dataIndex: 'employeeIDCreate',
            key: 'employeeIDCreate',
            render: (_, record) => <p>{record.orderPurchase.employee.employeeID}</p>,
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
        try{
            const token = parseToken('tokenUser');
            const warehouse = parseToken('warehouse');
            const filterParam = {};
            if(filterReceiverPurchase.proposalID) filterParam.orderPurchaseMissingID = filterReceiverPurchase.proposalID;
            if(filterReceiverPurchase.createdAt) filterParam.createdAt = filterReceiverPurchase.createdAt;
            if(filterReceiverPurchase.status) filterParam.status = filterReceiverPurchase.status === "Đang xử lý" ? "PENDING" : filterReceiverPurchase.status;

            const params = {...filterParam, warehouseID: warehouse.warehouseID} 
            const res = await request.get(`/api/order-purchase-missing/filter`, {
                params,
                headers: {
                    token: `Beare ${token.accessToken}`,
                    employeeid: token.employeeID
                }
            })
            setReceiverPurchaseList(res.data.data || [])
        }catch(err) {   
            console.log(err);
            fetchProposals(1);
        }
    }

    const handleResetFilter = () => {
        setFilterReceiverPurchase({
            proposalID: '',
            createdAt: '',
            status: 'Đang xử lý',
            employeeIDCreate: '',
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
