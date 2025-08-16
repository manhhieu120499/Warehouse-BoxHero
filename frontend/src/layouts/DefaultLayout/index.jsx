import React, { useEffect, useState } from 'react';
import classNames from 'classnames/bind';
import styles from './DefaultLayout.module.scss';
import { Sidebar } from '../components';
import Header from '../components/Header';
import PageLayout from '../PageLayout';
import { Bot } from 'lucide-react';
import { ChatBox } from '@/components';
import { Spin } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { post } from '../../utils/httpRequest';
import { login } from '../../lib/redux/auth/authSlice';
import { jwtDecode } from 'jwt-decode';
import EmployeeDTO from '../../dtos/EmployeeDTO';

const cx = classNames.bind(styles);

const DefaultLayout = ({ children }) => {
    const [showChatBox, setShowChatBox] = useState(false);
    const { statusLoading } = useSelector((state) => state.LoadingSlice);
    const dispatch = useDispatch();

    useEffect(() => {
        const fetchUser = async (accessToken, email, employeeID) => {
            try {
                const { roles } = jwtDecode(accessToken).payload;
                const responseUser = await post(
                    '/api/employee/employee-detail',
                    {
                        email: email,
                        employeeID,
                    },
                    accessToken,
                );
                const {employee} = responseUser
                dispatch(login({ ...new EmployeeDTO({ ...employee, roles }) }));
            } catch (err) {
                console.log(err);
            }
        };
        const tokenUser = localStorage.getItem('tokenUser');
        if (tokenUser != null) {
            const { employeeID, email, accessToken, refreshToken } = JSON.parse(localStorage.getItem('tokenUser'));
            fetchUser(accessToken, email, employeeID);
        }
    }, []);
    return (
        <div className={cx('wrapper-layout')}>
            <Header />
            <Sidebar />
            <div className={cx('container-content')}>
                <PageLayout>{children}</PageLayout>
            </div>

            <ChatBox classnames={'show'} isOpen={showChatBox} closed={() => setShowChatBox((prev) => !prev)} />

            <button className={cx('btn-show-chat-box')} onClick={() => setShowChatBox((prev) => !prev)}>
                <Bot size={30} color={'white'} />
                <p className={cx('title-chat-box')}>Trợ lý</p>
            </button>
            {statusLoading && (
                <div className={cx('overlay-loading')}>
                    <Spin size="large" />
                </div>
            )}
        </div>
    );
};

export default DefaultLayout;
