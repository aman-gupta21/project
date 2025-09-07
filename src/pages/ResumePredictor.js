import React, { useState } from "react";

const internshipCompanies = {
  "Web Development": ["Google", "Netflix", "Amazon", "Microsoft"],
  "Blockchain": ["Consensys", "Coinbase", "Binance", "Ethereum Foundation"],
  "HR": ["LinkedIn", "Microsoft", "Google", "Adobe"],
  "Data Science": ["Facebook", "Amazon", "Netflix", "Uber"],
  "Machine Learning": ["Google", "OpenAI", "NVIDIA", "Microsoft"],
  "Software Engineer": ["Amazon", "Apple", "Google", "Microsoft"]
  // Add more as needed
};

function ResumePredictor() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      alert("Please upload a resume (PDF)");
      return;
    }

    const formData = new FormData();
    formData.append("resume", file);

    setLoading(true);
    setResult(null);

    try {
      const response = await fetch("http://127.0.0.1:5000/predict", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      // Add company recommendations
      const recommendedCompanies =
        internshipCompanies[data.predicted_internship] || ["No recommendation"];

      setResult({ ...data, recommendedCompanies });
    } catch (error) {
      console.error("Error:", error);
      alert("Error connecting to API");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "30px", fontFamily: "Arial" }}>
      <h2>📄 Internship Predictor</h2>

      <form onSubmit={handleSubmit} style={{ marginBottom: "20px" }}>
        <input
          type="file"
          accept=".pdf"
          onChange={(e) => setFile(e.target.files[0])}
        />
        <button type="submit" style={{ marginLeft: "10px" }}>
          Predict
        </button>
      </form>

      {loading && <p>⏳ Analyzing resume...</p>}

      {result && (
        <div style={{ marginTop: "20px" }}>
          <h3>Prediction Result</h3>
          <p>
            🎯 Internship: <b>{result.predicted_internship}</b>
          </p>
          <p>
            📊 Confidence: <b>{result.confidence}%</b>
          </p>
          <p>
            🛠 Skills Detected:{" "}
            {result.features.detected_skills.length > 0
              ? result.features.detected_skills.join(", ")
              : "None"}
          </p>
          <p>
            🏢 Recommended Companies:{" "}
            {result.recommendedCompanies.join(", ")}
          </p>
        </div>
      )}
    </div>
  );
}

export default ResumePredictor;