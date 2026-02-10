import React, { createContext, useContext, useState, ReactNode } from 'react';
import type { Chat, Message, User } from '../types';


interface ChatContextType {
    chats: Chat[];
    currentChatId: string | null;
    user: User;
    createNewChat: () => void;
    selectChat: (chatId: string) => void;
    sendMessage: (text: string) => void;
    getCurrentChat: () => Chat | undefined;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const useChatContext = () => {
    const context = useContext(ChatContext);
    if (!context) {
        throw new Error('useChatContext must be used within ChatProvider');
    }
    return context;
};

interface ChatProviderProps {
    children: ReactNode;
}

export const ChatProvider: React.FC<ChatProviderProps> = ({ children }) => {
    const [user] = useState<User>({
        name: 'Ravi Joshi',
        avatar: '/src/assets/user_avtar.png',
    });

    const [chats, setChats] = useState<Chat[]>([
        {
            id: '1',
            title: 'Rephrase Conversation',
            messages: [
                {
                    id: '1',
                    text: 'Rephrase "This is an ai chatbot generated for better communication and simpler work flows"',
                    sender: 'user',
                    timestamp: new Date(Date.now() - 300000),
                },
                {
                    id: '2',
                    text: 'This AI chatbot has been developed to optimize communication and simplify work processes, ultimately leading to smoother operations.',
                    sender: 'bot',
                    timestamp: new Date(Date.now() - 280000),
                },
                {
                    id: '3',
                    text: 'Thank You :)',
                    sender: 'user',
                    timestamp: new Date(Date.now() - 260000),
                },
            ],
            createdAt: new Date(),
            updatedAt: new Date(),
        },
        {
            id: '2',
            title: 'Your chatbot agent listen more',
            messages: [],
            createdAt: new Date(),
            updatedAt: new Date(),
        },
        {
            id: '3',
            title: 'My 1st Chat with Deepwize Agent',
            messages: [],
            createdAt: new Date(),
            updatedAt: new Date(),
        },
    ]);

    const [currentChatId, setCurrentChatId] = useState<string | null>('1');

    const createNewChat = () => {
        const newChat: Chat = {
            id: Date.now().toString(),
            title: 'New Chat',
            messages: [],
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        setChats((prev) => [newChat, ...prev]);
        setCurrentChatId(newChat.id);
    };

    const selectChat = (chatId: string) => {
        setCurrentChatId(chatId);
    };

    const getCurrentChat = () => {
        return chats.find((chat) => chat.id === currentChatId);
    };

    const sendMessage = (text: string) => {
        if (!text.trim() || !currentChatId) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            text: text.trim(),
            sender: 'user',
            timestamp: new Date(),
        };

        // Update chat with user message
        setChats((prev) =>
            prev.map((chat) => {
                if (chat.id === currentChatId) {
                    const updatedMessages = [...chat.messages, userMessage];
                    const updatedTitle =
                        chat.messages.length === 0
                            ? text.trim().slice(0, 50) + (text.length > 50 ? '...' : '')
                            : chat.title;

                    return {
                        ...chat,
                        messages: updatedMessages,
                        title: updatedTitle,
                        updatedAt: new Date(),
                    };
                }
                return chat;
            })
        );

        // Simulate bot response (echo back the user message)
        setTimeout(() => {
            const botMessage: Message = {
                id: (Date.now() + 1).toString(),
                text: text.trim(), // Echo back the same message
                sender: 'bot',
                timestamp: new Date(),
            };

            setChats((prev) =>
                prev.map((chat) => {
                    if (chat.id === currentChatId) {
                        return {
                            ...chat,
                            messages: [...chat.messages, botMessage],
                            updatedAt: new Date(),
                        };
                    }
                    return chat;
                })
            );
        }, 500);
    };

    const value: ChatContextType = {
        chats,
        currentChatId,
        user,
        createNewChat,
        selectChat,
        sendMessage,
        getCurrentChat,
    };

    return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};
