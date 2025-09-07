import React from "react";
import { FaUsers, FaBrain, FaBriefcase, FaBullseye } from "react-icons/fa";

const workFlow = () => {
    return (
        <section className="info-section">
        <h2>How It Works</h2>
        <p>
          Our AI engine analyzes your skills, preferences, and company requirements to find the perfect internship match
        </p>
        <div className="cards-container">
          <div className="card">
            <div className="icon icon-blue">
              <FaUsers size={30} color="#2A6FDE" />
            </div>
            <h3>Register Profile</h3>
            <p>Create your profile with skills, preferences, and upload your resume</p>
          </div>
          <div className="card">
            <div className="icon icon-green">
              <FaBrain size={40} color="#28a745" />
            </div>
            <h3>AI Analysis</h3>
            <p>Our AI analyzes your profile and matches it with available opportunities</p>
          </div>
          <div className="card">
            <div className="icon icon-blue">
              <FaBriefcase size={30} color="#2A6FDE" />
            </div>
            <h3>Smart Matching</h3>
            <p>Get matched with companies that align with your skills and career goals</p>
          </div>
          <div className="card">
            <div className="icon icon-green">
              <FaBullseye size={30} color="#34D399" />
            </div>
            <h3>Get Placed</h3>
            <p>Receive internship offers from top companies in your preferred field</p>
          </div>
        </div>
      </section>

    )
}
export default workFlow;