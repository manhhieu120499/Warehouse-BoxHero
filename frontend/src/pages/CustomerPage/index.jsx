import { useState } from 'react';
import classNames from 'classnames/bind';
import { MyTable, Modal, ModalOrder } from '@/components';
import styles from './CustomerPage.module.scss';
import { Eye } from 'lucide-react';
import Tippy from '@tippyjs/react';
import globalStyle from '../../components/GlobalStyle/GlobalStyle.module.scss';
import ModelFilter from '../../components/ModelFilter';

const cx = classNames.bind(styles);
const cxGlobal = classNames.bind(globalStyle);

const CustomerPage = () => {
    const [page, setPage] = useState(1);
    const [nameFilter, setNameFilter] = useState('');
    const [phoneFilter, setPhoneFilter] = useState('');
    const [emailFilter, setEmailFilter] = useState('');
    const [isOpenInfo, setIsOpenInfo] = useState(false);

    const columns = [
        {
            title: 'Mã KH',
            dataIndex: 'customerId',
            key: 'customerId',
            width: '10%',
            ellipsis: true,
        },
        {
            title: 'Tên khách hàng',
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
                        <Tippy content={'Xem chi tiết'} placement="bottom-end">
                            <button
                                className={cxGlobal('action-table-icon')}
                                onClick={() => console.log(record.customerId)}
                            >
                                <Eye size={20} />
                            </button>
                        </Tippy>
                    </div>
                );
            },
        },
    ];

    const data = [
        {
            key: '1',
            customerId: '1',
            name: 'Alice',
            phone: '123-456-7890',
            address: '123 Main St',
            email: 'alice@example.com',
        },
        {
            key: '2',
            customerId: '2',
            name: 'Bob',
            phone: '987-654-3210',
            address: '456 Elm St',
            email: 'bob@example.com',
        },
        {
            key: '3',
            customerId: '3',
            name: 'Charlie',
            phone: '555-555-5555',
            address: '789 Oak St',
            email: 'charlie@example.com',
        },
        {
            key: '4',
            customerId: '4',
            name: 'David',
            phone: '444-444-4444',
            address: '101 Pine St',
            email: 'david@example.com',
        },
        {
            key: '5',
            customerId: '5',
            name: 'Eve',
            phone: '222-222-2222',
            address: '202 Maple St',
            email: 'eve@example.com',
        },
    ];

    const dataOrderHistory = [
        {
            key: '1',
            orderId: 'ORD001',
            customerName: 'Alice',
            employeeName: 'Bob',
            warehouseId: 'WH001',
            createdAt: '2023-10-01',
            detail: 'Order details here...',
        },
        {
            key: '2',
            orderId: 'ORD002',
            customerName: 'Charlie',
            employeeName: 'Dave',
            warehouseId: 'WH002',
            createdAt: '2023-10-02',
            detail: 'Order details here...',
        },
    ];

    const onChangePage = (page, pageSize) => {
        console.log(`Page: ${page}, Page Size: ${pageSize}`);
        setPage(page);
    };

    const closeModal = () => {
        setIsOpenInfo(false);
    };

    const handleSubmitFilter = () => {
        console.log('Filtering with:', {
            name: nameFilter,
            phone: phoneFilter,
            email: emailFilter,
        });
    };

    const columnsFilter = [
        {
            id: 'name',
            label: 'Tên khách hàng',
            value: nameFilter,
            setValue: setNameFilter,
        },
        {
            id: 'phone',
            label: 'Số điện thoại',
            value: phoneFilter,
            setValue: setPhoneFilter,
        },
        {
            id: 'email',
            label: 'Email',
            value: emailFilter,
            setValue: setEmailFilter,
        },
    ];

    return (
        <div className={cx('wrapper-report')}>
            <div className={cx('header')}>
                <ModelFilter
                    handleSubmitFilter={handleSubmitFilter}
                    handleResetFilters={() => {
                        setNameFilter('');
                        setPhoneFilter('');
                        setEmailFilter('');
                    }}
                    columns={columnsFilter}
                />
            </div>
            <div className={cx('content')}>
                <MyTable
                    currentPage={page}
                    columns={columns}
                    data={data}
                    pagination
                    pageSize={5}
                    onChangePage={onChangePage}
                />
            </div>
            <Modal isOpenInfo={isOpenInfo} onClose={closeModal}>
                <ModalOrder isAdmin={true} dataOrderHistory={dataOrderHistory} />
            </Modal>
        </div>
    );
};

export default CustomerPage;
