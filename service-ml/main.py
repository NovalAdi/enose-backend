
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import joblib
import pandas as pd
import shap
import numpy as np
import os

app = FastAPI(title="E-Nose API", docs_url="/docs", redoc_url="/redoc")

# Add CORS middleware to allow requests from the React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust this to your deployed frontend URL later
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load model and scaler
MODEL_PATH = "models/enose_randomforest.sav"
SCALER_PATH = "models/scaler_enose.sav"

if not os.path.exists(MODEL_PATH) or not os.path.exists(SCALER_PATH):
    raise FileNotFoundError("Model or Scaler file not found")

model = joblib.load(MODEL_PATH)
scaler = joblib.load(SCALER_PATH)

FEATURE_NAMES = ['MQ6', 'MQ4', 'TGS2620', 'MQ5', 'MQ2', 'TGS2602', 'MQ7', 'MQ3', 'MQ135', 'MQ138']

class InferenceInput(BaseModel):
    data: list[float] = [0.0] * 10  # Default dummy data

    class Config:
        json_schema_extra = {
            "example": {
                "data": [0.5, 0.2, 0.1, 0.8, 0.3, 0.4, 0.1, 0.2, 0.9, 0.1]
            }
        }

@app.post("/predict", summary="Predict odor class", description="Takes 10 sensor values and returns the predicted odor class.")
async def predict(input_data: InferenceInput):
    if len(input_data.data) != 10:
        raise HTTPException(status_code=400, detail="Input must have exactly 10 features")
    
    data_array = np.array(input_data.data).reshape(1, -1)
    scaled_data = scaler.transform(data_array)
    prediction = model.predict(scaled_data)
    
    return {"prediction": prediction[0]}

@app.post("/predict-and-explain")
async def predict_and_explain(input_data: InferenceInput):
    if len(input_data.data) != 10:
        raise HTTPException(status_code=400, detail="Input must have exactly 10 features")
    
    data_array = np.array(input_data.data).reshape(1, -1)
    scaled_data = scaler.transform(data_array)
    
    # Prediction
    prediction = model.predict(scaled_data)[0]
    
    # Explanation (SHAP)
    explainer = shap.TreeExplainer(model)
    shap_values = explainer.shap_values(scaled_data)
    
    class_idx = np.where(model.classes_ == prediction)[0][0]
    
    if len(shap_values.shape) == 3:
        values = shap_values[class_idx][0].tolist()
    else:
        values = shap_values[0].tolist()

    return {
        "prediction": str(prediction),
        "feature_names": FEATURE_NAMES,
        "shap_values": values
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
