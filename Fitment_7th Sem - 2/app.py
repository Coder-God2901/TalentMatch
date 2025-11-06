from flask import Flask, render_template, request
import os
import pickle
import numpy as np
from utils.resume_parser import parse_resume
from utils.score_calculator import calculate_fitment_score

app = Flask(__name__)
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

if __name__ == "__main__":
    app.run(debug=True)
