import torch
import torch.nn as nn
from transformers import CLIPModel, CLIPProcessor

class MultimodalRatingPredictor(nn.Module):
    """
    Multimodal Rating Predictor using Pre-trained CLIP.

    This model fuses visual and textual representations extracted from OpenAI's CLIP 
    model to predict a continuous product rating. 
    
    Args:
        clip_model_name (str): HuggingFace hub name for the CLIP model.
        hidden_sizes (list): Dimensions of the hidden layers in the regression head.
        dropout (float): Dropout probability for regularization.
    """
    def __init__(self, clip_model_name="openai/clip-vit-base-patch32", hidden_sizes=[1024, 512, 256], dropout=0.2):
        super().__init__()
        # Load pre-trained CLIP model
        self.clip = CLIPModel.from_pretrained(clip_model_name)
        
        # Freeze CLIP parameters for linear probing
        # (Can optionally unfreeze the last few layers for fine-tuning)
        for param in self.clip.parameters():
            param.requires_grad = False
            
        clip_hidden_size = self.clip.config.projection_dim
        
        # We concatenate image and text embeddings, so input dim is doubled
        fusion_dim = clip_hidden_size * 2
        
        # Multi-Layer Perceptron (MLP) for Regression Head
        layers = []
        in_dim = fusion_dim
        for h_dim in hidden_sizes:
            layers.append(nn.Linear(in_dim, h_dim))
            layers.append(nn.ReLU())
            layers.append(nn.BatchNorm1d(h_dim))
            layers.append(nn.Dropout(dropout))
            in_dim = h_dim
            
        # Final output layer (rating predict: 1 continuous value)
        layers.append(nn.Linear(in_dim, 1))
        
        self.regression_head = nn.Sequential(*layers)
        
    def forward(self, input_ids, attention_mask, pixel_values):
        """
        Forward pass for multimodal fusion.
        """
        # 1. Extract and project Text Features
        text_outputs = self.clip.get_text_features(
            input_ids=input_ids,
            attention_mask=attention_mask
        )
        
        # 2. Extract and project Image Features
        image_outputs = self.clip.get_image_features(
            pixel_values=pixel_values
        )
        
        # Normalize representations to unit sphere (standard practice for CLIP embeddings)
        text_embeds = text_outputs / text_outputs.norm(p=2, dim=-1, keepdim=True)
        image_embeds = image_outputs / image_outputs.norm(p=2, dim=-1, keepdim=True)
        
        # 3. Multimodal Fusion: Concatenation
        # (Enhancement logic like Cross-Attention could be applied here)
        fused_features = torch.cat([image_embeds, text_embeds], dim=1)
        
        # 4. Predict rating
        rating_pred = self.regression_head(fused_features)
        
        # Squeeze out the last dimension to match target shape (batch_size,)
        return rating_pred.squeeze(-1)

