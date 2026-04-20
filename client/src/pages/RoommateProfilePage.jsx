import { useNavigate, useParams, useLocation } from "react-router-dom";
import RoommateDetail from "./components/RoommateDetail";

export default function RoommateProfilePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { roommateId } = useParams();

  const handleBack = () => {
    const tab = location.state?.returnToStudentTab;
    if (tab) {
      navigate("/student-dashboard", { state: { studentTab: tab } });
      return;
    }
    navigate(-1);
  };

  return (
    <div className="w-full h-screen bg-background-dark">
      <RoommateDetail roommateId={roommateId} onBack={handleBack} />
    </div>
  );
}
