import React from 'react';
import classNames from 'classnames/bind';
import styles from './ReportPage.module.scss';

const cx = classNames.bind(styles);

const CustomerPage = () => {
    return (
        <div className={cx('wrapper-report')}>
            <h1>Report Product</h1>
        </div>
    );
};

export default CustomerPage;
