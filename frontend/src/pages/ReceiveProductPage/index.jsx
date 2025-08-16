import React from 'react';
import classNames from 'classnames/bind';
import styles from './ReceiveProductPage.module.scss'

const cx = classNames.bind(styles)

const ReceiveProductPage = () => {
    return (
        <div className={cx('wrapper-receive-product')}>
            <h1>Receive Product</h1>
        </div>
    );
}

export default ReceiveProductPage;