import os
import torch
import pandas as pd
import pyrebase
from flask import Flask, request, jsonify
from flask_cors import CORS
from torchvision import transforms
from PIL import Image
import torch.nn as nn
from torchvision import models
import json
import uuid


app = Flask(__name__)
CORS(app)  


with open("config.json") as f:
    firebase_config = json.load(f)


firebase = pyrebase.initialize_app(firebase_config)
auth = firebase.auth()


csv_file = "exnutitional.csv"
df = pd.read_csv(csv_file)


model = models.resnet18(pretrained=False)
model.fc = nn.Linear(model.fc.in_features, 5)  


model.load_state_dict(torch.load('knee_xray_model.pth'))
model.eval()  


transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
])


device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model.to(device)


class_names = ['Normal', 'Doubtful', 'Mild', 'Moderate', 'Severe']


def calculate_weight_category(height, weight):
    bmi = weight / (height ** 2)
    if bmi < 18.5:
        return "Underweight"
    elif 18.5 <= bmi < 24.9:
        return "Normal Weight"
    else:
        return "Overweight/Obese"


def get_health_advice(severity, age_group, gender, weight_category):
    match = df[(df["Severity"] == severity) &
               (df["Age Group"] == age_group) &
               (df["Gender"] == gender) &
               (df["Weight Category"] == weight_category)]

    if match.empty:
        return {"error": "No matching health advice found"}
    
    row = match.iloc[0]  
    return {
        "Exercise 1": row["Exercise 1"],
        "Exercise 2": row["Exercise 2"],
        "Nutritional Advice 1": row["Nutritional Advice 1"],
        "Nutritional Advice 2": row["Nutritional Advice 2"]
    }


def predict_image(image_path):
    try:
        image = Image.open(image_path)
        image = transform(image).unsqueeze(0)
        image = image.to(device)

        with torch.no_grad():
            outputs = model(image)
            _, predicted = torch.max(outputs, 1)
            return class_names[predicted.item()]
    except Exception as e:
        return str(e)

@app.route('/predict', methods=['POST'])
def predict():
    data = request.form

    
    file = request.files.get('file') 
    age_group = data.get("age_group")
    gender = data.get("gender")
    height = data.get("height")
    weight = data.get("weight")

    
    if not all([file, age_group, gender, height, weight]):
        return jsonify({'error': 'Missing required fields'}), 400

    try:
        height = float(height)
        weight = float(weight)
    except ValueError:
        return jsonify({'error': 'Height and weight must be numeric values'}), 400

    
    file_name = f"{uuid.uuid4().hex}.jpg"  
    file_path = os.path.join('uploads', file_name)

    try:
        
        if not os.path.exists('uploads'):
            os.makedirs('uploads')

        file.save(file_path)  

        severity = predict_image(file_path)
        weight_category = calculate_weight_category(height, weight)
        bmi = round(weight / (height ** 2), 2)
        health_advice = get_health_advice(severity, age_group, gender, weight_category)

        response = {
            "patient_details": {
                "age_group": age_group,
                "gender": gender,
                "height": height,
                "weight": weight,
                "bmi": bmi,
                "weight_category": weight_category
            },
            "predicted_severity": severity,
            "health_advice": health_advice
        }

        return jsonify(response), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/signup', methods=['POST'])
def signup():
    try:
        data = request.get_json()
        email = data.get("email")
        password = data.get("password")

       
        user = auth.create_user_with_email_and_password(email, password)
        return jsonify({"message": "User created successfully", "user_id": user['localId']}), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route('/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        email = data.get("email")
        password = data.get("password")

        
        user = auth.sign_in_with_email_and_password(email, password)
        return jsonify({
            "message": "Login successful",
            "user_id": user['localId'],
            "id_token": user['idToken']
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 400

if __name__ == '__main__':
    app.run(debug=True)
