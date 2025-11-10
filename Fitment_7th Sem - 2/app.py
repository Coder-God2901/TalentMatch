from flask import Flask, render_template, request, jsonify, Response
from flask_cors import CORS
import os
import pickle
import requests
import json
from utils.resume_parser import parse_resume
from utils.score_calculator import calculate_fitment_score
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
# Allow CORS from frontend (change to specific origin in production)
CORS(app, resources={r"/*": {"origins": os.getenv("FLASK_ALLOW_ORIGINS", "*")}})

# Ensure every response contains CORS headers and handle OPTIONS preflight
CORS_ALLOWED_ORIGINS = os.getenv("FLASK_ALLOW_ORIGINS", "*")
CORS_HEADERS = {
    "Access-Control-Allow-Origin": CORS_ALLOWED_ORIGINS,
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS, PATCH",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
}

@app.after_request
def add_cors_headers(response):
    for k, v in CORS_HEADERS.items():
        response.headers.setdefault(k, v)
    return response

UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Load trained ML model & scaler
with open("models/attrition_model.pkl", "rb") as f:
    attrition_model = pickle.load(f)
with open("models/scaler.pkl", "rb") as f:
    scaler = pickle.load(f)

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/upload", methods=["POST"])
def upload_resume():
    if "resume" not in request.files:
        return "No file uploaded", 400
    file = request.files["resume"]
    if file.filename == "":
        return "No selected file", 400

    filepath = os.path.join(UPLOAD_FOLDER, file.filename)
    file.save(filepath)

    # Extract candidate info
    candidate_data = parse_resume(filepath)

    # Create feature vector matching model input
    feature_vector = [
        candidate_data["Age"],
        candidate_data["JobSatisfaction"],
        candidate_data["EnvironmentSatisfaction"],
        candidate_data["MonthlyIncome"],
        candidate_data["YearsAtCompany"],
        candidate_data["DistanceFromHome"],
        candidate_data["WorkLifeBalance"],
        candidate_data["Education"],
        candidate_data["JobInvolvement"]
    ]

    # Scale and predict attrition probability
    X_scaled = scaler.transform([feature_vector])
    attrition_prob = attrition_model.predict_proba(X_scaled)[0][1]

    # Calculate fitment score
    final_score, breakdown = calculate_fitment_score(candidate_data, attrition_prob)

    return render_template("result.html", score=final_score, breakdown=breakdown)

@app.route("/score", methods=["POST"])
def score_and_upsert_application():
    """
    Expects JSON:
    {
      "job_id": "<uuid>",
      "candidate_id": "<uuid>",
      "job": { title, skills_required, raw_jd, generated_jd, ... },
      "candidate": { resume_url, github_url, linkedin_url, profile: { skills, experience_years, ... } }
    }

    Returns:
    { "fitment_score": number, "sub_scores": { ... } }
    """
    try:
        payload = request.get_json() or {}
        job_id = payload.get("job_id")
        candidate_id = payload.get("candidate_id")
        job = payload.get("job", {})
        candidate = payload.get("candidate", {})

        if not job_id or not candidate_id:
            return jsonify({"error": "job_id and candidate_id required"}), 400

        # Build candidate_data for scoring from supplied profile (safe defaults)
        profile = candidate.get("profile", {}) or {}

        # Determine required skills list from job payload
        required_skills = job.get("skills_required") or job.get("skills") or []
        # Normalize skills lists to compare
        def norm_list(arr):
            return [str(x).strip().lower() for x in (arr or []) if str(x).strip()]

        req_skills_norm = norm_list(required_skills)
        cand_skills_norm = norm_list(profile.get("skills") or profile.get("skills_text") or [])

        skill_match = 0.0
        if req_skills_norm and cand_skills_norm:
            matches = set(req_skills_norm).intersection(set(cand_skills_norm))
            skill_match = (len(matches) / max(1, len(req_skills_norm))) * 100.0

        # experience_years may be provided or embedded; try to parse fallback
        exp_years = 0
        try:
            exp_val = profile.get("experience_years") or profile.get("experience") or 0
            # if experience is a string like "3 years" try to extract digits
            if isinstance(exp_val, str):
                import re
                m = re.search(r"(\d+)", exp_val)
                exp_years = int(m.group(1)) if m else 0
            else:
                exp_years = int(exp_val or 0)
        except Exception:
            exp_years = 0

        # construct candidate_data dict matching score_calculator expected keys
        candidate_data_for_scoring = {
            "skill_match": skill_match,
            "experience_years": exp_years,
            # sensible defaults for downstream features
            "cultural_fit": float(profile.get("cultural_fit") or 0.5),
            "growth_potential": float(profile.get("growth_potential") or 0.5),
            "resume_quality": float(profile.get("resume_quality") or 0.5),
        }

        # compute attrition probability (best-effort). Keep default 0 if not computed.
        try:
            # If you can derive model features from profile/resume, do it here and call attrition_model
            attrition_prob = 0.0
            # Example: if profile provides features matching your attrition model, compute them.
        except Exception:
            attrition_prob = 0.0

        final_score, breakdown = calculate_fitment_score(candidate_data_for_scoring, attrition_prob)

        # Upsert into Supabase via REST (service role). Uses environment secrets.
        SUPABASE_URL = (os.getenv("SUPABASE_URL") or "").rstrip("/")
        SERVICE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

        if not SUPABASE_URL or not SERVICE_KEY:
            app.logger.warning("Supabase env not configured; returning score only")
            return jsonify({"fitment_score": final_score, "sub_scores": breakdown}), 200

        base_headers = {
            "Content-Type": "application/json",
            "apikey": SERVICE_KEY,
            "Authorization": f"Bearer {SERVICE_KEY}",
        }

        # --- Robust upsert logic: check for existing application, patch by id, otherwise insert ---
        try:
            # Look for existing application row for (job_id, candidate_id)
            lookup_url = f"{SUPABASE_URL}/rest/v1/applications?job_id=eq.{job_id}&candidate_id=eq.{candidate_id}&select=id"
            lookup_resp = requests.get(lookup_url, headers=base_headers, timeout=15)
            if lookup_resp.status_code != 200:
                app.logger.warning("Supabase lookup failed %s %s", lookup_resp.status_code, lookup_resp.text)
                # fallback: try direct insert
                existing_app = None
            else:
                lookup_json = lookup_resp.json()
                existing_app = lookup_json[0] if isinstance(lookup_json, list) and len(lookup_json) > 0 else None

            if existing_app and existing_app.get("id"):
                app_id = existing_app["id"]
                patch_url = f"{SUPABASE_URL}/rest/v1/applications?id=eq.{app_id}"
                patch_body = {"fitment_score": float(final_score), "sub_scores": breakdown}
                patch_headers = {**base_headers, "Prefer": "return=representation"}
                patch_resp = requests.patch(patch_url, headers=patch_headers, json=patch_body, timeout=15)
                if patch_resp.status_code in (200, 204):
                    app.logger.info("Updated existing application %s with fitment %s", app_id, final_score)
                else:
                    app.logger.warning("Failed to PATCH application %s: %s %s", app_id, patch_resp.status_code, patch_resp.text)
            else:
                post_url = f"{SUPABASE_URL}/rest/v1/applications"
                insert_body = {
                    "job_id": job_id,
                    "candidate_id": candidate_id,
                    "status": "applied",
                    "fitment_score": float(final_score),
                    "sub_scores": breakdown
                }
                post_headers = {**base_headers, "Prefer": "return=representation"}
                post_resp = requests.post(post_url, headers=post_headers, json=insert_body, timeout=15)
                if post_resp.status_code in (200, 201):
                    app.logger.info("Inserted new application for candidate %s (job %s)", candidate_id, job_id)
                else:
                    app.logger.warning("Failed to INSERT application for candidate %s: %s %s", candidate_id, post_resp.status_code, post_resp.text)
        except Exception:
            app.logger.exception("Supabase upsert error")
            # still return score to caller even if DB update failed
            return jsonify({"fitment_score": final_score, "sub_scores": breakdown, "warning": "db_upsert_failed"}), 200

        # Return score to caller
        return jsonify({"fitment_score": final_score, "sub_scores": breakdown}), 200

    except Exception as e:
        app.logger.exception("Scoring/upsert error")
        return jsonify({"error": "Scoring service error"}), 500

@app.route("/rank", methods=["POST", "OPTIONS"])
def rank_job_applications():
    # respond to preflight directly
    if request.method == "OPTIONS":
        return Response(status=204, headers=CORS_HEADERS)

    try:
        payload = request.get_json() or {}
        job_id = payload.get("job_id")
        if not job_id:
            return jsonify({"error": "job_id required"}), 400

        SUPABASE_URL = (os.getenv("SUPABASE_URL") or "").rstrip("/")
        SERVICE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
        if not SUPABASE_URL or not SERVICE_KEY:
            app.logger.error("Missing Supabase config on server")
            return jsonify({"error": "Supabase config missing on server"}), 500

        base_headers = {
            "apikey": SERVICE_KEY,
            "Authorization": f"Bearer {SERVICE_KEY}",
            "Content-Type": "application/json",
        }

        # fetch applications for the job including candidate details
        apps_url = f"{SUPABASE_URL}/rest/v1/applications?job_id=eq.{job_id}&select=*,candidates(id,display_name,email,skills,skills_text,experience,github,linkedin,resume_url)"
        resp = requests.get(apps_url, headers=base_headers, timeout=30)
        if resp.status_code != 200:
            app.logger.error("Failed to load applications: %s %s", resp.status_code, resp.text)
            return jsonify({"error": "could not load applications", "detail": resp.text}), 500

        apps = resp.json()
        results = []

        def norm_list(arr):
            return [str(x).strip().lower() for x in (arr or []) if str(x).strip()]

        # Optionally allow caller to pass job details to compute req_skills, otherwise fetch job
        req_skills = payload.get("job", {}).get("skills_required") or payload.get("job", {}).get("skills")
        if not req_skills:
            # try fetching job from Supabase REST
            job_url = f"{SUPABASE_URL}/rest/v1/jobs?id=eq.{job_id}&select=skills"
            jresp = requests.get(job_url, headers=base_headers, timeout=15)
            if jresp.status_code == 200:
                jdata = jresp.json()
                if isinstance(jdata, list) and len(jdata) > 0:
                    req_skills = jdata[0].get("skills") or []
            else:
                app.logger.warning("Could not fetch job skills: %s %s", jresp.status_code, jresp.text)
                req_skills = []

        req_norm_global = norm_list(req_skills)

        for a in apps:
            try:
                a_id = a.get("id")
                candidate = a.get("candidates") or {}
                profile = candidate.get("profile", {}) if isinstance(candidate.get("profile"), dict) else {}

                cand_skills_source = profile.get("skills") or profile.get("skills_text") or candidate.get("skills") or candidate.get("skills_text") or []
                cand_norm = norm_list(cand_skills_source)

                skill_match = 0.0
                if req_norm_global and cand_norm:
                    matches = set(req_norm_global).intersection(set(cand_norm))
                    skill_match = (len(matches) / max(1, len(req_norm_global))) * 100.0

                # experience
                exp_years = 0
                try:
                    exp_val = profile.get("experience_years") or profile.get("experience") or candidate.get("experience") or 0
                    if isinstance(exp_val, str):
                        import re
                        m = re.search(r"(\d+)", exp_val)
                        exp_years = int(m.group(1)) if m else 0
                    else:
                        exp_years = int(exp_val or 0)
                except Exception:
                    exp_years = 0

                candidate_data_for_scoring = {
                    "skill_match": skill_match,
                    "experience_years": exp_years,
                    "cultural_fit": float(profile.get("cultural_fit") or 0.5),
                    "growth_potential": float(profile.get("growth_potential") or 0.5),
                    "resume_quality": float(profile.get("resume_quality") or 0.5),
                }

                # attrition_prob best-effort (default 0)
                attrition_prob = 0.0

                try:
                    final_score, breakdown = calculate_fitment_score(candidate_data_for_scoring, attrition_prob)
                except Exception:
                    app.logger.exception("calculate_fitment_score failed for candidate %s", candidate.get("id"))
                    final_score, breakdown = 0.0, {}

                # upsert fitment_score for this application row (patch by id)
                if a_id:
                    patch_url = f"{SUPABASE_URL}/rest/v1/applications?id=eq.{a_id}"
                    patch_body = {"fitment_score": float(final_score), "sub_scores": breakdown}
                    patch_headers = {**base_headers, "Prefer": "return=representation"}
                    patch_resp = requests.patch(patch_url, headers=patch_headers, json=patch_body, timeout=30)
                    if patch_resp.status_code not in (200, 204):
                        app.logger.warning("Failed to update application %s: %s %s", a_id, patch_resp.status_code, patch_resp.text)
                    else:
                        app.logger.info("Updated application %s with score %s", a_id, final_score)
                else:
                    # fallback: insert if no application id (unlikely)
                    post_url = f"{SUPABASE_URL}/rest/v1/applications"
                    insert_body = {
                        "job_id": job_id,
                        "candidate_id": candidate.get("id"),
                        "status": "applied",
                        "fitment_score": float(final_score),
                        "sub_scores": breakdown
                    }
                    post_resp = requests.post(post_url, headers={**base_headers, "Prefer": "return=representation"}, json=insert_body, timeout=30)
                    if post_resp.status_code not in (200, 201):
                        app.logger.warning("Failed to insert application row for candidate %s: %s %s", candidate.get("id"), post_resp.status_code, post_resp.text)

                results.append({
                    "candidate_id": candidate.get("id"),
                    "display_name": candidate.get("display_name"),
                    "email": candidate.get("email"),
                    "fitment_score": float(final_score),
                    "sub_scores": breakdown
                })
            except Exception:
                app.logger.exception("Error processing application row: %s", a)
                # continue to next application

        # sort descending
        results.sort(key=lambda x: x.get("fitment_score", 0), reverse=True)
        return jsonify(results), 200

    except Exception:
        app.logger.exception("rank endpoint error")
        return jsonify({"error": "Ranking service error"}), 500

if __name__ == "__main__":
    app.run(debug=True)
