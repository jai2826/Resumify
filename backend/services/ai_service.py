import json
import asyncio
import logging
import re
from typing import Dict, Any, Optional, Tuple, List, Set
from groq import AsyncGroq
from config import settings
from schemas.models import (
    JobD, 
    Resume, 
    CandidateMatchDetails, 
    MatchResult, 
    ScoringWeights, 
    ScoreBreakdown
)

logger = logging.getLogger(__name__)

CANONICAL_SKILL_ALIASES = {
    'js': 'javascript', 'javascript': 'javascript',
    'ts': 'typescript', 'typescript': 'typescript',
    'py': 'python', 'python': 'python',
    'react.js': 'react', 'reactjs': 'react', 'react': 'react',
    'node.js': 'node', 'nodejs': 'node', 'node': 'node',
    'next.js': 'next', 'nextjs': 'next', 'next': 'next',
    'vue.js': 'vue', 'vuejs': 'vue', 'vue': 'vue',
    'express.js': 'express', 'expressjs': 'express', 'express': 'express',
    'angular.js': 'angular', 'angularjs': 'angular', 'angular': 'angular',
    'postgres': 'postgresql', 'postgresql': 'postgresql',
    'mongo': 'mongodb', 'mongodb': 'mongodb',
    'k8s': 'kubernetes', 'kubernetes': 'kubernetes',
    'docker': 'docker',
    'gcp': 'google cloud', 'google cloud platform': 'google cloud',
    'aws': 'amazon web services', 'amazon web services': 'amazon web services',
    'azure': 'microsoft azure', 'microsoft azure': 'microsoft azure',
    'html5': 'html', 'html': 'html',
    'css3': 'css', 'css': 'css',
    'c#': 'c#', 'c++': 'c++', 'c': 'c',
    'golang': 'go', 'go': 'go',
    'rest api': 'rest api', 'restful api': 'rest api', 'rest apis': 'rest api',
    'restful apis': 'rest api', 'restful api design': 'rest api',
    'rest api development': 'rest api', 'rest': 'rest api',
    'github': 'github', 'git': 'git',
}

FILLER_WORDS = {'design', 'development', 'architecture', 'principles', 'tools', 'framework', 'library', 'stack', 'methodologies', 'methodology', 'services'}

def normalize_skill(skill: str) -> str:
    s = skill.strip().lower()
    if s in CANONICAL_SKILL_ALIASES:
        return CANONICAL_SKILL_ALIASES[s]
    s = re.sub(r'\.js\b', '', s)
    s = re.sub(r'\bjs\b', '', s)
    s = re.sub(r'\brestful\b', 'rest', s)
    s = re.sub(r'\bapis\b', 'api', s)
    s_clean = s.strip()
    return CANONICAL_SKILL_ALIASES.get(s_clean, s_clean)

def skill_matches(req_skill: str, cand_skill: str) -> bool:
    norm_req = normalize_skill(req_skill)
    norm_cand = normalize_skill(cand_skill)
    if norm_req == norm_cand:
        return True
    req_tokens = set(re.findall(r'[a-zA-Z0-9\+#]+', norm_req)) - FILLER_WORDS
    cand_tokens = set(re.findall(r'[a-zA-Z0-9\+#]+', norm_cand)) - FILLER_WORDS
    if not req_tokens or not cand_tokens:
        return norm_req == norm_cand
    if req_tokens == cand_tokens:
        return True
    if req_tokens.issubset(cand_tokens) or cand_tokens.issubset(req_tokens):
        if len(cand_tokens) == 1 and list(cand_tokens)[0] in {'c', 'r', 'go', 'd'}:
            return req_tokens == cand_tokens
        if len(req_tokens) == 1 and list(req_tokens)[0] in {'c', 'r', 'go', 'd'}:
            return req_tokens == cand_tokens
        return True
    return False

def calculate_deterministic_score(
    job: JobD,
    resume: Resume,
    details: CandidateMatchDetails,
    weights: Optional[ScoringWeights] = None
) -> Tuple[float, ScoreBreakdown]:
    """
    Computes a deterministic, transparent, and reproducible match score in points (0 to 100 max).
    Weights can be customized by HR in the future (default: 60 pts skills, 25 pts experience, 15 pts preferred).
    """
    if weights is None:
        weights = job.scoring_weights or ScoringWeights()

    # Normalize weights so they sum to 1.0 (or 100 max points)
    raw_sum = weights.required_skills_weight + weights.experience_weight + weights.preferred_skills_weight
    if raw_sum <= 0:
        w_req, w_exp, w_pref = 0.60, 0.25, 0.15
    else:
        w_req = weights.required_skills_weight / raw_sum
        w_exp = weights.experience_weight / raw_sum
        w_pref = weights.preferred_skills_weight / raw_sum

    max_req_pts = w_req * 100.0
    max_exp_pts = w_exp * 100.0
    max_pref_pts = w_pref * 100.0

    # 1. Required Skills Score
    job_required = job.required_skills or []
    candidate_skills = list(set(resume.skills or []))
    for exp in (resume.experience or []):
        if hasattr(exp, 'skills_used') and exp.skills_used:
            candidate_skills.extend(exp.skills_used)

    if job_required:
        req_matched = [r for r in job_required if any(skill_matches(r, c) for c in candidate_skills)]
        req_ratio = min(1.0, len(req_matched) / len(job_required))
    else:
        total_skills = len(details.matching_skills) + len(details.missing_skills)
        req_ratio = (len(details.matching_skills) / total_skills) if total_skills > 0 else 0.8

    req_score = round(req_ratio * max_req_pts, 1)

    # 2. Experience Score
    req_years = details.required_experience_years if details.required_experience_years is not None else job.minimum_experience
    cand_years = details.candidate_experience_years if details.candidate_experience_years is not None else resume.total_experience_years

    if req_years is None or req_years <= 0:
        exp_ratio = 1.0
    elif cand_years is not None:
        exp_ratio = min(1.0, cand_years / req_years)
    elif details.experience_met:
        exp_ratio = 1.0
    else:
        exp_ratio = 0.5

    exp_score = round(exp_ratio * max_exp_pts, 1)

    # 3. Preferred Skills Score
    job_pref = job.preferred_skills or []
    if job_pref:
        pref_matched = [p for p in job_pref if any(skill_matches(p, c) for c in candidate_skills)]
        pref_ratio = min(1.0, len(pref_matched) / len(job_pref))
    else:
        extra_skills = len(candidate_skills) - len(job_required)
        pref_ratio = min(1.0, max(0.5, extra_skills / 3.0)) if extra_skills > 0 else 0.5

    pref_score = round(pref_ratio * max_pref_pts, 1)

    total = round(req_score + exp_score + pref_score, 1)
    total = max(0.0, min(100.0, total))

    breakdown = ScoreBreakdown(
        required_skills_score=req_score,
        experience_score=exp_score,
        preferred_skills_score=pref_score,
        total_score=total
    )

    return total, breakdown

def extract_json_from_llm_output(raw: str) -> Dict[str, Any]:
    """Extracts and parses JSON from raw LLM output, handling markdown fences and surrounding text."""
    if not raw or not raw.strip():
        raise ValueError("Empty completion received from LLM")
    cleaned = raw.strip()
    try:
        return json.loads(cleaned)
    except json.JSONDecodeError:
        pass
    match = re.search(r"```(?:json)?\s*([\s\S]*?)\s*```", cleaned)
    if match:
        try:
            return json.loads(match.group(1).strip())
        except json.JSONDecodeError:
            pass
    start = cleaned.find("{")
    end = cleaned.rfind("}")
    if start != -1 and end != -1 and end > start:
        return json.loads(cleaned[start:end+1])
    raise ValueError(f"Could not extract valid JSON from LLM output: {raw[:250]}")

class AIService:
    """Core Groq LLM integration service."""
    
    def __init__(self):
        self.client = AsyncGroq(api_key=settings.groq_api_key)
        self.model = settings.groq_model
        self.semaphore = asyncio.Semaphore(settings.max_concurrent_requests)

    async def _call_llm_with_resilience(
        self,
        client: AsyncGroq,
        target_model: str,
        system_prompt: str,
        user_prompt: str
    ) -> Dict[str, Any]:
        """
        Executes Groq chat completion with concurrency semaphore,
        automatic model fallback on 429 quota exhaustion or JSON validation errors,
        and fallback extraction without response_format if json_object mode fails.
        """
        candidate_models = [target_model]
        for alt in ["qwen/qwen3.8-27b", "openai/gpt-oss-120b", "openai/gpt-oss-20b"]:
            if alt not in candidate_models:
                candidate_models.append(alt)

        last_error = None
        for model_name in candidate_models:
            for attempt in range(2):
                try:
                    async with self.semaphore:
                        # First try with structured json_object mode
                        try:
                            response = await client.chat.completions.create(
                                model=model_name,
                                messages=[
                                    {"role": "system", "content": system_prompt},
                                    {"role": "user", "content": user_prompt}
                                ],
                                temperature=0.0,
                                seed=42,
                                response_format={"type": "json_object"}
                            )
                        except Exception as json_err:
                            err_str = str(json_err).lower()
                            if "json_validate_failed" in err_str or "validate json" in err_str or "400" in err_str:
                                logger.warning(f"json_object mode failed on {model_name} ({json_err}). Retrying without response_format constraint...")
                                response = await client.chat.completions.create(
                                    model=model_name,
                                    messages=[
                                        {"role": "system", "content": system_prompt + "\n\nCRITICAL: Respond ONLY with a valid JSON object. Do not include introductory text or markdown formatting."},
                                        {"role": "user", "content": user_prompt}
                                    ],
                                    temperature=0.0,
                                    seed=42
                                )
                            else:
                                raise json_err

                        raw_json = response.choices[0].message.content
                        return extract_json_from_llm_output(raw_json)
                except Exception as e:
                    last_error = e
                    err_msg = str(e).lower()
                    if "429" in err_msg or "rate_limit" in err_msg:
                        if attempt == 0 and "tokens per day" not in err_msg:
                            logger.info(f"Rate limit on {model_name}. Pausing 2s before retry...")
                            await asyncio.sleep(2)
                            continue
                        else:
                            logger.warning(f"Model {model_name} rate limited ({e}). Falling back to next model...")
                            break
                    else:
                        logger.warning(f"Model {model_name} encountered error ({e}). Trying fallback model...")
                        break

        if last_error:
            raise last_error
        return {}

    async def parse_job_description(self, raw_text: str, title: Optional[str] = None, api_key: Optional[str] = None, model: Optional[str] = None) -> JobD:
        """Extracts structured requirements from raw job description text."""
        schema = JobD.model_json_schema()
        system_prompt = f"""
You are an expert HR Talent Acquisition specialist.
Analyze the raw job description and extract structured information according to this JSON Schema:
{json.dumps(schema)}

RULES:
1. Return ONLY valid JSON matching the schema.
2. Fill all fields with actual extracted information.
3. If minimum_experience is not specified, return null.
4. If a list has no data, return [].
5. Do NOT invent or hallucinate skills or qualifications.
"""
        user_prompt = f"Analyze this job description:\n\n{raw_text}"

        client = AsyncGroq(api_key=api_key) if api_key else self.client
        target_model = model if model else self.model

        data = await self._call_llm_with_resilience(client, target_model, system_prompt, user_prompt)
        if title and not data.get("title"):
            data["title"] = title
        return JobD(**data)

    async def parse_resume(self, resume_text: str, filename: Optional[str] = None, api_key: Optional[str] = None, model: Optional[str] = None) -> Resume:
        """
        Parses resume text into a structured Resume model.
        Uses semantic understanding across non-standard headers (Internships, Projects, Work History).
        """
        schema = Resume.model_json_schema()
        system_prompt = f"""
You are an expert resume parsing specialist.
Extract candidate information from the resume semantically according to this JSON Schema:
{json.dumps(schema)}

RULES:
1. Extract ALL skills mentioned across work history, summary, education, and projects into the 'skills' list.
2. If total_experience_years is not explicitly stated, calculate it from work history start and end dates.
3. Consolidate internships, freelance, and contract roles into the 'experience' list.
4. Return ONLY valid JSON matching the schema.
"""
        user_prompt = f"Parse this resume:\n\n{resume_text}"

        client = AsyncGroq(api_key=api_key) if api_key else self.client
        target_model = model if model else self.model

        data = await self._call_llm_with_resilience(client, target_model, system_prompt, user_prompt)
        if filename:
            data["filename"] = filename
        data["raw_text_preview"] = resume_text[:300] + "..." if len(resume_text) > 300 else resume_text
        return Resume(**data)

    async def match_resume_to_job(
        self, 
        job: JobD, 
        resume: Resume, 
        weights: Optional[ScoringWeights] = None,
        api_key: Optional[str] = None, 
        model: Optional[str] = None
    ) -> MatchResult:
        """
        Compares a candidate's resume with a target Job Description.
        Uses LLM for deterministic semantic extraction and Python for mathematical scoring.
        """
        details_schema = CandidateMatchDetails.model_json_schema()
        system_prompt = f"""
You are an expert HR Recruiter and Technical Hiring Manager.
Evaluate the candidate's resume against the target Job Description.

Candidate Details:
{resume.model_dump_json(indent=2)}

Target Job Description:
{job.model_dump_json(indent=2)}

Extract candidate match details according to this JSON Schema:
{json.dumps(details_schema)}

CRITICAL EVALUATION GUIDELINES:
1. matching_skills: List concrete skills present in both the candidate resume and job requirements (be semantic, e.g. 'Postgres' matches 'PostgreSQL').
2. missing_skills: List required or preferred skills from the job description not demonstrated in the candidate profile.
3. candidate_experience_years: The candidate's total professional experience years (float or null).
4. required_experience_years: The minimum required experience years specified in the job (float or null).
5. experience_met: boolean (True if candidate_experience_years >= required_experience_years).
6. verdict: 1-2 clear, objective sentences explaining why the candidate is or isn't a good fit.
"""
        user_prompt = "Perform the candidate semantic evaluation and return the JSON details object."

        client = AsyncGroq(api_key=api_key) if api_key else self.client
        target_model = model if model else self.model

        data = {}
        try:
            data = await self._call_llm_with_resilience(client, target_model, system_prompt, user_prompt)
        except Exception as e:
            logger.warning(f"LLM evaluation call encountered issue for {resume.name}: {e}. Proceeding with deterministic evaluation.")

        # If the LLM wrapped details inside a details key, unpack it
        details_data = data.get("details", data) if isinstance(data, dict) else {}
        if not details_data.get("candidate_name"):
            details_data["candidate_name"] = resume.name

        # Build candidate skills pool
        candidate_skills = list(set(resume.skills or []))
        for exp in (resume.experience or []):
            if hasattr(exp, 'skills_used') and exp.skills_used:
                candidate_skills.extend(exp.skills_used)

        # Deterministic skill matching for exact UI display and score sync
        matched_skills: List[str] = []
        missing_skills: List[str] = []

        for req in (job.required_skills or []):
            if any(skill_matches(req, c) for c in candidate_skills):
                matched_skills.append(req)
            else:
                missing_skills.append(req)

        for pref in (job.preferred_skills or []):
            if any(skill_matches(pref, c) for c in candidate_skills):
                if pref not in matched_skills:
                    matched_skills.append(pref)

        details_data["matching_skills"] = matched_skills
        details_data["missing_skills"] = missing_skills

        cand_years = resume.total_experience_years if resume.total_experience_years is not None else details_data.get("candidate_experience_years")
        req_years = job.minimum_experience if job.minimum_experience is not None else details_data.get("required_experience_years")

        details_data["candidate_experience_years"] = cand_years
        details_data["required_experience_years"] = req_years
        details_data["experience_met"] = (req_years is None or (cand_years is not None and cand_years >= req_years))

        if not details_data.get("verdict"):
            details_data["verdict"] = (
                f"Candidate demonstrates {len(matched_skills)} of {len(job.required_skills or [])} required skills "
                f"with {cand_years or 0} years of documented experience."
            )

        details = CandidateMatchDetails(**details_data)

        # Deterministic points score calculation
        score, breakdown = calculate_deterministic_score(job, resume, details, weights)
        details.score_breakdown = breakdown

        return MatchResult(
            resume_id=resume.id,
            candidate_name=resume.name or "Anonymous",
            score=score,
            details=details
        )

ai_service = AIService()
