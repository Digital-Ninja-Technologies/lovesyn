import { useState } from "react";
import { Send, Heart } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Message {
  id: number;
  text: string;
  sender: "me" | "partner";
  time: string;
}

const mockMessages: Message[] = [
  { id: 1, text: "Good morning my love! ☀️", sender: "partner", time: "9:00 AM" },
  { id: 2, text: "Good morning baby! How did you sleep? 💕", sender: "me", time: "9:02 AM" },
  { id: 3, text: "Like an angel because I dreamt of you 🥰", sender: "partner", time: "9:03 AM" },
  { id: 4, text: "You're the sweetest! Can't wait to see you tonight", sender: "me", time: "9:05 AM" },
  { id: 5, text: "Me too! I have a surprise for you 🎁", sender: "partner", time: "9:06 AM" },
];

const Chat = () => {
  const [messages, setMessages] = useState<Message[]>(mockMessages);
  const [input, setInput] = useState("");

  const sendMessage = () => {
    if (!input.trim()) return;
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        text: input,
        sender: "me",
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
    setInput("");
  };

  return (
    <div className="flex flex-col h-screen max-h-screen">
      {/* Header */}
      <div className="glass border-b border-border px-5 py-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full gradient-rose flex items-center justify-center">
          <Heart className="w-5 h-5 text-primary-foreground" fill="currentColor" />
        </div>
        <div>
          <h1 className="font-serif text-lg font-semibold text-foreground">Your Love</h1>
          <p className="text-xs text-muted-foreground">Online now 💚</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        <AnimatePresence>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className={`flex ${msg.sender === "me" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                  msg.sender === "me"
                    ? "gradient-rose text-primary-foreground rounded-br-md"
                    : "bg-card shadow-soft text-card-foreground rounded-bl-md"
                }`}
              >
                <p className="text-sm leading-relaxed">{msg.text}</p>
                <p
                  className={`text-[10px] mt-1 ${
                    msg.sender === "me"
                      ? "text-primary-foreground/60"
                      : "text-muted-foreground"
                  }`}
                >
                  {msg.time}
                </p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Input */}
      <div className="glass border-t border-border px-4 py-3 safe-bottom">
        <div className="flex items-center gap-2 bg-secondary rounded-full px-4 py-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Type a love message..."
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim()}
            className="w-9 h-9 gradient-rose rounded-full flex items-center justify-center disabled:opacity-40 transition-opacity active:scale-95"
          >
            <Send className="w-4 h-4 text-primary-foreground" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chat;
