def parse_resume(filepath):
    """
    Extract features (mock data for now).
    In real use, parse resume to infer these.
    """
    candidate = {
        "Age": 27,
        "JobSatisfaction": 4,
        "EnvironmentSatisfaction": 3,
        "MonthlyIncome": 6500,
        "YearsAtCompany": 2,
        "DistanceFromHome": 10,
        "WorkLifeBalance": 3,
        "Education": 3,
        "JobInvolvement": 3,
        "skill_match": 0.85,
        "cultural_fit": 0.7,
        "growth_potential": 0.78
    }
    return candidate
