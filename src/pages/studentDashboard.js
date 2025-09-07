import React, { useState, useEffect } from "react";
import '../styles/StudentDashboard.css';

export default function StudentDashboard() {
  const [profile, setProfile] = useState({ name: "", email: "", avatarUrl: "", resumeName: "" });
  const [avatarFile, setAvatarFile] = useState(null);
  const [students, setStudents] = useState(sampleStudents);
  const [filters, setFilters] = useState({ course: "All", year: "All", placementStatus: "All", search: "" });

  const [aiRecommendations, setAiRecommendations] = useState([]);
  const [loadingRecs, setLoadingRecs] = useState(false);

  function handleAvatarChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setProfile((p) => ({ ...p, avatarUrl: URL.createObjectURL(file) }));
  }

  function handleResumeUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setProfile((p) => ({ ...p, resumeName: file.name }));
  }

  function handleProfileSave() {
    alert("Profile saved (mock). Implement API call to persist.");
  }

  function applyFilters(list) {
    return list
      .filter((s) => (filters.course === "All" ? true : s.course === filters.course))
      .filter((s) => (filters.year === "All" ? true : s.year === filters.year))
      .filter((s) => (filters.placementStatus === "All" ? true : s.status === filters.placementStatus))
      .filter((s) => (filters.search === "" ? true : s.name.toLowerCase().includes(filters.search.toLowerCase())));
  }

  useEffect(() => {
    setLoadingRecs(true);
    const t = setTimeout(() => {
      const topStudent = students[0];
      const recs = mockRecommend(topStudent.skills);
      setAiRecommendations(recs);
      setLoadingRecs(false);
    }, 600);
    return () => clearTimeout(t);
  }, [students]);

  const filteredStudents = applyFilters(students);

  return (
    <div>
    <div className="dashboard">
      <div className="dashboard-container">
        <header className="header">
          <h1>Student Dashboard</h1>
          <a href="http://localhost:3002/" className="comp">CompanyDashboard</a>
          <a href="http://localhost:3003/" className="comp">AdminDashboard</a>
        </header>

        <div className="grid">
          {/* Profile Section */}
          <section className="card">
            <h2>Your Profile</h2>
            <div className="profile-section">
              <div className="profile-avatar">
                {profile.avatarUrl ? (
                  <img src={profile.avatarUrl} alt="avatar" />
                ) : (
                  <span>No avatar</span>
                )}
              </div>
              <div className="profile-inputs">
                <input
                  type="text"
                  placeholder="Name"
                  value={profile.name}
                  onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))}
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={profile.email}
                  onChange={(e) => setProfile((p) => ({ ...p, email: e.target.value }))}
                />
                <div className="file-buttons">
                  <label>
                    Upload Avatar
                    <input type="file" accept="image/*" onChange={handleAvatarChange} hidden />
                  </label>
                  <label>
                    Upload Resume
                    <input type="file" accept=".pdf,.doc,.docx" onChange={handleResumeUpload} hidden />
                  </label>
                </div>
                <p className="small">{profile.resumeName || "No resume uploaded"}</p>
                <button onClick={handleProfileSave} className="btn">Save</button>
              </div>
            </div>

            <div className="status-tracker">
              <h3>Placement Status Tracker</h3>
              <Progress label="Applications Submitted" value={60} />
              <Progress label="Interviews Scheduled" value={30} />
              <Progress label="Offers Received" value={10} />
            </div>
          </section>

          {/* Students Section */}
          <section className="card span-2">
            <div className="students-header">
              <h2>Students</h2>
              <div className="filters">
                <input
                  type="text"
                  placeholder="Search by name"
                  value={filters.search}
                  onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
                />
                <select value={filters.course} onChange={(e) => setFilters((f) => ({ ...f, course: e.target.value }))}>
                  <option>All</option>
                  <option>B.Tech</option>
                  <option>MCA</option>
                  <option>M.Tech</option>
                </select>
                <select value={filters.year} onChange={(e) => setFilters((f) => ({ ...f, year: e.target.value }))}>
                  <option>All</option>
                  <option>1</option>
                  <option>2</option>
                  <option>3</option>
                  <option>4</option>
                </select>
                <select value={filters.placementStatus} onChange={(e) => setFilters((f) => ({ ...f, placementStatus: e.target.value }))}>
                  <option>All</option>
                  <option>Placed</option>
                  <option>Interviewing</option>
                  <option>Searching</option>
                </select>
              </div>
            </div>

            <div className="students-list">
              {filteredStudents.map((s) => (
                <div key={s.id} className="student-card">
                  <div className="student-info">
                    <div className="student-avatar">
                      <img src={s.avatar} alt="stu" />
                    </div>
                    <div>
                      <strong>{s.name}</strong> ({s.course} - Year {s.year})
                      <p>Skills: {s.skills.join(", ")}</p>
                    </div>
                  </div>
                  <div className="student-actions">
                    <p>Status: <b>{s.status}</b></p>
                    <button onClick={() => alert("Open profile modal")}>View</button>
                  </div>
                </div>
              ))}
              {filteredStudents.length === 0 && <p>No students match the selected filters.</p>}
            </div>
          </section>
        </div>

        {/* AI Recommendations */}
        <section className="card">
          <div className="recommend-header">
            <h2>AI Recommendations</h2>
            <p>Personalized opportunities & internships</p>
          </div>

          {loadingRecs ? (
            <p className="loading">Loading recommendations...</p>
          ) : (
            <div className="recommend-grid">
              {aiRecommendations.map((r, idx) => (
                <div key={idx} className="recommend-card">
                  <h3>{r.company}</h3>
                  <p>Role: {r.role}</p>
                  <p>Why: {r.reason}</p>
                  <div className="recommend-actions">
                    <button>Save</button>
                    <button className="btn">Apply</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
    </div>
  );
}

// ---------- Helper Components ----------
function Progress({ label, value }) {
  return (
    <div className="progress">
      <div className="progress-label">
        <span>{label}</span>
        <span>{value}%</span>
      </div>
      <div className="progress-bar">
        <div style={{ width: `${value}%` }} className="progress-fill"></div>
      </div>
    </div>
    
  );
}

// ---------- Mock Data ----------
function mockRecommend(skills = []) {
  const companies = [
    { company: "ByteWave", role: "Frontend Intern", keywords: ["React", "HTML", "CSS"] },
    { company: "DataNest", role: "ML Intern", keywords: ["Python", "ML", "TensorFlow"] },
    { company: "CloudMount", role: "DevOps Intern", keywords: ["Docker", "Kubernetes", "CI/CD"] },
    { company: "Finlytics", role: "Backend Intern", keywords: ["Node", "Express", "Databases"] },
  ];

  const scored = companies.map((c) => {
    const overlap = c.keywords.filter((k) => skills.includes(k)).length;
    return { ...c, score: overlap };
  });

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((c) => ({ company: c.company, role: c.role, reason: `Matches skills: ${c.keywords.join(", ")}` }));
}

const sampleStudents = [
  { id: 1, name: "Amit Sharma", avatar: "https://avatars.dicebear.com/api/initials/amit-sharma.svg", course: "B.Tech", year: 4, skills: ["React", "Node", "Databases"], status: "Interviewing" },
  { id: 2, name: "Priya Singh", avatar: "https://avatars.dicebear.com/api/initials/priya-singh.svg", course: "MCA", year: 2, skills: ["Python", "ML", "Pandas"], status: "Searching" },
  { id: 3, name: "Rahul Verma", avatar: "https://avatars.dicebear.com/api/initials/rahul-verma.svg", course: "B.Tech", year: 3, skills: ["Docker", "Kubernetes", "CI/CD"], status: "Placed" },
];
