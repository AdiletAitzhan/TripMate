import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { PrivateRoute } from "./components/PrivateRoute";
import { Landing } from "./pages/Landing";
import { Home } from "./pages/Home";
import { Profile } from "./pages/Profile";
import { ProfileCreation } from "./pages/ProfileCreation";
import { Requests } from "./pages/Requests";
import { TripRequestDetail } from "./pages/TripRequestDetail";
import { Login } from "./pages/Login";
import { SignUpOptions } from "./pages/SignUpOptions";
import { ManualRegistration } from "./pages/ManualRegistration";
import { EmailVerification } from "./pages/EmailVerification";
import { ForgotPassword } from "./pages/ForgotPassword";
import { ResetPassword } from "./pages/ResetPassword";

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter
          future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
        >
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route
              path="/home"
              element={
                <PrivateRoute>
                  <Home />
                </PrivateRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <PrivateRoute>
                  <Profile />
                </PrivateRoute>
              }
            />
            <Route
              path="/create-profile"
              element={
                <PrivateRoute>
                  <ProfileCreation />
                </PrivateRoute>
              }
            />
            <Route
              path="/requests"
              element={
                <PrivateRoute>
                  <Requests />
                </PrivateRoute>
              }
            />
            <Route
              path="/requests/:id"
              element={
                <PrivateRoute>
                  <TripRequestDetail />
                </PrivateRoute>
              }
            />

            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUpOptions />} />
            <Route path="/signup/email" element={<ManualRegistration />} />
            <Route path="/verify-email" element={<EmailVerification />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
