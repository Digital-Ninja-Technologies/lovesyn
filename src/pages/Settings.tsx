import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Camera, Loader2, Check, ImagePlus, Download, Unlink, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useInstallPWA } from "@/hooks/useInstallPWA";

const EMOJI_OPTIONS = ["💕", "😍", "🥰", "😊", "🦋", "🌸", "🔥", "⭐", "🌙", "🎀", "💜", "🧸"];

const Settings = () => {
  const { user, profile, partner, couplePicUrl, refreshProfile, disconnectPartner, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isInstallable, isInstalled, install } = useInstallPWA();
  const coupleFileInputRef = useRef<HTMLInputElement>(null);

  const [displayName, setDisplayName] = useState(profile?.display_name || "");
  const [avatarEmoji, setAvatarEmoji] = useState(profile?.avatar_emoji || "💕");
  const [uploadingCouple, setUploadingCouple] = useState(false);
  const [saving, setSaving] = useState(false);
  const [autoSaveMedia, setAutoSaveMedia] = useState(() => {
    return localStorage.getItem("lovesync-auto-save-media") !== "false";
  });
  const [notificationSound, setNotificationSound] = useState(() => {
    return localStorage.getItem("lovesync-notification-sound") !== "false";
  });

  const handleAutoSaveToggle = (checked: boolean) => {
    setAutoSaveMedia(checked);
    localStorage.setItem("lovesync-auto-save-media", String(checked));
  };

  const handleNotificationSoundToggle = (checked: boolean) => {
    setNotificationSound(checked);
    localStorage.setItem("lovesync-notification-sound", String(checked));
  };

  const handleCouplePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user || !profile?.couple_id) return;

    setUploadingCouple(true);
    try {
      const fileExt = file.name.split(".").pop();
      const filePath = `${profile.couple_id}/couple.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);
      const url = `${data.publicUrl}?t=${Date.now()}`;

      const { error } = await supabase
        .from("couples")
        .update({ couple_pic_url: url })
        .eq("id", profile.couple_id);

      if (error) throw error;

      await refreshProfile();
      toast({ title: "Couple photo updated! 💕" });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "An error occurred";
      toast({ title: "Upload failed", description: errorMessage, variant: "destructive" });
    } finally {
      setUploadingCouple(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          display_name: displayName,
          avatar_emoji: avatarEmoji,
        })
        .eq("user_id", user.id);

      if (error) throw error;
      await refreshProfile();
      toast({ title: "Profile updated! 💕" });
      navigate("/");
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "An error occurred";
      toast({ title: "Save failed", description: errorMessage, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-1 px-5 pt-6 pb-24">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <button onClick={() => navigate(-1)} className="p-2 rounded-full bg-secondary">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <h1 className="font-serif text-2xl font-bold text-foreground">Profile Settings</h1>
        </div>

        {/* Couple Photo - shown first */}
        {profile?.couple_id && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center mb-8"
          >
            <div
              className="relative w-28 h-28 rounded-full overflow-hidden bg-secondary border-4 border-primary/20 cursor-pointer group"
              onClick={() => coupleFileInputRef.current?.click()}
            >
              {couplePicUrl ? (
                <img src={couplePicUrl} alt="Couple" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-5xl">
                  {avatarEmoji}
                </div>
              )}
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                {uploadingCouple ? (
                  <Loader2 className="w-6 h-6 text-white animate-spin" />
                ) : (
                  <Camera className="w-6 h-6 text-white" />
                )}
              </div>
            </div>
            <input
              ref={coupleFileInputRef}
              type="file"
              accept="image/*"
              onChange={handleCouplePhotoUpload}
              className="hidden"
            />
            <p className="text-xs text-muted-foreground mt-2">Tap to change couple photo</p>
          </motion.div>
        )}

        {/* Display Name */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card rounded-3xl p-5 shadow-soft border border-border mb-4"
        >
          <label className="text-sm text-muted-foreground mb-2 block">Display Name</label>
          <Input
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="h-12 rounded-xl bg-secondary border-0 text-lg"
            placeholder="Your name"
          />
        </motion.div>

        {/* Avatar Emoji */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card rounded-3xl p-5 shadow-soft border border-border mb-8"
        >
          <label className="text-sm text-muted-foreground mb-3 block">Avatar Emoji</label>
          <div className="grid grid-cols-6 gap-2">
            {EMOJI_OPTIONS.map((emoji) => (
              <button
                key={emoji}
                onClick={() => setAvatarEmoji(emoji)}
                className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl transition-all ${
                  avatarEmoji === emoji
                    ? "bg-primary/15 ring-2 ring-primary scale-110"
                    : "bg-secondary hover:scale-105"
                }`}
              >
                {emoji}
              </button>
            ))}
          </div>
        </motion.div>


        {/* Auto-Save Media */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-card rounded-3xl p-5 shadow-soft border border-border mb-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-foreground block">Auto-Save Media</label>
              <p className="text-xs text-muted-foreground mt-0.5">Automatically download shared photos to your device</p>
            </div>
            <Switch checked={autoSaveMedia} onCheckedChange={handleAutoSaveToggle} />
          </div>
        </motion.div>

        {/* Notification Sound */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="bg-card rounded-3xl p-5 shadow-soft border border-border mb-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-foreground block">Notification Sound</label>
              <p className="text-xs text-muted-foreground mt-0.5">Play a sound when you receive a message</p>
            </div>
            <Switch checked={notificationSound} onCheckedChange={handleNotificationSoundToggle} />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-card rounded-3xl p-5 shadow-soft border border-border mb-8"
        >
          <label className="text-sm text-muted-foreground mb-3 block">Install App</label>
          {isInstalled ? (
            <p className="text-sm text-foreground flex items-center gap-2">✅ LoveSync is installed on your device</p>
          ) : isInstallable ? (
            <Button
              onClick={install}
              variant="outline"
              className="w-full h-12 rounded-xl font-semibold"
            >
              <Download className="w-5 h-5 mr-2" /> Add to Home Screen
            </Button>
          ) : (
            <div className="space-y-2">
              <p className="text-sm text-foreground">To install LoveSync as an app:</p>
              <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                <li><span className="font-medium text-foreground">Chrome/Edge:</span> Tap the menu (⋮) → "Install app"</li>
                <li><span className="font-medium text-foreground">Safari (iOS):</span> Tap Share (↑) → "Add to Home Screen"</li>
              </ul>
            </div>
          )}
        </motion.div>

        {/* Disconnect Partner */}
        {profile?.couple_id && partner && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-card rounded-3xl p-5 shadow-soft border border-destructive/20 mb-8"
          >
            <label className="text-sm text-muted-foreground mb-3 block">Partner Connection</label>
            <p className="text-sm text-foreground mb-3">Connected with <span className="font-semibold">{partner.display_name}</span></p>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="w-full h-12 rounded-xl font-semibold">
                  <Unlink className="w-5 h-5 mr-2" /> Disconnect Partner
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="rounded-2xl">
                <AlertDialogHeader>
                  <AlertDialogTitle>Disconnect from {partner.display_name}?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will unlink your accounts. Shared memories, notes, and messages will no longer be accessible. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    className="rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    onClick={async () => {
                      const { error } = await disconnectPartner();
                      if (error) {
                        toast({ title: "Failed to disconnect", description: error.message, variant: "destructive" });
                      } else {
                        toast({ title: "Partner disconnected" });
                        navigate("/");
                      }
                    }}
                  >
                    Disconnect
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </motion.div>
        )}

        {/* Save Button */}
        <Button
          onClick={handleSave}
          disabled={saving || !displayName.trim()}
          className="w-full h-12 rounded-xl gradient-rose text-primary-foreground shadow-rose font-semibold"
        >
          {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Check className="w-5 h-5 mr-2" />Save Changes</>}
        </Button>

        {/* Sign Out */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-6"
        >
          <Button
            variant="outline"
            onClick={async () => {
              await signOut();
              navigate("/landing");
            }}
            className="w-full h-12 rounded-xl font-semibold text-muted-foreground"
          >
            <LogOut className="w-5 h-5 mr-2" /> Sign Out
          </Button>
        </motion.div>
      </div>
    </div>
  );
};

export default Settings;
