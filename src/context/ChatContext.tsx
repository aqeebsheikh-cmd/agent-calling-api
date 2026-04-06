import React, {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react";
import type { Chat, Message, User , ChatType, ChatApiResponse } from "../types";
import { sendChatMessage } from "../services/api";
import { generateSessionId } from "../utils/utils";
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
    throw new Error("useChatContext must be used within ChatProvider");
  }
  return context;
};

interface ChatProviderProps {
  children: ReactNode;
}

// Converts camelCase/PascalCase keys to readable Title Case labels.
// e.g. "displayName" -> "Display Name", "jobTitle" -> "Job Title"
const humanizeKey = (key: string): string =>
  key
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (s) => s.toUpperCase())
    .trim();

// Keys that are internal technical metadata and add no user value
const SKIP_KEYS = new Set(["eTag", "cTag"]);

const shouldSkipKey = (key: string): boolean =>
  key.startsWith("@") || SKIP_KEYS.has(key);

/*
    Parses the embedded error string returned by the backend when an individual
    API sub-call fails (e.g. 401, 403) even though the outer status_code is 200.
    Returns a user-friendly message.
*/
const extractErrorMessage = (errorStr: string): string => {
  const statusMatch = errorStr.match(/'status_code':\s*(\d+)/);
  const statusCode = statusMatch ? parseInt(statusMatch[1]) : null;

  const messageMatch = errorStr.match(/'message':\s*'([^']+)'/);
  const rawMessage = messageMatch ? messageMatch[1] : null;

  switch (statusCode) {
    case 401:
      return "Your session has expired or you're not signed in. Please log in and try again.";
    case 403:
      return "You don't have permission to access this resource. Contact your admin if you think this is a mistake.";
    case 404:
      return "We couldn't find what you were looking for. The resource may have been moved or deleted.";
    case 429:
      return "Too many requests. Please wait a moment and try again.";
    default:
      if (statusCode && statusCode >= 500) {
        return "Something went wrong on the server. Please try again later.";
      }
      if (rawMessage) {
        return `Something went wrong: ${rawMessage}`;
      }
      return "An unexpected error occurred. Please try again.";
  }
};

/*
    Generic formatter for ANY API response.
    Outputs markdown-compatible text for rendering via ReactMarkdown.
*/
const formatApiResult = (data: unknown, indent = 0): string => {
  const space = " ".repeat(indent);

  if (data === null || data === undefined) {
    return "—";
  }

  if (typeof data === "string" || typeof data === "number" || typeof data === "boolean") {
    return String(data);
  }

  if (Array.isArray(data)) {
    if (data.length === 0) return "—";
    // Top-level arrays get a visible --- divider between items;
    // nested arrays use a blank line to avoid breaking markdown list context.
    const separator = indent === 0 ? "\n\n---\n\n" : "\n\n";
    return data
      .map((item) => {
        if (typeof item === "object" && item !== null && !Array.isArray(item)) {
          const entries = Object.entries(item as Record<string, unknown>).filter(
            ([key]) => !shouldSkipKey(key)
          );
          // Every property is its own bullet so ReactMarkdown renders
          // each field as a separate list item, not a single paragraph.
          return entries
            .map(([key, value]) => {
              const label = humanizeKey(key);
              const formattedValue = formatApiResult(value, indent + 2);
              if (typeof value === "object" && value !== null) {
                return `${space}- **${label}**:\n${formattedValue}`;
              }
              return `${space}- **${label}**: ${formattedValue}`;
            })
            .join("\n");
        }
        return `${space}- ${formatApiResult(item, indent + 2)}`;
      })
      .join(separator);
  }

  if (typeof data === "object") {
    const entries = Object.entries(data as Record<string, unknown>).filter(
      ([key]) => !shouldSkipKey(key)
    );
    return entries
      .map(([key, value]) => {
        const label = humanizeKey(key);
        const formattedValue = formatApiResult(value, indent + 2);
        if (typeof value === "object" && value !== null) {
          return `${space}- **${label}**:\n${formattedValue}`;
        }
        return `${space}- **${label}**: ${formattedValue}`;
      })
      .join("\n");
  }

  return JSON.stringify(data);
};

export const ChatProvider: React.FC<ChatProviderProps> = ({ children }) => {
  const [user] = useState<User>({
    name: "Ravi Joshi",
    avatar: "/src/assets/Profile_Icon.svg",
  });

  // const [chats, setChats] = useState<Chat[]>([
  //     {
  //         id: '1',
  //         title: 'Rephrase Conversation',
  //         sessionId: generateSessionId(),
  //         messages: [
  //             {
  //                 id: '1',
  //                 text: 'Rephrase "This is an ai chatbot generated for better communication and simpler work flows"',
  //                 sender: 'user',
  //                 timestamp: new Date(Date.now() - 300000),
  //             },
  //             {
  //                 id: '2',
  //                 text: 'This AI chatbot has been developed to optimize communication and simplify work processes, ultimately leading to smoother operations.',
  //                 sender: 'bot',
  //                 timestamp: new Date(Date.now() - 280000),
  //             },
  //             {
  //                 id: '3',
  //                 text: 'Thank You :)',
  //                 sender: 'user',
  //                 timestamp: new Date(Date.now() - 260000),
  //             },
  //         ],
  //         createdAt: new Date(),
  //         updatedAt: new Date(),
  //     },
  //     {
  //         id: '2',
  //         title: 'Your chatbot agent listen more',
  //         sessionId: generateSessionId(),
  //         messages: [],
  //         createdAt: new Date(),
  //         updatedAt: new Date(),
  //     },
  //     {
  //         id: '3',
  //         title: 'My 1st Chat with Deepwize Agent',
  //         sessionId: generateSessionId(),
  //         messages: [],
  //         createdAt: new Date(),
  //         updatedAt: new Date(),
  //     },
  // ]);

  const [chats, setChats] = useState<Chat[]>([
    
    {
      id: "1",
      title: "AI Assistant",
      type: "ai",
      sessionId: generateSessionId(),
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "2",
      title: "Graph API Assistant",
      type: "graph",
      sessionId: generateSessionId(),
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]);
  const [currentChatId, setCurrentChatId] = useState<string | null>("1");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const createNewChat = (type: ChatType) => {
    const newChat: Chat = {
      id: Date.now().toString(),
      title: "New Chat",
      type: type,   
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
  const getDisplayMessage = (data: ChatApiResponse): { text: string; isError: boolean } => {
    const apiStatus = data.api_response?.status_code;

    // CASE 1: Real API executed (outer status 200)
    if (apiStatus === 200) {
      const results = data.api_response?.response_body;
      if (results && results.length > 0) {

        // Check for embedded errors first (e.g. 401, 403 inside a 200 envelope)
        const errorItems = results.filter((r) => r.error !== undefined);
        if (errorItems.length > 0) {
          const errorMessages = errorItems
            .map((r) => extractErrorMessage(r.error!))
            .join("\n\n");
          return { text: errorMessages, isError: true };
        }

        // Normal success — format response bodies
        const formatted = results
          .filter((r) => r.response_body !== undefined && r.response_body !== null)
          .map((r) => formatApiResult(r.response_body))
          .join("\n\n");
        if (formatted) return { text: formatted, isError: false };
      }
    }

    // CASE 2: No API executed / fallback — show assistant summary (strip LLM numbering artifacts)
    if (data.assistant_summary) {
      const cleaned = data.assistant_summary
        .replace(/\s*\d+\)\s*$/g, "")  // remove trailing "2)" or "1)" etc.
        .trim();
      return { text: cleaned || data.assistant_summary, isError: false };
    }

    return { text: "No response available.", isError: false };
  };

  const getApiBaseFromChatType = (type: string): string => {
    switch (type) {
      case "ai":
        return "azurenlp";
      case "graph":
        return "msgraph";
      default:
        return "msgraph";
    }
  };
  const sendMessage = async (text: string) => {
    if (!text.trim() || !currentChatId) return;

    const currentChat = getCurrentChat();
    if (!currentChat) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: text.trim(),
      sender: "user",
      timestamp: new Date(),
    };

    // Add user message
    setChats((prev) =>
      prev.map((chat) => {
        if (chat.id === currentChatId) {
          const updatedMessages = [...chat.messages, userMessage];

          const updatedTitle =
            chat.messages.length === 0
              ? text.trim().slice(0, 50) + (text.length > 50 ? "..." : "")
              : chat.title;

          return {
            ...chat,
            messages: updatedMessages,
            title: updatedTitle,
            updatedAt: new Date(),
          };
        }
        return chat;
      }),
    );

    setIsLoading(true);

    try {
      const apiBase = getApiBaseFromChatType(currentChat.type);
      console.log("API BASE:", apiBase);
       
      const response = await sendChatMessage(
        currentChat.sessionId,
        text.trim(),
        apiBase
      );

      const { text: messageText, isError } = getDisplayMessage(response);

      console.log("Formatted result:", messageText);

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: messageText,
        sender: "bot",
        timestamp: new Date(),
        ...(isError && { error: "true" }),
      };
      console.log("API Response:", response);
      console.log("Bot Message:", botMessage);

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
        }),
      );
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text:
          error instanceof Error
            ? error.message
            : "Failed to get response. Please try again.",
        sender: "bot",
        timestamp: new Date(),
        error: "true",
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
        }),
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
