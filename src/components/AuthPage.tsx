import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Separator } from './ui/separator';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { motion } from 'framer-motion';
import { ArrowLeft, Github, Mail, Sparkles, Linkedin, CheckCircle, Zap, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

interface AuthPageProps {
  mode: 'signin' | 'signup';
}

export function AuthPage({ mode: initialMode }: AuthPageProps) {
  const navigate = useNavigate();
  // We use a local state for mode to allow the toggle button to work
  const [mode, setMode] = useState(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const benefits = [
    { icon: Zap, text: 'AI-powered matching in seconds' },
    { icon: CheckCircle, text: 'Get matched with top opportunities' },
    { icon: Shield, text: '100% secure and private' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    if (mode === 'signup') {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            // This passes the full name to the trigger in your database
            full_name: name,
          },
        },
      });

      if (error) {
        alert(error.message);
      } else if (data.user) {
        // This is the key change!
        // On successful signup, we show a confirmation alert...
        alert('Signup successful! Please check your email for a verification link.');
        // ...and then navigate the user to the login page.
        navigate('/login');
      }
    } else {
      // Sign-in logic remains the same.
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        alert(error.message);
      }
      // On successful login, the AuthRedirector in App.tsx will handle navigation.
    }
    
    setIsLoading(false);
  };

  const handleOAuthSignIn = async (provider: 'google' | 'github' | 'linkedin') => {
    setIsLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({ provider });
    if (error) {
      alert(error.message);
      setIsLoading(false);
    }
    // Supabase handles the redirect to the OAuth provider
  };

  const onModeToggle = () => {
    const newMode = mode === 'signin' ? 'signup' : 'signin';
    setMode(newMode);
    // Update the URL when toggling, without a full page reload
    navigate(newMode === 'signin' ? '/login' : '/signup', { replace: true });
  }

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
              onClick={() => navigate('/')}
              className="mb-8 -ml-2 hover:bg-white/50"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
            <div className="space-y-8">
              <div>
                <h1 className="text-4xl lg:text-5xl mb-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent leading-tight">
                  {mode === 'signin' ? 'Welcome Back! 👋' : 'Join TalentMatch Today! 🚀'}
                </h1>
                <p className="text-xl text-slate-600 leading-relaxed">
                  {mode === 'signin' 
                    ? 'Ready to discover your next amazing opportunity? Sign in to continue your journey.' 
                    : 'Start your journey to finding the perfect job or ideal candidate with AI-powered matching.'
                  }
                </p>
              </div>
              {mode === 'signup' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className="space-y-6"
                >
                  <div>
                    <h3 className="text-xl font-semibold text-slate-800 mb-4">Why professionals choose TalentAI:</h3>
                    <div className="space-y-4">
                      {benefits.map((benefit, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
                          className="flex items-center space-x-3"
                        >
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
                      <span className="text-sm font-semibold text-indigo-600">Step 1 of 3</span>
                    </div>
                    <Progress value={33} className="h-2 mb-2" />
                    <p className="text-sm text-slate-600">Complete your profile to unlock better matches! 🎯</p>
                  </div>
                </motion.div>
              )}
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
                {mode === 'signup' && (
                  <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0 px-4 py-1">
                    ✨ Free Account • No Credit Card Required
                  </Badge>
                )}
                <div>
                  <CardTitle className="text-3xl bg-gradient-to-r from-slate-800 to-indigo-800 bg-clip-text text-transparent">
                    {mode === 'signin' ? 'Sign In' : 'Get Started'}
                  </CardTitle>
                  <CardDescription className="text-base text-slate-600 mt-2">
                    {mode === 'signin' 
                      ? 'Access your personalized dashboard' 
                      : 'Create your account in 30 seconds'
                    }
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button 
                      variant="outline" 
                      onClick={() => handleOAuthSignIn('google')}
                      disabled={isLoading}
                      className="w-full h-12 text-base border-2 hover:border-indigo-300 hover:bg-indigo-50/50 transition-all duration-300"
                    >
                      <Mail className="w-5 h-5 mr-3" />
                      Continue with Google
                    </Button>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button 
                      variant="outline" 
                      onClick={() => handleOAuthSignIn('linkedin')}
                      disabled={isLoading}
                      className="w-full h-12 text-base border-2 hover:border-blue-300 hover:bg-blue-50/50 transition-all duration-300"
                    >
                      <Linkedin className="w-5 h-5 mr-3" />
                      Continue with LinkedIn
                    </Button>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button 
                      variant="outline" 
                      onClick={() => handleOAuthSignIn('github')}
                      disabled={isLoading}
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
                  {mode === 'signup' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="space-y-2"
                    >
                      <Label htmlFor="name" className="text-slate-700">Full Name</Label>
                      <Input
                        id="name"
                        type="text"
                        placeholder="Enter your full name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="h-12 border-2 focus:border-indigo-400 transition-colors"
                        required
                      />
                    </motion.div>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-slate-700">Email Address</Label>
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
                    <Label htmlFor="password" className="text-slate-700">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder={mode === 'signup' ? 'Create a strong password' : 'Enter your password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-12 border-2 focus:border-indigo-400 transition-colors"
                      required
                    />
                    {mode === 'signup' && (
                      <p className="text-sm text-slate-500">Must be at least 8 characters long</p>
                    )}
                  </div>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button 
                      type="submit" 
                      className="w-full h-12 text-base bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 hover:from-indigo-600 hover:via-purple-600 hover:to-cyan-600 border-0 shadow-lg hover:shadow-xl transition-all duration-300" 
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <div className="flex items-center">
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                          Processing...
                        </div>
                      ) : (
                        <>
                          {mode === 'signin' ? '🚀 Sign In' : '✨ Create Account'}
                        </>
                      )}
                    </Button>
                  </motion.div>
                </form>
                <div className="text-center">
                  <Button 
                    variant="link" 
                    onClick={onModeToggle}
                    className="text-base text-slate-600 hover:text-indigo-600 transition-colors"
                  >
                    {mode === 'signin' 
                      ? "Don't have an account? Sign up →" 
                      : "Already have an account? Sign in →"
                    }
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

