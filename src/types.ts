export type Candidate = {
  id: string;
  display_name?: string | null;
  email?: string | null;
  github?: string | null;
  linkedin?: string | null;
  resume_url?: string | null;
  skills?: any | null;
  skills_text?: string[] | null;
  experience?: string | null;
};

export type Recruiter = {
  id: string;
  display_name?: string | null;
  email?: string | null;
  company_name?: string | null;
  company?: any | null;
};

export type Job = {
  id?: string;
  recruiter_id?: string | null;
  title: string;
  company?: string;
  location?: string | null;
  salary?: string | null;
  skills?: string[] | null;
  benefits?: string[] | null;
  description?: string | null;
  description_raw?: string | null;
  company_logo?: string | null;
  status?: 'active' | 'closed';
};