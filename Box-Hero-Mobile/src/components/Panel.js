import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Milk } from 'lucide-react-native';

export default function Panel() {
    const styles = StyleSheet.create({
        container: {
            flex: 1,
            alignItems: 'center',
            marginVertical: 10,
        },
        content: {
            padding: 12,
            width: '90%',
            border: '1px solid #ccc',
            borderRadius: 15,
            boxShadow: '0 0 4px rgba(0,0,0,.06)',
            backgroundColor: 'red',
            rowGap: 20,
        },
        row: {
            width: '100%',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexDirection: 'row',
        },
        rowItem: {
            width: '33%',
            flexDirection: 'column',
            alignItems: 'center',
            rowGap: 5,
        },
    });
    return (
        <View style={styles.container}>
            <View style={styles.content}>
                <View style={styles.row}>
                    <View style={styles.rowItem}>
                        <Milk size={24} />
                        <Text>Sản phẩm</Text>
                    </View>
                    <View style={styles.rowItem}>
                        <Milk size={24} />
                        <Text>Khách hàng</Text>
                    </View>
                    <View style={styles.rowItem}>
                        <Milk size={24} />
                        <Text>Nhà cung cấp</Text>
                    </View>
                </View>
                <View style={styles.row}>
                    <View style={styles.rowItem}>
                        <Milk size={24} />
                        <Text>Nhân sự</Text>
                    </View>
                    <View style={styles.rowItem}>
                        <Milk size={24} />
                        <Text>Phiếu đề xuất nhập</Text>
                    </View>
                    <View style={styles.rowItem}>
                        <Milk size={24} />
                        <Text>Phiếu đề xuất xuất</Text>
                    </View>
                </View>
                <View style={styles.row}>
                    <View style={styles.rowItem}>
                        <Milk size={24} />
                        <Text>Tạo phiếu xuất</Text>
                    </View>
                    <View style={styles.rowItem}>
                        <Milk size={24} />
                        <Text>Tạo phiếu nhập</Text>
                    </View>
                    <View style={styles.rowItem}>
                        <Milk size={24} />
                        <Text>Kiểm kê kho</Text>
                    </View>
                </View>
            </View>
        </View>
    );
}
