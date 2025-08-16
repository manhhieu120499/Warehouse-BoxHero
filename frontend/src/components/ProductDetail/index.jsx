import React, { useCallback, useRef, useState } from 'react';
import Modal from '../Modal';
import styles from './ProductDetail.module.scss';
import classNames from 'classnames/bind';
import Image from '../Image';
import MyTable from '../MyTable';
import Button from '../Button';
import { QrCode } from 'lucide-react';

const cx = classNames.bind(styles);

const RowItem = ({ firstTitle = '', firstValue = '', secondTitle = '', secondValue = '' }) => {
    return (
        <div className={cx('row-info')}>
            {firstTitle && firstValue && (
                <div className={cx('column-info')}>
                    <strong>{firstTitle}:</strong>
                    <span>{firstValue}</span>
                </div>
            )}
            {secondTitle && secondValue && (
                <div className={cx('column-info')}>
                    <strong>{secondTitle}:</strong>
                    <span>{secondValue}</span>
                </div>
            )}
        </div>
    );
};

const tableColumns = [
    {
        title: 'Mã lô hàng',
        dataIndex: 'sbu',
        key: 'sbu',
    },
    {
        title: 'Ngày sản xuất',
        dataIndex: 'macDate',
        key: 'macDate',
    },
    {
        title: 'Hạn sử dụng',
        dataIndex: 'expiredDate',
        key: 'expiredDate',
    },
    {
        title: 'Số lượng nhập',
        dataIndex: 'receive',
        key: 'receive',
        render: (text) => <p className={cx('number')}>{text}</p>,
    },
    {
        title: 'Số lượng tồn',
        dataIndex: 'available',
        key: 'available',
        render: (text) => <p className={cx('number')}>{text}</p>,
    },
    {
        title: 'Vị trí',
        dataIndex: 'location',
        key: 'location',
    },
    {
        title: 'Mã kho',
        dataIndex: 'wareId',
        key: 'wareId',
    },
];

const dataSource = [
    {
        sbu: 'SPG001',
        macDate: '12-03-2025',
        expiredDate: '12-3-2026',
        receive: 20,
        available: 15,
        location: 'Khu A',
        wareId: 'WH123',
    },
    {
        sbu: 'SPG001',
        macDate: '12-03-2025',
        expiredDate: '12-03-2026',
        receive: 20,
        available: 15,
        location: 'Khu A',
        wareId: 'WH123',
    },
    {
        sbu: 'SPG002',
        macDate: '15-04-2025',
        expiredDate: '15-04-2026',
        receive: 25,
        available: 20,
        location: 'Khu B',
        wareId: 'WH124',
    },
    {
        sbu: 'SPG003',
        macDate: '20-05-2025',
        expiredDate: '20-05-2026',
        receive: 30,
        available: 28,
        location: 'Khu C',
        wareId: 'WH125',
    },
    {
        sbu: 'SPG004',
        macDate: '10-06-2025',
        expiredDate: '10-06-2026',
        receive: 22,
        available: 18,
        location: 'Khu D',
        wareId: 'WH126',
    },
    {
        sbu: 'SPG005',
        macDate: '01-07-2025',
        expiredDate: '01-07-2026',
        receive: 18,
        available: 12,
        location: 'Khu E',
        wareId: 'WH127',
    },
    {
        sbu: 'SPG006',
        macDate: '12-08-2025',
        expiredDate: '12-08-2026',
        receive: 27,
        available: 21,
        location: 'Khu F',
        wareId: 'WH128',
    },
    {
        sbu: 'SPG007',
        macDate: '23-09-2025',
        expiredDate: '23-09-2026',
        receive: 35,
        available: 30,
        location: 'Khu G',
        wareId: 'WH129',
    },
    {
        sbu: 'SPG008',
        macDate: '05-10-2025',
        expiredDate: '05-10-2026',
        receive: 40,
        available: 38,
        location: 'Khu H',
        wareId: 'WH130',
    },
    {
        sbu: 'SPG009',
        macDate: '17-11-2025',
        expiredDate: '17-11-2026',
        receive: 16,
        available: 10,
        location: 'Khu I',
        wareId: 'WH131',
    },
    {
        sbu: 'SPG010',
        macDate: '28-12-2025',
        expiredDate: '28-12-2026',
        receive: 50,
        available: 45,
        location: 'Khu J',
        wareId: 'WH132',
    },
];

const ProductDetail = ({ data, classname, onClose }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const [showQRCode, setShowQRCode] = useState(false)
    const qrCodeRef = useRef();

    const handleOnChange = useCallback((page, pageSize) => {
        setCurrentPage(page);
    }, []);

    const handleCloseQRCodePreview = useCallback(() => {
        return setShowQRCode(prev => !prev)
    }, [])

    const handleDownloadQRCode = () => {
        const a = document.createElement("a")
        a.href = qrCodeRef.current.src
        a.download = `${Date.now()}-qrcode.png`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a);
    }
    
    return (
        <>
            <Modal isOpenInfo={true} onClose={onClose}>
                <div
                    className={cx('wrapper-product-detail', {
                        [classname]: classname,
                    })}
                >
                    <div className={cx('header')}>
                        <h1>Chi tiết sản phẩm</h1>
                        <Button small primary leftIcon={<QrCode size={20} />} onClick={handleCloseQRCodePreview}>
                            <span>QR Code</span>
                        </Button>
                    </div>
                    <div className={cx('product-content')}>
                        <div className={cx('wrapper-image-product')}>
                            <Image
                                src={
                                    data.image ||
                                    'https://marketplace.canva.com/EAFALM0AfOs/1/0/900w/canva-m%C3%A0u-n%C3%A2u-be-h%C3%ACnh-n%E1%BB%81n-%C4%91i%E1%BB%87n-tho%E1%BA%A1i-d%E1%BB%85-th%C6%B0%C6%A1ng-y%C3%AAu-%C4%91%E1%BB%9Di-iSucd-62myg.jpg'
                                }
                                alt="image-product"
                                classname={cx('image-product')}
                            />
                        </div>
                        <div className={cx('product-info')}>
                            <RowItem firstTitle="Mã nhóm sản phẩm" firstValue={data.skug} />
                            <RowItem
                                firstTitle="Mã sản phẩm"
                                firstValue={data.sku}
                                secondTitle="Tên sản phẩm"
                                secondValue={data.productName}
                            />
                            <RowItem firstTitle="Mô tả" firstValue={data.des} />
                            <RowItem
                                firstTitle="Đơn giá"
                                firstValue={data.price}
                                secondTitle="Đơn vị tính"
                                secondValue={data.unit}
                            />
                            <RowItem firstTitle="Mã nhà cung cấp" firstValue={data.supplierId} />
                        </div>
                    </div>
                    <div className={cx('batch')}>
                        <h2>Danh sách lô hàng</h2>
                        <MyTable
                            columns={tableColumns}
                            data={data.listBatch.length > 0 ? data.listBatch : []}
                            className={cx('my-table')}
                            pagination
                            pageSize={3}
                            onChangePage={handleOnChange}
                            currentPage={currentPage}
                        />
                    </div>
                </div>
            </Modal>
            {showQRCode && <Modal isOpenInfo={true} onClose={handleCloseQRCodePreview}>
                <div className={cx('wrapper-qrcode')}>
                    <h2>QRCode sản phẩm</h2>
                    <div className={cx('qrcode-preview')}>
                        <Image ref={qrCodeRef} classname={cx('qrcode')} src={'https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/QR_Code_Example.svg/368px-QR_Code_Example.svg.png'}/>
                    </div>
                    <Button className={cx('download-qrcode')} rounded text medium primary onClick={handleDownloadQRCode}>
                        <a>Tải xuống</a>
                    </Button>
                </div>
            </Modal>}
        </>
    );
};

export default ProductDetail;
