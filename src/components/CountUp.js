import React, { useEffect, useState } from 'react';

const CountUp = ({ end, duration = 3000 }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const increment = end / (duration / 50); // update every 50ms
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.ceil(start));
      }
    }, 50);

    return () => clearInterval(timer);
  }, [end, duration]);

  return <>{count}</>;
};

export default CountUp;
