import React, { useState } from "react";
import { Briefcase, CheckCircle2, Loader2, Sparkles, ChevronDown, ChevronUp } from "lucide-react";
import { jobsApi } from "../api/client";
import { JobD } from "../types";

interface JobDescriptionInputProps {
  activeJob: JobD | null;
  onJobCreated: (job: JobD) => void;
}

const SAMPLE_JD = `About the job:
Looking for a Fullstack Engineer with 1+ years experience in React.js, TypeScript, Node.js, and REST APIs.
Key Responsibilities:
- Design and build reusable UI components and backend REST microservices.
- Work with MySQL databases and Docker containerization.
Requirements:
- Strong skills in React.js, TypeScript, Node.js.
- Familiarity with MySQL, Docker, and CI/CD pipelines.`;

export const JobDescriptionInput: React.FC<JobDescriptionInputProps> = ({
  activeJob,
  onJobCreated,
}) => {
  const [title, setTitle] = useState("");
  const [rawText, setRawText] = useState("");
  const [isParsing, setIsParsing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showFullSummary, setShowFullSummary] = useState(false);

  const handleParseJob = async () => {
    if (!rawText.trim()) return;
    setIsParsing(true);
    setError(null);
    try {
      const job = await jobsApi.create({
        title: title.trim() || undefined,
        raw_text: rawText,
      });
      onJobCreated(job);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to parse job description.");
    } finally {
      setIsParsing(false);
    }
  };

  const loadSampleJD = () => {
    setTitle("Fullstack Engineer (React + Node)");
    setRawText(SAMPLE_JD);
  };

  return (
    <div className="card-dark rounded-xl p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Briefcase className="w-5 h-5 text-violet-400" />
          <span className="gradient-text">Step 1: Job Description</span>
        </h2>
        <button
          onClick={loadSampleJD}
          className="btn-ghost text-xs flex items-center gap-1.5 px-3 py-1.5"
        >
          <Sparkles className="w-3.5 h-3.5" />
          Load Sample JD
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-secondary mb-1.5">Job Title</label>
          <input
            type="text"
            placeholder="e.g. Senior Frontend Engineer"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="input-dark w-full text-sm px-4 py-2.5"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-secondary mb-1.5">
            Job Description Text / Requirements
          </label>
          <textarea
            rows={5}
            placeholder="Paste complete job description here..."
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
            className="textarea-dark w-full text-sm px-4 py-2.5 font-mono"
          />
        </div>

        <button
          onClick={handleParseJob}
          disabled={isParsing || !rawText.trim()}
          className="btn-primary w-full text-sm py-2.5 flex items-center justify-center gap-2"
        >
          {isParsing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Structuring Requirements with AI...
            </>
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4" />
              Save & Parse Job Description
            </>
          )}
        </button>
      </div>

      {error && <p className="mt-3 text-sm text-rose-400 font-medium">{error}</p>}

      {activeJob && (
        <div className="mt-5 p-4 glass border-l-4 border-l-violet-500 rounded-lg">
          <div className="flex justify-between items-center">
            <div>
              <span className="text-xs font-semibold text-violet-400 uppercase tracking-wider">
                Active Job
              </span>
              <h3 className="text-base font-bold text-primary mt-0.5">
                {activeJob.title || activeJob.role}
              </h3>
            </div>
            <button
              onClick={() => setShowFullSummary(!showFullSummary)}
              className="text-secondary hover:text-primary transition-colors p-1"
            >
              {showFullSummary ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>
          </div>

          <div className="mt-3 text-sm text-secondary space-y-2">
            <p>
              <strong className="text-primary font-medium">Min Experience:</strong>{" "}
              {activeJob.minimum_experience !== null ? `${activeJob.minimum_experience} yrs` : "Not specified"}
            </p>
            <div>
              <strong className="text-primary font-medium block mb-1.5">Required Skills:</strong>
              <div className="flex flex-wrap gap-1.5">
                {activeJob.required_skills.slice(0, 6).map((skill, idx) => (
                  <span
                    key={idx}
                    className="chip-violet text-[11px]"
                  >
                    {skill}
                  </span>
                ))}
                {activeJob.required_skills.length > 6 && (
                  <span className="text-[11px] text-muted self-center font-medium">
                    +{activeJob.required_skills.length - 6} more
                  </span>
                )}
              </div>
            </div>
          </div>

          {showFullSummary && (
            <div className="mt-4 pt-4 border-t border-white/10 text-sm space-y-3">
              {activeJob.preferred_skills.length > 0 && (
                <div>
                  <span className="font-medium text-primary block mb-1">Preferred Skills:</span>
                  <p className="text-secondary">{activeJob.preferred_skills.join(", ")}</p>
                </div>
              )}
              {activeJob.responsibilities.length > 0 && (
                <div>
                  <span className="font-medium text-primary block mb-1">Key Responsibilities:</span>
                  <ul className="list-disc pl-5 text-secondary space-y-1">
                    {activeJob.responsibilities.slice(0, 3).map((r, i) => (
                      <li key={i}>{r}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
