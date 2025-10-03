import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Sparkles, User, Building2, Github, Linkedin } from 'lucide-react';

export function SignupWizard() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'job_seeker' | 'recruiter' | ''>('');
  const [github, setGithub] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [resume, setResume] = useState<File | null>(null);
  const [company, setCompany] = useState('');
  const [position, setPosition] = useState('');

  const handleAccountNext = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    // Only check candidates and recruiters tables for duplicate email
    // Check candidates table
    const { data: candidate, error: candidateError } = await supabase
      .from('candidates')
      .select('email')
      .eq('email', email)
      .maybeSingle();
    if (candidate) {
      setError('This email is already registered as a candidate.');
      setIsLoading(false);
      return;
    }
    // Check recruiters table
    const { data: recruiter, error: recruiterError } = await supabase
      .from('recruiters')
      .select('email')
      .eq('email', email)
      .maybeSingle();
    if (recruiter) {
      setError('This email is already registered as a recruiter.');
      setIsLoading(false);
      return;
    }
    setIsLoading(false);
    setStep(2);
  };

  const handleRoleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (!role) {
      setError('Please select a role');
      return;
    }
    setError('');
    setStep(3);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    // Create user in Supabase Auth
    const { data, error: signupError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name },
      },
    });
    if (signupError) {
      setError(signupError.message);
      setIsLoading(false);
      return;
    }
    const userId = data?.user?.id;
    if (!userId) {
      setError('Signup failed. Please try again.');
      setIsLoading(false);
      return;
    }
    // Insert into candidates or recruiters table
    let profileInsert;
    if (role === 'job_seeker') {
      profileInsert = await supabase.from('candidates').insert({
        id: userId,
        display_name: name,
        email,
        github,
        linkedin,
        resume_url: '',
      });
    } else {
      profileInsert = await supabase.from('recruiters').insert({
        id: userId,
        display_name: name,
        email,
        company_name: company,
        position_of_power: position,
        linkedin,
      });
    }
    if (profileInsert.error) {
      setError('Profile creation failed: ' + profileInsert.error.message);
      setIsLoading(false);
      return;
    }
    setIsLoading(false);
    alert('Signup successful! Please check your email for a verification link.');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-cyan-50 relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-indigo-400/20 to-purple-400/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-r from-cyan-400/20 to-pink-400/20 rounded-full blur-3xl" />
      </div>
      <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="w-full max-w-md">
          <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-sm">
            <CardHeader className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
              </div>
              <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0 px-4 py-1">
                ✨ Free Account • No Credit Card Required
              </Badge>
              <CardTitle className="text-3xl bg-gradient-to-r from-slate-800 to-indigo-800 bg-clip-text text-transparent">
                {step === 1 ? 'Create Account' : step === 2 ? 'Select Role' : 'Profile Details'}
              </CardTitle>
              <CardDescription className="text-base text-slate-600 mt-2">
                {step === 1
                  ? 'Create your account in 30 seconds'
                  : step === 2
                  ? 'Choose your role to customize your experience'
                  : role === 'job_seeker'
                  ? 'Add your professional details'
                  : 'Add your company details'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {error && <div className="text-red-500 text-center mb-2">{error}</div>}

              {/* Step 1 */}
              {step === 1 && (
                <div>
                  <div className="space-y-4">
                    <div className="flex flex-col gap-3">
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full flex items-center justify-center gap-2 border-2 border-gray-200 hover:border-indigo-400"
                        onClick={async () => {
                          setIsLoading(true);
                          const { error } = await supabase.auth.signInWithOAuth({ provider: 'google' });
                          if (error) setError(error.message);
                          setIsLoading(false);
                        }}
                      >
                        <img
                          src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/google/google-original.svg"
                          alt="Google"
                          className="w-5 h-5 mr-2"
                        />{' '}
                        Sign up with Google
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full flex items-center justify-center gap-2 border-2 border-gray-200 hover:border-indigo-400"
                        onClick={async () => {
                          setIsLoading(true);
                          const { error } = await supabase.auth.signInWithOAuth({ provider: 'github' });
                          if (error) setError(error.message);
                          setIsLoading(false);
                        }}
                      >
                        <Github className="w-5 h-5 mr-2" /> Sign up with GitHub
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full flex items-center justify-center gap-2 border-2 border-gray-200 hover:border-indigo-400"
                        onClick={async () => {
                          setIsLoading(true);
                          const { error } = await supabase.auth.signInWithOAuth({ provider: 'linkedin' });
                          if (error) setError(error.message);
                          setIsLoading(false);
                        }}
                      >
                        <Linkedin className="w-5 h-5 mr-2" /> Sign up with LinkedIn
                      </Button>
                    </div>
                    <div className="relative my-6">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-gray-300" />
                      </div>
                      <div className="relative flex justify-center text-sm">
                        <span className="bg-white px-2 text-gray-500">or</span>
                      </div>
                    </div>
                  </div>
                  <form onSubmit={handleAccountNext} className="space-y-5">
                    <Input
                      id="name"
                      type="text"
                      placeholder="Full Name"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      className="h-12 border-2 focus:border-indigo-400 transition-colors"
                      required
                    />
                    <Input
                      id="email"
                      type="email"
                      placeholder="Email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className="h-12 border-2 focus:border-indigo-400 transition-colors"
                      required
                    />
                    <Input
                      id="password"
                      type="password"
                      placeholder="Password"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      className="h-12 border-2 focus:border-indigo-400 transition-colors"
                      required
                    />
                    <Button
                      type="submit"
                      className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-indigo-500 to-cyan-500 text-white shadow-lg hover:from-indigo-600 hover:to-cyan-600 transition-colors"
                    >
                      Next
                    </Button>
                  </form>
                  <div className="text-center mt-4">
                    <span className="text-gray-600">Already have an account?</span>
                    <Button
                      variant="link"
                      className="text-indigo-600 font-semibold"
                      onClick={() => navigate('/login')}
                    >
                    Log in
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 2 */}
              {step === 2 && (
                <div>
                  <form onSubmit={handleRoleNext} className="space-y-5">
                    <div className="grid grid-cols-2 gap-4">
                      <Button
                        type="button"
                        className={`w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-0 hover:shadow-lg transition-all duration-200 ${
                          role === 'job_seeker' ? 'ring-2 ring-blue-400' : ''
                        }`}
                        size="lg"
                        onClick={() => setRole('job_seeker')}
                      >
                        <User className="w-5 h-5 mr-2" /> Job Seeker
                      </Button>
                      <Button
                        type="button"
                        className={`w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 hover:shadow-lg transition-all duration-200 ${
                          role === 'recruiter' ? 'ring-2 ring-purple-400' : ''
                        }`}
                        size="lg"
                        onClick={() => setRole('recruiter')}
                      >
                        <Building2 className="w-5 h-5 mr-2" /> Recruiter
                      </Button>
                    </div>
                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-indigo-500 to-cyan-500 text-white border-0 hover:shadow-lg transition-all duration-200"
                      size="lg"
                      disabled={isLoading}
                    >
                      Next
                    </Button>
                  </form>
                  <div className="text-center mt-4">
                    <Button
                      variant="link"
                      className="text-base text-slate-600 hover:text-indigo-600 transition-colors w-full"
                      onClick={() => setStep(step - 1)}
                    >
                      Back
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 3 */}
              {step === 3 && (
                <div>
                  <form onSubmit={handleSignup} className="space-y-5">
                    {role === 'job_seeker' ? (
                      <div>
                        <Input
                          id="github"
                          type="text"
                          placeholder="GitHub Profile URL"
                          value={github}
                          onChange={e => setGithub(e.target.value)}
                          className="h-12 border-2 focus:border-indigo-400 transition-colors"
                        />
                        <Input
                          id="linkedin"
                          type="text"
                          placeholder="LinkedIn Profile URL"
                          value={linkedin}
                          onChange={e => setLinkedin(e.target.value)}
                          className="h-12 border-2 focus:border-indigo-400 transition-colors"
                        />
                        <Input
                          id="resume"
                          type="file"
                          accept=".pdf,.doc,.docx"
                          onChange={e => setResume(e.target.files?.[0] || null)}
                          className="h-12 border-2 focus:border-indigo-400 transition-colors"
                        />
                      </div>
                    ) : (
                      <div>
                        <Input
                          id="company"
                          type="text"
                          placeholder="Company Name"
                          value={company}
                          onChange={e => setCompany(e.target.value)}
                          className="h-12 border-2 focus:border-indigo-400 transition-colors"
                          required
                        />
                        <Input
                          id="position"
                          type="text"
                          placeholder="Position of Power (e.g. HR Manager)"
                          value={position}
                          onChange={e => setPosition(e.target.value)}
                          className="h-12 border-2 focus:border-indigo-400 transition-colors"
                          required
                        />
                        <Input
                          id="linkedin"
                          type="text"
                          placeholder="LinkedIn Profile URL"
                          value={linkedin}
                          onChange={e => setLinkedin(e.target.value)}
                          className="h-12 border-2 focus:border-indigo-400 transition-colors"
                        />
                      </div>
                    )}
                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-indigo-500 to-cyan-500 text-white border-0 hover:shadow-lg transition-all duration-200"
                      size="lg"
                      disabled={isLoading}
                    >
                      Sign Up
                    </Button>
                  </form>
                  <div className="text-center mt-4">
                    <Button
                      variant="link"
                      className="text-base text-slate-600 hover:text-indigo-600 transition-colors w-full"
                      onClick={() => setStep(step - 1)}
                    >
                      Back
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
