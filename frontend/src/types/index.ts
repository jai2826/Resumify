// Auth types
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'hr' | 'job_seeker';
  is_active: boolean;
  created_at: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  role: 'hr' | 'job_seeker';
}

// ==========================================
// 1. Job Description Types
// ==========================================

export interface ScoringWeights {
  required_skills_weight: number;
  experience_weight: number;
  preferred_skills_weight: number;
}

export interface JobD {
  id: string;
  title?: string;
  role: string;
  required_skills: string[];
  preferred_skills: string[];
  minimum_experience?: number | null;
  education_requirements: string[];
  responsibilities: string[];
  created_at: string;
  scoring_weights?: ScoringWeights | null;
}

export interface JobCreateRequest {
  title?: string;
  raw_text: string;
  company?: string;
}

// ==========================================
// 2. Resume Types
// ==========================================

export interface Experience {
  company?: string | null;
  role?: string | null;
  duration?: string | null;
  description?: string | null;
  skills_used: string[];
}

export interface Resume {
  id: string;
  filename?: string | null;
  name: string;
  email?: string | null;
  phone?: string | null;
  total_experience_years?: number | null;
  skills: string[];
  experience: Experience[];
  education: string[];
  projects: string[];
  certifications: string[];
  raw_text_preview?: string | null;
  created_at: string;
}

export interface UploadSummary {
  total_uploaded: number;
  successful: number;
  failed: number;
  resumes: Resume[];
  errors: { filename: string; error: string }[];
}

// ==========================================
// 3. Matching & Evaluation Types
// ==========================================

export interface ScoreBreakdown {
  required_skills_score: number;
  experience_score: number;
  preferred_skills_score: number;
  total_score: number;
}

export interface CandidateMatchDetails {
  candidate_name?: string | null;
  matching_skills: string[];
  missing_skills: string[];
  experience_met: boolean;
  candidate_experience_years?: number | null;
  required_experience_years?: number | null;
  verdict: string;
  score_breakdown?: ScoreBreakdown | null;
}

export interface MatchResult {
  resume_id: string;
  candidate_name: string;
  score: number;
  details: CandidateMatchDetails;
}

export interface MatchResponse {
  job_id: string;
  job_title?: string | null;
  total_evaluated: number;
  results: MatchResult[];
}
