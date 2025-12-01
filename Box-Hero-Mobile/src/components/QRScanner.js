import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, Button, TouchableOpacity, Modal, Alert } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';

export default function QRScanner({ visible, onScanned, onClose, qrCheck, descriptionText }) {
    const [permission, requestPermission] = useCameraPermissions();
    const scanLockRef = useRef(false); // 🔒 lock quét
    const [reRender, setReRender] = useState(false); // để force render khi mở/đóng modal

    useEffect(() => {
        if (visible) {
            scanLockRef.current = false; // reset lock mỗi lần mở modal
            setReRender((prev) => !prev); // force render lại CameraView
        }
    }, [visible]);

    const handleBarCodeScanned = ({ type, data }) => {
        if (scanLockRef.current) return; // chặn quét liên tục

        scanLockRef.current = true; // khóa quét ngay lập tức
        console.log('Scanned:', data);

        if (qrCheck && data !== qrCheck) {
            Alert.alert('Thông báo', 'Mã QR không trùng khớp với mã QR của lô hàng.');
        } else if (onScanned) {
            onScanned(data);
        }

        // 🔥 Mở khóa quét sau 2 giây để quét tiếp như máy POS
        setTimeout(() => {
            scanLockRef.current = false;
            console.log('Scanner unlocked');
        }, 2000);
    };

    return (
        <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
            <View style={styles.container}>
                {!permission ? (
                    <View style={styles.container} />
                ) : !permission.granted ? (
                    <View style={styles.permissionContainer}>
                        <Text style={styles.message}>Chúng tôi cần quyền truy cập camera để quét mã QR</Text>
                        <Button onPress={requestPermission} title="Cấp quyền camera" />
                        <Button onPress={onClose} title="Đóng" color="red" />
                    </View>
                ) : (
                    <CameraView
                        key={reRender} // 👈 reset camera mỗi lần mở modal để tránh event tồn đọng
                        style={styles.camera}
                        facing="back"
                        onBarcodeScanned={handleBarCodeScanned}
                        barcodeScannerSettings={{
                            barcodeTypes: ['qr'],
                        }}
                    >
                        {/* Overlay */}
                        <View style={styles.overlay}>
                            <View style={styles.unfocusedContainer}></View>
                            <View style={styles.middleContainer}>
                                <View style={styles.unfocusedContainer}></View>
                                <View style={styles.focusedContainer}>
                                    <View style={styles.cornerTopLeft} />
                                    <View style={styles.cornerTopRight} />
                                    <View style={styles.cornerBottomLeft} />
                                    <View style={styles.cornerBottomRight} />
                                </View>
                                <View style={styles.unfocusedContainer}></View>
                            </View>
                            <View style={styles.unfocusedContainer}></View>
                        </View>

                        {/* Nút đóng */}
                        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                            <Ionicons name="close" size={30} color="white" />
                        </TouchableOpacity>

                        {/* Hướng dẫn */}
                        <View style={styles.instructionContainer}>
                            <Text style={styles.instructionText}>
                                {descriptionText || 'Di chuyển camera đến mã QR'}
                            </Text>
                        </View>
                    </CameraView>
                )}
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        backgroundColor: 'black',
    },
    permissionContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'black',
        padding: 20,
    },
    message: {
        textAlign: 'center',
        paddingBottom: 20,
        color: 'white',
        fontSize: 16,
    },
    camera: {
        flex: 1,
    },
    overlay: {
        flex: 1,
        backgroundColor: 'transparent',
    },
    unfocusedContainer: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
    },
    middleContainer: {
        flexDirection: 'row',
        height: 250,
    },
    focusedContainer: {
        width: 250,
        height: 250,
        borderWidth: 1,
        borderColor: 'transparent',
        position: 'relative',
    },
    closeButton: {
        position: 'absolute',
        top: 50,
        right: 20,
        padding: 10,
        backgroundColor: 'rgba(0,0,0,0.5)',
        borderRadius: 20,
        zIndex: 10,
    },
    instructionContainer: {
        position: 'absolute',
        bottom: 100,
        left: 0,
        right: 0,
        alignItems: 'center',
    },
    instructionText: {
        color: 'white',
        fontSize: 16,
        backgroundColor: 'rgba(0,0,0,0.5)',
        padding: 10,
        borderRadius: 5,
    },
    cornerTopLeft: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: 30,
        height: 30,
        borderTopWidth: 4,
        borderLeftWidth: 4,
        borderColor: '#00FF00',
        borderTopLeftRadius: 10,
    },
    cornerTopRight: {
        position: 'absolute',
        top: 0,
        right: 0,
        width: 30,
        height: 30,
        borderTopWidth: 4,
        borderRightWidth: 4,
        borderColor: '#00FF00',
        borderTopRightRadius: 10,
    },
    cornerBottomLeft: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        width: 30,
        height: 30,
        borderBottomWidth: 4,
        borderLeftWidth: 4,
        borderColor: '#00FF00',
        borderBottomLeftRadius: 10,
    },
    cornerBottomRight: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 30,
        height: 30,
        borderBottomWidth: 4,
        borderRightWidth: 4,
        borderColor: '#00FF00',
        borderBottomRightRadius: 10,
    },
});
