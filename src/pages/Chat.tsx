import { useState, useEffect, useRef, useCallback } from "react";
import { Send, Heart } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useUnread } from "@/contexts/UnreadContext";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { useTypingIndicator } from "@/hooks/useTypingIndicator";
import MessageBubble from "@/components/MessageBubble";
import { motion } from "framer-motion";

interface Message {
  id: string;
  content: string;
  sender_id: string;
  created_at: string;
  read_at: string | null;
}

interface Reaction {
  id: string;
  message_id: string;
  user_id: string;
  emoji: string;
}

const Chat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [reactions, setReactions] = useState<Reaction[]>([]);
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

  const markMessagesAsRead = useCallback(async () => {
    if (!user || !profile?.couple_id) return;
    const unreadIds = messages
      .filter((m) => m.sender_id !== user.id && !m.read_at)
      .map((m) => m.id);
    if (unreadIds.length === 0) return;
    const now = new Date().toISOString();
    await supabase.from("messages").update({ read_at: now }).in("id", unreadIds);
    setMessages((prev) => prev.map((m) => unreadIds.includes(m.id) ? { ...m, read_at: now } : m));
  }, [messages, user, profile?.couple_id]);

  useEffect(() => {
    markAsRead();
    return () => { markAsRead(); };
  }, [markAsRead]);

  useEffect(() => {
    if (!document.hidden) markMessagesAsRead();
  }, [messages, markMessagesAsRead]);

  useEffect(() => {
    const handleVisibility = () => {
      if (!document.hidden) { markMessagesAsRead(); markAsRead(); }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, [markMessagesAsRead, markAsRead]);

  // Fetch messages and reactions
  useEffect(() => {
    if (!profile?.couple_id) return;

    const fetchData = async () => {
      const { data: msgData } = await supabase
        .from("messages")
        .select("*")
        .eq("couple_id", profile.couple_id)
        .order("created_at", { ascending: true });
      if (msgData) {
        setMessages(msgData as Message[]);
        // Fetch reactions for these messages
        const msgIds = msgData.map((m) => m.id);
        if (msgIds.length > 0) {
          const { data: rxData } = await supabase
            .from("message_reactions")
            .select("*")
            .in("message_id", msgIds);
          if (rxData) setReactions(rxData as Reaction[]);
        }
      }
    };

    fetchData();

    const channel = supabase
      .channel("chat-realtime")
      .on("postgres_changes", {
        event: "INSERT", schema: "public", table: "messages",
        filter: `couple_id=eq.${profile.couple_id}`,
      }, (payload) => {
        const newMsg = payload.new as Message;
        setMessages((prev) => [...prev, newMsg]);
        if (newMsg.sender_id !== user?.id) {
          markAsRead();
          if (document.hidden) {
            sendLocalNotification(`${partner?.display_name || "Your Love"} 💕`, newMsg.content);
          }
        }
      })
      .on("postgres_changes", {
        event: "UPDATE", schema: "public", table: "messages",
        filter: `couple_id=eq.${profile.couple_id}`,
      }, (payload) => {
        const updated = payload.new as Message;
        setMessages((prev) => prev.map((m) => m.id === updated.id ? updated : m));
      })
      .on("postgres_changes", {
        event: "*", schema: "public", table: "message_reactions",
      }, (payload) => {
        if (payload.eventType === "INSERT") {
          setReactions((prev) => [...prev, payload.new as Reaction]);
        } else if (payload.eventType === "DELETE") {
          setReactions((prev) => prev.filter((r) => r.id !== (payload.old as any).id));
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [profile?.couple_id]);

  useEffect(() => { scrollToBottom(); }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || !profile?.couple_id || !user) return;
    setSending(true);
    const { error } = await supabase.from("messages").insert({
      couple_id: profile.couple_id, sender_id: user.id, content: input.trim(),
    });
    if (!error) setInput("");
    setSending(false);
  };

  if (!profile?.couple_id) {
    return (
      <div className="flex flex-col items-center justify-center h-screen px-6 text-center">
        <Heart className="w-16 h-16 text-primary mb-4" />
        <h2 className="font-serif text-xl font-bold text-foreground mb-2">Connect with your partner first</h2>
        <p className="text-muted-foreground">Share your partner code to start chatting</p>
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
          ) : (partner?.avatar_emoji || "💕")}
        </div>
        <div>
          <h1 className="font-serif text-lg font-semibold text-foreground">{partner?.display_name || "Your Love"}</h1>
          <p className="text-xs text-muted-foreground">Online now 💚</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        <AnimatePresence>
          {messages.map((msg) => (
            <MessageBubble
              key={msg.id}
              id={msg.id}
              content={msg.content}
              created_at={msg.created_at}
              read_at={msg.read_at}
              isMe={msg.sender_id === user?.id}
              userId={user?.id || ""}
              coupleId={profile.couple_id!}
              reactions={reactions.filter((r) => r.message_id === msg.id)}
              onDeleted={(deletedId) => setMessages((prev) => prev.filter((m) => m.id !== deletedId))}
            />
          ))}
        </AnimatePresence>
        {partnerIsTyping && (
          <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex justify-start">
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
