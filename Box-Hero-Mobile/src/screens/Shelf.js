import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { DefaultLayout } from '../layouts';
import Header from '../layouts/Header';
import { MaterialIcons } from '@expo/vector-icons';
import Button from '../components/Button';
import { useEffect, useState } from 'react';
import Modal from '../components/Modal';

const style = StyleSheet.create({
    container: {
        width: '100%',
        paddingHorizontal: 10,
    },
    containerFilterSearch: {
        width: '100%',
        flexDirection: 'row',
        backgroundColor: 'white',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderRadius: 15,
        height: 38,
    },
    inputContainerFilterSearch: {
        height: '100%',
        paddingLeft: 12,
        width: '80%',
    },
    btnSearchInContainerFilterSearch: {
        width: '15%',
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#afb2b7',
        borderTopRightRadius: 15,
        borderBottomRightRadius: 15,
    },
    containerListRoom: {
        width: '100%',
        paddingHorizontal: 10,
    },
});

export default function Shelf() {
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        console.log(showModal);
    }, [showModal]);
    return (
        <DefaultLayout>
            <Header leftIcon={'menu'} handleOnPressLeftIcon={() => setIsOpenModal(true)} />
            <View
                style={{
                    flex: 1,
                    width: '100%',
                    backgroundColor: '#f5f5f5',
                }}
            >
                <Text>Shelf Screen Test</Text>
                <Button error onPress={() => setShowModal(!showModal)}>
                    Test Button
                </Button>

                <Modal isOpenInfo={showModal} onClose={() => setShowModal(false)} showButtonClose={true}>
                    <Text>This is a test modal content.</Text>
                </Modal>
            </View>
        </DefaultLayout>
    );
}
