import { useState, useEffect } from "react";
import { Plus, Pin, Trash2, Heart } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

interface Note {
  id: string;
  title: string;
  content: string;
  pinned: boolean;
  created_by: string;
}

const colorClasses = [
  "bg-primary/10",
  "bg-peach/30",
  "bg-blush",
  "bg-warm-cream",
];

const Notes = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user, profile } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!profile?.couple_id) return;

    const fetchNotes = async () => {
      const { data } = await supabase
        .from("notes")
        .select("*")
        .eq("couple_id", profile.couple_id)
        .order("pinned", { ascending: false })
        .order("created_at", { ascending: false });

      if (data) setNotes(data);
    };

    fetchNotes();
  }, [profile?.couple_id]);

  const addNote = async () => {
    if (!title.trim() || !content.trim() || !profile?.couple_id || !user) return;
    setLoading(true);

    const { data, error } = await supabase
      .from("notes")
      .insert({
        couple_id: profile.couple_id,
        created_by: user.id,
        title: title.trim(),
        content: content.trim(),
      })
      .select()
      .single();

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else if (data) {
      setNotes((prev) => [data, ...prev]);
      setTitle("");
      setContent("");
      setOpen(false);
      toast({ title: "Note saved! 📝" });
    }

    setLoading(false);
  };

  const togglePin = async (note: Note) => {
    const { error } = await supabase
      .from("notes")
      .update({ pinned: !note.pinned })
      .eq("id", note.id);

    if (!error) {
      setNotes((prev) =>
        prev
          .map((n) => (n.id === note.id ? { ...n, pinned: !n.pinned } : n))
          .sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0))
      );
    }
  };

  const deleteNote = async (id: string) => {
    const { error } = await supabase.from("notes").delete().eq("id", id);
    if (!error) {
      setNotes((prev) => prev.filter((n) => n.id !== id));
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
          Share notes together once you're connected
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col pb-20">
      {/* Header */}
      <div className="px-5 pt-6 pb-4">
        <h1 className="font-serif text-2xl font-bold text-foreground">Shared Notes</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Your shared space for plans & dreams
        </p>
      </div>

      {/* Notes */}
      <div className="px-5 space-y-3 pb-4">
        {notes.map((note, i) => (
          <motion.div
            key={note.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className={`${colorClasses[i % colorClasses.length]} rounded-2xl p-4 relative group`}
          >
            <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => togglePin(note)}>
                <Pin
                  className={`w-4 h-4 transition-colors ${
                    note.pinned ? "text-primary rotate-45" : "text-muted-foreground"
                  }`}
                />
              </button>
              {note.created_by === user?.id && (
                <button onClick={() => deleteNote(note.id)}>
                  <Trash2 className="w-4 h-4 text-muted-foreground hover:text-destructive" />
                </button>
              )}
            </div>
            {note.pinned && (
              <Pin className="absolute top-3 right-3 w-3.5 h-3.5 text-primary rotate-45 group-hover:opacity-0 transition-opacity" />
            )}
            <h3 className="font-semibold text-foreground">{note.title}</h3>
            <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
              {note.content}
            </p>
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
            <DialogTitle className="font-serif">Add a Note</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <Input
              placeholder="Note title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="rounded-xl"
            />
            <Textarea
              placeholder="What's on your mind?"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="rounded-xl min-h-[100px]"
            />
            <Button
              onClick={addNote}
              disabled={loading || !title.trim() || !content.trim()}
              className="w-full gradient-rose text-primary-foreground rounded-xl"
            >
              Save Note
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Notes;
