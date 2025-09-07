import React, { useEffect, useRef, useState } from 'react';
import CountUp from '../components/CountUp';
import { FaUsers, FaBrain, FaBriefcase, FaBullseye } from "react-icons/fa";
import '../styles/Home.css';
import { Link } from 'react-router-dom';
import Header from '../components/ui/header';       // Make sure file name is Header.jsx
import MainSection from '../components/ui/mainSection';
import WorkFlow from '../components/ui/workFlow';
import CtaSection from '../components/ui/ctaSection';
import Impact from '../components/ui/impact';

const Home = () => {
  
  return (
    <div>
      {/* Header */}
      

      {/* Main Section */}
      <MainSection />

      {/* How It Works */}
      <WorkFlow />

      {/* Impact Section */}
      <Impact  />

      {/* CTA Section */}
      <CtaSection />
    </div>
  );
};

export default Home;
