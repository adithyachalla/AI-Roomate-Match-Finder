import React, { useState } from "react";
import { Sparkles, Heart, Bed, Bath, Navigation, Users, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getApartmentSummary } from "../../services/utility";

const ApartmentCard = ({ apartment, onClick }) => {
  const [summary, setSummary] = useState(null);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [activeImage, setActiveImage] = useState(0);

  const images = (apartment.images && apartment.images.length > 0) 
    ? apartment.images 
    : (apartment.image_url ? [apartment.image_url] : []);

  const handleGetSummary = async (e) => {
    e.stopPropagation();
    if (summary) return;
    setLoadingSummary(true);
    try {
      const text = await getApartmentSummary(JSON.stringify(apartment));
      setSummary(text || "No summary available.");
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingSummary(false);
    }
  };

  const nextImage = (e) => {
    e.stopPropagation();
    setActiveImage((prev) => (prev + 1) % images.length);
  };

  const prevImage = (e) => {
    e.stopPropagation();
    setActiveImage((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="group flex flex-col shrink-0 bg-[#1c2127] rounded-xl overflow-hidden border border-[#283039] transition-all hover:shadow-xl hover:border-primary/40 cursor-pointer"
      onClick={onClick}
    >
      <div className="relative h-64 w-full overflow-hidden bg-slate-900">
        <AnimatePresence mode="wait">
          <motion.img 
            key={activeImage}
            src={images[activeImage]} 
            alt={apartment.title}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            referrerPolicy="no-referrer"
            className="absolute inset-0 w-full h-full object-cover"
          />
        </AnimatePresence>

        {images.length > 1 && (
          <>
            <button 
              onClick={prevImage}
              className="absolute left-2 top-1/2 -translate-y-1/2 z-10 p-1.5 rounded-full bg-black/40 backdrop-blur-md text-white border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/60"
            >
              <ChevronLeft size={18} />
            </button>
            <button 
              onClick={nextImage}
              className="absolute right-2 top-1/2 -translate-y-1/2 z-10 p-1.5 rounded-full bg-black/40 backdrop-blur-md text-white border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/60"
            >
              <ChevronRight size={18} />
            </button>
            <div className="absolute bottom-3 right-3 z-10 px-2 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[10px] font-bold">
              {activeImage + 1} / {images.length}
            </div>
          </>
        )}

        <button 
          onClick={(e) => { e.stopPropagation(); }}
          className="absolute top-4 right-4 bg-white/20 backdrop-blur-md rounded-full size-8 flex items-center justify-center text-white hover:bg-white/40 transition-colors"
        >
          <Heart size={20} />
        </button>
      </div>
      <div className="p-4 md:p-5">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="text-lg md:text-xl font-bold">${apartment.price.toLocaleString()}/mo</h3>
            <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 font-medium line-clamp-1">{apartment.title} • {apartment.address}</p>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-1 text-primary">
              <Users size={18} />
              <span className="text-sm font-bold">{apartment.matches || 0} {apartment.matches === 1 ? 'Person' : 'People'}</span>
            </div>
            <p className="text-[11px] text-slate-500 uppercase font-bold mt-1">Looking</p>
          </div>
        </div>
        <div className="flex gap-3 md:gap-4 mb-4 text-xs md:text-sm text-slate-600 dark:text-slate-300">
          <span className="flex items-center gap-1"><Bed size={16} className="md:size-[18px]" /> {apartment.bedrooms} BR</span>
          <span className="flex items-center gap-1"><Bath size={16} className="md:size-[18px]" /> {apartment.bathrooms} BA</span>
          <span className="flex items-center gap-1"><Navigation size={16} className="md:size-[18px]" /> {apartment.distance}</span>
        </div>
        <div className="flex flex-wrap gap-2 mb-4">
          {apartment.amenities.map(amenity => (
            <span key={amenity} className="px-3 py-1 bg-[#283039] rounded-full text-xs">{amenity}</span>
          ))}
        </div>
        
        {loadingSummary && (
          <div className="text-xs text-primary animate-pulse flex items-center gap-2">
            <Sparkles size={12} /> Generating AI Summary...
          </div>
        )}
        {summary && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="text-xs text-slate-400 bg-slate-800/50 p-3 rounded-lg border border-slate-700 italic"
          >
            {summary}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default ApartmentCard;
