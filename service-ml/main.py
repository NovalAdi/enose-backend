
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import joblib
import pandas as pd
import shap
import numpy as np
import os

app = FastAPI()

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
    data: list[float]  # Should be 10 features

@app.post("/predict")
async def predict(input_data: InferenceInput):
    if len(input_data.data) != 10:
        raise HTTPException(status_code=400, detail="Input must have exactly 10 features")
    
    data_array = np.array(input_data.data).reshape(1, -1)
    scaled_data = scaler.transform(data_array)
    prediction = model.predict(scaled_data)
    
    return {"prediction": prediction[0]}

@app.post("/explain")
async def explain(input_data: InferenceInput):
    if len(input_data.data) != 10:
        raise HTTPException(status_code=400, detail="Input must have exactly 10 features")
    
    data_array = np.array(input_data.data).reshape(1, -1)
    scaled_data = scaler.transform(data_array)
    
    # SHAP explainer
    # Note: For Random Forest, TreeExplainer is best. 
    # For a production app, you might want to pre-calculate/fit the background dataset.
    # Here we use the model itself which for TreeExplainer is fine.
    explainer = shap.TreeExplainer(model)
    shap_values = explainer.shap_values(scaled_data)
    
    # SHAP values can be nested for multi-class classification
    # Let's return the values for the predicted class
    prediction = model.predict(scaled_data)[0]
    class_idx = np.where(model.classes_ == prediction)[0][0]
    
    # If binary, shap_values might be 2D; if multiclass, 3D
    if len(shap_values.shape) == 3:
        values = shap_values[class_idx][0].tolist()
    else:
        values = shap_values[0].tolist()

    return {
        "feature_names": FEATURE_NAMES,
        "shap_values": values,
        "prediction": prediction
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
