import axios, { AxiosError } from 'axios';
import type { ChatApiRequest, ChatApiResponse } from '../types';

const API_BASE_URL = 'https://apiagents-erdfdag3gudfhgfh.centralindia-01.azurewebsites.net';
// const API_BASE_URL = 'http://127.0.0.1:8000';

// Create axios instance with default config
const apiClient = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000, // 30 seconds
    headers: {
        'Content-Type': 'application/json',
    },
});

/**
 * Send a chat message to the API
 * @param sessionId - Unique session identifier
 * @param message - User's message text
 * @returns API response with assistant's reply
 */
export const sendChatMessage = async (
    sessionId: string,
    message: string
): Promise<ChatApiResponse> => {
    try {
        const payload: ChatApiRequest = {
            session_id: sessionId,
            message: message,
            jwt_token: '', // Empty as per requirements
        };

        const response = await apiClient.post<ChatApiResponse>('/api/chat', payload);
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            const axiosError = error as AxiosError;
            console.error('API Error:', axiosError.response?.data || axiosError.message);
            throw new Error(
                axiosError.response?.data
                    ? JSON.stringify(axiosError.response.data)
                    : 'Failed to send message. Please try again.'
            );
        }
        throw new Error('An unexpected error occurred. Please try again.');
    }
};
