import mongoose from "mongoose";

const ListingSchema = new mongoose.Schema(
  {
    // Relationship
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    // Core Info
    title: String,
    description: String,
    price: Number,
    images: [String],

    // Filters
    roomType: String,       // "Private", "Shared"
    leaseDuration: String,  // "Semester", "Full Year"

    // Amenities
    amenities: [String],    // ["Wifi", "AC", "Gym"]

    // Geospatial — MUST follow this exact structure for $near to work
    location: {
      type: { type: String, default: "Point" },
      coordinates: [Number], // [Longitude, Latitude]
    },
    address: String,
  },
  { timestamps: true }
);

// Required for geospatial queries ($near, $geoWithin)
// sparse: true allows documents without location to be inserted without error
ListingSchema.index({ location: "2dsphere" }, { sparse: true });

export default mongoose.model("Listing", ListingSchema);
