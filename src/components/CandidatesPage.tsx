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
  ChevronDown,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { Checkbox } from "./ui/checkbox";
import { Slider } from "./ui/slider";
import { useNavigate } from "react-router-dom";
import { ThemeToggle } from "./ThemeToggle";

// interface CandidatesPageProps {
//   onBack: () => void;
// }

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
  status: string;
  salary: string;
  education: string;
  lastActive: string;
  responseRate: number;
  interviewScore?: number;
  employmentType: string;
  noticePeriod: string;
  availability: string;
  email: string;
  phone: string;
  linkedIn?: string;
  github?: string;
  portfolio?: string;
  summary: string;
  previousCompanies: string[];
  certifications: string[];
  yearsOfExperience: number;
  cultureFit: number;
  technicalSkills: number;
  softSkills: number;
  preferredLocation: string;
  willingToRelocate: boolean;
}

export function CandidatesPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(
    null
  );
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState("matchScore");
  const [filterMinMatchScore, setFilterMinMatchScore] = useState([0]);
  const [filterAttritionRisk, setFilterAttritionRisk] = useState<string[]>([]);
  const [filterLocation, setFilterLocation] = useState("");
  const [filterExperienceMin, setFilterExperienceMin] = useState([0]);
  const [filterStatus, setFilterStatus] = useState<string[]>([]);

  // Mock candidate data
  const allCandidates: Candidate[] = [
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
      status: "Available",
      salary: "$140k",
      education: "BS Computer Science, Stanford University",
      lastActive: "2 hours ago",
      responseRate: 96,
      interviewScore: 92,
      employmentType: "Full-time",
      noticePeriod: "2 weeks",
      availability: "Immediate",
      email: "sarah.chen@email.com",
      phone: "+1 (555) 123-4567",
      linkedIn: "linkedin.com/in/sarachen",
      github: "github.com/sarachen",
      portfolio: "sarachen.dev",
      summary:
        "Passionate frontend developer with 5+ years of experience building scalable web applications. Specialized in React ecosystem and modern JavaScript.",
      previousCompanies: ["Meta", "Airbnb", "Stripe"],
      certifications: ["AWS Certified Developer", "Google Cloud Professional"],
      cultureFit: 88,
      technicalSkills: 95,
      softSkills: 90,
      preferredLocation: "San Francisco, CA",
      willingToRelocate: false,
    },
    {
      id: 2,
      name: "Marcus Rodriguez",
      title: "Full Stack Engineer",
      location: "Remote",
      experience: "7+ years",
      yearsOfExperience: 7,
      skills: [
        "Python",
        "React",
        "PostgreSQL",
        "Docker",
        "Kubernetes",
        "Redis",
      ],
      matchScore: 92,
      attritionRisk: "Low",
      avatar: "MR",
      status: "Interviewing",
      salary: "$130k",
      education: "MS Software Engineering, MIT",
      lastActive: "1 day ago",
      responseRate: 88,
      interviewScore: 89,
      employmentType: "Full-time",
      noticePeriod: "1 month",
      availability: "1 month",
      email: "marcus.r@email.com",
      phone: "+1 (555) 234-5678",
      linkedIn: "linkedin.com/in/marcusrodriguez",
      github: "github.com/mrodriguez",
      summary:
        "Full-stack engineer with expertise in Python and modern web technologies. Strong background in distributed systems and cloud infrastructure.",
      previousCompanies: ["Google", "Amazon", "Microsoft"],
      certifications: ["Kubernetes CKA", "AWS Solutions Architect"],
      cultureFit: 85,
      technicalSkills: 92,
      softSkills: 87,
      preferredLocation: "Remote",
      willingToRelocate: true,
    },
    {
      id: 3,
      name: "Emily Watson",
      title: "Product Manager",
      location: "New York, NY",
      experience: "6+ years",
      yearsOfExperience: 6,
      skills: [
        "Product Strategy",
        "Analytics",
        "Agile",
        "Leadership",
        "User Research",
        "SQL",
      ],
      matchScore: 88,
      attritionRisk: "Medium",
      avatar: "EW",
      status: "Available",
      salary: "$120k",
      education: "MBA, Harvard Business School",
      lastActive: "5 hours ago",
      responseRate: 92,
      employmentType: "Full-time",
      noticePeriod: "2 weeks",
      availability: "2 weeks",
      email: "emily.watson@email.com",
      phone: "+1 (555) 345-6789",
      linkedIn: "linkedin.com/in/emilywatson",
      summary:
        "Strategic product manager with a proven track record of launching successful products. Expertise in data-driven decision making and cross-functional leadership.",
      previousCompanies: ["Spotify", "Netflix", "Uber"],
      certifications: ["Certified Scrum Product Owner", "Google Analytics"],
      cultureFit: 90,
      technicalSkills: 75,
      softSkills: 95,
      preferredLocation: "New York, NY",
      willingToRelocate: false,
    },
    {
      id: 4,
      name: "David Kim",
      title: "DevOps Engineer",
      location: "Austin, TX",
      experience: "4+ years",
      yearsOfExperience: 4,
      skills: ["AWS", "Terraform", "Jenkins", "Docker", "Python", "Bash"],
      matchScore: 87,
      attritionRisk: "Low",
      avatar: "DK",
      status: "Available",
      salary: "$115k",
      education: "BS Information Systems, UT Austin",
      lastActive: "1 hour ago",
      responseRate: 94,
      interviewScore: 85,
      employmentType: "Full-time",
      noticePeriod: "2 weeks",
      availability: "Immediate",
      email: "david.kim@email.com",
      phone: "+1 (555) 456-7890",
      github: "github.com/dkim",
      summary:
        "DevOps engineer focused on automation and infrastructure as code. Experience with cloud platforms and CI/CD pipelines.",
      previousCompanies: ["Dell", "IBM", "Oracle"],
      certifications: ["AWS DevOps Professional", "HashiCorp Terraform"],
      cultureFit: 82,
      technicalSkills: 88,
      softSkills: 80,
      preferredLocation: "Austin, TX",
      willingToRelocate: true,
    },
    {
      id: 5,
      name: "Priya Patel",
      title: "UX Designer",
      location: "Seattle, WA",
      experience: "5+ years",
      yearsOfExperience: 5,
      skills: [
        "Figma",
        "User Research",
        "Prototyping",
        "Design Systems",
        "HTML/CSS",
      ],
      matchScore: 90,
      attritionRisk: "High",
      avatar: "PP",
      status: "Passive",
      salary: "$110k",
      education: "BFA Design, Rhode Island School of Design",
      lastActive: "3 days ago",
      responseRate: 75,
      employmentType: "Full-time",
      noticePeriod: "1 month",
      availability: "1 month",
      email: "priya.patel@email.com",
      phone: "+1 (555) 567-8901",
      linkedIn: "linkedin.com/in/priyapatel",
      portfolio: "priyapatel.design",
      summary:
        "User-centered designer with expertise in creating intuitive digital experiences. Strong background in design systems and user research.",
      previousCompanies: ["Adobe", "Figma", "Dropbox"],
      certifications: ["Nielsen Norman Group UX Certification"],
      cultureFit: 92,
      technicalSkills: 85,
      softSkills: 93,
      preferredLocation: "Seattle, WA",
      willingToRelocate: false,
    },
    {
      id: 6,
      name: "James Thompson",
      title: "Backend Engineer",
      location: "Remote",
      experience: "8+ years",
      yearsOfExperience: 8,
      skills: ["Java", "Spring Boot", "Microservices", "MongoDB", "Kafka"],
      matchScore: 85,
      attritionRisk: "Medium",
      avatar: "JT",
      status: "Available",
      salary: "$135k",
      education: "BS Computer Engineering, Carnegie Mellon",
      lastActive: "6 hours ago",
      responseRate: 89,
      interviewScore: 87,
      employmentType: "Full-time",
      noticePeriod: "3 weeks",
      availability: "3 weeks",
      email: "james.t@email.com",
      phone: "+1 (555) 678-9012",
      github: "github.com/jthompson",
      summary:
        "Backend engineer specializing in microservices architecture and distributed systems. Deep expertise in Java ecosystem.",
      previousCompanies: ["LinkedIn", "PayPal", "eBay"],
      certifications: ["Oracle Java Certified Professional"],
      cultureFit: 80,
      technicalSkills: 90,
      softSkills: 82,
      preferredLocation: "Remote",
      willingToRelocate: true,
    },
    {
      id: 7,
      name: "Lisa Anderson",
      title: "Data Scientist",
      location: "Boston, MA",
      experience: "6+ years",
      yearsOfExperience: 6,
      skills: ["Python", "Machine Learning", "TensorFlow", "SQL", "R", "Spark"],
      matchScore: 93,
      attritionRisk: "Low",
      avatar: "LA",
      status: "Available",
      salary: "$125k",
      education: "PhD Data Science, MIT",
      lastActive: "4 hours ago",
      responseRate: 91,
      interviewScore: 94,
      employmentType: "Full-time",
      noticePeriod: "2 weeks",
      availability: "2 weeks",
      email: "lisa.anderson@email.com",
      phone: "+1 (555) 789-0123",
      linkedIn: "linkedin.com/in/lisaanderson",
      github: "github.com/landerson",
      summary:
        "Data scientist with PhD in machine learning. Proven track record of building production ML systems and leading data teams.",
      previousCompanies: ["IBM Research", "DeepMind", "OpenAI"],
      certifications: ["TensorFlow Developer Certificate", "AWS ML Specialty"],
      cultureFit: 87,
      technicalSkills: 96,
      softSkills: 88,
      preferredLocation: "Boston, MA",
      willingToRelocate: false,
    },
    {
      id: 8,
      name: "Alex Martinez",
      title: "Mobile Developer",
      location: "Los Angeles, CA",
      experience: "4+ years",
      yearsOfExperience: 4,
      skills: ["React Native", "Swift", "Kotlin", "Firebase", "REST APIs"],
      matchScore: 82,
      attritionRisk: "Medium",
      avatar: "AM",
      status: "Interviewing",
      salary: "$105k",
      education: "BS Computer Science, UCLA",
      lastActive: "2 days ago",
      responseRate: 86,
      employmentType: "Full-time",
      noticePeriod: "2 weeks",
      availability: "2 weeks",
      email: "alex.martinez@email.com",
      phone: "+1 (555) 890-1234",
      github: "github.com/amartinez",
      portfolio: "alexmartinez.dev",
      summary:
        "Mobile developer with experience building cross-platform applications. Strong focus on performance and user experience.",
      previousCompanies: ["Snap", "Instagram", "TikTok"],
      certifications: ["Google Associate Android Developer"],
      cultureFit: 84,
      technicalSkills: 83,
      softSkills: 85,
      preferredLocation: "Los Angeles, CA",
      willingToRelocate: true,
    },
  ];

  // Filter and sort candidates
  const filteredCandidates = allCandidates
    .filter((candidate) => {
      const matchesSearch =
        candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        candidate.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        candidate.skills.some((skill) =>
          skill.toLowerCase().includes(searchTerm.toLowerCase())
        );

      const matchesMatchScore = candidate.matchScore >= filterMinMatchScore[0];

      const matchesAttritionRisk =
        filterAttritionRisk.length === 0 ||
        filterAttritionRisk.includes(candidate.attritionRisk);

      const matchesLocation =
        !filterLocation ||
        candidate.location.toLowerCase().includes(filterLocation.toLowerCase());

      const matchesExperience =
        candidate.yearsOfExperience >= filterExperienceMin[0];

      const matchesStatus =
        filterStatus.length === 0 || filterStatus.includes(candidate.status);

      return (
        matchesSearch &&
        matchesMatchScore &&
        matchesAttritionRisk &&
        matchesLocation &&
        matchesExperience &&
        matchesStatus
      );
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "matchScore":
          return b.matchScore - a.matchScore;
        case "experience":
          return b.yearsOfExperience - a.yearsOfExperience;
        case "salary":
          return (
            parseInt(b.salary.replace(/\D/g, "")) -
            parseInt(a.salary.replace(/\D/g, ""))
          );
        case "name":
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

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

  const getAttritionRiskIcon = (risk: string) => {
    switch (risk) {
      case "Low":
        return CheckCircle;
      case "Medium":
        return AlertTriangle;
      case "High":
        return TrendingDown;
      default:
        return AlertTriangle;
    }
  };

  const clearFilters = () => {
    setFilterMinMatchScore([0]);
    setFilterAttritionRisk([]);
    setFilterLocation("");
    setFilterExperienceMin([0]);
    setFilterStatus([]);
  };

  const activeFilterCount =
    (filterMinMatchScore[0] > 0 ? 1 : 0) +
    filterAttritionRisk.length +
    (filterLocation ? 1 : 0) +
    (filterExperienceMin[0] > 0 ? 1 : 0) +
    filterStatus.length;

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
                <h1 className="text-xl">Browse Candidates</h1>
                <p className="text-xs text-muted-foreground">
                  {filteredCandidates.length} candidates found
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <ThemeToggle />
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filter Bar */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="Search by name, title, or skills..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <div className="flex gap-2">
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="matchScore">Match Score</SelectItem>
                    <SelectItem value="experience">Experience</SelectItem>
                    <SelectItem value="salary">Salary</SelectItem>
                    <SelectItem value="name">Name</SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  variant={showFilters ? "default" : "outline"}
                  onClick={() => setShowFilters(!showFilters)}
                  className="relative"
                >
                  <SlidersHorizontal className="w-4 h-4 mr-2" />
                  Filters
                  {activeFilterCount > 0 && (
                    <Badge className="ml-2 px-1.5 py-0.5 min-w-[20px] h-5">
                      {activeFilterCount}
                    </Badge>
                  )}
                </Button>
              </div>
            </div>

            {/* Filter Panel */}
            {showFilters && (
              <div className="mt-6 pt-6 border-t">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium">Filters</h3>
                  {activeFilterCount > 0 && (
                    <Button variant="ghost" size="sm" onClick={clearFilters}>
                      Clear all
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* Match Score Filter */}
                  <div className="space-y-2">
                    <Label>Min Match Score: {filterMinMatchScore[0]}%</Label>
                    <Slider
                      value={filterMinMatchScore}
                      onValueChange={setFilterMinMatchScore}
                      max={100}
                      step={5}
                      className="w-full"
                    />
                  </div>

                  {/* Experience Filter */}
                  <div className="space-y-2">
                    <Label>
                      Min Experience: {filterExperienceMin[0]} years
                    </Label>
                    <Slider
                      value={filterExperienceMin}
                      onValueChange={setFilterExperienceMin}
                      max={15}
                      step={1}
                      className="w-full"
                    />
                  </div>

                  {/* Location Filter */}
                  <div className="space-y-2">
                    <Label>Location</Label>
                    <Input
                      placeholder="Filter by location..."
                      value={filterLocation}
                      onChange={(e) => setFilterLocation(e.target.value)}
                    />
                  </div>

                  {/* Attrition Risk Filter */}
                  <div className="space-y-2">
                    <Label>Attrition Risk</Label>
                    <div className="space-y-2">
                      {["Low", "Medium", "High"].map((risk) => (
                        <div key={risk} className="flex items-center space-x-2">
                          <Checkbox
                            id={`risk-${risk}`}
                            checked={filterAttritionRisk.includes(risk)}
                            onCheckedChange={(checked: any) => {
                              if (checked) {
                                setFilterAttritionRisk([
                                  ...filterAttritionRisk,
                                  risk,
                                ]);
                              } else {
                                setFilterAttritionRisk(
                                  filterAttritionRisk.filter((r) => r !== risk)
                                );
                              }
                            }}
                          />
                          <label
                            htmlFor={`risk-${risk}`}
                            className="text-sm cursor-pointer"
                          >
                            {risk}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Status Filter */}
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <div className="space-y-2">
                      {["Available", "Interviewing", "Passive"].map(
                        (status) => (
                          <div
                            key={status}
                            className="flex items-center space-x-2"
                          >
                            <Checkbox
                              id={`status-${status}`}
                              checked={filterStatus.includes(status)}
                              onCheckedChange={(checked: any) => {
                                if (checked) {
                                  setFilterStatus([...filterStatus, status]);
                                } else {
                                  setFilterStatus(
                                    filterStatus.filter((s) => s !== status)
                                  );
                                }
                              }}
                            />
                            <label
                              htmlFor={`status-${status}`}
                              className="text-sm cursor-pointer"
                            >
                              {status}
                            </label>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
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
            filteredCandidates.map((candidate) => (
              <Card
                key={candidate.id}
                className="hover:shadow-lg transition-all duration-200 cursor-pointer"
                onClick={() => setSelectedCandidate(candidate)}
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
                                : "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300"
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
                            {React.createElement(
                              getAttritionRiskIcon(candidate.attritionRisk),
                              { className: "w-3 h-3 mr-1" }
                            )}
                            {candidate.attritionRisk} Attrition Risk
                          </Badge>
                          <Badge
                            variant={
                              candidate.status === "Available"
                                ? "default"
                                : "secondary"
                            }
                            className={
                              candidate.status === "Available"
                                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300"
                                : ""
                            }
                          >
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
                              {candidate.salary}
                            </span>
                          </div>
                          <div className="flex items-center text-sm">
                            <Clock className="w-4 h-4 mr-2 text-orange-500 flex-shrink-0" />
                            <span className="text-muted-foreground">
                              {candidate.availability}
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
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedCandidate(candidate);
                        }}
                      >
                        View Profile
                      </Button>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Heart className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Send className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
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
                              Attrition Risk
                            </p>
                            <p className="text-2xl font-medium">
                              {selectedCandidate.attritionRisk}
                            </p>
                          </div>
                          {React.createElement(
                            getAttritionRiskIcon(
                              selectedCandidate.attritionRisk
                            ),
                            { className: "w-8 h-8 text-primary" }
                          )}
                        </div>
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
                          {selectedCandidate.salary}
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
                    <h4 className="font-medium mb-3">Previous Companies</h4>
                    <div className="space-y-2">
                      {selectedCandidate.previousCompanies.map(
                        (company, index) => (
                          <div
                            key={index}
                            className="flex items-center p-3 bg-muted rounded-lg"
                          >
                            <Briefcase className="w-5 h-5 mr-3 text-primary" />
                            <span>{company}</span>
                          </div>
                        )
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-3">Certifications</h4>
                    <div className="space-y-2">
                      {selectedCandidate.certifications.map((cert, index) => (
                        <div
                          key={index}
                          className="flex items-center p-3 bg-muted rounded-lg"
                        >
                          <Award className="w-5 h-5 mr-3 text-primary" />
                          <span>{cert}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Education</h4>
                    <div className="flex items-center p-3 bg-muted rounded-lg">
                      <GraduationCap className="w-5 h-5 mr-3 text-primary" />
                      <span>{selectedCandidate.education}</span>
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
    </div>
  );
}
