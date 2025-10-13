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
} from 'recharts';
import { Button } from '@/components';
import { getStatisticalInventory } from '../../services/dashboard.service';

const cx = classNames.bind(styles);

const Dashboard = () => {
    const [timeInventoryImportExportAndInventory, setTimeInventoryImportExportAndInventory] = useState('MONTH');

    useEffect(() => {
        const InventoryImportExportAndInventory = async () => {
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
            } else if (timeInventoryImportExportAndInventory === 'YEAR') {
                const currentYear = new Date().getFullYear();
                const res = await getStatisticalInventory('YEAR', currentYear);
                console.log(res);
            }
        };
        InventoryImportExportAndInventory();
    }, [timeInventoryImportExportAndInventory]);

    const [warehouseOverview, setWarehouseOverview] = useState([
        { name: 'Tổng SL tồn kho', value: 1800 },
        { name: 'SL nhập kho', value: 3700 },
        { name: 'SL xuất kho', value: 1200 },
    ]);

    const [importExportData, setImportExportData] = useState([
        { date: '01/10', import: 200, export: 150 },
        { date: '05/10', import: 450, export: 300 },
        { date: '10/10', import: 150, export: 100 },
        { date: '15/10', import: 500, export: 320 },
        { date: '20/10', import: 700, export: 450 },
    ]);

    const [stockFluctuation, setStockFluctuation] = useState([
        { date: '01/10', stock: 100 },
        { date: '05/10', stock: 250 },
        { date: '10/10', stock: 180 },
        { date: '15/10', stock: 400 },
        { date: '20/10', stock: 520 },
    ]);

    return (
        <div className={cx('wrapper-dashboard')}>
            {/* Biểu đồ tổng quan tình trạng kho */}
            <div className={cx('chart-card')}>
                <h3>Biểu Đồ Tổng Quan Tình Trạng Kho</h3>
                <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={warehouseOverview}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="value" fill="#4CAF50" radius={6} />
                    </BarChart>
                </ResponsiveContainer>
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

                <h3>Biểu Đồ So Sánh Nhập/Xuất Kho</h3>
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
                        <XAxis dataKey="date" />
                        <YAxis />
                        <CartesianGrid strokeDasharray="3 3" />
                        <Tooltip />
                        <Legend />
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
                <h3>Biểu Động Tồn Kho (Tháng)</h3>
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
                            formatter={(value, name, props) => [`${value}`, 'Số lượng tồn kho']}
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
