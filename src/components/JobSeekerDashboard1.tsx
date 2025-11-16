import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { ThemeToggle } from './ThemeToggle';
import { 
  Upload, 
  FileText, 
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
  AlertCircle,
  Award,
  Users,
  Zap,
  Eye,
  Heart,
  MessageCircle,
  Calendar,
  BarChart3,
  Flame
} from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import { supabase } from '../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from './ui/dialog';
import { log } from 'console';

const RESUME_BUCKET = (import.meta as any)?.env?.VITE_RESUME_BUCKET || "resume";

interface JobSeekerDashboardProps {
  user: any;
  onSignOut: () => void;
  onViewProfile?: () => void;
}

export function JobSeekerDashboard1() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [applyDialogOpen, setApplyDialogOpen] = useState(false);
  const [applyJobId, setApplyJobId] = useState<string | null>(null);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

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

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  // The rest of your component's state and logic remains the same
  const [animatedProgress, setAnimatedProgress] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [completedActions, setCompletedActions] = useState(new Set<string>());
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

  // handleApply now accepts an options object:
  // { resumeUrl?: string, skipAlert?: boolean }
  async function handleApply(id: any, options: { resumeUrl?: string; skipAlert?: boolean } = {}) {
    if (!user) {
      navigate("/login");
      return;
    }

    try {
      const job = jobs.find((j: any) => j.id === id) ?? { id };

      const payload = {
        job_id: id,
        candidate_id: user.id,
        job: {
          title: job.title,
          skills_required: Array.isArray(job.skills) ? job.skills : (job.skills || []),
          raw_jd: job.description_raw ?? '',
          generated_jd: job.description ?? ''
        },
        candidate: {
          resume_url: user?.user_metadata?.resume_url ?? null,
          github_url: user?.user_metadata?.github ?? null,
          linkedin_url: user?.user_metadata?.linkedin ?? null,
          profile: {
            skills: user?.user_metadata?.skills_text ?? user?.user_metadata?.skills ?? [],
            experience_years: user?.user_metadata?.experience_years ?? 0
          }
        }
      };

      // Use Vite env (import.meta.env). Log everything for debugging.
      const IM = (import.meta as any)?.env || {};
      // eslint-disable-next-line no-console
      console.debug('import.meta.env (frontend):', IM);
      // FALLBACK: if VITE_FLASK_BASE is not present, use local dev endpoint so frontend actually calls /score
      const FLASK_BASE = IM.VITE_FLASK_BASE ? String(IM.VITE_FLASK_BASE) : 'http://127.0.0.1:5000';
      if (!IM.VITE_FLASK_BASE) console.warn('VITE_FLASK_BASE not found in import.meta.env — using fallback', FLASK_BASE);
      // eslint-disable-next-line no-console
      console.debug('Resolved FLASK_BASE:', FLASK_BASE);
 
      let fitment = null;
      let breakdown = null;
 
      if (FLASK_BASE) {
        try {
          const url = `${FLASK_BASE.replace(/\/$/, '')}/score`;
          console.debug('Calling scoring service at', url, 'payload:', payload);
          const res = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
          const bodyText = await res.clone().text(); // preserve for logging
          console.debug('Scoring service response status:', res.status, 'body:', bodyText);
          try {
            const json = bodyText ? JSON.parse(bodyText) : {};
            fitment = (json && typeof json.fitment_score !== 'undefined') ? json.fitment_score : null;
            breakdown = (json && typeof json.sub_scores !== 'undefined') ? json.sub_scores : null;
          } catch (e) {
            console.warn('Failed parsing scoring response JSON', e);
          }
         } catch (err) {
           // network error (connection refused, timeout, etc.)
           console.warn("Scoring service unreachable, falling back to direct application", err);
         }
       } else {
         console.info("VITE_FLASK_BASE not set — skipping scoring service and persisting application only.");
         // show a visible console hint to confirm env location
         console.info('Make sure .env with VITE_FLASK_BASE is in the frontend root (where package.json is) and restart "npm run dev".');
       }

      // Persist application to Supabase (fallback if scoring failed or no service)
      const insertPayload: any = {
        job_id: id,
        candidate_id: user.id,
        status: "applied",
        created_at: new Date().toISOString()
      };

      // prefer resumeUrl passed via options (dialog upload) > payload candidate metadata
      const resumeToUse = options.resumeUrl ?? payload.candidate?.resume_url ?? null;
      if (resumeToUse) insertPayload.resume_url = resumeToUse;

      if (fitment !== null) insertPayload.fitment_score = fitment;
      // if your DB has separate columns (skill_match, cultural_fit...) include them here if breakdown exists
      if (breakdown && typeof breakdown === "object") {
        if (breakdown.skill_match !== undefined) insertPayload.skill_match = breakdown.skill_match;
        if (breakdown.cultural_fit !== undefined) insertPayload.cultural_fit = breakdown.cultural_fit;
        if (breakdown.growth_potential !== undefined) insertPayload.growth_potential = breakdown.growth_potential;
        if (breakdown.attrition_risk !== undefined) insertPayload.attrition_risk = breakdown.attrition_risk;
      }

      const { data: insertData, error: insertError } = await supabase
        .from("applications")
        .insert([insertPayload])
        .select()
        .single();

      if (insertError) {
        console.error("Failed to persist application in Supabase:", insertError);
        if (!options.skipAlert) alert("Failed to submit application. Please try again.");
        return;
      }

      // Update UI optimistically: increment applicants and set latest_fitment if available
      setJobs((prev) =>
        prev.map((jobItem) =>
          jobItem.id === id
            ? { ...jobItem, applicants: (jobItem.applicants || 0) + 1, latest_fitment: fitment }
            : jobItem
        )
      );

      // Inform user
      if (!options.skipAlert) {
        if (fitment !== null) {
          alert(`Application submitted. Fitment score: ${Math.round((fitment || 0) * 10) / 10}`);
        } else {
          alert("Application submitted. Fitment scoring service is unavailable — application saved without fitment score.");
        }
      }
      console.log("Application saved:", insertData);
      // return inserted row for callers that need it
      return insertData;

    } catch (err) {
      console.error("Unexpected error applying:", err);
      if (!options.skipAlert) alert("Unexpected error while applying.");
    }
  }

  // Open dialog to upload resume and apply
  function openApplyDialog(jobId: string) {
    setApplyJobId(jobId);
    setResumeFile(null);
    setUploadError(null);
    setApplyDialogOpen(true);
  }

  function closeApplyDialog() {
    setApplyDialogOpen(false);
    setApplyJobId(null);
    setResumeFile(null);
    setUploading(false);
    setUploadError(null);
  }

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    setUploadError(null);
    const f = e.target.files?.[0] ?? null;
    if (!f) {
      setResumeFile(null);
      return;
    }
    // simple validation: pdf/doc file and size < 5MB
    const allowed = ['application/pdf','application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowed.includes(f.type)) {
      setUploadError('Please upload a PDF or Word document.');
      setResumeFile(null);
      return;
    }
    if (f.size > 5 * 1024 * 1024) {
      setUploadError('File size must be under 5 MB.');
      setResumeFile(null);
      return;
    }
    setResumeFile(f);
  }

  // Upload resume to Supabase storage and then call handleApply to persist application
  async function confirmApply() {
    if (!applyJobId) return;
    if (!user) {
      navigate('/login');
      return;
    }

    setUploading(true);
    setUploadError(null);
    let resumeUrl: string | null = null;

    try {
      if (resumeFile) {
        const ext = resumeFile.name.split('.').pop();
        // key path inside the bucket (do NOT prefix with bucket name)
        const key = `${user.id}/${Date.now()}.${ext || 'pdf'}`;
        const { error: upErr } = await supabase.storage.from(RESUME_BUCKET).upload(key, resumeFile, { cacheControl: '3600', upsert: false });

        if (upErr) {
          console.error('Upload error', upErr);
          // Common cause: wrong bucket name or missing bucket
          if (String(upErr.message || upErr).toLowerCase().includes('bucket')) {
            setUploadError(`Upload failed: storage bucket "${RESUME_BUCKET}" not found. Create the bucket in Supabase Storage or set VITE_RESUME_BUCKET to the correct name.`);
          } else {
            setUploadError('Failed to upload resume. Please try again.');
          }
          setUploading(false);
          return;
        }
        // get public url (try both public URL and signed URL fallback)
        try {
          const pub = (supabase.storage.from(RESUME_BUCKET).getPublicUrl(key) as any);
          resumeUrl = pub?.data?.publicUrl || pub?.publicUrl || pub?.publicURL || null;
        } catch (e) {
          console.warn('getPublicUrl failed, trying signed url fallback', e);
          resumeUrl = null;
        }
        // If public url not available (private bucket), try creating a short-lived signed URL
        if (!resumeUrl && supabase.storage.from(RESUME_BUCKET).createSignedUrl) {
          try {
            const signed = await (supabase.storage.from(RESUME_BUCKET).createSignedUrl as any)(key, 60);
            resumeUrl = signed?.data?.signedUrl || signed?.signedUrl || null;
          } catch (e) {
            console.warn('createSignedUrl failed', e);
            resumeUrl = null;
          }
        }
      }

      // inject resume url into payload candidate metadata so handleApply will persist it
      if (resumeUrl) {
        // call handleApply and include resumeUrl; skip its alert so we show a single confirmation
        await handleApply(applyJobId, { resumeUrl, skipAlert: true });
      } else {
        // no resume or no public url — still call handleApply but skip alert to control UX here
        await handleApply(applyJobId, { skipAlert: true });
      }

      setUploading(false);
      closeApplyDialog();
      alert('Application submitted successfully.');
    } catch (err) {
      console.error('confirmApply error', err);
      setUploading(false);
      setUploadError('Unexpected error. Please try again.');
    }
  }

  // derive displayed jobs from Supabase `jobs` table
  const displayedJobs = (jobs || []).map((j: any) => {
    const skills = Array.isArray(j.skills) ? j.skills : (j.skills_text || j.skills || []).filter ? j.skills_text : [];
    const matchScore = typeof j.match_score === "number" ? j.match_score : (j.matchScore ?? 0);
    const posted = j.posted_at ? new Date(j.posted_at).toLocaleDateString() : (j.posted ?? "");
    return {
      id: j.id,
      title: j.title ?? j.job_title ?? "Untitled",
      company: j.company ?? j.company_name ?? "Unknown",
      location: j.location ?? "Remote",
      salary: j.salary ?? j.salary_range ?? "",
      matchScore: Math.round(matchScore),
      posted,
      skills: Array.isArray(skills) ? skills : (typeof skills === "string" ? skills.split(",").map((s:string)=>s.trim()) : []),
      isHot: !!j.is_hot,
      applicants: typeof j.applicants === "number" ? j.applicants : 0,
      companyLogo: j.company_logo ?? (j.company ? j.company.charAt(0) : "🏢"),
      benefits: Array.isArray(j.benefits) ? j.benefits : (j.benefits ? String(j.benefits).split(",").map((s:string)=>s.trim()) : []),
      viewed: !!j.viewed
    };
  });

  function testScoreEndpoint() {
    const payload = {
      job_id: 'test-job-1',
      candidate_id: 'test-cand-1',
      job: { title: 'Test Job', skills_required: ['react','ts'] },
      candidate: { profile: { skills: ['react'], experience_years: 2 } }
    };
    const BASE = (import.meta as any)?.env?.VITE_FLASK_BASE || 'http://127.0.0.1:5000';
    const url = `${BASE.replace(/\/$/, '')}/score`;
    console.debug('Testing /score at', url, 'payload:', payload);
    fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(async (res) => {
        const text = await res.text();
        console.log('test /score status:', res.status, 'body:', text);
        alert(`score status ${res.status} — check console for body`);
      })
      .catch((err) => {
        console.error('test /score fetch failed', err);
        alert('Fetch failed — see console');
      });
  }

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
                <h1 className="text-xl font-bold text-foreground">TalentMatch</h1>
                <p className="text-xs text-muted-foreground">Job Seeker Portal</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <ThemeToggle />
              <button onClick={testScoreEndpoint} className="btn">Test /score</button>
              
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-xs text-white">3</span>
                </span>
              </Button>
              
              <Button variant="ghost" size="sm">
                <Settings className="w-5 h-5" />
              </Button>
              
              <div className="flex items-center space-x-3 pl-3 border-l">
                <button onClick={() => navigate('/job-seeker-profile')} className="cursor-pointer">
                  <Avatar className="w-9 h-9">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {user?.user_metadata?.full_name?.charAt(0)?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                </button>
                <div className="hidden sm:block">
                  <p className="text-sm font-medium text-foreground">{user?.user_metadata?.full_name}</p>
                  <p className="text-xs text-muted-foreground">Job Seeker</p>
                </div>
              </div>
              
              <Button variant="ghost" size="sm" onClick={handleSignOut} className="text-muted-foreground hover:text-destructive">
                <LogOut className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, index) => (
            <Card key={index} className="hover:shadow-lg transition-all duration-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center`}>
                    <stat.icon className="w-6 h-6" />
                  </div>
                  <Badge variant="secondary" className="text-emerald-600">{stat.change}</Badge>
                </div>
                <div className="text-2xl font-bold text-foreground mb-1">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Welcome Card */}
            <Card className="bg-primary text-primary-foreground border-0">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-3xl mb-2">
                      Welcome back, {(user?.user_metadata?.full_name ?? user?.email ?? 'User').split(' ')[0]}
                    </CardTitle>
                    <CardDescription className="text-primary-foreground/90 text-lg">
                      You're 72% ready to land your dream job. Let's boost that to 100%
                    </CardDescription>
                  </div>
                  <div className="hidden sm:block">
                    <Award className="w-16 h-16 text-primary-foreground/80" />
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Profile Completeness */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center text-xl">
                      <BarChart3 className="w-6 h-6 text-primary mr-3" />
                      Profile Power Score
                    </CardTitle>
                    <CardDescription className="text-base">
                      Complete your profile to get 5x more job matches
                    </CardDescription>
                  </div>
                  <Badge className="bg-primary/10 text-primary px-4 py-2 text-lg">
                    {animatedProgress}% Complete
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="relative">
                  <Progress value={animatedProgress} className="h-4" />
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Almost there! Just 28% to go</span>
                  <span className="text-primary font-semibold">Next reward at 80%</span>
                </div>
                
                <div className="bg-muted/50 p-4 rounded-xl">
                  <p className="text-sm text-foreground font-medium mb-2">Pro Tip:</p>
                  <p className="text-sm text-muted-foreground mb-3">
                    Candidates with 90%+ complete profiles get 3x more interview invitations
                  </p>
                  <Button onClick={() => navigate('/job-seeker-profile')} className="w-full">
                    Complete Profile
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Tabs */}
            <Tabs defaultValue="matches" className="space-y-8">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="matches">Job Matches</TabsTrigger>
                <TabsTrigger value="applications">Applications</TabsTrigger>
                <TabsTrigger value="assessments">Assessments</TabsTrigger>
              </TabsList>

              <TabsContent value="matches" className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-bold text-foreground">Hot Matches for You</h3>
                    <p className="text-muted-foreground">AI-curated opportunities based on your profile</p>
                  </div>
                  <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300 px-4 py-2">
                    {displayedJobs.length} fresh matches
                  </Badge>
                </div>
                
                <div className="space-y-4">
                  {displayedJobs.map((job, index) => (
                    <Card key={job.id} className="hover:shadow-lg transition-all duration-200 relative">
                      {job.isHot && (
                        <div className="absolute top-0 right-0 bg-red-500 text-white px-3 py-1 text-xs font-medium rounded-bl-lg">
                          HOT
                        </div>
                      )}
                      
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-4 mb-3">
                              <div className="text-3xl">{job.companyLogo}</div>
                              <div>
                                <div className="flex items-center space-x-3 mb-1">
                                  <h4 className="text-xl font-bold text-foreground hover:text-primary transition-colors">
                                    {job.title}
                                  </h4>
                                  <Badge 
                                    className={`${
                                      job.matchScore >= 90 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300' :
                                      job.matchScore >= 85 ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' :
                                      'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300'
                                    }`}
                                  >
                                    {job.matchScore}% match
                                  </Badge>
                                </div>
                                <p className="text-lg text-muted-foreground font-medium">{job.company}</p>
                              </div>
                            </div>
                            
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
                                {job.posted}
                              </div>
                              <div className="flex items-center">
                                <Users className="w-4 h-4 mr-2 text-purple-500" />
                                {job.applicants} applicants
                              </div>
                            </div>
                            
                            <div className="flex flex-wrap gap-2 mb-4">
                              {job.skills.map((skill: string) => (
                                <Badge key={skill} variant="outline">
                                  {skill}
                                </Badge>
                              ))}
                            </div>

                            <div className="flex flex-wrap gap-2">
                              {job.benefits.map((benefit: string) => (
                                <span key={benefit} className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded-full">
                                  {benefit}
                                </span>
                              ))}
                            </div>
                          </div>
                          
                          <div className="flex flex-col space-y-3 ml-6">
                            <Button size="lg" className="bg-primary hover:bg-primary/90" onClick={() => openApplyDialog(job.id)}>
                              Apply Now
                            </Button>
                            
                            <div className="flex space-x-2">
                              <Button variant="outline" size="sm">
                                <Heart className="w-4 h-4" />
                              </Button>
                              <Button variant="outline" size="sm">
                                <MessageCircle className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="applications">
                <Card>
                  <CardContent className="p-16 text-center">
                    <Briefcase className="w-20 h-20 text-muted-foreground mx-auto mb-6" />
                    <h3 className="text-2xl font-bold text-foreground mb-4">Ready to Start Applying?</h3>
                    <p className="text-lg text-muted-foreground mb-8 max-w-md mx-auto">
                      You have amazing matches waiting! Start applying to jobs that align perfectly with your skills and aspirations.
                    </p>
                    <Button size="lg" className="text-lg px-8 py-4">
                      Browse Job Matches
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="assessments">
                <Card>
                  <CardContent className="p-16 text-center">
                    <Target className="w-20 h-20 text-muted-foreground mx-auto mb-6" />
                    <h3 className="text-2xl font-bold text-foreground mb-4">Showcase Your Skills</h3>
                    <p className="text-lg text-muted-foreground mb-8 max-w-md mx-auto">
                      Take our AI-powered skill assessments to validate your expertise and unlock premium job opportunities.
                    </p>
                    <div className="space-y-4">
                      <Button size="lg" className="text-lg px-8 py-4">
                        Start Assessment
                      </Button>
                      <p className="text-sm text-muted-foreground">
                        Takes only 15 minutes • Boost your match score by 30%
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl flex items-center">
                  <Zap className="w-5 h-5 mr-2 text-primary" />
                  Power Up Your Profile
                </CardTitle>
                <CardDescription className="text-base">
                  Each action boosts your match potential
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {profileActions.map((action, index) => (
                  <div
                    key={action.id}
                    onClick={() => handleActionComplete(action.id)}
                    className={`relative p-4 rounded-xl border cursor-pointer transition-all duration-200 hover:shadow-md ${
                      action.completed 
                        ? 'bg-emerald-50 dark:bg-emerald-950 border-emerald-200 dark:border-emerald-800' 
                        : 'bg-card border-border hover:border-primary/50'
                    }`}
                  >
                    {action.completed && (
                      <div className="absolute top-2 right-2">
                        <CheckCircle className="w-5 h-5 text-emerald-500" />
                      </div>
                    )}
                    
                    <div className="flex items-start space-x-4">
                      <div className={`w-12 h-12 ${action.color} rounded-xl flex items-center justify-center flex-shrink-0`}>
                        <action.icon className="w-6 h-6" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-semibold text-foreground">{action.title}</p>
                          {!action.completed && (
                            <Badge variant="secondary" className="text-xs">
                              {action.boost}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{action.description}</p>
                        
                        {action.completed ? (
                          <div className="text-xs text-emerald-600 font-medium">
                            {action.reward}
                          </div>
                        ) : (
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-primary font-medium">Click to complete</span>
                            <Plus className="w-4 h-4 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* AI Insights */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl flex items-center">
                  <Sparkles className="w-5 h-5 mr-2 text-primary" />
                  AI Career Insights
                </CardTitle>
                <CardDescription>
                  Personalized recommendations just for you
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {insights.map((insight, index) => (
                  <div
                    key={index}
                    className={`p-4 ${insight.color} rounded-xl border cursor-pointer transition-all duration-200 hover:shadow-md`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className={`w-10 h-10 bg-primary rounded-xl flex items-center justify-center`}>
                        <insight.icon className="w-5 h-5 text-primary-foreground" />
                      </div>
                      
                      <div className="flex-1">
                        <p className="font-semibold text-foreground mb-1">{insight.title}</p>
                        <p className="text-sm text-muted-foreground mb-3">{insight.message}</p>
                        <Button size="sm" variant="outline">
                          {insight.action}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Achievement Card */}
            <Card className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white border-0">
              <CardContent className="p-6 text-center">
                <Award className="w-12 h-12 mx-auto mb-3" />
                <h3 className="text-lg font-bold mb-2">Achievement Unlocked!</h3>
                <p className="text-sm opacity-90 mb-3">
                  Profile Superstar - You're in the top 15% of candidates!
                </p>
                <Badge className="bg-white/20 text-white border-0">
                  Reward: Premium Badge
                </Badge>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Apply dialog */}
      <Dialog open={applyDialogOpen} onOpenChange={(v) => { if (!v) closeApplyDialog(); setApplyDialogOpen(v); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Resume & Apply</DialogTitle>
            <DialogDescription>
              Upload the resume you'd like to apply with. You can proceed without a resume as well.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <input type="file" accept=".pdf,.doc,.docx" onChange={onFileChange} />
            {uploadError && <div className="text-sm text-destructive">{uploadError}</div>}
            {resumeFile && <div className="text-sm text-muted-foreground">Selected: {resumeFile.name}</div>}
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={closeApplyDialog} disabled={uploading}>Cancel</Button>
            <Button onClick={confirmApply} disabled={uploading}>
              {uploading ? 'Uploading...' : 'Upload & Apply'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Debug: print imported Vite env so we can confirm VITE_FLASK_BASE is available
try {
  // top-level debug (runs when module loads)
  // eslint-disable-next-line no-console
  console.debug('Vite env (import.meta.env):', (import.meta as any)?.env || {});
} catch (e) {
  // ignore in environments that block console
}