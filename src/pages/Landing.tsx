import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Heart,
  MessageCircle,
  Image,
  StickyNote,
  Shield,
  Sparkles,
  ArrowRight,
  Star,
  ChevronDown,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-couple.jpg";
import { useInstallPWA } from "@/hooks/useInstallPWA";

const features = [
  {
    icon: MessageCircle,
    title: "Private Chat",
    description: "A space just for two. Real-time messaging that keeps your conversations intimate and secure.",
  },
  {
    icon: Image,
    title: "Shared Memories",
    description: "Capture and relive your favorite moments together with a beautiful shared timeline.",
  },
  {
    icon: StickyNote,
    title: "Love Notes",
    description: "Leave sweet notes for each other — pin the ones that make your heart skip a beat.",
  },
  {
    icon: Sparkles,
    title: "Daily Mood Sync",
    description: "Share how you're feeling with a single tap. Stay emotionally connected, even apart.",
  },
];

const testimonials = [
  {
    name: "Sarah & James",
    text: "LoveSync helped us stay connected during long distance. It's like having a tiny world just for us.",
    rating: 5,
  },
  {
    name: "Mia & Alex",
    text: "The mood feature is genius! We check in on each other every day. It brought us so much closer.",
    rating: 5,
  },
  {
    name: "Priya & Ravi",
    text: "We love the shared memories timeline. Looking back at our journey together always makes us smile.",
    rating: 5,
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: "easeOut" as const },
  }),
};

const Landing = () => {
  const navigate = useNavigate();
  const { isInstallable, isInstalled, install } = useInstallPWA();

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Sticky Header */}
      <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/50">
        <div className="max-w-5xl mx-auto flex items-center justify-between px-5 h-16">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 gradient-rose rounded-full flex items-center justify-center shadow-rose">
              <Heart className="w-4 h-4 text-primary-foreground" fill="currentColor" />
            </div>
            <span className="font-serif text-xl font-bold text-foreground">LoveSync</span>
          </div>
          <div className="flex items-center gap-2">
            {isInstallable && !isInstalled && (
              <Button
                onClick={install}
                variant="ghost"
                className="text-muted-foreground font-medium"
              >
                <Download className="w-4 h-4 mr-1" /> Install
              </Button>
            )}
            {isInstalled && (
              <span className="text-xs text-muted-foreground flex items-center gap-1">✅ Installed</span>
            )}
            <Button
              variant="ghost"
              onClick={() => navigate("/auth")}
              className="text-muted-foreground font-medium"
            >
              Sign In
            </Button>
            <Button
              onClick={() => navigate("/auth")}
              className="gradient-rose text-primary-foreground shadow-rose rounded-full px-5 font-semibold"
            >
              Get Started
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-16 min-h-[90vh] flex items-center">
        <div className="absolute inset-0">
          <img
            src={heroImage}
            alt="Couple together"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-foreground/60 via-foreground/40 to-background" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-5 py-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="inline-flex items-center gap-1.5 bg-primary/20 backdrop-blur-sm text-primary-foreground text-sm font-medium px-4 py-1.5 rounded-full mb-6 border border-primary-foreground/20">
              <Heart className="w-3.5 h-3.5" fill="currentColor" />
              Built for couples who care
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.15 }}
            className="font-serif text-4xl sm:text-5xl md:text-6xl font-bold text-primary-foreground leading-tight mb-5 drop-shadow-lg"
          >
            Your relationship,
            <br />
            <span className="text-peach">beautifully connected</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-primary-foreground/80 text-lg sm:text-xl max-w-xl mx-auto mb-8 leading-relaxed drop-shadow"
          >
            Chat, share memories, send love notes, and stay emotionally in sync
            — all in one private space made just for you two.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.45 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3"
          >
            <Button
              onClick={() => navigate("/auth")}
              size="lg"
              className="gradient-rose text-primary-foreground shadow-rose rounded-full px-8 py-6 text-lg font-semibold w-full sm:w-auto"
            >
              Start Free <ArrowRight className="w-5 h-5 ml-1" />
            </Button>
            {isInstalled ? (
              <p className="text-primary-foreground/60 text-sm flex items-center gap-1">
                ✅ App installed
              </p>
            ) : (
              <Button
                onClick={isInstallable ? install : undefined}
                size="lg"
                variant="outline"
                className="rounded-full px-8 py-6 text-lg font-semibold border-primary/30 bg-primary/20 text-primary-foreground hover:bg-primary/30 w-full sm:w-auto"
              >
                <Download className="w-5 h-5 mr-1" /> Install App
              </Button>
            )}
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 1.8 }}
          >
            <ChevronDown className="w-6 h-6 text-primary-foreground/50" />
          </motion.div>
        </motion.div>
      </section>

      {/* Social Proof Bar */}
      <section className="py-8 bg-card border-b border-border">
        <div className="max-w-5xl mx-auto px-5 flex flex-wrap items-center justify-center gap-6 text-center">
          <div>
            <p className="font-serif text-2xl font-bold text-foreground">10K+</p>
            <p className="text-sm text-muted-foreground">Happy Couples</p>
          </div>
          <div className="w-px h-8 bg-border hidden sm:block" />
          <div>
            <p className="font-serif text-2xl font-bold text-foreground">4.9 ★</p>
            <p className="text-sm text-muted-foreground">App Rating</p>
          </div>
          <div className="w-px h-8 bg-border hidden sm:block" />
          <div>
            <p className="font-serif text-2xl font-bold text-foreground">1M+</p>
            <p className="text-sm text-muted-foreground">Messages Sent</p>
          </div>
          <div className="w-px h-8 bg-border hidden sm:block" />
          <div className="flex items-center gap-1">
            <Shield className="w-4 h-4 text-primary" />
            <p className="text-sm text-muted-foreground font-medium">End-to-end private</p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-background">
        <div className="max-w-5xl mx-auto px-5">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            className="text-center mb-14"
          >
            <motion.p variants={fadeUp} custom={0} className="text-primary font-semibold text-sm uppercase tracking-wider mb-2">
              Everything You Need
            </motion.p>
            <motion.h2 variants={fadeUp} custom={1} className="font-serif text-3xl sm:text-4xl font-bold text-foreground mb-3">
              One app for your entire love story
            </motion.h2>
            <motion.p variants={fadeUp} custom={2} className="text-muted-foreground max-w-lg mx-auto text-lg">
              Simple, beautiful tools designed to bring you and your partner closer every single day.
            </motion.p>
          </motion.div>

          <div className="grid sm:grid-cols-2 gap-5">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-50px" }}
                variants={fadeUp}
                custom={i}
                className="bg-card rounded-3xl p-7 shadow-soft border border-border hover:shadow-rose transition-shadow duration-300 group"
              >
                <div className="w-12 h-12 gradient-rose rounded-2xl flex items-center justify-center mb-4 shadow-rose group-hover:scale-110 transition-transform duration-300">
                  <feature.icon className="w-6 h-6 text-primary-foreground" />
                </div>
                <h3 className="font-serif text-xl font-semibold text-card-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 gradient-warm">
        <div className="max-w-5xl mx-auto px-5">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            className="text-center mb-14"
          >
            <motion.p variants={fadeUp} custom={0} className="text-primary font-semibold text-sm uppercase tracking-wider mb-2">
              Simple Setup
            </motion.p>
            <motion.h2 variants={fadeUp} custom={1} className="font-serif text-3xl sm:text-4xl font-bold text-foreground">
              Connected in 3 easy steps
            </motion.h2>
          </motion.div>

          <div className="grid sm:grid-cols-3 gap-6">
            {[
              { step: "1", title: "Create Account", desc: "Sign up in seconds with just your email." },
              { step: "2", title: "Share Your Code", desc: "Send your unique partner code to your love." },
              { step: "3", title: "Start Syncing", desc: "Chat, share moods, and build memories together." },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-50px" }}
                variants={fadeUp}
                custom={i}
                className="text-center"
              >
                <div className="w-14 h-14 gradient-rose rounded-full flex items-center justify-center mx-auto mb-4 shadow-rose">
                  <span className="font-serif text-2xl font-bold text-primary-foreground">{item.step}</span>
                </div>
                <h3 className="font-serif text-lg font-semibold text-foreground mb-1">{item.title}</h3>
                <p className="text-muted-foreground">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-background">
        <div className="max-w-5xl mx-auto px-5">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            className="text-center mb-14"
          >
            <motion.p variants={fadeUp} custom={0} className="text-primary font-semibold text-sm uppercase tracking-wider mb-2">
              Love Stories
            </motion.p>
            <motion.h2 variants={fadeUp} custom={1} className="font-serif text-3xl sm:text-4xl font-bold text-foreground">
              Couples love LoveSync
            </motion.h2>
          </motion.div>

          <div className="grid sm:grid-cols-3 gap-5">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.name}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-50px" }}
                variants={fadeUp}
                custom={i}
                className="bg-card rounded-3xl p-6 shadow-soft border border-border"
              >
                <div className="flex gap-0.5 mb-3">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star key={j} className="w-4 h-4 text-peach" fill="currentColor" />
                  ))}
                </div>
                <p className="text-card-foreground mb-4 leading-relaxed italic">"{t.text}"</p>
                <p className="text-sm font-semibold text-muted-foreground">— {t.name}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20">
        <div className="max-w-5xl mx-auto px-5">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            className="gradient-rose rounded-3xl p-10 sm:p-14 text-center shadow-rose"
          >
            <motion.h2
              variants={fadeUp}
              custom={0}
              className="font-serif text-3xl sm:text-4xl font-bold text-primary-foreground mb-4"
            >
              Ready to sync your hearts?
            </motion.h2>
            <motion.p
              variants={fadeUp}
              custom={1}
              className="text-primary-foreground/80 text-lg max-w-md mx-auto mb-8"
            >
              Join thousands of couples building stronger relationships, one moment at a time.
            </motion.p>
            <motion.div variants={fadeUp} custom={2} className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button
                onClick={() => navigate("/auth")}
                size="lg"
                className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 rounded-full px-10 py-6 text-lg font-semibold shadow-lg"
              >
                Get Started Free <ArrowRight className="w-5 h-5 ml-1" />
              </Button>
              {isInstalled ? (
                <p className="text-primary-foreground/60 text-sm flex items-center gap-1">
                  ✅ App installed
                </p>
              ) : (
                <Button
                  onClick={isInstallable ? install : undefined}
                  size="lg"
                  variant="outline"
                  className="rounded-full px-8 py-6 text-lg font-semibold border-primary-foreground/30 bg-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/30 w-full sm:w-auto"
                >
                  <Download className="w-5 h-5 mr-1" /> Install App
                </Button>
              )}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 border-t border-border">
        <div className="max-w-5xl mx-auto px-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 gradient-rose rounded-full flex items-center justify-center">
              <Heart className="w-3 h-3 text-primary-foreground" fill="currentColor" />
            </div>
            <span className="font-serif text-sm font-bold text-foreground">LoveSync</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Made with 💕 for couples everywhere
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
