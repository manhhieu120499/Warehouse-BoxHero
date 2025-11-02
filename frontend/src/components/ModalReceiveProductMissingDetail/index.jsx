import React, { useState } from 'react';
import classNames from 'classnames/bind';
import styles from './ModalReceiveProductMissingDetail.module.scss';
import Modal from '../Modal';
import toast from 'react-hot-toast';
import Button from '../Button';
import MyTable from '../MyTable';
import { convertDateVN } from '../../common';
import { formatStatusOrderPurchaseMissing, styleMessage } from '../../constants';
import parseToken from '../../utils/parseToken';
import request from '../../utils/httpRequest';
import PopupMessage from '../PopupMessage';
import CreateImportReceiptMissingDialog from '../../pages/ReceiveProductPage/CreateImportReceiptMissingDialog';

const cx = classNames.bind(styles);

const ModalReceiveProductMissingDetail = ({ data, isOpen, onClose, reset }) => {
    console.log('data', data);
    const [showPopConfirmSaveMissing, setShowPopConfirmSaveMissing] = useState(false);
    const [showPurchaseSupplement, setShowPurchaseSupplement] = useState(false);

    const handleUpdateStatus = async (status) => {
        try {
            const token = parseToken('tokenUser');
            const warehouse = parseToken('warehouse');
            const res = await request.post(
                '/api/order-purchase/update-status-order-purchase',
                {
                    orderPurchaseID: data.orderPurchaseID,
                    status,
                },
                {
                    headers: {
                        token: `Bearer ${token.accessToken}`,
                        employeeid: token.employeeID,
                        warehouseid: warehouse.warehouseID,
                    },
                },
            );
            console.log(res.data);
            toast.success('Cập nhật trạng thái thành công', styleMessage);
            reset();
            onClose(false);
        } catch (err) {
            toast.error('Cập nhật trạng thái thất bại', styleMessage);
            console.log(err);
            return;
        }
    };

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
                        {data?.status === 'PENDING' && (
                            <div className={cx('form-group')}>
                                <label>Ngày tạo</label>
                                <input
                                    value={data?.createdAt ? convertDateVN(data.createdAt) : ''}
                                    disabled
                                    type="datetime-local"
                                />
                            </div>
                        )}
                        {data?.status === 'CANCELED' && (
                            <div className={cx('form-status')}>
                                <div className={cx('form-group')}>
                                    <label>Trạng thái</label>
                                    <input
                                        type="text"
                                        disabled
                                        value={formatStatusOrderPurchaseMissing[data?.status]}
                                    />
                                </div>
                                <div className={cx('row')}>
                                    <div className={cx('form-group')}>
                                        <label>Ngày tạo</label>
                                        <input
                                            value={data?.createdAt ? convertDateVN(data.createdAt) : ''}
                                            disabled
                                            type="datetime-local"
                                        />
                                    </div>
                                    <div className={cx('form-group')}>
                                        <label>Ngày huỷ</label>
                                        <input
                                            value={data?.createdAt ? convertDateVN(data.createdAt) : ''}
                                            disabled
                                            type="datetime-local"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                        {data?.status === 'RESOLVED' && (
                            <div className={cx('form-status')}>
                                <div className={cx('form-group')}>
                                    <label>Trạng thái</label>
                                    <input
                                        type="text"
                                        disabled
                                        value={formatStatusOrderPurchaseMissing[data?.status]}
                                    />
                                </div>
                                <div className={cx('row')}>
                                    <div className={cx('form-group')}>
                                        <label>Ngày tạo</label>
                                        <input
                                            value={data?.createdAt ? convertDateVN(data.createdAt) : ''}
                                            disabled
                                            type="datetime-local"
                                        />
                                    </div>
                                    <div className={cx('form-group')}>
                                        <label>Ngày giải quyết</label>
                                        <input
                                            value={data?.createdAt ? convertDateVN(data.updatedAt) : ''}
                                            disabled
                                            type="datetime-local"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className={cx('suggest-location-view')}>
                    <p>Chi tiết đơn hàng thiếu</p>
                    <MyTable columns={columns} data={data?.orderPurchaseMissingDetails} />
                </div>
                <div className={cx('action-modal')}>
                    {data?.status === 'PENDING' && (
                        <>
                            <Button success onClick={() => setShowPurchaseSupplement(true)}>
                                <span>Nhập bổ sung</span>
                            </Button>
                            <Button error onClick={() => setShowPopConfirmSaveMissing(true)}>
                                <span>Đã hủy</span>
                            </Button>
                        </>
                    )}
                    <Button primary onClick={onClose}>
                        <span>Đóng</span>
                    </Button>
                </div>
            </div>

            <Modal
                isOpenInfo={showPopConfirmSaveMissing}
                onClose={() => setShowPopConfirmSaveMissing(false)}
                showButtonClose={false}
            >
                <div className={cx('wrapper-message')}>
                    <h1 className={cx('title')}>Thông báo</h1>
                    <p className={cx('des')}>Bạn có chắc chắn muốn hủy phiếu nhập thiếu này không?</p>
                    <div className={cx('action-confirm')}>
                        <Button
                            primary
                            onClick={() => {
                                handleUpdateStatus('CANCELED');
                            }}
                        >
                            <span>Có</span>
                        </Button>
                        <Button outline onClick={() => setShowPopConfirmSaveMissing(false)}>
                            <span>Không</span>
                        </Button>
                    </div>
                </div>
            </Modal>

            {showPurchaseSupplement && (
                <CreateImportReceiptMissingDialog
                    isOpen={showPurchaseSupplement}
                    onClose={() => {
                        onClose();
                        setShowPurchaseSupplement(false);
                    }}
                    orderPurchaseMissing={data}
                    handleFetchOrderMissing={reset}
                />
            )}
        </Modal>
    );
};

export default ModalReceiveProductMissingDetail;
