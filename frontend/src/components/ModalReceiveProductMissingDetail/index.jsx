import React, { useState } from 'react';
import classNames from 'classnames/bind';
import styles from './ModalReceiveProductMissingDetail.module.scss';
import Modal from '../Modal';
import toast from 'react-hot-toast';
import Button from '../Button';
import MyTable from '../MyTable';
import { convertDateVN } from '../../common';

const cx = classNames.bind(styles);

const ModalReceiveProductMissingDetail = ({ data, isOpen, onClose }) => {
    console.log(data);

    const columns = [
        {
            title: 'Mã CTDN',
            dataIndex: 'orderPurchaseDetailID',
            key: 'orderPurchaseDetailID',
            width: '12%',
        },
        {
            title: 'Mã lô',
            dataIndex: 'batchID',
            key: 'batchID',
            render: (text, record) => <span>{record.orderPurchaseDetail.batchID}</span>,
        },
        {
            title: 'Tên sản phẩm',
            dataIndex: 'productName',
            key: 'productName',
            render: (text, record) => <span>{record.orderPurchaseDetail.batch.product.productName}</span>,
        },
        {
            title: 'Đơn vị',
            dataIndex: 'unitName',
            key: 'unitName',
            render: (text, record) => <span>{record.orderPurchaseDetail.batch.unit.unitName}</span>,
        },
        {
            title: 'Số lượng yêu cầu',
            dataIndex: 'requestedQuantity',
            key: 'requestedQuantity',
            render: (text, record) => <span>{record.orderPurchaseDetail.requestedQuantity}</span>,
        },
        {
            title: 'Số lượng thiếu',
            dataIndex: 'missingQuantity',
            key: 'missingQuantity',
        },
    ];

    return (
        <Modal isOpenInfo={isOpen} onClose={onClose} showButtonClose={false}>
            <div className={cx('wrapper-detail-import-product-content')}>
                <p className={cx('title-header')}>Cập nhật chi tiết lô hàng</p>
                <div className={cx('row')}>
                    <div className={cx('column')}>
                        <div className={cx('form-group')}>
                            <label>Mã phiếu nhập</label>
                            <input value={data.orderPurchaseID} disabled type="text" />
                        </div>
                        <div className={cx('form-group')}>
                            <label>Mã nhân viên</label>
                            <input value={data?.orderPurchase?.employee.employeeID} disabled type="text" />
                        </div>
                        <div className={cx('form-group')}>
                            <label>Tên nhân viên</label>
                            <input value={data?.orderPurchase?.employee.employeeName} disabled type="text" />
                        </div>
                    </div>

                    <div className={cx('column')}>
                        <div className={cx('form-group')}>
                            <label>Mã kho</label>
                            <input type="text" disabled value={data?.orderPurchase?.warehouseID} />
                        </div>
                        <div className={cx('form-group')}>
                            <label>Ngày tạo</label>
                            <input
                                value={data?.createdAt ? convertDateVN(data.createdAt) : ''}
                                disabled
                                type="datetime-local"
                            />
                        </div>
                    </div>
                </div>

                <div className={cx('suggest-location-view')}>
                    <p>Chi tiết đơn hàng thiếu</p>
                    <MyTable columns={columns} data={data?.orderPurchaseMissingDetails} />
                </div>
                <div className={cx('action-modal')}>
                    <Button success onClick={() => {}}>
                        <span>Đã giải quyết</span>
                    </Button>
                    <Button error onClick={() => {}}>
                        <span>Đã hủy</span>
                    </Button>
                    <Button primary onClick={onClose}>
                        <span>Đóng</span>
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

export default ModalReceiveProductMissingDetail;
