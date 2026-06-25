import { useEffect, useMemo, useState } from "react";
import { Image as ImageIcon, Pause, Play, RotateCw, ZoomIn, ZoomOut } from "lucide-react";
import { getProductImage, getProductModelImages } from "../utils/catalog";
import ImageLightbox from "./ImageLightbox";

const normalizeImages = (images = []) =>
  images
    .map((image) => (typeof image === "string" ? { url: image } : image))
    .filter((image) => image?.url);

export default function ProductMediaViewer({ product, galleryImages = [], selectedColor = "" }) {
  const gallery = useMemo(() => normalizeImages(galleryImages), [galleryImages]);
  const spinImages = useMemo(() => getProductModelImages(product), [product]);
  const [mode, setMode] = useState(spinImages.length > 1 ? "spin" : "gallery");
  const [activeImage, setActiveImage] = useState("");
  const [frameIndex, setFrameIndex] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [autoSpin, setAutoSpin] = useState(spinImages.length > 1);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  useEffect(() => {
    if (spinImages.length > 1) {
      setMode("spin");
      setFrameIndex(0);
      setAutoSpin(true);
      return;
    }

    setMode("gallery");
  }, [spinImages.length]);

  useEffect(() => {
    setActiveImage(gallery[0]?.url || getProductImage(product, selectedColor));
    setZoom(1);
  }, [gallery, product, selectedColor]);

  useEffect(() => {
    if (mode !== "spin" || !autoSpin || spinImages.length < 2) return undefined;

    const timer = window.setInterval(() => {
      setFrameIndex((current) => (current + 1) % spinImages.length);
    }, 900);

    return () => window.clearInterval(timer);
  }, [autoSpin, mode, spinImages.length]);

  const displayUrl = mode === "spin"
    ? spinImages[frameIndex]?.url || activeImage || getProductImage(product, selectedColor)
    : activeImage || getProductImage(product, selectedColor);

  const updateZoom = (delta) => {
    setZoom((current) => Math.min(2.4, Math.max(0.8, Number((current + delta).toFixed(1)))));
  };

  const allImages = mode === "spin" ? spinImages.map(img => img.url) : gallery.map(img => img.url);

  const handleImageClick = () => {
    if (allImages.length > 0) {
      const currentImageUrl = displayUrl;
      const index = allImages.indexOf(currentImageUrl);
      setLightboxIndex(index >= 0 ? index : 0);
      setLightboxOpen(true);
    }
  };

  const handleLightboxNext = () => {
    setLightboxIndex((current) => (current + 1) % allImages.length);
  };

  const handleLightboxPrev = () => {
    setLightboxIndex((current) => (current - 1 + allImages.length) % allImages.length);
  };

  return (
    <div className="space-y-4">
      <div className="relative flex h-[650px] items-center justify-center overflow-hidden rounded-3xl border border-stone-100 bg-stone-50">
        <img
          src={displayUrl}
          alt={product.name}
          onClick={handleImageClick}
          className="max-h-full max-w-full object-contain transition-transform duration-300 cursor-zoom-in hover:opacity-95"
          style={{ transform: `scale(${zoom})` }}
        />
        {product.isNewArrival && (
          <span className="absolute left-4 top-4 rounded-full bg-amber-400 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white shadow-lg">
            New Arrival
          </span>
        )}

        <div className="absolute bottom-4 left-4 right-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 rounded-2xl bg-white/90 p-1 shadow-xl shadow-stone-900/10 backdrop-blur">
            <button type="button" onClick={() => updateZoom(-0.2)} className="flex h-10 w-10 items-center justify-center rounded-xl text-stone-700 transition hover:bg-stone-100" aria-label="Zoom out">
              <ZoomOut size={18} />
            </button>
            <span className="min-w-12 text-center text-xs font-black text-stone-700">{Math.round(zoom * 100)}%</span>
            <button type="button" onClick={() => updateZoom(0.2)} className="flex h-10 w-10 items-center justify-center rounded-xl text-stone-700 transition hover:bg-stone-100" aria-label="Zoom in">
              <ZoomIn size={18} />
            </button>
          </div>

          {spinImages.length > 1 && (
            <div className="flex items-center gap-2 rounded-2xl bg-stone-900/90 p-1 text-white shadow-xl shadow-stone-900/20 backdrop-blur">
              <button
                type="button"
                onClick={() => {
                  setMode("gallery");
                  setAutoSpin(false);
                }}
                className={`flex h-10 w-10 items-center justify-center rounded-xl transition ${mode === "gallery" ? "bg-white text-stone-900" : "hover:bg-white/10"}`}
                aria-label="Show photos"
              >
                <ImageIcon size={18} />
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode("spin");
                  setAutoSpin((current) => !current);
                }}
                className={`flex h-10 w-10 items-center justify-center rounded-xl transition ${mode === "spin" ? "bg-white text-stone-900" : "hover:bg-white/10"}`}
                aria-label={autoSpin ? "Pause 360 spin" : "Play 360 spin"}
              >
                {mode === "spin" && autoSpin ? <Pause size={18} /> : <Play size={18} />}
              </button>
            </div>
          )}
        </div>
      </div>

      {mode === "spin" && spinImages.length > 1 && (
        <div className="rounded-2xl border border-stone-100 bg-white p-4">
          <div className="mb-3 flex items-center justify-between">
            <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.24em] text-stone-400">
              <RotateCw size={14} />
              360 model view
            </span>
            <span className="text-[10px] font-black text-brand-700">{frameIndex + 1}/{spinImages.length}</span>
          </div>
          <input
            type="range"
            min="0"
            max={spinImages.length - 1}
            value={frameIndex}
            onChange={(event) => {
              setAutoSpin(false);
              setFrameIndex(Number(event.target.value));
            }}
            className="w-full accent-stone-900"
          />
        </div>
      )}

      {gallery.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide snap-x">
          {gallery.map((image) => (
            <button
              key={image.url}
              type="button"
              onClick={() => {
                setMode("gallery");
                setAutoSpin(false);
                setActiveImage(image.url);
                setZoom(1);
              }}
              className={`relative h-20 w-20 flex-shrink-0 snap-start overflow-hidden rounded-2xl border-2 transition-all ${
                mode === "gallery" && activeImage === image.url ? "border-brand-500 scale-95" : "border-transparent opacity-60 hover:opacity-100"
              }`}
            >
              <img src={image.url} alt={product.name} className="h-full w-full object-contain bg-white" />
            </button>
          ))}
        </div>
      )}

      <ImageLightbox
        images={allImages}
        currentIndex={lightboxIndex}
        open={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        onNext={handleLightboxNext}
        onPrev={handleLightboxPrev}
      />
    </div>
  );
}