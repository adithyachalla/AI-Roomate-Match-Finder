import React, { useState, useEffect } from "react";
import { PlusCircle, Building2, Inbox, Settings, Users, Lightbulb, ArrowRight, MapPin, Camera, Rocket, ChevronRight, MessageSquare } from "lucide-react";

const PostProperty = ({ setActiveTab, navigateToDashboard }) => {
  const [listings, setListings] = useState([]);
  const [messages, setMessages] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [uploadedImages, setUploadedImages] = useState([]);
  
  const [formData, setFormData] = useState({
    title: "",
    address: "",
    lat: "",
    lng: "",
    price: "",
    availableFrom: "",
    bedrooms: "1 Bedroom",
    bathrooms: "1 Bathroom",
    amenities: []
  });

  useEffect(() => {
    fetch("http://localhost:5000/api/apartments").then(res => res.json()).then(setListings);
    fetch("http://localhost:5000/api/messages").then(res => res.json()).then(data => {
      const sorted = [...data].sort((a, b) => b.id - a.id);
      setMessages(sorted);
    });
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleAmenityToggle = (amenity) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + uploadedImages.length > 10) {
      alert("Max 10 photos allowed");
      return;
    }

    // Simulate upload by creating object URLs
    const newImages = files.map(file => URL.createObjectURL(file));
    // In a real app, you'd upload to a server and get URLs back.
    // For this demo, we'll use picsum placeholders to ensure they persist across refreshes
    const placeholderImages = files.map((_, i) => `https://picsum.photos/seed/upload${Date.now()}${i}/800/600`);
    
    setUploadedImages(prev => [...prev, ...placeholderImages]);
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = "Title is required";
    if (!formData.address.trim()) newErrors.address = "Address is required";
    if (!formData.price || formData.price <= 0) newErrors.price = "Valid price is required";
    if (!formData.availableFrom) newErrors.availableFrom = "Availability date is required";
    if (uploadedImages.length === 0) newErrors.images = "At least one photo is required";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const latVal = parseFloat(formData.lat);
      const lngVal = parseFloat(formData.lng);

      const payload = {
        ...formData,
        price: parseInt(formData.price),
        lat: !isNaN(latVal) ? latVal : 40.8075, // Default to campus if empty or invalid
        lng: !isNaN(lngVal) ? lngVal : -73.9626,
        bedrooms: formData.bedrooms === "Studio" ? 0 : parseInt(formData.bedrooms),
        bathrooms: parseFloat(formData.bathrooms),
        image_url: uploadedImages[0],
        images: uploadedImages,
        distance: "0.5 mi to Campus", // Mock distance
        owner: {
          name: "Alex Johnson",
          avatar: "https://picsum.photos/seed/lister/100/100"
        }
      };

      const response = await fetch("http://localhost:5000/api/apartments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const newListing = await response.json();
        setListings(prev => [newListing, ...prev]);
        alert("Listing published successfully!");
        navigateToDashboard("listings");
      }
    } catch (err) {
      console.error("Failed to publish listing:", err);
      alert("Failed to publish listing. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="max-w-[1440px] mx-auto px-6 py-8 overflow-y-auto">
      <div className="grid grid-cols-12 gap-8">
        <aside className="col-span-12 lg:col-span-3 space-y-6">
          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 px-2">Menu</h3>
            <nav className="space-y-1">
              <button className="flex w-full items-center gap-3 px-3 py-2.5 bg-primary/10 text-primary rounded-xl font-semibold">
                <PlusCircle size={20} /> Post Property
              </button>
              <button onClick={() => navigateToDashboard("listings")} className="flex w-full items-center gap-3 px-3 py-2.5 text-slate-400 hover:bg-slate-800 rounded-xl transition-all">
                <Building2 size={20} /> My Listings
                <span className="ml-auto bg-slate-800 text-[10px] px-2 py-0.5 rounded-full">{listings.length}</span>
              </button>
              <button onClick={() => navigateToDashboard("messages")} className="flex w-full items-center gap-3 px-3 py-2.5 text-slate-400 hover:bg-slate-800 rounded-xl transition-all">
                <Inbox size={20} /> Lead Inbox
                <span className="ml-auto bg-primary text-white text-[10px] px-2 py-0.5 rounded-full font-bold animate-pulse">{messages.filter(m => m.unread).length || 3} New</span>
              </button>
              <button className="flex w-full items-center gap-3 px-3 py-2.5 text-slate-400 hover:bg-slate-800 rounded-xl transition-all">
                <Settings size={20} /> Lister Settings
              </button>
            </nav>
          </div>
          
          <div className="bg-gradient-to-br from-indigo-600 to-primary rounded-2xl p-6 relative overflow-hidden group cursor-pointer shadow-xl shadow-primary/10">
            <div className="relative z-10">
              <span className="text-[10px] font-bold text-white/70 uppercase tracking-widest mb-1 block">Student Life</span>
              <h4 className="font-bold text-white text-lg mb-2">Looking for a roommate too?</h4>
              <p className="text-sm text-white/80 mb-4 leading-relaxed">Switch to roommate discovery and let our AI match you with the perfect housemate based on your lifestyle.</p>
              <button onClick={() => setActiveTab("roommates")} className="w-full bg-navy-dark text-primary text-xs font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors">
                <Users size={16} /> Start Matching Flow
              </button>
            </div>
            <Users className="absolute -bottom-4 -right-2 size-32 text-white/10 -rotate-12 transition-transform group-hover:scale-110" />
          </div>

          <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6 relative overflow-hidden group">
            <div className="relative z-10">
              <h4 className="font-bold text-white mb-2">Listing Tips</h4>
              <p className="text-sm text-slate-400 mb-4">Properties with 5+ high-quality photos get 3x more student leads.</p>
              <button className="text-xs font-bold text-primary flex items-center gap-1 group-hover:gap-2 transition-all">
                Read Guide <ArrowRight size={14} />
              </button>
            </div>
            <Lightbulb className="absolute -bottom-4 -right-4 size-24 text-primary/10 rotate-12" />
          </div>
        </aside>

        <section className="col-span-12 lg:col-span-6 space-y-6">
          <div className="flex flex-col gap-1">
            <h2 className="text-3xl font-extrabold tracking-tight">Post Your Property</h2>
            <p className="text-slate-500">Reach thousands of students looking for a home.</p>
          </div>
          
          <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
            <div className="p-8 space-y-8">
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold">1</span>
                  <h3 className="font-bold text-lg">Property Basics</h3>
                </div>
                <div className="grid grid-cols-1 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-slate-300">Listing Title</label>
                    <input 
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      className={`w-full bg-slate-800/50 border ${errors.title ? 'border-red-500' : 'border-slate-700'} rounded-xl focus:ring-primary focus:border-primary px-4 py-3 placeholder:text-slate-400`} 
                      placeholder="e.g. Modern 2BR Student Suite near Campus" 
                      type="text"
                    />
                    {errors.title && <span className="text-xs text-red-500">{errors.title}</span>}
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-slate-300">Address</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3.5 text-slate-400" size={20} />
                      <input 
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        className={`w-full bg-slate-800/50 border ${errors.address ? 'border-red-500' : 'border-slate-700'} rounded-xl focus:ring-primary focus:border-primary pl-10 pr-4 py-3 placeholder:text-slate-400`} 
                        placeholder="Enter full property address" 
                        type="text"
                      />
                    </div>
                    {errors.address && <span className="text-xs text-red-500">{errors.address}</span>}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-semibold text-slate-300">Latitude</label>
                      <input 
                        name="lat"
                        value={formData.lat}
                        onChange={handleInputChange}
                        className="w-full bg-slate-800/50 border border-slate-700 rounded-xl focus:ring-primary focus:border-primary px-4 py-3 placeholder:text-slate-400" 
                        placeholder="e.g. 40.8090" 
                        type="number"
                        step="any"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-semibold text-slate-300">Longitude</label>
                      <input 
                        name="lng"
                        value={formData.lng}
                        onChange={handleInputChange}
                        className="w-full bg-slate-800/50 border border-slate-700 rounded-xl focus:ring-primary focus:border-primary px-4 py-3 placeholder:text-slate-400" 
                        placeholder="e.g. -73.9620" 
                        type="number"
                        step="any"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold">2</span>
                  <h3 className="font-bold text-lg">Price & Specs</h3>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-slate-300">Price (Monthly)</label>
                    <div className="relative">
                      <span className="absolute left-4 top-3.5 text-slate-400">$</span>
                      <input 
                        name="price"
                        value={formData.price}
                        onChange={handleInputChange}
                        className={`w-full bg-slate-800/50 border ${errors.price ? 'border-red-500' : 'border-slate-700'} rounded-xl focus:ring-primary focus:border-primary pl-8 pr-4 py-3`} 
                        placeholder="0.00" 
                        type="number"
                      />
                    </div>
                    {errors.price && <span className="text-xs text-red-500">{errors.price}</span>}
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-slate-300">Available From</label>
                    <input 
                      name="availableFrom"
                      value={formData.availableFrom}
                      onChange={handleInputChange}
                      className={`w-full bg-slate-800/50 border ${errors.availableFrom ? 'border-red-500' : 'border-slate-700'} rounded-xl focus:ring-primary focus:border-primary px-4 py-3`} 
                      type="date"
                    />
                    {errors.availableFrom && <span className="text-xs text-red-500">{errors.availableFrom}</span>}
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-slate-300">Bedrooms</label>
                    <select 
                      name="bedrooms"
                      value={formData.bedrooms}
                      onChange={handleInputChange}
                      className="w-full bg-slate-800/50 border border-slate-700 rounded-xl focus:ring-primary focus:border-primary px-4 py-3"
                    >
                      <option>Studio</option>
                      <option>1 Bedroom</option>
                      <option>2 Bedrooms</option>
                      <option>3+ Bedrooms</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-slate-300">Bathrooms</label>
                    <select 
                      name="bathrooms"
                      value={formData.bathrooms}
                      onChange={handleInputChange}
                      className="w-full bg-slate-800/50 border border-slate-700 rounded-xl focus:ring-primary focus:border-primary px-4 py-3"
                    >
                      <option>1 Bathroom</option>
                      <option>1.5 Bathrooms</option>
                      <option>2+ Bathrooms</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold">3</span>
                  <h3 className="font-bold text-lg">Upload Photos</h3>
                </div>
                <div className="space-y-4">
                  <label className={`border-2 border-dashed ${errors.images ? 'border-red-500' : 'border-slate-800'} rounded-2xl p-10 flex flex-col items-center justify-center gap-3 hover:border-primary transition-colors cursor-pointer group`}>
                    <input 
                      type="file" 
                      multiple 
                      accept="image/*" 
                      className="hidden" 
                      onChange={handleImageUpload}
                    />
                    <div className="w-14 h-14 rounded-full bg-slate-800 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                      <Camera className="text-slate-400 group-hover:text-primary transition-colors" size={30} />
                    </div>
                    <div className="text-center">
                      <p className="font-bold text-white">Click to upload photos</p>
                      <p className="text-sm text-slate-500">Max 10 photos, JPG or PNG formats only.</p>
                    </div>
                  </label>
                  {errors.images && <span className="text-xs text-red-500">{errors.images}</span>}
                  
                  {uploadedImages.length > 0 && (
                    <div className="grid grid-cols-5 gap-2">
                      {uploadedImages.map((img, idx) => (
                        <div key={idx} className="aspect-square rounded-lg overflow-hidden border border-slate-800">
                          <img src={img} alt="" className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold">4</span>
                  <h3 className="font-bold text-lg">Amenities</h3>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {["Gym", "Pool", "WiFi", "Laundry", "Parking", "Pet Friendly", "Furnished", "Security", "Balcony"].map(amenity => (
                    <label key={amenity} className="flex items-center gap-3 p-3 bg-slate-800/50 border border-slate-700 rounded-xl cursor-pointer hover:bg-slate-800 transition-colors">
                      <input 
                        type="checkbox" 
                        checked={formData.amenities.includes(amenity)}
                        onChange={() => handleAmenityToggle(amenity)}
                        className="rounded border-slate-600 bg-slate-700 text-primary focus:ring-primary" 
                      />
                      <span className="text-sm font-medium">{amenity}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="pt-4">
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-xl shadow-lg shadow-primary/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    <Rocket size={20} />
                  )}
                  {isSubmitting ? "Publishing..." : "Publish Listing"}
                </button>
              </div>
            </div>
          </form>
        </section>

        <aside className="col-span-12 lg:col-span-3 space-y-6">
          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl overflow-hidden">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <h3 className="font-bold flex items-center gap-2">
                <Building2 className="text-primary" size={20} /> Active Listings
              </h3>
              <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">Live</span>
            </div>
            <div className="p-2 space-y-1">
              {listings.slice(0, 3).map(listing => (
                <div key={listing.id} onClick={() => navigateToDashboard("listings")} className="p-3 hover:bg-slate-800 rounded-xl flex items-center gap-3 transition-all cursor-pointer">
                  <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                    <img className="w-full h-full object-cover" src={listing.image_url} alt={listing.title} referrerPolicy="no-referrer" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold truncate">{listing.title}</p>
                    <p className="text-xs text-slate-500">${listing.price}/mo</p>
                  </div>
                  <ChevronRight size={16} className="text-slate-300" />
                </div>
              ))}
            </div>
            <button onClick={() => navigateToDashboard("listings")} className="w-full py-3 text-xs font-bold text-slate-400 border-t border-slate-800 hover:text-primary transition-colors">
              View All Listings
            </button>
          </div>

          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl overflow-hidden">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <h3 className="font-bold flex items-center gap-2">
                <MessageSquare className="text-primary" size={20} /> Lead Inbox
              </h3>
            </div>
            <div className="divide-y divide-slate-800">
              {messages.slice(0, 3).map(msg => (
                <div key={msg.id} onClick={() => navigateToDashboard("messages")} className="p-4 hover:bg-slate-800/50 transition-all cursor-pointer">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-bold text-primary">{msg.sender}</p>
                    <span className="text-[10px] text-slate-400">{msg.time}</span>
                  </div>
                  <p className="text-xs font-semibold text-slate-300 mb-1">Message from {msg.sender}</p>
                  <p className="text-xs text-slate-500 line-clamp-1 italic">"{msg.text}"</p>
                </div>
              ))}
            </div>
            <button onClick={() => navigateToDashboard("messages")} className="w-full py-3 text-xs font-bold text-slate-400 border-t border-slate-800 hover:text-primary transition-colors">
              Go to Messages
            </button>
          </div>
        </aside>
      </div>
    </main>
  );
};

export default PostProperty;
