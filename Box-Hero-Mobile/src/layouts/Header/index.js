import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Platform, Pressable } from 'react-native';
import { TouchableOpacity } from 'react-native';
import { View, Text, StyleSheet } from 'react-native';
import FontAwesome6Icon from 'react-native-vector-icons/FontAwesome6';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const styles = StyleSheet.create({
    container: {
        width: '100%',
        backgroundColor: '#003b95',
        alignItems: 'center',
        justifyContent: 'center',
    },
    containerTitle: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
        position: 'relative',
    },
    title: {
        fontSize: 20,
        fontWeight: 550,
        color: 'white',
    },
    iconLeftInContainerTitle: {
        height: 30,
        width: 30,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'absolute',
        left: 20,
    },
    iconRightInContainerTitle: {
        height: 30,
        width: 30,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'absolute',
        right: 20,
    },

    content: {
        width: '100%',
        paddingHorizontal: 20,
        alignItems: 'center',
        paddingBottom: 5,
    },
});

const renderHeightHeaderByScreen = (nameScreen, platForm) => {
    if (platForm == 'ios') {
        switch (nameScreen) {
            case 'Home': {
                return 90;
            }
            default: {
                return 90;
            }
        }
    } else if (platForm == 'android') {
        switch (nameScreen.toLowerCase()) {
            case 'home': {
                return 70;
            }
            default: {
                return 120;
            }
        }
    }
};

export default function Header({ children, leftIcon, handleOnPressLeftIcon, nameScreen = '' }) {
    return (
        <View
            style={[
                styles.container,
                {
                    height: renderHeightHeaderByScreen(nameScreen, Platform.OS),
                    paddingTop: Platform.OS === 'ios' ? 25 : 0,
                },
            ]}
        >
            <View
                style={[
                    styles.containerTitle,
                    {
                        height: Platform.OS === 'ios' ? 50 : 60,
                    },
                ]}
            >
                {leftIcon && (
                    <Pressable style={styles.iconLeftInContainerTitle} onPress={handleOnPressLeftIcon}>
                        <MaterialIcons name={leftIcon} size={24} color={'white'} />
                    </Pressable>
                )}
                <Text style={styles.title}>Quản lý kho thông minh</Text>
            </View>
            {children && <View style={styles.content}>{children}</View>}
        </View>
    );
}
