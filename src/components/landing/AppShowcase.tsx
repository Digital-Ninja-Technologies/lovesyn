import { motion } from "framer-motion";
import { Heart, MessageCircle, Camera, StickyNote, Smile } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

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

const pulse = {
  animate: {
    scale: [1, 1.15, 1],
    transition: { repeat: Infinity, duration: 2, ease: "easeInOut" as const },
  },
};

const wiggle = {
  animate: (i: number) => ({
    rotate: [0, -4, 4, -2, 0],
    transition: { repeat: Infinity, duration: 2.5, delay: i * 0.3, ease: "easeInOut" as const },
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

const ScreenContent = ({ screen, i }: { screen: typeof screens[number]; i: number }) => (
  <>
    {/* Header */}
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ delay: 0.2 + i * 0.1 }}
      className="flex items-center gap-1.5 mb-3"
    >
      <motion.div
        animate={{ rotate: [0, 10, -10, 0] }}
        transition={{ repeat: Infinity, duration: 4, delay: i * 0.5 }}
        className={`w-6 h-6 rounded-full bg-gradient-to-br ${screen.accent} flex items-center justify-center`}
      >
        <screen.icon className="w-3 h-3 text-white" />
      </motion.div>
      <span className="text-xs font-semibold text-foreground">{screen.title}</span>
    </motion.div>

    {/* Chat screen */}
    {screen.bubbles && (
      <div className="flex flex-col gap-1.5 flex-1">
        {screen.bubbles.map((bubble, j) => (
          <motion.div
            key={j}
            initial={{ opacity: 0, x: bubble.align === "left" ? -20 : 20, scale: 0.8 }}
            whileInView={{ opacity: 1, x: 0, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 + j * 0.25, type: "spring", stiffness: 200 }}
            className={`flex ${bubble.align === "right" ? "justify-end" : "justify-start"}`}
          >
            <motion.span
              whileHover={{ scale: 1.05 }}
              className={`text-[10px] sm:text-xs px-2.5 py-1.5 rounded-2xl max-w-[85%] ${
                bubble.align === "right"
                  ? "bg-primary text-primary-foreground rounded-br-md"
                  : "bg-card text-card-foreground border border-border rounded-bl-md"
              }`}
            >
              {bubble.text}
            </motion.span>
          </motion.div>
        ))}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 1.2 }}
          className="flex items-center gap-1 mt-1"
        >
          <span className="text-[10px] text-muted-foreground">typing</span>
          <span className="flex gap-0.5">
            {[0, 1, 2].map((d) => (
              <motion.span
                key={d}
                animate={{ y: [0, -3, 0], opacity: [0.4, 1, 0.4] }}
                transition={{ repeat: Infinity, duration: 0.8, delay: d * 0.15 }}
                className="w-1 h-1 rounded-full bg-muted-foreground/50"
              />
            ))}
          </span>
        </motion.div>
      </div>
    )}

    {/* Memories screen */}
    {screen.memories && (
      <div className="grid grid-cols-3 gap-1.5 flex-1">
        {screen.memories.map((emoji, j) => (
          <motion.div
            key={j}
            initial={{ opacity: 0, scale: 0, rotate: -20 }}
            whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 + j * 0.1, type: "spring", stiffness: 250 }}
            whileHover={{ scale: 1.2, rotate: 5 }}
            className="bg-card border border-border rounded-xl flex items-center justify-center aspect-square text-lg sm:text-xl cursor-default"
          >
            <motion.span custom={j} animate="animate" variants={wiggle}>
              {emoji}
            </motion.span>
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
            initial={{ opacity: 0, y: 15, rotateX: -30 }}
            whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 + j * 0.2, type: "spring" }}
            whileHover={{ scale: 1.03, y: -2 }}
            className="bg-card border border-border rounded-xl p-2 relative"
          >
            <p className="text-[10px] sm:text-xs text-card-foreground leading-snug">{note.text}</p>
            {note.pinned && (
              <motion.span
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ repeat: Infinity, duration: 3 }}
                className="absolute -top-1.5 -right-1.5 text-xs"
              >
                📌
              </motion.span>
            )}
          </motion.div>
        ))}
        <div className="mt-auto flex justify-center">
          <motion.div animate="animate" variants={pulse}>
            <Heart className="w-4 h-4 text-primary/40" fill="currentColor" />
          </motion.div>
        </div>
      </div>
    )}

    {/* Mood screen */}
    {screen.moods && (
      <div className="flex flex-col items-center justify-center gap-3 flex-1">
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="text-[10px] text-muted-foreground"
        >
          How are you feeling?
        </motion.p>
        <div className="flex gap-2">
          {screen.moods.map((mood, j) => (
            <motion.span
              key={j}
              initial={{ opacity: 0, scale: 0, y: 20 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 + j * 0.12, type: "spring", stiffness: 300 }}
              whileHover={{ scale: 1.4, y: -5 }}
              className="text-lg sm:text-xl cursor-default"
            >
              {mood}
            </motion.span>
          ))}
        </div>
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 1, type: "spring" }}
          animate={{ scale: [1, 1.05, 1] }}
          className="text-[10px] text-primary font-medium bg-primary/10 px-2 py-0.5 rounded-full"
        >
          You're both feeling 🥰
        </motion.div>
      </div>
    )}
  </>
);

/* Phone mockup for mobile */
const PhoneMockup = ({ screen, i }: { screen: typeof screens[number]; i: number }) => (
  <motion.div
    whileHover={{ y: -6, scale: 1.02 }}
    transition={{ type: "spring", stiffness: 300, damping: 20 }}
    className="bg-card rounded-3xl border-2 border-border shadow-soft p-3 pt-5 group-hover:shadow-rose transition-shadow duration-300"
  >
    {/* Phone notch */}
    <div className="w-16 h-1.5 bg-border rounded-full mx-auto mb-3" />
    <div className="bg-muted/30 rounded-2xl p-3 min-h-[180px] sm:min-h-[200px] flex flex-col">
      <ScreenContent screen={screen} i={i} />
    </div>
    {/* Phone home bar */}
    <div className="w-12 h-1 bg-border rounded-full mx-auto mt-3" />
  </motion.div>
);

/* Desktop/browser mockup for desktop */
const DesktopMockup = ({ screen, i }: { screen: typeof screens[number]; i: number }) => (
  <motion.div
    whileHover={{ y: -6, scale: 1.02 }}
    transition={{ type: "spring", stiffness: 300, damping: 20 }}
    className="bg-card rounded-2xl border-2 border-border shadow-soft group-hover:shadow-rose transition-shadow duration-300 overflow-hidden"
  >
    {/* Browser toolbar */}
    <div className="flex items-center gap-2 px-3 py-2 bg-muted/50 border-b border-border">
      <div className="flex gap-1.5">
        <span className="w-2.5 h-2.5 rounded-full bg-red-400/70" />
        <span className="w-2.5 h-2.5 rounded-full bg-yellow-400/70" />
        <span className="w-2.5 h-2.5 rounded-full bg-green-400/70" />
      </div>
      <div className="flex-1 flex justify-center">
        <div className="bg-background/60 border border-border rounded-md px-3 py-0.5 text-[9px] text-muted-foreground flex items-center gap-1 max-w-[140px] w-full">
          <span className="text-primary">♥</span>
          <span className="truncate">lovesync.app/{screen.title.toLowerCase().replace(" ", "-")}</span>
        </div>
      </div>
    </div>
    {/* Content area */}
    <div className="p-4 min-h-[220px] flex flex-col">
      <ScreenContent screen={screen} i={i} />
    </div>
  </motion.div>
);

const AppShowcase = () => {
  const isMobile = useIsMobile();

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
            Your love story, {isMobile ? "in your pocket" : "on your screen"} 💕
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

              {isMobile ? (
                <PhoneMockup screen={screen} i={i} />
              ) : (
                <DesktopMockup screen={screen} i={i} />
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AppShowcase;
