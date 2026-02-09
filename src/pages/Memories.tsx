import { useState, useEffect } from "react";
import { Plus, Heart, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

interface Memory {
  id: string;
  title: string;
  emoji: string;
  date: string;
  created_by: string;
}

const emojiOptions = ["🌹", "🌅", "🎶", "👨‍🍳", "🚗", "🎬", "💕", "🏖️", "🎉", "🍷"];
const colorClasses = [
  "bg-primary/10",
  "bg-peach/30",
  "bg-blush",
  "bg-warm-cream",
  "bg-secondary",
];

const Memories = () => {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [title, setTitle] = useState("");
  const [emoji, setEmoji] = useState("💕");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user, profile } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!profile?.couple_id) return;

    const fetchMemories = async () => {
      const { data } = await supabase
        .from("memories")
        .select("*")
        .eq("couple_id", profile.couple_id)
        .order("date", { ascending: false });

      if (data) setMemories(data);
    };

    fetchMemories();
  }, [profile?.couple_id]);

  const addMemory = async () => {
    if (!title.trim() || !profile?.couple_id || !user) return;
    setLoading(true);

    const { data, error } = await supabase
      .from("memories")
      .insert({
        couple_id: profile.couple_id,
        created_by: user.id,
        title: title.trim(),
        emoji,
        date,
      })
      .select()
      .single();

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else if (data) {
      setMemories((prev) => [data, ...prev]);
      setTitle("");
      setEmoji("💕");
      setOpen(false);
      toast({ title: "Memory saved! 💕" });
    }

    setLoading(false);
  };

  const deleteMemory = async (id: string) => {
    const { error } = await supabase.from("memories").delete().eq("id", id);
    if (!error) {
      setMemories((prev) => prev.filter((m) => m.id !== id));
    }
  };

  if (!profile?.couple_id) {
    return (
      <div className="flex flex-col items-center justify-center h-screen px-6 text-center">
        <Heart className="w-16 h-16 text-primary mb-4" />
        <h2 className="font-serif text-xl font-bold text-foreground mb-2">
          Connect with your partner first
        </h2>
        <p className="text-muted-foreground">
          Share memories together once you're connected
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col pb-20">
      {/* Header */}
      <div className="px-5 pt-6 pb-4">
        <h1 className="font-serif text-2xl font-bold text-foreground">Our Memories</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {memories.length} beautiful moments together
        </p>
      </div>

      {/* Grid */}
      <div className="px-5 grid grid-cols-2 gap-3 pb-4">
        {memories.map((memory, i) => (
          <motion.div
            key={memory.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className={`${colorClasses[i % colorClasses.length]} rounded-2xl p-4 relative group`}
          >
            <span className="text-3xl">{memory.emoji}</span>
            <h3 className="font-semibold text-sm text-foreground mt-3">{memory.title}</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              {new Date(memory.date).toLocaleDateString()}
            </p>
            {memory.created_by === user?.id && (
              <button
                onClick={() => deleteMemory(memory.id)}
                className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 className="w-4 h-4 text-muted-foreground hover:text-destructive" />
              </button>
            )}
          </motion.div>
        ))}
      </div>

      {/* Add Button */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <button className="fixed bottom-24 right-5 z-40 w-14 h-14 gradient-rose rounded-full shadow-rose flex items-center justify-center active:scale-95 transition-transform">
            <Plus className="w-6 h-6 text-primary-foreground" />
          </button>
        </DialogTrigger>
        <DialogContent className="rounded-3xl">
          <DialogHeader>
            <DialogTitle className="font-serif">Add a Memory</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <Input
              placeholder="What happened?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
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
                      emoji === e
                        ? "bg-primary/20 scale-110"
                        : "bg-secondary hover:scale-105"
                    }`}
                  >
                    {e}
                  </button>
                ))}
              </div>
            </div>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="rounded-xl"
            />
            <Button
              onClick={addMemory}
              disabled={loading || !title.trim()}
              className="w-full gradient-rose text-primary-foreground rounded-xl"
            >
              Save Memory
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Memories;
