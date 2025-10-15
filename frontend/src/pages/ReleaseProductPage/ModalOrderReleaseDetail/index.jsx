import React, { useEffect, useState } from 'react';
import classNames from 'classnames/bind';
import styles from './ModalOrderReleaseDetail.module.scss';
import { Modal, MyTable } from '../../../components';
import Tippy from '@tippyjs/react';
import { Eye } from 'lucide-react';
import globalStyle from '@/components/GlobalStyle/GlobalStyle.module.scss';
import parseToken from '../../../utils/parseToken';
import ModalOrderReleaseDetailBatchProduct from '../ModalOrderReleaseDetailBatchProduct';

const cx = classNames.bind(styles);
const cxGlb = classNames.bind(globalStyle);

const ModalOrderReleaseDetail = ({ isOpen, onClose, orderReleaseItem }) => {
    const [orderDetail, setOrderDetail] = useState([]);
    const [orderDetailSelected, setOrderDetailSelected] = useState(null);
    const warehouse = parseToken('warehouse');
    const tableColumns = [
        {
            title: 'Mã sản phẩm',
            dataIndex: 'productID',
            key: 'productID',
        },
        {
            title: 'Tên sản phẩm',
            dataIndex: 'productName',
            key: 'productName',
        },
        {
            title: 'Đơn vị tính',
            dataIndex: 'unitName',
            key: 'unitName',
        },
        {
            title: 'Số lượng xuất',
            dataIndex: 'quantityExported',
            key: 'quantityExported',
            render: (text) => <p className={cx('cell-number')}>{text}</p>,
        },
        {
            title: 'Thao tác',
            dataIndex: 'actions',
            key: 'actions',
            render: (_, record) => (
                <div
                    className={cxGlb('action-table')}
                    onClick={() => setOrderDetailSelected(record)}
                    style={{ cursor: 'pointer' }}
                >
                    <Tippy content="Xem chi tiết" placement="right">
                        <Eye size={20} />
                    </Tippy>
                </div>
            ),
        },
    ];

    useEffect(() => {
        if (!orderReleaseItem) return;
        const groupDetail = []; // nhóm chi tiết sản phẩm trùng
        const formatOrderReleaseData = orderReleaseItem.orderReleaseDetails.map((item) => {
            const uom = item.batch.unit.unitName.split('-')[1].trim();
            const totalQuantityExport = item.orderReleaseBatchBoxDetails.reduce(
                (acc, cur) => acc + Number(cur.quantityExported) * Number(uom),
                0,
            );
            return {
                productID: item.batch.product.productID,
                productName: item.batch.product.productName,
                unitName: item.batch.product.baseUnitProducts.baseUnitName,
                quantityExported: totalQuantityExport,
                batchOfProductExported: [item],
            };
        });

        formatOrderReleaseData.forEach((item) => {
            const existProduct = groupDetail.find((prod) => prod.productID === item.productID);
            if (existProduct) {
                existProduct.quantityExported += item.quantityExported;
                existProduct.batchOfProductExported.push(item.batchOfProductExported[0]);
            } else {
                groupDetail.push({ ...item });
            }
        });

        setOrderDetail(groupDetail);
    }, [orderReleaseItem]);

    return (
        <>
            <Modal isOpenInfo={isOpen} onClose={onClose}>
                <div className={cx('modal-order-release-detail')}>
                    <section className={cx('order-release-normal-info')}>
                        <h1 className="order-release-title">Phiếu xuất kho</h1>
                        <div className={cx('row')}>
                            <div className={cx('row-item')}>
                                <span>Mã phiếu</span>
                                <input
                                    type="text"
                                    placeholder="Mã phiếu"
                                    readOnly
                                    value={orderReleaseItem?.orderReleaseID || ''}
                                />
                            </div>
                            <div className={cx('row-item')}>
                                <span>Ngày lập</span>
                                <input
                                    type="date"
                                    placeholder="Ngày lập"
                                    readOnly
                                    value={orderReleaseItem?.createdAt?.split('T')[0] || ''}
                                />
                            </div>
                            <div className={cx('row-item')}>
                                <span>Kho</span>
                                <input type="text" placeholder="Tên kho" readOnly value={warehouse.warehouseName} />
                            </div>
                        </div>
                        <div className={cx('row')}>
                            <div className={cx('row-item')}>
                                <span>Tên người lập phiếu</span>
                                <input
                                    type="text"
                                    placeholder="Tên người lập phiếu"
                                    readOnly
                                    value={orderReleaseItem?.employees?.employeeName || ''}
                                />
                            </div>
                            <div className={cx('row-item')}>
                                <span>Mã khách hàng</span>
                                <input
                                    type="text"
                                    placeholder="Mẫ khách hàng"
                                    readOnly
                                    value={orderReleaseItem?.customers?.customerID || ''}
                                />
                            </div>
                            <div className={cx('row-item')}>
                                <span>Tên khách hàng</span>
                                <input
                                    type="text"
                                    placeholder="Tên khách hàng"
                                    readOnly
                                    value={orderReleaseItem?.customers?.customerName || ''}
                                />
                            </div>
                        </div>
                    </section>

                    <section className={cx('order-release-batch-detail')}>
                        <p className={cx('order-release-sub-title')}>Chi tiết xuất kho</p>
                        <MyTable columns={tableColumns} data={orderDetail} scroll={{ y: 300 }} />
                    </section>
                </div>
            </Modal>
            <ModalOrderReleaseDetailBatchProduct
                isOpen={!!orderDetailSelected}
                item={orderDetailSelected}
                onClose={() => setOrderDetailSelected(null)}
            />
        </>
    );
};

export default ModalOrderReleaseDetail;
