import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';

export default function MyJobs() {
  const [jobs, setJobs] = useState<any[]>([]);
  const nav = useNavigate();
  useEffect(()=> { (async ()=> {
    const u = await supabase.auth.getUser();
    if (!u?.data?.user) return;
    const { data } = await supabase.from('jobs').select('*').eq('recruiter_id', u.data.user.id);
    setJobs(data || []);
  })(); }, []);

  const softDelete = async (id:string) => {
    await supabase.from('jobs').update({ status:'closed' }).eq('id', id);
    setJobs(j=>j.filter(x=>x.id!==id));
  };

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-4"><h2 className="text-xl">My Jobs</h2></div>
      <ul className="space-y-3">
        {jobs.map(j=>(
          <li key={j.id} className="p-3 border rounded flex justify-between">
            <div>
              <div className="font-medium">{j.title}</div>
              <div className="text-sm text-muted-foreground">{j.company} • {j.location}</div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={()=>nav(`/recruiter/jobs/${j.id}`)}>View Details</button>
              <button onClick={()=>nav(`/recruiter/jobs/${j.id}/edit`)}>Edit</button>
              <button onClick={()=>softDelete(j.id)}>Close</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}