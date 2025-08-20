import React, { useEffect, useState } from 'react';
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
    ShoppingCart,
    BookMinus,
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
            id: 1,
            title: 'Dashboard',
            iconName: LayoutDashboard,
            path: '/',
        },
        {
            id: 2,
            title: 'Quản lý sản phẩm',
            iconName: ShoppingCart,
            subMenu: [
                {
                    title: 'Sản phẩm',
                    iconName: ShoppingBasket,
                    path: '/products',
                },
                {
                    title: 'Quản lý lô hàng',
                    iconName: ShoppingBasket,
                    path: '/batch',
                },
            ],
        },
        {
            id: 3,
            title: 'Quản lý nhập xuất',
            iconName: BookMinus,
            // path: '/ware-receive',
            subMenu: [
                {
                    title: 'Tạo phiếu đề xuất',
                    iconName: CircleArrowRight,
                    path: '/proposal',
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
                    title: 'Chuyển kho',
                    iconName: Truck,
                    path: '/ware-transfer',
                },
            ],
        },
        {
            id: 4,
            title: 'Quản lý đối tác',
            iconName: BookMinus,
            subMenu: [
                {
                    title: 'Khách hàng',
                    iconName: Users,
                    path: '/customer',
                },
                {
                    title: 'Nhà cung cấp',
                    iconName: Factory,
                    path: '/supplier',
                },
                {
                    title: 'Đổi trả',
                    iconName: Undo2,
                    path: '/return-order',
                },
            ],
        },
        {
            id: 5,
            title: 'Quản lý kho',
            iconName: Warehouse,
            subMenu: [
                {
                    title: 'Kiểm kê kho',
                    iconName: CalendarCheck,
                    path: '/check-inventory',
                },

                {
                    title: 'Nhân sự',
                    iconName: User,
                    path: '/auth',
                },
                {
                    title: 'Quản lý khu vực',
                    iconName: Warehouse,
                    path: '/zone',
                },
            ],
        },
    ];

    let location = useLocation();
    const [isOpenInfo, setIsOpenInfo] = useState(false);
    const [itemDrop, setItemDrop] = useState([]);

    const closeInfoWarehouse = () => {
        setIsOpenInfo(false);
    };

    const changeDropItem = (ids) => {
        setItemDrop([...ids]);
    };

    useEffect(() => {
        console.log(itemDrop);
    }, [itemDrop]);

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
                                changeDropItem={changeDropItem}
                                itemDrop={itemDrop}
                                key={index}
                                id={item.id}
                                title={item.title}
                                iconName={item.iconName}
                                path={item.path}
                                location={location.pathname}
                                subMenu={item?.subMenu}
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
