import pandas as pd
import numpy as np
import re
import pickle
from collections import Counter
from sklearn.model_selection import train_test_split, StratifiedKFold, cross_val_score, RandomizedSearchCV
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.ensemble import VotingClassifier, RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.svm import SVC
from sklearn.metrics import classification_report, precision_recall_fscore_support
from scipy.stats import uniform, randint
import warnings
warnings.filterwarnings('ignore')

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
# Feature Engineering with Keyword Boosting
# ---------------------------
def extract_features(text):
    features = {}
    words = text.split()

    # Basic counts
    features['word_count'] = len(words)
    features['unique_words'] = len(set(words))

    # Original skills
    original_skills = [
        'python', 'java', 'c++', 'sql', 'machine learning', 'deep learning',
        'nlp', 'html', 'css', 'javascript', 'react', 'django', 'flask'
    ]
    for skill in original_skills:
        features[f"skill_{skill}"] = 1 if skill in text else 0

    # Education
    features['has_btech'] = 1 if re.search(r'\bb\.?tech\b', text) else 0
    features['has_mtech'] = 1 if re.search(r'\bm\.?tech\b', text) else 0
    features['has_phd'] = 1 if re.search(r'\bph\.?d\b', text) else 0
    features['has_mba'] = 1 if 'mba' in text else 0
    features['has_bsc'] = 1 if re.search(r'\bb\.?sc\b', text) else 0
    features['has_msc'] = 1 if re.search(r'\bm\.?sc\b', text) else 0

    # Experience
    exp_patterns = [
        r'(\d+)\s*(?:years?|yrs?)\s*(?:experience|exp)',
        r'(\d+)\s*(?:\+|plus)\s*(?:years?|yrs?)'
    ]
    years = []
    for p in exp_patterns:
        years.extend(re.findall(p, text))
    features['years_experience'] = max([int(y) for y in years]) if years else 0

    # Project / internship
    features['project_mentioned'] = int(any(k in text for k in ['project', 'developed', 'built']))
    features['internship_mentioned'] = int(any(k in text for k in ['internship', 'intern', 'trainee']))

    # Category-specific keywords (with boosting)
    category_keywords = {
        "Data Science": ['tensorflow', 'pytorch', 'pandas', 'numpy', 'scikit-learn', 'matplotlib', 'seaborn'],
        "Web Development": ['nodejs', 'angular', 'vue', 'bootstrap', 'express', 'typescript'],
        "DevOps Engineer": ['docker', 'kubernetes', 'jenkins', 'terraform', 'ansible', 'aws', 'azure', 'gcp'],
        "Automation Testing": ['selenium', 'pytest', 'junit', 'testng', 'cypress'],
        "Blockchain": ['blockchain', 'ethereum', 'solidity', 'smart contract', 'web3'],
        "Mobile App Development": ['android', 'ios', 'flutter', 'react native', 'swift', 'kotlin'],
        "Java Developer": ['spring boot', 'hibernate', 'jsp', 'servlets']
    }

    for category, keywords in category_keywords.items():
        count = sum(1 for kw in keywords if kw in text)
        # 🚀 Boost weight ×5
        features[f"{category.lower().replace(' ', '_')}_keywords"] = count * 5

    return features

# ---------------------------
# Class Balancing
# ---------------------------
def balance_classes(X, y):
    class_counts = Counter(y)
    max_count = max(class_counts.values())
    X_bal, y_bal = [], []

    for cls, cnt in class_counts.items():
        idxs = [i for i, lbl in enumerate(y) if lbl == cls]
        extra = np.random.choice(idxs, size=max_count - cnt, replace=True)
        all_idx = idxs + list(extra)
        X_bal.extend(X.iloc[all_idx].to_dict(orient="records"))
        y_bal.extend([cls] * len(all_idx))

    return pd.DataFrame(X_bal), pd.Series(y_bal)

# ---------------------------
# Load Data
# ---------------------------
def load_data():
    df = pd.read_csv("UpdatedResumeDataSet.csv")
    df.rename(columns={'Resume': 'resume_text', 'Category': 'internship_type'}, inplace=True)
    df['resume_text'] = df['resume_text'].apply(clean_text)
    return df

# ---------------------------
# Pipeline
# ---------------------------
def create_pipeline():
    preprocessor = ColumnTransformer(
        transformers=[
            ('text', TfidfVectorizer(max_features=5000, stop_words='english', ngram_range=(1, 2)), 'resume_text'),
            ('cat', OneHotEncoder(handle_unknown='ignore', sparse_output=False), ['academic_background']),
            ('num', StandardScaler(), ['word_count','unique_words','years_experience']),
            ('skills', 'passthrough', [c for c in feature_cols if c.startswith('skill_') or c.endswith('_mentioned') or c.endswith('_keywords')])
        ]
    )
    rf = RandomForestClassifier(n_estimators=100, class_weight='balanced', random_state=42)
    lr = LogisticRegression(max_iter=1000, class_weight='balanced')
    svm = SVC(probability=True, class_weight='balanced')

    ensemble = VotingClassifier(estimators=[('rf', rf), ('lr', lr), ('svm', svm)], voting='soft', weights=[3,2,1])
    return Pipeline([('preprocessor', preprocessor), ('classifier', ensemble)])

# ---------------------------
# Train Model
# ---------------------------
if __name__ == "__main__":
    print("🚀 Training started...")
    df = load_data()

    # Extract features
    feat_list = [extract_features(t) for t in df['resume_text']]
    feat_df = pd.DataFrame(feat_list)
    df = pd.concat([df, feat_df], axis=1)
    df['academic_background'] = 'Computer Science'

    # Prepare
    X = df.drop(columns=['internship_type'])
    y = df['internship_type']
    global feature_cols
    feature_cols = list(X.columns)

    # Balance
    X_bal, y_bal = balance_classes(X, y)
    print(f"✅ Classes balanced: {Counter(y_bal)}")

    # Train/test split
    X_train, X_test, y_train, y_test = train_test_split(X_bal, y_bal, test_size=0.2, stratify=y_bal, random_state=42)

    # Pipeline
    pipeline = create_pipeline()
    pipeline.fit(X_train, y_train)

    # Eval
    y_pred = pipeline.predict(X_test)
    print("📋 Report:\n", classification_report(y_test, y_pred))

    # Save
    model_data = {
        'model': pipeline,
        'feature_columns': feature_cols,
        'class_names': sorted(y.unique()),
        'model_type': 'enhanced_ensemble'
    }
    with open("advanced_model.pkl", "wb") as f:
        pickle.dump(model_data, f)
    with open("model.pkl", "wb") as f:
        pickle.dump(pipeline, f)
    with open("feature_info.pkl", "wb") as f:
        pickle.dump({"all_columns": feature_cols}, f)

    print("💾 Models saved: advanced_model.pkl, model.pkl, feature_info.pkl")
