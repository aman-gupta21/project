import React from 'react';
import { FaBrain } from "react-icons/fa";
import '../../styles/Home.css';
import { Link } from 'react-router-dom';

const Header = () => {
    return (
        <header className="header">
            <div className="logo-section">
                <FaBrain  className='logo' size={30} color="#2A6FDE" />
                <h1 className="logo-text">InternLink</h1>
            </div>
           <nav>
                <Link to="/" className="nav-link home-link">Home</Link>
                <Link to="/register" className="nav-link">Register</Link>
                <Link to="/Login" className="nav-link">Login</Link>
            </nav>
        </header>
    );
};

export default Header;
