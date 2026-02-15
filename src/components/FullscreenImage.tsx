import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

interface FullscreenImageProps {
  src: string | null;
  onClose: () => void;
}

const FullscreenImage = ({ src, onClose }: FullscreenImageProps) => (
  <AnimatePresence>
    {src && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center"
        onClick={onClose}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
        <motion.img
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0.9 }}
          src={src}
          alt="Full screen"
          className="max-w-[95vw] max-h-[90vh] object-contain rounded-lg"
          onClick={(e) => e.stopPropagation()}
        />
      </motion.div>
    )}
  </AnimatePresence>
);

export default FullscreenImage;
