import Toast from 'react-native-toast-message';

export const ToastMessage = ({ status = 'info', message = '' }) => {
    let type = 'info';
    let text1Style = { fontSize: 18, fontWeight: 'bold' };
    let text2Style = { fontSize: 16, color: '#000' };
    let backgroundColor = '#2196f3';

    if (status === 'error') {
        type = 'error';
        backgroundColor = '#f44336';
        text1Style.color = '#000';
        text2Style.color = '#000';
    } else if (status === 'success') {
        type = 'success';
        backgroundColor = '#4caf50';
        text1Style.color = '#000';
        text2Style.color = '#000';
    } else if (status === 'info') {
        type = 'info';
        backgroundColor = '#2196f3';
        text1Style.color = '#000';
        text2Style.color = '#000';
    }

    Toast.show({
        type,
        text1: status.charAt(0).toUpperCase() + status.slice(1),
        text1Style,
        text2: message,
        text2Style,
        props: {
            backgroundColor,
        },
    });

    return null;
};
