import React, { useEffect, useState } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { ThemeToggle } from './ThemeToggle';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Brain, 
  Users, 
  Target, 
  Zap, 
  CheckCircle, 
  ArrowRight,
  TrendingUp,
  Shield,
  Star,
  Clock,
  Award,
  UserCheck,
  Sparkles
} from 'lucide-react';

export function LandingPage() {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const stats = [
    { number: '95%', label: 'Find matches within 24hrs', icon: Clock },
    { number: '500+', label: 'Successful placements weekly', icon: UserCheck },
    { number: '4.9/5', label: 'Average user rating', icon: Star },
    { number: '50k+', label: 'Active professionals', icon: Users }
  ];

  const testimonials = [
    {
      name: 'Sarah Chen',
      role: 'Software Engineer',
      content: 'Found my dream job in just 3 days! The AI matching was incredibly accurate.',
      avatar: 'SC'
    },
    {
      name: 'Marcus Rodriguez',
      role: 'Talent Acquisition Lead',
      content: 'TalentMatch helped us reduce hiring time by 60% while improving candidate quality.',
      avatar: 'MR'
    },
    {
      name: 'Emily Watson',
      role: 'Product Manager',
      content: 'The skill assessments gave me confidence and helped me land a PM role at a top tech company.',
      avatar: 'EW'
    }
  ];

  const features = [
    {
      icon: Brain,
      title: 'AI-Powered Matching',
      description: 'Advanced algorithms match candidates with perfect job opportunities based on skills, experience, and career goals.'
    },
    {
      icon: Target,
      title: 'Smart Skill Assessment',
      description: 'Adaptive assessments that adjust difficulty based on performance, providing accurate skill evaluation.'
    },
    {
      icon: Zap,
      title: 'Instant Profile Parsing',
      description: 'Upload your resume and let AI extract and structure your professional information automatically.'
    },
    {
      icon: Users,
      title: 'Recruiter Dashboard',
      description: 'Comprehensive tools for recruiters to post jobs, review candidates, and make data-driven hiring decisions.'
    },
    {
      icon: TrendingUp,
      title: 'Career Insights',
      description: 'Get personalized career recommendations and skill development suggestions powered by AI.'
    },
    {
      icon: Shield,
      title: 'Bias-Free Hiring',
      description: 'AI-driven matching reduces unconscious bias and promotes fair, merit-based recruitment.'
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-[rgba(13,34,55,1)] rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-semibold">TalentMatch</span>
            </Link>
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <Button variant="ghost" onClick={() => navigate('/login')}>
                Sign In
              </Button>
              <Button onClick={() => navigate('/signup')} className="bg-[rgba(13,34,55,1)] !text-white !border-white border">
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-20 pb-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto text-center">
          <div className="mb-8">
            <Badge className="mb-6 bg-[#0046FF] text-white border-[#0046FF] px-6 py-2">
              AI-Powered Recruitment Platform
            </Badge>
            
            <h1 className="text-5xl sm:text-6xl lg:text-7xl mb-8 leading-tight">
              <span className="text-foreground">
                The Smartest Way to
              </span>
              <br />
              <span className="text-[#0046FF]">
                Hire & Get Hired
              </span>
            </h1>
            
            <p className="text-xl sm:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed">
              Connect with your perfect career opportunity or ideal candidate through our revolutionary AI matching platform. Experience the future of recruitment today.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
              <Button 
                size="lg" 
                onClick={() => navigate('/signup', { state: { role: 'job_seeker' }})} 
                className="text-xl h-14 px-12 bg-[rgba(8,33,64,1)] !text-white !border-white border"
              >
                I'm Looking for Jobs
                <ArrowRight className="ml-3 w-6 h-6" />
              </Button>
              
              <Button 
                size="lg" 
                variant="outline" 
                onClick={() => navigate('/login')} 
                className="text-xl h-14 px-12 bg-white text-[rgba(13,34,55,1)] border border-white"
              >
                I'm Hiring Talent
              </Button>
            </div>
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 max-w-4xl mx-auto">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="text-center p-6 bg-card rounded-xl border"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 text-primary rounded-xl mb-3">
                  <stat.icon className="w-6 h-6" />
                </div>
                <div className="text-3xl font-bold text-foreground mb-1">
                  {stat.number}
                </div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-muted/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl sm:text-5xl mb-6 text-foreground">
              Why Choose TalentMatch?
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Our platform combines cutting-edge AI technology with intuitive design to transform how talent meets opportunity. Experience the future of recruitment.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const colors = [
                'bg-blue-500/10 text-blue-600 dark:text-blue-400',
                'bg-purple-500/10 text-purple-600 dark:text-purple-400', 
                'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
                'bg-orange-500/10 text-orange-600 dark:text-orange-400',
                'bg-violet-500/10 text-violet-600 dark:text-violet-400',
                'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400'
              ];
              return (
                <Card key={index} className="border-border/50 h-full group hover:shadow-lg transition-all duration-300">
                  <CardHeader className="pb-4">
                    <div className={`w-14 h-14 ${colors[index]} rounded-xl flex items-center justify-center mb-6`}>
                      <feature.icon className="w-7 h-7" />  
                    </div>
                    <CardTitle className="text-xl text-foreground group-hover:text-primary transition-colors">
                      {feature.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base text-muted-foreground leading-relaxed">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl mb-6 text-foreground">
              Success Stories
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Hear from professionals who transformed their careers with TalentMatch
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="bg-card rounded-xl p-8 border border-border/50 hover:shadow-lg transition-all duration-300"
              >
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-[rgba(13,34,55,1)] rounded-full flex items-center justify-center text-primary-foreground font-semibold mr-4">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="font-semibold text-foreground">{testimonial.name}</div>
                    <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                  </div>
                </div>
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-muted-foreground italic">"{testimonial.content}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-muted/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl sm:text-5xl mb-6 text-foreground">
              How TalentMatch Works
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Get matched with your perfect opportunity in three simple steps
            </p>
          </div>

          <div className="space-y-16">
            {[
              {
                step: '01',
                title: 'Create Your Profile',
                description: 'Sign up and let our AI parse your resume or import from LinkedIn/GitHub to build your comprehensive profile in minutes.',
                icon: Users,
                color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
              },
              {
                step: '02',
                title: 'Take Skill Assessments',
                description: 'Complete adaptive assessments that adjust to your skill level and provide accurate capability evaluation with instant feedback.',
                icon: Target,
                color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400'
              },
              {
                step: '03',
                title: 'Get Matched',
                description: 'Our AI analyzes your profile and matches you with opportunities that align perfectly with your skills and career goals.',
                icon: CheckCircle,
                color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
              }
            ].map((item, index) => (
              <div
                key={index}
                className={`flex flex-col lg:flex-row items-center gap-12 ${index % 2 === 1 ? 'lg:flex-row-reverse' : ''}`}
              >
                <div className="flex-1 lg:max-w-lg">
                  <div className="flex items-center mb-6">
                    <div className={`w-20 h-20 ${item.color} rounded-xl flex items-center justify-center mr-6`}>
                      <span className="font-bold text-2xl">{item.step}</span>
                    </div>
                    <h3 className="text-3xl font-bold text-foreground">{item.title}</h3>
                  </div>
                  <p className="text-xl text-muted-foreground leading-relaxed">{item.description}</p>
                </div>
                
                <div className="flex-1 relative">
                  <div className="w-72 h-72 bg-card rounded-2xl border border-border/50 flex items-center justify-center mx-auto">
                    <item.icon className="w-24 h-24 text-muted-foreground" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-[rgba(13,34,55,1)] text-primary-foreground">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-4xl sm:text-5xl lg:text-6xl mb-8 leading-tight">
            Ready to Transform Your Career?
          </h2>
          <p className="text-xl sm:text-2xl mb-12 text-primary-foreground/90 max-w-3xl mx-auto leading-relaxed">
            Join thousands of professionals who have found their perfect match with TalentMatch. 
            Your dream job or ideal candidate is just one click away.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center ">
            <Button 
              size="lg" 
              onClick={() => navigate('/signup', { state: { role: 'job_seeker' } })}
              className="text-xl h-14 px-10 bg-white !text-[rgba(13,34,55,1)] border-white"
            >
              Get Started for Free
              <ArrowRight className="ml-3 w-5 h-5" />
            </Button>
            
            <Button 
              size="lg" 
              onClick={() => navigate('/signup', { state: { role: 'recruiter' } })}
              variant="outline"
              className="text-xl h-14 px-10 !text-white !bg-transparent border-white"
            >
              Book a Demo
            </Button>
          </div>

          <div className="mt-12 text-primary-foreground/80">
            <p className="text-lg">No credit card required • 100% secure • Setup in 2 minutes</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-[rgba(13,34,55,1)] rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-semibold">TalentMatch</span>
            </div>
            <p className="text-muted-foreground">
              © 2024 TalentMatch. Powered by artificial intelligence.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

