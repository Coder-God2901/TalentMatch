import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Progress } from './ui/progress';
import { motion } from 'framer-motion';
import { 
  Plus, 
  Users, 
  Eye, 
  Star,
  MapPin,
  DollarSign,
  Clock,
  Briefcase,
  TrendingUp,
  Search,
  Filter,
  Bell,
  Settings,
  LogOut,
  Sparkles,
  Target,
  Flame,
  Trophy,
  Crown,
  MessageCircle,
  Calendar,
  CheckCircle,
  AlertCircle,
  Rocket,
  Gift,
  Compass,
  Activity
} from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import { supabase } from '../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';

export function RecruiterDashboard() {
  const { user } = useAuth(); // Get user from our central AuthContext
  const navigate = useNavigate(); // Get navigate function for redirects

  // This function now handles signing out internally
  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error signing out:', error);
    } else {
      navigate('/'); // Redirect to landing page after sign out
    }
  };
  
  const [isPostingJob, setIsPostingJob] = useState(false);
  const [hiringGoalProgress, setHiringGoalProgress] = useState(0);
  const [animatedProgress, setAnimatedProgress] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [completedMilestones, setCompletedMilestones] = useState(new Set());
  const [activeStreak, setActiveStreak] = useState(7);
  const [jobForm, setJobForm] = useState({
    title: '',
    description: '',
    location: '',
    salary: '',
    experience: '',
    skills: '',
    type: ''
  });

  const targetProgress = 65;
  const hiringGoal = 12;
  const currentHires = 8;

  useEffect(() => {
    const timer = setTimeout(() => {
      setHiringGoalProgress(targetProgress);
    }, 500);

    const progressTimer = setInterval(() => {
      setAnimatedProgress(prev => {
        if (prev < targetProgress) {
          return Math.min(prev + 2, targetProgress);
        }
        return prev;
      });
    }, 50);

    return () => {
      clearTimeout(timer);
      clearInterval(progressTimer);
    };
  }, [targetProgress]);

  // Enhanced mock data...
  // Fetch jobs dynamically from Supabase
  const [postedJobs, setPostedJobs] = useState<any[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(true);

  useEffect(() => {
    const fetchJobs = async () => {
      setLoadingJobs(true);
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .order('posted_at', { ascending: false });
      if (error) {
        console.error('Error fetching jobs:', error);
        setPostedJobs([]);
      } else {
        setPostedJobs(data || []);
      }
      setLoadingJobs(false);
    };
    fetchJobs();
  }, []);
  // Dynamic candidates from Supabase
  const [topCandidates, setTopCandidates] = useState<any[]>([]);
  const [loadingCandidates, setLoadingCandidates] = useState(true);

  useEffect(() => {
    const fetchCandidates = async () => {
      setLoadingCandidates(true);
      const { data, error } = await supabase
        .from('candidates')
        .select('*');
      if (error) {
        console.error('Error fetching candidates:', error);
        setTopCandidates([]);
      } else {
        setTopCandidates(data || []);
      }
      setLoadingCandidates(false);
    };
    fetchCandidates();
  }, []);
  const weeklyMilestones = [
    { id: 'post-job', icon: Plus, title: 'Post 3 New Jobs', description: 'Expand your talent pipeline', progress: 2, target: 3, boost: '+15% reach', color: 'from-blue-500 to-cyan-500', completed: completedMilestones.has('post-job'), reward: '🎯 +15% Job Visibility' },
    { id: 'review-candidates', icon: Eye, title: 'Review 20 Candidates', description: 'Keep your pipeline moving', progress: 14, target: 20, boost: '+10% match accuracy', color: 'from-purple-500 to-pink-500', completed: completedMilestones.has('review-candidates'), reward: '📊 Enhanced Analytics' }
  ];
  const achievementBadges = [
    { name: 'Speed Recruiter', icon: Rocket, earned: true, description: 'Filled 3 positions in under 10 days' },
    { name: 'Top Matcher', icon: Target, earned: true, description: '90%+ match accuracy for 5 consecutive hires' },
    { name: 'Talent Magnet', icon: Star, earned: false, description: 'Attract 100+ quality candidates in a month' },
    { name: 'Interview Master', icon: Crown, earned: true, description: '95%+ interview-to-offer conversion rate' }
  ];

  // State for posting job
  const [postingJob, setPostingJob] = useState(false);
  const [postJobError, setPostJobError] = useState<string | null>(null);

  const handleJobSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPostingJob(true);
    setPostJobError(null);
    // Prepare job data
    const jobData = {
      title: jobForm.title,
      company: user?.user_metadata?.company || 'Unknown Company',
      location: jobForm.location,
      salary: jobForm.salary,
      skills: jobForm.skills.split(',').map((s) => s.trim()).filter(Boolean),
      benefits: [], // You can add a field for benefits in the form if needed
      description: jobForm.description,
      is_hot: false,
      match_score: Math.floor(Math.random() * 16) + 85, // random 85-100 for demo
      applicants: 0,
      company_logo: '🏢',
    };
    const { error } = await supabase.from('jobs').insert([jobData]);
    if (error) {
      setPostJobError(error.message);
    } else {
      setIsPostingJob(false);
      setJobForm({ title: '', description: '', location: '', salary: '', experience: '', skills: '', type: '' });
      // Refresh jobs list
      const { data, error: fetchError } = await supabase
        .from('jobs')
        .select('*')
        .order('posted_at', { ascending: false });
      if (!fetchError) setPostedJobs(data || []);
    }
    setPostingJob(false);
  };

  const handleMilestoneComplete = (milestoneId: string) => {
    setCompletedMilestones(prev => new Set([...prev, milestoneId]));
    if (completedMilestones.size + 1 === weeklyMilestones.length) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
    }
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -top-40 -left-40 w-80 h-80 bg-gradient-to-br from-purple-200 to-pink-200 rounded-full opacity-20"
          animate={{ rotate: 360, scale: [1, 1.1, 1] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute -bottom-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-200 to-cyan-200 rounded-full opacity-20"
          animate={{ rotate: -360, scale: [1, 1.2, 1] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        />
      </div>

      {/* Header */}
      <motion.header 
        className="bg-white/80 backdrop-blur-xl border-b border-white/20 sticky top-0 z-50 shadow-lg"
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center space-x-4">
              <motion.div 
                className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg"
                whileHover={{ scale: 1.1, rotate: 5 }}
                whileTap={{ scale: 0.95 }}
              >
                <Sparkles className="w-6 h-6 text-white" />
              </motion.div>
              <div>
                <h1 className="text-xl">TalentAI</h1>
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary" className="bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700">
                    <Crown className="w-3 h-3 mr-1" />
                    Recruiter Pro
                  </Badge>
                  <Badge variant="secondary" className="bg-gradient-to-r from-orange-100 to-red-100 text-orange-700">
                    <Flame className="w-3 h-3 mr-1" />
                    {activeStreak} day streak
                  </Badge>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button variant="ghost" size="sm" className="relative">
                  <Bell className="w-5 h-5" />
                  <motion.div
                    className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button variant="ghost" size="sm">
                  <Settings className="w-5 h-5" />
                </Button>
              </motion.div>
              <div className="flex items-center space-x-3">
                <button onClick={() => navigate('/recruiter-profile')} className="rounded-full focus:outline-none">
                  <Avatar className="w-9 h-9 ring-2 ring-purple-200">
                    <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                      {user?.user_metadata?.full_name?.charAt(0)?.toUpperCase() || 'R'}
                    </AvatarFallback>
                  </Avatar>
                </button>
                <div className="hidden sm:block">
                  <p className="text-sm">{user?.user_metadata?.full_name}</p>
                  <p className="text-xs text-muted-foreground">Elite Recruiter</p>
                </div>
              </div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button variant="ghost" size="sm" onClick={handleSignOut}>
                  <LogOut className="w-5 h-5" />
                </Button>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {/* Confetti Effect */}
        <motion.div>
          {showConfetti && (
            <motion.div
              className="fixed inset-0 pointer-events-none z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {[...Array(50)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full"
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
                    duration: Math.random() * 2 + 2,
                    ease: "easeOut",
                  }}
                />
              ))}
            </motion.div>
          )}
        </motion.div>

        {/* Welcome Section */}
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div className="space-y-2">
              <div className="flex items-center space-x-3">
                <h2 className="text-3xl bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Welcome back, {user?.user_metadata?.full_name?.split(' ')[0] || 'Recruiter'}!
                </h2>
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                >
                  👋
                </motion.div>
              </div>
              <p className="text-muted-foreground">You're on track to exceed your hiring goals this month!</p>
              
              {/* Hiring Goal Progress */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-white/20 shadow-lg max-w-md">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm">Monthly Hiring Goal</span>
                  <span className="text-sm text-purple-600">{currentHires}/{hiringGoal} hires</span>
                </div>
                <div className="relative">
                  <Progress 
                    value={animatedProgress} 
                    className="h-3 bg-purple-100"
                  />
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${animatedProgress}%` }}
                    transition={{ duration: 2, ease: "easeOut" }}
                    style={{ height: '12px' }}
                  />
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-muted-foreground">
                    {hiringGoal - currentHires} more to reach goal
                  </span>
                  <Badge variant="secondary" className="bg-green-100 text-green-700">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    On track
                  </Badge>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <Dialog open={isPostingJob} onOpenChange={setIsPostingJob}>
                <DialogTrigger asChild>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg">
                      <Plus className="w-4 h-4 mr-2" />
                      Post New Job
                      <Sparkles className="w-4 h-4 ml-2" />
                    </Button>
                  </motion.div>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Post a New Job</DialogTitle>
                    <DialogDescription>
                      Create a job posting to find the perfect candidates with AI-powered matching
                    </DialogDescription>
                  </DialogHeader>
                  
                  <form onSubmit={handleJobSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="title">Job Title</Label>
                        <Input
                          id="title"
                          placeholder="e.g. Senior React Developer"
                          value={jobForm.title}
                          onChange={(e) => setJobForm({...jobForm, title: e.target.value})}
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="location">Location</Label>
                        <Input
                          id="location"
                          placeholder="e.g. San Francisco, CA or Remote"
                          value={jobForm.location}
                          onChange={(e) => setJobForm({...jobForm, location: e.target.value})}
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="salary">Salary Range</Label>
                        <Input
                          id="salary"
                          placeholder="e.g. $120k - $150k"
                          value={jobForm.salary}
                          onChange={(e) => setJobForm({...jobForm, salary: e.target.value})}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="experience">Experience Level</Label>
                        <Select value={jobForm.experience} onValueChange={(value: string) => setJobForm({...jobForm, experience: value})}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select experience level" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="entry">Entry Level (0-2 years)</SelectItem>
                            <SelectItem value="mid">Mid Level (3-5 years)</SelectItem>
                            <SelectItem value="senior">Senior Level (6+ years)</SelectItem>
                            <SelectItem value="lead">Lead/Principal (8+ years)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="skills">Required Skills</Label>
                      <Input
                        id="skills"
                        placeholder="e.g. React, TypeScript, Node.js (comma-separated)"
                        value={jobForm.skills}
                        onChange={(e) => setJobForm({...jobForm, skills: e.target.value})}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Job Description</Label>
                      <Textarea
                        id="description"
                        placeholder="Describe the role, responsibilities, and requirements..."
                        rows={6}
                        value={jobForm.description}
                        onChange={(e) => setJobForm({...jobForm, description: e.target.value})}
                        required
                      />
                    </div>

                    <div className="flex justify-end space-x-3">
                      <Button type="button" variant="outline" onClick={() => setIsPostingJob(false)} disabled={postingJob}>
                        Cancel
                      </Button>
                      <Button type="submit" disabled={postingJob}>
                        {postingJob ? 'Posting...' : 'Post Job'}
                      </Button>
                    </div>
                    {postJobError && (
                      <div className="text-red-500 text-sm mt-2">{postJobError}</div>
                    )}
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {[
            { 
              title: 'Active Jobs', 
              value: '12', 
              change: '+3', 
              icon: Briefcase, 
              gradient: 'from-blue-500 to-cyan-500',
              description: 'Currently hiring'
            },
            { 
              title: 'Quality Matches', 
              value: '84', 
              change: '+12%', 
              icon: Target, 
              gradient: 'from-emerald-500 to-teal-500',
              description: '90%+ match score'
            },
            { 
              title: 'Response Rate', 
              value: '87%', 
              change: '+5%', 
              icon: MessageCircle, 
              gradient: 'from-purple-500 to-pink-500',
              description: 'Candidate engagement'
            },
            { 
              title: 'Time to Hire', 
              value: '8.2d', 
              change: '-2.1d', 
              icon: Clock, 
              gradient: 'from-orange-500 to-red-500',
              description: 'Average fill time'
            }
          ].map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
              whileHover={{ y: -5, scale: 1.02 }}
            >
              <Card className="border-0 shadow-lg hover:shadow-2xl transition-all duration-300 bg-white/90 backdrop-blur-sm overflow-hidden group">
                <CardContent className="p-6 relative">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm text-slate-600">{stat.title}</p>
                      <div className="flex items-center space-x-2">
                        <p className="text-2xl text-slate-800">{stat.value}</p>
                        <Badge variant="secondary" className="bg-green-100 text-green-700 text-xs">
                          <TrendingUp className="w-3 h-3 mr-1" />
                          {stat.change}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{stat.description}</p>
                    </div>
                    <motion.div 
                      className={`w-12 h-12 bg-gradient-to-br ${stat.gradient} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.5 }}
                    >
                      <stat.icon className="w-6 h-6 text-white" />
                    </motion.div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Achievement Badges */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg text-slate-800">Your Achievements</h3>
            <Badge variant="secondary" className="bg-yellow-100 text-yellow-700">
              <Trophy className="w-3 h-3 mr-1" />
              3/4 unlocked
            </Badge>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-2">
            {achievementBadges.map((badge, index) => (
              <motion.div
                key={badge.name}
                className={`flex-shrink-0 p-4 rounded-2xl border-2 ${
                  badge.earned 
                    ? 'bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200' 
                    : 'bg-gray-50 border-gray-200'
                } min-w-[180px]`}
                whileHover={{ scale: 1.05 }}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="flex items-center space-x-3">
                  <motion.div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      badge.earned 
                        ? 'bg-gradient-to-br from-yellow-400 to-orange-400 text-white' 
                        : 'bg-gray-300 text-gray-500'
                    }`}
                    animate={badge.earned ? { rotate: [0, 10, -10, 0] } : {}}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                  >
                    <badge.icon className="w-5 h-5" />
                  </motion.div>
                  <div>
                    <p className={`text-sm ${badge.earned ? 'text-yellow-800' : 'text-gray-500'}`}>
                      {badge.name}
                    </p>
                    <p className="text-xs text-muted-foreground">{badge.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Weekly Milestones */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg text-slate-800">Weekly Milestones</h3>
            <Badge variant="secondary" className="bg-purple-100 text-purple-700">
              <Calendar className="w-3 h-3 mr-1" />
              3 days left
            </Badge>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {weeklyMilestones.map((milestone, index) => (
              <motion.div
                key={milestone.id}
                className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300"
                whileHover={{ y: -5 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="flex items-start justify-between mb-3">
                  <motion.div
                    className={`w-10 h-10 bg-gradient-to-br ${milestone.color} rounded-xl flex items-center justify-center shadow-md`}
                    whileHover={{ scale: 1.1, rotate: 5 }}
                  >
                    <milestone.icon className="w-5 h-5 text-white" />
                  </motion.div>
                  {milestone.completed && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center"
                    >
                      <CheckCircle className="w-4 h-4 text-white" />
                    </motion.div>
                  )}
                </div>
                <h4 className="text-sm text-slate-800 mb-1">{milestone.title}</h4>
                <p className="text-xs text-muted-foreground mb-3">{milestone.description}</p>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span>{milestone.progress}/{milestone.target}</span>
                    <span className="text-purple-600">{milestone.boost}</span>
                  </div>
                  <div className="relative">
                    <Progress 
                      value={(milestone.progress / milestone.target) * 100} 
                      className="h-2 bg-gray-100"
                    />
                    <motion.div
                      className={`absolute inset-0 bg-gradient-to-r ${milestone.color} rounded-full`}
                      initial={{ width: 0 }}
                      animate={{ width: `${(milestone.progress / milestone.target) * 100}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      style={{ height: '8px' }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">{milestone.reward}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Main Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <Tabs defaultValue="jobs" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 bg-white/80 backdrop-blur-sm">
              <TabsTrigger value="jobs" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white">
                My Jobs
              </TabsTrigger>
              <TabsTrigger value="candidates" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white">
                Top Candidates
              </TabsTrigger>
              <TabsTrigger value="analytics" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white">
                Analytics
              </TabsTrigger>
            </TabsList>

            <TabsContent value="jobs" className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <h3 className="text-lg text-slate-800">Posted Jobs</h3>
                  <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                    {loadingJobs ? 'Loading...' : `${postedJobs.length} active`}
                  </Badge>
                </div>
                <div className="flex items-center space-x-3">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button variant="outline" size="sm" className="bg-white/80 backdrop-blur-sm">
                      <Filter className="w-4 h-4 mr-2" />
                      Filter
                    </Button>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button variant="outline" size="sm" className="bg-white/80 backdrop-blur-sm">
                      <Search className="w-4 h-4 mr-2" />
                      Search
                    </Button>
                  </motion.div>
                </div>
              </div>

              <div className="space-y-4">
                {loadingJobs ? (
                  <div className="text-center text-slate-500 py-8">Loading jobs...</div>
                ) : postedJobs.length === 0 ? (
                  <div className="text-center text-slate-500 py-8">No jobs found.</div>
                ) : (
                  postedJobs.map((job: any, index: number) => (
                    <motion.div
                      key={job.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card className="hover:shadow-xl transition-all duration-300 bg-white/90 backdrop-blur-sm border-0 shadow-lg overflow-hidden group">
                        <CardContent className="p-6 relative">
                          {job.is_hot && (
                            <motion.div
                              className="absolute top-4 right-4 flex items-center space-x-1 bg-gradient-to-r from-orange-500 to-red-500 text-white px-2 py-1 rounded-full text-xs"
                              animate={{ scale: [1, 1.1, 1] }}
                              transition={{ duration: 2, repeat: Infinity }}
                            >
                              <Flame className="w-3 h-3" />
                              <span>Hot</span>
                            </motion.div>
                          )}
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-3">
                                <h4 className="text-lg text-slate-800">{job.title}</h4>
                                {/* You can add more badges/info here if you add more fields to your table */}
                              </div>
                              <div className="flex items-center space-x-6 mb-3 text-sm text-muted-foreground">
                                <div className="flex items-center">
                                  <MapPin className="w-4 h-4 mr-1" />
                                  {job.location}
                                </div>
                                <div className="flex items-center">
                                  <DollarSign className="w-4 h-4 mr-1" />
                                  {job.salary}
                                </div>
                                <div className="flex items-center">
                                  <Clock className="w-4 h-4 mr-1" />
                                  {job.posted_at ? new Date(job.posted_at).toLocaleDateString() : ''}
                                </div>
                              </div>
                              <div className="flex flex-wrap gap-2 mb-4">
                                {Array.isArray(job.skills) && job.skills.map((skill: string) => (
                                  <Badge key={skill} variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                                    {skill}
                                  </Badge>
                                ))}
                              </div>
                              {/* You can add more job info here as you expand your schema */}
                            </div>
                            <div className="flex flex-col space-y-2 ml-6">
                              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                <Button size="sm" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white" onClick={() => navigate(`/job/${job.id}`)}>
                                  <Eye className="w-4 h-4 mr-1" />
                                  View Details
                                </Button>
                              </motion.div>
                              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                <Button variant="outline" size="sm" className="bg-white/80 backdrop-blur-sm">
                                  <Settings className="w-4 h-4 mr-1" />
                                  Manage
                                </Button>
                              </motion.div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="candidates" className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <h3 className="text-lg text-slate-800">Top Matched Candidates</h3>
                  <Badge variant="secondary" className="bg-green-100 text-green-700">
                    <Compass className="w-3 h-3 mr-1" />
                    {loadingCandidates ? 'Loading...' : `${topCandidates.length} discovered`}
                  </Badge>
                </div>
              </div>

              <div className="grid gap-6">
                {loadingCandidates ? (
                  <div className="text-center text-slate-500 py-8">Loading candidates...</div>
                ) : topCandidates.length === 0 ? (
                  <div className="text-center text-slate-500 py-8">No candidates found.</div>
                ) : (
                  topCandidates.map((candidate: any, index: number) => (
                    <motion.div
                      key={candidate.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card className="hover:shadow-xl transition-all duration-300 bg-white/90 backdrop-blur-sm border-0 shadow-lg overflow-hidden group">
                        <CardContent className="p-6 relative">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start space-x-4 flex-1">
                              <motion.div whileHover={{ scale: 1.1 }}>
                                <Avatar className="w-14 h-14 ring-2 ring-purple-200">
                                  <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                                    {candidate.display_name ? candidate.display_name.split(' ').map((n: string) => n[0]).join('') : 'U'}
                                  </AvatarFallback>
                                </Avatar>
                              </motion.div>
                              <div className="flex-1">
                                <div className="flex items-center space-x-3 mb-2">
                                  <h4 className="text-lg text-slate-800">{candidate.display_name || 'Unnamed'}</h4>
                                  {/* You can add more badges/info here if you add more fields to your table */}
                                </div>
                                {/* Add more candidate info here as you expand your schema */}
                                <p className="text-muted-foreground mb-3">Job Seeker</p>
                              </div>
                            </div>
                            <div className="flex flex-col space-y-2 ml-4">
                              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                <Button size="sm" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white">
                                  <Eye className="w-4 h-4 mr-1" />
                                  View Profile
                                </Button>
                              </motion.div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card className="bg-gradient-to-br from-purple-50 via-pink-50 to-cyan-50 border-0 shadow-lg">
                  <CardContent className="p-12 text-center">
                    <motion.div
                      animate={{ 
                        scale: [1, 1.1, 1],
                        rotate: [0, 5, -5, 0]
                      }}
                      transition={{ duration: 4, repeat: Infinity }}
                      className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg"
                    >
                      <Rocket className="w-8 h-8 text-white" />
                    </motion.div>
                    
                    <h3 className="text-xl bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-3">
                      Advanced Analytics Coming Soon
                    </h3>
                    <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                      Get AI-powered insights into your hiring patterns, candidate quality predictions, and optimization recommendations
                    </p>
                    
                    <div className="flex flex-wrap justify-center gap-3 mb-6">
                      {[
                        'Predictive Analytics',
                        'ROI Calculator',
                        'Benchmark Comparisons',
                        'Custom Reports'
                      ].map((feature) => (
                        <Badge key={feature} variant="secondary" className="bg-white/80 text-purple-700">
                          <Sparkles className="w-3 h-3 mr-1" />
                          {feature}
                        </Badge>
                      ))}
                    </div>

                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white">
                        <Gift className="w-4 h-4 mr-2" />
                        Get Early Access
                        <Sparkles className="w-4 h-4 ml-2" />
                      </Button>
                    </motion.div>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
}

