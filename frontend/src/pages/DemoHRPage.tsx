import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Upload, FileText, Loader2, AlertCircle, ArrowLeft, X as XIcon, ChevronDown, ChevronUp } from 'lucide-react';
import { useDemoLimit } from '../hooks/useDemoLimit';
import { demoApi } from '../api/client';
import { MatchResult } from '../types';
import { UpgradeModal } from '../components/UpgradeModal';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const SAMPLE_JD = `We are looking for a Senior Frontend Developer with deep expertise in React and modern CSS (Tailwind).
Responsibilities include architecting frontend solutions, mentoring junior devs, and optimizing performance.
Requirements: 5+ years experience, solid understanding of web vitals, experience with state management.`;

export default function DemoHRPage() {
  const [jobText, setJobText] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [results, setResults] = useState<MatchResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const { usesRemaining, maxUses, isLimitReached, recordUse } = useDemoLimit('hr', 2);

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files) {
      const newFiles = Array.from(e.dataTransfer.files).slice(0, 3 - selectedFiles.length);
      setSelectedFiles(prev => [...prev, ...newFiles].slice(0, 3));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).slice(0, 3 - selectedFiles.length);
      setSelectedFiles(prev => [...prev, ...newFiles].slice(0, 3));
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleEvaluate = async () => {
    if (isLimitReached) {
      setIsModalOpen(true);
      return;
    }

    if (!jobText || selectedFiles.length === 0) return;

    setIsEvaluating(true);
    setError(null);
    setResults([]);

    try {
      const evalRes = await demoApi.matchMultiple(jobText, selectedFiles);
      // Sort by score descending
      const sortedResults = evalRes.results.sort((a, b) => b.score - a.score);
      setResults(sortedResults);
      recordUse();
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'An error occurred during evaluation');
    } finally {
      setIsEvaluating(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
    if (score >= 70) return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
    if (score >= 50) return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
    return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex flex-col font-sans">
      <Navbar variant="marketing" />
      
      <main className="flex-grow max-w-5xl w-full mx-auto py-12 px-4 animate-fade-in-up">
        <div className="mb-8">
          <Link to="/" className="inline-flex items-center text-secondary hover:text-white transition-colors mb-6 text-sm">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
          </Link>
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold gradient-text-vibrant mb-2">HR Demo</h1>
              <p className="text-secondary">Evaluate and rank candidates against a job description</p>
            </div>
            
            <div className="glass-sm rounded-full px-4 py-2 flex items-center gap-3">
              <span className="text-sm text-secondary font-medium">{usesRemaining} of {maxUses} free evaluations remaining</span>
              <div className="flex gap-1">
                {Array.from({ length: maxUses }).map((_, i) => (
                  <div key={i} className={`w-2 h-2 rounded-full ${i < (maxUses - usesRemaining) ? 'bg-pink-500/30' : 'bg-pink-500'}`}></div>
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* LEFT COLUMN */}
          <div className="space-y-6">
            <div className="card-dark p-5">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-white font-medium">Job Description</h2>
                <button 
                  onClick={() => setJobText(SAMPLE_JD)}
                  className="text-xs flex items-center gap-1 text-pink-400 hover:text-pink-300 transition-colors"
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
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-white font-medium">Candidate Resumes</h2>
                <span className="text-xs text-muted">{selectedFiles.length} / 3 Max</span>
              </div>
              
              {selectedFiles.length < 3 && (
                <div 
                  className="border-2 border-dashed border-white/10 rounded-xl p-6 flex flex-col items-center justify-center text-center hover:border-pink-500/50 transition-colors cursor-pointer bg-white/5 mb-4"
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleFileDrop}
                  onClick={() => document.getElementById('demo-hr-upload')?.click()}
                >
                  <input 
                    type="file" 
                    id="demo-hr-upload" 
                    className="hidden" 
                    accept=".pdf,.docx,.doc"
                    multiple
                    onChange={handleFileChange} 
                  />
                  <Upload className="w-6 h-6 text-secondary mb-2" />
                  <p className="text-white text-sm font-medium mb-1">Upload candidate resumes</p>
                  <p className="text-xs text-muted">Select up to {3 - selectedFiles.length} more file(s)</p>
                </div>
              )}

              {selectedFiles.length > 0 && (
                <div className="space-y-2">
                  {selectedFiles.map((file, idx) => (
                    <div key={idx} className="glass-sm rounded-lg p-3 flex items-center justify-between">
                      <div className="flex items-center gap-3 overflow-hidden">
                        <FileText className="w-5 h-5 text-pink-400 shrink-0" />
                        <div className="truncate">
                          <p className="text-sm text-white truncate max-w-[200px]">{file.name}</p>
                          <p className="text-xs text-muted">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => removeFile(idx)}
                        className="p-1.5 text-secondary hover:text-rose-400 hover:bg-rose-400/10 rounded-md transition-colors"
                      >
                        <XIcon className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button 
              className="btn-primary w-full py-4 text-lg font-medium flex justify-center items-center gap-2"
              onClick={handleEvaluate}
              disabled={!jobText || selectedFiles.length === 0 || isEvaluating}
            >
              {isEvaluating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Evaluating Candidates...
                </>
              ) : (
                'Evaluate Candidates'
              )}
            </button>
          </div>

          {/* RIGHT COLUMN */}
          <div>
            {!results.length && !isEvaluating ? (
              <div className="h-full min-h-[400px] border-2 border-dashed border-white/5 rounded-2xl flex flex-col items-center justify-center p-8 text-center bg-white/[0.02]">
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                  <Sparkles className="w-8 h-8 text-secondary/50" />
                </div>
                <h3 className="text-secondary font-medium mb-2">Rankings will appear here</h3>
                <p className="text-sm text-muted">Paste a JD and upload resumes to instantly evaluate and rank candidates.</p>
              </div>
            ) : isEvaluating ? (
              <div className="h-full min-h-[400px] card-dark flex flex-col items-center justify-center p-8">
                <div className="w-16 h-16 relative mb-6">
                  <div className="absolute inset-0 rounded-full border-t-2 border-pink-500 animate-spin"></div>
                  <div className="absolute inset-2 rounded-full border-r-2 border-indigo-500 animate-spin-slow"></div>
                </div>
                <h3 className="text-white font-medium mb-2 animate-pulse">Evaluating Candidates...</h3>
                <p className="text-sm text-muted text-center max-w-xs">Comparing skills, analyzing experience, and ranking top fits.</p>
              </div>
            ) : (
              <div className="space-y-4 animate-fade-in">
                <h2 className="text-lg font-medium text-white mb-4">Candidate Rankings</h2>
                
                {results.map((res, index) => {
                  const isExpanded = expandedId === (res as any).resume_id || expandedId === index.toString();
                  const rankColors = [
                    'from-amber-400 to-orange-500', 
                    'from-slate-300 to-slate-400', 
                    'from-orange-700 to-amber-800'
                  ];
                  const bgRankColor = index < 3 ? `bg-gradient-to-br ${rankColors[index]}` : 'bg-white/10';
                  
                  const currentId = (res as any).resume_id || index.toString();

                  return (
                    <div key={currentId} className="card-dark overflow-hidden transition-all duration-300">
                      <div 
                        className="p-4 flex items-center gap-4 cursor-pointer hover:bg-white/[0.02] transition-colors"
                        onClick={() => setExpandedId(isExpanded ? null : currentId)}
                      >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${bgRankColor}`}>
                          #{index + 1}
                        </div>
                        
                        <div className="flex-grow">
                          <h3 className="text-white font-medium">{res.candidate_name}</h3>
                          <div className="flex gap-3 text-xs text-muted mt-1">
                            <span>{res.details.matching_skills.length} matched skills</span>
                            <span>•</span>
                            <span>{res.details.missing_skills.length} missing</span>
                          </div>
                        </div>

                        <div className={`px-3 py-1 rounded-full border text-sm font-bold ${getScoreColor(res.score)}`}>
                          {res.score.toFixed(1)}
                        </div>

                        <button className="text-secondary p-1">
                          {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                        </button>
                      </div>

                      {isExpanded && (
                        <div className="p-4 border-t border-white/10 bg-black/20 animate-fade-in-down">
                          <div className="p-3 rounded-lg bg-white/5 italic text-sm text-white/90 border border-white/10 mb-4">
                            "{res.details.verdict}"
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <h4 className="text-xs text-muted mb-2">Matched</h4>
                              <div className="flex flex-wrap gap-1">
                                {res.details.matching_skills.slice(0, 5).map((s: string, i: number) => (
                                  <span key={i} className="text-xs px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/20">{s}</span>
                                ))}
                                {res.details.matching_skills.length > 5 && <span className="text-xs text-muted">+{res.details.matching_skills.length - 5} more</span>}
                              </div>
                            </div>
                            <div>
                              <h4 className="text-xs text-muted mb-2">Missing</h4>
                              <div className="flex flex-wrap gap-1">
                                {res.details.missing_skills.slice(0, 5).map((s: string, i: number) => (
                                  <span key={i} className="text-xs px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/20">{s}</span>
                                ))}
                                {res.details.missing_skills.length > 5 && <span className="text-xs text-muted">+{res.details.missing_skills.length - 5} more</span>}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
      
      <UpgradeModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        userType="hr" 
      />
    </div>
  );
}
