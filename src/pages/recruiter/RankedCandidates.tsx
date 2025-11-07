import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { Badge } from '../../components/ui/badge';

export default function RankedCandidates() {
  const { id } = useParams(); // job id
  const navigate = useNavigate();
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [recomputing, setRecomputing] = useState(false);

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
  return (
    <div className="p-4 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="btn btn-ghost btn-sm">Back</button>
          <h2 className="text-xl font-semibold">Ranked Candidates</h2>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={onRecompute} disabled={recomputing} className="btn btn-sm">
            {recomputing ? 'Recomputing…' : 'Recompute rankings'}
          </button>
        </div>
      </div>

      <table className="w-full table-auto">
        <thead>
          <tr className="text-left">
            <th>Candidate</th><th>Email</th><th>Score</th><th>Skill</th><th>Experience</th><th>Attrition</th><th></th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r:any)=>(
            <tr key={r.candidate_id} className="border-t">
              <td>{r.display_name}</td>
              <td>{r.email}</td>
              <td><Badge className={`bg-${color(r.fitment_score)}-100`}>{Math.round((r.fitment_score||0)*10)/10}</Badge></td>
              <td>{r.sub_scores?.skill_match ?? '—'}</td>
              <td>{r.sub_scores?.experience ?? '—'}</td>
              <td>{r.sub_scores?.attrition_risk ?? '—'}</td>
              <td><Link to={`/job-seeker-profile?user=${r.candidate_id}`}>View Profile</Link></td>
            </tr>
          ))}
          {rows.length === 0 && (
            <tr><td colSpan={7} className="py-6 text-center text-muted-foreground">No applications / scores yet.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}