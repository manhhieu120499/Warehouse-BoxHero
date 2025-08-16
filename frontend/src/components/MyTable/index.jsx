import { Table } from 'antd';
import classNames from 'classnames/bind';
import styles from './MyTable.module.scss';
const cx = classNames.bind(styles);
const PAGESIZE = import.meta.env.PAGE_SIZE;

export default function MyTable({
    columns,
    data,
    className,
    pagination = false,
    pageSize = PAGESIZE,
    onChangePage,
    currentPage = 1,
    rowSelection = null,
    ...props
}) {
    return (
        <Table
            rowKey="key"
            columns={columns}
            dataSource={data}
            className={cx('custom-table', className)}
            rowSelection={rowSelection}
            {...props}
            pagination={
                pagination && {
                    pageSize, // số dòng mỗi trang
                    current: currentPage, // trang hiện tại (controlled)
                    total: data.length, // tổng số dòng (nếu dùng server side)
                    position: ['bottomRight'], // vị trí thanh trang
                    onChange: (page, pageSize) => {
                        onChangePage(page, pageSize);
                    },
                }
            }
            components={{
                header: {
                    cell: (props) => (
                        <th
                            {...props}
                            style={{
                                background: '#333',
                                color: '#fff',
                                textAlign: 'center',
                                ...props.style,
                                padding: '8px',
                            }}
                        >
                            {props.children}
                        </th>
                    ),
                },
                body: {
                    cell: (props) => (
                        <td
                            {...props}
                            style={{
                                padding: '6px',
                                fontSize: '1.4rem',
                                paddingLeft: '12px',
                                ...props.style,
                            }}
                        >
                            {props.children}
                        </td>
                    ),
                },
            }}
        />
    );
}
