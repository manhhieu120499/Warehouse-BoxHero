import React, { Fragment } from 'react';
import { Link } from 'react-router-dom';
import classNames from 'classnames/bind';
import styles from './SidebarItem.module.scss';

const cx = classNames.bind(styles);

const SidebarItem = ({ title, iconName, path, location }) => {
    const Icon = iconName ? iconName : Fragment;
    return (
        <Link
            to={`${path}`}
            className={cx('wrapper-link', {
                active: path == location,
            })}
        >
            {iconName && <Icon size={18} />}
            <span className={cx('title')}>{title}</span>
        </Link>
    );
};

export default SidebarItem;
