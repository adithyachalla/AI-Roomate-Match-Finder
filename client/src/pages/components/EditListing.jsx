import React, { useState, useEffect } from "react";
import { ArrowLeft, MapPin, Camera, Rocket, Save } from "lucide-react";

const EditListing = ({ listingId, onBack, onSave }) => {
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    address: "",
    price: 0,
    bedrooms: 1,
    bathrooms: 1,
    amenities: [],
    image_url: "",
    lat: "",
    lng: ""
  });

  useEffect(() => {
    fetch(`http://localhost:5000/api/apartments/${listingId}`)
      .then(res => res.json())
      .then(data => {
        setListing(data);
        setFormData({
          title: data.title,
          address: data.address,
          price: data.price,
          bedrooms: data.bedrooms,
          bathrooms: data.bathrooms,
          amenities: data.amenities || [],
          image_url: data.image_url,
          lat: data.lat || "",
          lng: data.lng || ""
        });
        setLoading(false);
      });
  }, [listingId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAmenityToggle = (amenity) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...formData,
        lat: formData.lat ? parseFloat(formData.lat) : null,
        lng: formData.lng ? parseFloat(formData.lng) : null,
        price: parseFloat(formData.price)
      };
      const response = await fetch(`http://localhost:5000/api/apartments/${listingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (response.ok) {
        onSave();
      }
    } catch (err) {
      console.error("Failed to update listing:", err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button 
          onClick={onBack}
          className="p-2 hover:bg-slate-800 rounded-full text-slate-400 transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
        <h2 className="text-3xl font-extrabold tracking-tight text-white">Edit Listing</h2>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold">1</span>
              <h3 className="font-bold text-lg text-white">Property Basics</h3>
            </div>
            <div className="grid grid-cols-1 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-slate-300">Listing Title</label>
                <input 
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full bg-slate-800/50 border-slate-700 rounded-xl focus:ring-primary focus:border-primary px-4 py-3 text-white" 
                  placeholder="e.g. Modern 2BR Student Suite near Campus" 
                  type="text"
                  required
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-slate-300">Address</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3.5 text-slate-400" size={20} />
                  <input 
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="w-full bg-slate-800/50 border-slate-700 rounded-xl focus:ring-primary focus:border-primary pl-10 pr-4 py-3 text-white" 
                    placeholder="Enter full property address" 
                    type="text"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-slate-300">Latitude</label>
                  <input 
                    name="lat"
                    value={formData.lat}
                    onChange={handleInputChange}
                    className="w-full bg-slate-800/50 border-slate-700 rounded-xl focus:ring-primary focus:border-primary px-4 py-3 text-white" 
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
                    className="w-full bg-slate-800/50 border-slate-700 rounded-xl focus:ring-primary focus:border-primary px-4 py-3 text-white" 
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
              <h3 className="font-bold text-lg text-white">Price & Specs</h3>
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
                    className="w-full bg-slate-800/50 border-slate-700 rounded-xl focus:ring-primary focus:border-primary pl-8 pr-4 py-3 text-white" 
                    placeholder="0.00" 
                    type="number"
                    required
                  />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-slate-300">Bedrooms</label>
                <select 
                  name="bedrooms"
                  value={formData.bedrooms}
                  onChange={handleInputChange}
                  className="w-full bg-slate-800/50 border-slate-700 rounded-xl focus:ring-primary focus:border-primary px-4 py-3 text-white"
                >
                  <option value={0}>Studio</option>
                  <option value={1}>1 Bedroom</option>
                  <option value={2}>2 Bedrooms</option>
                  <option value={3}>3+ Bedrooms</option>
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-slate-300">Bathrooms</label>
                <select 
                  name="bathrooms"
                  value={formData.bathrooms}
                  onChange={handleInputChange}
                  className="w-full bg-slate-800/50 border-slate-700 rounded-xl focus:ring-primary focus:border-primary px-4 py-3 text-white"
                >
                  <option value={1}>1 Bathroom</option>
                  <option value={1.5}>1.5 Bathrooms</option>
                  <option value={2}>2+ Bathrooms</option>
                </select>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold">3</span>
              <h3 className="font-bold text-lg text-white">Amenities</h3>
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
                  <span className="text-sm font-medium text-white">{amenity}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="pt-4 flex gap-4">
            <button 
              type="button"
              onClick={onBack}
              className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-bold py-4 rounded-xl transition-all"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={saving}
              className="flex-[2] bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-xl shadow-lg shadow-primary/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {saving ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> : <Save size={20} />}
              Update Listing
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditListing;
