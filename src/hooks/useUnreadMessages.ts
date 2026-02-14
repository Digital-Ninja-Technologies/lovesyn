import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "react-router-dom";

const getStorageKey = (userId: string) => `lovesync_last_read_chat_${userId}`;

export function useUnreadMessages() {
  const { user, profile, partner } = useAuth();
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);

  const getLastReadAt = useCallback(() => {
    if (!user) return null;
    const stored = localStorage.getItem(getStorageKey(user.id));
    return stored || new Date(0).toISOString();
  }, [user]);

  const markAsRead = useCallback(() => {
    if (!user) return;
    localStorage.setItem(getStorageKey(user.id), new Date().toISOString());
    setUnreadCount(0);
  }, [user]);

  const fetchUnreadCount = useCallback(async () => {
    if (!user || !profile?.couple_id) return;
    const lastReadAt = getLastReadAt();
    if (!lastReadAt) return;

    const { count } = await supabase
      .from("messages")
      .select("*", { count: "exact", head: true })
      .eq("couple_id", profile.couple_id)
      .neq("sender_id", user.id)
      .gt("created_at", lastReadAt);

    setUnreadCount(count || 0);
  }, [user, profile?.couple_id, getLastReadAt]);

  useEffect(() => {
    fetchUnreadCount();
  }, [fetchUnreadCount]);

  // Listen for new messages in realtime
  useEffect(() => {
    if (!profile?.couple_id || !user) return;

    const channel = supabase
      .channel("unread-messages")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `couple_id=eq.${profile.couple_id}`,
        },
        (payload) => {
          const msg = payload.new as { sender_id: string; content: string };
          if (msg.sender_id !== user.id) {
            setUnreadCount((prev) => prev + 1);
            // Send notification if not on chat page
            if (location.pathname !== "/chat" && "Notification" in window && Notification.permission === "granted") {
              new Notification(`${partner?.display_name || "Your Love"} 💕`, {
                body: msg.content,
                icon: "/favicon.ico",
              });
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profile?.couple_id, user]);

  return { unreadCount, markAsRead, fetchUnreadCount };
}
