from flask import Flask, request, jsonify
import pandas as pd
import numpy as np
import pickle
import pdfplumber
import re
import os
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Global variables
model = None
model_data = None
feature_info = None
companies = None


# ---------------------------
# Text Cleaning
# ---------------------------
def clean_text(text):
    if pd.isna(text):
        return ""
    text = str(text).lower()
    text = re.sub(r'\S+@\S+', ' ', text)  # emails
    text = re.sub(r'http\S+|www.\S+', ' ', text)  # urls
    text = re.sub(r'[^a-z\s]', ' ', text)  # symbols/numbers
    return " ".join(text.split())


# ---------------------------
# Feature Engineering (Improved with category signals)
# ---------------------------
def extract_features(text):
    features = {}
    words = text.split()

    # --- Basic counts ---
    features['word_count'] = len(words)
    features['unique_words'] = len(set(words))

    # --- Skills detection ---
    original_skills = [
        'python', 'java', 'c++', 'sql', 'machine learning', 'deep learning',
        'nlp', 'html', 'css', 'javascript', 'react', 'django', 'flask'
    ]
    for skill in original_skills:
        features[f"skill_{skill}"] = 1 if skill in text else 0

    # --- Education detection ---
    features['has_btech'] = 1 if re.search(r'\bb\.?tech\b', text) else 0
    features['has_mtech'] = 1 if re.search(r'\bm\.?tech\b', text) else 0
    features['has_phd'] = 1 if re.search(r'\bph\.?d\b', text) else 0
    features['has_mba'] = 1 if re.search(r'\bmba\b', text) else 0
    features['has_bsc'] = 1 if re.search(r'\bb\.?sc\b', text) else 0
    features['has_msc'] = 1 if re.search(r'\bm\.?sc\b', text) else 0

    # --- Experience (years) ---
    exp_patterns = [
        r'(\d+)\s*(?:years?|yrs?)\s*(?:of\s*)?(?:experience|exp)',
        r'(\d+)\s*(?:\+|plus)\s*(?:years?|yrs?)',
        r'over\s+(\d+)\s*(?:years?|yrs?)',
        r'since\s+(\d{4})'
    ]
    years = []
    for p in exp_patterns:
        for match in re.findall(p, text):
            if isinstance(match, tuple):
                match = match[0]
            if match.isdigit():
                if len(match) == 4:  # year
                    current_year = 2025
                    years.append(current_year - int(match))
                else:
                    years.append(int(match))
    features['years_experience'] = max(years) if years else 0

    # --- Project detection ---
    project_keywords = [
        'project', 'developed', 'built', 'implemented', 'designed',
        'created', 'contributed', 'engineered'
    ]
    features['project_mentioned'] = int(any(kw in text for kw in project_keywords))

    # --- Internship detection ---
    internship_keywords = [
        'internship', 'intern', 'trainee', 'apprentice', 'fellowship'
    ]
    features['internship_mentioned'] = int(any(kw in text for kw in internship_keywords))

    # --- Category-specific signals ---
    category_keywords = {
        "Data Science": ['tensorflow', 'pytorch', 'pandas', 'numpy', 'scikit-learn', 'matplotlib', 'seaborn', 'jupyter'],
        "Web Development": ['nodejs', 'angular', 'vue', 'bootstrap', 'express', 'typescript'],
        "DevOps Engineer": ['docker', 'kubernetes', 'jenkins', 'terraform', 'ansible', 'aws', 'azure', 'gcp', 'ci/cd'],
        "Automation Testing": ['selenium', 'pytest', 'junit', 'testng', 'cypress', 'automation framework'],
        "Blockchain": ['blockchain', 'ethereum', 'solidity', 'smart contract', 'web3'],
        "Mobile App Development": ['android', 'ios', 'flutter', 'react native', 'swift', 'kotlin'],
        "Java Developer": ['spring boot', 'hibernate', 'jsp', 'servlets']
    }

    detected_category_keywords = {}

    for category, keywords in category_keywords.items():
        found = [kw for kw in keywords if kw in text]
        features[f"{category.lower().replace(' ', '_')}_keywords"] = len(found)
        if found:
            detected_category_keywords[category] = found

    # Attach detected category keywords for debugging/response
    features['detected_category_keywords'] = detected_category_keywords

    return features


# ---------------------------
# Load Model + Companies
# ---------------------------
def load_model():
    global model, model_data, feature_info
    try:
        with open('advanced_model.pkl', 'rb') as f:
            model_data = pickle.load(f)
        model = model_data['model']
        print("✅ Enhanced model loaded")
    except FileNotFoundError:
        try:
            with open('model.pkl', 'rb') as f:
                model = pickle.load(f)
            model_data = {'model_type': 'standard'}
            print("✅ Standard model loaded")
        except FileNotFoundError:
            print("❌ No model found")
            return False

    try:
        with open('feature_info.pkl', 'rb') as f:
            feature_info = pickle.load(f)
    except FileNotFoundError:
        feature_info = None
    return True


def load_companies():
    global companies
    for file in ["tech_companies_skills_list.xlsx", "companies.csv", "companies.xlsx"]:
        if os.path.exists(file):
            try:
                if file.endswith(".xlsx"):
                    companies = pd.read_excel(file)
                else:
                    companies = pd.read_csv(file)
                print(f"✅ Companies loaded from {file}")
                return True
            except Exception as e:
                print(f"⚠️ Error loading {file}: {e}")
    print("⚠️ No companies file found")
    return False


# ---------------------------
# PDF Text Extraction
# ---------------------------
def extract_text_from_pdf(file_stream):
    try:
        text = ""
        with pdfplumber.open(file_stream) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n"
        return text.strip()
    except Exception as e:
        print(f"❌ PDF extraction error: {e}")
        return ""


# ---------------------------
# Enhanced Prediction
# ---------------------------
def make_enhanced_prediction(resume_text):
    cleaned = clean_text(resume_text)
    features = extract_features(cleaned)
    features['resume_text'] = cleaned
    features['academic_background'] = "Computer Science"

    if model_data and 'feature_columns' in model_data:
        expected = model_data['feature_columns']
        for col in expected:
            if col not in features:
                if col in ['resume_text', 'academic_background']:
                    features[col] = "" if col == 'resume_text' else "Computer Science"
                elif col.startswith(('skill_', 'has_')) or col.endswith(('_count', '_keywords', '_experience', '_mentioned')):
                    features[col] = 0
                elif col in ['word_count', 'unique_words', 'avg_word_length', 'sentence_count', 'years_experience']:
                    features[col] = 0
                else:
                    features[col] = 0
        feature_df = pd.DataFrame([{col: features.get(col, 0) for col in expected}])
    else:
        feature_df = pd.DataFrame([features])

    prediction = model.predict(feature_df)
    probs = model.predict_proba(feature_df)

    top_prob = max(probs[0])
    confidence = round(top_prob * 100, 2)
    classes = model.classes_ if hasattr(model, 'classes_') else model_data.get('class_names', [prediction[0]])
    top_idx = np.argsort(probs[0])[-3:][::-1]

    return {
        'primary_prediction': prediction[0],
        'confidence': confidence,
        'top_3_predictions': [
            {'category': classes[i], 'probability': round(probs[0][i] * 100, 2)} for i in top_idx
        ],
        'prediction_quality': 'High' if confidence > 70 else 'Medium' if confidence > 50 else 'Low'
    }, features


# ---------------------------
# Routes
# ---------------------------
@app.route('/health')
def health_check():
    try:
        info = {}
        if model_data:
            info['model_type'] = model_data.get('model_type', 'unknown')
            info['class_names'] = model_data.get('class_names', [])
            info['features_count'] = len(model_data.get('feature_columns', [])) if 'feature_columns' in model_data else None
            if 'metrics' in model_data:
                info['f1_weighted'] = model_data['metrics'].get('f1_weighted')
                info['precision_weighted'] = model_data['metrics'].get('precision_weighted')

        return jsonify({
            'status': 'healthy',
            'model_loaded': model is not None,
            'companies_loaded': companies is not None,
            'feature_info_loaded': feature_info is not None,
            'model_info': info
        })
    except Exception as e:
        return jsonify({
            'status': 'error',
            'error': str(e),
            'model_loaded': model is not None
        }), 500


@app.route('/', methods=['GET'])
def home():
    return jsonify({
        'message': 'Enhanced Resume Internship Predictor API',
        'version': '2.0',
        'endpoints': {
            '/upload_and_predict': 'POST - Upload resume PDF',
            '/health': 'GET - API health'
        }
    })


@app.route('/upload_and_predict', methods=['POST'])
def upload_and_predict():
    try:
        if model is None:
            return jsonify({"error": "Model not loaded"}), 500

        if 'resume' not in request.files:
            return jsonify({"error": "No resume uploaded"}), 400

        file = request.files['resume']
        if not file.filename.lower().endswith('.pdf'):
            return jsonify({"error": "Only PDF files allowed"}), 400

        resume_text = extract_text_from_pdf(file.stream)
        if not resume_text:
            return jsonify({"error": "Failed to extract text"}), 400

        analysis, features = make_enhanced_prediction(resume_text)

        # Response with highlights
        response = {
            "predicted_internship": analysis['primary_prediction'],
            "confidence_level": f"{analysis['confidence']}%",
            "prediction_quality": analysis['prediction_quality'],
            "top_predictions": analysis['top_3_predictions'],
            "extracted_features": {
                "word_count": features.get('word_count', 0),
                "unique_words": features.get('unique_words', 0),
                "detected_skills": [k.replace('skill_', '').replace('_', ' ') for k, v in features.items() if k.startswith('skill_') and v == 1],
                "education": [k.replace('has_', '').upper() for k, v in features.items() if k.startswith('has_') and v == 1],
                "years_experience": features.get('years_experience', 0),
                "has_projects": bool(features.get('project_mentioned', 0)),
                "has_internship_experience": bool(features.get('internship_mentioned', 0)),
                "category_keyword_hits": features.get('detected_category_keywords', {})
            }
        }
        return jsonify(response)
    except Exception as e:
        return jsonify({"error": f"Enhanced prediction failed: {str(e)}"}), 500


# ---------------------------
# Init
# ---------------------------
if __name__ == '__main__':
    load_model()
    load_companies()
    app.run(host='0.0.0.0', port=5000, debug=True)
