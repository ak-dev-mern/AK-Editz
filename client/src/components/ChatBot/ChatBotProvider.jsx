// components/ChatBot/ChatBotProvider.jsx
import React, { createContext, useContext, useState } from "react";
import ChatBot from "./ChatBot";

const ChatBotContext = createContext();

export const useChatBot = () => {
  const context = useContext(ChatBotContext);
  if (!context) {
    throw new Error("useChatBot must be used within a ChatBotProvider");
  }
  return context;
};

export const ChatBotProvider = ({ children }) => {
  const [isChatEnabled, setIsChatEnabled] = useState(true);

  return (
    <ChatBotContext.Provider value={{ isChatEnabled, setIsChatEnabled }}>
      {children}
      {isChatEnabled && <ChatBot />}
    </ChatBotContext.Provider>
  );
};
