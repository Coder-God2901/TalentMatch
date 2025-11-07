import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Textarea } from '../../components/ui/textarea';
import {JobForm} from '../../components/recruiter/JobForm';

const toast = {
  success: (msg: string) => { console.log('Success:', msg); },
  error: (msg: string) => { console.error('Error:', msg); },
};

export default function JobDetails() {
  const { id } = useParams();
  const nav = useNavigate();
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [description, setDescription] = useState<string>('');
  const [editingJD, setEditingJD] = useState<boolean>(false);
  const [editingFull, setEditingFull] = useState<boolean>(false); // <-- new state

  useEffect(() => {
    if (!id) return;
    (async () => {
      setLoading(true);
      const { data } = await supabase.from('jobs').select('*').eq('id', id).maybeSingle();
      if (data) {
        setJob(data);
        setDescription(data.description ?? '');
      }
      setLoading(false);
    })();
  }, [id]);

  const refreshJob = async (jobId?: string) => {
    const jid = jobId ?? id;
    if (!jid) return;
    const { data } = await supabase.from('jobs').select('*').eq('id', jid).maybeSingle();
    if (data) {
      setJob(data);
      setDescription(data.description ?? '');
    }
  };

  if (loading) return <div className="p-4">Loading…</div>;
  if (!job) return <div className="p-4">Job not found</div>;

  const onCloseJob = async () => {
    try {
      await supabase.from('jobs').update({ status: 'closed' }).eq('id', job.id);
      toast.success('Job closed');
      nav('/recruiter-dashboard');
    } catch (e:any) {
      console.error(e);
      toast.error('Failed to close job');
    }
  };

  const onGenerateJD = async () => {
    setGenerating(true);
    try {
      const payload = {
        company: { name: job.company ?? null, description: job.company_description ?? null, website: job.company?.website ?? null },
        title: job.title,
        role: job.title,
        raw_jd: job.description_raw ?? '',
        skills: Array.isArray(job.skills) ? job.skills : [],
        location: job.location ?? '',
        salary: job.salary ?? ''
      };

    //   // 1) Preferred: Edge Function (production)
    //   try {
    //     const res = await supabase.functions.invoke('generate_jd', { body: payload });
    //     if (res?.error) throw res.error;
    //     const generated = res?.data?.generated_jd ?? res?.data?.generated ?? null;
    //     if (generated) {
    //       setDescription(generated);
    //       setEditing(true);
    //       toast.success('JD generated');
    //       setGenerating(false);
    //       return;
    //     }
    //     // if no generated string, fall through to local fallback
    //   } catch (edgeErr) {
    //     console.warn('edge generate_jd failed, falling back to local server', edgeErr);
    //   }

    //   // 2) Dev fallback: local Node server (only used when running locally)
    //   if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
        try {
          const localUrl = 'http://localhost:5577/generate_jd';
          const r = await fetch(localUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
          if (!r.ok) throw new Error('local JD generation failed');
          const json = await r.json();
          const generated = json?.generated_jd ?? null;
          if (generated) {
            setDescription(generated);
            setEditingJD(true);
            toast.success('JD generated (local)');
            setGenerating(false);
            return;
          }
        } catch (localErr) {
          console.warn('local generate_jd failed', localErr);
        }
      }

    //   toast.error('JD generation failed');
    catch (err:any) {
      console.error(err);
      toast.error('JD generation failed');
    } finally {
      setGenerating(false);
    }
  };

  const onSaveDescription = async () => {
    setSaving(true);
    try {
      const updated = { description, updated_at: new Date().toISOString() };
      await supabase.from('jobs').update(updated).eq('id', job.id);
      setJob((j:any)=>({ ...j, ...updated }));
      setEditingJD(false);
      toast.success('Job saved');
    } catch (err:any) {
      console.error(err);
      toast.error('Save failed');
    } finally {
      setSaving(false);
    }
  };

  // If the user chose to edit full job, render JobForm and exit early
  if (editingFull) {
    return (
      <div className="p-6 max-w-5xl mx-auto">
        <Button variant="ghost" onClick={() => setEditingFull(false)}>← Back to details</Button>
        <div className="mt-4">
          {/* JobForm will call onSaved when done; JobForm is the default export in file, so ensure import matches */}
          <JobForm jobId={job.id} onSaved={async (savedId:string|null) => {
            await refreshJob(savedId ?? job.id);
            setEditingFull(false);
            toast.success('Job saved');
          }} />
        </div>
      </div>
    );
  }

  // normal details view below
  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h1 className="text-2xl font-semibold">{job.title}</h1>
          <div className="text-sm text-muted-foreground">{job.company} • {job.location} {job.salary ? `• ${job.salary}` : ''}</div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={() => nav('/recruiter-dashboard')}>Back</Button>
          <Button onClick={() => setEditingFull(true)}>Edit</Button> {/* toggles full edit */}
          <Button variant="outline" onClick={() => nav(`/recruiter/jobs/${job.id}/ranked`)}>View Ranked Candidates</Button>
          <Button variant="destructive" onClick={onCloseJob}>Close Job</Button>
        </div>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Job Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <strong>Skills:</strong>
            <div className="mt-2 flex flex-wrap gap-2">
              {(Array.isArray(job.skills) ? job.skills : []).map((s:string)=>(
                <Badge key={s} variant="outline">{s}</Badge>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <strong>Benefits:</strong>
            <div className="mt-2">{(Array.isArray(job.benefits) ? job.benefits.join(', ') : job.benefits) || '—'}</div>
          </div>

          <div className="mb-4">
            <strong>Raw JD (submitted):</strong>
            <div className="mt-2 whitespace-pre-wrap text-sm bg-slate-50 p-3 rounded border">{job.description_raw || '—'}</div>
          </div>

          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <strong>Refined / Generated JD</strong>
              <div className="flex items-center gap-2">
                <Button size="sm" onClick={onGenerateJD} disabled={generating}>{generating ? 'Generating…' : 'Generate Refined JD'}</Button>
                {editingJD ? (
                  <Button size="sm" onClick={onSaveDescription} disabled={saving}>{saving ? 'Saving…' : 'Save JD' }</Button>
                ) : (
                  <Button size="sm" variant="outline" onClick={() => setEditingJD(true)}>Edit</Button>
                )}
              </div>
            </div>

            {editingJD ? (
              <Textarea value={description} onChange={(e:any)=>setDescription(e.target.value)} rows={10} />
            ) : (
              <div className="mt-2 whitespace-pre-wrap text-sm bg-white p-4 rounded border">{description || 'No refined JD available'}</div>
            )}
          </div>

          <div className="mt-6 flex gap-3">
            <Button onClick={() => setEditingFull(true)}>Edit Full Job</Button>
            <Button variant="outline" onClick={() => nav(`/recruiter/jobs/${job.id}/ranked`)}>View Ranked Candidates</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}