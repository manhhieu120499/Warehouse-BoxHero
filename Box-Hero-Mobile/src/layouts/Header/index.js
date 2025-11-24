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
        backgroundColor: '#2563eb', // Modern Blue
        alignItems: 'center',
        justifyContent: 'center',
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 4.65,
        elevation: 8,
        zIndex: 1000, // Ensure it sits on top
    },
    containerTitle: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center', // Center title by default
        position: 'relative',
        paddingHorizontal: 16,
    },
    title: {
        fontSize: 20,
        fontWeight: '700', // Bold
        color: 'white',
        letterSpacing: 0.5,
    },
    iconLeftInContainerTitle: {
        height: 40, // Larger touch target
        width: 40,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'absolute',
        left: 16,
        zIndex: 1,
    },
    iconRightInContainerTitle: {
        height: 40, // Larger touch target
        width: 40,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'absolute',
        right: 16,
        zIndex: 1,
    },

    content: {
        width: '100%',
        paddingHorizontal: 20,
        alignItems: 'center',
        paddingBottom: 10, // Increased padding
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

export default function Header({
    children,
    leftIcon,
    handleOnPressLeftIcon,
    nameScreen = '',
    title = 'Quản lý kho thông minh',
    RightComponent,
}) {
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
                <Text style={styles.title}>{title}</Text>
                {RightComponent && <View style={styles.iconRightInContainerTitle}>{RightComponent}</View>}
            </View>
            {children && <View style={styles.content}>{children}</View>}
        </View>
    );
}
