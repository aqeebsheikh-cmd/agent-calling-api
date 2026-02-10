import React, { createContext, useContext, useState, type ReactNode } from 'react';
import type { Chat, Message, User } from '../types';
import { sendChatMessage } from '../services/api';
import { generateSessionId } from '../utils/utils';


interface ChatContextType {
    chats: Chat[];
    currentChatId: string | null;
    user: User;
    isLoading: boolean;
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
            sessionId: generateSessionId(),
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
            sessionId: generateSessionId(),
            messages: [],
            createdAt: new Date(),
            updatedAt: new Date(),
        },
        {
            id: '3',
            title: 'My 1st Chat with Deepwize Agent',
            sessionId: generateSessionId(),
            messages: [],
            createdAt: new Date(),
            updatedAt: new Date(),
        },
    ]);

    const [currentChatId, setCurrentChatId] = useState<string | null>('1');
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const createNewChat = () => {
        const newChat: Chat = {
            id: Date.now().toString(),
            title: 'New Chat',
            sessionId: generateSessionId(),
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

    const sendMessage = async (text: string) => {
        if (!text.trim() || !currentChatId) return;

        const currentChat = getCurrentChat();
        if (!currentChat) return;

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

        // Set loading state
        setIsLoading(true);

        try {
            // Call the API
            const response = await sendChatMessage(currentChat.sessionId, text.trim());

            // Add bot response
            const botMessage: Message = {
                id: (Date.now() + 1).toString(),
                text: response.assistant_summary,
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
        } catch (error) {
            // Add error message
            const errorMessage: Message = {
                id: (Date.now() + 1).toString(),
                text: error instanceof Error ? error.message : 'Failed to get response. Please try again.',
                sender: 'bot',
                timestamp: new Date(),
                error: 'true',
            };

            setChats((prev) =>
                prev.map((chat) => {
                    if (chat.id === currentChatId) {
                        return {
                            ...chat,
                            messages: [...chat.messages, errorMessage],
                            updatedAt: new Date(),
                        };
                    }
                    return chat;
                })
            );
        } finally {
            setIsLoading(false);
        }
    };

    const value: ChatContextType = {
        chats,
        currentChatId,
        user,
        isLoading,
        createNewChat,
        selectChat,
        sendMessage,
        getCurrentChat,
    };

    return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

