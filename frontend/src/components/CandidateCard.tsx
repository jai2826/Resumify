import React from "react";
import { Check, X, Award, Clock, ArrowUpRight } from "lucide-react";
import { MatchResult } from "../types";

interface CandidateCardProps {
  result: MatchResult;
  rank: number;
  index?: number;
  isSelectedForCompare: boolean;
  onToggleCompare: (resumeId: string) => void;
  onViewDetails: (result: MatchResult) => void;
}

export const CandidateCard: React.FC<CandidateCardProps> = ({
  result,
  rank,
  index = 0,
  isSelectedForCompare,
  onToggleCompare,
  onViewDetails,
}) => {
  const { score, details } = result;

  const getRankBadgeClass = (rankNum: number) => {
    if (rankNum === 1) return "bg-gradient-to-br from-amber-400 to-amber-600 text-white border-amber-300/30";
    if (rankNum === 2) return "bg-gradient-to-br from-slate-300 to-slate-500 text-white border-slate-200/30";
    if (rankNum === 3) return "bg-gradient-to-br from-amber-600 to-amber-800 text-white border-amber-500/30";
    return "glass-sm text-secondary";
  };
  
  const getScoreColorClass = (val: number) => {
    if (val >= 85) return "stroke-emerald-400 text-emerald-400";
    if (val >= 70) return "stroke-blue-400 text-blue-400";
    if (val >= 50) return "stroke-amber-400 text-amber-400";
    return "stroke-rose-400 text-rose-400";
  };
  
  // Circle gauge calculations
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const dashoffset = circumference - (circumference * score / 100);

  return (
    <div 
      className="card-dark card-glow rounded-xl p-5 relative animate-fade-in-up"
      style={{ animationDelay: `${index * 75}ms` }}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <span className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-xs shrink-0 border ${getRankBadgeClass(rank)}`}>
            #{rank}
          </span>
          <div>
            <h3 className="font-bold text-primary text-lg leading-tight tracking-wide">
              {result.candidate_name}
            </h3>
            <div className="flex items-center gap-3 text-xs text-secondary mt-1.5">
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-muted" />
                {details.candidate_experience_years !== null
                  ? `${details.candidate_experience_years} yrs exp`
                  : "Experience not listed"}
              </span>
              <span className="text-muted">•</span>
              <span className={details.experience_met ? "chip-emerald py-0.5 px-2 text-[10px]" : "chip-amber py-0.5 px-2 text-[10px]"}>
                {details.experience_met ? "Exp Requirement Met" : "Below Exp Requirement"}
              </span>
            </div>
          </div>
        </div>

        <div className="relative w-16 h-16 shrink-0 flex items-center justify-center">
          <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
            <circle
              className="score-ring-track"
              cx="50"
              cy="50"
              r={radius}
              strokeWidth="8"
            />
            <circle
              className={`score-ring-fill transition-all duration-1000 ease-out ${getScoreColorClass(score).split(' ')[0]}`}
              cx="50"
              cy="50"
              r={radius}
              strokeWidth="8"
              strokeDasharray={circumference}
              strokeDashoffset={dashoffset}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center flex-col">
            <span className={`text-sm font-black ${getScoreColorClass(score).split(' ')[1]}`}>
              {Math.round(score)}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
        <div className="glass-sm rounded-lg p-3 border border-emerald-500/10">
          <span className="text-[11px] font-semibold text-emerald-400 flex items-center gap-1.5 mb-2 uppercase tracking-wider">
            <Check className="w-3.5 h-3.5" />
            Matching Skills ({details.matching_skills.length})
          </span>
          <div className="flex flex-wrap gap-1.5">
            {details.matching_skills.length > 0 ? (
              details.matching_skills.slice(0, 4).map((s, idx) => (
                <span key={idx} className="chip-emerald text-[10px] py-0.5">{s}</span>
              ))
            ) : (
              <span className="text-secondary italic text-[11px]">No exact match</span>
            )}
            {details.matching_skills.length > 4 && (
              <span className="text-[10px] text-muted self-center font-medium">
                +{details.matching_skills.length - 4} more
              </span>
            )}
          </div>
        </div>

        <div className="glass-sm rounded-lg p-3 border border-rose-500/10">
          <span className="text-[11px] font-semibold text-rose-400 flex items-center gap-1.5 mb-2 uppercase tracking-wider">
            <X className="w-3.5 h-3.5" />
            Missing Skills ({details.missing_skills.length})
          </span>
          <div className="flex flex-wrap gap-1.5">
            {details.missing_skills.length > 0 ? (
              details.missing_skills.slice(0, 4).map((s, idx) => (
                <span key={idx} className="chip-rose text-[10px] py-0.5">{s}</span>
              ))
            ) : (
              <span className="text-emerald-400 italic text-[11px]">No missing skills!</span>
            )}
            {details.missing_skills.length > 4 && (
              <span className="text-[10px] text-muted self-center font-medium">
                +{details.missing_skills.length - 4} more
              </span>
            )}
          </div>
        </div>
      </div>

      {details.verdict && (
        <div className="mt-3 text-xs text-secondary glass-sm rounded-lg p-3 italic border-l-2 border-l-violet-500">
          "{details.verdict}"
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between text-sm">
        <label className="flex items-center gap-2 text-secondary hover:text-primary cursor-pointer select-none transition-colors group">
          <div className="relative flex items-center justify-center">
            <input
              type="checkbox"
              checked={isSelectedForCompare}
              onChange={() => onToggleCompare(result.resume_id)}
              className="peer appearance-none w-4 h-4 border border-white/20 rounded bg-white/5 checked:bg-violet-600 checked:border-violet-500 transition-colors cursor-pointer"
            />
            <Check className="w-3 h-3 text-white absolute opacity-0 peer-checked:opacity-100 pointer-events-none" strokeWidth={3} />
          </div>
          <span className="text-xs font-medium">Select to compare</span>
        </label>

        <button
          onClick={() => onViewDetails(result)}
          className="text-violet-400 hover:text-violet-300 font-medium flex items-center gap-1 text-xs transition-colors"
        >
          View Full Profile <ArrowUpRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
