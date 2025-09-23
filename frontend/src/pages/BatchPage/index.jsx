import React, { use, useEffect, useState } from 'react';
import classNames from 'classnames/bind';
import styles from './BatchPage.module.scss';
import Button from '../../components/Button';
import { getAllShelfOfWarehouse } from '../../services/shelf.service';
import parseToken from '@/utils/parseToken';
import Tippy from '@tippyjs/react';

const cx = classNames.bind(styles);

const BatchPage = () => {
    const [shelvesData, setShelvesData] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            const token = parseToken('tokenUser');
            const warehouse = parseToken('warehouse');

            const headers = {
                token: `Bearer ${token.accessToken}`,
                employeeID: token.employeeID,
                warehouseID: warehouse.warehouseID,
            };
            const data = await getAllShelfOfWarehouse({
                warehouseID: warehouse.warehouseID,
                headers,
            });
            if (data.status === 'OK') {
                setShelvesData(data.data);
            }
        };
        fetchData();
    }, []);

    return (
        <div className={cx('warehouse-map')}>
            {/* BÊN TRÁI */}
            <div className={cx('left-panel')}>
                <div className={cx('packing-area')}>
                    <Button
                        onClick={() => {
                            console.log(1);
                        }}
                        className={cx('button')}
                    >
                        KHU VỰC KHO TẠM
                    </Button>
                </div>
                <div className={cx('toilet')}>
                    <div className={cx('toilet-room')}>WC Nam</div>
                    <div className={cx('toilet-room')}>WC Nữ</div>
                </div>
            </div>

            {/* KHU CHÍNH */}
            <div className={cx('main-panel')}>
                {shelvesData.map((shelf) => {
                    return (
                        <div className={cx('shelf')} key={shelf.shelfID}>
                            {shelf.floor?.map((column, index) => {
                                return (
                                    <div className={cx('floor')} key={index}>
                                        {column.boxes.map((box, colIndex) => {
                                            return (
                                                <div>
                                                    <Tippy key={colIndex} content={`${box.boxName}`}>
                                                        <Button className={cx('box')}></Button>
                                                    </Tippy>
                                                    <span>{box.boxID}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                );
                            })}
                        </div>
                    );
                })}
            </div>

            {/* Mũi tên điều hướng */}
            <div className={cx('arrow')}></div>
            <div className={cx('arrow-2')}>
                <span>HƯỚNG DI CHUYỂN CỦA XE NÂNG</span>
            </div>
            <div className={cx('arrow-3')}>
                <span>HƯỚNG DI CHUYỂN CỦA XE NÂNG</span>
            </div>

            {/* BÊN DƯỚI */}
            <div className={cx('export-area')}>
                <Button
                    onClick={() => {
                        console.log(1);
                    }}
                    className={cx('button')}
                >
                    KHU VỰC HÀNG CHỜ XUẤT
                </Button>
            </div>
            <div className={cx('import-area')}>
                <Button
                    onClick={() => {
                        console.log(1);
                    }}
                    className={cx('button')}
                >
                    KHU VỰC CHỜ NHẬP HÀNG
                </Button>
            </div>
        </div>
    );
};

export default BatchPage;
