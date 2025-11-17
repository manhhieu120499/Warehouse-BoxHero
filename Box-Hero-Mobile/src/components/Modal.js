import React, { useRef, useEffect } from 'react';
import {
    Modal as RNModal,
    View,
    StyleSheet,
    Animated,
    Dimensions,
    Platform,
    TouchableWithoutFeedback,
} from 'react-native';
import Button from './Button';
import { COLORS } from './style/Globalstyle';

const { width, height } = Dimensions.get('window');

const ANIMATION_DURATION = 300;

// Custom Modal component
const Modal = ({ isOpenInfo, onClose, children, showButtonClose = true, arrButton = [] }) => {
    const overlayOpacity = useRef(new Animated.Value(0)).current;
    const contentScale = useRef(new Animated.Value(0.9)).current;

    useEffect(() => {
        if (isOpenInfo) {
            Animated.parallel([
                Animated.timing(overlayOpacity, {
                    toValue: 1,
                    duration: ANIMATION_DURATION,
                    useNativeDriver: true,
                }),
                Animated.spring(contentScale, {
                    toValue: 1,
                    friction: 8,
                    tension: 40,
                    useNativeDriver: true,
                }),
            ]).start();
        } else {
            Animated.parallel([
                Animated.timing(overlayOpacity, {
                    toValue: 0,
                    duration: 200,
                    useNativeDriver: true,
                }),
                Animated.timing(contentScale, {
                    toValue: 0.9,
                    duration: 200,
                    useNativeDriver: true,
                }),
            ]).start();
        }
    }, [isOpenInfo, overlayOpacity, contentScale]);

    const contentAnimatedStyle = {
        transform: [{ scale: contentScale }],
        opacity: overlayOpacity,
    };

    return (
        <RNModal visible={isOpenInfo} transparent={true} animationType="none" onRequestClose={onClose}>
            <View style={styles.modalWrapper}>
                <TouchableWithoutFeedback onPress={onClose}>
                    <Animated.View style={[styles.modalOverlay, { opacity: overlayOpacity }]} />
                </TouchableWithoutFeedback>

                <Animated.View style={[styles.modalContent, contentAnimatedStyle]}>
                    {/* Phần Content */}
                    <View>{children}</View>

                    {/* Footer buttons */}
                    <View style={styles.modalButton}>
                        {arrButton.map((item, index) => {
                            return (
                                <View key={index} style={{ marginLeft: 8 }}>
                                    {item(index)}
                                </View>
                            );
                        })}
                        {showButtonClose && (
                            <Button style={{ marginLeft: 8 }} medium borderRadiusSmall primary onPress={onClose}>
                                Đóng
                            </Button>
                        )}
                    </View>
                </Animated.View>
            </View>
        </RNModal>
    );
};

const styles = StyleSheet.create({
    modalWrapper: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },

    modalOverlay: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        right: 0,
        left: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
    },

    modalContent: {
        backgroundColor: COLORS.white,
        padding: 20,
        borderRadius: 8,

        ...Platform.select({
            ios: {
                shadowColor: 'rgba(0, 0, 0, 0.1)',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.6,
                shadowRadius: 6,
            },
            android: {
                elevation: 6,
            },
        }),
        width: '95%',
        maxHeight: height * 0.95,
        overflow: 'hidden',
    },

    modalButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        marginTop: 20,
    },
});

export default Modal;
