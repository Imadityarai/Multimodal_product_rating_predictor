import os
import copy
import torch
import torch.nn as nn
from tqdm import tqdm
from sklearn.metrics import mean_absolute_error, r2_score

def train_model(model, train_loader, val_loader, optimizer, scheduler, num_epochs=20, device='cuda', patience=5):
    """
    Trains the multimodal regression model using early stopping.
    
    Metrics:
        - MSE (Loss function)
        - MAE (Mean Absolute Error)
        - R² Score
    """
    criterion = nn.MSELoss()
    model = model.to(device)
    
    best_val_loss = float('inf')
    best_model_wts = copy.deepcopy(model.state_dict())
    epochs_no_improve = 0
    
    history = {'train_loss': [], 'val_loss': [], 'val_mae': [], 'val_r2': []}

    print(f"Starting training on device: {device}")
    
    for epoch in range(num_epochs):
        print(f"\\nEpoch {epoch+1}/{num_epochs}")
        print("-" * 20)
        
        # --- TRAINING PHASE ---
        model.train()
        train_loss = 0.0
        
        for batch in tqdm(train_loader, desc="Training"):
            pixel_values = batch['pixel_values'].to(device)
            input_ids = batch['input_ids'].to(device)
            attention_mask = batch['attention_mask'].to(device)
            targets = batch['ratings'].to(device)
            
            optimizer.zero_grad()
            
            outputs = model(input_ids, attention_mask, pixel_values)
            loss = criterion(outputs, targets)
            
            loss.backward()
            optimizer.step()
            
            train_loss += loss.item() * pixel_values.size(0)
            
        epoch_train_loss = train_loss / len(train_loader.dataset)
        history['train_loss'].append(epoch_train_loss)
        
        # --- VALIDATION PHASE ---
        model.eval()
        val_loss = 0.0
        all_preds = []
        all_targets = []
        
        with torch.no_grad():
            for batch in tqdm(val_loader, desc="Validation"):
                pixel_values = batch['pixel_values'].to(device)
                input_ids = batch['input_ids'].to(device)
                attention_mask = batch['attention_mask'].to(device)
                targets = batch['ratings'].to(device)
                
                outputs = model(input_ids, attention_mask, pixel_values)
                loss = criterion(outputs, targets)
                
                val_loss += loss.item() * pixel_values.size(0)
                
                all_preds.extend(outputs.cpu().numpy())
                all_targets.extend(targets.cpu().numpy())
                
        epoch_val_loss = val_loss / len(val_loader.dataset)
        val_mae = mean_absolute_error(all_targets, all_preds)
        val_r2 = r2_score(all_targets, all_preds)
        
        history['val_loss'].append(epoch_val_loss)
        history['val_mae'].append(val_mae)
        history['val_r2'].append(val_r2)
        
        print(f"Train Loss (MSE): {epoch_train_loss:.4f} | Val Loss (MSE): {epoch_val_loss:.4f}")
        print(f"Val MAE: {val_mae:.4f} | Val R²: {val_r2:.4f}")
        
        scheduler.step(epoch_val_loss)
        
        # Early Stopping Logic
        if epoch_val_loss < best_val_loss:
            best_val_loss = epoch_val_loss
            best_model_wts = copy.deepcopy(model.state_dict())
            epochs_no_improve = 0
            # Save the best model state
            os.makedirs('../saved_models', exist_ok=True)
            torch.save(best_model_wts, '../saved_models/best_multimodal_model.pth')
            print("=> Saved new best model")
        else:
            epochs_no_improve += 1
            print(f"=> No improvement for {epochs_no_improve} epoch(s)")
            if epochs_no_improve >= patience:
                print("Early stopping triggered!")
                break
                
    # Load best model weights before returning
    model.load_state_dict(best_model_wts)
    return model, history
