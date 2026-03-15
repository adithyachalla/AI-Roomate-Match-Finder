import React, { useState, useEffect } from "react";
import { ArrowLeft, Bed, Bath, Navigation, Sparkles, MessageSquare, Heart, Share2, ShieldCheck, MapPin, Users, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getApartmentSummary } from "../../services/utility";

const PropertyDetail = ({ propertyId, onBack, onMessageOwner }) => {
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [aiSummary, setAiSummary] = useState("");
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  const [direction, setDirection] = useState(0);

  useEffect(() => {
    fetch(`http://localhost:5001/api/apartments/${propertyId}`)
      .then(res => res.json())
      .then(data => {
        setProperty(data);
        setLoading(false);
      });
  }, [propertyId]);

  const images = property?.images || (property?.image_url ? [property.image_url] : []);

  const paginate = (newDirection) => {
    setDirection(newDirection);
    setActiveImage((prev) => (prev + newDirection + images.length) % images.length);
  };

  const generateSummary = async () => {
    if (aiSummary || loadingSummary) return;
    setLoadingSummary(true);
    try {
      const summary = await getApartmentSummary(JSON.stringify(property));
      setAiSummary(summary);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingSummary(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background-dark">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const variants = {
    enter: (direction) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0
    })
  };

  return (
    <div className="min-h-screen bg-background-dark text-white pb-20">
      {/* Navigation Header */}
      <div className="sticky top-0 z-50 bg-background-dark/80 backdrop-blur-md border-b border-slate-800 px-6 py-4 flex items-center justify-between">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors font-bold"
        >
          <ArrowLeft size={20} /> Back to Search
        </button>
        <div className="flex items-center gap-4">
          <button className="p-2 hover:bg-slate-800 rounded-full text-slate-400 transition-colors"><Share2 size={20} /></button>
          <button className="p-2 hover:bg-slate-800 rounded-full text-slate-400 transition-colors"><Heart size={20} /></button>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Column: Images & Details */}
        <div className="lg:col-span-8 space-y-8">
          {/* Image Gallery / Slideshow */}
          <div className="space-y-4">
            <div className="relative h-[300px] sm:h-[400px] md:h-[500px] w-full rounded-3xl overflow-hidden border border-slate-800 bg-slate-900 group">
              <AnimatePresence initial={false} custom={direction}>
                <motion.img 
                  key={activeImage}
                  src={images[activeImage]} 
                  custom={direction}
                  variants={variants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{
                    x: { type: "spring", stiffness: 300, damping: 30 },
                    opacity: { duration: 0.2 }
                  }}
                  alt={property.title} 
                  className="absolute inset-0 w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </AnimatePresence>

              {/* Navigation Arrows */}
              {images.length > 1 && (
                <>
                  <button 
                    onClick={() => paginate(-1)}
                    className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full bg-black/40 backdrop-blur-md text-white border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/60"
                  >
                    <ChevronLeft size={24} />
                  </button>
                  <button 
                    onClick={() => paginate(1)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full bg-black/40 backdrop-blur-md text-white border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/60"
                  >
                    <ChevronRight size={24} />
                  </button>
                </>
              )}

              {/* Image Counter */}
              <div className="absolute bottom-6 right-6 z-10 px-4 py-2 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-xs font-bold tracking-widest">
                {activeImage + 1} / {images.length}
              </div>

              {property.is_ai_match && (
                <div className="absolute top-6 left-6 z-10">
                  <span className="bg-primary text-white text-xs font-extrabold uppercase tracking-widest px-4 py-2 rounded-full flex items-center gap-2 shadow-2xl">
                    <Sparkles size={16} /> Highly Compatible
                  </span>
                </div>
              )}
            </div>
            
            {/* Thumbnails */}
            <div className="flex gap-4 overflow-x-auto pb-2 custom-scrollbar">
              {images.map((img, idx) => (
                <button 
                  key={idx}
                  onClick={() => {
                    setDirection(idx > activeImage ? 1 : -1);
                    setActiveImage(idx);
                  }}
                  className={`relative shrink-0 w-32 h-24 rounded-xl overflow-hidden border-2 transition-all ${activeImage === idx ? 'border-primary scale-95' : 'border-transparent opacity-60 hover:opacity-100'}`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </button>
              ))}
            </div>
          </div>

          {/* Property Info */}
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <h1 className="text-4xl font-extrabold mb-2 tracking-tight">{property.title}</h1>
                <div className="flex items-center gap-2 text-slate-400 font-medium">
                  <MapPin size={18} className="text-primary" />
                  {property.address}
                  {property.location?.coordinates && (
                    <span className="text-xs text-slate-500 ml-2">
                      ({Number(property.location.coordinates[1]).toFixed(4)}, {Number(property.location.coordinates[0]).toFixed(4)})
                    </span>
                  )}
                </div>
              </div>
              <div className="text-left md:text-right">
                <p className="text-3xl font-extrabold text-primary">${property.price.toLocaleString()}<span className="text-lg font-normal text-slate-500">/mo</span></p>
                <p className="text-sm text-slate-500 font-bold uppercase tracking-widest mt-1">Available Now</p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 py-8 border-y border-slate-800">
              <div className="flex items-center gap-3">
                <div className="size-12 rounded-2xl bg-slate-800/50 flex items-center justify-center text-primary">
                  <Bed size={24} />
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-bold uppercase">Bedrooms</p>
                  <p className="font-bold text-lg">{property.bedrooms}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="size-12 rounded-2xl bg-slate-800/50 flex items-center justify-center text-primary">
                  <Bath size={24} />
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-bold uppercase">Bathrooms</p>
                  <p className="font-bold text-lg">{property.bathrooms}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="size-12 rounded-2xl bg-slate-800/50 flex items-center justify-center text-primary">
                  <Navigation size={24} />
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-bold uppercase">Distance</p>
                  <p className="font-bold text-lg">{property.distance}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="size-12 rounded-2xl bg-slate-800/50 flex items-center justify-center text-primary">
                  <ShieldCheck size={24} />
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-bold uppercase">Verified</p>
                  <p className="font-bold text-lg">Lister</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-bold">About this property</h3>
              <p className="text-slate-400 leading-relaxed">
                Experience modern living in this beautifully appointed {property.bedrooms} bedroom apartment. 
                Located in the heart of {property.address.split(',')[0]}, this property offers unparalleled convenience 
                and comfort for students and young professionals alike.
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-bold">Amenities</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {property.amenities.map(amenity => (
                  <div key={amenity} className="flex items-center gap-3 p-4 bg-slate-900/50 border border-slate-800 rounded-2xl">
                    <div className="size-2 rounded-full bg-primary"></div>
                    <span className="text-sm font-medium text-slate-300">{amenity}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Owner & AI */}
        <div className="lg:col-span-4 space-y-8">
          {/* AI Insights Card */}
          <div className="bg-gradient-to-br from-primary/20 to-navy-dark border border-primary/30 rounded-3xl p-8 relative overflow-hidden">
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-accent-teal/10 rounded-full blur-3xl"></div>
            <div className="relative space-y-6">
              <div className="flex items-center justify-between">
                <div className="bg-white/10 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
                  <span className="text-[10px] text-accent-teal font-bold uppercase tracking-widest">AI Insights</span>
                </div>
                <Sparkles size={24} className="text-accent-teal" />
              </div>
              
              {aiSummary ? (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-4"
                >
                  <p className="text-slate-200 text-sm leading-relaxed italic">
                    "{aiSummary}"
                  </p>
                  <div className="flex items-center gap-2 text-accent-teal text-xs font-bold">
                    <Users size={14} />
                    <span>Matches your lifestyle preferences perfectly</span>
                  </div>
                </motion.div>
              ) : (
                <div className="space-y-4">
                  <p className="text-slate-300 text-sm leading-relaxed">
                    Get an AI-generated summary of why this property fits your profile.
                  </p>
                  <button 
                    onClick={generateSummary}
                    disabled={loadingSummary}
                    className="w-full bg-accent-teal text-navy-dark font-bold py-3 rounded-xl hover:bg-accent-teal/90 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {loadingSummary ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-navy-dark"></div>
                    ) : (
                      <Sparkles size={18} />
                    )}
                    Generate AI Summary
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Owner Card */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-8 space-y-6">
            <h3 className="text-lg font-bold">Property Owner</h3>
            <div className="flex items-center gap-4">
              <div className="size-16 rounded-full border-2 border-primary/20 p-1">
                <img 
                  src={property.owner?.avatar || "https://picsum.photos/seed/owner/100/100"} 
                  alt={property.owner?.name} 
                  className="w-full h-full rounded-full object-cover"
                />
              </div>
              <div>
                <h4 className="font-bold text-lg">{property.owner?.name || "Alex Johnson"}</h4>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Verified Lister</p>
              </div>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              Alex has been a verified lister on RoomSync since 2023 and has successfully matched 15+ students with their perfect homes.
            </p>
            <button 
              onClick={() => onMessageOwner(property.owner?.name || "Alex Johnson")}
              className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-xl shadow-lg shadow-primary/20 flex items-center justify-center gap-2 transition-all"
            >
              <MessageSquare size={20} /> Message Owner
            </button>
          </div>

          {/* Quick Stats */}
          <div className="bg-slate-900/30 border border-slate-800 rounded-3xl p-6 grid grid-cols-2 gap-4">
            <div className="text-center p-4">
              <p className="text-2xl font-extrabold text-white">{property.views || 0}</p>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Total Views</p>
            </div>
            <div className="text-center p-4 border-l border-slate-800">
              <p className="text-2xl font-extrabold text-white">{property.matches || 0}</p>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Active Leads</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetail;
