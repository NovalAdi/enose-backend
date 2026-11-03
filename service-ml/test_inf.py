import joblib
import pandas as pd
import shap
import numpy as np
import os

model = joblib.load("models/enose_randomforest.sav")
scaler = joblib.load("models/scaler_enose.sav")
explainer = shap.TreeExplainer(model)

input_data = [0.5] * 10
data_array = np.array(input_data).reshape(1, -1)

try:
    scaled_data = scaler.transform(data_array)
    prediction = model.predict(scaled_data)[0]
    shap_values = explainer.shap_values(scaled_data)
    print("Inference successful")
    print(f"Prediction:", prediction)
    print(f"Shap type:", type(shap_values))
    if isinstance(shap_values, list):
        print("Shap list length:", len(shap_values))
        print("Shap item shape:", shap_values[0].shape)
    else:
        print("Shap shape:", shap_values.shape)
except Exception as e:
    print(f"Error during inference: {e}")
