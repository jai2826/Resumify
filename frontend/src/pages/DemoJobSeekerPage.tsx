import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Upload, FileText, Loader2, AlertCircle, ArrowLeft } from 'lucide-react';
import { useDemoLimit } from '../hooks/useDemoLimit';
import { demoApi } from '../api/client';
import { MatchResult } from '../types';
import { UpgradeModal } from '../components/UpgradeModal';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const SAMPLE_JD = `We are looking for a Software Engineer with experience in React, TypeScript, and Node.js. 
You should have 3+ years of experience building scalable web applications. 
Nice to have: Experience with AWS, Docker, and CI/CD pipelines.
Strong communication skills and ability to work in a fast-paced environment are essential.`;

export default function DemoJobSeekerPage() {
  const [jobText, setJobText] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<MatchResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { usesRemaining, maxUses, isLimitReached, recordUse } = useDemoLimit('jobseeker', 2);

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleAnalyze = async () => {
    if (isLimitReached) {
      setIsModalOpen(true);
      return;
    }

    if (!jobText || !selectedFile) return;

    setIsAnalyzing(true);
    setError(null);

    try {
      const matchRes = await demoApi.matchSingle(jobText, selectedFile);
      setResult(matchRes);
      recordUse();
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'An error occurred during analysis');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // SVG Score Ring rendering logic
  const renderScoreRing = (score: number) => {
    const radius = 60;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (score / 100) * circumference;
    
    return (
      <div className="relative w-40 h-40 flex items-center justify-center mx-auto mb-6">
        <svg className="w-full h-full transform -rotate-90">
          <circle 
            className="text-white/10" 
            strokeWidth="10" 
            stroke="currentColor" 
            fill="transparent" 
            r={radius} 
            cx="80" 
            cy="80" 
          />
          <circle 
            className="text-violet-500 transition-all duration-1000 ease-out" 
            strokeWidth="10" 
            strokeDasharray={circumference} 
            strokeDashoffset={strokeDashoffset} 
            strokeLinecap="round" 
            stroke="currentColor" 
            fill="transparent" 
            r={radius} 
            cx="80" 
            cy="80" 
          />
        </svg>
        <div className="absolute flex flex-col items-center justify-center">
          <span className="text-4xl font-bold text-white">{score}</span>
          <span className="text-xs text-muted">/ 100</span>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex flex-col font-sans">
      <Navbar variant="marketing" />
      
      <main className="flex-grow max-w-4xl w-full mx-auto py-12 px-4 animate-fade-in-up">
        <div className="mb-8">
          <Link to="/" className="inline-flex items-center text-secondary hover:text-white transition-colors mb-6 text-sm">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
          </Link>
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold gradient-text mb-2">Job Seeker Demo</h1>
              <p className="text-secondary">Check how well your resume matches a job description</p>
            </div>
            
            <div className="glass-sm rounded-full px-4 py-2 flex items-center gap-3">
              <span className="text-sm text-secondary font-medium">{usesRemaining} of {maxUses} free analyses remaining</span>
              <div className="flex gap-1">
                {Array.from({ length: maxUses }).map((_, i) => (
                  <div key={i} className={`w-2 h-2 rounded-full ${i < (maxUses - usesRemaining) ? 'bg-violet-500/30' : 'bg-violet-500'}`}></div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center gap-3">
            <AlertCircle className="w-5 h-5" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* LEFT COLUMN */}
          <div className="space-y-6">
            <div className="card-dark p-5">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-white font-medium">Job Description</h2>
                <button 
                  onClick={() => setJobText(SAMPLE_JD)}
                  className="text-xs flex items-center gap-1 text-violet-400 hover:text-violet-300 transition-colors"
                >
                  <Sparkles className="w-3 h-3" /> Load Sample
                </button>
              </div>
              <textarea 
                className="textarea-dark w-full h-40 resize-none font-mono text-sm" 
                placeholder="Paste the job description here..."
                value={jobText}
                onChange={(e) => setJobText(e.target.value)}
              />
            </div>

            <div className="card-dark p-5">
              <h2 className="text-white font-medium mb-3">Your Resume</h2>
              <div 
                className="border-2 border-dashed border-white/10 rounded-xl p-8 flex flex-col items-center justify-center text-center hover:border-violet-500/50 transition-colors cursor-pointer bg-white/5"
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleFileDrop}
                onClick={() => document.getElementById('demo-resume-upload')?.click()}
              >
                <input 
                  type="file" 
                  id="demo-resume-upload" 
                  className="hidden" 
                  accept=".pdf,.docx,.doc" 
                  onChange={handleFileChange} 
                />
                {selectedFile ? (
                  <>
                    <div className="w-12 h-12 rounded-full bg-violet-500/20 flex items-center justify-center mb-3">
                      <FileText className="w-6 h-6 text-violet-400" />
                    </div>
                    <p className="text-white text-sm font-medium mb-1 truncate max-w-[200px]">{selectedFile.name}</p>
                    <p className="text-xs text-muted">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                  </>
                ) : (
                  <>
                    <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-3">
                      <Upload className="w-6 h-6 text-secondary" />
                    </div>
                    <p className="text-white text-sm font-medium mb-1">Click or drag resume here</p>
                    <p className="text-xs text-muted">Supports PDF, DOCX</p>
                  </>
                )}
              </div>
            </div>

            <button 
              className="btn-primary w-full py-4 text-lg font-medium flex justify-center items-center gap-2"
              onClick={handleAnalyze}
              disabled={!jobText || !selectedFile || isAnalyzing}
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Analyzing Match...
                </>
              ) : (
                'Analyze My Fit'
              )}
            </button>
          </div>

          {/* RIGHT COLUMN */}
          <div>
            {!result && !isAnalyzing ? (
              <div className="h-full min-h-[400px] border-2 border-dashed border-white/5 rounded-2xl flex flex-col items-center justify-center p-8 text-center bg-white/[0.02]">
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                  <Sparkles className="w-8 h-8 text-secondary/50" />
                </div>
                <h3 className="text-secondary font-medium mb-2">Your results will appear here</h3>
                <p className="text-sm text-muted">Paste a job description and upload your resume to see your match score and AI feedback.</p>
              </div>
            ) : isAnalyzing ? (
              <div className="h-full min-h-[400px] card-dark flex flex-col items-center justify-center p-8">
                <div className="w-16 h-16 relative mb-6">
                  <div className="absolute inset-0 rounded-full border-t-2 border-violet-500 animate-spin"></div>
                  <div className="absolute inset-2 rounded-full border-r-2 border-indigo-500 animate-spin-slow"></div>
                </div>
                <h3 className="text-white font-medium mb-2 animate-pulse">AI is analyzing your fit...</h3>
                <p className="text-sm text-muted text-center max-w-xs">Extracting skills, evaluating experience, and generating personalized insights.</p>
              </div>
            ) : result ? (
              <div className="space-y-4 animate-fade-in">
                <div className="card-glow p-6 text-center">
                  <h3 className="text-secondary text-sm font-medium uppercase tracking-wider mb-4">Match Score</h3>
                  {renderScoreRing(result.score)}
                  
                  <div className="mt-4 p-4 rounded-xl bg-white/5 italic text-sm text-white/90 border border-white/10">
                    "{result.details.verdict}"
                  </div>
                </div>

                <div className="card-dark p-5">
                  <h3 className="text-white font-medium mb-4 text-sm border-b border-white/10 pb-2">Skills Analysis</h3>
                  
                  <div className="mb-4">
                    <h4 className="text-xs text-muted mb-2">Matching Skills</h4>
                    <div className="flex flex-wrap gap-2">
                      {result.details.matching_skills.length > 0 ? (
                        result.details.matching_skills.map((skill: string, i: number) => (
                          <span key={i} className="chip chip-emerald">{skill}</span>
                        ))
                      ) : (
                        <span className="text-sm text-muted">No specific skills matched.</span>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs text-muted mb-2">Missing Skills</h4>
                    <div className="flex flex-wrap gap-2">
                      {result.details.missing_skills.length > 0 ? (
                        result.details.missing_skills.map((skill: string, i: number) => (
                          <span key={i} className="chip chip-rose">{skill}</span>
                        ))
                      ) : (
                        <span className="text-sm text-emerald-400">All required skills met!</span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="card-dark p-5">
                  <h3 className="text-white font-medium mb-3 text-sm border-b border-white/10 pb-2">Experience</h3>
                  <div className="flex flex-wrap gap-2">
                     <span className={`chip ${result.details.experience_met ? 'chip-emerald' : 'chip-amber'}`}>
                       {result.details.candidate_experience_years ?? '?'} yrs experience
                     </span>
                     {result.details.experience_met ? <span className="chip chip-emerald">Requirement Met</span> : <span className="chip chip-amber">Below Requirement</span>}
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </main>

      <Footer />
      
      <UpgradeModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        userType="jobseeker" 
      />
    </div>
  );
}
