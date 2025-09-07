import React, { useState } from "react";
import { FaBrain } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

import "../styles/Login.css";

const demoCredentials = {
    email: "demo@student.com",
    password: "demo123",
};

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loginMessage, setLoginMessage] = useState("");
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();

        const isValid = await mockLogin(email, password);

        if (isValid) {
            setLoginMessage("Login successful! Redirecting to dashboard...");
            // Redirect to dashboard after a short delay
            setTimeout(() => {
                navigate("/studentDashboard");
            }, 1000);
        } else {
            setLoginMessage("Invalid email or password.");
        }
    };

    const mockLogin = (email, password) => {
        return new Promise((resolve) => {
            setTimeout(() => {
                if (
                    email === demoCredentials.email &&
                    password === demoCredentials.password
                ) {
                    resolve(true);
                } else {
                    resolve(false);
                }
            }, 500);
        });
    };

    const fillDemoCredentials = () => {
        setEmail(demoCredentials.email);
        setPassword(demoCredentials.password);
        setLoginMessage("");
    };

    return (
        <div className="login-container">
            <div className="logo-section">
                <FaBrain size={30} color="#2A6FDE" />
                <h1 className="logo-text">InternLink</h1>
            </div>

            <h2 className="welcome-text">Welcome Back</h2>
            <p className="sub-text">Login to access your internship dashboard</p>

            <form className="login-form" onSubmit={handleLogin}>
                <label htmlFor="email">Email</label>
                <input
                    id="email"
                    type="email"
                    value={email}
                    placeholder="Enter your email"
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />

                <label htmlFor="password">Password</label>
                <input
                    id="password"
                    type="password"
                    value={password}
                    placeholder="Enter your password"
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />

                <button type="submit" className="login-btn">
                    Login
                </button>
            </form>

            {loginMessage && <p className="login-message">{loginMessage}</p>}

            <p className="register-text">
                Don't have an account?{" "}
                <a href="/register" className="register-link">
                    Register here
                </a>
            </p>
        </div>
    );
};

export default Login;
