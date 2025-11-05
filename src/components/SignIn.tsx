import React, { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Separator } from "./ui/separator";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Github,
  Mail,
  Sparkles,
  Linkedin,
  CheckCircle,
  Zap,
  Shield,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

export function SignIn() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  // const [isLoading, setIsLoading] = useState(false);

  const benefits = [
    { icon: Zap, text: "AI-powered matching in seconds" },
    { icon: CheckCircle, text: "Get matched with top opportunities" },
    { icon: Shield, text: "100% secure and private" },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // setIsLoading(true);

    // Sign-in logic remains the same.
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      // alert(error.message);
      console.log("Signin error details:", error.message);
    } else {
    }
    // On successful login, the AuthRedirector in App.tsx will handle navigation.
    console.log("Sign-in successful\nUser Details:", { email });
    // setIsLoading(false);
  };

  // The rest of your beautiful JSX remains exactly the same...
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-cyan-50 relative overflow-hidden">
      {/* ... */}
      <div className="absolute inset-0">
        <motion.div
          className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-indigo-400/20 to-purple-400/20 rounded-full blur-3xl"
          animate={{ x: [0, 100, 0], y: [0, -50, 0] }}
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
            <Button
              variant="ghost"
              onClick={() => navigate("/")}
              className="mb-8 -ml-2 hover:bg-white/50"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
            <div className="space-y-8">
              <div>
                <h1 className="text-4xl lg:text-5xl mb-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent leading-tight">
                  {"Welcome Back! 👋"}
                </h1>
                <p className="text-xl text-slate-600 leading-relaxed">
                  {"Ready to discover your next amazing opportunity? Sign in to continue your journey."}
                </p>
              </div>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex-1 max-w-md w-full"
          >
            <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-sm">
              <CardHeader className="text-center space-y-4">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                  className="flex justify-center"
                >
                  <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg">
                    <Sparkles className="w-8 h-8 text-white" />
                  </div>
                </motion.div>
                <div>
                  <CardTitle className="text-3xl bg-gradient-to-r from-slate-800 to-indigo-800 bg-clip-text text-transparent">
                    {"Sign In"}
                  </CardTitle>
                  <CardDescription className="text-base text-slate-600 mt-2">
                    {"Access your personalized dashboard"}
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      variant="outline"
                      // onClick={() => handleOAuthSignIn("google")}
                      // disabled={isLoading}
                      className="w-full h-12 text-base border-2 hover:border-indigo-300 hover:bg-indigo-50/50 transition-all duration-300"
                    >
                      <Mail className="w-5 h-5 mr-3" />
                      Continue with Google
                    </Button>
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      variant="outline"
                      // onClick={() => handleOAuthSignIn("linkedin")}
                      // disabled={isLoading}
                      className="w-full h-12 text-base border-2 hover:border-blue-300 hover:bg-blue-50/50 transition-all duration-300"
                    >
                      <Linkedin className="w-5 h-5 mr-3" />
                      Continue with LinkedIn
                    </Button>
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      variant="outline"
                      // onClick={() => handleOAuthSignIn("github")}
                      // disabled={isLoading}
                      className="w-full h-12 text-base border-2 hover:border-slate-300 hover:bg-slate-50/50 transition-all duration-300"
                    >
                      <Github className="w-5 h-5 mr-3" />
                      Continue with GitHub
                    </Button>
                  </motion.div>
                </div>
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <Separator />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="bg-white px-4 text-slate-500">
                      Or continue with email
                    </span>
                  </div>
                </div>
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-slate-700">
                      Email Address
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-12 border-2 focus:border-indigo-400 transition-colors"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-slate-700">
                      Password
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder={
                        "Enter your password"
                      }
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-12 border-2 focus:border-indigo-400 transition-colors"
                      required
                    />
                  </div>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      type="submit"
                      className="w-full h-12 text-base bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 hover:from-indigo-600 hover:via-purple-600 hover:to-cyan-600 border-0 shadow-lg hover:shadow-xl transition-all duration-300"
                      // disabled={isLoading}
                    >
                      {/* {(isLoading) ? (
                        <div className="flex items-center">
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                          Processing...
                        </div>
                      ) : ( */}
                        <>
                          {"🚀 Sign In"}
                        </>
                        {/* )
                      } */}
                    </Button>
                  </motion.div>
                </form>
                <div className="text-center">
                  <Button
                    variant="link"
                    onClick={() => navigate("/signup")}
                    className="text-base text-slate-600 hover:text-indigo-600 transition-colors"
                  >
                    {"Don't have an account? Sign up →"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
