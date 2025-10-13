import React from 'react';
import classNames from 'classnames/bind';
import styles from './ExportInfoSheet.module.scss';
import { generateCode } from '../../../../utils/generate';
import { styleMessage } from '../../../../constants';
import toast from 'react-hot-toast';
import { searchCustomer } from '../../../../services/customer.service';
import { Button } from '@/components';

const cx = classNames.bind(styles);

const ExportInfoSheet = ({ formData, setFormData, className }) => {
    const handleSearchCustomer = async (customerID) => {
        if (!customerID) return;
        try {
            const res = await searchCustomer(customerID);
            if (!res) {
                toast.error('Không tìm thấy khách hàng', styleMessage);
                return;
            }
            setFormData((prev) => ({
                ...prev,
                customerName: res.customerName,
            }));
        } catch (err) {
            toast.error(err.message, styleMessage);
            return;
        }
    };
    return (
        <section className={cx('', className)}>
            <p className={cx('content-header')}>Thông tin chung</p>
            <div className={cx('row')}>
                <div className={cx('form-group')}>
                    <label>Mã phiếu</label>
                    <div className={cx('input-generate-code')}>
                        <input type="text" placeholder="Tạo mã phiếu" value={formData.receiptCode || ''} />
                        <Button
                            primary
                            medium
                            rounded
                            onClick={() => {
                                //if (formData.receiptCode) return;
                                setFormData((prev) => ({
                                    ...prev,
                                    receiptCode: `${generateCode('PX-')}`,
                                }));
                            }}
                        >
                            Tạo mã phiếu
                        </Button>
                    </div>
                </div>
                <div className={cx('form-group')}>
                    <label>Ngày lập</label>
                    <input
                        type="date"
                        placeholder="Ngày tạo phiếu"
                        readOnly
                        value={new Date().toISOString().split('T')[0]}
                    />
                </div>
                <div className={cx('form-group')}>
                    <label>Kho</label>
                    <input type="text" placeholder="Tên kho" readOnly value={formData.warehouse || ''} />
                </div>
            </div>
            <div className={cx('row')}>
                <div className={cx('form-group')}>
                    <label>Tên người lập phiếu</label>
                    <input type="text" placeholder="Tên người lập phiếu" value={formData.createdBy} />
                </div>
                <div className={cx('form-group')}>
                    <label>Mã khách hàng</label>
                    <input
                        type="text"
                        placeholder="Nhập mã khách hàng"
                        value={formData.customerID}
                        onChange={(e) => setFormData((prev) => ({ ...prev, customerID: e.target.value }))}
                        onBlur={() => handleSearchCustomer(formData.customerID)}
                    />
                </div>

                <div className={cx('form-group')}>
                    <label>Tên khách hàng</label>
                    <input type="text" placeholder="Tên khách hàng" value={formData.customerName || ''} readOnly />
                </div>
            </div>
            <div className={cx('row')}>
                <div className={cx('form-group', 'full-width')}>
                    <label>Ghi chú</label>
                    <textarea
                        placeholder="Nhập ghi chú"
                        value={formData.note}
                        onChange={(e) => setFormData((prev) => ({ ...prev, note: e.target.value }))}
                    />
                </div>
            </div>
        </section>
    );
};

export default ExportInfoSheet;
