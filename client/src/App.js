import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Onboarding from "./pages/onboarding/Onboarding";
import OwnerDashboard from "./pages/OwnerDashboard";
import AccountCreation from "./pages/onboarding/AccountCreation";
import OTPVerify from "./pages/OTPVerify"; 
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
      </Routes>
    </BrowserRouter>
  );
}

export default App;

