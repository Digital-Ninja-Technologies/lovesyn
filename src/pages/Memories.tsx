import { useState, useEffect, useRef } from "react";
import { Plus, Heart, Trash2, Camera, X, Image as ImageIcon } from "lucide-react";
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
  image_url: string | null;
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
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [viewingMemory, setViewingMemory] = useState<Memory | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast({ title: "Please select an image file", variant: "destructive" });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "Image must be under 5MB", variant: "destructive" });
      return;
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const clearFile = () => {
    setSelectedFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const uploadPhoto = async (file: File): Promise<string | null> => {
    const ext = file.name.split(".").pop();
    const path = `${profile!.couple_id}/${Date.now()}.${ext}`;

    const { error } = await supabase.storage
      .from("memories")
      .upload(path, file, { cacheControl: "3600", upsert: false });

    if (error) {
      console.error("Upload error:", error);
      return null;
    }

    const { data: urlData } = supabase.storage
      .from("memories")
      .getPublicUrl(path);

    return urlData.publicUrl;
  };

  const addMemory = async () => {
    if (!title.trim() || !profile?.couple_id || !user) return;
    setLoading(true);

    let imageUrl: string | null = null;
    if (selectedFile) {
      imageUrl = await uploadPhoto(selectedFile);
      if (!imageUrl) {
        toast({ title: "Failed to upload photo", variant: "destructive" });
        setLoading(false);
        return;
      }
    }

    const { data, error } = await supabase
      .from("memories")
      .insert({
        couple_id: profile.couple_id,
        created_by: user.id,
        title: title.trim(),
        emoji,
        date,
        image_url: imageUrl,
      })
      .select()
      .single();

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else if (data) {
      setMemories((prev) => [data, ...prev]);
      setTitle("");
      setEmoji("💕");
      clearFile();
      setOpen(false);
      toast({ title: "Memory saved! 💕" });
    }

    setLoading(false);
  };

  const deleteMemory = async (id: string) => {
    const memory = memories.find((m) => m.id === id);
    const { error } = await supabase.from("memories").delete().eq("id", id);
    if (!error) {
      setMemories((prev) => prev.filter((m) => m.id !== id));
      // Also delete from storage if there's an image
      if (memory?.image_url) {
        const path = memory.image_url.split("/memories/")[1];
        if (path) {
          await supabase.storage.from("memories").remove([path]);
        }
      }
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
            onClick={() => setViewingMemory(memory)}
            className={`${memory.image_url ? "" : colorClasses[i % colorClasses.length]} rounded-2xl relative group cursor-pointer overflow-hidden ${memory.image_url ? "aspect-square" : "p-4"}`}
          >
            {memory.image_url ? (
              <>
                <img
                  src={memory.image_url}
                  alt={memory.title}
                  className="absolute inset-0 w-full h-full object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <h3 className="font-semibold text-sm text-primary-foreground drop-shadow">{memory.title}</h3>
                  <p className="text-xs text-primary-foreground/70 mt-0.5">
                    {new Date(memory.date).toLocaleDateString()}
                  </p>
                </div>
              </>
            ) : (
              <>
                <span className="text-3xl">{memory.emoji}</span>
                <h3 className="font-semibold text-sm text-foreground mt-3">{memory.title}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {new Date(memory.date).toLocaleDateString()}
                </p>
              </>
            )}
            {memory.created_by === user?.id && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteMemory(memory.id);
                }}
                className="absolute top-2 right-2 bg-destructive/80 backdrop-blur-sm rounded-full p-1.5 opacity-0 group-hover:opacity-100 sm:opacity-0 sm:group-hover:opacity-100 active:opacity-100 transition-opacity"
              >
                <Trash2 className="w-3.5 h-3.5 text-destructive-foreground" />
              </button>
            )}
          </motion.div>
        ))}
      </div>

      {/* View Memory Dialog */}
      <Dialog open={!!viewingMemory} onOpenChange={(o) => !o && setViewingMemory(null)}>
        <DialogContent className="rounded-3xl p-0 overflow-hidden max-w-sm">
          {viewingMemory?.image_url && (
            <img
              src={viewingMemory.image_url}
              alt={viewingMemory.title}
              className="w-full max-h-80 object-cover"
            />
          )}
          <div className="p-5">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl">{viewingMemory?.emoji}</span>
              <h2 className="font-serif text-lg font-bold text-foreground">{viewingMemory?.title}</h2>
            </div>
            <p className="text-sm text-muted-foreground">
              {viewingMemory && new Date(viewingMemory.date).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
            </p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Button */}
      <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) clearFile(); }}>
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

            {/* Photo upload */}
            <div>
              <p className="text-sm text-muted-foreground mb-2">Add a photo</p>
              {previewUrl ? (
                <div className="relative rounded-xl overflow-hidden">
                  <img src={previewUrl} alt="Preview" className="w-full h-40 object-cover rounded-xl" />
                  <button
                    onClick={clearFile}
                    className="absolute top-2 right-2 w-7 h-7 bg-foreground/60 rounded-full flex items-center justify-center"
                  >
                    <X className="w-4 h-4 text-primary-foreground" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full h-28 border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center gap-2 text-muted-foreground hover:border-primary/50 transition-colors"
                >
                  <Camera className="w-6 h-6" />
                  <span className="text-xs">Tap to add photo</span>
                </button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>

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
              {loading ? "Saving..." : "Save Memory"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Memories;
