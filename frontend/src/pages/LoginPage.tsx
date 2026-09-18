import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, Loader2, Check, ArrowLeft, Sparkles } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await login({ email, password });
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to login. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex">
      {/* LEFT HALF */}
      <div className="hidden lg:flex lg:w-1/2 bg-mesh relative overflow-hidden flex-col justify-center items-center p-12">
        <div className="orb orb-violet w-[200px] h-[200px] top-12 left-12 animate-orb-drift"></div>
        <div className="orb orb-blue w-[300px] h-[300px] bottom-12 right-12 animate-orb-drift"></div>

        <div className="relative z-10 max-w-lg w-full">
          <div className="flex items-center gap-3 mb-8 animate-fade-in-up">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
              <Sparkles className="text-white w-6 h-6" />
            </div>
            <span className="text-2xl font-bold gradient-text">ResumeAI</span>
          </div>

          <h1 className="text-4xl font-bold gradient-text mb-6 animate-fade-in-up delay-100 whitespace-pre-line">
            Match Resumes{'\n'}With Precision
          </h1>

          <p className="text-secondary text-lg mb-10 animate-fade-in-up delay-200">
            Our AI-powered platform helps you find the perfect match between candidates and job requirements in seconds.
          </p>

          <div className="space-y-4 animate-fade-in-up delay-300">
            {[
              'AI-powered skill matching',
              'Instant candidate ranking',
              'Detailed gap analysis',
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
          <div className="mb-8 text-center sm:text-left animate-fade-in-up">
            <h2 className="text-2xl font-bold text-primary mb-2">Welcome back</h2>
            <p className="text-secondary">Sign in to continue to ResumeAI</p>
          </div>

          <form onSubmit={handleSubmit} className="card-dark p-6 md:p-8 rounded-2xl animate-fade-in-up delay-200">
            <div className="space-y-5">
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
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-secondary" htmlFor="password">
                    Password
                  </label>
                  <a href="#" className="text-sm font-medium text-violet-400 hover:text-violet-300 transition-colors">
                    Forgot password?
                  </a>
                </div>
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
                    <span>Signing in...</span>
                  </>
                ) : (
                  <span>Sign In</span>
                )}
              </button>
            </div>
          </form>

          <div className="mt-8 flex items-center justify-center gap-4 text-sm text-muted animate-fade-in-up delay-300">
            <div className="h-px bg-white/10 flex-1"></div>
            <span>or</span>
            <div className="h-px bg-white/10 flex-1"></div>
          </div>

          <p className="mt-8 text-center text-secondary text-sm animate-fade-in-up delay-300">
            Don't have an account?{' '}
            <Link to="/register" className="font-medium text-violet-400 hover:text-violet-300 transition-colors">
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
