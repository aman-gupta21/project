import React, { useState, useEffect } from "react";
import '../styles/CompanyDashboard.css';

export default function CompanyDashboard() {
  const [internship, setInternship] = useState({ title: "", description: "", requiredSkills: "" });
  const [internships, setInternships] = useState([]);
  const [students, setStudents] = useState(sampleStudents);
  const [rankedStudents, setRankedStudents] = useState([]);

  // Post new internship
  function handleInternshipPost(e) {
    e.preventDefault();
    const newInternship = {
      id: Date.now(),
      title: internship.title,
      description: internship.description,
      requiredSkills: internship.requiredSkills.split(",").map((s) => s.trim()),
    };
    setInternships([newInternship, ...internships]);
    setInternship({ title: "", description: "", requiredSkills: "" });
    alert("Internship posted!");
  }

  // Rank students by matching skills
  useEffect(() => {
    if (internships.length === 0) return;
    const latest = internships[0];
    const ranked = students.map((s) => {
      const overlap = s.skills.filter((skill) => latest.requiredSkills.includes(skill)).length;
      return { ...s, matchScore: overlap };
    }).sort((a, b) => b.matchScore - a.matchScore);
    setRankedStudents(ranked);
  }, [internships, students]);

  function handleShortlist(student) {
    alert(`Shortlisted ${student.name} for internship!`);
  }

  return (
    <div className="company-dashboard">
      <div className="container">
        <header>
          <h1>Company Dashboard</h1>
          <p>Post internships and shortlist students easily</p>
        </header>

        {/* Internship Post Form */}
        <section className="card">
          <h2>Post New Internship</h2>
          <form onSubmit={handleInternshipPost}>
            <input
              type="text"
              placeholder="Title"
              value={internship.title}
              onChange={(e) => setInternship({ ...internship, title: e.target.value })}
              required
            />
            <textarea
              placeholder="Description"
              value={internship.description}
              onChange={(e) => setInternship({ ...internship, description: e.target.value })}
              required
            />
            <input
              type="text"
              placeholder="Required Skills (comma separated)"
              value={internship.requiredSkills}
              onChange={(e) => setInternship({ ...internship, requiredSkills: e.target.value })}
              required
            />
            <button type="submit" className="btn">Post Internship</button>
          </form>
        </section>

        {/* Internship List */}
        <section className="card">
          <h2>Internships</h2>
          {internships.length === 0 ? (
            <p>No internships posted yet.</p>
          ) : (
            internships.map((intern) => (
              <div key={intern.id} className="internship-card">
                <h3>{intern.title}</h3>
                <p>{intern.description}</p>
                <p><strong>Skills:</strong> {intern.requiredSkills.join(", ")}</p>
              </div>
            ))
          )}
        </section>

        {/* Ranked Students */}
        <section className="card">
          <h2>AI-Ranked Students</h2>
          {internships.length === 0 ? (
            <p>Post an internship to see ranked students.</p>
          ) : (
            rankedStudents.map((student) => (
              <div key={student.id} className="student-card">
                <div>
                  <strong>{student.name}</strong> ({student.course} - Year {student.year})
                  <p>Skills: {student.skills.join(", ")}</p>
                  <p>Match Score: {student.matchScore}</p>
                </div>
                <button onClick={() => handleShortlist(student)} className="btn">Shortlist</button>
              </div>
            ))
          )}
        </section>
      </div>
    </div>
  );
}

// Sample students data
const sampleStudents = [
  { id: 1, name: "Amit Sharma", course: "B.Tech", year: 4, skills: ["React", "Node", "Databases"] },
  { id: 2, name: "Priya Singh", course: "MCA", year: 2, skills: ["Python", "ML", "Pandas"] },
  { id: 3, name: "Rahul Verma", course: "B.Tech", year: 3, skills: ["Docker", "Kubernetes", "CI/CD"] },
];
