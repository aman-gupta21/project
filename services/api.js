const API_URL = "http://127.0.0.1:5000";

export async function uploadResume(file) {
  const formData = new FormData();
  formData.append("resume", file);  // ✅ key must be "resume"

  const response = await fetch(`${API_URL}/predict`, {
    method: "POST",
    body: formData,
  });

  return response.json();
}