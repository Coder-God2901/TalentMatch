import { createBrowserRouter } from "react-router-dom";
import { LandingPage } from "./components/LandingPage";
import { AuthPage } from "./components/AuthPage";
import SignUp from "./components/SignUp";
import SignIn from "./components/SignIn";
import { RecruiterDashboard } from "./components/RecruiterDashboard";
import { JobSeekerDashboard } from "./components/JobSeekerDashboard";
import App from "./App";

export const router = createBrowserRouter([
  //   { path: '/', element: <LandingPage /> },
  { path: "/", element: <App /> },
  { path: "/signup", element: <SignUp /> },
  { path: "/signin", element: <SignIn /> },
  { path: "/recruiter-dashboard", element: <RecruiterDashboard /> },
  { path: "/candidate-dashboard", element: <JobSeekerDashboard /> },
]);
 