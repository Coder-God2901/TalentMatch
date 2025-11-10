import React, { useState } from "react";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback } from "./ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Progress } from "./ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import {
  ArrowLeft,
  Search,
  Filter,
  Download,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  GraduationCap,
  Calendar,
  DollarSign,
  Star,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Clock,
  Award,
  Target,
  BarChart3,
  FileText,
  Send,
  Heart,
  MessageCircle,
  Linkedin,
  Github,
  Globe,
  ChevronRight,
  ThumbsUp,
  ThumbsDown,
  X,
  ArrowUpDown,
  Minus,
  Eye,
  Crown,
  Medal,
  Trophy,
  Zap,
  AlertCircle,
  Users,
} from "lucide-react";
import { Textarea } from "./ui/textarea";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

interface Job {
  id: number;
  title: string;
  department: string;
  location: string;
  salary: string;
  status: string;
  urgency: string;
}

interface RankingCandidatesProps {
  job: Job;
}

interface Candidate {
  id: number;
  name: string;
  title: string;
  location: string;
  experience: string;
  skills: string[];
  matchScore: number;
  attritionRisk: "Low" | "Medium" | "High";
  avatar: string;
  status: "New" | "Reviewed" | "Interviewing" | "Offered" | "Rejected";
  salary: string;
  education: string;
  lastActive: string;
  responseRate: number;
  interviewScore?: number;
  yearsOfExperience: number;
  cultureFit: number;
  technicalSkills: number;
  softSkills: number;
  email: string;
  phone: string;
  linkedIn?: string;
  github?: string;
  portfolio?: string;
  summary: string;
  appliedDate: string;
  availability: string;
  expectedSalary: string;
  noticePeriod: string;
  rank?: number;
  recruiterNotes?: string;
}

export function RankingCandidates1() {
  const { id } = useParams(); // job id
  const navigate = useNavigate();
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [recomputing, setRecomputing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(
    null
  );
  const [sortBy, setSortBy] = useState("rank");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [candidateToReject, setCandidateToReject] = useState<Candidate | null>(
    null
  );
  const [rejectionReason, setRejectionReason] = useState("");

  useEffect(() => {
      if (!id) return;
      (async () => {
        setLoading(true);
        try {
          // Fetch applications joined with candidate info from Supabase
          // select applications fields + inner candidates relation
          const { data, error } = await supabase
            .from('applications')
            .select(`id, candidate_id, fitment_score, sub_scores, created_at, candidates(id, display_name, email)`)
            .eq('job_id', id);
          if (error) throw error;
          const mapped = (data || []).map((r: any) => ({
            candidate_id: r.candidate_id,
            display_name: r.candidates?.display_name ?? 'Unknown',
            email: r.candidates?.email ?? '—',
            fitment_score: r.fitment_score,
            sub_scores: r.sub_scores,
            application_id: r.id,
            applied_at: r.created_at
          }));
          // sort by fitment_score desc (undefined/ null considered 0)
          mapped.sort((a: any, b: any) => (b.fitment_score || 0) - (a.fitment_score || 0));
          setRows(mapped);
        } catch (err) {
          console.error('failed to load applications', err);
        } finally {
          setLoading(false);
        }
      })();
    }, [id]);
  
    // Optional: call your backend to recompute rankings for this job.
    // This requires a server endpoint (Flask or Node) that triggers scoring for all applications.
    const onRecompute = async () => {
      if (!id) return;
      setRecomputing(true);
      try {
        const FLASK_BASE = (import.meta as any)?.env?.VITE_FLASK_BASE || 'http://127.0.0.1:5000';
        // Expect server route: POST /rank with { job_id }
        const res = await fetch(`${FLASK_BASE.replace(/\/$/, '')}/rank`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ job_id: id })
        });
        if (!res.ok) throw new Error(`rank request failed ${res.status}`);
        const json = await res.json();
        // server returns array of rankings; map into UI
        if (Array.isArray(json)) {
          setRows(json);
        } else {
          // fallback: refresh from Supabase
          const { data } = await supabase
            .from('applications')
            .select(`id, candidate_id, fitment_score, sub_scores, created_at, candidates(id, display_name, email)`)
            .eq('job_id', id);
          const mapped = (data || []).map((r: any) => ({
            candidate_id: r.candidate_id,
            display_name: r.candidates?.display_name ?? 'Unknown',
            email: r.candidates?.email ?? '—',
            fitment_score: r.fitment_score,
            sub_scores: r.sub_scores,
            application_id: r.id,
            applied_at: r.created_at
          }));
          mapped.sort((a: any, b: any) => (b.fitment_score || 0) - (a.fitment_score || 0));
          setRows(mapped);
        }
      } catch (err) {
        console.error('recompute failed', err);
      } finally {
        setRecomputing(false);
      }
    };
  
    const color = (v:number|undefined) => v===undefined? 'gray' : v>=80? 'green' : v>=60? 'amber' : 'red';
  
    if (loading) return <div className="p-4">Loading candidates…</div>;

  // Mock candidates data for this specific job
  const [candidates, setCandidates] = useState<Candidate[]>([
    {
      id: 1,
      name: "Sarah Chen",
      title: "Senior Frontend Developer",
      location: "San Francisco, CA",
      experience: "5+ years",
      yearsOfExperience: 5,
      skills: ["React", "TypeScript", "Node.js", "AWS", "GraphQL", "Jest"],
      matchScore: 95,
      attritionRisk: "Low",
      avatar: "SC",
      status: "Reviewed",
      salary: "$140k",
      education: "BS Computer Science, Stanford University",
      lastActive: "2 hours ago",
      responseRate: 96,
      interviewScore: 92,
      cultureFit: 88,
      technicalSkills: 95,
      softSkills: 90,
      email: "sarah.chen@email.com",
      phone: "+1 (555) 123-4567",
      linkedIn: "linkedin.com/in/sarachen",
      github: "github.com/sarachen",
      portfolio: "sarachen.dev",
      summary:
        "Passionate frontend developer with 5+ years of experience building scalable web applications. Specialized in React ecosystem and modern JavaScript.",
      appliedDate: "2 days ago",
      availability: "Immediate",
      expectedSalary: "$140k - $150k",
      noticePeriod: "2 weeks",
      rank: 1,
      recruiterNotes:
        "Excellent technical skills, great cultural fit. Strong candidate for senior role.",
    },
    {
      id: 2,
      name: "Marcus Rodriguez",
      title: "Full Stack Engineer",
      location: "Austin, TX",
      experience: "7+ years",
      yearsOfExperience: 7,
      skills: ["React", "Python", "PostgreSQL", "Docker", "AWS", "Redis"],
      matchScore: 92,
      attritionRisk: "Low",
      avatar: "MR",
      status: "Interviewing",
      salary: "$130k",
      education: "MS Software Engineering, MIT",
      lastActive: "1 day ago",
      responseRate: 88,
      interviewScore: 89,
      cultureFit: 85,
      technicalSkills: 92,
      softSkills: 87,
      email: "marcus.r@email.com",
      phone: "+1 (555) 234-5678",
      linkedIn: "linkedin.com/in/marcusrodriguez",
      github: "github.com/mrodriguez",
      summary:
        "Full-stack engineer with expertise in Python and modern web technologies. Strong background in distributed systems.",
      appliedDate: "3 days ago",
      availability: "1 month",
      expectedSalary: "$130k - $145k",
      noticePeriod: "1 month",
      rank: 2,
      recruiterNotes:
        "Interview scheduled for next week. Shows strong problem-solving skills.",
    },
    {
      id: 3,
      name: "Emily Watson",
      title: "Frontend Developer",
      location: "Remote",
      experience: "6+ years",
      yearsOfExperience: 6,
      skills: ["React", "JavaScript", "CSS", "HTML", "Redux", "Webpack"],
      matchScore: 88,
      attritionRisk: "Medium",
      avatar: "EW",
      status: "New",
      salary: "$120k",
      education: "BS Computer Science, UC Berkeley",
      lastActive: "5 hours ago",
      responseRate: 92,
      cultureFit: 90,
      technicalSkills: 87,
      softSkills: 95,
      email: "emily.watson@email.com",
      phone: "+1 (555) 345-6789",
      linkedIn: "linkedin.com/in/emilywatson",
      portfolio: "emilywatson.dev",
      summary:
        "Frontend specialist with strong design sense. Experienced in building responsive and accessible web applications.",
      appliedDate: "1 day ago",
      availability: "2 weeks",
      expectedSalary: "$120k - $135k",
      noticePeriod: "2 weeks",
      rank: 3,
    },
    {
      id: 4,
      name: "David Kim",
      title: "Software Engineer",
      location: "San Francisco, CA",
      experience: "4+ years",
      yearsOfExperience: 4,
      skills: ["React", "TypeScript", "Node.js", "MongoDB", "Express"],
      matchScore: 85,
      attritionRisk: "Low",
      avatar: "DK",
      status: "Reviewed",
      salary: "$115k",
      education: "BS Information Systems, UT Austin",
      lastActive: "1 hour ago",
      responseRate: 94,
      interviewScore: 85,
      cultureFit: 82,
      technicalSkills: 88,
      softSkills: 80,
      email: "david.kim@email.com",
      phone: "+1 (555) 456-7890",
      github: "github.com/dkim",
      summary:
        "Growing engineer with solid fundamentals and eagerness to learn. Good team player.",
      appliedDate: "4 days ago",
      availability: "Immediate",
      expectedSalary: "$115k - $125k",
      noticePeriod: "2 weeks",
      rank: 4,
    },
    {
      id: 5,
      name: "Lisa Anderson",
      title: "Senior Frontend Developer",
      location: "New York, NY",
      experience: "6+ years",
      yearsOfExperience: 6,
      skills: ["React", "Vue", "Angular", "JavaScript", "CSS", "Testing"],
      matchScore: 83,
      attritionRisk: "High",
      avatar: "LA",
      status: "New",
      salary: "$125k",
      education: "BS Software Engineering, Georgia Tech",
      lastActive: "4 hours ago",
      responseRate: 78,
      cultureFit: 75,
      technicalSkills: 86,
      softSkills: 82,
      email: "lisa.anderson@email.com",
      phone: "+1 (555) 789-0123",
      linkedIn: "linkedin.com/in/lisaanderson",
      summary:
        "Multi-framework frontend developer. Experience across React, Vue, and Angular ecosystems.",
      appliedDate: "5 days ago",
      availability: "1 month",
      expectedSalary: "$125k - $140k",
      noticePeriod: "1 month",
      rank: 5,
    },
    {
      id: 6,
      name: "James Thompson",
      title: "Frontend Engineer",
      location: "Remote",
      experience: "3+ years",
      yearsOfExperience: 3,
      skills: ["React", "JavaScript", "CSS", "HTML", "Git"],
      matchScore: 80,
      attritionRisk: "Medium",
      avatar: "JT",
      status: "Reviewed",
      salary: "$105k",
      education: "BS Computer Science, State University",
      lastActive: "6 hours ago",
      responseRate: 85,
      cultureFit: 88,
      technicalSkills: 78,
      softSkills: 90,
      email: "james.t@email.com",
      phone: "+1 (555) 678-9012",
      github: "github.com/jthompson",
      summary:
        "Junior developer with good fundamentals and strong communication skills. Quick learner.",
      appliedDate: "6 days ago",
      availability: "2 weeks",
      expectedSalary: "$105k - $115k",
      noticePeriod: "2 weeks",
      rank: 6,
    },
    {
      id: 7,
      name: "Alex Martinez",
      title: "Frontend Developer",
      location: "Los Angeles, CA",
      experience: "4+ years",
      yearsOfExperience: 4,
      skills: ["React", "TypeScript", "Next.js", "Tailwind", "GraphQL"],
      matchScore: 77,
      attritionRisk: "Low",
      avatar: "AM",
      status: "New",
      salary: "$110k",
      education: "BS Computer Science, UCLA",
      lastActive: "2 days ago",
      responseRate: 80,
      cultureFit: 80,
      technicalSkills: 82,
      softSkills: 75,
      email: "alex.martinez@email.com",
      phone: "+1 (555) 890-1234",
      github: "github.com/amartinez",
      portfolio: "alexmartinez.dev",
      summary:
        "Modern stack developer with focus on Next.js and TypeScript. Building production apps.",
      appliedDate: "1 week ago",
      availability: "3 weeks",
      expectedSalary: "$110k - $120k",
      noticePeriod: "2 weeks",
      rank: 7,
    },
    {
      id: 8,
      name: "Rachel Foster",
      title: "Software Developer",
      location: "Seattle, WA",
      experience: "2+ years",
      yearsOfExperience: 2,
      skills: ["React", "JavaScript", "HTML", "CSS", "Redux"],
      matchScore: 72,
      attritionRisk: "Medium",
      avatar: "RF",
      status: "Rejected",
      salary: "$95k",
      education: "BS Computer Science, University of Washington",
      lastActive: "1 week ago",
      responseRate: 70,
      cultureFit: 78,
      technicalSkills: 72,
      softSkills: 85,
      email: "rachel.foster@email.com",
      phone: "+1 (555) 901-2345",
      summary:
        "Entry-level developer with 2 years experience. Looking to grow in frontend development.",
      appliedDate: "1 week ago",
      availability: "Immediate",
      expectedSalary: "$95k - $105k",
      noticePeriod: "Immediate",
      rank: 8,
      recruiterNotes:
        "Not enough experience for senior role. Better fit for mid-level position.",
    },
  ]);

  // Filter and sort candidates
  const filteredCandidates = candidates
    .filter((candidate) => {
      const matchesSearch =
        candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        candidate.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        candidate.skills.some((skill) =>
          skill.toLowerCase().includes(searchTerm.toLowerCase())
        );

      const matchesStatus =
        filterStatus === "all" || candidate.status === filterStatus;

      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "rank":
          return (a.rank || 999) - (b.rank || 999);
        case "matchScore":
          return b.matchScore - a.matchScore;
        case "appliedDate":
          return (
            new Date(b.appliedDate).getTime() -
            new Date(a.appliedDate).getTime()
          );
        case "name":
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

  const updateCandidateStatus = (
    candidateId: number,
    newStatus: Candidate["status"]
  ) => {
    setCandidates((prev) =>
      prev.map((c) => (c.id === candidateId ? { ...c, status: newStatus } : c))
    );
  };

  const handleRejectCandidate = () => {
    if (candidateToReject) {
      updateCandidateStatus(candidateToReject.id, "Rejected");
      setShowRejectDialog(false);
      setCandidateToReject(null);
      setRejectionReason("");
    }
  };

  const getAttritionRiskColor = (risk: string) => {
    switch (risk) {
      case "Low":
        return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300";
      case "Medium":
        return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300";
      case "High":
        return "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300";
      default:
        return "";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "New":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300";
      case "Reviewed":
        return "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300";
      case "Interviewing":
        return "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300";
      case "Offered":
        return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300";
      case "Rejected":
        return "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300";
      default:
        return "";
    }
  };

  const getRankIcon = (rank?: number) => {
    if (!rank) return null;
    switch (rank) {
      case 1:
        return <Crown className="w-5 h-5 text-yellow-500" />;
      case 2:
        return <Medal className="w-5 h-5 text-gray-400" />;
      case 3:
        return <Award className="w-5 h-5 text-orange-600" />;
      default:
        return null;
    }
  };

  const statusCounts = {
    all: candidates.length,
    New: candidates.filter((c) => c.status === "New").length,
    Reviewed: candidates.filter((c) => c.status === "Reviewed").length,
    Interviewing: candidates.filter((c) => c.status === "Interviewing").length,
    Offered: candidates.filter((c) => c.status === "Offered").length,
    Rejected: candidates.filter((c) => c.status === "Rejected").length,
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b sticky top-0 z-40">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/recruiter-dashboard")}
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-xl">{job.title}</h1>
                <p className="text-xs text-muted-foreground">
                  {filteredCandidates.length} candidates • {job.department} •{" "}
                  {job.location}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button size="sm">
                <Send className="w-4 h-4 mr-2" />
                Bulk Email
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Job Overview Card */}
        <Card className="mb-6 border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <Badge
                    variant={
                      job.urgency === "High" ? "destructive" : "secondary"
                    }
                  >
                    {job.urgency} Priority
                  </Badge>
                  <Badge variant="outline">{job.status}</Badge>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="flex items-center text-sm">
                    <Briefcase className="w-4 h-4 mr-2 text-primary" />
                    <span className="text-muted-foreground">
                      {job.department}
                    </span>
                  </div>
                  <div className="flex items-center text-sm">
                    <MapPin className="w-4 h-4 mr-2 text-primary" />
                    <span className="text-muted-foreground">
                      {job.location}
                    </span>
                  </div>
                  <div className="flex items-center text-sm">
                    <DollarSign className="w-4 h-4 mr-2 text-primary" />
                    <span className="text-muted-foreground">{job.salary}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Users className="w-4 h-4 mr-2 text-primary" />
                    <span className="text-muted-foreground">
                      {candidates.length} applicants
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <Card
            className={`cursor-pointer transition-all ${
              filterStatus === "all"
                ? "border-primary shadow-md"
                : "hover:shadow-md"
            }`}
            onClick={() => setFilterStatus("all")}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total</p>
                  <p className="text-2xl font-medium">{statusCounts.all}</p>
                </div>
                <Users className="w-8 h-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card
            className={`cursor-pointer transition-all ${
              filterStatus === "New"
                ? "border-blue-500 shadow-md"
                : "hover:shadow-md"
            }`}
            onClick={() => setFilterStatus("New")}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">New</p>
                  <p className="text-2xl font-medium">{statusCounts.New}</p>
                </div>
                <Zap className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card
            className={`cursor-pointer transition-all ${
              filterStatus === "Reviewed"
                ? "border-purple-500 shadow-md"
                : "hover:shadow-md"
            }`}
            onClick={() => setFilterStatus("Reviewed")}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Reviewed</p>
                  <p className="text-2xl font-medium">
                    {statusCounts.Reviewed}
                  </p>
                </div>
                <Eye className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card
            className={`cursor-pointer transition-all ${
              filterStatus === "Interviewing"
                ? "border-orange-500 shadow-md"
                : "hover:shadow-md"
            }`}
            onClick={() => setFilterStatus("Interviewing")}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Interviewing</p>
                  <p className="text-2xl font-medium">
                    {statusCounts.Interviewing}
                  </p>
                </div>
                <MessageCircle className="w-8 h-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          <Card
            className={`cursor-pointer transition-all ${
              filterStatus === "Offered"
                ? "border-emerald-500 shadow-md"
                : "hover:shadow-md"
            }`}
            onClick={() => setFilterStatus("Offered")}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Offered</p>
                  <p className="text-2xl font-medium">{statusCounts.Offered}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-emerald-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Sort Bar */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="Search candidates..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rank">Rank (Best First)</SelectItem>
                  <SelectItem value="matchScore">Match Score</SelectItem>
                  <SelectItem value="appliedDate">Applied Date</SelectItem>
                  <SelectItem value="name">Name</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Candidates List */}
        <div className="space-y-4">
          {filteredCandidates.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Search className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg mb-2">No candidates found</h3>
                <p className="text-muted-foreground">
                  Try adjusting your search or filters
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredCandidates.map((candidate, index) => (
              <Card
                key={candidate.id}
                className={`hover:shadow-lg transition-all duration-200 ${
                  candidate.status === "Rejected" ? "opacity-60" : ""
                }`}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      {/* Rank Badge */}
                      <div className="flex flex-col items-center space-y-1">
                        {candidate.rank && candidate.rank <= 3 ? (
                          <div className="w-12 h-12 flex items-center justify-center">
                            {getRankIcon(candidate.rank)}
                          </div>
                        ) : (
                          <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center">
                            <span className="font-medium text-muted-foreground">
                              #{candidate.rank || index + 1}
                            </span>
                          </div>
                        )}
                      </div>

                      <Avatar className="w-16 h-16">
                        <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                          {candidate.avatar}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2 flex-wrap gap-y-1">
                          <h4 className="text-xl font-medium text-foreground">
                            {candidate.name}
                          </h4>
                          <Badge
                            className={`${
                              candidate.matchScore >= 90
                                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300"
                                : candidate.matchScore >= 85
                                ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                                : candidate.matchScore >= 80
                                ? "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300"
                                : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                            }`}
                          >
                            <Target className="w-3 h-3 mr-1" />
                            {candidate.matchScore}% Match
                          </Badge>
                          <Badge
                            className={getAttritionRiskColor(
                              candidate.attritionRisk
                            )}
                          >
                            {candidate.attritionRisk} Risk
                          </Badge>
                          <Badge className={getStatusColor(candidate.status)}>
                            {candidate.status}
                          </Badge>
                        </div>

                        <p className="text-lg text-muted-foreground mb-3">
                          {candidate.title}
                        </p>

                        {/* Key Metrics Row */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                          <div className="flex items-center text-sm">
                            <MapPin className="w-4 h-4 mr-2 text-primary flex-shrink-0" />
                            <span className="text-muted-foreground truncate">
                              {candidate.location}
                            </span>
                          </div>
                          <div className="flex items-center text-sm">
                            <Briefcase className="w-4 h-4 mr-2 text-blue-500 flex-shrink-0" />
                            <span className="text-muted-foreground">
                              {candidate.experience}
                            </span>
                          </div>
                          <div className="flex items-center text-sm">
                            <DollarSign className="w-4 h-4 mr-2 text-emerald-500 flex-shrink-0" />
                            <span className="text-muted-foreground">
                              {candidate.expectedSalary}
                            </span>
                          </div>
                          <div className="flex items-center text-sm">
                            <Clock className="w-4 h-4 mr-2 text-orange-500 flex-shrink-0" />
                            <span className="text-muted-foreground">
                              Applied {candidate.appliedDate}
                            </span>
                          </div>
                        </div>

                        {/* Skills */}
                        <div className="flex flex-wrap gap-2 mb-4">
                          {candidate.skills.slice(0, 5).map((skill) => (
                            <Badge key={skill} variant="outline">
                              {skill}
                            </Badge>
                          ))}
                          {candidate.skills.length > 5 && (
                            <Badge variant="outline">
                              +{candidate.skills.length - 5} more
                            </Badge>
                          )}
                        </div>

                        {/* Score Bars */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">
                                Technical
                              </span>
                              <span className="font-medium">
                                {candidate.technicalSkills}%
                              </span>
                            </div>
                            <Progress value={candidate.technicalSkills} />
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">
                                Culture Fit
                              </span>
                              <span className="font-medium">
                                {candidate.cultureFit}%
                              </span>
                            </div>
                            <Progress value={candidate.cultureFit} />
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">
                                Response Rate
                              </span>
                              <span className="font-medium">
                                {candidate.responseRate}%
                              </span>
                            </div>
                            <Progress value={candidate.responseRate} />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col space-y-2 ml-6">
                      <Button
                        size="sm"
                        onClick={() => setSelectedCandidate(candidate)}
                      >
                        View Profile
                      </Button>

                      {candidate.status !== "Rejected" && (
                        <>
                          {candidate.status === "New" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                updateCandidateStatus(candidate.id, "Reviewed")
                              }
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              Mark Reviewed
                            </Button>
                          )}

                          {(candidate.status === "Reviewed" ||
                            candidate.status === "New") && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                updateCandidateStatus(
                                  candidate.id,
                                  "Interviewing"
                                )
                              }
                            >
                              <Calendar className="w-4 h-4 mr-2" />
                              Schedule Interview
                            </Button>
                          )}

                          {candidate.status === "Interviewing" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                updateCandidateStatus(candidate.id, "Offered")
                              }
                            >
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Make Offer
                            </Button>
                          )}

                          <Button
                            size="sm"
                            variant="outline"
                            className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                            onClick={() => {
                              setCandidateToReject(candidate);
                              setShowRejectDialog(true);
                            }}
                          >
                            <X className="w-4 h-4 mr-2" />
                            Reject
                          </Button>
                        </>
                      )}

                      {candidate.status === "Rejected" && (
                        <Badge variant="destructive" className="justify-center">
                          Rejected
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Recruiter Notes */}
                  {candidate.recruiterNotes && (
                    <div className="mt-4 pt-4 border-t">
                      <div className="flex items-start space-x-2">
                        <FileText className="w-4 h-4 text-muted-foreground mt-1" />
                        <div>
                          <p className="text-sm font-medium mb-1">
                            Recruiter Notes
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {candidate.recruiterNotes}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Candidate Detail Dialog */}
      <Dialog
        open={!!selectedCandidate}
        onOpenChange={() => setSelectedCandidate(null)}
      >
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedCandidate && (
            <>
              <DialogHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-4">
                    <Avatar className="w-20 h-20">
                      <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                        {selectedCandidate.avatar}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <DialogTitle className="text-2xl">
                        {selectedCandidate.name}
                      </DialogTitle>
                      <DialogDescription className="text-lg">
                        {selectedCandidate.title}
                      </DialogDescription>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge
                          className={`${
                            selectedCandidate.matchScore >= 90
                              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300"
                              : "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                          }`}
                        >
                          {selectedCandidate.matchScore}% Match
                        </Badge>
                        <Badge
                          className={getAttritionRiskColor(
                            selectedCandidate.attritionRisk
                          )}
                        >
                          {selectedCandidate.attritionRisk} Attrition Risk
                        </Badge>
                        <Badge
                          className={getStatusColor(selectedCandidate.status)}
                        >
                          {selectedCandidate.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </DialogHeader>

              <Tabs defaultValue="overview" className="mt-6">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="experience">Experience</TabsTrigger>
                  <TabsTrigger value="skills">Skills</TabsTrigger>
                  <TabsTrigger value="contact">Contact</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6 mt-6">
                  {/* Summary */}
                  <div>
                    <h4 className="font-medium mb-2">Summary</h4>
                    <p className="text-muted-foreground">
                      {selectedCandidate.summary}
                    </p>
                  </div>

                  {/* Key Stats */}
                  <div className="grid grid-cols-2 gap-4">
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-muted-foreground">
                              Match Score
                            </p>
                            <p className="text-2xl font-medium">
                              {selectedCandidate.matchScore}%
                            </p>
                          </div>
                          <Target className="w-8 h-8 text-primary" />
                        </div>
                        <Progress
                          value={selectedCandidate.matchScore}
                          className="mt-2"
                        />
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-muted-foreground">
                              Technical Skills
                            </p>
                            <p className="text-2xl font-medium">
                              {selectedCandidate.technicalSkills}%
                            </p>
                          </div>
                          <Award className="w-8 h-8 text-blue-500" />
                        </div>
                        <Progress
                          value={selectedCandidate.technicalSkills}
                          className="mt-2"
                        />
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-muted-foreground">
                              Culture Fit
                            </p>
                            <p className="text-2xl font-medium">
                              {selectedCandidate.cultureFit}%
                            </p>
                          </div>
                          <Star className="w-8 h-8 text-emerald-500" />
                        </div>
                        <Progress
                          value={selectedCandidate.cultureFit}
                          className="mt-2"
                        />
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-muted-foreground">
                              Response Rate
                            </p>
                            <p className="text-2xl font-medium">
                              {selectedCandidate.responseRate}%
                            </p>
                          </div>
                          <MessageCircle className="w-8 h-8 text-orange-500" />
                        </div>
                        <Progress
                          value={selectedCandidate.responseRate}
                          className="mt-2"
                        />
                      </CardContent>
                    </Card>
                  </div>

                  {/* Quick Info */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-2 text-muted-foreground" />
                        <span className="text-sm">
                          {selectedCandidate.location}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <DollarSign className="w-4 h-4 mr-2 text-muted-foreground" />
                        <span className="text-sm">
                          {selectedCandidate.expectedSalary}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <Briefcase className="w-4 h-4 mr-2 text-muted-foreground" />
                        <span className="text-sm">
                          {selectedCandidate.experience}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-2 text-muted-foreground" />
                        <span className="text-sm">
                          Available: {selectedCandidate.availability}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-2 text-muted-foreground" />
                        <span className="text-sm">
                          Notice: {selectedCandidate.noticePeriod}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <GraduationCap className="w-4 h-4 mr-2 text-muted-foreground" />
                        <span className="text-sm">
                          {selectedCandidate.education}
                        </span>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="experience" className="space-y-6 mt-6">
                  <div>
                    <h4 className="font-medium mb-2">Education</h4>
                    <div className="flex items-center p-3 bg-muted rounded-lg">
                      <GraduationCap className="w-5 h-5 mr-3 text-primary" />
                      <span>{selectedCandidate.education}</span>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Application Details</h4>
                    <div className="space-y-2">
                      <div className="flex items-center p-3 bg-muted rounded-lg">
                        <Calendar className="w-5 h-5 mr-3 text-primary" />
                        <div>
                          <p className="text-sm font-medium">Applied Date</p>
                          <p className="text-sm text-muted-foreground">
                            {selectedCandidate.appliedDate}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center p-3 bg-muted rounded-lg">
                        <Clock className="w-5 h-5 mr-3 text-primary" />
                        <div>
                          <p className="text-sm font-medium">Notice Period</p>
                          <p className="text-sm text-muted-foreground">
                            {selectedCandidate.noticePeriod}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="skills" className="space-y-6 mt-6">
                  <div>
                    <h4 className="font-medium mb-3">Skills Assessment</h4>
                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span>Technical Skills</span>
                          <span className="font-medium">
                            {selectedCandidate.technicalSkills}%
                          </span>
                        </div>
                        <Progress value={selectedCandidate.technicalSkills} />
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span>Soft Skills</span>
                          <span className="font-medium">
                            {selectedCandidate.softSkills}%
                          </span>
                        </div>
                        <Progress value={selectedCandidate.softSkills} />
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span>Culture Fit</span>
                          <span className="font-medium">
                            {selectedCandidate.cultureFit}%
                          </span>
                        </div>
                        <Progress value={selectedCandidate.cultureFit} />
                      </div>
                      {selectedCandidate.interviewScore && (
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span>Interview Score</span>
                            <span className="font-medium">
                              {selectedCandidate.interviewScore}%
                            </span>
                          </div>
                          <Progress value={selectedCandidate.interviewScore} />
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-3">Technical Skills</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedCandidate.skills.map((skill) => (
                        <Badge key={skill} variant="secondary">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="contact" className="space-y-6 mt-6">
                  <div className="space-y-4">
                    <div className="flex items-center p-4 bg-muted rounded-lg">
                      <Mail className="w-5 h-5 mr-3 text-primary" />
                      <div>
                        <p className="text-sm text-muted-foreground">Email</p>
                        <p>{selectedCandidate.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center p-4 bg-muted rounded-lg">
                      <Phone className="w-5 h-5 mr-3 text-primary" />
                      <div>
                        <p className="text-sm text-muted-foreground">Phone</p>
                        <p>{selectedCandidate.phone}</p>
                      </div>
                    </div>

                    {selectedCandidate.linkedIn && (
                      <div className="flex items-center p-4 bg-muted rounded-lg">
                        <Linkedin className="w-5 h-5 mr-3 text-primary" />
                        <div>
                          <p className="text-sm text-muted-foreground">
                            LinkedIn
                          </p>
                          <p>{selectedCandidate.linkedIn}</p>
                        </div>
                      </div>
                    )}

                    {selectedCandidate.github && (
                      <div className="flex items-center p-4 bg-muted rounded-lg">
                        <Github className="w-5 h-5 mr-3 text-primary" />
                        <div>
                          <p className="text-sm text-muted-foreground">
                            GitHub
                          </p>
                          <p>{selectedCandidate.github}</p>
                        </div>
                      </div>
                    )}

                    {selectedCandidate.portfolio && (
                      <div className="flex items-center p-4 bg-muted rounded-lg">
                        <Globe className="w-5 h-5 mr-3 text-primary" />
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Portfolio
                          </p>
                          <p>{selectedCandidate.portfolio}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button className="flex-1">
                      <Send className="w-4 h-4 mr-2" />
                      Send Message
                    </Button>
                    <Button variant="outline" className="flex-1">
                      <Calendar className="w-4 h-4 mr-2" />
                      Schedule Interview
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Reject Candidate Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Candidate</DialogTitle>
            <DialogDescription>
              Are you sure you want to reject {candidateToReject?.name}?
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="reason">Rejection Reason (Optional)</Label>
              <Textarea
                id="reason"
                placeholder="Enter reason for rejection..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowRejectDialog(false);
                setCandidateToReject(null);
                setRejectionReason("");
              }}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleRejectCandidate}>
              Confirm Rejection
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
