import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score
import pickle
import os

# Load dataset (place the CSV file in the folder called 'train_model')
df = pd.read_csv("train_model/WA_Fn-UseC_-HR-Employee-Attrition.csv")

# Encode categorical variables
label_encoders = {}
for col in df.select_dtypes(include=["object"]).columns:
    le = LabelEncoder()
    df[col] = le.fit_transform(df[col])
    label_encoders[col] = le

# Select relevant features
features = [
    "Age", "JobSatisfaction", "EnvironmentSatisfaction",
    "MonthlyIncome", "YearsAtCompany", "DistanceFromHome",
    "WorkLifeBalance", "Education", "JobInvolvement"
]
X = df[features]
y = df["Attrition"]  # Encoded as 1 = Yes, 0 = No

# Scale features
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

# Train-test split
X_train, X_test, y_train, y_test = train_test_split(X_scaled, y, test_size=0.2, random_state=42)

# Train Logistic Regression model
model = LogisticRegression(max_iter=1000)
model.fit(X_train, y_train)

# Evaluate accuracy
y_pred = model.predict(X_test)
acc = accuracy_score(y_test, y_pred)
print(f"Model Accuracy: {acc * 100:.2f}%")

# Save model and scaler
os.makedirs("models", exist_ok=True)
with open("models/attrition_model.pkl", "wb") as f:
    pickle.dump(model, f)
with open("models/scaler.pkl", "wb") as f:
    pickle.dump(scaler, f)

print("✅ Attrition model and scaler saved successfully in 'models/' folder.")
