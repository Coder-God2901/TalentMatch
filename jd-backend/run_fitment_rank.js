// node tools/run_fitment_rank.js <job_id>
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config();

async function main() {
  const jobId = process.argv[2];
  if (!jobId) { console.error('Usage: node run_fitment_rank.js <job_id>'); process.exit(1); }

  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const FLASK_BASE = process.env.FLASK_SCORE_BASE || 'http://localhost:5500';

  if (!SUPABASE_URL || !SERVICE_KEY) { console.error('missing env'); process.exit(1); }

  const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

  const { data: job } = await supabase.from('jobs').select('*').eq('id', jobId).maybeSingle();
  if (!job) { console.error('job not found'); process.exit(1); }

  const { data: apps } = await supabase
    .from('applications')
    .select('id, candidate_id, candidates(id, display_name, email, github, linkedin, resume_url, skills, skills_text, experience)')
    .eq('job_id', jobId);

  for (const a of apps || []) {
    const c = a.candidates;
    const payload = {
      job: { title: job.title, skills_required: job.skills || [], raw_jd: job.description_raw || '', generated_jd: job.description || '' },
      candidate: { resume_url: c?.resume_url, github_url: c?.github, linkedin_url: c?.linkedin, profile: { skills: c?.skills_text || c?.skills || [], experience_years: 0, projects: [] } }
    };
    try {
      const resp = await fetch(`${FLASK_BASE}/score`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (!resp.ok) throw new Error('scoring failed');
      const json = await resp.json();
      const fitment_score = Number(json.fitment_score ?? null);
      const sub_scores = json.sub_scores ?? null;
      await supabase.from('applications').update({ fitment_score, sub_scores }).eq('id', a.id);
      console.log('updated', c?.id, fitment_score);
    } catch (err) {
      console.error('error scoring', c?.id, err);
    }
  }
  console.log('done');
}
main();