import React from 'react';
import classNames from 'classnames/bind';
import styles from './ExportInfoSheet.module.scss';
import { generateCode } from '../../../../utils/generate';
import { Button } from '@/components';
import globalStyles from '@/components/GlobalStyle/GlobalStyle.module.scss';

const cxGlb = classNames.bind(globalStyles);
const cx = classNames.bind(styles);

const ExportInfoSheet = ({ formData, setFormData, className }) => {
    return (
        <section className={cx('info-sheet', className)}>
            <p className={cx('content-header')}>Thông tin chung</p>
            {/* Row 1: 3 phần tử */}
            <div className={cx('row', 'row-3')}>
                <div className={cx('form-group')}>
                    <label>Mã phiếu</label>
                    <div className={cx('input-generate-code')}>
                        <input type="text" placeholder="Tạo mã phiếu" value={formData.receiptCode || ''} />
                        <Button
                            primary
                            medium
                            rounded
                            onClick={() => {
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
                        className={cxGlb('readOnly')}
                    />
                </div>
                <div className={cx('form-group')}>
                    <label>Kho</label>
                    <input
                        type="text"
                        placeholder="Tên kho"
                        readOnly
                        value={formData.warehouse || ''}
                        className={cxGlb('readOnly')}
                    />
                </div>
            </div>
            {/* Row 2: 4 phần tử */}
            <div className={cx('row', 'row-4')}>
                <div className={cx('form-group')}>
                    <label>Tên người lập phiếu</label>
                    <input
                        type="text"
                        placeholder="Tên người lập phiếu"
                        value={formData.createdBy}
                        className={cxGlb('readOnly')}
                    />
                </div>
                <div className={cx('form-group')}>
                    <label>Mã khách hàng</label>
                    <input
                        type="text"
                        placeholder="Nhập mã khách hàng"
                        value={formData.customerID}
                        readOnly
                        className={cxGlb('readOnly')}
                    />
                </div>
                <div className={cx('form-group')}>
                    <label>Tên khách hàng</label>
                    <input
                        type="text"
                        placeholder="Tên khách hàng"
                        value={formData.customerName || ''}
                        readOnly
                        className={cxGlb('readOnly')}
                    />
                </div>
                <div className={cx('form-group')}>
                    <label>Mã phiếu đề xuất xuất</label>
                    <input
                        type="text"
                        placeholder="Mã phiếu đề xuất xuất"
                        value={formData.orderReleaseProposalID || ''}
                        readOnly
                        className={cxGlb('readOnly')}
                    />
                </div>
            </div>
            {/* Row 3: 1 phần tử full width */}
            <div className={cx('row', 'row-1')}>
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
