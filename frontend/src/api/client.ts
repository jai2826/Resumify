import axios from "axios";
import { JobD, JobCreateRequest, UploadSummary, Resume, MatchResponse, MatchResult, RegisterRequest, LoginRequest, TokenResponse, User } from "../types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api";

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authApi = {
  register: async (data: RegisterRequest): Promise<TokenResponse> => {
    const response = await api.post<TokenResponse>('/auth/register', data);
    return response.data;
  },
  login: async (data: LoginRequest): Promise<TokenResponse> => {
    const response = await api.post<TokenResponse>('/auth/login', data);
    return response.data;
  },
  getMe: async (): Promise<User> => {
    const response = await api.get<User>('/auth/me');
    return response.data;
  },
};

// Jobs API
export const jobsApi = {
  create: async (data: JobCreateRequest): Promise<JobD> => {
    const res = await api.post<JobD>("/jobs/", data);
    return res.data;
  },
  list: async (): Promise<JobD[]> => {
    const res = await api.get<JobD[]>("/jobs/");
    return res.data;
  },
  get: async (jobId: string): Promise<JobD> => {
    const res = await api.get<JobD>(`/jobs/${jobId}`);
    return res.data;
  },
};

// Resumes API
export const resumesApi = {
  upload: async (files: File[]): Promise<UploadSummary> => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append("files", file);
    });
    const res = await api.post<UploadSummary>("/resumes/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  },
  list: async (): Promise<Resume[]> => {
    const res = await api.get<Resume[]>("/resumes/");
    return res.data;
  },
  get: async (resumeId: string): Promise<Resume> => {
    const res = await api.get<Resume>(`/resumes/${resumeId}`);
    return res.data;
  },
};

// Match & Evaluation API
export const matchApi = {
  evaluate: async (jobId: string, resumeIds?: string[]): Promise<MatchResponse> => {
    const res = await api.post<MatchResponse>("/match/evaluate", {
      job_id: jobId,
      resume_ids: resumeIds,
    });
    return res.data;
  },
  getResults: async (jobId: string): Promise<MatchResponse> => {
    const res = await api.get<MatchResponse>(`/match/${jobId}`);
    return res.data;
  },
  exportCsvUrl: (jobId: string): string => {
    return `${API_BASE_URL}/match/${jobId}/export`;
  },
};

// Demo API (Public, unauthenticated)
export const demoApi = {
  matchSingle: async (jobText: string, file: File): Promise<MatchResult> => {
    const formData = new FormData();
    formData.append("job_text", jobText);
    formData.append("file", file);
    const res = await api.post<MatchResult>("/demo/match-single", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  },
  matchMultiple: async (jobText: string, files: File[]): Promise<MatchResponse> => {
    const formData = new FormData();
    formData.append("job_text", jobText);
    files.forEach((file) => {
      formData.append("files", file);
    });
    const res = await api.post<MatchResponse>("/demo/match-multiple", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  },
};

export const checkHealth = async () => {
  const res = await api.get("/health");
  return res.data;
};
