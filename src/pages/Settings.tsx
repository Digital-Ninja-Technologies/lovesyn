import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Camera, Loader2, Check, ImagePlus, Download } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useInstallPWA } from "@/hooks/useInstallPWA";

const EMOJI_OPTIONS = ["💕", "😍", "🥰", "😊", "🦋", "🌸", "🔥", "⭐", "🌙", "🎀", "💜", "🧸"];

const Settings = () => {
  const { user, profile, couplePicUrl, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isInstallable, isInstalled, install } = useInstallPWA();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const coupleFileInputRef = useRef<HTMLInputElement>(null);

  const [displayName, setDisplayName] = useState(profile?.display_name || "");
  const [avatarEmoji, setAvatarEmoji] = useState(profile?.avatar_emoji || "💕");
  const [profilePicUrl, setProfilePicUrl] = useState(profile?.profile_pic_url || "");
  const [uploading, setUploading] = useState(false);
  const [uploadingCouple, setUploadingCouple] = useState(false);
  const [saving, setSaving] = useState(false);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setUploading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const filePath = `${user.id}/avatar.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);
      setProfilePicUrl(`${data.publicUrl}?t=${Date.now()}`);
    } catch (error: any) {
      toast({ title: "Upload failed", description: error.message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
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
    } catch (error: any) {
      toast({ title: "Upload failed", description: error.message, variant: "destructive" });
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
          profile_pic_url: profilePicUrl || null,
        })
        .eq("user_id", user.id);

      if (error) throw error;
      await refreshProfile();
      toast({ title: "Profile updated! 💕" });
      navigate("/");
    } catch (error: any) {
      toast({ title: "Save failed", description: error.message, variant: "destructive" });
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

        {/* Profile Picture */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center mb-8"
        >
          <div
            className="relative w-28 h-28 rounded-full overflow-hidden bg-secondary border-4 border-primary/20 cursor-pointer group"
            onClick={() => fileInputRef.current?.click()}
          >
            {profilePicUrl ? (
              <img src={profilePicUrl} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-5xl">
                {avatarEmoji}
              </div>
            )}
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              {uploading ? (
                <Loader2 className="w-6 h-6 text-white animate-spin" />
              ) : (
                <Camera className="w-6 h-6 text-white" />
              )}
            </div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handlePhotoUpload}
            className="hidden"
          />
          <p className="text-xs text-muted-foreground mt-2">Tap to change photo</p>
        </motion.div>

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

        {/* Couple Photo */}
        {profile?.couple_id && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-card rounded-3xl p-5 shadow-soft border border-border mb-8"
          >
            <label className="text-sm text-muted-foreground mb-3 block">Shared Couple Photo</label>
            <p className="text-xs text-muted-foreground mb-3">This photo appears as the hero image on both your home pages</p>
            <div
              className="relative w-full h-40 rounded-2xl overflow-hidden bg-secondary cursor-pointer group"
              onClick={() => coupleFileInputRef.current?.click()}
            >
              {couplePicUrl ? (
                <img src={couplePicUrl} alt="Couple" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground gap-2">
                  <ImagePlus className="w-8 h-8" />
                  <span className="text-sm">Add a couple photo</span>
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
          </motion.div>
        )}

        {/* Install App */}
        {(isInstallable || isInstalled) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-card rounded-3xl p-5 shadow-soft border border-border mb-8"
          >
            <label className="text-sm text-muted-foreground mb-3 block">Install App</label>
            {isInstalled ? (
              <p className="text-sm text-foreground flex items-center gap-2">✅ LoveSync is installed on your device</p>
            ) : (
              <Button
                onClick={install}
                variant="outline"
                className="w-full h-12 rounded-xl font-semibold"
              >
                <Download className="w-5 h-5 mr-2" /> Add to Home Screen
              </Button>
            )}
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
      </div>
    </div>
  );
};

export default Settings;
