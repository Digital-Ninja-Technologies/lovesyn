import { useState, useEffect, useRef, useCallback } from "react";
import { Send, Heart, ImagePlus, X, Loader2 } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useUnread } from "@/contexts/UnreadContext";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { useTypingIndicator } from "@/hooks/useTypingIndicator";
import MessageBubble from "@/components/MessageBubble";
import FullscreenImage from "@/components/FullscreenImage";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { useNotificationSound } from "@/hooks/useNotificationSound";

interface Message {
  id: string;
  content: string;
  sender_id: string;
  created_at: string;
  read_at: string | null;
  image_url: string | null;
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
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user, profile, partner, couplePicUrl } = useAuth();
  const { markAsRead } = useUnread();
  const { sendLocalNotification } = usePushNotifications();
  const { partnerIsTyping, sendTyping } = useTypingIndicator();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);
  const { toast } = useToast();
  const { playNotificationSound } = useNotificationSound();

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

  const autoDownloadImage = useCallback(async (imagePath: string) => {
    try {
      const { data } = await supabase.storage
        .from("chat-media")
        .createSignedUrl(imagePath, 60 * 5);
      if (!data?.signedUrl) return;

      const response = await fetch(data.signedUrl);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = imagePath.split("/").pop() || "lovesync-photo.jpg";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      // Silent fail — don't interrupt chat experience
    }
  }, []);

  useEffect(() => {
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
        // Auto-download image to device if enabled
        if (newMsg.image_url && localStorage.getItem("lovesync-auto-save-media") !== "false") {
          autoDownloadImage(newMsg.image_url);
        }
        if (newMsg.sender_id !== user?.id) {
          playNotificationSound();
          markAsRead();
          if (document.hidden) {
            sendLocalNotification(`${partner?.display_name || "Your Love"} 💕`, newMsg.content || "Sent a photo 📷");
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

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast({ title: "Only images are supported", variant: "destructive" });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast({ title: "Image too large (max 10MB)", variant: "destructive" });
      return;
    }

    setSelectedImage(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const clearSelectedImage = () => {
    setSelectedImage(null);
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    if (!profile?.couple_id || !user) return null;
    const ext = file.name.split(".").pop();
    const fileName = `${profile.couple_id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    const { error } = await supabase.storage
      .from("chat-media")
      .upload(fileName, file, { contentType: file.type });

    if (error) {
      toast({ title: "Upload failed", description: error.message, variant: "destructive" });
      return null;
    }

    return fileName;
  };

  const getSignedUrl = async (path: string): Promise<string | null> => {
    const { data } = await supabase.storage
      .from("chat-media")
      .createSignedUrl(path, 60 * 60); // 1 hour
    return data?.signedUrl || null;
  };

  const sendMessage = async () => {
    if ((!input.trim() && !selectedImage) || !profile?.couple_id || !user) return;
    setSending(true);
    setUploading(!!selectedImage);

    let imageUrl: string | null = null;

    if (selectedImage) {
      imageUrl = await uploadImage(selectedImage);
      if (!imageUrl && !input.trim()) {
        setSending(false);
        setUploading(false);
        return;
      }
    }

    const { error } = await supabase.from("messages").insert({
      couple_id: profile.couple_id,
      sender_id: user.id,
      content: input.trim() || (imageUrl ? "📷 Photo" : ""),
      image_url: imageUrl,
    });

    if (!error) {
      setInput("");
      clearSelectedImage();
    }
    setSending(false);
    setUploading(false);
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
    <>
      <div className="flex flex-col h-[100dvh]">
        {/* Header */}
        <div className="fixed top-0 left-0 right-0 z-30 glass border-b border-border px-5 py-4 flex items-center gap-3 max-w-lg mx-auto">
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
        <div className="flex-1 overflow-y-auto px-4 py-4 pt-20 pb-36 space-y-3 relative z-0">
          <AnimatePresence>
            {messages.map((msg) => (
              <MessageBubble
                key={msg.id}
                id={msg.id}
                content={msg.content}
                created_at={msg.created_at}
                read_at={msg.read_at}
                image_url={msg.image_url}
                isMe={msg.sender_id === user?.id}
                userId={user?.id || ""}
                coupleId={profile.couple_id!}
                reactions={reactions.filter((r) => r.message_id === msg.id)}
                onDeleted={(deletedId) => setMessages((prev) => prev.filter((m) => m.id !== deletedId))}
                onImageClick={setFullscreenImage}
              />
            ))}
          </AnimatePresence>
          {partnerIsTyping && (
            <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex justify-start">
              <div className="bg-card shadow-soft rounded-2xl rounded-bl-md px-4 py-2.5 flex items-center gap-2">
                <span className="text-xs text-muted-foreground font-medium">typing</span>
                <span className="flex items-center gap-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: "300ms" }} />
                </span>
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="fixed bottom-16 left-0 right-0 z-30 glass border-t border-border px-4 py-3 max-w-lg mx-auto">
          {/* Image preview */}
          <AnimatePresence>
            {imagePreview && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="mb-2 relative inline-block"
              >
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="h-20 w-20 object-cover rounded-xl border border-border"
                />
                <button
                  onClick={clearSelectedImage}
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center"
                >
                  <X className="w-3 h-3" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex items-center gap-2 bg-secondary rounded-full px-4 py-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageSelect}
              accept="image/*"
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-9 h-9 rounded-full flex items-center justify-center text-muted-foreground hover:text-primary transition-colors hover:bg-primary/10 active:scale-95"
            >
              <ImagePlus className="w-5 h-5" />
            </button>
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
              disabled={(!input.trim() && !selectedImage) || sending}
              className="w-9 h-9 gradient-rose rounded-full flex items-center justify-center disabled:opacity-40 transition-opacity active:scale-95"
            >
              {uploading ? (
                <Loader2 className="w-4 h-4 text-primary-foreground animate-spin" />
              ) : (
                <Send className="w-4 h-4 text-primary-foreground" />
              )}
            </button>
          </div>
        </div>
      </div>

      <FullscreenImage src={fullscreenImage} onClose={() => setFullscreenImage(null)} />
    </>
  );
};

export default Chat;
