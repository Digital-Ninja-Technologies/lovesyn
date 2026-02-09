import { useState, useEffect } from "react";
import { Heart, Calendar, Clock, LogOut, Link } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import heroImage from "@/assets/hero-couple.jpg";

const Index = () => {
  const { user, profile, partner, signOut } = useAuth();
  const navigate = useNavigate();
  const [moodSent, setMoodSent] = useState(false);

  // Calculate days together
  const daysInLove = profile?.couple_id ? 1 : 0;

  const sendMood = async (emoji: string) => {
    if (!profile?.couple_id || !user) return;

    await supabase.from("moods").insert({
      user_id: user.id,
      couple_id: profile.couple_id,
      emoji,
    });

    setMoodSent(true);
  };

  const handleLogout = async () => {
    await signOut();
    navigate("/auth");
  };

  // If not connected to partner, show connect screen
  if (profile && !profile.couple_id) {
    return (
      <div className="flex flex-col min-h-screen">
        <div className="px-5 pt-6 flex justify-end">
          <button
            onClick={handleLogout}
            className="p-2 rounded-full bg-secondary"
          >
            <LogOut className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-24 h-24 gradient-rose rounded-full flex items-center justify-center mb-6 shadow-rose"
          >
            <Link className="w-12 h-12 text-primary-foreground" />
          </motion.div>
          <h1 className="font-serif text-2xl font-bold text-foreground mb-2">
            Welcome, {profile.display_name}! 💕
          </h1>
          <p className="text-muted-foreground mb-6">
            Connect with your partner to start your journey together
          </p>
          <button
            onClick={() => navigate("/connect")}
            className="gradient-rose text-primary-foreground px-8 py-3 rounded-full font-semibold shadow-rose"
          >
            Connect Partner
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col pb-20">
      {/* Header with logout */}
      <div className="absolute top-4 right-4 z-10">
        <button
          onClick={handleLogout}
          className="p-2 rounded-full bg-white/20 backdrop-blur-sm"
        >
          <LogOut className="w-5 h-5 text-white" />
        </button>
      </div>

      {/* Hero Section */}
      <div className="relative h-72 overflow-hidden">
        <img
          src={heroImage}
          alt="Couple silhouette"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background" />
        <div className="absolute bottom-6 left-5 right-5">
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-bold text-primary-foreground drop-shadow-lg"
          >
            {profile?.display_name} & {partner?.display_name || "Your Love"}
          </motion.h1>
        </div>
      </div>

      {/* Love Counter */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mx-5 -mt-4 relative z-10"
      >
        <div className="gradient-rose rounded-3xl p-5 shadow-rose text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <Heart className="w-5 h-5 text-primary-foreground" fill="currentColor" />
            <span className="text-primary-foreground/80 text-sm font-medium">
              Together
            </span>
          </div>
          <span className="text-4xl font-serif font-bold text-primary-foreground">
            Connected
          </span>
          <span className="text-primary-foreground/80 text-sm ml-1">💕</span>
        </div>
      </motion.div>

      {/* Quick Stats */}
      <div className="px-5 mt-6 grid grid-cols-2 gap-3">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-card rounded-2xl p-4 shadow-soft"
        >
          <Calendar className="w-5 h-5 text-primary mb-2" />
          <p className="text-sm text-muted-foreground">Your code</p>
          <p className="font-semibold text-card-foreground font-mono">
            {profile?.partner_code}
          </p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.35 }}
          className="bg-card rounded-2xl p-4 shadow-soft"
        >
          <Clock className="w-5 h-5 text-primary mb-2" />
          <p className="text-sm text-muted-foreground">Partner's emoji</p>
          <p className="font-semibold text-card-foreground text-xl">
            {partner?.avatar_emoji || "💕"}
          </p>
        </motion.div>
      </div>

      {/* Mood */}
      <div className="px-5 mt-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="gradient-warm rounded-2xl p-5"
        >
          <h2 className="font-serif text-lg font-semibold text-foreground mb-3">
            {moodSent ? "Mood sent! 💕" : "How are you feeling?"}
          </h2>
          <div className="flex gap-3">
            {["😍", "🥰", "😊", "🤗", "💋"].map((emoji) => (
              <button
                key={emoji}
                onClick={() => sendMood(emoji)}
                disabled={moodSent}
                className="w-12 h-12 rounded-full bg-card shadow-soft flex items-center justify-center text-xl hover:scale-110 transition-transform active:scale-95 disabled:opacity-50"
              >
                {emoji}
              </button>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Love Note */}
      <div className="px-5 mt-6 mb-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-card rounded-2xl p-5 shadow-soft border border-border"
        >
          <p className="text-sm text-muted-foreground mb-1">Daily love note 💌</p>
          <p className="font-serif text-lg text-card-foreground italic">
            "Every moment with you feels like a beautiful dream I never want to wake up from."
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Index;
