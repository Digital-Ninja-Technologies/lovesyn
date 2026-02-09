import { Heart, Calendar, Clock } from "lucide-react";
import { motion } from "framer-motion";
import heroImage from "@/assets/hero-couple.jpg";

const Index = () => {
  const daysInLove = 247; // Mock data
  const partnerName = "Your Love";

  return (
    <div className="flex flex-col">
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
            You & {partnerName}
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
              Together for
            </span>
          </div>
          <span className="text-4xl font-serif font-bold text-primary-foreground">
            {daysInLove}
          </span>
          <span className="text-primary-foreground/80 text-sm ml-1">days</span>
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
          <p className="text-sm text-muted-foreground">Next date</p>
          <p className="font-semibold text-card-foreground">Saturday ✨</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.35 }}
          className="bg-card rounded-2xl p-4 shadow-soft"
        >
          <Clock className="w-5 h-5 text-primary mb-2" />
          <p className="text-sm text-muted-foreground">Anniversary</p>
          <p className="font-semibold text-card-foreground">118 days</p>
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
            How are you feeling?
          </h2>
          <div className="flex gap-3">
            {["😍", "🥰", "😊", "🤗", "💋"].map((emoji, i) => (
              <button
                key={i}
                className="w-12 h-12 rounded-full bg-card shadow-soft flex items-center justify-center text-xl hover:scale-110 transition-transform active:scale-95"
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
