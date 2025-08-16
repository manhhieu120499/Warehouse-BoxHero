import React, { useState } from 'react';
import classNames from 'classnames/bind';
import styles from './Dashboard.module.scss';
import { Button, MyTable } from '@/components';

const cx = classNames.bind(styles);

const columns = [
    {
        title: 'Name',
        dataIndex: 'name',
        key: 'name',
    },
    {
        title: 'Age',
        dataIndex: 'age',
        key: 'age',
    },
];

const data = [
    {
        key: '1',
        name: 'Alice',
        age: 24,
    },
    {
        key: '2',
        name: 'Bob',
        age: 27,
    },
    {
        key: '1',
        name: 'Alice',
        age: 24,
    },
    {
        key: '2',
        name: 'Bob',
        age: 27,
    },
    {
        key: '1',
        name: 'Alice',
        age: 24,
    },
    {
        key: '2',
        name: 'Bob',
        age: 27,
    },
    {
        key: '1',
        name: 'Alice',
        age: 24,
    },
    {
        key: '2',
        name: 'Bob',
        age: 27,
    },
];

const Dashboard = () => {
    const [currentPage, setCurrentPage] = useState(1);

    const onChangePage = (page, pageSize) => {
        console.log(`Page: ${page}, Page Size: ${pageSize}`);
        setCurrentPage(page);
    };

    return (
        <div className={cx('wrapper-dashboard')}>
            <h1>Dashboard</h1>
            <Button rounded medium>
                {' '}
                Test{' '}
            </Button>
            <MyTable
                className={cx('my-table')}
                columns={columns}
                data={data}
                pagination
                pageSize={5}
                onChangePage={onChangePage}
                currentPage={currentPage}
            />
        </div>
    );
};

export default Dashboard;
