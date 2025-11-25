import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    FlatList,
    TextInput,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    Image,
    ActivityIndicator,
} from 'react-native';
import { Send, X } from 'lucide-react-native';
import { initChatBox, chatWithBot } from '../service/ai.service';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { DefaultLayout } from '../layouts';
import Header from '../layouts/Header';

const ChatAssistant = () => {
    const [messages, setMessages] = useState([]);
    const [sessionId, setSessionId] = useState(null);
    const [inputText, setInputText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const flatListRef = useRef(null);

    useEffect(() => {
        const initUser = async () => {
            try {
                const res = await initChatBox();
                if (res.data && res.data.status === 'OK') {
                    setSessionId(res.data.sessionId);
                }
            } catch (error) {
                console.error('Error initializing chat:', error);
            }
        };

        initUser();
    }, []);

    const handleSubmitInput = async (value) => {
        const textToSend = value || inputText;
        if (!textToSend.trim()) return;

        // Add user message
        const userMsg = { from: 'user', type: 'text', text: textToSend };
        setMessages((prev) => [...prev, userMsg]);
        setInputText('');
        setIsLoading(true);

        try {
            const res = await chatWithBot({ message: textToSend, sessionId });
            if (res.data && res.data.status === 'OK') {
                setMessages((prev) => [...prev, ...res.data.data]);
            }
        } catch (error) {
            console.error('Error sending message:', error);
            // Optionally add an error message to the chat
        } finally {
            setIsLoading(false);
        }
    };

    const renderMessage = ({ item }) => {
        const isUser = item.from === 'user';

        return (
            <View style={[styles.messageContainer, isUser ? styles.userMessage : styles.botMessage]}>
                {item.type === 'text' && <Text style={styles.messageText}>{item.text}</Text>}

                {item.type === 'buttons' && (
                    <View style={styles.buttonGroup}>
                        {item.buttons.map((btn, index) => (
                            <TouchableOpacity
                                key={index}
                                style={styles.optionButton}
                                onPress={() => handleSubmitInput(btn.value)}
                            >
                                <Text style={styles.optionButtonText}>{btn.label}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                )}

                {item.type === 'checkbox' && (
                    <View style={styles.checkboxGroup}>
                        {item.options.map((opt, index) => (
                            <View key={index} style={styles.checkboxItem}>
                                <MaterialCommunityIcons name="checkbox-blank-outline" size={20} color="#333" />
                                <Text style={styles.checkboxLabel}>{opt.label}</Text>
                            </View>
                        ))}
                        <Text style={styles.noteText}>(Tính năng checkbox đang phát triển trên mobile)</Text>
                    </View>
                )}
            </View>
        );
    };

    return (
        <DefaultLayout>
            <Header title="BoxHero AI" />

            <FlatList
                ref={flatListRef}
                data={messages}
                renderItem={renderMessage}
                keyExtractor={(item, index) => index.toString()}
                contentContainerStyle={styles.messagesList}
                onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
                onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
            />

            {isLoading && (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="small" color="#096aec" />
                </View>
            )}

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 10 : 0}
                style={styles.inputWrapper}
            >
                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        value={inputText}
                        onChangeText={setInputText}
                        placeholder="Nhập tin nhắn..."
                        placeholderTextColor="#999"
                        multiline
                    />
                    <TouchableOpacity
                        style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
                        onPress={() => handleSubmitInput()}
                        disabled={!inputText.trim()}
                    >
                        <Send size={20} color={inputText.trim() ? '#fff' : '#ccc'} />
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </DefaultLayout>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        height: 50,
        borderBottomWidth: 1,
        borderBottomColor: '#e7e7e7',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 15,
        backgroundColor: '#fff',
    },
    headerTitleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginLeft: 10,
        color: '#333',
    },
    messagesList: {
        padding: 15,
        paddingBottom: 20,
    },
    messageContainer: {
        maxWidth: '80%',
        padding: 12,
        borderRadius: 14,
        marginBottom: 10,
    },
    userMessage: {
        alignSelf: 'flex-end',
        backgroundColor: '#e8f0fe',
        borderBottomRightRadius: 2,
    },
    botMessage: {
        alignSelf: 'flex-start',
        backgroundColor: '#f1f1f1',
        borderTopLeftRadius: 2,
    },
    messageText: {
        fontSize: 15,
        color: '#333',
        lineHeight: 20,
    },
    buttonGroup: {
        marginTop: 5,
    },
    optionButton: {
        backgroundColor: '#d5e3fa',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 10,
        marginTop: 6,
    },
    optionButtonText: {
        color: '#096aec',
        fontSize: 14,
        fontWeight: '500',
    },
    checkboxGroup: {
        marginTop: 5,
    },
    checkboxItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 5,
    },
    checkboxLabel: {
        marginLeft: 8,
        fontSize: 14,
        color: '#333',
    },
    noteText: {
        fontSize: 12,
        color: '#888',
        marginTop: 5,
        fontStyle: 'italic',
    },
    loadingContainer: {
        padding: 10,
        alignItems: 'center',
    },
    inputWrapper: {
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
        backgroundColor: '#fff',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        paddingHorizontal: 15,
    },
    input: {
        flex: 1,
        backgroundColor: '#f5f5f5',
        borderRadius: 20,
        paddingHorizontal: 15,
        paddingVertical: 10,
        maxHeight: 100,
        fontSize: 16,
        color: '#333',
        marginRight: 10,
    },
    sendButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#096aec',
        justifyContent: 'center',
        alignItems: 'center',
    },
    sendButtonDisabled: {
        backgroundColor: '#f0f0f0',
    },
});

export default ChatAssistant;
