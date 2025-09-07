import requests
import os
import json

def check_server_health():
    """Check if the server is running and healthy"""
    try:
        response = requests.get("http://127.0.0.1:5000/health", timeout=5)
        if response.status_code == 200:
            data = response.json()
            print("✅ Server Health Check:")
            print(f"   Status: {data.get('status', 'unknown')}")
            print(f"   Model loaded: {data.get('model_loaded', 'unknown')}")
            print(f"   Companies loaded: {data.get('companies_loaded', 'unknown')}")
            print(f"   Feature info loaded: {data.get('feature_info_loaded', 'unknown')}")
            if "model_info" in data:
                mi = data["model_info"]
                print(f"   Model Type: {mi.get('model_type', 'N/A')}")
                print(f"   Features Count: {mi.get('features_count', 'N/A')}")
                if "class_names" in mi:
                    print(f"   Classes: {len(mi.get('class_names', []))}")
                if "f1_weighted" in mi:
                    print(f"   F1-Score: {mi.get('f1_weighted')}")
                    print(f"   Precision: {mi.get('precision_weighted')}")
            return data.get("model_loaded", False)
        else:
            print(f"❌ Health check failed with status: {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to server. Make sure Flask app is running.")
        return False
    except Exception as e:
        print(f"❌ Health check error: {e}")
        return False

def send_pdf(file_path):
    """Send a PDF file to the API and print the enhanced prediction"""
    url = "http://127.0.0.1:5000/upload_and_predict"

    if not os.path.exists(file_path):
        print(f"❌ Error: File not found at '{file_path}'")
        return None

    if os.path.getsize(file_path) == 0:
        print("❌ Error: File is empty")
        return None

    print(f"📤 Sending '{file_path}' to API...")

    try:
        with open(file_path, "rb") as f:
            files = {"resume": (os.path.basename(file_path), f, "application/pdf")}
            response = requests.post(url, files=files, timeout=60)

        print(f"📊 Status Code: {response.status_code}")

        try:
            data = response.json()
        except json.JSONDecodeError:
            print("❌ Invalid JSON response")
            print("Raw Response:", response.text[:500])
            return None

        if response.status_code != 200:
            print("❌ API Error:", data.get("error", "Unknown error"))
            if "details" in data:
                print("Details:", data["details"])
            return None

        # ✅ Success - print enhanced response
        print("\n🎯 Prediction Results")
        print("=" * 60)
        print(f"Predicted Internship: {data.get('predicted_internship', 'N/A')}")
        print(f"Confidence Level: {data.get('confidence_level', 'N/A')}")
        print(f"Prediction Quality: {data.get('prediction_quality', 'N/A')}")

        # Top predictions
        top_preds = data.get("top_predictions", [])
        if top_preds:
            print("\n📊 Top Predictions:")
            for p in top_preds:
                print(f"   - {p['category']}: {p['probability']}%")

        # Extracted features
        features = data.get("extracted_features", {})
        if features:
            print("\n🔍 Extracted Features:")
            print(f"   Word Count: {features.get('word_count')}")
            print(f"   Unique Words: {features.get('unique_words')}")
            print(f"   Skills: {', '.join(features.get('detected_skills', []))}")
            print(f"   Education: {', '.join(features.get('education', []))}")
            print(f"   Years Experience: {features.get('years_experience', 0)}")
            print(f"   Projects Mentioned: {features.get('has_projects', False)}")
            print(f"   Internship Mentioned: {features.get('has_internship_experience', False)}")

            # ✅ Show category keyword hits
            keyword_hits = features.get("category_keyword_hits", {})
            if keyword_hits:
                print("\n🎯 Category Keyword Hits:")
                for category, words in keyword_hits.items():
                    print(f"   {category}: {', '.join(words)}")

        return data

    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        return None

def test_with_sample_files():
    """Test with common file paths"""
    common_paths = [
        "C:\\Users\\Admin\\Downloads\\AI_ML_Resume.pdf",
        "resume.pdf",
        "sample_resume.pdf",
        "test_resume.pdf"
    ]
    for path in common_paths:
        if os.path.exists(path):
            return send_pdf(path)
    print("❌ No sample resumes found.")
    return None

if __name__ == "__main__":
    print("🚀 Resume Internship Predictor - Enhanced Client")
    print("=" * 60)

    print("1. Checking server health...")
    if not check_server_health():
        print("❌ Server not ready. Please start app.py and try again.")
        exit()

    print("\n2. Choose a resume file to test:")
    user_path = input("👉 Enter path to PDF (or press Enter to auto-search): ").strip()

    if user_path:
        send_pdf(user_path)
    else:
        test_with_sample_files()
