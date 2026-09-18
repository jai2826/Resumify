import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate } from 'react-router-dom';
import { 
  Sparkles, 
  Download, 
  Search, 
  Filter, 
  Users, 
  CheckCircle2, 
  Loader2, 
  BarChart3,
  Layers,
  LogOut,
  FileText
} from "lucide-react";
import { JobDescriptionInput } from "./components/JobDescriptionInput";
import { ResumeUploader } from "./components/ResumeUploader";
import { CandidateCard } from "./components/CandidateCard";
import { CandidateDetailModal } from "./components/CandidateDetailModal";
import { matchApi, checkHealth } from "./api/client";
import { JobD, Resume, MatchResult, MatchResponse } from "./types";
import { AuthProvider, useAuth } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

// Pages
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DemoJobSeekerPage from "./pages/DemoJobSeekerPage";
import DemoHRPage from "./pages/DemoHRPage";

// Components
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

function DashboardContent() {
  const { user, logout } = useAuth();
  
  const [backendOnline, setBackendOnline] = useState<boolean | null>(null);
  const [activeJob, setActiveJob] = useState<JobD | null>(null);
  const [uploadedResumes, setUploadedResumes] = useState<Resume[]>([]);
  const [matchResults, setMatchResults] = useState<MatchResult[]>([]);
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [minScoreFilter, setMinScoreFilter] = useState<number>(0);

  const [selectedCandidateForModal, setSelectedCandidateForModal] = useState<MatchResult | null>(null);
  const [compareResumeIds, setCompareResumeIds] = useState<string[]>([]);
  const [showCompareModal, setShowCompareModal] = useState<boolean>(false);

  useEffect(() => {
    checkHealth()
      .then(() => setBackendOnline(true))
      .catch(() => setBackendOnline(false));
  }, []);

  const handleResumesUploaded = (newResumes: Resume[]) => {
    setUploadedResumes((prev) => {
      const prevFiltered = prev.filter(
        (p) => !newResumes.some((n) => n.id === p.id || (n.filename && n.filename === p.filename))
      );
      return [...prevFiltered, ...newResumes];
    });
  };

  const handleRunEvaluation = async () => {
    if (!activeJob) {
      alert("Please save or load a Job Description first!");
      return;
    }
    if (uploadedResumes.length === 0) {
      alert("Please upload at least one resume to evaluate!");
      return;
    }

    setIsEvaluating(true);
    try {
      const targetResumeIds = uploadedResumes.map((r) => r.id);
      const response: MatchResponse = await matchApi.evaluate(
        activeJob.id,
        targetResumeIds.length > 0 ? targetResumeIds : undefined
      );
      setMatchResults(response.results);
    } catch (err: any) {
      alert(err.response?.data?.detail || "Failed to evaluate candidates.");
    } finally {
      setIsEvaluating(false);
    }
  };

  const toggleCompare = (resumeId: string) => {
    setCompareResumeIds((prev) =>
      prev.includes(resumeId) ? prev.filter((id) => id !== resumeId) : [...prev, resumeId]
    );
  };

  const filteredResults = matchResults.filter((item) => {
    const matchesName = item.candidate_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSkill = item.details.matching_skills.some((s) =>
      s.toLowerCase().includes(searchQuery.toLowerCase())
    );
    const matchesScore = item.score >= minScoreFilter;
    return (matchesName || matchesSkill) && matchesScore;
  });

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar variant="dashboard" backendOnline={backendOnline} user={user} onLogout={logout} />
      
      <main className="max-w-7xl mx-auto px-6 py-8 w-full flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-5 space-y-6">
            <JobDescriptionInput
              activeJob={activeJob}
              onJobCreated={(job) => setActiveJob(job)}
            />

            <ResumeUploader onUploadSuccess={handleResumesUploaded} />

            {uploadedResumes.length > 0 && (
              <div className="card-dark rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-violet-500/10 text-violet-400 rounded-lg border border-violet-500/20">
                    <Users className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-primary">
                      {uploadedResumes.length} Candidate(s) Loaded
                    </h4>
                    <p className="text-xs text-secondary mt-0.5">Ready for AI job comparison</p>
                  </div>
                </div>

                <button
                  onClick={handleRunEvaluation}
                  disabled={isEvaluating || !activeJob}
                  className={`btn-primary w-full sm:w-auto text-sm py-2.5 px-5 flex items-center justify-center gap-2 ${
                    !isEvaluating && activeJob ? 'animate-pulse-glow' : ''
                  }`}
                >
                  {isEvaluating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Evaluating...
                    </>
                  ) : (
                    <>
                      <BarChart3 className="w-4 h-4" />
                      Match & Rank
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          <div className="lg:col-span-7 space-y-6">
            <div className="glass rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 absolute left-3 top-3 text-muted" />
                <input
                  type="text"
                  placeholder="Search by name or skill..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input-dark w-full pl-9 pr-3 py-2 text-sm"
                />
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                <div className="flex items-center gap-1.5 text-sm text-secondary">
                  <Filter className="w-4 h-4" />
                  <select
                    value={minScoreFilter}
                    onChange={(e) => setMinScoreFilter(Number(e.target.value))}
                    className="input-dark py-1.5 px-3 text-sm rounded-lg"
                  >
                    <option value={0}>All Scores</option>
                    <option value={80}>80+ Points</option>
                    <option value={60}>60+ Points</option>
                  </select>
                </div>

                {activeJob && matchResults.length > 0 && (
                  <a
                    href={matchApi.exportCsvUrl(activeJob.id)}
                    download
                    className="btn-ghost flex items-center gap-1.5 px-3 py-2 text-sm font-medium"
                  >
                    <Download className="w-4 h-4" />
                    Export CSV
                  </a>
                )}
              </div>
            </div>

            {filteredResults.length > 0 ? (
              <div className="space-y-4">
                {filteredResults.map((result, index) => (
                  <CandidateCard
                    key={result.resume_id}
                    result={result}
                    rank={index + 1}
                    index={index}
                    isSelectedForCompare={compareResumeIds.includes(result.resume_id)}
                    onToggleCompare={toggleCompare}
                    onViewDetails={(res) => setSelectedCandidateForModal(res)}
                  />
                ))}
              </div>
            ) : (
              <div className="card-dark border-dashed border-white/10 p-12 text-center flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                  <Users className="w-8 h-8 text-muted" />
                </div>
                <h3 className="text-base font-semibold text-primary">No Evaluated Candidates Yet</h3>
                <p className="text-sm text-secondary mt-2 max-w-sm mx-auto">
                  Upload candidate resumes on the left and click <strong className="text-primary">"Match & Rank"</strong> to view AI fit analysis.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
      
      <Footer />

      {compareResumeIds.length >= 2 && (
        <div className="fixed bottom-8 inset-x-0 mx-auto max-w-md glass-md rounded-full px-6 py-3 flex items-center justify-between z-40 animate-fade-in-up border border-white/10 shadow-[0_0_30px_rgba(139,92,246,0.15)]">
          <div className="flex items-center gap-2 text-sm">
            <Layers className="w-4 h-4 text-violet-400" />
            <span className="text-primary font-medium">{compareResumeIds.length} candidates selected</span>
          </div>
          <button
            onClick={() => setShowCompareModal(true)}
            className="btn-primary text-sm px-5 py-2 rounded-full"
          >
            Compare Side-by-Side
          </button>
        </div>
      )}

      {selectedCandidateForModal && (
        <CandidateDetailModal
          result={selectedCandidateForModal}
          resumeData={uploadedResumes.find((r) => r.id === selectedCandidateForModal.resume_id)}
          onClose={() => setSelectedCandidateForModal(null)}
        />
      )}

      {showCompareModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur flex items-center justify-center p-4 animate-fade-in">
          <div className="glass-md border border-white/10 rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col animate-scale-in">
            <div className="px-6 py-4 bg-white/5 border-b border-white/10 flex justify-between items-center">
              <h3 className="text-lg font-bold text-primary flex items-center gap-2">
                <Layers className="w-5 h-5 text-violet-400" />
                Candidate Side-by-Side Comparison
              </h3>
              <button
                onClick={() => setShowCompareModal(false)}
                className="text-secondary hover:text-primary transition-colors p-1"
              >
                ✕
              </button>
            </div>
            <div className="p-6 overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="p-3 font-medium text-secondary">Metric</th>
                    {compareResumeIds.map((id) => {
                      const c = matchResults.find((r) => r.resume_id === id);
                      return (
                        <th key={id} className="p-3 font-bold text-violet-300">
                          {c?.candidate_name}
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  <tr className="hover:bg-white/5 transition-colors">
                    <td className="p-3 font-medium text-primary">Match Score</td>
                    {compareResumeIds.map((id) => {
                      const c = matchResults.find((r) => r.resume_id === id);
                      return (
                        <td key={id} className="p-3 font-bold text-emerald-400">
                          {c?.score.toFixed(1)} pts
                        </td>
                      );
                    })}
                  </tr>
                  <tr className="hover:bg-white/5 transition-colors">
                    <td className="p-3 font-medium text-primary">Experience Met?</td>
                    {compareResumeIds.map((id) => {
                      const c = matchResults.find((r) => r.resume_id === id);
                      return (
                        <td key={id} className="p-3 text-secondary">
                          {c?.details.experience_met ? (
                            <span className="text-emerald-400">✅ Yes</span>
                          ) : (
                            <span className="text-rose-400">❌ Below req</span>
                          )}{" "}
                          ({c?.details.candidate_experience_years} yrs)
                        </td>
                      );
                    })}
                  </tr>
                  <tr className="hover:bg-white/5 transition-colors">
                    <td className="p-3 font-medium text-primary">Matching Skills</td>
                    {compareResumeIds.map((id) => {
                      const c = matchResults.find((r) => r.resume_id === id);
                      return (
                        <td key={id} className="p-3">
                          <div className="flex flex-wrap gap-1.5">
                            {c?.details.matching_skills.length ? (
                              c.details.matching_skills.map((s, i) => (
                                <span key={i} className="chip-emerald text-[10px] py-0.5">{s}</span>
                              ))
                            ) : (
                              <span className="text-secondary italic">None</span>
                            )}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                  <tr className="hover:bg-white/5 transition-colors">
                    <td className="p-3 font-medium text-primary">Missing Skills</td>
                    {compareResumeIds.map((id) => {
                      const c = matchResults.find((r) => r.resume_id === id);
                      return (
                        <td key={id} className="p-3">
                          <div className="flex flex-wrap gap-1.5">
                            {c?.details.missing_skills.length ? (
                              c.details.missing_skills.map((s, i) => (
                                <span key={i} className="chip-rose text-[10px] py-0.5">{s}</span>
                              ))
                            ) : (
                              <span className="text-emerald-400 italic">None</span>
                            )}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                  <tr className="hover:bg-white/5 transition-colors">
                    <td className="p-3 font-medium text-primary">Verdict</td>
                    {compareResumeIds.map((id) => {
                      const c = matchResults.find((r) => r.resume_id === id);
                      return (
                        <td key={id} className="p-3 italic text-secondary text-xs leading-relaxed">
                          "{c?.details.verdict}"
                        </td>
                      );
                    })}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-mesh noise flex flex-col font-sans">
        <Routes>
          <Route path='/' element={<LandingPage />} />
          <Route path='/login' element={<LoginPage />} />
          <Route path='/register' element={<RegisterPage />} />
          <Route path='/demo/job-seeker' element={<DemoJobSeekerPage />} />
          <Route path='/demo/hr' element={<DemoHRPage />} />
          <Route path='/dashboard' element={
            <ProtectedRoute><DashboardContent /></ProtectedRoute>
          } />
          <Route path='*' element={<Navigate to='/' replace />} />
        </Routes>
      </div>
    </AuthProvider>
  );
};

export default App;
