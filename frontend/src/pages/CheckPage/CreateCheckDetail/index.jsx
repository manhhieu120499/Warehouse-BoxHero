import React, { useState } from 'react';
import classNames from 'classnames/bind';
import styles from './CreateCheckDetail.module.scss';
import { Modal, Button, MyTable } from '../../../components';
import PopupMessage from '../../../components/PopupMessage';
import { formatStatusProduct } from '../../../constants';

const cx = classNames.bind(styles);
const tableColumns = [
    {
        title: 'Mã hàng',
        dataIndex: 'itemCode',
        key: 'itemCode',
        width: '10%',
    },
    {
        title: 'Tên hàng',
        dataIndex: 'itemName',
        key: 'itemName',
        width: '20%',
    },
    {
        title: 'Vị trí lưu trữ',
        dataIndex: 'storageLocation',
        key: 'storageLocation',
        width: '10%',
    },
    {
        title: 'Đơn vị tính',
        dataIndex: 'unit',
        key: 'unit',
        width: '10%',
    },
    {
        title: 'Tồn hệ thống',
        dataIndex: 'systemStock',
        key: 'systemStock',
        width: '10%',
    },
    {
        title: 'Tồn thực tế',
        dataIndex: 'actualStock',
        key: 'actualStock',
        width: '10%',
    },
    {
        title: 'Chênh lệch',
        dataIndex: 'difference',
        key: 'difference',
        width: '10%',
    },
    {
        title: 'Trạng thái',
        dataIndex: 'status',
        key: 'status',
        width: '10%',
    },
    {
        title: 'Xóa',
        dataIndex: 'actions',
        key: 'actions',
        width: '10%',
    },
];

const CreateCheckDetail = ({ isOpen, onClose, inventoryCheckDetail, type = 'create' }) => {
    const [inventoryCheckId, setInventoryCheckId] = useState('');
    const [inventoryCheckDate, setInventoryCheckDate] = useState('');
    const [staffName, setStaffName] = useState('');
    const [note, setNote] = useState('');

    console.log(inventoryCheckDetail);

    return (
        <Modal isOpenInfo={isOpen} onClose={onClose} showButtonClose={false}>
            <div className={cx('wrapper-check')}>
                <div className={cx('info-check', 'container-check')}>
                    <div className={cx('header-check')}>
                        <h4>Thông tin phiếu kiểm kê</h4>
                        <div className={cx('headerActions')}>
                            <Button primary borderRadiusMedium onClick={onClose}>
                                <span>Đóng</span>
                            </Button>
                            {type === 'create' && (
                                <Button primary className={cx('btn-generate')} onClick={() => {}}>
                                    Tạo mã phiếu
                                </Button>
                            )}
                        </div>
                    </div>

                    <div className={cx('form-info')}>
                        <div className={cx('form-group')}>
                            <label htmlFor="inventoryCheckId">Mã phiếu kiểm kê</label>
                            <div className={cx('input-generate')}>
                                <input
                                    type="text"
                                    id="inventoryCheckId"
                                    value={inventoryCheckDetail?.inventoryCheckID}
                                    onChange={(e) => setInventoryCheckId(e.target.value)}
                                    placeholder="Nhập mã phiếu kiểm kê"
                                    disabled={type === 'detail'}
                                />
                                {type === 'create' && (
                                    <Button primary className={cx('btn-generate')} onClick={() => {}}>
                                        Tạo mã phiếu
                                    </Button>
                                )}
                            </div>
                        </div>
                        <div className={cx('form-group')}>
                            <label htmlFor="inventoryCheckDate">Ngày tạo phiếu</label>
                            <input
                                type="date"
                                id="inventoryCheckDate"
                                value={
                                    inventoryCheckDetail?.createdAt
                                        ? new Date(inventoryCheckDetail.createdAt).toISOString().split('T')[0]
                                        : ''
                                }
                                onChange={(e) => setInventoryCheckDate(e.target.value)}
                                placeholder="Chọn ngày kiểm kê"
                                disabled={type === 'detail'}
                            />
                        </div>
                        <div className={cx('form-group')}>
                            <label htmlFor="staffName">Người lập phiếu</label>
                            <input
                                type="text"
                                id="staffName"
                                value={inventoryCheckDetail?.employee?.employeeName}
                                onChange={(e) => setStaffName(e.target.value)}
                                placeholder="Nhập tên nhân viên phụ trách kiểm kê"
                                disabled={type === 'detail'}
                            />
                        </div>
                        <div className={cx('form-group')}>
                            <label htmlFor="note">Ghi chú</label>
                            <input
                                type="text"
                                id="note"
                                value={inventoryCheckDetail?.note}
                                onChange={(e) => setNote(e.target.value)}
                                placeholder="Nhập ghi chú"
                                disabled={type === 'detail'}
                            />
                        </div>
                    </div>
                </div>

                <div className={cx('filter-check', 'container-check')}>
                    <h4>Tìm kiếm sản phẩm cần kiểm kê</h4>
                    <div className={cx('form-group')}>
                        <input
                            type="text"
                            id="inventoryCheckId"
                            value={inventoryCheckId}
                            placeholder="Nhập mã sản phẩm"
                        />
                        <Button primary className={cx('btn-search')} onClick={() => {}}>
                            Tìm kiếm
                        </Button>
                    </div>
                </div>

                <div className={cx('table-check', 'container-check')}>
                    <div className={cx('title-table')}>
                        <h4>Danh sách hàng hóa kiểm kê</h4>
                    </div>
                    <table className={cx('table')}>
                        <thead>
                            <tr>
                                <th className={cx('productID')}>Mã sản phẩm</th>
                                <th className={cx('productName')}>Tên sản phẩm</th>
                                <th className={cx('note')}>Trạng thái</th>
                                <th className={cx('num')}>Tồn hệ thống</th>
                                <th className={cx('num')}>Tồn thực tế</th>
                                <th className={cx('num')}>Chênh lệch</th>
                            </tr>
                        </thead>
                        <tbody>
                            {inventoryCheckDetail?.details?.map((item, index) => (
                                <tr key={index}>
                                    <td className={cx('productID')}>{item.productID}</td>
                                    <td className={cx('productName')}>{item.product.productName}</td>
                                    <td className={cx('note')}>{formatStatusProduct[item.product.status]}</td>
                                    <td className={cx('num')}>{item.systemQuantity}</td>
                                    <td className={cx('num')}>{item.actualQuantity}</td>
                                    <td className={cx('num')}>{item.discrepancyQuantity}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </Modal>
    );
};

export default CreateCheckDetail;
