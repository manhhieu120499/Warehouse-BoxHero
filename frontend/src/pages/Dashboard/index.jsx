import React, { useState, useEffect } from 'react';
import classNames from 'classnames/bind';
import styles from './Dashboard.module.scss';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    LineChart,
    Line,
    AreaChart,
    Area,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
} from 'recharts';
import { Button } from '@/components';
import { getStatisticalImportExport, getStatisticalInventory } from '../../services/dashboard.service';
import { formatStatusProduct } from '../../constants';
import MyTable from '../../components/MyTable';

const cx = classNames.bind(styles);

const Dashboard = () => {
    const [timeInventoryImportExportAndInventory, setTimeInventoryImportExportAndInventory] = useState('MONTH');

    // Phần fix dữ liệu tạm cho batch
    // 🔹 Dữ liệu giả cho lô
    const batchData = [
        { name: 'Lô sắp hết hạn', value: 5, key: 'expiringSoon' },
        { name: 'Lô còn hạn sử dụng dài', value: 20, key: 'longTerm' },
        { name: 'Lô đã hết hạn', value: 3, key: 'expired' },
    ];

    // 🔹 Dữ liệu chi tiết mẫu
    const allBatchDetails = {
        expiringSoon: [
            {
                batchID: 'B001',
                productName: 'Sữa tươi Vinamilk',
                supplier: 'Vinamilk Co.',
                manufactureDate: '2024-10-01',
                expiryDate: '2025-11-01',
                remainAmount: 200,
                status: 'AVAILABLE',
            },
            {
                batchID: 'B002',
                productName: 'Pepsi',
                supplier: 'Pepsi VN',
                manufactureDate: '2024-05-01',
                expiryDate: '2025-10-15',
                remainAmount: 150,
                status: 'AVAILABLE',
            },
        ],
        longTerm: [
            {
                batchID: 'B003',
                productName: 'Gạo ST25',
                supplier: 'Lộc Trời Group',
                manufactureDate: '2024-02-01',
                expiryDate: '2026-09-01',
                remainAmount: 900,
                status: 'AVAILABLE',
            },
            {
                batchID: 'B004',
                productName: 'Nước suối Lavie',
                supplier: 'La Vie',
                manufactureDate: '2024-01-01',
                expiryDate: '2027-02-10',
                remainAmount: 500,
                status: 'AVAILABLE',
            },
        ],
        expired: [
            {
                batchID: 'B005',
                productName: 'Bánh Oreo',
                supplier: 'Mondelez VN',
                manufactureDate: '2023-07-01',
                expiryDate: '2024-06-01',
                remainAmount: 0,
                status: 'EXPIRED',
            },
        ],
    };

    // 🔹 Trạng thái lưu dữ liệu chi tiết đang chọn
    const [selectedType, setSelectedType] = useState(null);
    const [batchTableData, setBatchTableData] = useState([]);

    // 🔹 Hàm xử lý khi click vào cột
    const handleBarClick = (data) => {
        if (data?.activeLabel) {
            const batchType = batchData.find((b) => b.name === data.activeLabel)?.key;
            if (batchType) {
                setSelectedType(data.activeLabel);
                setBatchTableData(allBatchDetails[batchType] || []);
            }
        }
    };

    const batchTableColumns = [
        { title: 'Mã lô', dataIndex: 'batchID', key: 'batchID' },
        { title: 'Tên sản phẩm', dataIndex: 'productName', key: 'productName' },
        { title: 'Nhà cung cấp', dataIndex: 'supplier', key: 'supplier' },
        { title: 'Ngày sản xuất', dataIndex: 'manufactureDate', key: 'manufactureDate' },
        { title: 'Hạn sử dụng', dataIndex: 'expiryDate', key: 'expiryDate' },
        { title: 'Số lượng còn lại', dataIndex: 'remainAmount', key: 'remainAmount' },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: (text) => (
                <span
                    className={cx({
                        'status-available': text === 'AVAILABLE',
                        'status-expired': text === 'EXPIRED',
                        'status-error': text === 'ERROR',
                    })}
                >
                    {formatStatusProduct[text] || text}
                </span>
            ),
        },
    ];

    useEffect(() => {
        const inventoryImportExportAndInventory = async () => {
            if (timeInventoryImportExportAndInventory === 'MONTH') {
                // get current year
                const currentYear = new Date().getFullYear();
                // call api
                const res = await getStatisticalInventory('MONTH', currentYear);
                if (res?.data?.status === 'OK') {
                    const resultConvert = res.data.data.map((item) => ({
                        date: item.month,
                        stock: item.totalQuantity,
                    }));
                    setStockFluctuation(resultConvert);
                }
                const resImportExport = await getStatisticalImportExport('MONTH', currentYear);
                if (resImportExport?.data?.status === 'OK') {
                    setImportExportData(resImportExport?.data?.data);
                }
            } else if (timeInventoryImportExportAndInventory === 'YEAR') {
                const currentYear = new Date().getFullYear();
                const res = await getStatisticalInventory('YEAR');
                if (res?.data?.status === 'OK') {
                    const resultConvert = res.data.data.map((item) => ({
                        date: item.year,
                        stock: item.totalQuantity,
                    }));
                    setStockFluctuation(resultConvert);
                }
                const resImportExport = await getStatisticalImportExport('YEAR');
                if (resImportExport?.data?.status === 'OK') {
                    setImportExportData(resImportExport?.data?.data);
                }
            }
        };
        inventoryImportExportAndInventory();
    }, [timeInventoryImportExportAndInventory]);

    const [importExportData, setImportExportData] = useState();

    const [stockFluctuation, setStockFluctuation] = useState();

    const tableColumns = [
        {
            title: 'Tên nhóm sản phẩm',
            dataIndex: 'skgu',
            key: 'skgu',
        },
        {
            title: 'Mã sản phẩm',
            dataIndex: 'sku',
            key: 'sku',
        },
        {
            title: 'Tên sản phẩm',
            dataIndex: 'productName',
            key: 'productName',
        },
        {
            title: 'Tồn kho tối thiểu',
            dataIndex: 'minStock',
            key: 'minStock',
            render: (text) => <p className={cx('min-stock-product')}>{text}</p>,
        },
        {
            title: 'Tổng lượng tồn kho',
            dataIndex: 'totalStock',
            key: 'totalStock',
            render: (text) => <p className={cx('total-stock-product')}>{text}</p>,
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: (text) => <p className={cx('status-product')}>{formatStatusProduct[text]}</p>,
        },
    ];

    return (
        <div className={cx('wrapper-dashboard')}>
            {/* Biểu đồ tổng quan tình trạng kho */}
            <div className={cx('chart-card')}>
                <h3>Mức sử dụng kho</h3>

                <ResponsiveContainer width="100%" height={320}>
                    <PieChart>
                        <Pie
                            data={[
                                { name: 'Đã sử dụng', value: 75 },
                                { name: 'Còn trống', value: 25 },
                            ]}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={120}
                            innerRadius={70}
                            fill="#8884d8"
                            dataKey="value"
                            label={({ name, value }) => `${name}: ${value}%`}
                        >
                            <Cell key="used" fill="#FF7043" />
                            <Cell key="free" fill="#4CAF50" />
                        </Pie>
                        <Tooltip formatter={(value, name) => [`${value}%`, name]} />
                        <Legend verticalAlign="bottom" align="center" />
                    </PieChart>
                </ResponsiveContainer>
            </div>

            <div className={cx('chart-card')}>
                <div className={cx('filter-time')}>
                    <h3>Thống kê sản phẩm:</h3>
                    <select
                        className={cx('select-time')}
                        // value={timeInventoryImportExportAndInventory}
                        // onChange={(e) => setTimeInventoryImportExportAndInventory(e.target.value)}
                    >
                        <option value="productRelease">Sản phẩm xuất nhiều</option>
                        <option value="productOld">Sản phẩm tồn lâu</option>
                        <option value="productLow">Sản phẩm tồn kho thấp</option>
                    </select>
                </div>
                <div className={cx('table-container')}>
                    <MyTable
                        className={cx('my-table')}
                        columns={tableColumns}
                        // data={productList}
                        //pageSize={5}
                        //pagination
                        // onChangePage={handleOnChange}
                        //currentPage={currentPage}
                    />
                </div>
            </div>

            {/* Viết phần thống kê lô */}
            <div className={cx('chart-card')}>
                <h3>Thống kê lô:</h3>
                <div className={cx('batch-statistics')}>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart className={cx('bar-chart')} data={batchData} onClick={handleBarClick}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip formatter={(value) => [`${value} lô`, 'Số lượng']} />
                            <Legend />
                            <Bar dataKey="value" fill="#4CAF50" name="Số lượng lô" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                <div className={cx('table-container')}>
                    <h3 className={cx('chart-title')}>
                        {selectedType ? `Chi tiết ${selectedType}` : 'Chọn loại lô để xem chi tiết'}
                    </h3>
                    <MyTable className={cx('my-table')} columns={batchTableColumns} data={batchTableData} />
                </div>
            </div>

            {/* Biểu đồ so sánh nhập xuất */}
            <div className={cx('chart-card')}>
                <div className={cx('filter-time')}>
                    <h3>Lọc theo thời gian:</h3>
                    <select
                        className={cx('select-time')}
                        value={timeInventoryImportExportAndInventory}
                        onChange={(e) => setTimeInventoryImportExportAndInventory(e.target.value)}
                    >
                        <option value="MONTH">Tháng</option>
                        <option value="YEAR">Năm</option>
                    </select>
                </div>

                <h3 className={cx('chart-title')}>Biểu Đồ So Sánh Nhập/Xuất Kho</h3>
                <ResponsiveContainer width="100%" height={350}>
                    <AreaChart data={importExportData}>
                        <defs>
                            <linearGradient id="importColor" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#4CAF50" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="#4CAF50" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="exportColor" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#FF7043" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="#FF7043" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <XAxis
                            dataKey="date"
                            label={{
                                value: `Thời gian (${
                                    timeInventoryImportExportAndInventory === 'MONTH' ? 'Tháng' : 'Năm'
                                })`,
                                position: 'insideBottom',
                                offset: -5,
                            }}
                        />
                        <YAxis
                            label={{
                                value: 'Số lượng tồn kho (đơn vị cơ bản)',
                                angle: -90,
                                position: 'insideLeft',
                                offset: 10,
                                style: { textAnchor: 'middle' },
                            }}
                        />
                        <CartesianGrid strokeDasharray="3 3" />
                        <Tooltip
                            formatter={(value, name) => {
                                // name sẽ là "Nhập kho" hoặc "Xuất kho"
                                return [`${value.toLocaleString()}`, name];
                            }}
                            labelFormatter={(label) =>
                                `${timeInventoryImportExportAndInventory === 'MONTH' ? 'Tháng' : 'Năm'} ${label}`
                            }
                        />
                        <Legend verticalAlign="bottom" align="center" wrapperStyle={{ paddingTop: 20 }} /> {/* 👈 */}
                        <Area
                            type="monotone"
                            dataKey="import"
                            stroke="#4CAF50"
                            fillOpacity={1}
                            fill="url(#importColor)"
                            name="Nhập kho"
                        />
                        <Area
                            type="monotone"
                            dataKey="export"
                            stroke="#FF7043"
                            fillOpacity={1}
                            fill="url(#exportColor)"
                            name="Xuất kho"
                        />
                    </AreaChart>
                </ResponsiveContainer>
                <h3 className={cx('chart-title')}>
                    Biểu Động Tồn Kho ({timeInventoryImportExportAndInventory === 'MONTH' ? 'Tháng' : 'Năm'})
                </h3>
                <ResponsiveContainer width="100%" height={350}>
                    <AreaChart data={stockFluctuation} margin={{ top: 10, right: 30, left: 0, bottom: 40 }}>
                        <defs>
                            <linearGradient id="stockColor" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#2196F3" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="#2196F3" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <XAxis
                            dataKey="date"
                            label={{
                                value: `Thời gian (${
                                    timeInventoryImportExportAndInventory === 'MONTH' ? 'Tháng' : 'Năm'
                                })`,
                                position: 'insideBottom',
                                offset: -5,
                            }}
                        />
                        <YAxis
                            label={{
                                value: 'Số lượng tồn kho (đơn vị cơ bản)',
                                angle: -90,
                                position: 'insideLeft',
                                offset: 10,
                                style: { textAnchor: 'middle' },
                            }}
                        />
                        <CartesianGrid strokeDasharray="3 3" />
                        <Tooltip
                            formatter={(value) => [`${value}`, 'Số lượng tồn kho']}
                            labelFormatter={(label) =>
                                `${timeInventoryImportExportAndInventory === 'MONTH' ? 'Tháng' : 'Năm'} ${label}`
                            }
                        />
                        <Legend verticalAlign="bottom" align="center" wrapperStyle={{ paddingTop: 20 }} /> {/* 👈 */}
                        <Area
                            type="monotone"
                            dataKey="stock"
                            stroke="#2196F3"
                            fillOpacity={1}
                            fill="url(#stockColor)"
                            name="Tồn kho"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default Dashboard;
