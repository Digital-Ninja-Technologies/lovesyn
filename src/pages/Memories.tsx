import { useState } from "react";
import { Plus, Heart } from "lucide-react";
import { motion } from "framer-motion";

interface Memory {
  id: number;
  title: string;
  date: string;
  emoji: string;
  color: string;
}

const mockMemories: Memory[] = [
  { id: 1, title: "Our first date", date: "Jun 15, 2025", emoji: "🌹", color: "bg-primary/10" },
  { id: 2, title: "Beach sunset", date: "Jul 22, 2025", emoji: "🌅", color: "bg-peach/30" },
  { id: 3, title: "Concert night", date: "Aug 10, 2025", emoji: "🎶", color: "bg-blush" },
  { id: 4, title: "Cooking together", date: "Sep 5, 2025", emoji: "👨‍🍳", color: "bg-warm-cream" },
  { id: 5, title: "Road trip!", date: "Oct 1, 2025", emoji: "🚗", color: "bg-secondary" },
  { id: 6, title: "Movie marathon", date: "Nov 14, 2025", emoji: "🎬", color: "bg-primary/10" },
];

const Memories = () => {
  const [liked, setLiked] = useState<Set<number>>(new Set([1, 3]));

  const toggleLike = (id: number) => {
    setLiked((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="px-5 pt-6 pb-4">
        <h1 className="font-serif text-2xl font-bold text-foreground">Our Memories</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {mockMemories.length} beautiful moments together
        </p>
      </div>

      {/* Grid */}
      <div className="px-5 grid grid-cols-2 gap-3 pb-4">
        {mockMemories.map((memory, i) => (
          <motion.div
            key={memory.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className={`${memory.color} rounded-2xl p-4 relative group`}
          >
            <span className="text-3xl">{memory.emoji}</span>
            <h3 className="font-semibold text-sm text-foreground mt-3">{memory.title}</h3>
            <p className="text-xs text-muted-foreground mt-0.5">{memory.date}</p>
            <button
              onClick={() => toggleLike(memory.id)}
              className="absolute top-3 right-3"
            >
              <Heart
                className={`w-4 h-4 transition-colors ${
                  liked.has(memory.id)
                    ? "text-primary fill-primary"
                    : "text-muted-foreground"
                }`}
              />
            </button>
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

export default Memories;
