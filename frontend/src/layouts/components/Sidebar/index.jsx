import React, { useState } from 'react';
import classNames from 'classnames/bind';
import styles from './Sidebar.module.scss';
import SidebarItem from './SidebarItem';
import {
    Settings,
    User,
    LayoutDashboard,
    ShoppingBasket,
    CircleArrowLeft,
    CircleArrowRight,
    ClipboardMinus,
    Undo2,
    CalendarCheck,
    Truck,
    Warehouse,
    Factory,
    ShieldX,
    Info,
    Users,
} from 'lucide-react';
import logo from '../../../assets/logo_v2.jpg';
import { useLocation } from 'react-router-dom';
import { Modal } from '@/components';
import { InfoWare } from '@/components';

const shopName = import.meta.env.VITE_SOFTWARE_NAME;
const cx = classNames.bind(styles);

const Sidebar = () => {
    const sidebarMenu = [
        {
            title: 'Dashboard',
            iconName: LayoutDashboard,
            path: '/',
        },
        {
            title: 'Sản phẩm',
            iconName: ShoppingBasket,
            path: '/products',
        },
        {
            title: 'Nhập kho',
            iconName: CircleArrowRight,
            path: '/ware-receive',
        },
        {
            title: 'Xuất kho',
            iconName: CircleArrowLeft,
            path: '/ware-release',
        },
        {
            title: 'Kiểm kê kho',
            iconName: CalendarCheck,
            path: '/check-inventory',
        },
        {
            title: 'Khách hàng',
            iconName: Users,
            path: '/customer',
        },
        {
            title: 'Đổi trả',
            iconName: Undo2,
            path: '/return-order',
        },
        {
            title: 'Nhân sự',
            iconName: User,
            path: '/auth',
        },
        {
            title: 'Nhà cung cấp',
            iconName: Factory,
            path: '/supplier',
        },
        {
            title: 'Quản lý hàng lỗi',
            iconName: ShieldX,
            path: '/product-error',
        },
        {
            title: 'Chuyển kho',
            iconName: Truck,
            path: '/ware-transfer',
        },
        {
            title: 'Quản lý kho',
            iconName: Warehouse,
            path: '/manage-warehouse',
        },
    ];

    let location = useLocation();
    const [isOpenInfo, setIsOpenInfo] = useState(false);

    const closeInfoWarehouse = () => {
        setIsOpenInfo(false);
    };

    return (
        <>
            <div className={cx('wrapper-sidebar')}>
                <div className={cx('sidebar-content')}>
                    <div className={cx('info-user')}>
                        <img src={logo} className={cx('logo-sidebar')} loading="lazy" />
                        <div className={cx('ware-brand')}>
                            <h1 className={cx('username')}>{shopName}</h1>
                            <Info className={cx('icon')} size={16} onClick={() => setIsOpenInfo(true)} />
                        </div>
                    </div>
                    <div className={cx('sidebar-list')}>
                        {sidebarMenu.map((item, index) => (
                            <SidebarItem
                                key={index}
                                title={item.title}
                                iconName={item.iconName}
                                path={item.path}
                                location={location.pathname}
                            />
                        ))}
                    </div>
                </div>
            </div>
            <Modal isOpenInfo={isOpenInfo} onClose={closeInfoWarehouse}>
                <InfoWare
                    warehouseId="WH001"
                    warehouseName="Kho A"
                    faxNumber="123456789"
                    address="123 Đường ABC, Quận 1, TP.HCM"
                    status="ACTIVE"
                />
            </Modal>
        </>
    );
};

export default Sidebar;
