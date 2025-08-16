import classNames from 'classnames/bind';
import styles from './ModalOrder.module.scss';
import { MyTable } from '@/components';

const cx = classNames.bind(styles);

const columnsBasic = [
    {
        title: 'Mã hóa đơn',
        dataIndex: 'orderId',
        key: 'orderId',
        ellipsis: true,
    },
    {
        title: 'Ngày tạo',
        dataIndex: 'createdAt',
        key: 'createdAt',
        ellipsis: true,
    },
];

const columnsEmployeeAdmin = [
    {
        title: 'Mã nhân viên',
        dataIndex: 'employeeId',
        key: 'employeeId',
        ellipsis: true,
    },
    {
        title: 'Tên nhân viên',
        dataIndex: 'employeeName',
        key: 'employeeName',
        ellipsis: true,
    },
    {
        title: 'Mã kho',
        dataIndex: 'warehouseId',
        key: 'warehouseId',
        ellipsis: true,
    },
];

const columnsDetailOrder = [
    {
        title: 'Chi tiết hóa đơn',
        dataIndex: 'detail',
        key: 'detail',
        ellipsis: true,
    },
];

const ModalOrder = ({ isAdmin, dataOrderHistory }) => {
    return (
        <div className={cx('modal-order')}>
            <h2>Lịch sử xuất hàng</h2>
            <div className={cx('table-container')}>
                <MyTable
                    columns={
                        isAdmin
                            ? [...columnsBasic, ...columnsEmployeeAdmin, ...columnsDetailOrder]
                            : [...columnsBasic, ...columnsDetailOrder]
                    }
                    dataSource={dataOrderHistory}
                    rowKey="key"
                />
            </div>
        </div>
    );
};

export default ModalOrder;
