export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  isLoading?: boolean;
  error?: string;
}

export interface Chat {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
  sessionId: string;
}

export interface User {
  name: string;
  avatar: string;
}

// API Types
export interface ChatApiRequest {
  session_id: string;
  message: string;
  jwt_token: string;
}

export interface ChatApiResponse {
  assistant_summary: string;
  assistant_dev_info: string;
  api_response: {
    status_code: number | null;
    response_body: ApiCallResult[];
  };
}

export interface ApiCallResult {
  status_code: number;
  response_body: string | object;
}