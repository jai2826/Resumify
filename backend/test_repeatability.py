import asyncio
import time
import io
import docx
from fastapi.testclient import TestClient
from main import app
from database.connection import init_db

client = TestClient(app)

def run_repeatability_test():
    print("=== Testing Score Determinism & Repeatability ===")
    
    # 1. Login HR
    hr_res = client.post("/api/auth/login", json={"email": "hr_test@example.com", "password": "securepassword123"})
    hr_headers = {"Authorization": f"Bearer {hr_res.json()['access_token']}"}

    # 2. Get existing job and resume
    jobs = client.get("/api/jobs/", headers=hr_headers).json()
    resumes = client.get("/api/resumes/", headers=hr_headers).json()

    assert len(jobs) > 0 and len(resumes) > 0, "Need at least 1 job and 1 resume"
    job_id = jobs[0]["id"]
    resume_id = resumes[0]["id"]

    print(f"Testing Job: '{jobs[0]['role']}' (ID: {job_id})")

    for cand_idx, candidate in enumerate(resumes):
        resume_id = candidate["id"]
        cand_name = candidate["name"]
        print(f"\n==========================================")
        print(f"Testing Candidate #{cand_idx+1}: '{cand_name}' (ID: {resume_id})")
        print(f"==========================================")

        scores = []
        for i in range(1, 4):
            time.sleep(1.5)
            eval_res = client.post("/api/match/evaluate", headers=hr_headers, json={
                "job_id": job_id,
                "resume_ids": [resume_id]
            })
            assert eval_res.status_code == 200, eval_res.text
            res_data = eval_res.json()["results"][0]
            score = res_data["score"]
            breakdown = res_data["details"].get("score_breakdown")
            scores.append(score)
            print(f"Run {i} Score: {score} pts | Matching: {res_data['details']['matching_skills']}")
            if breakdown and i == 1:
                print(f"  Required Skills: {breakdown['required_skills_score']} pts")
                print(f"  Experience:      {breakdown['experience_score']} pts")
                print(f"  Preferred:       {breakdown['preferred_skills_score']} pts")
                print(f"  Total:           {breakdown['total_score']} pts")

        print(f"Scores across 3 runs for {cand_name}: {scores}")
        assert scores[0] == scores[1] == scores[2], f"Scores varied across runs: {scores}!"
        print(f"DETERMINISM VERIFIED: Score is consistently {scores[0]} pts across all 3 evaluations! [SUCCESS]")

if __name__ == "__main__":
    asyncio.run(init_db())
    run_repeatability_test()
