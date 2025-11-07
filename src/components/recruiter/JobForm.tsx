import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { getCompanyForRecruiter } from '../../services/company';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Button } from '../ui/button';
const toast = {
  success: (msg: string) => {
    // fallback simple notification when no toast library is installed
    // replace with a proper toast library import when available
    console.log('Success:', msg);
  },
  error: (msg: string) => {
    console.error('Error:', msg);
  }
};

export function JobForm({ jobId, onSaved }: { jobId?: string; onSaved?: (jobId: string) => void }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [companyInfo, setCompanyInfo] = useState<any>({});
  const [form, setForm] = useState<any>({
    title: '',
    company: '',
    location: '',
    salary: '',
    skills: '',
    benefits: '',
    description_raw: '',
    description: ''
  });

  useEffect(() => {
    const load = async () => {
      const { data: u } = await supabase.auth.getUser();
      setUser(u?.user ?? null);
      if (!u?.user) return;
      const c = await getCompanyForRecruiter(u.user.id);
      setCompanyInfo(c);
      setForm((f:any)=>({ ...f, company: c.name ?? f.company }));
      if (jobId) {
        const { data } = await supabase.from('jobs').select('*').eq('id', jobId).maybeSingle();
        if (data) {
          setForm({
            title: data.title ?? '',
            company: data.company ?? c.name ?? '',
            location: data.location ?? '',
            salary: data.salary ?? '',
            skills: (data.skills ?? []).join(', '),
            benefits: (data.benefits ?? []).join(', '),
            description_raw: data.description_raw ?? '',
            description: data.description ?? ''
          });
        }
      }
    };
    load();
  }, [jobId]);

  const onGenerate = async () => {
    setGenerating(true);
    try {
      const payload = {
        company: { name: companyInfo.name ?? form.company, description: companyInfo.description ?? null, website: companyInfo.website ?? null },
        title: form.title,
        role: form.title,
        raw_jd: form.description_raw,
        skills: form.skills.split(',').map((s:string)=>s.trim()).filter(Boolean),
        location: form.location,
        salary: form.salary
      };
      const localUrl = 'http://localhost:5577/generate_jd';
      const res = await fetch(localUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error('JD generation failed');
      const json = await res.json();
      setForm((f:any)=>({ ...f, description: json.generated_jd || '' }));
      toast.success('JD generated');
    } catch (err:any) {
      console.error(err);
      toast.error('JD generation failed');
    } finally {
      setGenerating(false);
    }
  };

  const onSave = async () => {
    setLoading(true);
    try {
      const userRes = await supabase.auth.getUser();
      const recruiterId = userRes?.data?.user?.id;
      if (!recruiterId) throw new Error('Not authenticated');

      const payload = {
        title: form.title,
        company: form.company,
        location: form.location || null,
        salary: form.salary || null,
        skills: form.skills.split(',').map((s:string)=>s.trim()).filter(Boolean),
        benefits: form.benefits.split(',').map((s:string)=>s.trim()).filter(Boolean),
        description: form.description || null,
        description_raw: form.description_raw || null,
        recruiter_id: recruiterId,
        company_logo: companyInfo.logo ?? null,
        status: 'active'
      };

      const { data, error } = await supabase
        .from('jobs')
        .upsert({ ...payload, id: jobId }, { onConflict: 'id' })
        .select();

      if (error) throw error;

      const savedId = (Array.isArray(data) && data[0]?.id) ? data[0].id : (jobId ?? null);

      toast.success('Job saved');

      // If parent provided callback, call it instead of navigating away
      if (onSaved) {
        onSaved(savedId);
      } else {
        navigate('/recruiter/jobs');
      }
    } catch (err:any) {
      console.error(err);
      toast.error('Job save failed: ' + (err?.message ?? String(err)));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h2 className="text-xl font-semibold mb-4">{jobId ? 'Edit Job' : 'Post a Job'}</h2>
      <div className="space-y-3">
        <Input placeholder="Title" value={form.title} onChange={(e:any)=>setForm({...form,title:e.target.value})} />
        <Input placeholder="Company" value={form.company} onChange={(e:any)=>setForm({...form,company:e.target.value})} />
        <Input placeholder="Location" value={form.location} onChange={(e:any)=>setForm({...form,location:e.target.value})} />
        <Input placeholder="Salary" value={form.salary} onChange={(e:any)=>setForm({...form,salary:e.target.value})} />
        <Input placeholder="Skills (comma separated)" value={form.skills} onChange={(e:any)=>setForm({...form,skills:e.target.value})} />
        <Input placeholder="Benefits (comma separated)" value={form.benefits} onChange={(e:any)=>setForm({...form,benefits:e.target.value})} />
        <Textarea placeholder="Raw JD" value={form.description_raw} onChange={(e:any)=>setForm({...form,description_raw:e.target.value})} rows={6} />
        <div className="flex gap-2">
          <Button onClick={onGenerate} disabled={generating}>{generating ? 'Generating…' : 'Generate Refined JD'}</Button>
          <Button variant="secondary" onClick={()=>setForm((f: any)=>({...f,description: ''}))}>Clear Generated</Button>
        </div>
        <Textarea placeholder="Refined JD (editable)" value={form.description} onChange={(e:any)=>setForm({...form,description:e.target.value})} rows={8} />
        <div className="flex justify-end gap-2">
          <Button onClick={onSave} disabled={loading}>{loading ? 'Saving…' : 'Save Job'}</Button>
        </div>
      </div>
    </div>
  );
}