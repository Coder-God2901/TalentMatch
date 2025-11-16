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
import { SignIn1 } from "./components/SignIn1";
import { SignUp } from "./components/SignUp";
import { RecruiterProfile } from "./components/RecruiterProfile";
import { JobSeekerProfile } from "./components/JobSeekerProfile";
import JobDetails from "./pages/recruiter/JobDetails";
import RankedCandidates from "./pages/recruiter/RankedCandidates";
import { RecruiterDashboard1 } from "./components/RecruiterDashboard1";
import { CandidatesPage } from "./components/CandidatesPage";
import { RankingCandidates1 } from "./components/RankingCandidates1";
import { JobSeekerDashboard1 } from "./components/JobSeekerDashboard1";

const activeJobs = [  
    {
      id: 1,
      title: "Senior Frontend Developer",
      department: "Engineering",
      location: "San Francisco, CA",
      salary: "$120k - $150k",
      candidates: 45,
      newApplications: 8,
      posted: "2 weeks ago",
      status: "Active",
      urgency: "High",
    },
    {
      id: 2,
      title: "Product Manager",
      department: "Product",
      location: "Remote",
      salary: "$110k - $140k",
      candidates: 32,
      newApplications: 5,
      posted: "1 week ago",
      status: "Active",
      urgency: "Medium",
    },
    {
      id: 3,
      title: "DevOps Engineer",
      department: "Engineering",
      location: "Austin, TX",
      salary: "$100k - $130k",
      candidates: 28,
      newApplications: 12,
      posted: "3 days ago",
      status: "Active",
      urgency: "High",
    },
  ];


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
      <ThemeProvider defaultTheme="light" storageKey="talentmatch-theme">
        <div className="min-h-screen bg-background">
        <AuthProvider>
        <AuthRedirector />

        <Routes>
          <Route path="/" element={<LandingPage />} />

          <Route path="/login" element={<SignIn1 />} />
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
                <JobSeekerDashboard1 />
              </ProtectedRoute>
            }
          />
          <Route
            path="/recruiter-dashboard"
            element={
              <ProtectedRoute>
                <RecruiterDashboard1 />
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

          <Route
            path="/job/:id"
            element={
              <ProtectedRoute>
                <JobDetails />
              </ProtectedRoute>
            }
          />

          <Route
            path="/recruiter/jobs/:id/ranked"
            element={
              <ProtectedRoute>
                <RankedCandidates />
              </ProtectedRoute>
            }
          />
          <Route
            path="/recruiter/jobs/:id/ranked-candidates"
            element={
              <ProtectedRoute>
                <RankingCandidates1 />
              </ProtectedRoute>
            }
          />
          <Route
            path="/candidates"
            element={
              <ProtectedRoute>
                <CandidatesPage />
              </ProtectedRoute>
            }
          />
        </Routes>
        </AuthProvider>
        </div>
      </ThemeProvider>
    </BrowserRouter>
  );
}
