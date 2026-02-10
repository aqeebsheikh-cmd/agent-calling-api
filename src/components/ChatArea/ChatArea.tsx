import React, { useState, useRef, useEffect } from "react";
import { useChatContext } from "../../context/ChatContext";
import styles from "./ChatArea.module.css";

import EmojiIcon from "../../assets/Emojis.svg";
import PaperclipIcon from "../../assets/Paperclip.svg";
import SendIcon from "../../assets/Send.svg";
import ForwardIcon from "../../assets/Square Forward.svg";

const ChatArea: React.FC = () => {
  const { getCurrentChat, sendMessage, user } = useChatContext();
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const currentChat = getCurrentChat();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [currentChat?.messages]);

  const handleSend = () => {
    if (!inputValue.trim()) return;
    sendMessage(inputValue);
    setInputValue("");
  };

  return (
    <div className={styles.chatArea}>
      <div className={styles.chatContent}>
        {/* HEADER */}
        <div className={styles.chatHeader}>
          <h1 className={styles.chatTitle}>Agent Calling API 1.0</h1>
        </div>

        {/* SCROLLABLE MESSAGES */}
        <div className={styles.messagesContainer}>
          {currentChat?.messages?.length ? (
            currentChat.messages.map((message) => (
              <div
                key={message.id}
                className={`${styles.messageWrapper} ${styles[message.sender]}`}
              >
                {/* BOT AVATAR */}
                {message.sender === "bot" && (
                  <img
                    src="/src/assets/bot_avtar.png"
                    alt="bot"
                    className={styles.messageAvatar}
                  />
                )}

                {/* USER ACTION (LEFT) */}
                {message.sender === "user" && (
                  <button className={styles.actionButton}>
                    <img src={ForwardIcon} alt="Forward" />
                  </button>
                )}

                {/* MESSAGE BUBBLE */}
                <div className={styles.messageBubble}>{message.text}</div>

                {/* BOT ACTION (RIGHT) */}
                {message.sender === "bot" && (
                  <button className={styles.actionButton}>
                    <img src={ForwardIcon} alt="Forward" />
                  </button>
                )}

                {/* USER AVATAR */}
                {message.sender === "user" && (
                  <img
                    src={user.avatar}
                    alt="user"
                    className={styles.messageAvatar}
                  />
                )}
              </div>
            ))
          ) : (
            <div className={styles.emptyState}>
              <div className={styles.emptyStateIcon}>💬</div>
              <div className={styles.emptyStateText}>
                Start a conversation by typing a message below
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* INPUT */}
        <div className={styles.inputContainer}>
          <div className={styles.inputWrapper}>
            <input
              className={styles.messageInput}
              placeholder="Type a new message here"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
            />

            <button className={styles.inputIconButton}>
              <img src={PaperclipIcon} alt="Attach" />
            </button>

            <button className={styles.inputIconButton}>
              <img src={EmojiIcon} alt="Emoji" />
            </button>

            <button
              className={styles.sendButton}
              onClick={handleSend}
              disabled={!inputValue.trim()}
            >
              <img src={SendIcon} alt="Send" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatArea;
