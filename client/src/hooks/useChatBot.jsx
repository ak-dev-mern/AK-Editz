// hooks/useChatBot.js
import { useChatBot } from "../components/ChatBot/ChatBotProvider";

export const useCustomChatBot = () => {
  const { isChatEnabled, setIsChatEnabled } = useChatBot();

  const enableChat = () => setIsChatEnabled(true);
  const disableChat = () => setIsChatEnabled(false);
  const toggleChat = () => setIsChatEnabled((prev) => !prev);

  return {
    isChatEnabled,
    enableChat,
    disableChat,
    toggleChat,
  };
};
