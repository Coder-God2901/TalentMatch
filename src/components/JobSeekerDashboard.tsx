import React, { useState, useEffect } from "react";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Progress } from "./ui/progress";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { motion } from "framer-motion";
import {
  Upload,
  Github,
  Linkedin,
  TrendingUp,
  Target,
  Briefcase,
  Bell,
  Settings,
  LogOut,
  Plus,
  Star,
  Clock,
  MapPin,
  DollarSign,
  Sparkles,
  CheckCircle,
  Award,
  Users,
  Eye,
  Heart,
  Flame,
  Trophy,
  MessageCircle,
  BarChart3,
} from "lucide-react";
import { useAuth } from "../lib/AuthContext";
import { supabase } from "../lib/supabaseClient";
import { useNavigate } from "react-router-dom";

// This component is now self-contained and fetches its own data.
export function JobSeekerDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // State to hold dynamic candidates (other job seekers) from Supabase
  const [candidates, setCandidates] = useState<any[]>([]);
  const [loadingCandidates, setLoadingCandidates] = useState(true);

  // State to hold jobs from Supabase
  const [jobs, setJobs] = useState<any[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(true);

  useEffect(() => {
    const fetchCandidates = async () => {
      setLoadingCandidates(true);
      const { data, error } = await supabase
        .from('candidates')
        .select('*');
      if (error) {
        console.error('Error fetching candidates:', error);
        setCandidates([]);
      } else {
        setCandidates(data || []);
      }
      setLoadingCandidates(false);
    };
    fetchCandidates();
  }, []);

  useEffect(() => {
    const fetchJobs = async () => {
      setLoadingJobs(true);
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .order('posted_at', { ascending: false });
      if (error) {
        console.error('Error fetching jobs:', error);
        setJobs([]);
      } else {
        setJobs(data || []);
      }
      setLoadingJobs(false);
    };
    fetchJobs();
  }, []);
        {/* Dynamic Candidates Section */}
        <div className="my-12">
          <h2 className="text-2xl font-bold text-slate-800 mb-4">Other Job Seekers</h2>
          {loadingCandidates ? (
            <div className="text-center text-slate-500 py-8">Loading candidates...</div>
          ) : candidates.length === 0 ? (
            <div className="text-center text-slate-500 py-8">No other job seekers found.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {candidates
                .filter((c) => c.id !== user?.id) // Don't show self
                .map((candidate: any) => (
                  <div key={candidate.id} className="bg-white/90 rounded-xl p-6 shadow border border-white/20 flex items-center space-x-4">
                    <div>
                      <div className="w-12 h-12 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center text-white text-xl font-bold">
                        {candidate.display_name ? candidate.display_name.split(' ').map((n: string) => n[0]).join('') : 'U'}
                      </div>
                    </div>
                    <div>
                      <div className="font-semibold text-lg text-slate-800">{candidate.display_name || 'Unnamed'}</div>
                      <div className="text-slate-500 text-sm">Job Seeker</div>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  // The rest of your component's state and logic remains the same
  const [animatedProgress, setAnimatedProgress] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [completedActions, setCompletedActions] = useState(new Set());
  const targetProgress = 72;

  useEffect(() => {
    const progressTimer = setInterval(() => {
      setAnimatedProgress((prev) => {
        if (prev < targetProgress) return Math.min(prev + 2, targetProgress);
        return prev;
      });
    }, 50);
    return () => clearInterval(progressTimer);
  }, [targetProgress]);

  const profileActions = [
    {
      id: "upload-resume",
      icon: Upload,
      title: "Upload Resume",
      description: "Let AI parse your resume",
      boost: "+20%",
      color: "from-blue-500 to-cyan-500",
      completed: completedActions.has("upload-resume"),
      reward: "🎯 +20 Match Score",
    },
    {
      id: "connect-linkedin",
      icon: Linkedin,
      title: "Connect LinkedIn",
      description: "Import your experience",
      boost: "+15%",
      color: "from-blue-600 to-indigo-600",
      completed: completedActions.has("connect-linkedin"),
      reward: "📈 +15 Profile Views",
    },
    {
      id: "connect-github",
      icon: Github,
      title: "Connect GitHub",
      description: "Showcase your projects",
      boost: "+25%",
      color: "from-gray-700 to-gray-900",
      completed: completedActions.has("connect-github"),
      reward: "🚀 +25 Developer Score",
    },
    {
      id: "skill-assessment",
      icon: Target,
      title: "Take Skill Assessment",
      description: "Validate your technical skills",
      boost: "+30%",
      color: "from-green-500 to-emerald-500",
      completed: completedActions.has("skill-assessment"),
      reward: "⭐ +30 Skill Points",
    },
  ];

  const handleActionComplete = (actionId: string) => {
    setCompletedActions((prev) => new Set(prev).add(actionId));
  };

  // Mock data for stats and insights can remain for now
  const stats = [
    {
      label: "Profile Views",
      value: "127",
      change: "+12%",
      icon: Eye,
      color: "from-blue-500 to-cyan-500",
    },
    {
      label: "Job Matches",
      value: "24",
      change: "+5",
      icon: Target,
      color: "from-purple-500 to-pink-500",
    },
    {
      label: "Applications",
      value: "8",
      change: "+3",
      icon: Briefcase,
      color: "from-emerald-500 to-teal-500",
    },
    {
      label: "Skill Score",
      value: "85",
      change: "+2",
      icon: Award,
      color: "from-orange-500 to-red-500",
    },
  ];
  const insights = [
    {
      type: "opportunity",
      icon: Flame,
      title: "Hot Opportunity!",
      message: "15 recruiters are looking for React developers in your area",
      color: "from-red-500 to-orange-500",
      action: "View Jobs",
    },
    {
      type: "skill",
      icon: TrendingUp,
      title: "Skill Trend",
      message: "Adding TypeScript could boost your matches by 35%",
      color: "from-purple-500 to-pink-500",
      action: "Learn More",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50 relative">
      {/* Confetti Animation */}
      <motion.div>
        {showConfetti && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 pointer-events-none z-50"
          >
            {[...Array(50)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full"
                initial={{
                  x: Math.random() * window.innerWidth,
                  y: -10,
                  rotate: 0,
                }}
                animate={{
                  y: window.innerHeight + 10,
                  rotate: 360,
                }}
                transition={{
                  duration: 3,
                  delay: Math.random() * 2,
                  repeat: Infinity,
                }}
              />
            ))}
          </motion.div>
        )}
      </motion.div>

      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-indigo-400/10 to-purple-400/10 rounded-full blur-3xl"
          animate={{
            x: [0, 100, 0],
            y: [0, -50, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      </div>

      {/* Header */}
      <header className="bg-white/90 backdrop-blur-sm border-b border-white/20 sticky top-0 z-40 shadow-sm">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center space-x-4"
            >
              <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  TalentAI
                </h1>
                <p className="text-xs text-slate-500">Job Seeker Portal</p>
              </div>
            </motion.div>
            <div className="flex items-center space-x-3">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button variant="ghost" size="sm" className="relative">
                  <Bell className="w-5 h-5" />
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full text-white text-xs flex items-center justify-center">
                    3
                  </span>
                </Button>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button variant="ghost" size="sm">
                  <Settings className="w-5 h-5" />
                </Button>
              </motion.div>
              <div className="flex items-center space-x-3 pl-3 border-l border-slate-200">
                <Avatar className="w-9 h-9 ring-2 ring-indigo-500/20">
                  <AvatarFallback className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white">
                    {user?.user_metadata?.full_name?.charAt(0)?.toUpperCase() ||
                      "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden sm:block">
                  <p className="text-sm font-medium text-slate-800">
                    {user?.user_metadata?.full_name}
                  </p>
                  <p className="text-xs text-slate-500">Job Seeker</p>
                </div>
              </div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSignOut}
                  className="text-slate-500 hover:text-red-500"
                >
                  <LogOut className="w-5 h-5" />
                </Button>
              </motion.div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {/* Stats Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
              className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg"
            >
              <div className="flex items-center justify-between mb-3">
                <div
                  className={`w-12 h-12 bg-gradient-to-r ${stat.color} rounded-xl flex items-center justify-center shadow-lg`}
                >
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <Badge className="bg-green-100 text-green-700 border-0">
                  {stat.change}
                </Badge>
              </div>
              <div className="text-2xl font-bold text-slate-800 mb-1">
                {stat.value}
              </div>
              <div className="text-sm text-slate-600">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Welcome Card */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <Card className="bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 text-white border-0 shadow-2xl relative overflow-hidden">
                <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
                <CardHeader className="relative z-10">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-3xl mb-2">
                        Welcome back,{" "}
                        {user?.user_metadata?.full_name?.split(" ")[0]}! 👋
                      </CardTitle>
                      <CardDescription className="text-white/90 text-lg">
                        You're {targetProgress}% ready to land your dream job.
                        Let's boost that to 100%! 🚀
                      </CardDescription>
                    </div>
                    <motion.div
                      animate={{ rotate: [0, 10, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="hidden sm:block"
                    >
                      <Trophy className="w-16 h-16 text-yellow-300" />
                    </motion.div>
                  </div>
                </CardHeader>
              </Card>
            </motion.div>

            {/* Profile Completeness */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center text-xl">
                        <motion.div
                          animate={{ rotate: [0, 360] }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "linear",
                          }}
                          className="mr-3"
                        >
                          <BarChart3 className="w-6 h-6 text-indigo-600" />
                        </motion.div>
                        Profile Power Score
                      </CardTitle>
                      <CardDescription className="text-base">
                        🎯 Complete your profile to get 5x more job matches
                      </CardDescription>
                    </div>
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.5, delay: 0.5 }}
                    >
                      <Badge className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white border-0 px-4 py-2 text-lg">
                        {animatedProgress}% Complete
                      </Badge>
                    </motion.div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="relative">
                    <Progress value={animatedProgress} className="h-4" />
                    <motion.div
                      className="absolute top-0 left-0 h-4 bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 rounded-full"
                      initial={{ width: "0%" }}
                      animate={{ width: `${animatedProgress}%` }}
                      transition={{ duration: 2, ease: "easeOut" }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">
                      Almost there! Just {100 - targetProgress}% to go
                    </span>
                    <span className="text-indigo-600 font-semibold">
                      Next reward at 80% 🎁
                    </span>
                  </div>

                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.8, delay: 1 }}
                    className="bg-gradient-to-r from-indigo-50 to-purple-50 p-4 rounded-xl border border-indigo-100"
                  >
                    <p className="text-sm text-indigo-800 font-medium mb-2">
                      💡 Pro Tip:
                    </p>
                    <p className="text-sm text-indigo-700">
                      Candidates with 90%+ complete profiles get 3x more
                      interview invitations!
                    </p>
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Tabs */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <Tabs defaultValue="matches" className="space-y-8">
                <TabsList className="grid w-full grid-cols-3 bg-white/90 backdrop-blur-sm border border-white/20 shadow-lg">
                  <TabsTrigger value="matches">🎯 Job Matches</TabsTrigger>
                  <TabsTrigger value="applications">
                    📋 Applications
                  </TabsTrigger>
                  <TabsTrigger value="assessments">🏆 Assessments</TabsTrigger>
                </TabsList>

                <TabsContent value="matches" className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-2xl font-bold text-slate-800">
                        🔥 Hot Matches for You
                      </h3>
                      <p className="text-slate-600">
                        AI-curated opportunities based on your profile
                      </p>
                    </div>
                    <motion.div
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0 px-4 py-2">
                        {loadingJobs ? 'Loading...' : `${jobs.length} fresh matches`}
                      </Badge>
                    </motion.div>
                  </div>

                  <div className="space-y-4">
                    {loadingJobs ? (
                      <div className="text-center text-slate-500 py-8">Loading jobs...</div>
                    ) : jobs.length === 0 ? (
                      <div className="text-center text-slate-500 py-8">No jobs found.</div>
                    ) : (
                      jobs.map((job: any, index: number) => (
                        <motion.div
                          key={job.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.5, delay: index * 0.1 }}
                          whileHover={{ scale: 1.02 }}
                        >
                          <Card className="hover:shadow-2xl transition-all duration-300 bg-white/90 backdrop-blur-sm border-0 shadow-lg relative overflow-hidden group">
                            {job.is_hot && (
                              <div className="absolute top-0 right-0 bg-gradient-to-r from-red-500 to-orange-500 text-white px-3 py-1 text-xs font-medium">
                                🔥 HOT
                              </div>
                            )}
                            <CardContent className="p-6">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center space-x-4 mb-3">
                                    <div className="text-3xl">
                                      {job.company_logo || '🏢'}
                                    </div>
                                    <div>
                                      <div className="flex items-center space-x-3 mb-1">
                                        <h4 className="text-xl font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">
                                          {job.title}
                                        </h4>
                                        {typeof job.match_score === 'number' && (
                                          <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            transition={{
                                              duration: 0.5,
                                              delay: 0.3 + index * 0.1,
                                            }}
                                          >
                                            <Badge
                                              className={`$${
                                                job.match_score >= 90
                                                  ? "bg-gradient-to-r from-green-500 to-emerald-500"
                                                  : job.match_score >= 85
                                                  ? "bg-gradient-to-r from-blue-500 to-cyan-500"
                                                  : "bg-gradient-to-r from-purple-500 to-pink-500"
                                              } text-white border-0`}
                                            >
                                              {job.match_score}% match
                                            </Badge>
                                          </motion.div>
                                        )}
                                      </div>
                                      <p className="text-lg text-slate-600 font-medium">
                                        {job.company}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="flex items-center space-x-6 mb-4 text-sm text-slate-600">
                                    <div className="flex items-center">
                                      <MapPin className="w-4 h-4 mr-2 text-indigo-500" />
                                      {job.location}
                                    </div>
                                    <div className="flex items-center">
                                      <DollarSign className="w-4 h-4 mr-2 text-green-500" />
                                      {job.salary}
                                    </div>
                                    <div className="flex items-center">
                                      <Clock className="w-4 h-4 mr-2 text-orange-500" />
                                      {job.posted_at ? new Date(job.posted_at).toLocaleDateString() : ''}
                                    </div>
                                    <div className="flex items-center">
                                      <Users className="w-4 h-4 mr-2 text-purple-500" />
                                      {job.applicants || 0} applicants
                                    </div>
                                  </div>
                                  <div className="flex flex-wrap gap-2 mb-4">
                                    {Array.isArray(job.skills) && job.skills.map((skill: string) => (
                                      <Badge
                                        key={skill}
                                        variant="outline"
                                        className="hover:bg-indigo-50 transition-colors"
                                      >
                                        {skill}
                                      </Badge>
                                    ))}
                                  </div>
                                  <div className="flex flex-wrap gap-2">
                                    {Array.isArray(job.benefits) && job.benefits.map((benefit: string) => (
                                      <span
                                        key={benefit}
                                        className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-full"
                                      >
                                        {benefit}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                                <div className="flex flex-col space-y-3 ml-6">
                                  <motion.div
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                  >
                                    <Button
                                      size="lg"
                                      className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 border-0 shadow-lg"
                                    >
                                      🚀 Apply Now
                                    </Button>
                                  </motion.div>
                                  <div className="flex space-x-2">
                                    <motion.div
                                      whileHover={{ scale: 1.05 }}
                                      whileTap={{ scale: 0.95 }}
                                    >
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        className="hover:bg-red-50 hover:border-red-200"
                                      >
                                        <Heart className="w-4 h-4" />
                                      </Button>
                                    </motion.div>
                                    <motion.div
                                      whileHover={{ scale: 1.05 }}
                                      whileTap={{ scale: 0.95 }}
                                    >
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        className="hover:bg-blue-50 hover:border-blue-200"
                                      >
                                        <MessageCircle className="w-4 h-4" />
                                      </Button>
                                    </motion.div>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="applications">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl">
                      <CardContent className="p-16 text-center">
                        <motion.div
                          animate={{ y: [0, -10, 0] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          <Briefcase className="w-20 h-20 text-indigo-400 mx-auto mb-6" />
                        </motion.div>
                        <h3 className="text-2xl font-bold text-slate-800 mb-4">
                          Ready to Start Applying? 🚀
                        </h3>
                        <p className="text-lg text-slate-600 mb-8 max-w-md mx-auto">
                          You have amazing matches waiting! Start applying to
                          jobs that align perfectly with your skills and
                          aspirations.
                        </p>
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Button
                            size="lg"
                            className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 border-0 shadow-lg text-lg px-8 py-4"
                          >
                            🎯 Browse Job Matches
                          </Button>
                        </motion.div>
                      </CardContent>
                    </Card>
                  </motion.div>
                </TabsContent>

                <TabsContent value="assessments">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl">
                      <CardContent className="p-16 text-center">
                        <motion.div
                          animate={{ rotate: [0, 5, 0, -5, 0] }}
                          transition={{ duration: 3, repeat: Infinity }}
                        >
                          <Target className="w-20 h-20 text-purple-400 mx-auto mb-6" />
                        </motion.div>
                        <h3 className="text-2xl font-bold text-slate-800 mb-4">
                          Showcase Your Skills! ⭐
                        </h3>
                        <p className="text-lg text-slate-600 mb-8 max-w-md mx-auto">
                          Take our AI-powered skill assessments to validate your
                          expertise and unlock premium job opportunities.
                        </p>
                        <div className="space-y-4">
                          <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <Button
                              size="lg"
                              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 border-0 shadow-lg text-lg px-8 py-4"
                            >
                              🚀 Start Assessment
                            </Button>
                          </motion.div>
                          <p className="text-sm text-slate-500">
                            ⏱️ Takes only 15 minutes • 🏆 Boost your match score
                            by 30%
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                </TabsContent>
              </Tabs>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-xl flex items-center">
                    <Sparkles className="w-5 h-5 mr-2 text-yellow-500" />
                    Power Up Your Profile
                  </CardTitle>
                  <CardDescription className="text-base">
                    🎯 Each action boosts your match potential
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {profileActions.map((action, index) => (
                    <motion.div
                      key={action.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      whileHover={{ scale: 1.02, x: 5 }}
                      onClick={() => handleActionComplete(action.id)}
                      className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 ${
                        action.completed
                          ? "bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 shadow-lg"
                          : "bg-gradient-to-r from-white to-slate-50 border-slate-200 hover:border-indigo-300 hover:shadow-lg"
                      }`}
                    >
                      {action.completed && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute top-2 right-2"
                        >
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        </motion.div>
                      )}

                      <div className="flex items-start space-x-4">
                        <motion.div
                          className={`w-12 h-12 bg-gradient-to-br ${action.color} rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg`}
                          whileHover={{ rotate: 5 }}
                        >
                          <action.icon className="w-6 h-6 text-white" />
                        </motion.div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <p className="font-semibold text-slate-800">
                              {action.title}
                            </p>
                            {!action.completed && (
                              <Badge className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white border-0 text-xs">
                                {action.boost}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-slate-600 mb-2">
                            {action.description}
                          </p>

                          {action.completed ? (
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="text-xs text-green-600 font-medium"
                            >
                              ✅ {action.reward}
                            </motion.div>
                          ) : (
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-indigo-600 font-medium">
                                Click to complete
                              </span>
                              <Plus className="w-4 h-4 text-indigo-400" />
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>

            {/* AI Insights */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-xl flex items-center">
                    <Sparkles className="w-5 h-5 mr-2 text-purple-500" />
                    AI Career Insights
                  </CardTitle>
                  <CardDescription>
                    🤖 Personalized recommendations just for you
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {insights.map((insight, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      whileHover={{ scale: 1.02 }}
                      className={`p-4 bg-gradient-to-r ${insight.color
                        .replace("from-", "from-")
                        .replace("to-", "to-")
                        .replace(
                          "500",
                          "50"
                        )} rounded-xl border-2 border-opacity-20 cursor-pointer transition-all duration-300 hover:shadow-lg relative overflow-hidden`}
                    >
                      <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-10 translate-x-10"></div>

                      <div className="relative">
                        <div className="flex items-start space-x-3">
                          <motion.div
                            animate={{ scale: [1, 1.1, 1] }}
                            transition={{
                              duration: 2,
                              repeat: Infinity,
                              delay: index * 0.5,
                            }}
                            className={`w-10 h-10 bg-gradient-to-r ${insight.color} rounded-xl flex items-center justify-center shadow-lg`}
                          >
                            <insight.icon className="w-5 h-5 text-white" />
                          </motion.div>

                          <div className="flex-1">
                            <p className="font-semibold text-slate-800 mb-1">
                              {insight.title}
                            </p>
                            <p className="text-sm text-slate-700 mb-3">
                              {insight.message}
                            </p>
                            <Button
                              size="sm"
                              variant="outline"
                              className="hover:bg-white/50 transition-colors"
                            >
                              {insight.action} →
                            </Button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>

            {/* Achievement Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <Card className="bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 text-white border-0 shadow-xl">
                <CardContent className="p-6 text-center">
                  <motion.div
                    animate={{ rotate: [0, 10, 0, -10, 0] }}
                    transition={{ duration: 4, repeat: Infinity }}
                  >
                    <Trophy className="w-12 h-12 mx-auto mb-3" />
                  </motion.div>
                  <h3 className="text-lg font-bold mb-2">
                    🎉 Achievement Unlocked!
                  </h3>
                  <p className="text-sm opacity-90 mb-3">
                    Profile Superstar - You're in the top 15% of candidates!
                  </p>
                  <Badge className="bg-white/20 text-white border-0">
                    Reward: Premium Badge 🌟
                  </Badge>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
