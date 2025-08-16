import React from 'react';
import classNames from 'classnames/bind';
import styles from './CheckPage.module.scss'

const cx = classNames.bind(styles)

const CheckPage = () => {
    return (
        <div className={cx('wrapper-check')}>
            <h1>Check Inventory</h1>
        </div>
    );
}

export default CheckPage;