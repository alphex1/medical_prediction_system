"""
MediPredict — FastAPI Backend
==============================
Run with:  uvicorn app:app --reload --port 8000
Docs at:   http://localhost:8000/docs

Folder structure (either works):
  ── app.py
  ── ensemble_model.pkl
  ── label_encoder.pkl
  ── model_meta.json

  OR:
  ── app.py
  ── model/
       ├── ensemble_model.pkl
       ├── label_encoder.pkl
       └── model_meta.json
"""
import os
from database import SessionLocal, engine
from models import User, Prediction, Base

# ✅ CREATE TABLES
Base.metadata.create_all(bind=engine)

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, validator
from typing import List
import joblib, json, numpy as np, os

# ── App ────────────────────────────────────────────────────────
app = FastAPI(
    title="MediPredict API",
    description="AI-powered disease prediction from symptoms",
    version="2.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "https://medical-prediction-system-gamma.vercel.app",
        "https://*.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Locate model files (works whether they're in model/ or root) ─
BASE = os.path.dirname(__file__)

def find_file(filename: str) -> str:
    """Search for a file in the script dir and a model/ subdir."""
    candidates = [
        os.path.join(BASE, filename),
        os.path.join(BASE, "model", filename),
    ]
    for path in candidates:
        if os.path.exists(path):
            return path
    raise FileNotFoundError(
        f"Could not find '{filename}'. Checked:\n" +
        "\n".join(f"  {p}" for p in candidates)
    )

model   = joblib.load(find_file("ensemble_model.pkl"))
encoder = joblib.load(find_file("label_encoder.pkl"))

with open(find_file("model_meta.json")) as f:
    meta = json.load(f)

SYMPTOMS     = meta["symptoms"]       # 20 ordered keys
CLASSES      = meta["classes"]        # 8 disease labels
DISEASE_INFO = meta["disease_info"]
SYMPTOM_SET  = set(SYMPTOMS)

# ── Static data ────────────────────────────────────────────────

SYMPTOM_LABELS = {
    "fever":                  "Fever",
    "cough":                  "Cough",
    "headache":               "Headache",
    "fatigue":                "Fatigue",
    "vomiting":               "Vomiting",
    "nausea":                 "Nausea",
    "chills":                 "Chills",
    "sweating":               "Sweating",
    "chest_pain":             "Chest Pain",
    "shortness_of_breath":    "Shortness of Breath",
    "weight_loss":            "Weight Loss",
    "frequent_urination":     "Frequent Urination",
    "blurred_vision":         "Blurred Vision",
    "loss_of_taste_smell":    "Loss of Taste / Smell",
    "joint_pain":             "Joint Pain",
    "skin_rash":              "Skin Rash",
    "yellowing_of_skin_eyes": "Yellowing of Skin / Eyes",
    "abdominal_pain":         "Abdominal Pain",
    "muscle_pain":            "Muscle Pain",
    "loss_of_appetite":       "Loss of Appetite",
}

SYMPTOM_GROUPS = {
    "General": [
        "fever", "fatigue", "chills", "sweating",
        "weight_loss", "loss_of_appetite", "nausea", "vomiting",
    ],
    "Head & Senses": [
        "headache", "blurred_vision", "loss_of_taste_smell",
    ],
    "Chest & Breathing": [
        "chest_pain", "shortness_of_breath", "cough",
    ],
    "Body & Skin": [
        "joint_pain", "muscle_pain", "skin_rash",
        "yellowing_of_skin_eyes", "abdominal_pain",
    ],
    "Metabolic / Urinary": [
        "frequent_urination",
    ],
}

DISEASE_DESCRIPTIONS = {
    "Dengue":        "A mosquito-borne viral infection causing severe flu-like illness. Characterised by high fever, rash and joint pain.",
    "Diabetes":      "A metabolic condition where the body cannot properly regulate blood sugar. Causes frequent urination, thirst and fatigue.",
    "Healthy":       "Your symptoms do not strongly match any of the tracked conditions. Stay hydrated, rest well and monitor your health.",
    "Heart Disease": "A range of conditions affecting the heart's function. Chest pain and breathlessness are key warning signs.",
    "Jaundice":      "Yellowing of the skin and eyes caused by high bilirubin, often signalling a liver or bile duct issue.",
    "Malaria":       "A parasitic infection spread by mosquitoes causing cyclical fever, chills and sweating.",
    "Pneumonia":     "A lung infection inflaming the air sacs, causing fever, cough and difficulty breathing.",
    "Typhoid":       "A bacterial infection from contaminated food or water causing prolonged fever and abdominal pain.",
}

DIET_ADVICE = {
    "Dengue":        "High fluid intake, coconut water, papaya leaf juice. Eat light, easily digestible foods.",
    "Diabetes":      "Low glycemic index foods, high fibre. Avoid sugar and refined carbs. Small frequent meals.",
    "Healthy":       "Maintain a balanced diet rich in fruits, vegetables, lean protein and whole grains.",
    "Heart Disease": "Low sodium, low saturated fat. Include fish, nuts, whole grains and plenty of vegetables.",
    "Jaundice":      "Low fat, high carbohydrate diet. Plenty of water and fresh fruit juices. Strictly avoid alcohol.",
    "Malaria":       "High calorie, high protein meals. Plenty of fluids. Include bananas, rice and boiled vegetables.",
    "Pneumonia":     "Warm fluids, soups and broths. Vitamin C rich foods (citrus, berries). Stay well hydrated.",
    "Typhoid":       "High calorie soft foods — porridge, boiled rice, mashed potatoes. Avoid raw vegetables and spicy food.",
}

PRECAUTIONS = {
    "Dengue":        ["Use mosquito repellent", "Wear full-sleeve clothes", "Eliminate stagnant water", "Rest and stay hydrated"],
    "Diabetes":      ["Monitor blood sugar daily", "Exercise regularly", "Avoid sugary drinks", "Take medications as prescribed"],
    "Healthy":       ["Maintain regular sleep", "Stay physically active", "Eat balanced meals", "Schedule annual check-ups"],
    "Heart Disease": ["Avoid smoking", "Limit alcohol", "Exercise regularly", "Manage stress and blood pressure"],
    "Jaundice":      ["Avoid alcohol completely", "Rest adequately", "Avoid fatty foods", "Follow up with a liver specialist"],
    "Malaria":       ["Use mosquito nets", "Take prescribed antimalarials", "Stay indoors at dusk", "Complete the full course of treatment"],
    "Pneumonia":     ["Complete antibiotic course", "Rest adequately", "Cover mouth when coughing", "Avoid cold air and smoke"],
    "Typhoid":       ["Drink only boiled or bottled water", "Wash hands thoroughly", "Avoid street food", "Complete antibiotic course"],
}

# ── Schemas ────────────────────────────────────────────────────

class PredictRequest(BaseModel):
    symptoms: List[str]
    user_email: str

    @validator("symptoms")
    def check(cls, v):
        if len(v) == 0:
            raise ValueError("Select at least one symptom.")
        return v

class PredictionItem(BaseModel):
    disease:     str
    confidence:  float
    specialist:  str
    urgency:     str
    description: str
    diet:        str
    precautions: List[str]

class PredictResponse(BaseModel):
    top_prediction:   PredictionItem
    alternatives:     List[PredictionItem]
    symptom_count:    int
    valid_symptoms:   List[str]
    unknown_symptoms: List[str]
    low_confidence:   bool
    disclaimer:       str

# ── Helper ─────────────────────────────────────────────────────

def build_prediction(label: str, confidence: float) -> PredictionItem:
    info = DISEASE_INFO.get(label, {"specialist": "General Physician", "urgency": "Medium"})
    return PredictionItem(
        disease     = label,
        confidence  = confidence,
        specialist  = info["specialist"],
        urgency     = info["urgency"],
        description = DISEASE_DESCRIPTIONS.get(label, ""),
        diet        = DIET_ADVICE.get(label, ""),
        precautions = PRECAUTIONS.get(label, []),
    )

# ── Routes ─────────────────────────────────────────────────────

@app.get("/")
def root():
    return {
        "service":   "MediPredict API",
        "version":   "2.0.0",
        "status":    "running",
        "endpoints": ["/predict", "/symptoms", "/diseases", "/health"],
    }


@app.get("/health")
def health():
    return {"status": "ok", "model_loaded": model is not None}


@app.get("/symptoms")
def get_symptoms():
    """All 20 symptoms grouped by body area — used by the frontend UI."""
    grouped = {}
    for group, keys in SYMPTOM_GROUPS.items():
        grouped[group] = [
            {"key": k, "label": SYMPTOM_LABELS[k]}
            for k in keys if k in SYMPTOM_SET
        ]
    return {
        "groups": grouped,
        "all":    [{"key": k, "label": SYMPTOM_LABELS[k]} for k in SYMPTOMS],
        "total":  len(SYMPTOMS),
    }


@app.get("/diseases")
def get_diseases():
    """All 8 supported diseases with full metadata."""
    return {
        "diseases": [
            {
                "name":        d,
                "specialist":  DISEASE_INFO[d]["specialist"],
                "urgency":     DISEASE_INFO[d]["urgency"],
                "description": DISEASE_DESCRIPTIONS[d],
                "diet":        DIET_ADVICE[d],
                "precautions": PRECAUTIONS[d],
            }
            for d in CLASSES
        ]
    }


@app.post("/predict", response_model=PredictResponse)
def predict(req: PredictRequest):
    """
    Core prediction endpoint.

    Input:
        {
          "symptoms": ["fever", "chills"],
          "user_email": "test@gmail.com"
        }

    Output:
        Top disease + alternatives + metadata
    """

    # ── STEP 1: Filter valid & unknown symptoms ────────────────
    valid   = [s for s in req.symptoms if s in SYMPTOM_SET]
    unknown = [s for s in req.symptoms if s not in SYMPTOM_SET]

    # If no valid symptoms → throw error
    if not valid:
        raise HTTPException(
            status_code=422,
            detail="No recognised symptoms found. Call GET /symptoms for the valid list."
        )

    # ── STEP 2: Convert symptoms → model input vector ──────────
    # Create binary vector (0/1 for each symptom)
    vec = np.zeros(len(SYMPTOMS), dtype=float)

    for s in valid:
        vec[SYMPTOMS.index(s)] = 1.0

    # ── STEP 3: Run ML model prediction ────────────────────────
    proba = model.predict_proba(vec.reshape(1, -1))[0]

    # Get top 3 predictions (highest probability first)
    top3  = np.argsort(proba)[::-1][:3]

    # Convert predictions into structured response
    results = [
        build_prediction(CLASSES[i], round(float(proba[i]) * 100, 1))
        for i in top3
    ]

    # ── STEP 4: Save prediction to MySQL database ──────────────
    db = SessionLocal()

    prediction = Prediction(
        user_email=req.user_email,              # which user made prediction
        disease=results[0].disease,             # top predicted disease
        confidence=results[0].confidence,       # confidence score
        symptoms=",".join(valid)                # store symptoms as string
    )

    db.add(prediction)
    db.commit()

    # ── STEP 5: Return response to frontend ────────────────────
    return PredictResponse(
        top_prediction   = results[0],
        alternatives     = results[1:],          # next 2 predictions
        symptom_count    = len(valid),
        valid_symptoms   = valid,
        unknown_symptoms = unknown,
        low_confidence   = results[0].confidence < 50.0,
        disclaimer       = (
            "This result is for informational purposes only and is NOT a medical diagnosis. "
            "Please consult a licensed healthcare professional for proper evaluation and treatment."
        ),
    )
# ── AUTH APIs ─────────────────────────────────────────────

@app.post("/register")
def register(user: dict):
    db = SessionLocal()

    existing = db.query(User).filter(User.email == user["email"]).first()
    if existing:
        return {"error": "User already exists"}

    new_user = User(
        email=user["email"],
        name=user.get("name", ""),
        password=user["password"],
        age=user.get("age"),
        gender=user.get("gender")
    )

    db.add(new_user)
    db.commit()

    return {"email": new_user.email, "name": new_user.name, "age": new_user.age, "gender": new_user.gender, "created_at": str( new_user.created_at )}


@app.post("/login")
def login(user: dict):
    db = SessionLocal()

    u = db.query(User).filter(User.email == user["email"]).first()
    if not u:
        return {"error": "User not found"}

    if u.password != user["password"]:
        return {"error": "Incorrect password"}

    return {"email": u.email, "name": u.name, "age": u.age, "gender": u.gender, "created_at": str( u.created_at )}

@app.get("/history/{email}")
def get_history(email: str):
    db = SessionLocal()

    predictions = db.query(Prediction).filter(Prediction.user_email == email).all()

    return [
        {
            "id": p.id,   # ✅ required for delete
            "disease": p.disease,
            "confidence": p.confidence,
            "symptoms": p.symptoms
        }
        for p in predictions
    ]


@app.delete("/delete/{id}")
def delete_prediction(id: int):
    db = SessionLocal()

    pred = db.query(Prediction).filter(Prediction.id == id).first()

    if not pred:
        return {"error": "Prediction not found"}

    db.delete(pred)
    db.commit()

    return {"message": "Deleted successfully"}
