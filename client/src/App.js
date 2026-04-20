import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
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
        <Route
          path="/onboarding"
          element={
            <ProtectedRoute>
              <Onboarding />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student-dashboard"
          element={
            <ProtectedRoute roles={["student"]}>
              <StudentDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/owner-dashboard"
          element={
            <ProtectedRoute roles={["owner"]}>
              <OwnerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/browse-roommates"
          element={
            <ProtectedRoute roles={["student"]}>
              <Navigate to="/student-dashboard" replace state={{ studentTab: "browseRoommates" }} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/roommate/:roommateId"
          element={
            <ProtectedRoute>
              <RoommateProfilePage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

