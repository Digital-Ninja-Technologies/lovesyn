import { useState } from "react";
import { motion } from "framer-motion";
import { Heart, Copy, Check, ArrowRight, Loader2, HeartHandshake, Unlink } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

const ConnectPartner = () => {
  const [partnerCode, setPartnerCode] = useState("");
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const { profile, partner, connectPartner, disconnectPartner, refreshProfile } = useAuth();
  const { toast } = useToast();

  const handleDisconnect = async () => {
    setLoading(true);
    const { error } = await disconnectPartner();
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Disconnected", description: "You can now connect with someone new." });
    }
    setLoading(false);
  };

  const copyCode = async () => {
    if (profile?.partner_code) {
      await navigator.clipboard.writeText(profile.partner_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleConnect = async () => {
    if (!partnerCode.trim()) return;
    setLoading(true);

    const { error } = await connectPartner(partnerCode);

    if (error) {
      toast({
        title: "Connection failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Connected! 💕",
        description: "You're now synced with your partner!",
      });
      await refreshProfile();
    }

    setLoading(false);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-1 flex flex-col px-5 pt-12 pb-24">
        {/* Connection Status Banner */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`rounded-2xl p-4 mb-6 flex items-center gap-3 border ${
            partner
              ? "bg-primary/10 border-primary/20"
              : "bg-muted border-border"
          }`}
        >
          {partner ? (
            <>
              <HeartHandshake className="w-6 h-6 text-primary shrink-0" />
              <div className="flex-1">
                <p className="font-semibold text-foreground text-sm">Connected with {partner.display_name} {partner.avatar_emoji}</p>
                <p className="text-xs text-muted-foreground">You're synced and sharing everything 💕</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDisconnect}
                disabled={loading}
                className="text-destructive hover:text-destructive hover:bg-destructive/10 text-xs shrink-0"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Unlink className="w-3 h-3 mr-1" />Disconnect</>}
              </Button>
            </>
          ) : (
            <>
              <Unlink className="w-6 h-6 text-muted-foreground shrink-0" />
              <div>
                <p className="font-semibold text-foreground text-sm">Not connected yet</p>
                <p className="text-xs text-muted-foreground">Share your code or enter your partner's code below</p>
              </div>
            </>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="w-20 h-20 gradient-rose rounded-full flex items-center justify-center mx-auto mb-4 shadow-rose">
            <Heart className="w-10 h-10 text-primary-foreground" fill="currentColor" />
          </div>
          <h1 className="font-serif text-2xl font-bold text-foreground">
            Connect with Your Love
          </h1>
          <p className="text-muted-foreground mt-2">
            Share your code or enter your partner's code
          </p>
        </motion.div>

        {/* Your Code */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card rounded-3xl p-6 shadow-soft border border-border mb-6"
        >
          <p className="text-sm text-muted-foreground mb-2">My code</p>
          <div className="flex items-center gap-3">
            <div className="flex-1 bg-secondary rounded-xl px-4 py-3 font-mono text-2xl font-bold text-foreground tracking-widest text-center">
              {profile?.partner_code || "------"}
            </div>
            <Button
              onClick={copyCode}
              size="icon"
              variant="outline"
              className="h-12 w-12 rounded-xl"
            >
              {copied ? (
                <Check className="w-5 h-5 text-green-500" />
              ) : (
                <Copy className="w-5 h-5" />
              )}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-3 text-center">
            Share this code with your partner so they can connect with you
          </p>
        </motion.div>

        {/* Enter Partner Code */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card rounded-3xl p-6 shadow-soft border border-border"
        >
          <p className="text-sm text-muted-foreground mb-3">Enter partner's code</p>
          <div className="flex gap-3">
            <Input
              type="text"
              placeholder="ABC123"
              value={partnerCode}
              onChange={(e) => setPartnerCode(e.target.value.toUpperCase())}
              maxLength={6}
              className="h-12 rounded-xl bg-secondary border-0 font-mono text-xl tracking-widest uppercase text-center"
            />
            <Button
              onClick={handleConnect}
              disabled={loading || partnerCode.length !== 6}
              className="h-12 px-6 rounded-xl gradient-rose text-primary-foreground shadow-rose"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <ArrowRight className="w-5 h-5" />
              )}
            </Button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-auto pt-8 text-center"
        >
          <p className="text-sm text-muted-foreground">
            Once connected, you'll share messages, memories, and notes 💕
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default ConnectPartner;
