import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import {
    CalendarCheck,
    CircleArrowLeft,
    CircleArrowRight,
    ClipboardMinus,
    ClipboardPlus,
    Factory,
    Milk,
    User,
    Users,
    ScrollText,
    ArrowRightLeft,
    FileWarning,
} from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';

export default function Panel() {
    const navigation = useNavigation();

    const menu = [
        {
            label: 'Sản phẩm',
            icon: (size, color) => <Milk size={size} color={color} />,
            color: '#3b82f6', // Blue - Products/Catalog
            path: 'Product',
        },
        {
            label: 'Khách hàng',
            icon: (size, color) => <Users size={size} color={color} />,
            color: '#8b5cf6', // Purple - Customers
            path: 'Customer',
        },
        {
            label: 'Nhà cung cấp',
            icon: (size, color) => <Factory size={size} color={color} />,
            color: '#f59e0b', // Amber - Suppliers/Factory
            path: 'Supplier',
        },
        {
            label: 'Nhân sự',
            icon: (size, color) => <User size={size} color={color} />,
            color: '#10b981', // Emerald - Staff
            path: 'Staff',
        },
        {
            label: 'Phiếu đề xuất nhập',
            icon: (size, color) => <CircleArrowRight size={size} color={color} />,
            color: '#06b6d4', // Cyan - Import Request
            path: 'ImportRequest',
        },
        {
            label: 'Phiếu đề xuất xuất',
            icon: (size, color) => <CircleArrowLeft size={size} color={color} />,
            color: '#ec4899', // Pink - Export Request
            path: 'ExportRequest',
        },
        {
            label: 'Tạo phiếu xuất',
            icon: (size, color) => <ClipboardMinus size={size} color={color} />,
            color: '#ef4444', // Red - Create Export
            path: 'CreateExport',
        },
        {
            label: 'Phiếu nhập hàng',
            icon: (size, color) => <ClipboardPlus size={size} color={color} />,
            color: '#22c55e', // Green - Create Import
            path: 'CreateImport',
        },
        {
            label: 'Phiếu nhập thiếu',
            icon: (size, color) => <FileWarning size={size} color={color} />,
            color: '#f97316', // Orange - Missing Import
            path: 'MissingImport',
        },
        {
            label: 'Kiểm kê kho',
            icon: (size, color) => <CalendarCheck size={size} color={color} />,
            color: '#6366f1', // Indigo - Inventory Check
            path: 'Inventory',
        },
        {
            label: 'Nhật ký nhập xuất',
            icon: (size, color) => <ScrollText size={size} color={color} />,
            color: '#64748b', // Slate - History/Logs
            path: 'History',
        },
        {
            label: 'Nhật ký đổi vị trí',
            icon: (size, color) => <ArrowRightLeft size={size} color={color} />,
            color: '#64748b', // Slate - History/Logs
            path: 'HistoryChangeLocation',
        },
    ];

    return (
        <View style={styles.container}>
            <View style={styles.content}>
                {Array.from({ length: Math.ceil(menu.length / 3) }).map((_, rowIdx) => (
                    <View style={styles.row} key={rowIdx}>
                        {menu.slice(rowIdx * 3, rowIdx * 3 + 3).map((item, idx) => (
                            <TouchableOpacity
                                style={styles.rowItem}
                                key={item.path}
                                onPress={() => navigation.navigate(item.path)}
                            >
                                {item.icon(24, item.color)}
                                <Text style={styles.label}>{item.label}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                ))}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        marginVertical: 10,
    },
    content: {
        paddingVertical: 10,
        width: '95%',
        border: '1px solid #8b7777ff',
        borderRadius: 15,
        boxShadow: '0 0 4px rgba(0,0,0,.2)',
        backgroundColor: 'white',
        rowGap: 20,
    },
    row: {
        width: '100%',
        alignItems: 'center',
        flexDirection: 'row',
    },
    rowItem: {
        width: '33.33%',
        flexDirection: 'column',
        alignItems: 'center',
        rowGap: 5,
    },
    label: {
        fontSize: 12,
        color: '#374151',
        textAlign: 'center',
        fontWeight: '500',
    },
});
