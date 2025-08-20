import React from 'react';
import classNames from 'classnames/bind';
import styles from './BatchPage.module.scss';

const cx = classNames.bind(styles);

const BatchPage = () => {
    return (
        <div className={cx('wrapper-batch')}>
            <h1>Quản lý lô hàng</h1>
        </div>
    );
}

export default BatchPage;