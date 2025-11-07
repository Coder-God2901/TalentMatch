import { supabase } from '../lib/supabaseClient';
import type { Recruiter } from '../types';

export async function getCompanyForRecruiter(recruiterId: string) {
  try {
    const { data, error } = await supabase
      .from('recruiters')
      .select('company_name, company')
      .eq('id', recruiterId)
      .maybeSingle();

    if (error) {
      console.warn('getCompanyForRecruiter error', error);
      return { name: null, description: null, website: null, logo: null };
    }

    const company = data?.company ?? {};
    return {
      name: data?.company_name ?? company?.name ?? null,
      description: company?.description ?? null,
      website: company?.website ?? null,
      logo: company?.logo_url ?? company?.logo ?? null
    };
  } catch (err) {
    console.error('getCompanyForRecruiter failed', err);
    return { name: null, description: null, website: null, logo: null };
  }
}