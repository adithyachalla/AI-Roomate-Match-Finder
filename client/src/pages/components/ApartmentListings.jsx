import React, { useState, useEffect } from "react";
import { Search, ChevronDown, Sparkles, MapPin } from "lucide-react";
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import ApartmentCard from "./ApartmentCard";

import L from "leaflet";
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const ApartmentListings = ({ onViewDetail }) => {
  const [allApartments, setAllApartments] = useState([]);
  const [filteredApartments, setFilteredApartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [priceFilter, setPriceFilter] = useState(null);
  const [bedroomFilter, setBedroomFilter] = useState(null);
  const [selectedAmenities, setSelectedAmenities] = useState([]);
  const [showPriceMenu, setShowPriceMenu] = useState(false);
  const [showBedMenu, setShowBedMenu] = useState(false);
  const [showAmenityMenu, setShowAmenityMenu] = useState(false);
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [sortBy, setSortBy] = useState("Best Match");
  const [showMapOnMobile, setShowMapOnMobile] = useState(false);

  useEffect(() => {
    fetch("http://localhost:5000/api/apartments")
      .then(res => res.json())
      .then(data => {
        setAllApartments(data);
        setFilteredApartments(data);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    let result = [...allApartments];

    // Search with Regex
    if (searchQuery) {
      try {
        const regex = new RegExp(searchQuery, "i");
        result = result.filter(apt => 
          regex.test(apt.title) || 
          regex.test(apt.address) || 
          apt.amenities.some(a => regex.test(a))
        );
      } catch (e) {
        // Fallback to simple search if regex is invalid
        result = result.filter(apt => 
          apt.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
          apt.address.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }
    }

    // Price Filter
    if (priceFilter) {
      result = result.filter(apt => apt.price <= priceFilter);
    }

    // Bedroom Filter
    if (bedroomFilter) {
      result = result.filter(apt => apt.bedrooms >= bedroomFilter);
    }

    // Amenities Filter
    if (selectedAmenities.length > 0) {
      result = result.filter(apt => 
        selectedAmenities.every(amenity => apt.amenities.includes(amenity))
      );
    }

    // Sorting
    if (sortBy === "Cheapest") {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === "Best Match") {
      // For Best Match, we prioritize AI matches and then maybe views or just default order
      result.sort((a, b) => {
        if (a.is_ai_match && !b.is_ai_match) return -1;
        if (!a.is_ai_match && b.is_ai_match) return 1;
        return 0;
      });
    }

    setFilteredApartments(result);
  }, [searchQuery, priceFilter, bedroomFilter, selectedAmenities, sortBy, allApartments]);

  const toggleAmenity = (amenity) => {
    setSelectedAmenities(prev => 
      prev.includes(amenity) ? prev.filter(a => a !== amenity) : [...prev, amenity]
    );
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Search & Filter Bar */}
      <div className="relative z-[50] px-6 py-4 border-b border-[#283039] bg-background-dark">
        <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row gap-4 items-center">
          <div className="flex flex-1 w-full items-stretch rounded-xl h-12 bg-[#1c2127] border border-[#283039]">
            <div className="text-slate-400 flex items-center justify-center pl-4">
              <Search size={20} />
            </div>
            <input 
              className="w-full bg-transparent border-none focus:ring-0 text-base font-normal px-4 text-white" 
              placeholder="Search by university or neighborhood (regex supported)..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2 w-full md:w-auto relative">
            {/* Price Filter */}
            <div className="relative">
              <button 
                onClick={() => {
                  setShowPriceMenu(!showPriceMenu);
                  setShowBedMenu(false);
                  setShowAmenityMenu(false);
                }}
                className={`flex h-10 shrink-0 items-center justify-center gap-x-2 rounded-full border px-4 transition-colors ${priceFilter ? 'bg-primary/20 border-primary text-primary' : 'bg-[#1c2127] border-[#283039] text-white'}`}
              >
                <span className="text-sm font-medium">{priceFilter ? `Up to $${priceFilter}` : 'Price Range'}</span>
                <ChevronDown size={16} />
              </button>
              {showPriceMenu && (
                <div className="absolute top-full mt-2 left-0 w-64 bg-[#1c2127] border border-[#283039] rounded-xl shadow-2xl z-[60] p-4">
                  <div className="mb-4">
                    <div className="flex justify-between text-xs font-bold mb-2">
                      <span>$0</span>
                      <span>$5,000</span>
                    </div>
                    <input 
                      type="range" 
                      min="0" 
                      max="5000" 
                      step="100"
                      value={priceFilter || 5000}
                      onChange={(e) => setPriceFilter(parseInt(e.target.value))}
                      className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-primary"
                    />
                    <p className="text-center text-sm font-bold mt-2 text-primary">Up to ${priceFilter || 5000}</p>
                  </div>
                  <button 
                    onClick={() => { setPriceFilter(null); setShowPriceMenu(false); }}
                    className="w-full text-center px-4 py-2 text-red-400 hover:bg-red-400/10 rounded-lg text-sm font-bold"
                  >
                    Reset Price
                  </button>
                </div>
              )}
            </div>

            {/* Bedroom Filter */}
            <div className="relative">
              <button 
                onClick={() => {
                  setShowBedMenu(!showBedMenu);
                  setShowPriceMenu(false);
                  setShowAmenityMenu(false);
                }}
                className={`flex h-10 shrink-0 items-center justify-center gap-x-2 rounded-full border px-4 transition-colors ${bedroomFilter ? 'bg-primary/20 border-primary text-primary' : 'bg-[#1c2127] border-[#283039] text-white'}`}
              >
                <span className="text-sm font-medium">{bedroomFilter ? `${bedroomFilter}+ Beds` : 'Bedrooms'}</span>
                <ChevronDown size={16} />
              </button>
              {showBedMenu && (
                <div className="absolute top-full mt-2 left-0 w-40 bg-[#1c2127] border border-[#283039] rounded-xl shadow-2xl z-[60] p-2">
                  {[1, 2, 3, 4].map(b => (
                    <button 
                      key={b}
                      onClick={() => { setBedroomFilter(b); setShowBedMenu(false); }}
                      className="w-full text-left px-4 py-2 hover:bg-slate-800 rounded-lg text-sm"
                    >
                      {b}+ Bedrooms
                    </button>
                  ))}
                  <button 
                    onClick={() => { setBedroomFilter(null); setShowBedMenu(false); }}
                    className="w-full text-left px-4 py-2 text-red-400 hover:bg-red-400/10 rounded-lg text-sm mt-1"
                  >
                    Clear Filter
                  </button>
                </div>
              )}
            </div>

            {/* Amenities Filter */}
            <div className="relative">
              <button 
                onClick={() => {
                  setShowAmenityMenu(!showAmenityMenu);
                  setShowPriceMenu(false);
                  setShowBedMenu(false);
                }}
                className={`flex h-10 shrink-0 items-center justify-center gap-x-2 rounded-full border px-4 transition-colors ${selectedAmenities.length > 0 ? 'bg-primary/20 border-primary text-primary' : 'bg-[#1c2127] border-[#283039] text-white'}`}
              >
                <span className="text-sm font-medium">{selectedAmenities.length > 0 ? `${selectedAmenities.length} Selected` : 'Amenities'}</span>
                <ChevronDown size={16} />
              </button>
              {showAmenityMenu && (
                <div className="absolute top-full mt-2 right-0 w-64 bg-[#1c2127] border border-[#283039] rounded-xl shadow-2xl z-[60] p-3 space-y-1">
                  {["Gym", "Pool", "WiFi", "Laundry", "Parking", "Pet Friendly", "Furnished", "Security", "Balcony"].map(a => (
                    <label key={a} className="flex items-center gap-3 cursor-pointer hover:bg-slate-800 p-2 rounded-lg transition-colors">
                      <input 
                        type="checkbox" 
                        checked={selectedAmenities.includes(a)}
                        onChange={() => toggleAmenity(a)}
                        className="rounded border-slate-700 bg-slate-800 text-primary focus:ring-primary"
                      />
                      <span className="text-sm">{a}</span>
                    </label>
                  ))}
                  <button 
                    onClick={() => { setSelectedAmenities([]); setShowAmenityMenu(false); }}
                    className="w-full text-left px-2 py-2 text-red-400 hover:bg-red-400/10 rounded-lg text-sm font-bold"
                  >
                    Clear All
                  </button>
                </div>
              )}
            </div>

            <button className="flex h-10 shrink-0 items-center justify-center gap-2 rounded-full bg-primary/10 border border-primary/20 px-4 text-primary">
              <Sparkles size={16} />
              <span className="text-sm font-bold">AI Matches Only</span>
            </button>
          </div>
        </div>
      </div>

      <main className="relative z-0 flex flex-1 overflow-hidden">
        {/* Sidebar: Listings */}
        <section className={`
          ${showMapOnMobile ? 'hidden md:flex' : 'flex'}
          w-full md:w-[450px] lg:w-[500px] xl:w-[600px] flex-col flex-nowrap bg-[#0c1219] border-r border-[#283039] overflow-y-auto custom-scrollbar p-6 gap-6
        `}>
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-xl font-bold">{filteredApartments.length} Listings found</h1>
            <div className="flex items-center gap-2 text-sm text-slate-400 relative">
              <span>Sort by:</span>
              <button 
                onClick={() => setShowSortMenu(!showSortMenu)}
                className="font-bold text-white flex items-center gap-1"
              >
                {sortBy} <ChevronDown size={16} />
              </button>
              {showSortMenu && (
                <div className="absolute top-full mt-2 right-0 w-40 bg-[#1c2127] border border-[#283039] rounded-xl shadow-2xl z-[60] p-2">
                  {["Best Match", "Cheapest"].map(option => (
                    <button 
                      key={option}
                      onClick={() => { setSortBy(option); setShowSortMenu(false); }}
                      className={`w-full text-left px-4 py-2 hover:bg-slate-800 rounded-lg text-sm ${sortBy === option ? 'text-primary font-bold' : 'text-white'}`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : filteredApartments.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-slate-500">
              <Search size={48} className="mb-4 opacity-20" />
              <p>No listings match your search criteria.</p>
            </div>
          ) : (
            filteredApartments.map(apt => (
              <ApartmentCard key={apt.id} apartment={apt} onClick={() => onViewDetail(apt.id)} />
            ))
          )}
        </section>

        {/* Right Side: Interactive Map */}
        <div className={`
          ${showMapOnMobile ? 'flex' : 'hidden md:flex'}
          relative z-0 flex-1
        `}>
            <MapContainer 
              className="relative z-0"
              center={[34.0224, -118.2851]}
              zoom={14}
              scrollWheelZoom={true}
              style={{ height: "100%", width: "100%" }}
            >
              <TileLayer
                url="https://{s}.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}{r}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
              />
            {filteredApartments.map((apt) => {
              const lat = parseFloat(apt.lat);
              const lng = parseFloat(apt.lng);
              
              if (isNaN(lat) || isNaN(lng)) {
                return null;
              }

              return (
                <Marker
                  key={apt.id}
                  position={[lat, lng]}
                >
                  <Popup>
                    <div className="text-white p-1">
                      <img src={apt.image_url} className="w-full h-20 object-cover rounded mb-2" alt="" />
                      <strong className="block text-sm">{apt.title}</strong>
                      <span className="text-xs text-slate-400">${apt.price.toLocaleString()}/mo</span>
                      <button 
                        onClick={() => onViewDetail(apt.id)}
                        className="mt-2 w-full bg-primary text-white text-[10px] py-1 rounded font-bold"
                      >
                        View Details
                      </button>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>
        </div>

        {/* Mobile Toggle Button */}
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[1000] md:hidden">
          <button 
            onClick={() => setShowMapOnMobile(!showMapOnMobile)}
            className="bg-navy-dark text-white px-6 py-3 rounded-full font-bold shadow-2xl border border-slate-700 flex items-center gap-2"
          >
            {showMapOnMobile ? (
              <>
                <Search size={18} /> Show List
              </>
            ) : (
              <>
                <MapPin size={18} /> Show Map
              </>
            )}
          </button>
        </div>
      </main>
    </div>
  );
};

export default ApartmentListings;
