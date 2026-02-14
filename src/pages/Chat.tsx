import { useState, useEffect, useRef } from "react";
import { Send, Heart } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface Message {
  id: string;
  content: string;
  sender_id: string;
  created_at: string;
}

const Chat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const { user, profile, partner } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (!profile?.couple_id) return;

    // Fetch existing messages
    const fetchMessages = async () => {
      const { data } = await supabase
        .from("messages")
        .select("*")
        .eq("couple_id", profile.couple_id)
        .order("created_at", { ascending: true });

      if (data) setMessages(data);
    };

    fetchMessages();

    // Subscribe to new messages
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
          setMessages((prev) => [...prev, payload.new as Message]);
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
      {/* Header - fixed top */}
      <div className="sticky top-0 z-20 glass border-b border-border px-5 py-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full gradient-rose flex items-center justify-center text-lg">
          {partner?.avatar_emoji || "💕"}
        </div>
        <div>
          <h1 className="font-serif text-lg font-semibold text-foreground">
            {partner?.display_name || "Your Love"}
          </h1>
          <p className="text-xs text-muted-foreground">Online now 💚</p>
        </div>
      </div>

      {/* Messages - scrollable middle */}
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
                  <p
                    className={`text-[10px] mt-1 ${
                      isMe ? "text-primary-foreground/60" : "text-muted-foreground"
                    }`}
                  >
                    {formatTime(msg.created_at)}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Input - fixed above bottom nav */}
      <div className="sticky bottom-16 z-20 glass border-t border-border px-4 py-3">
        <div className="flex items-center gap-2 bg-secondary rounded-full px-4 py-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
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
