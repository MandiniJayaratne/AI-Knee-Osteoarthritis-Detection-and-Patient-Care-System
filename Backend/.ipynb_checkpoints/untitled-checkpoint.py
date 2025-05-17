import os
import torch
from flask import Flask, request, jsonify
from torchvision import transforms
from PIL import Image
import torch.nn as nn
from torchvision import models

# Initialize Flask app
app = Flask(__name__)

# Load the trained model
model = models.resnet18(pretrained=False)
model.fc = nn.Linear(model.fc.in_features, 5)  # Assuming you have 5 classes

# Load model weights
model.load_state_dict(torch.load('knee_xray_model.pth'))
model.eval()  # Set the model to evaluation mode

# Define the transformations for the image
transform = transforms.Compose([
    transforms.Resize((224, 224)),  # Resize to match input size for ResNet-18
    transforms.ToTensor(),  # Convert image to tensor
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])  # Normalize like ImageNet
])

# Define device
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model.to(device)

# Define the human-readable class labels
class_names = [
    'Normal',        # class_0
    'Doubtful',      # class_1
    'Mild',          # class_2
    'Moderate',      # class_3
    'Severe'         # class_4
]

# Helper function to process the image and predict
def predict_image(image_path):
    try:
        image = Image.open(image_path)  # Open image from file path
        image = transform(image).unsqueeze(0)  # Apply transformation and add batch dimension
        image = image.to(device)

        # Forward pass to get predictions
        with torch.no_grad():
            outputs = model(image)
            _, predicted = torch.max(outputs, 1)
            return predicted.item()
    except Exception as e:
        return str(e)

@app.route('/predict', methods=['POST'])
def predict():
    data = request.get_json()  # Expecting JSON with file_path as key

    if 'file_path' not in data:
        return jsonify({'error': 'No file_path provided'}), 400

    file_path = data['file_path']

    # Check if the file exists
    if not os.path.isfile(file_path):
        return jsonify({'error': f'File not found at {file_path}'}), 400

    try:
        class_idx = predict_image(file_path)  # Predict the class index
        if isinstance(class_idx, int):
            return jsonify({'predicted_class': class_names[class_idx]}), 200
        else:
            return jsonify({'error': class_idx}), 500  # Error message from exception
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)