import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export function useTypingIndicator() {
  const { user, profile } = useAuth();
  const [partnerIsTyping, setPartnerIsTyping] = useState(false);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSentRef = useRef(0);
  const subscribedRef = useRef(false);

  useEffect(() => {
    if (!profile?.couple_id || !user) return;

    const channel = supabase.channel(`typing:${profile.couple_id}`);
    channelRef.current = channel;

    channel
      .on("broadcast", { event: "typing" }, (payload) => {
        if (payload.payload?.user_id !== user.id) {
          setPartnerIsTyping(true);
          if (timeoutRef.current) clearTimeout(timeoutRef.current);
          timeoutRef.current = setTimeout(() => setPartnerIsTyping(false), 3000);
        }
      })
      .subscribe((status) => {
        subscribedRef.current = status === "SUBSCRIBED";
      });

    return () => {
      subscribedRef.current = false;
      supabase.removeChannel(channel);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [profile?.couple_id, user]);

  const sendTyping = useCallback(() => {
    if (!channelRef.current || !user || !subscribedRef.current) return;
    const now = Date.now();
    if (now - lastSentRef.current < 2000) return;
    lastSentRef.current = now;

    channelRef.current.send({
      type: "broadcast",
      event: "typing",
      payload: { user_id: user.id },
    });
  }, [user]);

  return { partnerIsTyping, sendTyping };
}
