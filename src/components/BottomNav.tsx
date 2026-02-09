import { useLocation, useNavigate } from "react-router-dom";
import { Heart, MessageCircle, Image, StickyNote, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

const tabs = [
  { path: "/", icon: Heart, label: "Home" },
  { path: "/chat", icon: MessageCircle, label: "Chat" },
  { path: "/memories", icon: Image, label: "Memories" },
  { path: "/notes", icon: StickyNote, label: "Notes" },
  { path: "/dates", icon: Sparkles, label: "Dates" },
];

const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="fixed bottom-0 left-0 right-0 glass border-t border-border safe-bottom z-50">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-2">
        {tabs.map((tab) => {
          const isActive = location.pathname === tab.path;
          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className="relative flex flex-col items-center justify-center gap-0.5 w-14 h-14 rounded-2xl transition-colors"
            >
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 gradient-rose rounded-2xl opacity-10"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <tab.icon
                className={`w-5 h-5 transition-colors ${
                  isActive ? "text-primary" : "text-muted-foreground"
                }`}
                fill={isActive ? "currentColor" : "none"}
                strokeWidth={isActive ? 1.5 : 2}
              />
              <span
                className={`text-[10px] font-medium transition-colors ${
                  isActive ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
