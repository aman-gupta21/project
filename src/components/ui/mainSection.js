import React from 'react';

const MainSection = () => {
    return (
        <section className="main-section">
            <h2 className="main-title">
                <span className="highlight-blue">AI-Based Smart </span>
                <span className="highlight-green">Allocation Engine</span>
            </h2>
            <p className="subtitle">
                Revolutionizing PM Internship placements through intelligent matching
            </p>
            <div>
                <a href="/register">
                    <button className="button primary-btn">
                        Get Started <span className="arrow">→</span>
                    </button>
                </a>
                <a href="/login">
                    <button className="button secondary-btn">Login</button>
                </a>
            </div>
        </section>
    );
};

export default MainSection;
