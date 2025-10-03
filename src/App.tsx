import { Routes, Route, BrowserRouter, useNavigate } from "react-router-dom";
import { LandingPage } from "./components/LandingPage";
import { AuthPage } from "./components/AuthPage";
import { RoleSelection } from "./components/RoleSelection";
import { JobSeekerDashboard } from "./components/JobSeekerDashboard";
import { RecruiterDashboard } from "./components/RecruiterDashboard";
import { AuthProvider, useAuth } from "./lib/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { ThemeProvider } from "./components/theme-provider";
import React, { useEffect } from "react";
import { supabase } from "./lib/supabaseClient";
import { SignupWizard } from "./components/SignupWizard";

// Improved AuthRedirector: only runs if user is authenticated, adds loading state, avoids unnecessary render
const AuthRedirector = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [checking, setChecking] = React.useState(false);

  React.useEffect(() => {
    if (!loading && user) {
      setChecking(true);
      const checkUserType = async () => {
        // Check candidates table
        const { data: candidate, error: candidateError } = await supabase
          .from("candidates")
          .select("id")
          .eq("id", user.id)
          .single();
        if (candidate) {
          navigate("/job-seeker-dashboard", { replace: true });
          setChecking(false);
          return;
        }
        // Check recruiters table
        const { data: recruiter, error: recruiterError } = await supabase
          .from("recruiters")
          .select("id")
          .eq("id", user.id)
          .single();
        if (recruiter) {
          navigate("/recruiter-dashboard", { replace: true });
          setChecking(false);
          return;
        }
        // If not found, redirect to signup
        navigate("/signup", { replace: true });
        setChecking(false);
      };
      checkUserType();
    }
  }, [user, loading, navigate]);

  // Show nothing if not authenticated, or loading spinner if checking profile
  if (loading || checking || !user) return null;
  return null;
};

export default function App() {
  return (
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
        <AuthProvider>
          <Routes>
            <Route path="/" element={<LandingPage />} />

            <Route
              path="/login"
              element={
                <>
                  <AuthPage mode="signin" />
                  {/* Only show AuthRedirector if user is authenticated */}
                  <AuthRedirector />
                </>
              }
            />
            <Route path="/signup" element={<SignupWizard />} />

            <Route
              path="/role-selection"
              element={
                <ProtectedRoute>
                  <RoleSelection />
                </ProtectedRoute>
              }
            />
            <Route
              path="/job-seeker-dashboard"
              element={
                <ProtectedRoute>
                  <JobSeekerDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/recruiter-dashboard"
              element={
                <ProtectedRoute>
                  <RecruiterDashboard />
                </ProtectedRoute>
              }
            />
          </Routes>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
