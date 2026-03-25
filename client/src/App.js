import { BrowserRouter, Route, Routes } from "react-router-dom";
import BrowseRoommates from "./pages/BrowseRoommates";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import AccountCreation from "./pages/onboarding/AccountCreation";
import Onboarding from "./pages/onboarding/Onboarding";
import OTPVerify from "./pages/OTPVerify";
import OwnerDashboard from "./pages/OwnerDashboard";
import RoommateProfilePage from "./pages/RoommateProfilePage";
import StudentDashboard from "./pages/StudentDashboard";


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<AccountCreation />} />
        <Route path="/otp-verify" element={<OTPVerify />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/student-dashboard" element={<StudentDashboard />} />
        <Route path="/owner-dashboard" element={<OwnerDashboard />} />
        <Route path="/browse-roommates" element={<BrowseRoommates />} />
        <Route path="/roommate/:roommateId" element={<RoommateProfilePage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

