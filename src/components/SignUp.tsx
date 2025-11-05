import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { ArrowLeft, Sparkles, User, Building2, Github, Linkedin } from "lucide-react";
import { motion } from "framer-motion";

// try to use sonner toast if available
let toastSuccess: (msg: string) => void = (m: string) => alert(m);
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const s = require("sonner");
  if (s?.toast?.success) toastSuccess = (m: string) => s.toast.success(m);
} catch {}

const benefits = [
  { icon: Sparkles, text: "AI-driven matching for faster hiring" },
  { icon: Github, text: "Showcase your portfolio and GitHub" },
  { icon: Linkedin, text: "Connect with recruiters and professionals" },
];

export function SignUp() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<"job_seeker" | "recruiter" | "">("");
  const [github, setGithub] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [resume, setResume] = useState<File | null>(null);
  const [company, setCompany] = useState("");
  const [position, setPosition] = useState("");

  const handleAccountNext = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const { data: candidate, error: candidateError } = await supabase
      .from("candidates")
      .select("email")
      .eq("email", email)
      .maybeSingle();

    if (candidateError) {
      setError(
        "Cannot check candidates table for existing email. This is likely an RLS/permission issue — enable a SELECT policy or sign up to create the auth user."
      );
      setIsLoading(false);
      return;
    }
    if (candidate) {
      setError("This email is already registered as a candidate. Please log in.");
      setIsLoading(false);
      return;
    }

    const { data: recruiter, error: recruiterError } = await supabase
      .from("recruiters")
      .select("email")
      .eq("email", email)
      .maybeSingle();

    if (recruiterError) {
      setError(
        "Cannot check recruiters table for existing email. This is likely an RLS/permission issue — enable a SELECT policy or sign up to create the auth user."
      );
      setIsLoading(false);
      return;
    }
    if (recruiter) {
      setError("This email is already registered as a recruiter. Please log in.");
      setIsLoading(false);
      return;
    }

    setIsLoading(false);
    setStep(2);
  };

  const handleRoleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (!role) {
      setError("Please select a role");
      return;
    }
    setError("");
    setStep(3);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const { data, error: signupError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name } },
    });

    if (signupError) {
      setError(signupError.message);
      setIsLoading(false);
      return;
    }

    const userId = (data as any)?.user?.id ?? null;

    if (!userId) {
      setError("Signup failed: no user id returned. Please try again.");
      setIsLoading(false);
      return;
    }

    try {
      let insertRes;
      if (role === "job_seeker") {
        insertRes = await supabase.from("candidates").insert([
          {
            id: userId,
            display_name: name,
            email,
            github: github || null,
            linkedin: linkedin || null,
            resume_url: "",
          },
        ]);
      } else {
        insertRes = await supabase.from("recruiters").insert([
          {
            id: userId,
            display_name: name,
            email,
            company_name: company || null,
            position_of_power: position || null,
            linkedin: linkedin || null,
          },
        ]);
      }

      if (insertRes.error) {
        if (insertRes.error.message?.toLowerCase().includes("row-level security")) {
          setError("Profile creation blocked by DB row-level security. Adjust table policies to allow inserts for new users.");
        } else {
          setError("Profile creation failed: " + insertRes.error.message);
        }
        setIsLoading(false);
        return;
      }

      toastSuccess("Signup successful — your profile was created.");
      setIsLoading(false);
      navigate("/login");
    } catch (err: any) {
      setError("Unexpected error: " + (err?.message ?? String(err)));
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-cyan-50 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-indigo-400/20 to-purple-400/20 rounded-full blur-3xl"
          animate={{ x: [0, 100, 0], y: [0, -40, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-r from-cyan-400/20 to-pink-400/20 rounded-full blur-3xl"
          animate={{ x: [0, -80, 0], y: [0, 60, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        />
      </div>

      <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="w-full max-w-5xl flex flex-col lg:flex-row gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="flex-1 max-w-lg"
          >
            <Button variant="ghost" onClick={() => navigate("/")} className="mb-8 -ml-2">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>

            <div className="space-y-8">
              <div>
                <h1 className="text-4xl lg:text-5xl mb-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent leading-tight">
                  Join TalentMatch Today! 🚀
                </h1>
                <p className="text-xl text-slate-600 leading-relaxed">
                  Start your journey to finding the perfect job or ideal candidate with AI-powered matching.
                </p>
              </div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }} className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-slate-800 mb-4">Why professionals choose TalentAI:</h3>
                  <div className="space-y-4">
                    {benefits.map((benefit, index) => (
                      <motion.div key={index} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }} className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center">
                          <benefit.icon className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-slate-700">{benefit.text}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>

                <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-sm text-slate-600">Setup Progress</span>
                    <span className="text-sm font-semibold text-indigo-600">Step {step} of 3</span>
                  </div>
                  <Progress value={(step / 3) * 100} className="h-2 mb-2" />
                  <p className="text-sm text-slate-600">Complete your profile to unlock better matches! 🎯</p>
                </div>
              </motion.div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.2 }} className="flex-1 max-w-md w-full">
            <div className="w-full max-w-md mx-auto">
              <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-sm">
                <CardHeader className="text-center space-y-4">
                  <div className="flex justify-center">
                    <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg">
                      <Sparkles className="w-8 h-8 text-white" />
                    </div>
                  </div>
                  <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0 px-4 py-1">
                    ✨ Free Account • No Credit Card Required
                  </Badge>
                  <CardTitle className="text-3xl bg-gradient-to-r from-slate-800 to-indigo-800 bg-clip-text text-transparent">
                    {step === 1 ? "Create Account" : step === 2 ? "Select Role" : "Profile Details"}
                  </CardTitle>
                  <CardDescription className="text-base text-slate-600 mt-2">
                    {step === 1 ? "Create your account in 30 seconds" : step === 2 ? "Choose your role to customize your experience" : role === "job_seeker" ? "Add your professional details" : "Add your company details"}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                  {error && <div className="text-red-500 text-center mb-2">{error}</div>}

                  {step === 1 && (
                    <>
                      <div className="space-y-4">
                        <div className="flex flex-col gap-3">
                          <Button type="button" variant="outline" className="w-full flex items-center justify-center gap-2" onClick={async () => { setIsLoading(true); const { error } = await supabase.auth.signInWithOAuth({ provider: "google" }); if (error) setError(error.message); setIsLoading(false); }}>
                            <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/google/google-original.svg" alt="Google" className="w-5 h-5 mr-2" /> Sign up with Google
                          </Button>
                          <Button type="button" variant="outline" className="w-full flex items-center justify-center gap-2" onClick={async () => { setIsLoading(true); const { error } = await supabase.auth.signInWithOAuth({ provider: "github" }); if (error) setError(error.message); setIsLoading(false); }}>
                            <Github className="w-5 h-5 mr-2" /> Sign up with GitHub
                          </Button>
                          <Button type="button" variant="outline" className="w-full flex items-center justify-center gap-2" onClick={async () => { setIsLoading(true); /* Linkedin OAuth may require extra setup */ setIsLoading(false); }}>
                            <Linkedin className="w-5 h-5 mr-2" /> Sign up with LinkedIn
                          </Button>
                        </div>

                        <div className="relative my-6">
                          <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-gray-300" />
                          </div>
                          <div className="relative flex justify-center text-sm">
                            <span className="bg-white px-2 text-gray-500">or</span>
                          </div>
                        </div>
                      </div>

                      <form onSubmit={handleAccountNext} className="space-y-5">
                        <Input id="name" type="text" placeholder="Full Name" value={name} onChange={e => setName(e.target.value)} className="h-12" required />
                        <Input id="email" type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} className="h-12" required />
                        <Input id="password" type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} className="h-12" required />
                        <Button type="submit" className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-indigo-500 to-cyan-500 text-white">Next</Button>
                      </form>

                      <div className="text-center mt-4">
                        <span className="text-gray-600">
                        <Button variant="link" className="text-indigo-600 font-semibold" onClick={() => navigate("/login")}>Already have an account? Log in</Button></span>
                      </div>
                    </>
                  )}

                  {step === 2 && (
                    <form onSubmit={handleRoleNext} className="space-y-5">
                      <div className="grid grid-cols-2 gap-4">
                        <Button type="button" className={`w-full ${role === "job_seeker" ? "ring-2 ring-blue-400" : ""}`} size="lg" onClick={() => setRole("job_seeker")}>
                          <User className="w-5 h-5 mr-2" /> Job Seeker
                        </Button>
                        <Button type="button" className={`w-full ${role === "recruiter" ? "ring-2 ring-purple-400" : ""}`} size="lg" onClick={() => setRole("recruiter")}>
                          <Building2 className="w-5 h-5 mr-2" /> Recruiter
                        </Button>
                      </div>
                      <Button type="submit" className="w-full bg-gradient-to-r from-indigo-500 to-cyan-500 text-white" size="lg" disabled={isLoading}>Next</Button>
                      <div className="text-center mt-4">
                        <Button variant="link" className="text-base text-slate-600" onClick={() => setStep(step - 1)}>Back</Button>
                      </div>
                    </form>
                  )}

                  {step === 3 && (
                    <form onSubmit={handleSignup} className="space-y-5">
                      {role === "job_seeker" ? (
                        <>
                          <Input id="github" type="text" placeholder="GitHub Profile URL" value={github} onChange={e => setGithub(e.target.value)} className="h-12" />
                          <Input id="linkedin" type="text" placeholder="LinkedIn Profile URL" value={linkedin} onChange={e => setLinkedin(e.target.value)} className="h-12" />
                          <Input id="resume" type="file" accept=".pdf,.doc,.docx" onChange={e => setResume(e.target.files?.[0] || null)} className="h-12" />
                        </>
                      ) : (
                        <>
                          <Input id="company" type="text" placeholder="Company Name" value={company} onChange={e => setCompany(e.target.value)} className="h-12" required />
                          <Input id="position" type="text" placeholder="Position of Power (e.g. HR Manager)" value={position} onChange={e => setPosition(e.target.value)} className="h-12" required />
                          <Input id="linkedin-company" type="text" placeholder="LinkedIn Profile URL" value={linkedin} onChange={e => setLinkedin(e.target.value)} className="h-12" />
                        </>
                      )}
                      <Button type="submit" className="w-full bg-gradient-to-r from-indigo-500 to-cyan-500 text-white" size="lg" disabled={isLoading}>Sign Up</Button>
                      <div className="text-center mt-4">
                        <Button variant="link" className="text-base text-slate-600" onClick={() => setStep(step - 1)}>Back</Button>
                      </div>
                    </form>
                  )}
                </CardContent>
              </Card>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
