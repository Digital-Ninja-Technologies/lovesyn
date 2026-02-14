import { useState, useEffect, useRef, useCallback } from "react";
import { Send, Heart, Check, CheckCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import heroImage from "@/assets/hero-couple.jpg";
import { supabase } from "@/integrations/supabase/client";
import { useUnread } from "@/contexts/UnreadContext";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { useTypingIndicator } from "@/hooks/useTypingIndicator";

interface Message {
  id: string;
  content: string;
  sender_id: string;
  created_at: string;
  read_at: string | null;
}

const Chat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const { user, profile, partner, couplePicUrl } = useAuth();
  const { markAsRead } = useUnread();
  const { sendLocalNotification } = usePushNotifications();
  const { partnerIsTyping, sendTyping } = useTypingIndicator();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Mark partner's unread messages as read in DB
  const markMessagesAsRead = useCallback(async () => {
    if (!user || !profile?.couple_id) return;

    const unreadIds = messages
      .filter((m) => m.sender_id !== user.id && !m.read_at)
      .map((m) => m.id);

    if (unreadIds.length === 0) return;

    const now = new Date().toISOString();

    await supabase
      .from("messages")
      .update({ read_at: now })
      .in("id", unreadIds);

    // Update local state
    setMessages((prev) =>
      prev.map((m) =>
        unreadIds.includes(m.id) ? { ...m, read_at: now } : m
      )
    );
  }, [messages, user, profile?.couple_id]);

  // Mark unread nav badge + DB read receipts on enter
  useEffect(() => {
    markAsRead();
    return () => {
      markAsRead();
    };
  }, [markAsRead]);

  // Mark messages as read whenever new messages from partner appear
  useEffect(() => {
    if (!document.hidden) {
      markMessagesAsRead();
    }
  }, [messages, markMessagesAsRead]);

  // Also mark as read when tab becomes visible
  useEffect(() => {
    const handleVisibility = () => {
      if (!document.hidden) {
        markMessagesAsRead();
        markAsRead();
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, [markMessagesAsRead, markAsRead]);

  useEffect(() => {
    if (!profile?.couple_id) return;

    const fetchMessages = async () => {
      const { data } = await supabase
        .from("messages")
        .select("*")
        .eq("couple_id", profile.couple_id)
        .order("created_at", { ascending: true });

      if (data) setMessages(data as Message[]);
    };

    fetchMessages();

    // Subscribe to inserts and updates (for read receipts)
    const channel = supabase
      .channel("messages")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `couple_id=eq.${profile.couple_id}`,
        },
        (payload) => {
          const newMsg = payload.new as Message;
          setMessages((prev) => [...prev, newMsg]);

          if (newMsg.sender_id !== user?.id) {
            markAsRead();
            if (document.hidden) {
              sendLocalNotification(
                `${partner?.display_name || "Your Love"} 💕`,
                newMsg.content
              );
            }
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "messages",
          filter: `couple_id=eq.${profile.couple_id}`,
        },
        (payload) => {
          const updated = payload.new as Message;
          setMessages((prev) =>
            prev.map((m) => (m.id === updated.id ? updated : m))
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profile?.couple_id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || !profile?.couple_id || !user) return;
    setSending(true);

    const { error } = await supabase.from("messages").insert({
      couple_id: profile.couple_id,
      sender_id: user.id,
      content: input.trim(),
    });

    if (!error) {
      setInput("");
    }
    setSending(false);
  };

  const formatTime = (date: string) => {
    return new Date(date).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (!profile?.couple_id) {
    return (
      <div className="flex flex-col items-center justify-center h-screen px-6 text-center">
        <Heart className="w-16 h-16 text-primary mb-4" />
        <h2 className="font-serif text-xl font-bold text-foreground mb-2">
          Connect with your partner first
        </h2>
        <p className="text-muted-foreground">
          Share your partner code to start chatting
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[100dvh]">
      {/* Header */}
      <div className="sticky top-0 z-20 glass border-b border-border px-5 py-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full overflow-hidden gradient-rose flex items-center justify-center text-lg">
          {couplePicUrl ? (
            <img src={couplePicUrl} alt="Couple" className="w-full h-full object-cover" />
          ) : (
            partner?.avatar_emoji || "💕"
          )}
        </div>
        <div>
          <h1 className="font-serif text-lg font-semibold text-foreground">
            {partner?.display_name || "Your Love"}
          </h1>
          <p className="text-xs text-muted-foreground">Online now 💚</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        <AnimatePresence>
          {messages.map((msg) => {
            const isMe = msg.sender_id === user?.id;
            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className={`flex ${isMe ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                    isMe
                      ? "gradient-rose text-primary-foreground rounded-br-md"
                      : "bg-card shadow-soft text-card-foreground rounded-bl-md"
                  }`}
                >
                  <p className="text-sm leading-relaxed">{msg.content}</p>
                  <div className={`flex items-center gap-1 mt-1 ${isMe ? "justify-end" : ""}`}>
                    <p
                      className={`text-[10px] ${
                        isMe ? "text-primary-foreground/60" : "text-muted-foreground"
                      }`}
                    >
                      {formatTime(msg.created_at)}
                    </p>
                    {isMe && (
                      msg.read_at ? (
                        <CheckCheck className="w-3.5 h-3.5 text-primary-foreground" />
                      ) : (
                        <Check className="w-3.5 h-3.5 text-primary-foreground/50" />
                      )
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
        {partnerIsTyping && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex justify-start"
          >
            <div className="bg-card shadow-soft rounded-2xl rounded-bl-md px-4 py-2.5 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: "0ms" }} />
              <span className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: "150ms" }} />
              <span className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="sticky bottom-16 z-20 glass border-t border-border px-4 py-3">
        <div className="flex items-center gap-2 bg-secondary rounded-full px-4 py-2">
          <input
            type="text"
            value={input}
            onChange={(e) => { setInput(e.target.value); sendTyping(); }}
            onKeyDown={(e) => e.key === "Enter" && !sending && sendMessage()}
            placeholder="Type a love message..."
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || sending}
            className="w-9 h-9 gradient-rose rounded-full flex items-center justify-center disabled:opacity-40 transition-opacity active:scale-95"
          >
            <Send className="w-4 h-4 text-primary-foreground" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chat;
