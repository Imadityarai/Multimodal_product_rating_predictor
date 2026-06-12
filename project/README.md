# Multimodal Product Rating Prediction using CLIP

## Objective
This project implements a multi-modal Machine Learning architecture using PyTorch and HuggingFace Transformers. By combining the `get_image_features` and `get_text_features` pathways of OpenAI's CLIP model, this repository predicts product ratings (1-5 stars) from a combination of textual descriptions and product images.

## Architecture & Multimodal Fusion
1. **Extraction**: The image passes through the CLIP Vision Transformer (ViT), and text descriptions pass through the CLIP Text Transformer.
2. **Alignment**: Since CLIP aligns image and text representations in the same projection space, these vectors are geometrically coherent. We apply L2 normalization to each mode's embeddings.
3. **Fusion (Feature Concatenation)**: The two 512-dimensional vectors are concatenated across the feature dimension into a joint 1024-dimensional representation. 
4. **Regression**: A multi-layer perceptron (1024 -> 512 -> 256 -> 1) regresses this fused embedding to a continuous star value optimized with MSE.

## Directory Structure
- `data/`: Custom PyTorch Dataset `Dataset` classes
- `models/`: Neural network architecture classes (`clip_fusion.py`)
- `training/`: Training loop with AdamW, learning rate scheduling, and early stopping
- `api/`: Production-ready FastAPI integration for live inference
- `saved_models/`: Serialized `.pth` PyTorch model checkpoints

## Quickstart

1. Install requirements:
   ```bash
   pip install -r requirements.txt
   ```
2. Download data into `data/` and modify paths inside datasets.
3. Run training:
   ```bash
   python training/run.py
   ```
4. Start API locally:
   ```bash
   python api/main.py
   ```

## Baselines & Evaluations
We evaluate our fusion approach against two independent baselines:
- **Image-only Baseline**: Regressing exclusively off the `ViT` visual embeddings.
- **Text-only Baseline**: Regressing exclusively off the `Transformer` linguistic embeddings.
- **Result Metrics**: R² score, Mean Squared Error (MSE), and Mean Absolute Error (MAE).
