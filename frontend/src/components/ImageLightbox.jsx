import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

export default function ImageLightbox({ images = [], currentIndex = 0, open = false, onClose, onNext, onPrev }) {
  if (!images.length) return null;

  const currentImage = images[currentIndex];

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
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={onClose}
          >
            {/* Image Container */}
            <motion.div
              onClick={(e) => e.stopPropagation()}
              className="relative max-h-[90vh] max-w-4xl w-full"
            >
              <img
                src={currentImage}
                alt="Product preview"
                className="h-full w-full object-contain rounded-2xl shadow-2xl"
              />

              {/* Close Button */}
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                onClick={onClose}
                className="absolute -right-12 -top-12 sm:right-4 sm:top-4 rounded-full bg-white/10 p-3 text-white hover:bg-white/20 transition-all"
              >
                <X size={24} />
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
                    className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-16 sm:translate-x-0 rounded-full bg-white/10 p-3 text-white hover:bg-white/20 transition-all hover:scale-110"
                  >
                    <ChevronLeft size={28} />
                  </motion.button>

                  <motion.button
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      onNext();
                    }}
                    className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-16 sm:translate-x-0 rounded-full bg-white/10 p-3 text-white hover:bg-white/20 transition-all hover:scale-110"
                  >
                    <ChevronRight size={28} />
                  </motion.button>

                  {/* Counter */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-stone-900/80 px-4 py-2 text-sm font-bold text-white backdrop-blur"
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
