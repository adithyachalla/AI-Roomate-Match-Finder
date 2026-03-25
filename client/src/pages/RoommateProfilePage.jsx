import { useNavigate, useParams } from "react-router-dom";
import RoommateDetail from "./components/RoommateDetail";

export default function RoommateProfilePage() {
  const navigate = useNavigate();
  const { roommateId } = useParams();

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className="w-full h-screen bg-background-dark">
      <RoommateDetail roommateId={roommateId} onBack={handleBack} />
    </div>
  );
}
