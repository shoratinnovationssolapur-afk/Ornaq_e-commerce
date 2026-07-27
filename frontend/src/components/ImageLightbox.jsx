import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

export default function ImageLightbox({ images = [], currentIndex = 0, open = false, onClose, onNext, onPrev }) {
  if (!images.length) return null;

  const currentImage = images[currentIndex];

  // Safely extract the source URL string if your structure maps objects or plain text
  const imageSrc = typeof currentImage === "object" ? currentImage.url : currentImage;

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-stone-900/95 backdrop-blur-sm"
          />

          {/* Lightbox Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-12"
            onClick={onClose}
          >
            {/* Image Container — Removed rigid dimensional wrappers */}
            <motion.div
              onClick={(e) => e.stopPropagation()}
              className="relative flex items-center justify-center max-w-full max-h-full"
            >
              {/* Image Element — Bound constraints here to guarantee complete visibility */}
              <img
                src={imageSrc}
                alt="Product preview"
                className="max-h-[85vh] max-w-[90vw] md:max-w-[80vw] w-auto h-auto object-contain rounded-xl shadow-2xl"
              />

              {/* Close Button */}
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                onClick={onClose}
                className="absolute -top-14 right-0 sm:-right-14 sm:top-0 rounded-full bg-white/10 p-3 text-white hover:bg-white/20 transition-all"
              >
                <X size={22} />
              </motion.button>

              {/* Navigation Arrows */}
              {images.length > 1 && (
                <>
                  <motion.button
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      onPrev();
                    }}
                    className="absolute left-2 sm:-left-16 top-1/2 -translate-y-1/2 rounded-full bg-stone-900/60 sm:bg-white/10 p-3 text-white hover:bg-white/20 backdrop-blur-sm sm:backdrop-blur-none transition-all hover:scale-110"
                  >
                    <ChevronLeft size={24} />
                  </motion.button>

                  <motion.button
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      onNext();
                    }}
                    className="absolute right-2 sm:-right-16 top-1/2 -translate-y-1/2 rounded-full bg-stone-900/60 sm:bg-white/10 p-3 text-white hover:bg-white/20 backdrop-blur-sm sm:backdrop-blur-none transition-all hover:scale-110"
                  >
                    <ChevronRight size={24} />
                  </motion.button>

                  {/* Counter */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="absolute -bottom-14 left-1/2 -translate-x-1/2 rounded-full bg-stone-900/80 px-4 py-2 text-xs font-bold text-white backdrop-blur"
                  >
                    {currentIndex + 1} / {images.length}
                  </motion.div>
                </>
              )}
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}