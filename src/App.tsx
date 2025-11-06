import {
  Routes,
  Route,
  BrowserRouter,
  useNavigate,
  useLocation,
} from "react-router-dom";
import { LandingPage } from "./components/LandingPage";
import { AuthPage } from "./components/AuthPage";
import { RoleSelection } from "./components/RoleSelection";
import { JobSeekerDashboard } from "./components/JobSeekerDashboard";
import { RecruiterDashboard } from "./components/RecruiterDashboard";
import { AuthProvider, useAuth } from "./lib/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { ThemeProvider } from "./components/theme-provider";
import React from "react";
import { supabase } from "./lib/supabaseClient";
import { SignIn } from "./components/SignIn";
import { SignUp } from "./components/SignUp";
import { RecruiterProfile } from "./components/RecruiterProfile";
import { JobSeekerProfile } from "./components/JobSeekerProfile";

/**
 * AuthRedirector
 * - placed globally (inside AuthProvider) so it runs after any login
 * - waits for auth loading to finish and for a stable user
 * - small debounce to allow session/profile propagation
 * - uses maybeSingle() so 0-row results don't throw
 * - avoids redirect loops by checking current location and la stCheckedUserRef
 */
const AuthRedirector = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const checkingRef = React.useRef(false);
  const lastCheckedUserRef = React.useRef<string | null>(null);
  const mountedRef = React.useRef(true);

  React.useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  React.useEffect(() => {
    if (loading) return;
    if (!user) {
      // user not signed in — do nothing
      lastCheckedUserRef.current = null;
      return;
    }

    //  avoid duplicate checks for same user
    if (checkingRef.current || lastCheckedUserRef.current === user.id) return;
    checkingRef.current = true;
    lastCheckedUserRef.current = user.id;

    (async () => {
      try {
        //  small delay to let  session/profile propagate (helps races)
        await new Promise((resolve) => setTimeout(resolve, 300));

        // If user is already on a dashboard for some reason, skip checks
        const pathname = location.pathname;
        if (
          pathname.startsWith("/job-seeker-dashboard") ||
          pathname.startsWith("/recruiter-dashboard")
        ) {
          return;
        }

        // check candidates
        const { data: candidate, error: candidateError } = await supabase
          .from("candidates")
          .select("id")
          .eq("id", user.id)
          .maybeSingle();

        if (candidateError) {
          console.warn("candidate check error", candidateError);
        }
        if (candidate) {
          if (mountedRef.current)
            navigate("/job-seeker-dashboard", { replace: true });
          return;
        }

        //  check recruiters
        const { data: recruiter, error: recruiterError } = await supabase
          .from("recruiters")
          .select("id")
          .eq("id", user.id)
          .maybeSingle();

        if (recruiterError) {
          console.warn("recruiter check error", recruiterError);
        }
        if (recruiter) {
          if (mountedRef.current)
            navigate("/recruiter-dashboard", { replace: true });
          return;
        }

        //  no profile found -> send to signup to complete profile (avoid loop if already on signup)
        if (mountedRef.current && location.pathname !== "/signup") {
          navigate("/signup", { replace: true });
        }
      } catch (err) {
        console.error("AuthRedirector check error", err);
      } finally {
        checkingRef.current = false;
      }
    })();
  }, [user, loading, navigate, location]);

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
        <AuthRedirector />

        <Routes>
          <Route path="/" element={<LandingPage />} />

          <Route path="/login" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />

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

          <Route
            path="/job-seeker-profile"
            element={
              <ProtectedRoute>
                <JobSeekerProfile />
              </ProtectedRoute>
            }
          />

          <Route
            path="/recruiter-profile"
            element={
              <ProtectedRoute>
                <RecruiterProfile />
              </ProtectedRoute>
            }
          />
        </Routes>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
