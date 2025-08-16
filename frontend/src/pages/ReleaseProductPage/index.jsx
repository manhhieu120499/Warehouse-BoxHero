import React from 'react';
import classNames from 'classnames/bind';
import styles from './ReleaseProductPage.module.scss'

const cx = classNames.bind(styles)

const ReleaseProductPage = () => {
    return (
        <div className={cx('wrapper-release-product')}>
            <h1>Release Product</h1>
        </div>
    );
}

export default ReleaseProductPage;