from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn
import torch
from transformers import CLIPProcessor
from PIL import Image
import io
import sys
import os

# Append project root to path for local imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from models.clip_fusion import MultimodalRatingPredictor

app = FastAPI(
    title="Multimodal Rating Predictor API",
    description="Backend API to predict product ratings based on Image + Text using custom CLIP model.",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global variables for model and processor
device = "cuda" if torch.cuda.is_available() else "cpu"
model = None
processor = None

@app.on_event("startup")
def load_model():
    """Load the model and processor into memory when API starts."""
    global model, processor
    try:
        model_name = "openai/clip-vit-base-patch32"
        processor = CLIPProcessor.from_pretrained(model_name)
        
        model = MultimodalRatingPredictor(clip_model_name=model_name)
        
        # Important: Load your saved weights here!
        # weights_path = "../saved_models/best_multimodal_model.pth"
        # model.load_state_dict(torch.load(weights_path, map_location=device))
        
        model.to(device)
        model.eval()
        print(f"Model successfully loaded onto {device}.")
    except Exception as e:
        print(f"Error loading model: {e}")

@app.post("/predict")
async def predict_rating(
    description: str = Form(...),
    image: UploadFile = File(...)
):
    """
    Endpoint mapping an uploaded image and text description to a 1-5 predicted rating.
    """
    if not model or not processor:
        raise HTTPException(status_code=503, detail="Model is not loaded.")
        
    try:
        # 1. Read and Process Image
        image_bytes = await image.read()
        img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        
        # 2. Process Inputs through CLIP Tokenizer/Processor
        inputs = processor(
            text=description,
            images=img,
            return_tensors="pt",
            padding="max_length",
            truncation=True,
            max_length=77
        )
        
        # Move inputs to device
        pixel_values = inputs['pixel_values'].to(device)
        input_ids = inputs['input_ids'].to(device)
        attention_mask = inputs['attention_mask'].to(device)
        
        # 3. Forward Pass
        with torch.no_grad():
            prediction = model(input_ids, attention_mask, pixel_values)
            
        predicted_rating = prediction.item()
        
        # 4. Clamp resulting ratings between 1 and 5
        predicted_rating = max(1.0, min(5.0, predicted_rating))
        
        return {
            "status": "success",
            "prediction": round(predicted_rating, 2),
            "description_processed": description[:50] + "..."
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")

class HealthCheck(BaseModel):
    status: str

@app.get("/health", response_model=HealthCheck)
def health_check():
    return {"status": "ok"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
