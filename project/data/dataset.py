import os
import torch
from torch.utils.data import Dataset
from PIL import Image

class MultimodalProductDataset(Dataset):
    """
    PyTorch Dataset mapping Images and Text Descriptions to Product Ratings.
    
    Args:
        dataframe (pd.DataFrame): Dataset containing 'image_id', 'description', and 'rating'.
        img_dir (str): Path to the directory containing product images.
        processor (CLIPProcessor): Preprocessing pipeline from transformers.
    """
    def __init__(self, dataframe, img_dir, processor):
        self.dataframe = dataframe
        self.img_dir = img_dir
        self.processor = processor

    def __len__(self):
        return len(self.dataframe)

    def __getitem__(self, idx):
        row = self.dataframe.iloc[idx]
        
        # Extract metadata
        img_name = f"{row['image_id']}.jpg"
        img_path = os.path.join(self.img_dir, img_name)
        text = str(row['description']).strip()
        rating = float(row['rating'])
        
        # Load and convert image to RGB
        try:
            image = Image.open(img_path).convert("RGB")
        except FileNotFoundError:
            # Fallback to empty image/padding if visual data is missing
            image = Image.new('RGB', (224, 224), color='white')

        # Run CLIP processor on text and image 
        # This acts as our preprocessing pipeline (truncating, normalizing)
        inputs = self.processor(
            text=text,
            images=image,
            return_tensors="pt",
            padding="max_length",
            truncation=True,
            max_length=77 # Maximum sequence length for standard CLIP
        )

        return {
            'pixel_values': inputs['pixel_values'].squeeze(0),
            'input_ids': inputs['input_ids'].squeeze(0),
            'attention_mask': inputs['attention_mask'].squeeze(0),
            'ratings': torch.tensor(rating, dtype=torch.float)
        }
