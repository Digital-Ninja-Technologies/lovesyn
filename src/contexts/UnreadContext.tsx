import { createContext, useContext, ReactNode } from "react";
import { useUnreadMessages } from "@/hooks/useUnreadMessages";

interface UnreadContextType {
  unreadCount: number;
  markAsRead: () => void;
  fetchUnreadCount: () => Promise<void>;
}

const UnreadContext = createContext<UnreadContextType | undefined>(undefined);

export const UnreadProvider = ({ children }: { children: ReactNode }) => {
  const unread = useUnreadMessages();
  return (
    <UnreadContext.Provider value={unread}>
      {children}
    </UnreadContext.Provider>
  );
};

export const useUnread = () => {
  const context = useContext(UnreadContext);
  if (!context) {
    throw new Error("useUnread must be used within an UnreadProvider");
  }
  return context;
};
