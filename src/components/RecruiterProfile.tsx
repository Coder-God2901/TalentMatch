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
import {
  Building,
  User,
  Briefcase,
  Plus,
  Edit,
  Save,
  MapPin,
  Mail,
  Phone,
  Users,
  Award,
  Target,
  Calendar,
  TrendingUp,
  X,
  Zap
} from 'lucide-react';
import { Progress } from './ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
// import { ThemeToggle } from './ThemeToggle';
import { CheckCircle, Star, ArrowLeft } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../lib/AuthContext';

let toastSuccess: (msg: string) => void = (m: string) => alert(m);
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const s = require('sonner');
  if (s?.toast?.success) toastSuccess = (m: string) => s.toast.success(m);
} catch {}

export function RecruiterProfile() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const uid = user?.id ?? null;

  // list of columns in public.recruiters (fetched once)
  const [allowedColumns, setAllowedColumns] = useState<string[]>([]);

  const [profileData, setProfileData] = useState<any>(null);
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [specializationInput, setSpecializationInput] = useState('');
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!uid && !loading) {
      navigate('/login'); return;
    }
    if (!uid) return;

    // fetch column names for recruiters table so we only send supported fields
    // Note: some Supabase/PostgREST projects don't expose information_schema via REST.
    // Try to load it; if it fails, fall back to a hard-coded whitelist (from your DDL).
    const loadColumns = async () => {
      try {
        const { data: cols, error } = await supabase
          .from('information_schema.columns')
          .select('column_name')
          .eq('table_name', 'recruiters')
          .eq('table_schema', 'public');
        if (!error && Array.isArray(cols) && cols.length > 0) {
          setAllowedColumns(cols.map((c: any) => c.column_name));
          return;
        }
        console.warn('could not load recruiters columns via REST, falling back to whitelist', error);
      } catch (e) {
        console.warn('loadColumns failed (REST not available)', e);
      }

      // Fallback whitelist — update if you alter the recruiters table
      setAllowedColumns([
        'id',
        'display_name',
        'email',
        'company_name',
        'position_of_power',
        'linkedin',
        'created_at',
        'company',
        'recruiting',
        'preferences',
        'updated_at',
        'specializations'
      ]);
    };
    loadColumns();

    const load = async () => {
      setIsLoadingProfile(true);
      try {
        const { data, error } = await supabase.from('recruiters').select('*').eq('id', uid).maybeSingle();
        if (error) {
          console.error('fetch recruiter', error);
          setProfileData(getEmptyRecruiter(user));
        } else if (!data) {
          setProfileData(getEmptyRecruiter(user));
        } else {
          // prefer flat columns (company_name, position_of_power, phone, location) and fall back to jsonb fields
          const normalized = {
            basicInfo: {
              fullName: data.display_name ?? data.basic_info?.fullName ?? user?.user_metadata?.full_name ?? '',
              jobTitle: data.position_of_power ?? data.job_title ?? data.basic_info?.jobTitle ?? '',
              location: data.location ?? data.basic_info?.location ?? '',
              contactEmail: data.email ?? data.basic_info?.contactEmail ?? user?.email ?? '',
              phone: data.phone ?? data.basic_info?.phone ?? ''
            },
            company: data.company ?? {
              name: data.company_name ?? data.company?.name ?? '',
              industry: data.industry ?? data.company?.industry ?? '',
              size: data.company_size ?? data.company?.size ?? '',
              website: data.website ?? data.company?.website ?? '',
              description: data.company_description ?? data.company?.description ?? ''
            },
            recruiting: data.recruiting ?? {
              specializations: data.specializations ?? [],
              experienceLevel: data.experience_level ?? '',
              placementsPerYear: data.placements_per_year ?? 0,
              averageTimeToHire: data.average_time_to_hire ?? ''
            },
            preferences: data.preferences ?? {
              candidateTypes: [],
              industries: [],
              locations: [],
              hiringVolume: ''
            }
          };
          setProfileData(normalized);
        }
      } catch (err) {
        console.error(err);
        setProfileData(getEmptyRecruiter(user));
      } finally {
        setIsLoadingProfile(false);
      }
    };

    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uid, loading]);

  function getEmptyRecruiter(authUser: any) {
    return {
      basicInfo: {
        fullName: authUser?.user_metadata?.full_name ?? '',
        jobTitle: '',
        location: '',
        contactEmail: authUser?.email ?? '',
        phone: ''
      },
      company: { name: '', industry: '', size: '', website: '', description: '' },
      recruiting: { specializations: [], experienceLevel: '', placementsPerYear: 0, averageTimeToHire: '' },
      preferences: { candidateTypes: [], industries: [], locations: [], hiringVolume: '' }
    };
  }

  const updateSection = (section: string, data: any) => {
    setProfileData((prev: any) => ({ ...prev, [section]: { ...prev[section], ...data } }));
  };

  const addSpecialization = () => {
    if (!specializationInput?.trim()) return;
    setProfileData((prev:any) => ({ ...prev, recruiting: { ...prev.recruiting, specializations: [...(prev.recruiting.specializations ?? []), specializationInput.trim()] } }));
    setSpecializationInput('');
  };

  const removeSpecialization = (index: number) => {
    setProfileData((prev:any) => ({ ...prev, recruiting: { ...prev.recruiting, specializations: prev.recruiting.specializations.filter((_:any,i:number)=>i!==index) } }));
  };

  const handleSave = async (section?: string) => {
    if (section) setEditingSection(null);
    if (!uid) return;
    setIsSaving(true);
    try {
      const row: any = {
        id: uid,
        // flat fields preferred
        display_name: profileData.basicInfo.fullName,
        email: profileData.basicInfo.contactEmail,
        phone: profileData.basicInfo.phone || null,
        location: profileData.basicInfo.location || null,
        company_name: profileData.company.name || null,
        position_of_power: profileData.basicInfo.jobTitle || null,
        // keep structured blobs too
        company: profileData.company,
        recruiting: profileData.recruiting,
        preferences: profileData.preferences,
        updated_at: new Date().toISOString()
      };

      // sanitize: remove keys not present in the recruiters table
      const candidate = JSON.parse(JSON.stringify(row));
      let sanitized: any = {};
      const cols = (allowedColumns && allowedColumns.length > 0) ? allowedColumns : [
        'id','display_name','email','company_name','position_of_power','linkedin','created_at','company','recruiting','preferences','updated_at','specializations'
      ];
      for (const k of Object.keys(candidate)) {
        if (cols.includes(k)) {
          // ensure nulls are explicit for absent optional fields
          sanitized[k] = candidate[k] === undefined ? null : candidate[k];
        } else {
          console.debug('Stripping unsupported key before upsert:', k);
        }
      }
      console.debug('Upsert recruiters payload (sanitized):', sanitized);

      const { data, error, status } = await supabase
        .from('recruiters')
        .upsert(sanitized, { onConflict: 'id', returning: 'minimal' });

      console.debug('Upsert response', { status, data, error });

      if (error) {
        console.error('save recruiter error', error);
        alert('Save failed: ' + (error.message ?? JSON.stringify(error)));
      } else {
        // refresh from DB to reflect canonical saved state
        try {
          const { data: fresh, error: freshErr } = await supabase
            .from('recruiters')
            .select('*')
            .eq('id', uid)
            .maybeSingle();
          if (!freshErr && fresh) {
            const normalized = {
              basicInfo: {
                fullName: fresh.display_name ?? fresh.basic_info?.fullName ?? user?.user_metadata?.full_name ?? '',
                jobTitle: fresh.position_of_power ?? fresh.job_title ?? fresh.basic_info?.jobTitle ?? '',
                location: fresh.location ?? fresh.basic_info?.location ?? '',
                contactEmail: fresh.email ?? fresh.basic_info?.contactEmail ?? user?.email ?? '',
                phone: fresh.phone ?? fresh.basic_info?.phone ?? ''
              },
              company: fresh.company ?? {
                name: fresh.company_name ?? fresh.company?.name ?? '',
                industry: fresh.industry ?? fresh.company?.industry ?? '',
                size: fresh.company_size ?? fresh.company?.size ?? '',
                website: fresh.website ?? fresh.company?.website ?? '',
                description: fresh.company_description ?? fresh.company?.description ?? ''
              },
              recruiting: fresh.recruiting ?? {
                specializations: fresh.specializations ?? [],
                experienceLevel: fresh.experience_level ?? '',
                placementsPerYear: fresh.placements_per_year ?? 0,
                averageTimeToHire: fresh.average_time_to_hire ?? ''
              },
              preferences: fresh.preferences ?? {
                candidateTypes: [],
                industries: [],
                locations: [],
                hiringVolume: ''
              }
            };
            setProfileData(normalized);
          }
        } catch (e) {
          console.warn('refresh recruiter after save failed', e);
        }
        toastSuccess('Profile saved');
      }
    } catch (err: any) {
      console.error('save recruiter unexpected', err);
      alert('Unexpected: ' + (err?.message ?? String(err)));
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoadingProfile) return <div className="p-8 text-center">Loading...</div>;
  if (!profileData) return <div className="p-8 text-center">No profile</div>;

  // Header + progress area matching ProfilePage styling
  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b sticky top-0 z-40">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={() => navigate(-1)} className="mr-2">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
              <div>
                <h1 className="font-semibold text-foreground">Profile Management</h1>
                <p className="text-sm text-muted-foreground">Recruiter Profile</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {/* <ThemeToggle /> */}
              <div className="flex items-center space-x-3 pl-3 border-l">
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                    {user?.user_metadata?.full_name?.charAt(0)?.toUpperCase?.() ?? 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden sm:block">
                  <p className="text-sm font-medium text-foreground">{user?.user_metadata?.full_name ?? user?.email}</p>
                  <p className="text-xs text-muted-foreground">Recruiter</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Progress + Stats grid */}
        <div className="mb-6 grid grid-cols-1 lg:grid-cols-[1fr_18rem] gap-6 items-start">
          <Card className="w-full">
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
                  <Progress value={/* reuse a computed % if you have one */ 56} className="h-2 w-full" />
                </div>
                <div className="flex items-center justify-between text-sm mt-3">
                  <span className="text-muted-foreground">44% to go</span>
                  <span className="text-primary font-medium">Keep going!</span>
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

          <Card className="w-full h-min">
            <CardContent className="p-4">
              <div className="text-sm text-muted-foreground">Profile Stats</div>
              <div className="mt-4 space-y-2">
                <div className="flex justify-between"><span className="text-sm text-muted-foreground">Profile Views</span><span className="font-medium">127</span></div>
                <div className="flex justify-between"><span className="text-sm text-muted-foreground">Candidate Matches</span><span className="font-medium">24</span></div>
                <div className="flex justify-between"><span className="text-sm text-muted-foreground">Active Jobs</span><span className="font-medium">8</span></div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8">
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-semibold text-foreground">Recruiter Profile</h2>
                  <p className="text-sm text-muted-foreground">Manage your company & hiring preferences</p>
                </div>
                <div>
                  <Button variant="ghost" size="sm" onClick={() => { handleSave(); }}>
                    <Save className="w-4 h-4 mr-2" /> Save
                  </Button>
                </div>
              </div>

              <div className="bg-card rounded-lg shadow-sm">
                <div className="p-4">
                  <Tabs defaultValue="basic" className="w-full">
                    <TabsList className="flex gap-2 overflow-x-auto scrollbar-hide py-1 mb-4">
                      <TabsTrigger value="basic" className="text-xs px-3 py-1 rounded-md">Basic</TabsTrigger>
                      <TabsTrigger value="company" className="text-xs px-3 py-1 rounded-md">Company</TabsTrigger>
                      <TabsTrigger value="recruiting" className="text-xs px-3 py-1 rounded-md">Recruiting</TabsTrigger>
                      <TabsTrigger value="preferences" className="text-xs px-3 py-1 rounded-md">Preferences</TabsTrigger>
                    </TabsList>

                    {/* Basic tab */}
                    <TabsContent value="basic">
                      <Card>
                        <CardHeader className="p-4 flex items-center justify-between">
                          <CardTitle className="flex items-center"><User className="w-4 h-4 mr-2" /> Basic</CardTitle>
                          <Button size="sm" onClick={() => setEditingSection(editingSection === 'basic' ? null : 'basic')}>
                            {editingSection === 'basic' ? <><Save className="w-3 h-3 mr-2" />Save</> : <><Edit className="w-3 h-3 mr-2" />Edit</>}
                          </Button>
                        </CardHeader>
                        <CardContent className="p-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div><Label>Full Name</Label>{editingSection === 'basic' ? <Input value={profileData.basicInfo.fullName} onChange={e => updateSection('basicInfo', { fullName: e.target.value })} /> : <p>{profileData.basicInfo.fullName}</p>}</div>
                            <div><Label>Job Title</Label>{editingSection === 'basic' ? <Input value={profileData.basicInfo.jobTitle} onChange={e => updateSection('basicInfo', { jobTitle: e.target.value })} /> : <p>{profileData.basicInfo.jobTitle}</p>}</div>
                            <div><Label>Location</Label>{editingSection === 'basic' ? <Input value={profileData.basicInfo.location} onChange={e => updateSection('basicInfo', { location: e.target.value })} /> : <p>{profileData.basicInfo.location}</p>}</div>
                            <div><Label>Email</Label><p className="flex items-center gap-2"><Mail className="w-4 h-4" />{profileData.basicInfo.contactEmail}</p></div>
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>

                    {/* Company tab */}
                    <TabsContent value="company">
                      <Card>
                        <CardHeader className="p-4">
                          <CardTitle className="flex items-center"><Building className="w-4 h-4 mr-2" /> Company</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div><Label>Company Name</Label>{editingSection === 'company' ? <Input value={profileData.company.name} onChange={e => updateSection('company', { name: e.target.value })} /> : <p>{profileData.company.name}</p>}</div>
                            <div><Label>Industry</Label>{editingSection === 'company' ? <Input value={profileData.company.industry} onChange={e => updateSection('company', { industry: e.target.value })} /> : <p>{profileData.company.industry}</p>}</div>
                            <div><Label>Website</Label>{editingSection === 'company' ? <Input value={profileData.company.website} onChange={e => updateSection('company', { website: e.target.value })} /> : <p>{profileData.company.website}</p>}</div>
                            <div><Label>Size</Label>{editingSection === 'company' ? <Select value={profileData.company.size} onValueChange={(v:string)=>updateSection('company',{size:v})}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="1-10">1-10</SelectItem><SelectItem value="11-50">11-50</SelectItem><SelectItem value="51-200">51-200</SelectItem></SelectContent></Select> : <p>{profileData.company.size}</p>}</div>
                          </div>
                          <Separator className="my-4" />
                          <div>
                            <Label>Description</Label>
                            {editingSection === 'company' ? <Textarea value={profileData.company.description} onChange={e => updateSection('company', { description: e.target.value })} rows={4} /> : <p>{profileData.company.description}</p>}
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>

                    {/* Recruiting tab */}
                    <TabsContent value="recruiting">
                      <Card>
                        <CardHeader className="p-4 flex items-center justify-between"><CardTitle><Briefcase className="w-4 h-4 mr-2" /> Recruiting</CardTitle><div className="flex items-center gap-2"><Input placeholder="Add specialization" value={specializationInput} onChange={e=>setSpecializationInput(e.target.value)} onKeyPress={e=>e.key==='Enter'&&addSpecialization()} className="w-40" /><Button size="sm" onClick={addSpecialization}><Plus className="w-3 h-3" /></Button></div></CardHeader>
                        <CardContent className="p-4">
                          <div className="flex flex-wrap gap-2 mb-4">
                            {(profileData.recruiting.specializations ?? []).map((s:string,i:number)=>(
                              <Badge key={i} className="flex items-center gap-2">{s}<Button variant="ghost" size="xs" onClick={()=>removeSpecialization(i)}><X className="w-3 h-3" /></Button></Badge>
                            ))}
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div><Label>Experience Level</Label>{editingSection === 'recruiting' ? <Select value={profileData.recruiting.experienceLevel} onValueChange={(v:string)=>updateSection('recruiting',{experienceLevel:v})}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent><SelectItem value="Junior">Junior</SelectItem><SelectItem value="Mid">Mid</SelectItem><SelectItem value="Senior">Senior</SelectItem></SelectContent></Select> : <p>{profileData.recruiting.experienceLevel}</p>}</div>
                            <div><Label>Placements / Year</Label>{editingSection === 'recruiting' ? <Input value={profileData.recruiting.placementsPerYear} onChange={e=>updateSection('recruiting',{placementsPerYear: Number(e.target.value)})} /> : <p>{profileData.recruiting.placementsPerYear}</p>}</div>
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>

                    {/* Preferences tab */}
                    <TabsContent value="preferences">
                      <Card>
                        <CardHeader className="p-4"><CardTitle><Target className="w-4 h-4 mr-2" /> Preferences</CardTitle></CardHeader>
                        <CardContent className="p-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div><Label>Candidate Types</Label><div className="flex flex-wrap gap-2">{(profileData.preferences.candidateTypes ?? []).map((c:string,i:number)=>(<Badge key={i}>{c}</Badge>))}</div></div>
                            <div><Label>Locations</Label><div className="flex flex-wrap gap-2">{(profileData.preferences.locations ?? []).map((c:string,i:number)=>(<Badge key={i}>{c}</Badge>))}</div></div>
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>
                  </Tabs>
                </div>
              </div>
            </div>
          </div>

          {/* Right sidebar (same visual placement as ProfilePage) */}
          <aside className="lg:col-span-4 space-y-6">
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-base flex items-center">
                  <TrendingUp className="w-4 h-4 mr-2 text-primary" />
                  Company Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Active Jobs</span>
                  <span className="font-medium">—</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-base flex items-center">
                  <Zap className="w-4 h-4 mr-2 text-primary" />
                  Tips
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-3">
                <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-sm font-medium text-green-900 mb-1">Update company info</p>
                  <p className="text-xs text-green-700">Keep your company profile current for best candidates</p>
                </div>
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>
    </div>
  );
}