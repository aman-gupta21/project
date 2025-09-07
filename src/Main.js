import React, { useState } from "react";
import { uploadResume } from "./services/api";  // API function

function App() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);

  // Store selected file in state
  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (!selectedFile) return;
    setFile(selectedFile);
    setResult(null); // reset old result
  };

  // Send file when clicking Predict
  const handlePredict = async () => {
    if (!file) {
      alert("Please select a resume file first!");
      return;
    }

    try {
      const data = await uploadResume(file);
      console.log("📌 Backend Response:", data);
      setResult(data);
    } catch (error) {
      console.error("❌ Error uploading file:", error);
      alert("Failed to predict. Check backend.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-xl bg-white shadow-lg rounded-2xl p-6">
        <h1 className="text-2xl font-bold text-center text-blue-600 mb-6">
          🎯 Resume Prediction
        </h1>

        <div className="flex flex-col items-center space-y-4">
          <input
            type="file"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-700 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />

          <button
            onClick={handlePredict}
            className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow hover:bg-blue-700 transition"
          >
            Predict
          </button>
        </div>

        {result && (
          <div className="mt-8 bg-gray-50 border border-gray-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Predicted Internship:{" "}
              <span className="text-blue-600">{result.predicted_internship}</span>
            </h3>
            <p className="text-gray-700 mb-4">
              Confidence:{" "}
              <span className="font-semibold text-green-600">
                {result.confidence}%
              </span>
            </p>

            <h4 className="text-md font-semibold text-gray-700 mb-2">
              📊 Extracted Features:
            </h4>
            <ul className="list-disc list-inside text-gray-600 space-y-1">
              <li>Word Count: {result.features.word_count}</li>
              <li>Unique Words: {result.features.unique_words}</li>
              <li>
                Skills Detected:{" "}
                {result.features.detected_skills.length > 0 ? (
                  <span className="text-purple-600 font-medium">
                    {result.features.detected_skills.join(", ")}
                  </span>
                ) : (
                  "None"
                )}
              </li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
