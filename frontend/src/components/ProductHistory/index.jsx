import React, { useEffect, useState } from 'react';
import classNames from 'classnames/bind';
import styles from './ProductHistory.module.scss';
import Modal from '../Modal';
import Button from '../Button';
import toast from 'react-hot-toast';
import { ModalUpdate } from '@/components';
import { getLogByProductID } from '../../services/productquantitylog.service';
import { typeTransaction } from '../../constants';
import { convertDateVN } from '../../common';

const cx = classNames.bind(styles);

const ProductHistory = ({ data, onClose }) => {
    const [logs, setLogs] = useState([]);
    useEffect(() => {
        const fecthData = async () => {
            const res = await getLogByProductID(data);

            if (res.data?.status === 'OK') {
                setLogs(res.data.data);
            }
        };
        fecthData();
    }, []);

    return (
        <Modal showButtonClose={false} isOpenInfo={true} onClose={onClose}>
            <div className={cx('wrapper')}>
                <table className={cx('table')}>
                    <thead>
                        <tr>
                            <th className={cx('stt')}>STT</th>
                            <th className={cx('productName')}>Loại giao dịch</th>
                            <th className={cx('productName')}>Số lượng trước</th>
                            <th className={cx('productName')}>Số lượng sau</th>
                            <th className={cx('productName')}>Số lượng thay đổi</th>
                            <th className={cx('unit')}>Mã giao dịch</th>
                            <th className={cx('unit')}>Ngày giao dịch</th>
                            <th className={cx('unit')}>Người tạo giao dịch</th>
                            <th className={cx('note')}>Ghi chú</th>
                        </tr>
                    </thead>
                    <tbody>
                        {logs.map((item, index) => (
                            <tr key={index}>
                                <td>{index + 1}</td>
                                <td className={cx('stt')}>{typeTransaction[item.actionType]}</td>
                                <td className={cx('productName')}>{item.previousAmount}</td>
                                <td className={cx('productName')}>{item.newAmount}</td>
                                <td className={cx('productName')}>{item.quantityChange}</td>
                                <td className={cx('unit')}>{item.referenceID}</td>
                                <td className={cx('unit')}>{convertDateVN(item.createdAt)}</td>
                                <td className={cx('unit')}>{item.employeeName}</td>
                                <td className={cx('note')}>{item.note}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </Modal>
    );
};

export default ProductHistory;
