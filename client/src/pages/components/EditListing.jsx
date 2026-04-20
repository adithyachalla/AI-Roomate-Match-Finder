import React, { useState, useEffect } from "react";
import { ArrowLeft, MapPin, Camera, Rocket, Save, Search, X, Trash2 } from "lucide-react";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix for default marker icon in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const ChangeView = ({ center }) => {
  const map = useMap();
  map.setView(center, 15);
  return null;
};

const EditListing = ({ listingId, onBack, onSave }) => {
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [mapCenter, setMapCenter] = useState([34.022499, -118.285126]);
  const [formData, setFormData] = useState({
    title: "",
    address: "",
    price: 0,
    bedrooms: 1,
    bathrooms: 1,
    leaseDuration: "Full Year",
    amenities: [],
    images: [],
    image_url: "",
    lat: 34.022499,
    lng: -118.285126
  });

  useEffect(() => {
    fetch(`http://localhost:5001/api/apartments/${listingId}`)
      .then(res => res.json())
      .then(data => {
        setListing(data);
        const lat = data.lat || 34.022499;
        const lng = data.lng || -118.285126;
        setFormData({
          title: data.title,
          address: data.address,
          price: data.price,
          bedrooms: data.bedrooms,
          bathrooms: data.bathrooms,
          leaseDuration: data.leaseDuration || "Full Year",
          amenities: data.amenities || [],
          images: data.images || (data.image_url ? [data.image_url] : []),
          image_url: data.image_url,
          lat: lat,
          lng: lng
        });
        setMapCenter([lat, lng]);
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

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + formData.images.length > 10) {
      alert("Max 10 photos allowed");
      return;
    }

    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          images: [...prev.images, reader.result]
        }));
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleGeocode = async () => {
    if (!formData.address.trim()) return;

    setIsGeocoding(true);
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(formData.address)}`);
      const data = await response.json();

      if (data && data.length > 0) {
        const { lat, lon } = data[0];
        const newLat = parseFloat(lat);
        const newLng = parseFloat(lon);
        setFormData(prev => ({ ...prev, lat: newLat, lng: newLng }));
        setMapCenter([newLat, newLng]);
      }
    } catch (err) {
      console.error("Geocoding error:", err);
    } finally {
      setIsGeocoding(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this listing? This action cannot be undone.")) {
      return;
    }

    setIsDeleting(true);
    try {
      const response = await fetch(`http://localhost:5001/api/apartments/${listingId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const result = await response.json().catch(() => null);
        throw new Error(result?.error || "Failed to delete listing");
      }

      onSave(); // Refresh the list and go back
    } catch (err) {
      console.error("Failed to delete listing:", err);
      alert(err.message || "Failed to delete listing. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.images.length === 0) {
      alert("At least one photo is required");
      return;
    }

    setSaving(true);
    try {
      const latVal = parseFloat(formData.lat);
      const lngVal = parseFloat(formData.lng);

      const payload = {
        ...formData,
        lat: !isNaN(latVal) ? latVal : 34.022499,
        lng: !isNaN(lngVal) ? lngVal : -118.285126,
        price: parseFloat(formData.price),
        image_url: formData.images[0]
      };

      const response = await fetch(`http://localhost:5001/api/apartments/${listingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const result = await response.json().catch(() => null);

      if (!response.ok) {
        console.error("Failed to update listing:", result);
        alert(result?.error || result?.message || "Failed to update listing. The images might be too large.");
        return;
      }

      onSave();
    } catch (err) {
      console.error("Failed to update listing:", err);
      alert("Failed to update listing. Please try again.");
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
                <div className="flex gap-2">
                  <div className="relative flex-1">
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
                  <button 
                    type="button"
                    onClick={handleGeocode}
                    disabled={isGeocoding}
                    className="bg-slate-800 hover:bg-slate-700 text-white px-4 rounded-xl flex items-center gap-2 transition-colors disabled:opacity-50"
                  >
                    {isGeocoding ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div> : <Search size={18} />}
                    Verify
                  </button>
                </div>
              </div>

              {/* Map Preview */}
              <div className="h-48 w-full rounded-xl overflow-hidden border border-slate-800 bg-slate-900 z-0">
                <MapContainer center={mapCenter} zoom={15} style={{ height: "100%", width: "100%" }} zoomControl={false}>
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  />
                  <Marker position={[formData.lat, formData.lng]} />
                  <ChangeView center={[formData.lat, formData.lng]} />
                </MapContainer>
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
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-slate-300">Lease Duration</label>
                <select 
                  name="leaseDuration"
                  value={formData.leaseDuration}
                  onChange={handleInputChange}
                  className="w-full bg-slate-800/50 border-slate-700 rounded-xl focus:ring-primary focus:border-primary px-4 py-3 text-white"
                >
                  <option>Full Year</option>
                  <option>Semester</option>
                </select>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold">
                3
              </span>
              <h3 className="font-bold text-lg text-white">Property Photos</h3>
            </div>
            <div className="space-y-4">
              <label className="border-2 border-dashed border-slate-800 rounded-2xl p-10 flex flex-col items-center justify-center gap-3 hover:border-primary transition-colors cursor-pointer group">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                />
                <div className="w-14 h-14 rounded-full bg-slate-800 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                  <Camera
                    className="text-slate-400 group-hover:text-primary transition-colors"
                    size={30}
                  />
                </div>
                <div className="text-center">
                  <p className="font-bold text-white">Click to add more photos</p>
                  <p className="text-sm text-slate-500">
                    Max 10 photos, JPG or PNG formats only.
                  </p>
                </div>
              </label>

              {formData.images.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {formData.images.map((img, idx) => (
                    <div
                      key={idx}
                      className="aspect-square rounded-xl overflow-hidden border border-slate-800 relative group"
                    >
                      <img
                        src={img}
                        alt=""
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(idx)}
                        className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold">
                4
              </span>
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

          <div className="pt-4 flex flex-col sm:flex-row gap-4">
            <button 
              type="button"
              onClick={onBack}
              className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-bold py-4 rounded-xl transition-all order-2 sm:order-1"
            >
              Cancel
            </button>
            <button 
              type="button"
              onClick={handleDelete}
              disabled={isDeleting || saving}
              className="flex-1 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/20 font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 order-3 sm:order-2"
            >
              {isDeleting ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current"></div> : <Trash2 size={20} />}
              Delete Listing
            </button>
            <button 
              type="submit"
              disabled={saving || isDeleting}
              className="flex-[2] bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-xl shadow-lg shadow-primary/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50 order-1 sm:order-3"
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
