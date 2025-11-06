import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Separator } from './ui/separator';
import { Progress } from './ui/progress';
import {
  User,
  Briefcase,
  GraduationCap,
  Code,
  Award,
  MapPin,
  Mail,
  Phone,
  DollarSign,
  Calendar,
  Plus,
  X,
  Github,
  Linkedin,
  Edit,
  Save,
  TrendingUp,
  Zap,
  ArrowLeft,
  CheckCircle,
  Star,
  Target
} from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../lib/AuthContext';

let toastSuccess: (msg: string) => void = (m: string) => alert(m);
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const s = require('sonner');
  if (s?.toast?.success) toastSuccess = (m: string) => s.toast.success(m);
} catch {}

export function JobSeekerProfile() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  const [profileData, setProfileData] = useState<any>(null);
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [skillInput, setSkillInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const uid = user?.id ?? null;

  // UI progress / completion state (for the top progress card)
  const [completionPercentage, setCompletionPercentage] = useState<number>(72);
  const [animatedProgress, setAnimatedProgress] = useState<number>(0);

  // compute completion percentage when profileData changes
  useEffect(() => {
    if (!profileData) return;
    const checks = [
      !!profileData.basicInfo?.fullName,
      !!profileData.basicInfo?.contactEmail,
      !!profileData.basicInfo?.location,
      !!profileData.basicInfo?.phone,
      !!profileData.professional?.currentTitle,
      !!profileData.professional?.currentCompany,
      (profileData.skills?.technical?.length ?? 0) > 0,
      (profileData.experience?.length ?? 0) > 0,
      (profileData.education?.length ?? 0) > 0
    ];
    const filled = checks.filter(Boolean).length;
    const pct = Math.min(100, Math.round((filled / checks.length) * 100));
    setCompletionPercentage(pct);
  }, [profileData]);

  // animate progress bar
  useEffect(() => {
    const t = setTimeout(() => setAnimatedProgress(completionPercentage), 300);
    return () => clearTimeout(t);
  }, [completionPercentage]);

  useEffect(() => {
    if (!uid && !loading) {
      navigate('/login');
      return;
    }
    if (!uid) return;

    const load = async () => {
      setIsLoadingProfile(true);
      try {
        const { data, error } = await supabase
          .from('candidates')
          .select('*')
          .eq('id', uid)
          .maybeSingle();

        if (error) {
          console.error('fetch candidate', error);
          setProfileData(getEmptyProfileFromAuth(user));
        } else if (!data) {
          setProfileData(getEmptyProfileFromAuth(user));
        } else {
          // prefer flat columns (display_name, phone, location, current_title, etc.)
          // but fall back to jsonb shapes for compatibility
          const skillsObj = (() => {
            if (!data.skills) return { technical: [], soft: [], languages: [] };
            if (Array.isArray(data.skills)) return { technical: data.skills, soft: [], languages: [] };
            if (typeof data.skills === 'object') return data.skills;
            return { technical: [], soft: [], languages: [] };
          })();

          const normalized = {
            basicInfo: {
              fullName: data.display_name ?? data.basic_info?.fullName ?? user?.user_metadata?.full_name ?? '',
              location: data.location ?? data.basic_info?.location ?? '',
              contactEmail: data.email ?? data.basic_info?.contactEmail ?? user?.email ?? '',
              phone: data.phone ?? data.basic_info?.phone ?? ''
            },
            professional: {
              currentTitle: data.current_title ?? data.professional?.currentTitle ?? data.professional?.title ?? '',
              currentCompany: data.current_company ?? data.professional?.currentCompany ?? data.professional?.company ?? '',
              experienceLevel: data.experience_level ?? data.professional?.experienceLevel ?? '',
              expectedSalary: data.expected_salary ?? data.professional?.expectedSalary ?? '',
              workMode: data.work_mode ?? data.professional?.workMode ?? '',
              availability: data.availability ?? data.professional?.availability ?? ''
            },
            skills: skillsObj,
            experience: Array.isArray(data.experience) ? data.experience : [],
            education: Array.isArray(data.education) ? data.education : [],
            preferences: data.preferences ?? { jobTypes: [], industries: [], locations: [], companySize: [], benefits: [] },
            github: data.github ?? '',
            linkedin: data.linkedin ?? '',
            resume_url: data.resume_url ?? ''
          };
          setProfileData(normalized);
        }
      } catch (err) {
        console.error(err);
        setProfileData(getEmptyProfileFromAuth(user));
      } finally {
        setIsLoadingProfile(false);
      }
    };

    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uid, loading]);

  function getEmptyProfileFromAuth(authUser: any) {
    return {
      basicInfo: {
        fullName: authUser?.user_metadata?.full_name ?? authUser?.user_metadata?.fullName ?? '',
        location: '',
        contactEmail: authUser?.email ?? '',
        phone: ''
      },
      professional: {
        currentTitle: '',
        currentCompany: '',
        experienceLevel: '',
        expectedSalary: '',
        workMode: '',
        availability: ''
      },
      skills: { technical: [], soft: [], languages: [] },
      experience: [],
      education: [],
      preferences: { jobTypes: [], industries: [], locations: [], companySize: [], benefits: [] },
      github: '',
      linkedin: '',
      resume_url: ''
    };
  }

  const updateSection = (section: string, data: any) => {
    setProfileData((prev: any) => ({ ...prev, [section]: { ...prev[section], ...data } }));
  };

  const addSkill = (category: 'technical' | 'soft' | 'languages') => {
    if (!skillInput?.trim()) return;
    setProfileData((prev: any) => ({
      ...prev,
      skills: { ...prev.skills, [category]: [...(prev.skills?.[category] ?? []), skillInput.trim()] }
    }));
    setSkillInput('');
  };

  const removeSkill = (category: 'technical' | 'soft' | 'languages', index: number) => {
    setProfileData((prev: any) => ({
      ...prev,
      skills: { ...prev.skills, [category]: prev.skills[category].filter((_: any, i: number) => i !== index) }
    }));
  };

  const addExperience = () => {
    const newExperience = { title: '', company: '', duration: '', description: '', achievements: [] };
    setProfileData((prev: any) => ({ ...prev, experience: [...(prev.experience ?? []), newExperience] }));
  };

  const updateExperience = (index: number, data: any) => {
    setProfileData((prev: any) => ({
      ...prev,
      experience: (prev.experience ?? []).map((exp: any, i: number) => (i === index ? { ...exp, ...data } : exp))
    }));
  };

  const removeExperience = (index: number) => {
    setProfileData((prev: any) => ({ ...prev, experience: (prev.experience ?? []).filter((_: any, i: number) => i !== index) }));
  };

  const handleSave = async (section?: string) => {
    if (section) setEditingSection(null);
    if (!uid) return;
    setIsSaving(true);
    try {
      const skillsArray = [
        ...(profileData.skills?.technical ?? []),
        ...(profileData.skills?.soft ?? []),
        ...(profileData.skills?.languages ?? [])
      ];

      const row: any = {
        id: uid,
        // flat columns (preferred)
        display_name: profileData.basicInfo.fullName,
        email: profileData.basicInfo.contactEmail,
        phone: profileData.basicInfo.phone || null,
        location: profileData.basicInfo.location || null,
        current_title: profileData.professional.currentTitle || null,
        current_company: profileData.professional.currentCompany || null,
        experience_level: profileData.professional.experienceLevel || null,
        expected_salary: profileData.professional.expectedSalary || null,
        work_mode: profileData.professional.workMode || null,
        availability: profileData.professional.availability || null,
        // skills stored as flat array for compatibility
        skills: skillsArray,
        // DO NOT send basic_info / professional jsonb fields if they were removed from the DB
        // keep other top-level fields
        experience: profileData.experience,
        education: profileData.education,
        preferences: profileData.preferences,
        updated_at: new Date().toISOString()
      };

      // sanitize undefined values and ensure JSON serializable
      const sanitized = JSON.parse(JSON.stringify(row));

      console.debug('Upsert candidates payload:', sanitized);

      const { data, error, status } = await supabase
        .from('candidates')
        .upsert(sanitized, { onConflict: 'id', returning: 'minimal' });

      console.debug('Upsert response', { status, data, error });

      if (error) {
        // show full details for debugging
        console.error('save candidate error', error);
        alert('Save failed: ' + (error.message ?? JSON.stringify(error)));
      } else {
        // refresh from DB to ensure UI shows the canonical saved state
        try {
          const { data: fresh, error: freshErr } = await supabase
            .from('candidates')
            .select('*')
            .eq('id', uid)
            .maybeSingle();
          if (!freshErr && fresh) {
            // normalize skills like the loader
            const skillsObj = (() => {
              if (!fresh.skills) return { technical: [], soft: [], languages: [] };
              if (Array.isArray(fresh.skills)) return { technical: fresh.skills, soft: [], languages: [] };
              if (typeof fresh.skills === 'object') return fresh.skills;
              return { technical: [], soft: [], languages: [] };
            })();
            const normalizedFresh = {
              basicInfo: {
                fullName: fresh.display_name ?? fresh.basic_info?.fullName ?? user?.user_metadata?.full_name ?? '',
                location: fresh.location ?? fresh.basic_info?.location ?? '',
                contactEmail: fresh.email ?? fresh.basic_info?.contactEmail ?? user?.email ?? '',
                phone: fresh.phone ?? fresh.basic_info?.phone ?? ''
              },
              professional: {
                currentTitle: fresh.current_title ?? fresh.professional?.currentTitle ?? fresh.professional?.title ?? '',
                currentCompany: fresh.current_company ?? fresh.professional?.currentCompany ?? fresh.professional?.company ?? '',
                experienceLevel: fresh.experience_level ?? fresh.professional?.experienceLevel ?? '',
                expectedSalary: fresh.expected_salary ?? fresh.professional?.expectedSalary ?? '',
                workMode: fresh.work_mode ?? fresh.professional?.workMode ?? '',
                availability: fresh.availability ?? fresh.professional?.availability ?? ''
              },
               skills: skillsObj,
               experience: Array.isArray(fresh.experience) ? fresh.experience : [],
               education: Array.isArray(fresh.education) ? fresh.education : [],
               preferences: fresh.preferences ?? { jobTypes: [], industries: [], locations: [], companySize: [], benefits: [] },
               github: fresh.github ?? '',
               linkedin: fresh.linkedin ?? '',
               resume_url: fresh.resume_url ?? ''
             };
             setProfileData(normalizedFresh);
           }
         } catch (e) {
           console.warn('refresh after save failed', e);
         }
         toastSuccess('Profile saved');
       }
     } catch (err: any) {
       console.error('save candidate unexpected', err);
       alert('Unexpected error: ' + (err?.message ?? String(err)));
     } finally {
       setIsSaving(false);
     }
   };

   if (isLoadingProfile) {
     return <div className="p-8 text-center">Loading profile...</div>;
   }

   if (!profileData) {
     return <div className="p-8 text-center">No profile data</div>;
   }

   // Styled container/layout copied from your ProfilePage design (only styling/layout)
   // add extra top padding (pt-24) so sticky app header doesn't cover the top section
   return (
     <div className="min-h-screen bg-background max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-6">
       {/* Top header (small) */}
       <div className="mb-6 flex items-center justify-between w-full">
         <div className="flex items-center gap-4">
           <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
             <ArrowLeft className="w-4 h-4 mr-2" />
             Back to Dashboard
           </Button>
           <div>
             <h1 className="text-lg font-semibold text-foreground">Profile Management</h1>
             <p className="text-sm text-muted-foreground">Job Seeker Profile</p>
           </div>
         </div>
         <div className="flex items-center gap-4">
           <div className="text-right">
             <div className="text-2xl font-semibold text-primary">{animatedProgress}%</div>
             <div className="text-xs text-muted-foreground">Profile Completion</div>
           </div>
           <div>
             <Button variant="ghost" size="sm" onClick={() => { setEditingSection(null); handleSave(); }}>
               <Save className="w-4 h-4 mr-2" /> Save All
             </Button>
           </div>
         </div>
       </div>

       {/* Progress + Stats: use a grid so stats sits as a sibling (no overlay) */}
       <div className="mb-6 grid grid-cols-1 lg:grid-cols-[1fr_18rem] gap-6 items-start">
         <Card className="w-full overflow-visible z-0">
           <CardContent className="pt-4 pb-6">
             <div className="min-w-0">
               <div className="flex items-center gap-3">
                 <User className="w-5 h-5 text-primary" />
                 <div>
                   <div className="font-medium">Profile Completion</div>
                   <div className="text-sm text-muted-foreground">Complete your profile to get better matches and more visibility</div>
                 </div>
               </div>
               <div className="mt-4">
                 <Progress value={animatedProgress} className="h-2 w-full" />
               </div>
               <div className="flex items-center justify-between text-sm mt-3">
                 <span className="text-muted-foreground">{completionPercentage < 100 ? `${100 - completionPercentage}% to go` : 'Profile Complete!'}</span>
                 <span className="text-primary font-medium">{completionPercentage >= 100 ? 'All done!' : 'Keep going!'}</span>
               </div>
               <div className="flex flex-wrap gap-3 pt-4 border-t mt-4">
                 <div className="px-3 py-2 rounded-lg border bg-primary/10 text-primary"><CheckCircle className="w-4 h-4 mr-2 inline" /> Profile Pioneer</div>
                 <div className="px-3 py-2 rounded-lg border bg-muted/50 text-muted-foreground"><Star className="w-4 h-4 mr-2 inline" /> Skill Showcase</div>
                 <div className="px-3 py-2 rounded-lg border bg-muted/50 text-muted-foreground"><Award className="w-4 h-4 mr-2 inline" /> Experience Expert</div>
                 <div className="px-3 py-2 rounded-lg border bg-muted/50 text-muted-foreground"><Target className="w-4 h-4 mr-2 inline" /> Completion Champion</div>
               </div>
             </div>
           </CardContent>
         </Card>

         {/* stats card as a separate sibling to avoid overlay/position issues */}
         <Card className="w-full h-min">
           <CardContent className="p-4">
             <div className="text-sm text-muted-foreground">Profile Stats</div>
             <div className="mt-4 space-y-2">
               <div className="flex justify-between"><span className="text-sm text-muted-foreground">Profile Views</span><span className="font-medium">127</span></div>
               <div className="flex justify-between"><span className="text-sm text-muted-foreground">Job Matches</span><span className="font-medium">24</span></div>
               <div className="flex justify-between"><span className="text-sm text-muted-foreground">Applications</span><span className="font-medium">8</span></div>
             </div>
           </CardContent>
         </Card>
       </div>

       <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
         <div className="lg:col-span-8">
            <div className="space-y-6">
            {/* Header (matches ProfilePage header area styling) */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-semibold text-foreground">Your Profile</h2>
                <p className="text-sm text-muted-foreground">Job Seeker Profile</p>
              </div>
              <div className="space-x-2">
                <Button variant="ghost" size="sm" onClick={() => { setEditingSection(null); handleSave(); }} disabled={isSaving}>
                  <Save className="w-4 h-4 mr-2" /> Save All
                </Button>
              </div>
            </div>

            {/* Main profile content (tabs) */}
            <div className="bg-card rounded-lg shadow-sm">
              <div className="p-4">
                <Tabs defaultValue="basic" className="w-full">
                  {/* horizontal, scrollable tab list to avoid wrapping issues */}
                  <TabsList className="flex gap-2 overflow-x-auto scrollbar-hide py-1 mb-4">
                    <TabsTrigger value="basic" className="text-xs px-3 py-1 rounded-md">Basic Info</TabsTrigger>
                    <TabsTrigger value="professional" className="text-xs px-3 py-1 rounded-md">Professional</TabsTrigger>
                    <TabsTrigger value="skills" className="text-xs px-3 py-1 rounded-md">Skills</TabsTrigger>
                    <TabsTrigger value="experience" className="text-xs px-3 py-1 rounded-md">Experience</TabsTrigger>
                    <TabsTrigger value="education" className="text-xs px-3 py-1 rounded-md">Education</TabsTrigger>
                    <TabsTrigger value="preferences" className="text-xs px-3 py-1 rounded-md">Preferences</TabsTrigger>
                  </TabsList>

                  <TabsContent value="basic">
                    <Card>
                      <CardHeader className="flex items-center justify-between p-4">
                        <CardTitle className="flex items-center"><User className="w-4 h-4 mr-2" /> Basic Information</CardTitle>
                        <Button size="sm" onClick={() => setEditingSection(editingSection === 'basic' ? null : 'basic')}>
                          {editingSection === 'basic' ? <><Save className="w-3 h-3 mr-2" />Save</> : <><Edit className="w-3 h-3 mr-2" />Edit</>}
                        </Button>
                      </CardHeader>
                      <CardContent className="p-4 space-y-4">
                        {/* existing basic info markup (unchanged) */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label>Full Name</Label>
                            {editingSection === 'basic' ? <Input value={profileData.basicInfo.fullName} onChange={e => updateSection('basicInfo', { fullName: e.target.value })} /> : <p>{profileData.basicInfo.fullName}</p>}
                          </div>
                          <div>
                            <Label>Location</Label>
                            {editingSection === 'basic' ? <Input value={profileData.basicInfo.location} onChange={e => updateSection('basicInfo', { location: e.target.value })} /> : <p>{profileData.basicInfo.location}</p>}
                          </div>
                          <div>
                            <Label>Email</Label>
                            <p className="flex items-center gap-2"><Mail className="w-4 h-4" />{profileData.basicInfo.contactEmail}</p>
                          </div>
                          <div>
                            <Label>Phone</Label>
                            {editingSection === 'basic' ? <Input value={profileData.basicInfo.phone} onChange={e => updateSection('basicInfo', { phone: e.target.value })} /> : <p>{profileData.basicInfo.phone}</p>}
                          </div>
                        </div>

                        <Separator />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label>GitHub</Label>
                            {editingSection === 'basic' ? <Input value={profileData.github} onChange={e => setProfileData((p:any)=>({...p, github: e.target.value}))} /> : <p>{profileData.github}</p>}
                          </div>
                          <div>
                            <Label>LinkedIn</Label>
                            {editingSection === 'basic' ? <Input value={profileData.linkedin} onChange={e => setProfileData((p:any)=>({...p, linkedin: e.target.value}))} /> : <p>{profileData.linkedin}</p>}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="professional">
                    <Card>
                      <CardHeader className="flex items-center justify-between p-4">
                        <CardTitle className="flex items-center"><Briefcase className="w-4 h-4 mr-2" /> Professional</CardTitle>
                        <Button size="sm" onClick={() => setEditingSection(editingSection === 'professional' ? null : 'professional')}>
                          {editingSection === 'professional' ? <><Save className="w-3 h-3 mr-2" />Save</> : <><Edit className="w-3 h-3 mr-2" />Edit</>}
                        </Button>
                      </CardHeader>
                      <CardContent className="p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label>Current Title</Label>
                            {editingSection === 'professional' ? <Input value={profileData.professional.currentTitle} onChange={e => updateSection('professional', { currentTitle: e.target.value })} /> : <p>{profileData.professional.currentTitle}</p>}
                          </div>
                          <div>
                            <Label>Current Company</Label>
                            {editingSection === 'professional' ? <Input value={profileData.professional.currentCompany} onChange={e => updateSection('professional', { currentCompany: e.target.value })} /> : <p>{profileData.professional.currentCompany}</p>}
                          </div>
                          <div>
                            <Label>Experience Level</Label>
                            {editingSection === 'professional' ? (
                              <Select value={profileData.professional.experienceLevel} onValueChange={(v: string) => updateSection('professional', { experienceLevel: v })}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Entry Level">Entry Level</SelectItem>
                                  <SelectItem value="Mid Level">Mid Level</SelectItem>
                                  <SelectItem value="Senior Level">Senior Level</SelectItem>
                                </SelectContent>
                              </Select>
                            ) : <p>{profileData.professional.experienceLevel}</p>}
                          </div>
                          <div>
                            <Label>Expected Salary</Label>
                            {editingSection === 'professional' ? <Input value={profileData.professional.expectedSalary} onChange={e => updateSection('professional', { expectedSalary: e.target.value })} /> : <p>{profileData.professional.expectedSalary}</p>}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="skills">
                    <Card>
                      <CardHeader className="p-4">
                        <CardTitle className="flex items-center"><Code className="w-4 h-4 mr-2" /> Skills</CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 space-y-4">
                        <div className="flex items-center gap-2">
                          <Input placeholder="Add skill" value={skillInput} onChange={e => setSkillInput(e.target.value)} onKeyPress={e => e.key === 'Enter' && addSkill('technical')} />
                          <Button size="sm" onClick={() => addSkill('technical')}><Plus className="w-3 h-3" /></Button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {(profileData.skills?.technical ?? []).map((s: string, i: number) => (
                            <Badge key={i} className="flex items-center gap-2">
                              {s}
                              <Button variant="ghost" size="xs" onClick={() => removeSkill('technical', i)}><X className="w-3 h-3" /></Button>
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="experience">
                    <Card>
                      <CardHeader className="p-4 flex items-center justify-between">
                        <CardTitle className="flex items-center"><Briefcase className="w-4 h-4 mr-2" /> Experience</CardTitle>
                        <Button size="sm" onClick={addExperience}><Plus className="w-3 h-3 mr-2" />Add</Button>
                      </CardHeader>
                      <CardContent className="p-4 space-y-4">
                        {(profileData.experience ?? []).map((exp: any, idx: number) => (
                          <Card key={idx} className="p-3">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                              <Input value={exp.title} onChange={e => updateExperience(idx, { title: e.target.value })} placeholder="Title" />
                              <Input value={exp.company} onChange={e => updateExperience(idx, { company: e.target.value })} placeholder="Company" />
                              <Input value={exp.duration} onChange={e => updateExperience(idx, { duration: e.target.value })} placeholder="Duration" />
                            </div>
                            <Textarea value={exp.description} onChange={e => updateExperience(idx, { description: e.target.value })} placeholder="Description" rows={3} className="mt-3" />
                            <div className="flex justify-end mt-2">
                              <Button variant="ghost" size="sm" onClick={() => removeExperience(idx)}><X className="w-3 h-3" /></Button>
                            </div>
                          </Card>
                        ))}
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="education">
                    <Card>
                      <CardHeader className="p-4"><CardTitle><GraduationCap className="w-4 h-4 mr-2" /> Education</CardTitle></CardHeader>
                      <CardContent className="p-4">
                        {(profileData.education ?? []).map((edu: any, i: number) => (
                          <div key={i} className="p-3 border rounded mb-3">
                            <div className="font-medium">{edu.degree}</div>
                            <div className="text-sm text-muted-foreground">{edu.institution} • {edu.year}</div>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="preferences">
                    <Card>
                      <CardHeader className="p-4"><CardTitle><Award className="w-4 h-4 mr-2" /> Preferences</CardTitle></CardHeader>
                      <CardContent className="p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label>Job Types</Label>
                            <div className="flex flex-wrap gap-2">{(profileData.preferences?.jobTypes ?? []).map((t:string, i:number)=>(<Badge key={i}>{t}</Badge>))}</div>
                          </div>
                          <div>
                            <Label>Locations</Label>
                            <div className="flex flex-wrap gap-2">{(profileData.preferences?.locations ?? []).map((t:string,i:number)=>(<Badge key={i}>{t}</Badge>))}</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </div>

          {/* Right sidebar (styling only, you can populate with stats/tips if desired) */}
          <aside className="lg:col-span-4 space-y-6">
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-base flex items-center">
                  <TrendingUp className="w-4 h-4 mr-2 text-primary" />
                  Profile Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Profile Views</span>
                  <span className="font-medium">—</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Job Matches</span>
                  <span className="font-medium">—</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-base flex items-center">
                  <Zap className="w-4 h-4 mr-2 text-primary" />
                  Profile Tips
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-3">
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm font-medium text-blue-900 mb-1">Add a profile photo</p>
                  <p className="text-xs text-blue-700">Profiles with photos get more views</p>
                </div>
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>
    </div>
  );
}