def calculate_fitment_score(candidate_data, attrition_prob):
    skill_match = candidate_data["skill_match"]
    cultural_fit = candidate_data["cultural_fit"]
    growth = candidate_data["growth_potential"]
    attrition_fit = 1 - attrition_prob

    # Weighted scoring
    score = (
        0.4 * skill_match +
        0.2 * cultural_fit +
        0.25 * growth +
        0.15 * attrition_fit
    )
    breakdown = {
        "Skill Match": round(skill_match * 100, 2),
        "Cultural Fit": round(cultural_fit * 100, 2),
        "Growth Potential": round(growth * 100, 2),
        "Attrition Risk (lower is better)": round(attrition_prob * 100, 2)
    }
    return round(score * 100, 2), breakdown
