import { useNavigate } from "react-router-dom";
import RoommateListings from "./components/RoommateListings";

export default function BrowseRoommates() {
  const navigate = useNavigate();

  const handleViewDetail = (roommateId) => {
    // Navigate to roommate profile detail page
    navigate(`/roommate/${roommateId}`);
  };

  return (
    <div className="w-full h-screen bg-background-dark flex flex-col">
      {/* Header */}
      <header className="bg-gradient-to-r from-slate-900 to-slate-950 border-b border-white/10 px-6 py-4 flex items-center gap-4">
        <button 
          onClick={() => navigate(-1)}
          className="text-white hover:text-primary transition text-xl"
        >
          ← Back
        </button>
        <h1 className="text-2xl font-bold text-white">Browse Roommates</h1>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden">
        <RoommateListings onViewDetail={handleViewDetail} />
      </main>
    </div>
  );
}
