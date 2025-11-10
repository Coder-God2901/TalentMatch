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
  Activity,
  Zap,
  BarChart3,
  Heart
} from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import { supabase } from '../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';
import {ThemeToggle} from './ThemeToggle';
import { CandidatesPage } from "./CandidatesPage";
import { RankingCandidates1 } from "./RankingCandidates1";

export function RecruiterDashboard1() {
  const { user } = useAuth(); // Get user from our central AuthContext
  const navigate = useNavigate(); // Get navigate function for redirects

  // Derive display name and initials from Supabase user metadata (fallback to email)
  const displayName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    (user?.email ? user.email.split('@')[0] : 'User');

  const initials = displayName
    .split(' ')
    .filter(Boolean)
    .map((s: string) => s[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  // This function now handles signing out internally (copied from RecruiterDashboard.tsx)
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

  // --- Backend logic from RecruiterDashboard.tsx applied here ---
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

  // derive activeJobs from postedJobs based on status === 'active'
  const formatPosted = (posted_at: string | null | undefined) => {
    if (!posted_at) return 'unknown';
    const diff = Date.now() - new Date(posted_at).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    return `${days}d`;
  };

  const computedActiveJobs = (postedJobs || [])
    .filter((job: any) => (job.status || 'active').toString().toLowerCase() === 'active')
    .map((job: any) => ({
      id: job.id,
      title: job.title,
      // derive urgency from is_hot / match_score
      urgency: job.is_hot ? 'High' : (job.match_score && job.match_score > 85 ? 'Medium' : 'Low'),
      status: job.status || 'Open',
      // department isn't in the schema; fall back to company or generic
      department: (job.department as string) || job.company || 'General',
      location: job.location || 'Remote',
      salary: job.salary || '—',
      posted: formatPosted(job.posted_at),
      // applicants maps to candidates
      candidates: job.applicants ?? 0,
      // newApplications isn't stored in schema; approximate from applicants
      newApplications: Math.min(5, job.applicants ?? 0)
    }));

  // Fallback sample so UI renders sensibly when there are no active jobs yet
  const activeJobs = computedActiveJobs.length
    ? computedActiveJobs
    : [
        {
          id: 'job_1',
          title: 'Senior Frontend Engineer',
          urgency: 'High',
          status: 'Open',
          department: 'Engineering',
          location: 'Remote',
          salary: '$130k - $160k',
          posted: '3d',
          candidates: 24,
          newApplications: 5
        },
        {
          id: 'job_2',
          title: 'Product Designer',
          urgency: 'Medium',
          status: 'Open',
          department: 'Design',
          location: 'San Francisco, CA',
          salary: '$100k - $130k',
          posted: '7d',
          candidates: 12,
          newApplications: 2
        }
      ];

  // Recent activity items used in the sidebar; includes icon references used in JSX.
  const recentActivity = [
    { icon: CheckCircle, message: 'Candidate John Doe accepted interview invite', time: '2h ago' },
    { icon: Gift, message: 'Referral bonus awarded to Sarah for successful hire', time: '1d ago' },
    { icon: Rocket, message: 'New pipeline automation rule deployed', time: '3d ago' },
    { icon: Sparkles, message: 'AI suggestions improved match accuracy for Engineering roles', time: '5d ago' }
  ];

  const [postingJob, setPostingJob] = useState(false);
  const [postJobError, setPostJobError] = useState<string | null>(null);

  // handleJobSubmit: upsert job to supabase and refresh postedJobs (copied from RecruiterDashboard.tsx)
  const handleJobSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPostingJob(true);
    setPostJobError(null);
    const jobData = {
      title: jobForm.title,
      company: user?.user_metadata?.company || 'Unknown Company',
      location: jobForm.location,
      salary: jobForm.salary,
      skills: jobForm.skills.split(',').map((s) => s.trim()).filter(Boolean),
      benefits: [],
      description: jobForm.description,
      is_hot: false,
      match_score: Math.floor(Math.random() * 16) + 85,
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

  // --- end backend logic integration ---

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b sticky top-0 z-40">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">
                  TalentMatch
                </h1>
                <p className="text-xs text-muted-foreground">
                  Recruiter Portal
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <ThemeToggle />

              <button
                onClick={() => navigate('/recruiter-profile')}
                className="flex items-center space-x-3 cursor-pointer"
              >
                <Avatar className="w-9 h-9">
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {initials || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden sm:block">
                  <p className="text-sm font-medium text-foreground">
                    {displayName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Recruiter
                  </p>
                </div>
              </button>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
                className="text-muted-foreground hover:text-destructive"
              >
                <LogOut className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <Card className="bg-primary text-primary-foreground border-0">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-3xl mb-2">
                    Welcome back, {displayName.split(' ')[0]}
                  </CardTitle>
                  <CardDescription className="text-primary-foreground/90 text-lg">
                    You have 8 new applications and 3 interviews
                    scheduled today
                  </CardDescription>
                </div>
                <div className="hidden sm:block">
                  <Crown className="w-16 h-16 text-primary-foreground/80" />
                </div>
              </div>
            </CardHeader>
          </Card>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
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
            <Card
              key={index}
              className="hover:shadow-lg transition-all duration-200"
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-4">
                    <div
                      className={`w-12 h-12 bg-gradient-to-br ${stat.gradient} rounded-xl flex items-center justify-center`}
                    >
                      <stat.icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-foreground mb-1">
                        {stat.value}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {stat.description}
                      </div>
                    </div>
                  </div>
                  <Badge
                    variant="secondary"
                    className="text-emerald-600 self-start"
                  >
                    {stat.change}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-xl">
                  <Zap className="w-5 h-5 mr-2 text-primary" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <Dialog
                    open={isPostingJob}
                    onOpenChange={setIsPostingJob}
                  >
                    <DialogTrigger asChild>
                      <Button className="h-20 flex flex-col items-center justify-center space-y-2">
                        <Plus className="w-6 h-6" />
                        <span>Post New Job</span>
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>
                          Post a New Job
                        </DialogTitle>
                        <DialogDescription>
                          Create a new job posting to attract
                          top talent
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label
                            htmlFor="title"
                            className="text-right"
                          >
                            Job Title
                          </Label>
                          <Input
                            id="title"
                            className="col-span-3"
                            placeholder="e.g. Senior Frontend Developer"
                          />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label
                            htmlFor="department"
                            className="text-right"
                          >
                            Department
                          </Label>
                          <Select>
                            <SelectTrigger className="col-span-3">
                              <SelectValue placeholder="Select department" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="engineering">
                                Engineering
                              </SelectItem>
                              <SelectItem value="product">
                                Product
                              </SelectItem>
                              <SelectItem value="design">
                                Design
                              </SelectItem>
                              <SelectItem value="marketing">
                                Marketing
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label
                            htmlFor="location"
                            className="text-right"
                          >
                            Location
                          </Label>
                          <Input
                            id="location"
                            className="col-span-3"
                            placeholder="e.g. San Francisco, CA or Remote"
                          />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label
                            htmlFor="salary"
                            className="text-right"
                          >
                            Salary Range
                          </Label>
                          <Input
                            id="salary"
                            className="col-span-3"
                            placeholder="e.g. $120k - $150k"
                          />
                        </div>
                        <div className="grid grid-cols-4 items-start gap-4">
                          <Label
                            htmlFor="description"
                            className="text-right pt-2"
                          >
                            Description
                          </Label>
                          <Textarea
                            id="description"
                            className="col-span-3"
                            rows={4}
                            placeholder="Job description and requirements..."
                          />
                        </div>
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          onClick={() =>
                            setIsPostingJob(false)
                          }
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={() =>
                            setIsPostingJob(false)
                          }
                        >
                          Post Job
                        </Button>
                      </div>
                      </div>
                    </DialogContent>
                  </Dialog>

                  <Button
                    variant="outline"
                    className="h-20 flex flex-col items-center justify-center space-y-2"
                    onClick={() => navigate('/candidates')}
                  >
                    <Search className="w-6 h-6" />
                    <span>Browse Candidates</span>
                  </Button>

                  <Button
                    variant="outline"
                    className="h-20 flex flex-col items-center justify-center space-y-2"
                  >
                    <Calendar className="w-6 h-6" />
                    <span>Schedule Interview</span>
                  </Button>

                  <Button
                    variant="outline"
                    className="h-20 flex flex-col items-center justify-center space-y-2"
                  >
                    <BarChart3 className="w-6 h-6" />
                    <span>View Analytics</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Tabs */}
            <Tabs
              defaultValue="candidates"
              className="space-y-8"
            >
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="candidates">
                  Top Candidates
                </TabsTrigger>
                <TabsTrigger value="jobs">
                  Active Jobs
                </TabsTrigger>
                <TabsTrigger value="analytics">
                  Analytics
                </TabsTrigger>
              </TabsList>

              <TabsContent
                value="candidates"
                className="space-y-6"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-bold text-foreground">
                      Top Matching Candidates
                    </h3>
                    <p className="text-muted-foreground">
                      AI-curated candidates for your open
                      positions
                    </p>
                  </div>
                  <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300 px-4 py-2">
                    {topCandidates.length} new matches
                  </Badge>
                </div>

                <div className="space-y-4">
                  {topCandidates.map((candidate) => (
                    <Card
                      key={candidate.id}
                      className="hover:shadow-lg transition-all duration-200"
                    >
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-4 flex-1">
                            <Avatar className="w-16 h-16">
                              <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                                {candidate.avatar}
                              </AvatarFallback>
                            </Avatar>

                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-2">
                                <h4 className="text-xl font-bold text-foreground">
                                  {candidate.name}
                                </h4>
                                <Badge
                                  className={`${
                                    candidate.matchScore >= 90
                                      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300"
                                      : candidate.matchScore >=
                                          85
                                        ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                                        : "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300"
                                  }`}
                                >
                                  {candidate.matchScore}% match
                                </Badge>
                                <Badge
                                  variant={
                                    candidate.status ===
                                    "Available"
                                      ? "default"
                                      : "secondary"
                                  }
                                  className={
                                    candidate.status ===
                                    "Available"
                                      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300"
                                      : ""
                                  }
                                >
                                  {candidate.status}
                                </Badge>
                              </div>

                              <p className="text-lg text-muted-foreground font-medium mb-3">
                                {candidate.title}
                              </p>

                              <div className="flex items-center space-x-6 mb-4 text-sm text-muted-foreground">
                                <div className="flex items-center">
                                  <MapPin className="w-4 h-4 mr-2 text-primary" />
                                  {candidate.location}
                                </div>
                                <div className="flex items-center">
                                  <Briefcase className="w-4 h-4 mr-2 text-blue-500" />
                                  {candidate.experience}
                                </div>
                                <div className="flex items-center">
                                  <DollarSign className="w-4 h-4 mr-2 text-emerald-500" />
                                  {candidate.salary}
                                </div>
                                <div className="flex items-center">
                                  <Clock className="w-4 h-4 mr-2 text-orange-500" />
                                  Active {candidate.lastActive}
                                </div>
                              </div>

                              <div className="flex flex-wrap gap-2 mb-4">
                                {(Array.isArray(candidate.skills) ? candidate.skills : (candidate.skills ? String(candidate.skills).split(',') : []))
                                  .slice(0, 4)
                                  .map((skill: string) => (
                                    <Badge key={skill} variant="outline">
                                      {skill}
                                    </Badge>
                                  ))}
                                {(Array.isArray(candidate.skills) ? candidate.skills : (candidate.skills ? String(candidate.skills).split(',') : [])).length > 4 && (
                                  <Badge variant="outline">
                                    +{(Array.isArray(candidate.skills) ? candidate.skills : (candidate.skills ? String(candidate.skills).split(',') : [])).length - 4} more
                                  </Badge>
                                )}
                              </div>

                              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                                <div className="flex items-center">
                                  <MessageCircle className="w-4 h-4 mr-1" />
                                  <span>
                                    Response rate:{" "}
                                    {candidate.responses}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-col space-y-3 ml-6">
                            <Button size="lg">Contact</Button>

                            <div className="flex space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                              >
                                <Heart className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="jobs" className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-bold text-foreground">
                      Active Job Postings
                    </h3>
                    <p className="text-muted-foreground">
                      Manage your current job openings
                    </p>
                  </div>
                  <Button onClick={() => setIsPostingJob(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Post New Job
                  </Button>
                </div>

                <div className="space-y-4">
                  {activeJobs.map((job) => (
                    <Card
                      key={job.id}
                      className="hover:shadow-lg transition-all duration-200"
                    >
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h4 className="text-xl font-bold text-foreground">
                                {job.title}
                              </h4>
                              <Badge
                                variant={
                                  job.urgency === "High"
                                    ? "destructive"
                                    : "secondary"
                                }
                              >
                                {job.urgency} Priority
                              </Badge>
                              <Badge variant="outline">
                                {job.status}
                              </Badge>
                            </div>

                            <p className="text-lg text-muted-foreground font-medium mb-3">
                              {job.department}
                            </p>

                            <div className="flex items-center space-x-6 mb-4 text-sm text-muted-foreground">
                              <div className="flex items-center">
                                <MapPin className="w-4 h-4 mr-2 text-primary" />
                                {job.location}
                              </div>
                              <div className="flex items-center">
                                <DollarSign className="w-4 h-4 mr-2 text-emerald-500" />
                                {job.salary}
                              </div>
                              <div className="flex items-center">
                                <Clock className="w-4 h-4 mr-2 text-orange-500" />
                                Posted {job.posted}
                              </div>
                            </div>

                            <div className="flex items-center space-x-6 text-sm">
                              <div className="flex items-center text-blue-600">
                                <Users className="w-4 h-4 mr-1" />
                                <span>
                                  {job.candidates} candidates
                                </span>
                              </div>
                              <div className="flex items-center text-emerald-600">
                                <TrendingUp className="w-4 h-4 mr-1" />
                                <span>
                                  {job.newApplications} new
                                  applications
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-col space-y-3 ml-6">
                            <Button size="lg" onClick={() => navigate(`/recruiter/jobs/${job.id}/ranked`)}>
                              View Candidates
                            </Button>

                            <div className="flex space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => navigate(`/job/${job.id}`)}
                              >
                                Edit
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                              >
                                Analytics
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="analytics">
                <Card>
                  <CardContent className="p-16 text-center">
                    <BarChart3 className="w-20 h-20 text-muted-foreground mx-auto mb-6" />
                    <h3 className="text-2xl font-bold text-foreground mb-4">
                      Analytics Dashboard
                    </h3>
                    <p className="text-lg text-muted-foreground mb-8 max-w-md mx-auto">
                      Get insights into your recruitment
                      performance and optimize your hiring
                      process.
                    </p>
                    <Button
                      size="lg"
                      className="text-lg px-8 py-4"
                    >
                      View Detailed Analytics
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl flex items-center">
                  <Activity className="w-5 h-5 mr-2 text-primary" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div
                    key={index}
                    className="flex items-start space-x-3"
                  >
                    <div className="w-8 h-8 bg-primary/10 text-primary rounded-lg flex items-center justify-center flex-shrink-0">
                      <activity.icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground font-medium">
                        {activity.message}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {activity.time}
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Performance Metrics */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl flex items-center">
                  <Target className="w-5 h-5 mr-2 text-primary" />
                  This Month's Performance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      Jobs Posted
                    </span>
                    <span className="text-sm font-medium">
                      8 / 10
                    </span>
                  </div>
                  <Progress value={80} className="h-2" />
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      Interviews Conducted
                    </span>
                    <span className="text-sm font-medium">
                      24 / 30
                    </span>
                  </div>
                  <Progress value={80} className="h-2" />
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      Successful Hires
                    </span>
                    <span className="text-sm font-medium">
                      5 / 6
                    </span>
                  </div>
                  <Progress value={83} className="h-2" />
                </div>
              </CardContent>
            </Card>

            {/* AI Insights */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl flex items-center">
                  <Sparkles className="w-5 h-5 mr-2 text-primary" />
                  AI Insights
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-xl">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                      <TrendingUp className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground mb-1">
                        Trending Skills
                      </p>
                      <p className="text-sm text-muted-foreground mb-2">
                        React and TypeScript demand increased
                        25% this month
                      </p>
                      <Button size="sm" variant="outline">
                        Learn More
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-emerald-50 dark:bg-emerald-950 rounded-xl">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
                      <Users className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground mb-1">
                        Candidate Pool
                      </p>
                      <p className="text-sm text-muted-foreground mb-2">
                        127 new qualified candidates joined this
                        week
                      </p>
                      <Button size="sm" variant="outline">
                        View Candidates
                      </Button>
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