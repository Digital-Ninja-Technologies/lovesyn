import { useState } from "react";
import { Check, CheckCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";

const REACTION_EMOJIS = ["❤️", "😂", "😮", "😢", "🔥", "👍"];

interface Reaction {
  id: string;
  emoji: string;
  user_id: string;
}

interface MessageBubbleProps {
  id: string;
  content: string;
  created_at: string;
  read_at: string | null;
  isMe: boolean;
  userId: string;
  reactions: Reaction[];
}

const MessageBubble = ({ id, content, created_at, read_at, isMe, userId, reactions }: MessageBubbleProps) => {
  const [showReactionPicker, setShowReactionPicker] = useState(false);

  const formatTime = (date: string) =>
    new Date(date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  const toggleReaction = async (emoji: string) => {
    const existing = reactions.find((r) => r.user_id === userId && r.emoji === emoji);
    if (existing) {
      await supabase.from("message_reactions").delete().eq("id", existing.id);
    } else {
      await supabase.from("message_reactions").insert({
        message_id: id,
        user_id: userId,
        emoji,
      });
    }
    setShowReactionPicker(false);
  };

  // Group reactions by emoji with count
  const groupedReactions = reactions.reduce<Record<string, { count: number; mine: boolean }>>((acc, r) => {
    if (!acc[r.emoji]) acc[r.emoji] = { count: 0, mine: false };
    acc[r.emoji].count++;
    if (r.user_id === userId) acc[r.emoji].mine = true;
    return acc;
  }, {});

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
    >
      <div
        className={`relative max-w-[75%] rounded-2xl px-4 py-2.5 ${
          isMe
            ? "gradient-rose text-primary-foreground rounded-br-md"
            : "bg-card shadow-soft text-card-foreground rounded-bl-md"
        }`}
        onDoubleClick={() => setShowReactionPicker((v) => !v)}
      >
        <p className="text-sm leading-relaxed">{content}</p>
        <div className={`flex items-center gap-1 mt-1 ${isMe ? "justify-end" : ""}`}>
          <p className={`text-[10px] ${isMe ? "text-primary-foreground/60" : "text-muted-foreground"}`}>
            {formatTime(created_at)}
          </p>
          {isMe && (
            read_at ? (
              <CheckCheck className="w-3.5 h-3.5 text-primary-foreground" />
            ) : (
              <Check className="w-3.5 h-3.5 text-primary-foreground/50" />
            )
          )}
        </div>
      </div>

      {/* Reaction badges */}
      {Object.keys(groupedReactions).length > 0 && (
        <div className={`flex gap-1 mt-0.5 ${isMe ? "mr-1" : "ml-1"}`}>
          {Object.entries(groupedReactions).map(([emoji, { count, mine }]) => (
            <button
              key={emoji}
              onClick={() => toggleReaction(emoji)}
              className={`flex items-center gap-0.5 text-xs px-1.5 py-0.5 rounded-full border transition-colors ${
                mine
                  ? "bg-primary/10 border-primary/30"
                  : "bg-card border-border"
              }`}
            >
              <span>{emoji}</span>
              {count > 1 && <span className="text-[10px] text-muted-foreground">{count}</span>}
            </button>
          ))}
        </div>
      )}

      {/* Reaction picker */}
      <AnimatePresence>
        {showReactionPicker && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className={`flex gap-1 mt-1 bg-card shadow-lg rounded-full px-2 py-1.5 border border-border ${isMe ? "mr-1" : "ml-1"}`}
          >
            {REACTION_EMOJIS.map((emoji) => (
              <button
                key={emoji}
                onClick={() => toggleReaction(emoji)}
                className="w-8 h-8 flex items-center justify-center text-lg hover:scale-125 transition-transform active:scale-95 rounded-full hover:bg-secondary"
              >
                {emoji}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default MessageBubble;
