import { useState } from "react";
import { Plus, Pin } from "lucide-react";
import { motion } from "framer-motion";

interface Note {
  id: number;
  title: string;
  content: string;
  author: string;
  pinned: boolean;
  color: string;
}

const mockNotes: Note[] = [
  {
    id: 1,
    title: "Grocery list 🛒",
    content: "Strawberries, chocolate, wine, pasta, candles",
    author: "You",
    pinned: true,
    color: "bg-primary/10",
  },
  {
    id: 2,
    title: "Bucket list ✈️",
    content: "Paris, Maldives, Japan, Northern Lights, Safari",
    author: "Your Love",
    pinned: true,
    color: "bg-peach/30",
  },
  {
    id: 3,
    title: "Songs for us 🎵",
    content: "Perfect - Ed Sheeran, All of Me - John Legend, Lucky - Jason Mraz",
    author: "You",
    pinned: false,
    color: "bg-blush",
  },
  {
    id: 4,
    title: "Anniversary ideas 🎁",
    content: "Spa day, dinner cruise, photo album, matching jewelry",
    author: "Your Love",
    pinned: false,
    color: "bg-warm-cream",
  },
];

const Notes = () => {
  const [notes] = useState<Note[]>(mockNotes);

  return (
    <div className="flex flex-col">
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
            transition={{ delay: i * 0.1 }}
            className={`${note.color} rounded-2xl p-4 relative`}
          >
            {note.pinned && (
              <Pin className="absolute top-3 right-3 w-3.5 h-3.5 text-primary rotate-45" />
            )}
            <h3 className="font-semibold text-foreground">{note.title}</h3>
            <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
              {note.content}
            </p>
            <p className="text-xs text-muted-foreground/70 mt-3">by {note.author}</p>
          </motion.div>
        ))}
      </div>

      {/* Add Button */}
      <div className="fixed bottom-24 right-5 z-40">
        <button className="w-14 h-14 gradient-rose rounded-full shadow-rose flex items-center justify-center active:scale-95 transition-transform">
          <Plus className="w-6 h-6 text-primary-foreground" />
        </button>
      </div>
    </div>
  );
};

export default Notes;
