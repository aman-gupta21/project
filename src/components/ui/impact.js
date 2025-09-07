import CountUp from '../CountUp';
import React, { useEffect, useRef, useState } from 'react';
import { FaUsers, FaBrain, FaBriefcase, FaBullseye } from "react-icons/fa";


const Impact = () => {
    const impactRef = useRef(null);
  const [impactVisible, setImpactVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setImpactVisible(true);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.3 }
    );
    if (impactRef.current) observer.observe(impactRef.current);
  }, []);

    return (
        <section 
  className={`impact-section ${impactVisible ? 'visible' : ''}`} 
  ref={impactRef}
>
  <h2>Our Impact</h2>
  <p>Transforming careers through intelligent placement</p>
  <div className="impact-stats">
    <div className="stat">
      <h3><CountUp end={1000} />+</h3>
      <p>Students Placed</p>
    </div>
    <div className="stat">
      <h3><CountUp end={95} />+</h3>
      <p>Success Rate</p>
    </div>
    <div className="stat">
      <h3><CountUp end={500} />+</h3>
      <p>Partner Companies</p>
    </div>
  </div>
</section>
    )
}
export default Impact;