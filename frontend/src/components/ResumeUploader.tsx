import React, { useState, useRef } from "react";
import { UploadCloud, FileText, CheckCircle2, AlertCircle, Loader2, X } from "lucide-react";
import { resumesApi } from "../api/client";
import { Resume } from "../types";

interface ResumeUploaderProps {
  onUploadSuccess: (newResumes: Resume[]) => void;
}

export const ResumeUploader: React.FC<ResumeUploaderProps> = ({ onUploadSuccess }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    const validFiles: File[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const ext = file.name.split(".").pop()?.toLowerCase();
      if (ext === "pdf" || ext === "docx") {
        validFiles.push(file);
      }
    }
    setSelectedFiles((prev) => [...prev, ...validFiles]);
    setUploadError(null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;
    setIsUploading(true);
    setUploadError(null);

    try {
      const summary = await resumesApi.upload(selectedFiles);
      onUploadSuccess(summary.resumes);
      setSelectedFiles([]);
      if (summary.failed > 0) {
        setUploadError(`${summary.failed} file(s) failed extraction. Check file integrity.`);
      }
    } catch (err: any) {
      setUploadError(err.response?.data?.detail || "Failed to parse resumes. Check backend connection.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="card-dark rounded-xl p-6">
      <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
        <UploadCloud className="w-5 h-5 text-violet-400" />
        <span className="gradient-text">Step 2: Upload Resumes</span>
      </h2>

      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-300 ${
          isDragging 
            ? "border-violet-500/50 bg-violet-500/5" 
            : "border-white/10 hover:border-violet-500/30 hover:bg-white/5 bg-transparent"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.docx"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
        <UploadCloud className={`w-10 h-10 mx-auto mb-3 transition-colors ${isDragging ? "text-violet-400" : "text-muted"}`} />
        <p className="text-sm font-medium text-primary">
          Drag & drop resumes here, or <span className="text-violet-400 hover:text-violet-300 transition-colors">browse</span>
        </p>
        <p className="text-xs text-muted mt-1.5">Supports PDF & DOCX (Max 10MB per file)</p>
      </div>

      {selectedFiles.length > 0 && (
        <div className="mt-5 space-y-3">
          <div className="flex justify-between items-center text-xs font-medium text-secondary">
            <span>Selected Files ({selectedFiles.length})</span>
            <button
              onClick={() => setSelectedFiles([])}
              className="text-rose-400 hover:text-rose-300 transition-colors"
            >
              Clear all
            </button>
          </div>
          <div className="max-h-40 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
            {selectedFiles.map((file, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between text-sm glass-md rounded-lg px-3 py-2 border border-white/5"
              >
                <div className="flex items-center gap-3 truncate">
                  <FileText className="w-4 h-4 text-violet-400 shrink-0" />
                  <span className="truncate text-primary">{file.name}</span>
                </div>
                <div className="flex items-center gap-3 shrink-0 ml-3">
                  <span className="text-xs text-secondary">
                    {(file.size / 1024).toFixed(0)} KB
                  </span>
                  <button 
                    onClick={(e) => { e.stopPropagation(); removeFile(idx); }}
                    className="text-muted hover:text-rose-400 transition-colors p-1 rounded-md hover:bg-rose-500/10"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={handleUpload}
            disabled={isUploading}
            className="btn-primary w-full mt-2 text-sm py-2.5 flex items-center justify-center gap-2"
          >
            {isUploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Extracting & Parsing with AI...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                Parse {selectedFiles.length} Resume(s)
              </>
            )}
          </button>
        </div>
      )}

      {uploadError && (
        <div className="mt-4 p-3 glass border-l-4 border-l-rose-500 rounded-lg text-sm text-rose-200 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
          <span>{uploadError}</span>
        </div>
      )}
    </div>
  );
};
