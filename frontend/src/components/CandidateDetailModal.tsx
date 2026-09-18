import React from "react";
import { X, Mail, Phone, Briefcase, GraduationCap, Code, Award, CheckCircle, XCircle } from "lucide-react";
import { MatchResult, Resume } from "../types";

interface CandidateDetailModalProps {
  result: MatchResult;
  resumeData?: Resume;
  onClose: () => void;
}

export const CandidateDetailModal: React.FC<CandidateDetailModalProps> = ({
  result,
  resumeData,
  onClose,
}) => {
  const { score, details } = result;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="glass-md rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-slide-up-modal border border-white/10">
        <div className="px-6 py-5 bg-gradient-to-r from-violet-600/20 to-indigo-600/20 border-b border-white/6 flex justify-between items-start">
          <div>
            <span className="chip-violet text-[10px] mb-2 inline-block">
              Candidate Profile
            </span>
            <h2 className="text-2xl font-bold text-primary mt-1 tracking-tight">{result.candidate_name}</h2>
            <div className="flex flex-wrap items-center gap-4 text-xs text-secondary mt-2.5">
              {resumeData?.email && (
                <span className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-violet-400" />
                  {resumeData.email}
                </span>
              )}
              {resumeData?.phone && (
                <span className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-violet-400" />
                  {resumeData.phone}
                </span>
              )}
              {resumeData?.filename && (
                <span className="text-muted">File: {resumeData.filename}</span>
              )}
            </div>
          </div>

          <div className="flex items-start gap-5">
            <div className="text-right">
              <span className="text-xs text-secondary font-medium uppercase tracking-wider block mb-1">Match Score</span>
              <span className="text-3xl font-black gradient-text">{score.toFixed(1)}</span>
            </div>
            <button
              onClick={onClose}
              className="text-secondary hover:text-primary p-1.5 rounded-lg hover:bg-white/5 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto space-y-6 text-sm custom-scrollbar">
          <div className="glass card-dark border-l-4 border-l-violet-500 rounded-xl p-5">
            <h4 className="font-semibold text-primary text-xs uppercase tracking-wider mb-2">
              AI Recruiter Assessment
            </h4>
            <p className="text-secondary leading-relaxed italic">"{details.verdict}"</p>
          </div>

          {details.score_breakdown && (
            <div className="glass rounded-xl p-5 border border-white/5">
              <h4 className="font-semibold text-primary text-xs uppercase tracking-wider mb-4 flex items-center justify-between">
                <span>Deterministic Score Breakdown</span>
                <span className="text-violet-400 font-bold">{details.score_breakdown.total_score.toFixed(1)} PTS TOTAL</span>
              </h4>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-secondary">Required Skills (60 pts)</span>
                    <span className="font-bold text-violet-400">{details.score_breakdown.required_skills_score.toFixed(1)} pts</span>
                  </div>
                  <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-violet-500 rounded-full transition-transform duration-1000 ease-out origin-left animate-scale-in"
                      style={{ width: `${(details.score_breakdown.required_skills_score / 60) * 100}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-secondary">Experience (25 pts)</span>
                    <span className="font-bold text-emerald-400">{details.score_breakdown.experience_score.toFixed(1)} pts</span>
                  </div>
                  <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-emerald-500 rounded-full transition-transform duration-1000 ease-out origin-left animate-scale-in"
                      style={{ width: `${(details.score_breakdown.experience_score / 25) * 100}%`, animationDelay: '100ms' }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-secondary">Preferred Skills (15 pts)</span>
                    <span className="font-bold text-amber-400">{details.score_breakdown.preferred_skills_score.toFixed(1)} pts</span>
                  </div>
                  <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-amber-500 rounded-full transition-transform duration-1000 ease-out origin-left animate-scale-in"
                      style={{ width: `${(details.score_breakdown.preferred_skills_score / 15) * 100}%`, animationDelay: '200ms' }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="glass rounded-xl p-5 border border-emerald-500/20 bg-emerald-500/5">
              <h4 className="font-semibold text-emerald-400 text-xs uppercase tracking-wider flex items-center gap-1.5 mb-3">
                <CheckCircle className="w-4 h-4" />
                Matching Skills ({details.matching_skills.length})
              </h4>
              <div className="flex flex-wrap gap-2">
                {details.matching_skills.map((skill, i) => (
                  <span key={i} className="chip-emerald text-xs">{skill}</span>
                ))}
              </div>
            </div>

            <div className="glass rounded-xl p-5 border border-rose-500/20 bg-rose-500/5">
              <h4 className="font-semibold text-rose-400 text-xs uppercase tracking-wider flex items-center gap-1.5 mb-3">
                <XCircle className="w-4 h-4" />
                Missing Required Skills ({details.missing_skills.length})
              </h4>
              <div className="flex flex-wrap gap-2">
                {details.missing_skills.length > 0 ? (
                  details.missing_skills.map((skill, i) => (
                    <span key={i} className="chip-rose text-xs">{skill}</span>
                  ))
                ) : (
                  <span className="text-sm text-emerald-400 italic">No missing skills detected.</span>
                )}
              </div>
            </div>
          </div>

          {resumeData?.experience && resumeData.experience.length > 0 && (
            <div>
              <h4 className="font-bold text-primary text-sm flex items-center gap-2 mb-4">
                <Briefcase className="w-4 h-4 text-violet-400" />
                Work Experience & Internships
              </h4>
              <div className="space-y-4">
                {resumeData.experience.map((exp, idx) => (
                  <div key={idx} className="card-dark border-l-2 border-l-violet-500 rounded-xl p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h5 className="font-bold text-primary">{exp.role || "Role not listed"}</h5>
                        <p className="text-sm text-violet-400 font-medium mt-0.5">
                          {exp.company || "Company not specified"}
                        </p>
                      </div>
                      {exp.duration && (
                        <span className="chip-neutral py-1">
                          {exp.duration}
                        </span>
                      )}
                    </div>
                    {exp.description && (
                      <p className="mt-3 text-sm text-secondary leading-relaxed whitespace-pre-line">
                        {exp.description}
                      </p>
                    )}
                    {exp.skills_used && exp.skills_used.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {exp.skills_used.map((s, si) => (
                          <span key={si} className="chip text-[10px] bg-white/5 border-white/10 text-secondary">
                            {s}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {resumeData?.education && resumeData.education.length > 0 && (
              <div className="glass rounded-xl p-5">
                <h4 className="font-bold text-primary text-xs uppercase tracking-wider flex items-center gap-2 mb-3">
                  <GraduationCap className="w-4 h-4 text-violet-400" />
                  Education
                </h4>
                <ul className="list-disc pl-5 space-y-1.5 text-sm text-secondary">
                  {resumeData.education.map((edu, i) => (
                    <li key={i}>{edu}</li>
                  ))}
                </ul>
              </div>
            )}

            {resumeData?.projects && resumeData.projects.length > 0 && (
              <div className="glass rounded-xl p-5">
                <h4 className="font-bold text-primary text-xs uppercase tracking-wider flex items-center gap-2 mb-3">
                  <Code className="w-4 h-4 text-violet-400" />
                  Key Projects
                </h4>
                <ul className="list-disc pl-5 space-y-1.5 text-sm text-secondary">
                  {resumeData.projects.map((proj, i) => (
                    <li key={i}>{proj}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        <div className="px-6 py-4 bg-white/5 border-t border-white/6 flex justify-end">
          <button
            onClick={onClose}
            className="btn-secondary text-sm px-5 py-2"
          >
            Close Profile
          </button>
        </div>
      </div>
    </div>
  );
};
