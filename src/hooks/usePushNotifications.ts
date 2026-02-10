import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const VAPID_PUBLIC_KEY = ""; // Will be set when edge function generates keys

export function usePushNotifications() {
  const { user } = useAuth();
  const [permission, setPermission] = useState<NotificationPermission>(
    typeof Notification !== "undefined" ? Notification.permission : "default"
  );
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    setIsSupported("Notification" in window && "serviceWorker" in navigator);
  }, []);

  const requestPermission = useCallback(async () => {
    if (!isSupported || !user) return false;

    const result = await Notification.requestPermission();
    setPermission(result);

    if (result === "granted") {
      // Send a welcome notification
      new Notification("LoveSync 💕", {
        body: "You'll now be notified when your partner sends you love!",
        icon: "/favicon.ico",
      });

      return true;
    }
    return false;
  }, [isSupported, user]);

  const sendLocalNotification = useCallback(
    (title: string, body: string) => {
      if (permission !== "granted") return;

      new Notification(title, {
        body,
        icon: "/favicon.ico",
        badge: "/favicon.ico",
      });
    },
    [permission]
  );

  return {
    isSupported,
    permission,
    requestPermission,
    sendLocalNotification,
  };
}
