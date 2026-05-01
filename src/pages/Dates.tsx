import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Sparkles, MapPin, Clock, ChevronRight, Plus, Heart, Flame, Trash2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

interface DateIdea {
  id: string;
  title: string;
  description: string;
  duration: string;
  emoji: string;
  category: string;
  is_fantasy?: boolean;
  created_by?: string;
  creator_name?: string;
}

const genericDateIdeas: DateIdea[] = [
  { id: "g1", title: "Stargazing Picnic", description: "Pack a blanket, some wine, and find a quiet spot under the stars", duration: "2-3 hrs", emoji: "🌌", category: "Outdoor" },
  { id: "g2", title: "Cook-off Challenge", description: "Pick a random ingredient and compete to make the best dish", duration: "1-2 hrs", emoji: "👨‍🍳", category: "At Home" },
  { id: "g3", title: "Sunset Boat Ride", description: "Rent a paddleboat or kayak and watch the sunset on the water", duration: "2 hrs", emoji: "🚣", category: "Adventure" },
  { id: "g4", title: "Art Museum Date", description: "Explore local galleries and discuss your favorite pieces", duration: "2-3 hrs", emoji: "🎨", category: "Cultural" },
  { id: "g5", title: "Love Letter Café", description: "Go to a cozy café and write each other love letters", duration: "1 hr", emoji: "💌", category: "Romantic" },
  { id: "g6", title: "Movie Marathon", description: "Build a blanket fort and binge your favorite movies together", duration: "4+ hrs", emoji: "🎬", category: "At Home" },
  { id: "g7", title: "Farmers Market Stroll", description: "Explore local produce and pick fresh ingredients to cook together", duration: "1-2 hrs", emoji: "🌻", category: "Outdoor" },
  { id: "g8", title: "Dance Under the Rain", description: "Next time it rains, step outside and dance together", duration: "30 min", emoji: "🌧️", category: "Spontaneous" },
  { id: "g9", title: "Spa Night at Home", description: "Face masks, candles, massage oils — pamper each other", duration: "2 hrs", emoji: "🧖", category: "At Home" },
  { id: "g10", title: "Hiking Adventure", description: "Find a scenic trail and enjoy nature's beauty together", duration: "3-4 hrs", emoji: "🥾", category: "Adventure" },
  { id: "g11", title: "Karaoke Night", description: "Sing your hearts out at a karaoke bar or at home", duration: "2 hrs", emoji: "🎤", category: "Fun" },
  { id: "g12", title: "Breakfast in Bed", description: "Surprise your partner with their favorite breakfast", duration: "1 hr", emoji: "🥞", category: "Romantic" },
];

const categoryEmojis: Record<string, string> = {
  Outdoor: "🌿", "At Home": "🏠", Adventure: "⛰️", Cultural: "🎭",
  Romantic: "💕", Spontaneous: "✨", Fun: "🎉", Custom: "💡", Fantasy: "🔥",
};

const emojiOptions = ["💡", "🔥", "💋", "🌹", "🍷", "🛁", "🏖️", "🎭", "🎵", "🌙"];

const Dates = () => {
  const [customIdeas, setCustomIdeas] = useState<DateIdea[]>([]);
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [emoji, setEmoji] = useState("💡");
  const [duration, setDuration] = useState("");
  const [isFantasy, setIsFantasy] = useState(false);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<"ideas" | "custom" | "fantasies">("ideas");
  const { user, profile, partner } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!profile?.couple_id) return;
    const fetchCustomIdeas = async () => {
      const { data } = await supabase
        .from("date_ideas")
        .select("*")
        .eq("couple_id", profile.couple_id)
        .order("created_at", { ascending: false });

      if (data) {
        // Map creator names
        const ideas = data.map((idea) => ({
          ...idea,
          creator_name:
            idea.created_by === user?.id
              ? profile.display_name
              : partner?.display_name || "Partner",
        }));
        setCustomIdeas(ideas);
      }
    };
    fetchCustomIdeas();
  }, [profile?.couple_id, user?.id, partner?.display_name]);

  // Realtime subscription
  useEffect(() => {
    if (!profile?.couple_id) return;
    const channel = supabase
      .channel("date-ideas-realtime")
      .on("postgres_changes", {
        event: "*",
        schema: "public",
        table: "date_ideas",
        filter: `couple_id=eq.${profile.couple_id}`,
      }, (payload) => {
        if (payload.eventType === "INSERT") {
          const newIdea = payload.new as DateIdea;
          setCustomIdeas((prev) => [{
            ...newIdea,
            creator_name: newIdea.created_by === user?.id ? profile?.display_name : partner?.display_name || "Partner",
          }, ...prev]);
        } else if (payload.eventType === "DELETE") {
          setCustomIdeas((prev) => prev.filter((i) => i.id !== (payload.old as DateIdea).id));
        }
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [profile?.couple_id, user?.id, partner?.display_name]);

  const addIdea = async () => {
    if (!title.trim() || !description.trim() || !profile?.couple_id || !user) return;
    setLoading(true);

    const { error } = await supabase.from("date_ideas").insert({
      couple_id: profile.couple_id,
      created_by: user.id,
      title: title.trim(),
      description: description.trim(),
      emoji,
      duration: duration.trim() || null,
      is_fantasy: isFantasy,
      category: isFantasy ? "Fantasy" : "Custom",
    });

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setTitle(""); setDescription(""); setEmoji("💡"); setDuration(""); setIsFantasy(false);
      setOpen(false);
      toast({ title: isFantasy ? "Fantasy added! 🔥" : "Date idea added! 💡" });
    }
    setLoading(false);
  };

  const deleteIdea = async (id: string) => {
    const { error } = await supabase.from("date_ideas").delete().eq("id", id);
    if (!error) {
      setCustomIdeas((prev) => prev.filter((i) => i.id !== id));
    }
  };

  const customDateIdeas = customIdeas.filter((i) => !i.is_fantasy);
  const fantasies = customIdeas.filter((i) => i.is_fantasy);

  // Random featured idea from generic
  const featured = genericDateIdeas[Math.floor(Date.now() / 86400000) % genericDateIdeas.length];

  if (!profile?.couple_id) {
    return (
      <div className="flex flex-col items-center justify-center h-screen px-6 text-center">
        <Heart className="w-16 h-16 text-primary mb-4" />
        <h2 className="font-serif text-xl font-bold text-foreground mb-2">Connect with your partner first</h2>
        <p className="text-muted-foreground">Explore date ideas together once you're connected</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col pb-20">
      {/* Header */}
      <div className="px-5 pt-6 pb-2">
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="w-5 h-5 text-primary" />
          <h1 className="font-serif text-2xl font-bold text-foreground">Date Ideas</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Curated experiences to keep the spark alive ✨
        </p>
      </div>

      {/* Tabs */}
      <div className="px-5 mt-3 flex gap-2">
        {[
          { key: "ideas" as const, label: "Ideas", icon: "💡" },
          { key: "custom" as const, label: "Ours", icon: "💕" },
          { key: "fantasies" as const, label: "Fantasies", icon: "🔥" },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex-1 py-2.5 rounded-2xl text-sm font-medium transition-all ${
              tab === t.key
                ? "gradient-rose text-primary-foreground shadow-rose"
                : "bg-card text-muted-foreground"
            }`}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* Featured (only on Ideas tab) */}
      {tab === "ideas" && (
        <>
          <div className="px-5 mt-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="gradient-rose rounded-3xl p-5 shadow-rose"
            >
              <span className="text-xs text-primary-foreground/70 font-medium uppercase tracking-wider">
                Today's pick
              </span>
              <h2 className="font-serif text-xl font-bold text-primary-foreground mt-1">
                {featured.emoji} {featured.title}
              </h2>
              <p className="text-sm text-primary-foreground/80 mt-2">{featured.description}</p>
              <div className="flex items-center gap-4 mt-3">
                <span className="flex items-center gap-1 text-xs text-primary-foreground/70">
                  <Clock className="w-3 h-3" /> {featured.duration}
                </span>
                <span className="flex items-center gap-1 text-xs text-primary-foreground/70">
                  <MapPin className="w-3 h-3" /> {featured.category}
                </span>
              </div>
            </motion.div>
          </div>

          <div className="px-5 mt-6 space-y-3 pb-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              More ideas
            </h3>
            {genericDateIdeas.filter((i) => i.id !== featured.id).map((idea, i) => (
              <motion.div
                key={idea.id}
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="w-full bg-card rounded-2xl p-4 shadow-soft flex items-center gap-4"
              >
                <span className="text-2xl">{idea.emoji}</span>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-card-foreground text-sm">{idea.title}</h4>
                  <p className="text-xs text-muted-foreground mt-0.5 truncate">{idea.description}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                      {idea.category}
                    </Badge>
                    <span className="text-[10px] text-muted-foreground">{idea.duration}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </>
      )}

      {/* Custom ideas tab */}
      {tab === "custom" && (
        <div className="px-5 mt-4 space-y-3 pb-4">
          {customDateIdeas.length === 0 ? (
            <div className="text-center py-12">
              <Sparkles className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground text-sm">No custom date ideas yet</p>
              <p className="text-muted-foreground text-xs mt-1">Tap + to add your first idea!</p>
            </div>
          ) : (
            customDateIdeas.map((idea, i) => (
              <motion.div
                key={idea.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-card rounded-2xl p-4 shadow-soft relative group"
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{idea.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-card-foreground text-sm">{idea.title}</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">{idea.description}</p>
                    <div className="flex items-center gap-2 mt-2">
                      {idea.duration && (
                        <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {idea.duration}
                        </span>
                      )}
                      <span className="text-[10px] text-primary font-medium">
                        Added by {idea.creator_name}
                      </span>
                    </div>
                  </div>
                  {idea.created_by === user?.id && (
                    <button
                      onClick={() => deleteIdea(idea.id)}
                      className="opacity-0 group-hover:opacity-100 active:opacity-100 transition-opacity p-1"
                    >
                      <Trash2 className="w-4 h-4 text-muted-foreground hover:text-destructive" />
                    </button>
                  )}
                </div>
              </motion.div>
            ))
          )}
        </div>
      )}

      {/* Fantasies tab */}
      {tab === "fantasies" && (
        <div className="px-5 mt-4 space-y-3 pb-4">
          {fantasies.length === 0 ? (
            <div className="text-center py-12">
              <Flame className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground text-sm">No fantasies shared yet</p>
              <p className="text-muted-foreground text-xs mt-1">Share something you'd love to explore together 🔥</p>
            </div>
          ) : (
            fantasies.map((idea, i) => (
              <motion.div
                key={idea.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-card rounded-2xl p-4 shadow-soft border border-primary/10 relative group"
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{idea.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-card-foreground text-sm">{idea.title}</h4>
                      <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                        🔥 Fantasy
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{idea.description}</p>
                    <span className="text-[10px] text-primary font-medium mt-2 inline-block">
                      Added by {idea.creator_name}
                    </span>
                  </div>
                  {idea.created_by === user?.id && (
                    <button
                      onClick={() => deleteIdea(idea.id)}
                      className="opacity-0 group-hover:opacity-100 active:opacity-100 transition-opacity p-1"
                    >
                      <Trash2 className="w-4 h-4 text-muted-foreground hover:text-destructive" />
                    </button>
                  )}
                </div>
              </motion.div>
            ))
          )}
        </div>
      )}

      {/* Add Button */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <button className="fixed bottom-24 right-5 z-40 w-14 h-14 gradient-rose rounded-full shadow-rose flex items-center justify-center active:scale-95 transition-transform">
            <Plus className="w-6 h-6 text-primary-foreground" />
          </button>
        </DialogTrigger>
        <DialogContent className="rounded-3xl">
          <DialogHeader>
            <DialogTitle className="font-serif">Add Date Idea</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <Input
              placeholder="Title (e.g. Candlelit dinner)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="rounded-xl"
            />
            <Textarea
              placeholder="Describe the experience..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="rounded-xl min-h-[80px]"
            />
            <Input
              placeholder="Duration (optional, e.g. 2 hrs)"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="rounded-xl"
            />
            <div>
              <p className="text-sm text-muted-foreground mb-2">Pick an emoji</p>
              <div className="flex flex-wrap gap-2">
                {emojiOptions.map((e) => (
                  <button
                    key={e}
                    onClick={() => setEmoji(e)}
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-xl transition-all ${
                      emoji === e ? "bg-primary/20 scale-110" : "bg-secondary hover:scale-105"
                    }`}
                  >
                    {e}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center justify-between bg-secondary/50 rounded-xl px-4 py-3">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-foreground">This is a fantasy</span>
              </div>
              <Switch checked={isFantasy} onCheckedChange={setIsFantasy} />
            </div>
            <Button
              onClick={addIdea}
              disabled={loading || !title.trim() || !description.trim()}
              className="w-full gradient-rose text-primary-foreground rounded-xl"
            >
              {loading ? "Saving..." : isFantasy ? "Add Fantasy 🔥" : "Add Date Idea 💡"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dates;
