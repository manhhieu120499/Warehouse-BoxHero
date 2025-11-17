import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View, Platform } from 'react-native';
import { COLORS } from './style/Globalstyle';

const getStyle = (isPrimary) => {
    if (isPrimary) {
        return {
            backgroundColor: COLORS.primaryButtonGradientOne, // Thay bằng màu cố định
        };
    }
    return {};
};

export default function Button({
    onPress,
    primary = false,
    outline = false,
    small = false,
    medium = false,
    large = false,
    text = false,
    disabled = false,
    rounded = false,
    style,
    children,
    leftIcon,
    rightIcon,
    borderRadiusSmall = false,
    borderRadiusMedium = false,
    borderRadiusLarge = false,
    success = false,
    error = false,
    active = false,
    ...pass
}) {
    const finalOnPress = disabled ? null : onPress;

    const buttonStyles = [
        styles.wrapper,
        primary && styles.primary,
        outline && styles.outline,
        text && styles.text,
        small && styles.small,
        medium && styles.medium,
        large && styles.large,
        disabled && styles.disabled,
        rounded && styles.rounded,
        borderRadiusSmall && styles.borderRadiusSmall,
        borderRadiusMedium && styles.borderRadiusMedium,
        borderRadiusLarge && styles.borderRadiusLarge,
        success && styles.success,
        error && styles.error,
        active && styles.active,
        style, // style từ bên ngoài
    ];

    const isColored = primary || success || error || active;
    const textStyle = [styles.title, isColored && styles.titleColored, outline && styles.titleOutline];

    return (
        <TouchableOpacity
            style={buttonStyles}
            onPress={finalOnPress}
            activeOpacity={disabled ? 1 : 0.7}
            disabled={disabled}
            {...pass}
        >
            {leftIcon && <View style={styles.icon}>{leftIcon}</View>}
            <Text style={textStyle}>{children}</Text>
            {rightIcon && <View style={styles.icon}>{rightIcon}</View>}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 14,
        paddingVertical: 9,
        paddingHorizontal: 16,
        borderRadius: 4,
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: 'transparent',
    },

    small: {
        minWidth: 60,
        paddingVertical: 4,
        paddingHorizontal: 16,
    },
    medium: {
        minWidth: 110,
        paddingVertical: 8,
        paddingHorizontal: 16,
    },
    large: {
        minWidth: 140,
        paddingVertical: 14,
        paddingHorizontal: 16,
    },

    rounded: {
        borderRadius: 999,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
            },
            android: {
                elevation: 3,
            },
        }),
        borderColor: 'rgba(22, 24, 35, 0.12)',
    },

    primary: {
        backgroundColor: COLORS.primaryButtonGradientTwo,
    },

    outline: {
        borderColor: COLORS.primaryButtonGradientTwoHover,
    },

    success: {
        backgroundColor: COLORS.success,
    },

    error: {
        backgroundColor: COLORS.error,
    },

    text: {
        // text-decoration: underline trong RN chỉ áp dụng cho Text
    },

    active: {
        backgroundColor: COLORS.activeTab,
    },

    disabled: {
        opacity: 0.5,
    },

    // borderRadius
    borderRadiusSmall: {
        borderRadius: 10,
    },
    borderRadiusMedium: {
        borderRadius: 15,
    },
    borderRadiusLarge: {
        borderRadius: 20,
    },

    // Title/Text
    title: {
        color: '#161823',
        fontWeight: '700',
        fontSize: 14,
    },
    titleColored: {
        color: COLORS.white,
    },
    titleOutline: {
        color: COLORS.primaryButtonGradientTwoHover,
    },

    icon: {
        minWidth: 20,
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 16,
    },

    'icon + title': {
        marginLeft: 6,
    },
    'title + icon': {
        marginLeft: 6,
    },
});
