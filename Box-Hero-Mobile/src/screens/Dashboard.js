import React, { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator, ScrollView, StyleSheet, Dimensions } from 'react-native';
// 1. Nhập các component từ gifted-charts
import { PieChart, BarChart, LineChart } from 'react-native-gifted-charts';
import {
    getProductLowMinStock,
    getStaticPercentUseWarehouse,
    getStaticTopProduct,
    getStatisticalImportExport,
    getStatisticalInventory,
    getTopFineProductMinExport,
} from '../service/dashboard.service';
import { Dropdown } from 'react-native-element-dropdown';
import { formatStatusProduct } from '../constants';

export default function Dashboard() {
    const [timeInventoryImportExportAndInventory, setTimeInventoryImportExportAndInventory] = useState('MONTH');
    // Dữ liệu PieChart đã đổi tên và cấu trúc
    const [warehouseUsageData, setWarehouseUsageData] = useState([]);
    const [importExportData, setImportExportData] = useState([]);
    const [stockFluctuation, setStockFluctuation] = useState([]);
    const [productList, setProductList] = useState([]);
    const [filterReportProduct, setFilterReportProduct] = useState('productRelease');
    const [loading, setLoading] = useState(false);

    // Helper function to get status badge style
    const getStatusStyle = (status) => {
        switch (status) {
            case 'AVAILABLE':
                return styles.statusAvailable;
            case 'DISCONTINUED':
                return styles.statusDiscontinued;
            case 'OUT_OF_STOCK':
                return styles.statusOutOfStock;
            default:
                return styles.statusDefault;
        }
    };

    // --- 1. PieChart data (Mức sử dụng kho) ---
    useEffect(() => {
        async function fetchPercentUseWarehouse() {
            setLoading(true);
            try {
                const res = await getStaticPercentUseWarehouse();
                // Cấu trúc dữ liệu PieChart của gifted-charts: key, value, color, text (cho legend)
                setWarehouseUsageData([
                    { value: Number(res.percentUsed.percent.toFixed(2)), color: '#FF7043', text: 'Đã dùng' },
                    { value: Number(res.totalRemain.percent.toFixed(2)), color: '#4CAF50', text: 'Còn trống' },
                ]);
            } catch (err) {
                console.log(err);
            }
            setLoading(false);
        }
        fetchPercentUseWarehouse();
    }, []);

    // --- 2. BarChart & AreaChart data (Nhập/Xuất và Tồn kho) ---
    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            const currentYear = new Date().getFullYear();
            let resInventory, resImportExport;

            // Xử lý logic gọi API
            if (timeInventoryImportExportAndInventory === 'MONTH') {
                resInventory = await getStatisticalInventory('MONTH', currentYear);
                resImportExport = await getStatisticalImportExport('MONTH', currentYear);
            } else {
                resInventory = await getStatisticalInventory('YEAR');
                resImportExport = await getStatisticalImportExport('YEAR');
            }

            // Xử lý dữ liệu Tồn Kho (cho LineChart/AreaChart)
            if (resInventory?.data?.status === 'OK') {
                console.log('bar 1', resInventory.data.data);
                // Cấu trúc LineChart/AreaChart: [{ value: Y, label: X }]
                setStockFluctuation(
                    resInventory.data.data.map((item, index) => ({
                        value: Number.parseInt(item.totalQuantity || '0'),
                        label: timeInventoryImportExportAndInventory === 'MONTH' ? `T${index + 1}` : `${item.year}`,
                    })),
                );
            }

            // Xử lý dữ liệu Nhập/Xuất (cho Grouped Bar Chart)
            // if (resImportExport?.data?.status === 'OK') {
            //     // Cấu trúc BarChart (Grouped): [{ stacks: [...] }]
            //     console.log('bar 2', resImportExport.data.data);
            //     setImportExportData(
            //         resImportExport.data.data.map((item, index) => ({
            //             stacks: [
            //                 { value: Number.parseInt(item.import || '0'), color: '#4CAF50' }, // Nhập
            //                 { value: Number.parseInt(item.export || '0'), color: '#FF7043' }, // Xuất
            //             ],
            //             // Label cho trục X (Tháng/Năm)
            //             label: timeInventoryImportExportAndInventory === 'MONTH' ? `T${item.date}` : `${item.date}`,
            //         })),
            //     );
            // }

            // FAKE DATA
            const fakeDataMonth = [
                { date: 1, import: 350, export: 200 },
                { date: 2, import: 280, export: 310 },
                { date: 3, import: 450, export: 400 },
                { date: 4, import: 320, export: 250 },
                { date: 5, import: 500, export: 480 },
                { date: 6, import: 410, export: 350 },
                { date: 7, import: 380, export: 420 },
                { date: 8, import: 560, export: 300 },
                { date: 9, import: 420, export: 490 },
                { date: 10, import: 320, export: 380 },
                { date: 11, import: 590, export: 550 },
                { date: 12, import: 400, export: 450 },
            ];

            setImportExportData(
                fakeDataMonth.map((item) => ({
                    stacks: [
                        { value: item.import, color: '#4CAF50' }, // Nhập
                        { value: item.export, color: '#FF7043' }, // Xuất
                    ],
                    label: `T${item.date}`,
                })),
            );

            setLoading(false);
        }
        fetchData();
    }, [timeInventoryImportExportAndInventory]);

    // --- 3. Product Table data (Thống kê sản phẩm) ---
    useEffect(() => {
        async function filterReportProductFunc(keyword) {
            setLoading(true);
            let res;
            switch (keyword) {
                case 'productRelease':
                    res = await getStaticTopProduct();
                    break;
                case 'productOld':
                    res = await getTopFineProductMinExport();
                    break;
                case 'productLow':
                    res = await getProductLowMinStock();
                    break;
            }
            console.log('res product', res);
            const formatRes =
                res && res.length > 0
                    ? res.map((item) => {
                          const cur = item?.batch || item;
                          return {
                              productName: cur?.product?.productName || cur?.productName,
                              amount: cur?.product?.amount || cur?.amount,
                              status: cur?.product?.status || cur?.status,
                          };
                      })
                    : [];
            setProductList(formatRes);
            setLoading(false);
        }
        console.log('filterReportProduct', filterReportProduct);
        filterReportProductFunc(filterReportProduct);
    }, [filterReportProduct]);

    // if (loading) {
    //     return (
    //         <View style={styles.loading}>
    //             <ActivityIndicator size="large" color="#007bff" />
    //         </View>
    //     );
    // }

    // Biểu diễn các component
    return (
        <View style={styles.container}>
            {/* 1. Mức sử dụng kho (Pie Chart) */}
            <Text style={styles.title}>Mức sử dụng kho</Text>
            {/* Sử dụng component PieChart của gifted-charts */}
            {warehouseUsageData.length > 0 && (
                <View style={styles.barChart}>
                    <PieChart
                        data={warehouseUsageData}
                        donut
                        radius={120}
                        showText
                        centerLabelComponent={() => <Text style={{ fontSize: 15, fontWeight: 'bold' }}>Kho</Text>}
                        // Tắt chú thích nội bộ, tự tạo Legend bên dưới
                        showTextBackground={false}
                    />
                    <View style={styles.legend}>
                        {warehouseUsageData.map((item, index) => (
                            <Text key={index} style={{ color: item.color, fontWeight: 'bold' }}>
                                {item.text}: {item.value}%
                            </Text>
                        ))}
                    </View>
                </View>
            )}
            <View style={styles.separator} />

            {/* 2. Thống kê sản phẩm (Bảng) */}
            <Text style={styles.title}>Thống kê sản phẩm</Text>
            <Dropdown
                data={[
                    { label: 'Sản phẩm xuất nhiều', value: 'productRelease' },
                    { label: 'Sản phẩm xuất ít', value: 'productOld' },
                    { label: 'Sản phẩm tồn kho thấp', value: 'productLow' },
                ]}
                labelField="label"
                valueField="value"
                placeholder="Select item"
                value={filterReportProduct}
                onChange={(item) => {
                    setFilterReportProduct(item.value);
                }}
                style={[styles.dropdown, styles.dropdownStatistic]}
            />
            {/* Hiển thị dữ liệu bảng */}
            <View style={styles.table}>
                <View style={[styles.tableRow, styles.tableHeader]}>
                    <Text style={styles.tableHeaderText}>Tên Sản phẩm</Text>
                    <Text style={[styles.tableHeaderText, styles.tableHeaderCenter]}>Số lượng</Text>
                    <Text style={[styles.tableHeaderText, styles.tableHeaderRight]}>Trạng thái</Text>
                </View>
                {productList.map((item, idx) => (
                    <View key={idx} style={[styles.tableRow, idx % 2 === 0 && styles.tableRowEven]}>
                        <Text style={styles.tableCellName} numberOfLines={2}>
                            {item.productName}
                        </Text>
                        <Text style={styles.tableCellAmount}>{item.amount}</Text>
                        <View style={styles.tableCellStatus}>
                            <View style={[styles.statusBadge, getStatusStyle(item.status)]}>
                                <Text style={styles.statusText}>{formatStatusProduct[item.status] || '-'}</Text>
                            </View>
                        </View>
                    </View>
                ))}
            </View>
            <View style={styles.separator} />

            {/* 3. Biểu Đồ So Sánh Nhập/Xuất Kho (Grouped Bar Chart) */}
            <Text style={styles.title}>Biểu Đồ So Sánh Nhập/Xuất Kho</Text>
            <Dropdown
                data={[
                    { label: 'Tháng', value: 'MONTH' },
                    { label: 'Năm', value: 'YEAR' },
                ]}
                labelField="label"
                valueField="value"
                placeholder="Select item"
                value={timeInventoryImportExportAndInventory}
                onChange={(item) => {
                    setTimeInventoryImportExportAndInventory(item.value);
                }}
                style={styles.dropdown}
            />

            {/* Sử dụng BarChart với prop Grouped hoặc Stacks để so sánh 2 chuỗi dữ liệu */}
            {importExportData.length > 0 && (
                <View style={styles.chartContainer}>
                    <BarChart
                        stackData={importExportData}
                        barWidth={22}
                        spacing={20}
                        height={220}
                        width={Dimensions.get('window').width - 100}
                        showLine
                        curved
                        isAnimated
                        animationDuration={800}
                        // Grid and axes
                        showVerticalLines
                        verticalLinesColor="#e5e7eb"
                        xAxisColor="#9ca3af"
                        yAxisColor="#9ca3af"
                        yAxisTextStyle={{ color: '#6b7280', fontSize: 11 }}
                        xAxisLabelTextStyle={{ color: '#6b7280', fontSize: 11 }}
                        // Spacing
                        initialSpacing={10}
                        endSpacing={10}
                        yAxisLabelWidth={40}
                    />
                </View>
            )}

            <View style={styles.barChartTitle}>
                <View style={styles.barChartTitleItem}>
                    <View style={{ width: 15, height: 15, backgroundColor: '#4CAF50' }} />
                    <Text>Nhập kho</Text>
                </View>
                <View style={styles.barChartTitleItem}>
                    <View style={{ width: 15, height: 15, backgroundColor: '#FF7043' }} />
                    <Text>Xuất kho</Text>
                </View>
            </View>

            <View style={styles.separator} />

            {/* 4. Biến Động Tồn Kho (Area Chart) */}
            <Text style={styles.title}>Biến Động Tồn Kho</Text>
            {/* Sử dụng LineChart và thêm prop areaChart */}
            {stockFluctuation.length > 0 && (
                <View style={styles.chartContainer}>
                    <LineChart
                        data={stockFluctuation}
                        areaChart
                        height={220}
                        width={Dimensions.get('window').width - 120}
                        // Colors
                        color="#2196F3"
                        startFillColor="#2196F3"
                        endFillColor="#E3F2FD"
                        startOpacity={0.6}
                        endOpacity={0.1}
                        // Line styling
                        thickness={3}
                        curved
                        isAnimated
                        animationDuration={800}
                        // Grid and axes
                        showVerticalLines
                        verticalLinesColor="#e5e7eb"
                        rulesColor="#e5e7eb"
                        xAxisColor="#9ca3af"
                        yAxisColor="#9ca3af"
                        // Labels
                        yAxisLabelSuffix=" sp"
                        yAxisLabelWidth={45}
                        yAxisTextStyle={{ color: '#6b7280', fontSize: 11 }}
                        xAxisLabelTextStyle={{ color: '#6b7280', fontSize: 11, fontWeight: '500' }}
                        // Spacing
                        initialSpacing={10}
                        endSpacing={10}
                        // Data points
                        showDataPointOnFocus
                        dataPointsColor="#2196F3"
                        dataPointsRadius={4}
                        focusedDataPointRadius={6}
                    />
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff', padding: 16 },
    title: { fontSize: 18, fontWeight: 'bold', marginVertical: 15 },
    picker: { flex: 1 },
    legend: {
        flexDirection: 'row',
        columnGap: 20,
    },
    table: {
        marginVertical: 12,
        borderWidth: 1,
        borderColor: '#e5e7eb',
        borderRadius: 8,
        overflow: 'hidden',
        backgroundColor: '#fff',
    },
    tableHeader: {
        backgroundColor: '#1f2937',
        paddingVertical: 12,
    },
    tableHeaderText: {
        flex: 1,
        fontWeight: '600',
        color: '#fff',
        fontSize: 13,
        paddingHorizontal: 8,
    },
    tableHeaderCenter: {
        textAlign: 'center',
    },
    tableHeaderRight: {
        textAlign: 'right',
    },
    tableRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#f3f4f6',
        minHeight: 50,
    },
    tableRowEven: {
        backgroundColor: '#f9fafb',
    },
    tableCellName: {
        flex: 1,
        fontSize: 13,
        color: '#374151',
        fontWeight: '500',
    },
    tableCellAmount: {
        flex: 1,
        fontSize: 14,
        color: '#1f2937',
        textAlign: 'center',
        fontWeight: '600',
    },
    tableCellStatus: {
        flex: 1,
        alignItems: 'flex-end',
        paddingRight: 4,
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        minWidth: 80,
        alignItems: 'center',
    },
    statusText: {
        fontSize: 11,
        fontWeight: '600',
        color: '#fff',
    },
    statusAvailable: {
        backgroundColor: '#10b981',
    },
    statusDiscontinued: {
        backgroundColor: '#ef4444',
    },
    statusOutOfStock: {
        backgroundColor: '#f59e0b',
    },
    statusDefault: {
        backgroundColor: '#6b7280',
    },
    separator: {
        borderBottomWidth: 1,
        borderColor: '#ccc',
        marginVertical: 14,
    },
    loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    barChart: { width: '100%', alignItems: 'center', rowGap: 20 },
    barChartTitle: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
        marginVertical: 8,
    },
    barChartTitleItem: { flex: 1, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', columnGap: 4 },
    dropdown: {
        width: 120,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        paddingHorizontal: 8,
        paddingVertical: 4,
    },
    dropdownStatistic: {
        width: 200,
        marginBottom: 10,
    },
    chartContainer: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginVertical: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        alignItems: 'center',
    },
});
