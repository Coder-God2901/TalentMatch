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
import { ThemeToggle } from "./ThemeToggle";

export function SignIn1() {
  const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
  
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

  return (
    <div className="min-h-screen bg-background">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-5xl flex flex-col lg:flex-row gap-12 items-center">
          
          {/* Left Side - Benefits & Progress */}
          <div className="flex-1 max-w-lg">
            <Button 
              variant="ghost" 
              onClick={() => navigate("/")}
              className="mb-8 -ml-2"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>

            <div className="space-y-8">
              <div>
                <h1 className="text-4xl lg:text-5xl mb-4 text-foreground leading-tight">
                  {'Welcome Back'}
                </h1>
                <p className="text-xl text-muted-foreground leading-relaxed">
                  {'Ready to discover your next amazing opportunity? Sign in to continue your journey.'}
                </p>
              </div>
            </div>
          </div>

          {/* Right Side - Auth Form */}
          <div className="flex-1 max-w-md w-full">
            <Card className="shadow-lg border">
              <CardHeader className="text-center space-y-4">
                <div className="flex justify-center">
                  <div className="w-16 h-16 bg-primary rounded-xl flex items-center justify-center">
                    <Sparkles className="w-8 h-8 text-primary-foreground" />
                  </div>
                </div>
                
                <div>
                  <CardTitle className="text-3xl text-foreground">
                    {'Sign In'}
                  </CardTitle>
                  <CardDescription className="text-base text-muted-foreground mt-2">
                    {'Access your personalized dashboard'}
                  </CardDescription>
                </div>
              </CardHeader>
          
              <CardContent className="space-y-6">
                {/* OAuth Buttons */}
                <div className="space-y-4">
                  <Button 
                    variant="outline" 
                    // onClick={() => handleOAuthSignIn('google')}
                    disabled={isLoading}
                    className="w-full h-12 text-base"
                  >
                    <Mail className="w-5 h-5 mr-3" />
                    Continue with Google
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    // onClick={() => handleOAuthSignIn('linkedin')}
                    disabled={isLoading}
                    className="w-full h-12 text-base"
                  >
                    <Linkedin className="w-5 h-5 mr-3" />
                    Continue with LinkedIn
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    // onClick={() => handleOAuthSignIn('github')}
                    disabled={isLoading}
                    className="w-full h-12 text-base"
                  >
                    <Github className="w-5 h-5 mr-3" />
                    Continue with GitHub
                  </Button>
                </div>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <Separator />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="bg-background px-4 text-muted-foreground">
                      Or continue with email
                    </span>
                  </div>
                </div>

                {/* Email/Password Form */}
                <form onSubmit={handleSubmit} className="space-y-5">
                  
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-foreground">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-12"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-foreground">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder={'Enter your password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-12"
                      required
                    />
                  </div>

                  <Button 
                    type="submit" 
                    variant= "outline"
                    className="w-full h-12 text-base" 
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="flex items-center">
                        <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin mr-2"></div>
                        Processing...
                      </div>
                    ) : (
                      <>
                        {'Sign In'}
                      </>
                    )}
                  </Button>
                </form>

                {/* Toggle Mode */}
                <div className="text-center">
                  <Button 
                    variant="link" 
                    onClick={() => navigate("/signup")}
                    className="text-base text-muted-foreground hover:text-primary"
                  >
                    {"Don't have an account? Sign up"}
                  </Button>
                </div>

                {/* Trust Indicators */}
                <div className="pt-4 border-t">
                  <div className="flex items-center justify-center space-x-6 text-sm text-muted-foreground">
                    <div className="flex items-center">
                      <Shield className="w-4 h-4 mr-1" />
                      <span>Secure</span>
                    </div>
                    <div className="flex items-center">
                      <CheckCircle className="w-4 h-4 mr-1" />
                      <span>Trusted</span>
                    </div>
                    <div className="flex items-center">
                      <Zap className="w-4 h-4 mr-1" />
                      <span>Fast Setup</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}