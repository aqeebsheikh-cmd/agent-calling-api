import React, { useState } from "react";
import { useChatContext } from "../../context/ChatContext";
import styles from "./Sidebar.module.css";

import NewChatIcon from "../../assets/new_chat.svg";
import SearchIcon from "../../assets/search_chat.svg";
import ToggleIcon from "../../assets/toggle_icon.svg";
import ChevronIcon from "../../assets/Arrow - Down 2.svg";

const Sidebar: React.FC = () => {
  const { chats, currentChatId, user, createNewChat, selectChat } =
    useChatContext();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredChats = chats.filter((chat) =>
    chat.title.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <aside className={styles.sidebar}>
      {/* Header */}
      <div className={styles.sidebarHeader}>
        <img
          src="/src/assets/logo_deepwise.png"
          alt="Deepwize Logo"
          className={styles.logo}
        />

        {/* <button className={styles.menuToggle}> */}
        <img src={ToggleIcon} alt="Menu" />
        {/* </button> */}
      </div>

      {/* Actions */}
      <div className={styles.actionList}>
        <div className={styles.actionItem} onClick={createNewChat}>
          <img src={NewChatIcon} alt="New Chat" />
          <span>New Chat</span>
        </div>

        <div className={styles.actionItem}>
          <img src={SearchIcon} alt="Search Chats" />
          <span>Search Chats</span>
        </div>
      </div>

      {/* Chat List */}
      <div className={styles.chatList}>
        <p className={styles.chatListTitle}>Your Chats</p>

        {filteredChats.map((chat) => (
          <div
            key={chat.id}
            className={`${styles.chatItem} ${
              chat.id === currentChatId ? styles.active : ""
            }`}
            onClick={() => selectChat(chat.id)}
          >
            {chat.title}
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className={styles.userFooter}>
        <div className={styles.userFooterLeft}>
          <img
            src={user.avatar}
            alt={user.name}
            className={styles.userAvatar}
          />

          <div className={styles.userText}>
            <span className={styles.welcomeText}>Welcome back,</span>
            <span className={styles.userName}>{user.name}</span>
          </div>
        </div>

        <img src={ChevronIcon} alt="Expand" className={styles.chevron} />
      </div>
    </aside>
  );
};

export default Sidebar;
