import { useState, useRef, useCallback, useEffect } from "react";
import { Check, CheckCheck, Copy, StickyNote, Trash2, SmilePlus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

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
  image_url?: string | null;
  isMe: boolean;
  userId: string;
  coupleId: string;
  reactions: Reaction[];
  onDeleted?: (id: string) => void;
}

const MessageBubble = ({ id, content, created_at, read_at, image_url, isMe, userId, coupleId, reactions, onDeleted }: MessageBubbleProps) => {
  const [showMenu, setShowMenu] = useState(false);
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const [signedImageUrl, setSignedImageUrl] = useState<string | null>(null);
  const [imageLoading, setImageLoading] = useState(false);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Get signed URL for private bucket images
  useEffect(() => {
    if (!image_url) return;
    setImageLoading(true);
    supabase.storage
      .from("chat-media")
      .createSignedUrl(image_url, 60 * 60)
      .then(({ data }) => {
        setSignedImageUrl(data?.signedUrl || null);
        setImageLoading(false);
      });
  }, [image_url]);

  const formatTime = (date: string) =>
    new Date(date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  const handleTouchStart = useCallback(() => {
    longPressTimer.current = setTimeout(() => {
      setShowMenu(true);
    }, 500);
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  }, []);

  const toggleReaction = async (emoji: string) => {
    const existing = reactions.find((r) => r.user_id === userId && r.emoji === emoji);
    if (existing) {
      await supabase.from("message_reactions").delete().eq("id", existing.id);
    } else {
      await supabase.from("message_reactions").insert({
        message_id: id, user_id: userId, emoji,
      });
    }
    setShowReactionPicker(false);
    setShowMenu(false);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      toast({ title: "Copied to clipboard 📋" });
    } catch {
      toast({ title: "Could not copy", variant: "destructive" });
    }
    setShowMenu(false);
  };

  const handleAddToNotes = async () => {
    const { error } = await supabase.from("notes").insert({
      couple_id: coupleId,
      created_by: userId,
      title: `Chat message`,
      content: content,
    });
    if (error) {
      toast({ title: "Failed to save note", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Saved to notes 📝" });
    }
    setShowMenu(false);
  };

  const handleDelete = async () => {
    if (!isMe) return;
    const { error } = await supabase.from("messages").delete().eq("id", id);
    if (error) {
      toast({ title: "Failed to delete", description: error.message, variant: "destructive" });
    } else {
      onDeleted?.(id);
    }
    setShowMenu(false);
  };

  const groupedReactions = reactions.reduce<Record<string, { count: number; mine: boolean }>>((acc, r) => {
    if (!acc[r.emoji]) acc[r.emoji] = { count: 0, mine: false };
    acc[r.emoji].count++;
    if (r.user_id === userId) acc[r.emoji].mine = true;
    return acc;
  }, {});

  const hasImage = !!image_url;
  const isImageOnly = hasImage && (content === "📷 Photo" || !content.trim());

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
    >
      {/* Context menu overlay */}
      <AnimatePresence>
        {showMenu && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40"
            onClick={() => { setShowMenu(false); setShowReactionPicker(false); }}
          />
        )}
      </AnimatePresence>

      <div className="relative z-50">
        <div
          className={`relative max-w-[75vw] rounded-2xl select-none overflow-hidden ${
            isMe
              ? isImageOnly ? "rounded-br-md" : "gradient-rose text-primary-foreground rounded-br-md"
              : isImageOnly ? "rounded-bl-md" : "bg-card shadow-soft text-card-foreground rounded-bl-md"
          } ${!isImageOnly ? "px-4 py-2.5" : ""}`}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onTouchMove={handleTouchEnd}
          onContextMenu={(e) => { e.preventDefault(); setShowMenu(true); }}
        >
          {/* Image */}
          {hasImage && (
            <div className={`${!isImageOnly ? "mb-2 -mx-4 -mt-2.5" : ""}`}>
              {imageLoading ? (
                <div className="w-48 h-48 bg-muted/50 rounded-xl animate-pulse flex items-center justify-center">
                  <span className="text-2xl">📷</span>
                </div>
              ) : signedImageUrl ? (
                <img
                  src={signedImageUrl}
                  alt="Shared photo"
                  className={`max-w-[250px] w-full object-cover ${isImageOnly ? "rounded-2xl" : "rounded-t-2xl"}`}
                  loading="lazy"
                />
              ) : null}
            </div>
          )}

          {/* Text content (hide if image-only) */}
          {!isImageOnly && (
            <div className={hasImage ? "px-4 py-2.5" : ""}>
              <p className="text-sm leading-relaxed">{content}</p>
            </div>
          )}

          {/* Timestamp */}
          <div className={`flex items-center gap-1 ${isImageOnly ? "px-2 py-1" : "mt-1"} ${isMe ? "justify-end" : ""}`}>
            <p className={`text-[10px] ${isMe ? (isImageOnly ? "text-muted-foreground" : "text-primary-foreground/60") : "text-muted-foreground"}`}>
              {formatTime(created_at)}
            </p>
            {isMe && (
              read_at ? (
                <CheckCheck className={`w-3.5 h-3.5 ${isImageOnly ? "text-primary" : "text-primary-foreground"}`} />
              ) : (
                <Check className={`w-3.5 h-3.5 ${isImageOnly ? "text-muted-foreground" : "text-primary-foreground/50"}`} />
              )
            )}
          </div>
        </div>

        {/* Long-press context menu */}
        <AnimatePresence>
          {showMenu && (
            <motion.div
              initial={{ opacity: 0, scale: 0.85, y: -5 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.85, y: -5 }}
              transition={{ duration: 0.15 }}
              className={`absolute ${isMe ? "right-0" : "left-0"} mt-1 bg-card rounded-2xl shadow-lg border border-border overflow-hidden min-w-[180px] z-50`}
            >
              {/* Quick reactions row */}
              <div className="flex gap-0.5 px-2 py-2 border-b border-border">
                {REACTION_EMOJIS.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => toggleReaction(emoji)}
                    className="w-9 h-9 flex items-center justify-center text-lg hover:scale-110 active:scale-95 transition-transform rounded-full hover:bg-secondary"
                  >
                    {emoji}
                  </button>
                ))}
              </div>

              {/* Actions */}
              <button
                onClick={handleCopy}
                className="flex items-center gap-3 w-full px-4 py-3 text-sm text-foreground hover:bg-secondary transition-colors"
              >
                <Copy className="w-4 h-4 text-muted-foreground" />
                Copy
              </button>
              <button
                onClick={handleAddToNotes}
                className="flex items-center gap-3 w-full px-4 py-3 text-sm text-foreground hover:bg-secondary transition-colors"
              >
                <StickyNote className="w-4 h-4 text-muted-foreground" />
                Save to Notes
              </button>
              {isMe && (
                <button
                  onClick={handleDelete}
                  className="flex items-center gap-3 w-full px-4 py-3 text-sm text-destructive hover:bg-destructive/10 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Reaction badges */}
      {Object.keys(groupedReactions).length > 0 && (
        <div className={`flex gap-1 mt-0.5 ${isMe ? "mr-1" : "ml-1"}`}>
          {Object.entries(groupedReactions).map(([emoji, { count, mine }]) => (
            <button
              key={emoji}
              onClick={() => toggleReaction(emoji)}
              className={`flex items-center gap-0.5 text-xs px-1.5 py-0.5 rounded-full border transition-colors ${
                mine ? "bg-primary/10 border-primary/30" : "bg-card border-border"
              }`}
            >
              <span>{emoji}</span>
              {count > 1 && <span className="text-[10px] text-muted-foreground">{count}</span>}
            </button>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default MessageBubble;
