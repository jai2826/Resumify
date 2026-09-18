import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, User, Loader2, Check, ArrowLeft, Briefcase, GraduationCap, Sparkles } from 'lucide-react';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'hr' | 'job_seeker'>('hr');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await register({ name, email, password, role });
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to register. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex">
      {/* LEFT HALF */}
      <div className="hidden lg:flex lg:w-1/2 bg-mesh relative overflow-hidden flex-col justify-center items-center p-12">
        <div className="orb orb-pink w-[250px] h-[250px] top-20 right-12 animate-orb-drift"></div>
        <div className="orb orb-emerald w-[200px] h-[200px] bottom-24 left-12 animate-orb-drift"></div>

        <div className="relative z-10 max-w-lg w-full">
          <div className="flex items-center gap-3 mb-8 animate-fade-in-up">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
              <Sparkles className="text-white w-6 h-6" />
            </div>
            <span className="text-2xl font-bold gradient-text">ResumeAI</span>
          </div>

          <h1 className="text-4xl font-bold gradient-text mb-6 animate-fade-in-up delay-100 whitespace-pre-line">
            Start Matching{'\n'}Smarter Today
          </h1>

          <p className="text-secondary text-lg mb-10 animate-fade-in-up delay-200">
            Join thousands of professionals and companies using our platform to find the perfect fit.
          </p>

          <div className="space-y-4 animate-fade-in-up delay-300">
            {[
              'Free demo available',
              'No credit card required',
              'Setup in 30 seconds',
            ].map((feature, idx) => (
              <div key={idx} className="glass px-5 py-3 rounded-full flex items-center gap-3 w-max">
                <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center">
                  <Check className="w-4 h-4 text-emerald-400" />
                </div>
                <span className="text-primary font-medium">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT HALF */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center relative p-8">
        <div className="absolute top-8 left-8">
          <Link to="/" className="text-secondary hover:text-primary flex items-center gap-2 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to home</span>
          </Link>
        </div>

        <div className="max-w-md w-full mx-auto">
          <div className="mb-6 text-center sm:text-left animate-fade-in-up">
            <h2 className="text-2xl font-bold text-primary mb-2">Create an account</h2>
            <p className="text-secondary">Join ResumeAI today</p>
          </div>

          <form onSubmit={handleSubmit} className="card-dark p-6 rounded-2xl animate-fade-in-up delay-200">
            <div className="space-y-5">
              
              <div>
                <label className="block text-sm font-medium text-secondary mb-3">
                  I am a...
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setRole('hr')}
                    className={`flex items-center gap-3 p-3 rounded-xl border transition-all duration-200 hover:scale-[1.02] ${
                      role === 'hr'
                        ? 'border-violet-500/50 bg-violet-500/10 shadow-[0_0_15px_rgba(139,92,246,0.1)]'
                        : 'border-white/10 bg-white/5 hover:bg-white/10'
                    }`}
                  >
                    <Briefcase className={`w-5 h-5 ${role === 'hr' ? 'text-violet-400' : 'text-muted'}`} />
                    <span className={`text-sm font-medium ${role === 'hr' ? 'text-violet-100' : 'text-secondary'}`}>
                      HR Professional
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('job_seeker')}
                    className={`flex items-center gap-3 p-3 rounded-xl border transition-all duration-200 hover:scale-[1.02] ${
                      role === 'job_seeker'
                        ? 'border-violet-500/50 bg-violet-500/10 shadow-[0_0_15px_rgba(139,92,246,0.1)]'
                        : 'border-white/10 bg-white/5 hover:bg-white/10'
                    }`}
                  >
                    <GraduationCap className={`w-5 h-5 ${role === 'job_seeker' ? 'text-violet-400' : 'text-muted'}`} />
                    <span className={`text-sm font-medium ${role === 'job_seeker' ? 'text-violet-100' : 'text-secondary'}`}>
                      Job Seeker
                    </span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary mb-2" htmlFor="name">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-muted" />
                  </div>
                  <input
                    id="name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="input-dark w-full pl-10 py-2.5 rounded-lg text-primary placeholder-muted focus:ring-2 focus:ring-violet-500/50"
                    placeholder="John Doe"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary mb-2" htmlFor="email">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-muted" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input-dark w-full pl-10 py-2.5 rounded-lg text-primary placeholder-muted focus:ring-2 focus:ring-violet-500/50"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary mb-2" htmlFor="password">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-muted" />
                  </div>
                  <input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input-dark w-full pl-10 py-2.5 rounded-lg text-primary placeholder-muted focus:ring-2 focus:ring-violet-500/50"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              {error && (
                <div className="glass rounded-lg p-3 border border-rose-500/20 bg-rose-500/10 flex items-start gap-3">
                  <p className="text-sm text-rose-400 font-medium">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary w-full py-2.5 rounded-lg font-medium flex items-center justify-center gap-2 mt-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Creating account...</span>
                  </>
                ) : (
                  <span>Register</span>
                )}
              </button>
            </div>
          </form>

          <p className="mt-8 text-center text-secondary text-sm animate-fade-in-up delay-300">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-violet-400 hover:text-violet-300 transition-colors">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
