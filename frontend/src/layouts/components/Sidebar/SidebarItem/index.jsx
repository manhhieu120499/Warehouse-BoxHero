import React, { Fragment, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import classNames from 'classnames/bind';
import styles from './SidebarItem.module.scss';

const cx = classNames.bind(styles);

const SidebarItem = ({ title, iconName, path, location, subMenu=[] }) => {
    const Icon = iconName ? iconName : Fragment;
    const [dropDown, setDropDown] = useState(false)
    const divRef = useRef();
    const handleScrollSubmenu = () => {
        const checkDrop = !dropDown;
        if(checkDrop) {
            divRef.current.style.height = divRef.current.scrollHeight + 'px';
            divRef.current.style.animation= `slice 1s ease-in-out`;
            // divRef.current.style.display= 'flex';
            // divRef.current.style.flexDirection= 'column';
            // divRef.current.style.alignItems= 'center';
        }else {
            divRef.current.style.height =  '35px';
            // divRef.current.style.display= 'block';
            // divRef.current.style.flexDirection= 'none';
            // divRef.current.style.alignItems= 'none';
        }
        setDropDown(prev => !prev)
    }
    return (
        <>
            {subMenu.length > 0 ? (
                <div ref={divRef} className={cx('wrapper-menu-route')}>
                    <div className={cx('header-submenu')} onClick={handleScrollSubmenu}>
                        {iconName && <Icon size={18} />}
                        <span className={cx('title')}>{title}</span>
                    </div>
                    {subMenu.map((subItem) => {
                        const SubIcon = subItem.iconName ? subItem.iconName : Fragment
                        return <Link
                            to={`${subItem.path}`}
                            className={cx('wrapper-link', {
                                active: subItem.path == location,
                                submenu: true
                            })}
                        >
                            {subItem.iconName && <SubIcon size={18} />}
                            <span className={cx('title')}>{subItem.title}</span>
                        </Link>
                    })}
                </div>
            ) : (
                <Link
                    to={`${path}`}
                    className={cx('wrapper-link', {
                        active: path == location,
                    })}
                >
                    {iconName && <Icon size={18} />}
                    <span className={cx('title')}>{title}</span>
                </Link>
            )}
        </>
    );
};

export default SidebarItem;
