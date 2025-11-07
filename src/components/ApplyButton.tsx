import React from 'react';
import { supabase } from '../lib/supabaseClient';
import { toast } from 'sonner';

export default function ApplyButton({ jobId }: { jobId: string }) {
  const onApply = async () => {
    const { data: u } = await supabase.auth.getUser();
    if (!u?.user) return toast.error('Please login');
    try {
      await supabase.from('applications').insert([{ job_id: jobId, candidate_id: u.user.id }]);
      toast.success('Applied');
    } catch (e:any) {
      console.error(e);
      toast.error('Apply failed');
    }
  };
  return <button onClick={onApply}>Apply</button>;
}