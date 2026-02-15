import { motion } from "framer-motion";
import { Heart, MessageCircle, Camera, StickyNote, Smile } from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.12, duration: 0.6, ease: "easeOut" as const },
  }),
};

const float = {
  animate: (i: number) => ({
    y: [0, -8, 0],
    rotate: [0, i % 2 === 0 ? 3 : -3, 0],
    transition: { repeat: Infinity, duration: 3 + i * 0.5, ease: "easeInOut" as const },
  }),
};

const screens = [
  {
    icon: MessageCircle,
    title: "Sweet Chats",
    emoji: "💬",
    bubbles: [
      { text: "I miss you 🥺", align: "left" as const },
      { text: "Coming home soon! 💕", align: "right" as const },
      { text: "Can't wait ❤️", align: "left" as const },
    ],
    accent: "from-pink-400 to-rose-500",
    decoration: "💌",
  },
  {
    icon: Camera,
    title: "Our Memories",
    emoji: "📸",
    memories: ["🌅", "🎂", "🏖️", "🎄", "🌸", "🎆"],
    accent: "from-amber-400 to-orange-500",
    decoration: "🦋",
  },
  {
    icon: StickyNote,
    title: "Love Notes",
    emoji: "📝",
    notes: [
      { text: "You make me smile every day", pinned: true },
      { text: "Don't forget our dinner date! 🍝", pinned: false },
    ],
    accent: "from-violet-400 to-purple-500",
    decoration: "✨",
  },
  {
    icon: Smile,
    title: "Mood Sync",
    emoji: "😊",
    moods: ["😍", "🥰", "😊", "🤗", "💖"],
    accent: "from-teal-400 to-emerald-500",
    decoration: "🌈",
  },
];

const AppShowcase = () => {
  return (
    <section className="py-20 bg-card/50 overflow-hidden">
      <div className="max-w-5xl mx-auto px-5">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="text-center mb-16"
        >
          <motion.p variants={fadeUp} custom={0} className="text-primary font-semibold text-sm uppercase tracking-wider mb-2">
            A Peek Inside
          </motion.p>
          <motion.h2 variants={fadeUp} custom={1} className="font-serif text-3xl sm:text-4xl font-bold text-foreground mb-3">
            Your love story, in your pocket 💕
          </motion.h2>
          <motion.p variants={fadeUp} custom={2} className="text-muted-foreground max-w-lg mx-auto text-lg">
            Every feature is crafted to make your bond stronger and more joyful.
          </motion.p>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-6">
          {screens.map((screen, i) => (
            <motion.div
              key={screen.title}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-30px" }}
              variants={fadeUp}
              custom={i}
              className="relative group"
            >
              {/* Floating decoration */}
              <motion.span
                custom={i}
                animate="animate"
                variants={float}
                className="absolute -top-3 -right-1 text-2xl z-10 pointer-events-none"
              >
                {screen.decoration}
              </motion.span>

              {/* Phone mockup */}
              <div className="bg-card rounded-3xl border-2 border-border shadow-soft p-3 pt-5 group-hover:shadow-rose transition-shadow duration-300">
                {/* Phone notch */}
                <div className="w-16 h-1.5 bg-border rounded-full mx-auto mb-3" />

                {/* Screen content */}
                <div className="bg-muted/30 rounded-2xl p-3 min-h-[180px] sm:min-h-[200px] flex flex-col">
                  {/* Header */}
                  <div className="flex items-center gap-1.5 mb-3">
                    <div className={`w-6 h-6 rounded-full bg-gradient-to-br ${screen.accent} flex items-center justify-center`}>
                      <screen.icon className="w-3 h-3 text-white" />
                    </div>
                    <span className="text-xs font-semibold text-foreground">{screen.title}</span>
                  </div>

                  {/* Chat screen */}
                  {screen.bubbles && (
                    <div className="flex flex-col gap-1.5 flex-1">
                      {screen.bubbles.map((bubble, j) => (
                        <motion.div
                          key={j}
                          initial={{ opacity: 0, x: bubble.align === "left" ? -10 : 10 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: 0.3 + j * 0.15 }}
                          className={`flex ${bubble.align === "right" ? "justify-end" : "justify-start"}`}
                        >
                          <span
                            className={`text-[10px] sm:text-xs px-2.5 py-1.5 rounded-2xl max-w-[85%] ${
                              bubble.align === "right"
                                ? "bg-primary text-primary-foreground rounded-br-md"
                                : "bg-card text-card-foreground border border-border rounded-bl-md"
                            }`}
                          >
                            {bubble.text}
                          </span>
                        </motion.div>
                      ))}
                      {/* Typing indicator */}
                      <div className="flex items-center gap-1 mt-1">
                        <span className="text-[10px] text-muted-foreground">typing</span>
                        <span className="flex gap-0.5">
                          {[0, 1, 2].map((d) => (
                            <span
                              key={d}
                              className="w-1 h-1 rounded-full bg-muted-foreground/50 animate-bounce"
                              style={{ animationDelay: `${d * 0.15}s` }}
                            />
                          ))}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Memories screen */}
                  {screen.memories && (
                    <div className="grid grid-cols-3 gap-1.5 flex-1">
                      {screen.memories.map((emoji, j) => (
                        <motion.div
                          key={j}
                          initial={{ opacity: 0, scale: 0.8 }}
                          whileInView={{ opacity: 1, scale: 1 }}
                          viewport={{ once: true }}
                          transition={{ delay: 0.3 + j * 0.08 }}
                          className="bg-card border border-border rounded-xl flex items-center justify-center aspect-square text-lg sm:text-xl hover:scale-110 transition-transform cursor-default"
                        >
                          {emoji}
                        </motion.div>
                      ))}
                    </div>
                  )}

                  {/* Notes screen */}
                  {screen.notes && (
                    <div className="flex flex-col gap-1.5 flex-1">
                      {screen.notes.map((note, j) => (
                        <motion.div
                          key={j}
                          initial={{ opacity: 0, y: 8 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: 0.3 + j * 0.15 }}
                          className="bg-card border border-border rounded-xl p-2 relative"
                        >
                          <p className="text-[10px] sm:text-xs text-card-foreground leading-snug">{note.text}</p>
                          {note.pinned && (
                            <span className="absolute -top-1.5 -right-1.5 text-xs">📌</span>
                          )}
                        </motion.div>
                      ))}
                      <div className="mt-auto flex justify-center">
                        <Heart className="w-4 h-4 text-primary/40" fill="currentColor" />
                      </div>
                    </div>
                  )}

                  {/* Mood screen */}
                  {screen.moods && (
                    <div className="flex flex-col items-center justify-center gap-3 flex-1">
                      <p className="text-[10px] text-muted-foreground">How are you feeling?</p>
                      <div className="flex gap-2">
                        {screen.moods.map((mood, j) => (
                          <motion.span
                            key={j}
                            initial={{ opacity: 0, scale: 0 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.3 + j * 0.1, type: "spring" }}
                            className="text-lg sm:text-xl cursor-default hover:scale-125 transition-transform"
                          >
                            {mood}
                          </motion.span>
                        ))}
                      </div>
                      <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.8 }}
                        className="text-[10px] text-primary font-medium bg-primary/10 px-2 py-0.5 rounded-full"
                      >
                        You're both feeling 🥰
                      </motion.div>
                    </div>
                  )}
                </div>

                {/* Phone home bar */}
                <div className="w-12 h-1 bg-border rounded-full mx-auto mt-3" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AppShowcase;
