import { motion } from "framer-motion";
import { Sparkles, MapPin, Clock, ChevronRight } from "lucide-react";

interface DateIdea {
  id: number;
  title: string;
  description: string;
  duration: string;
  emoji: string;
  category: string;
}

const dateIdeas: DateIdea[] = [
  {
    id: 1,
    title: "Stargazing Picnic",
    description: "Pack a blanket, some wine, and find a quiet spot under the stars",
    duration: "2-3 hrs",
    emoji: "🌌",
    category: "Outdoor",
  },
  {
    id: 2,
    title: "Cook-off Challenge",
    description: "Pick a random ingredient and compete to make the best dish",
    duration: "1-2 hrs",
    emoji: "👨‍🍳",
    category: "At Home",
  },
  {
    id: 3,
    title: "Sunset Boat Ride",
    description: "Rent a paddleboat or kayak and watch the sunset on the water",
    duration: "2 hrs",
    emoji: "🚣",
    category: "Adventure",
  },
  {
    id: 4,
    title: "Art Museum Date",
    description: "Explore local galleries and discuss your favorite pieces",
    duration: "2-3 hrs",
    emoji: "🎨",
    category: "Cultural",
  },
  {
    id: 5,
    title: "Love Letter Café",
    description: "Go to a cozy café and write each other love letters",
    duration: "1 hr",
    emoji: "💌",
    category: "Romantic",
  },
];

const Dates = () => {
  return (
    <div className="flex flex-col">
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

      {/* Featured */}
      <div className="px-5 mt-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="gradient-rose rounded-3xl p-5 shadow-rose"
        >
          <span className="text-xs text-primary-foreground/70 font-medium uppercase tracking-wider">
            Tonight's pick
          </span>
          <h2 className="font-serif text-xl font-bold text-primary-foreground mt-1">
            {dateIdeas[0].emoji} {dateIdeas[0].title}
          </h2>
          <p className="text-sm text-primary-foreground/80 mt-2">
            {dateIdeas[0].description}
          </p>
          <div className="flex items-center gap-4 mt-3">
            <span className="flex items-center gap-1 text-xs text-primary-foreground/70">
              <Clock className="w-3 h-3" /> {dateIdeas[0].duration}
            </span>
            <span className="flex items-center gap-1 text-xs text-primary-foreground/70">
              <MapPin className="w-3 h-3" /> {dateIdeas[0].category}
            </span>
          </div>
        </motion.div>
      </div>

      {/* All Ideas */}
      <div className="px-5 mt-6 space-y-3 pb-4">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          More ideas
        </h3>
        {dateIdeas.slice(1).map((idea, i) => (
          <motion.button
            key={idea.id}
            initial={{ opacity: 0, x: -15 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="w-full bg-card rounded-2xl p-4 shadow-soft flex items-center gap-4 text-left active:scale-[0.98] transition-transform"
          >
            <span className="text-2xl">{idea.emoji}</span>
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-card-foreground text-sm">{idea.title}</h4>
              <p className="text-xs text-muted-foreground mt-0.5 truncate">
                {idea.description}
              </p>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export default Dates;
