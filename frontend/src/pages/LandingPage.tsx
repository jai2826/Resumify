import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles, BarChart3, Upload, Download, Layers, Shield, Target,
  Brain, Check, ArrowRight, Github, Users, Zap
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { clsx } from 'clsx';

function useInView(options = { threshold: 0.1 }) {
  const [isInView, setIsInView] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const currentRef = ref.current;
    if (!currentRef) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsInView(true);
        observer.unobserve(currentRef);
      }
    }, options);

    observer.observe(currentRef);
    return () => {
      if (currentRef) observer.unobserve(currentRef);
    };
  }, [options]);

  return { ref, isInView };
}

function FadeInSection({ children, delay = '', className = '' }: { children: React.ReactNode, delay?: string, className?: string }) {
  const { ref, isInView } = useInView();
  return (
    <div ref={ref} className={clsx(className, isInView ? `animate-fade-in-up opacity-100 ${delay}` : 'opacity-0')}>
      {children}
    </div>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-[#f0f0f5] overflow-x-hidden font-sans">
      <Navbar variant="marketing" />

      {/* Section 1: Hero */}
      <section className="relative min-h-screen flex items-center justify-center pt-20 pb-16 overflow-hidden bg-mesh">
        {/* Orbs */}
        <div className="orb orb-violet w-[300px] h-[300px] top-1/4 left-1/4 animate-orb-drift delay-0 absolute opacity-30" />
        <div className="orb orb-blue w-[400px] h-[400px] bottom-1/4 right-1/4 animate-orb-drift delay-500 absolute opacity-30" />
        <div className="orb orb-pink w-[250px] h-[250px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-orb-drift delay-1000 absolute opacity-20" />
        
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center">
          <div className="animate-fade-in-up delay-100 mb-6 chip chip-violet">
            <Sparkles className="w-4 h-4 mr-1 inline-block" /> Powered by Groq AI
          </div>
          
          <h1 className="animate-fade-in-up delay-200 text-5xl md:text-7xl font-black tracking-tight mb-6 leading-tight">
            Find Your <span className="gradient-text-vibrant">Perfect</span>
            <br />Candidate Match
          </h1>
          
          <p className="animate-fade-in-up delay-300 text-lg text-secondary max-w-2xl mx-auto mb-10">
            AI-powered resume analysis that understands skills, experience, and potential. Stop guessing — start matching.
          </p>
          
          <div className="animate-fade-in-up delay-400 flex flex-col sm:flex-row items-center gap-4 justify-center mb-16 w-full">
            <Link to="/demo/job-seeker" className="btn-primary px-8 py-3 rounded-xl font-medium text-lg w-full sm:w-auto">
              Try Free Demo
            </Link>
            <Link to="/register" className="btn-secondary px-8 py-3 rounded-xl font-medium text-lg w-full sm:w-auto">
              Create Account
            </Link>
          </div>
          
          <div className="animate-fade-in-up delay-500 flex flex-wrap justify-center gap-4 md:gap-8">
            <div className="glass-md px-4 py-2 rounded-full text-sm font-medium text-secondary">10,000+ Resumes Analyzed</div>
            <div className="glass-md px-4 py-2 rounded-full text-sm font-medium text-secondary">95% Accuracy</div>
            <div className="glass-md px-4 py-2 rounded-full text-sm font-medium text-secondary">3x Faster Hiring</div>
          </div>
        </div>
      </section>

      {/* Section 2: Trusted By */}
      <section className="py-16 relative">
        <div className="absolute top-0 left-0 w-full h-px divider-gradient" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-muted text-sm uppercase tracking-widest mb-8 font-medium">Trusted by teams at</p>
          <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-40 text-muted font-bold text-xl md:text-2xl">
            <span>TechCorp</span>
            <span>Innovate Inc</span>
            <span>DataFlow</span>
            <span>CloudBase</span>
            <span>NeuralHQ</span>
            <span>QuantumHR</span>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 w-full h-px divider-gradient" />
      </section>

      {/* Section 3: How It Works */}
      <section className="py-24 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeInSection className="text-center mb-16">
          <h2 className="gradient-text text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
          <p className="text-secondary text-lg">Three simple steps to find your ideal candidates</p>
        </FadeInSection>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <FadeInSection delay="delay-100" className="card-dark p-8 rounded-2xl relative flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full gradient-border flex items-center justify-center text-2xl font-black mb-6 bg-white/5">01</div>
            <Upload className="w-10 h-10 text-violet-400 mb-4" />
            <h3 className="text-xl font-bold mb-2">Upload Resumes</h3>
            <p className="text-secondary">Simply drag and drop multiple resumes. We support PDF and DOCX formats seamlessly.</p>
          </FadeInSection>
          
          <FadeInSection delay="delay-300" className="card-dark p-8 rounded-2xl relative flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full gradient-border flex items-center justify-center text-2xl font-black mb-6 bg-white/5">02</div>
            <Sparkles className="w-10 h-10 text-indigo-400 mb-4" />
            <h3 className="text-xl font-bold mb-2">AI Analyzes</h3>
            <p className="text-secondary">Groq LLM instantly parses skills, experience, education, and subtle contextual cues.</p>
          </FadeInSection>
          
          <FadeInSection delay="delay-500" className="card-dark p-8 rounded-2xl relative flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full gradient-border flex items-center justify-center text-2xl font-black mb-6 bg-white/5">03</div>
            <BarChart3 className="w-10 h-10 text-blue-400 mb-4" />
            <h3 className="text-xl font-bold mb-2">Get Rankings</h3>
            <p className="text-secondary">View a scored leaderboard with detailed skill gap analysis and head-to-head comparisons.</p>
          </FadeInSection>
        </div>
      </section>

      {/* Section 4: For Job Seekers */}
      <section className="py-24 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <FadeInSection className="flex flex-col items-start">
            <div className="chip chip-violet mb-6">For Job Seekers</div>
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-6">Know Your Fit Before You Apply</h2>
            <p className="text-secondary text-lg mb-8">
              Upload your resume and the job description. Our AI tells you exactly what HR will see, highlighting your strengths and showing you exactly what skills to improve.
            </p>
            <ul className="flex flex-col gap-4 mb-10">
              {['Instant resume-to-job matching', 'Identify skill gaps', 'Get actionable improvement tips', 'Track your match history'].map((item, i) => (
                <li key={i} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-violet-500/20 flex items-center justify-center flex-shrink-0">
                    <Check className="w-4 h-4 text-violet-400" />
                  </div>
                  <span className="text-primary">{item}</span>
                </li>
              ))}
            </ul>
            <Link to="/demo/job-seeker" className="btn-primary px-6 py-3 rounded-xl font-medium inline-flex items-center gap-2">
              Try Job Seeker Demo <ArrowRight className="w-4 h-4" />
            </Link>
          </FadeInSection>
          
          <FadeInSection delay="delay-200" className="relative">
            <div className="absolute inset-0 bg-violet-500/20 blur-3xl rounded-full" />
            <div className="card-dark card-glow relative p-8 rounded-2xl border border-white/10">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h4 className="text-lg font-bold mb-1">Senior Frontend Developer</h4>
                  <p className="text-sm text-secondary">Match Result</p>
                </div>
                <div className="chip chip-emerald">High Match</div>
              </div>
              <div className="flex items-center justify-center mb-8">
                {/* Score Ring Mockup */}
                <div className="relative w-32 h-32 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="64" cy="64" r="56" className="score-ring-track stroke-white/10 stroke-[8] fill-none" />
                    <circle cx="64" cy="64" r="56" strokeDasharray="351.858" strokeDashoffset="52.77" className="score-ring-fill stroke-emerald-500 stroke-[8] fill-none" strokeLinecap="round" />
                  </svg>
                  <div className="absolute flex flex-col items-center">
                    <span className="text-3xl font-bold text-emerald-400">85%</span>
                  </div>
                </div>
              </div>
              <div>
                <p className="text-sm text-secondary mb-3">Matching Skills</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="chip chip-neutral">React</span>
                  <span className="chip chip-neutral">TypeScript</span>
                  <span className="chip chip-neutral">Tailwind CSS</span>
                </div>
                <p className="text-sm text-emerald-400 bg-emerald-400/10 p-3 rounded-lg">
                  Verdict: Strong candidate. Missing 'GraphQL' experience, but core skills align perfectly.
                </p>
              </div>
            </div>
          </FadeInSection>
        </div>
      </section>

      {/* Section 5: For HR Teams */}
      <section className="py-24 bg-mesh-subtle">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <FadeInSection className="order-2 lg:order-1 relative">
              <div className="absolute inset-0 bg-amber-500/10 blur-3xl rounded-full" />
              <div className="card-dark relative p-6 rounded-2xl border border-white/10">
                <h4 className="text-lg font-bold mb-4">Candidate Leaderboard</h4>
                <div className="flex flex-col gap-3">
                  {[
                    { name: 'Sarah Jenkins', score: 92, status: 'Top Pick', color: 'emerald' },
                    { name: 'Michael Chen', score: 88, status: 'Strong', color: 'emerald' },
                    { name: 'David Smith', score: 76, status: 'Average', color: 'amber' }
                  ].map((cand, i) => (
                    <div key={i} className="glass-md p-4 rounded-xl flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center font-bold text-sm">
                          {cand.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <div className="text-sm font-bold">{cand.name}</div>
                          <div className={`text-xs text-${cand.color}-400`}>{cand.status}</div>
                        </div>
                      </div>
                      <div className="text-xl font-black">{cand.score}</div>
                    </div>
                  ))}
                </div>
              </div>
            </FadeInSection>

            <FadeInSection delay="delay-200" className="order-1 lg:order-2 flex flex-col items-start">
              <div className="chip chip-amber mb-6">For HR Teams</div>
              <h2 className="text-3xl md:text-4xl font-bold text-primary mb-6">Rank Candidates in Seconds</h2>
              <p className="text-secondary text-lg mb-8">
                Stop reading hundreds of resumes. Upload your batch, provide the job description, and get an instantly scored leaderboard of top talent.
              </p>
              <ul className="flex flex-col gap-4 mb-10">
                {['Bulk resume processing', 'AI-powered candidate ranking', 'Side-by-side comparison', 'CSV export & reporting'].map((item, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                      <Check className="w-4 h-4 text-amber-400" />
                    </div>
                    <span className="text-primary">{item}</span>
                  </li>
                ))}
              </ul>
              <Link to="/demo/hr" className="btn-secondary px-6 py-3 rounded-xl font-medium inline-flex items-center gap-2">
                Try HR Demo <ArrowRight className="w-4 h-4" />
              </Link>
            </FadeInSection>
          </div>
        </div>
      </section>

      {/* Section 6: Feature Grid */}
      <section className="py-24 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeInSection className="text-center mb-16">
          <h2 className="gradient-text text-3xl md:text-4xl font-bold mb-4">Everything You Need</h2>
        </FadeInSection>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { icon: Brain, title: 'AI-Powered Scoring', desc: 'Groq LLM analyzes skills, experience, and potential with deterministic scoring' },
            { icon: Target, title: 'Skill Gap Analysis', desc: 'Instantly see matching and missing skills for every candidate' },
            { icon: Upload, title: 'Bulk Upload', desc: 'Drag and drop multiple resumes. Supports PDF and DOCX formats' },
            { icon: Download, title: 'CSV Export', desc: 'Export ranked results for your team with one click' },
            { icon: Layers, title: 'Side-by-Side Compare', desc: 'Compare candidates head-to-head across all metrics' },
            { icon: Shield, title: 'Secure & Private', desc: 'Your data stays private. Enterprise-grade security' }
          ].map((feat, i) => (
            <FadeInSection key={i} delay={`delay-${(i % 3) * 100}`} className="card-dark card-glow p-6 rounded-2xl flex flex-col gap-4">
              <div className="w-12 h-12 rounded-full gradient-border flex items-center justify-center bg-white/5">
                <feat.icon className="w-6 h-6 text-violet-400" />
              </div>
              <h4 className="font-bold text-lg">{feat.title}</h4>
              <p className="text-secondary text-sm leading-relaxed">{feat.desc}</p>
            </FadeInSection>
          ))}
        </div>
      </section>

      {/* Section 7: CTA Banner */}
      <section className="py-24 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeInSection className="relative rounded-3xl overflow-hidden p-12 text-center isolate">
          <div className="absolute inset-0 bg-gradient-to-br from-violet-600 via-indigo-600 to-blue-600 animate-gradient-rotate -z-10" />
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Ready to Transform Your Hiring?</h2>
          <p className="text-white/80 text-lg mb-10 max-w-2xl mx-auto">
            Join thousands of recruiters and job seekers using AI-powered matching
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/register" className="bg-white text-[#0a0a0f] hover:bg-white/90 px-8 py-3 rounded-xl font-semibold text-lg transition-colors">
              Get Started Free
            </Link>
            <Link to="/demo/hr" className="glass-md border-white/20 text-white hover:bg-white/10 px-8 py-3 rounded-xl font-medium text-lg transition-colors">
              View Demo
            </Link>
          </div>
        </FadeInSection>
      </section>

      <Footer />
    </div>
  );
}
