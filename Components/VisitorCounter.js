import React, { useState, useEffect } from 'react';
import { Users } from 'lucide-react';

const VisitorCounter = ({ baseCount = 0, startDate }) => {
  const [visitorCount, setVisitorCount] = useState(baseCount || 0);

  useEffect(() => {
    if (!startDate) {
      setVisitorCount(baseCount || 0);
      return;
    }

    // Calculate the number of visitors to add per second.
    // Let's aim for a modest but steady growth. e.g. 1 new visitor every 7 seconds.
    const growthRatePerSecond = 1 / 7;

    const calculateCurrentCount = () => {
      const start = new Date(startDate).getTime();
      const now = new Date().getTime();
      const secondsPassed = Math.max(0, (now - start) / 1000);
      const growth = Math.floor(secondsPassed * growthRatePerSecond);
      return (baseCount || 0) + growth;
    };

    setVisitorCount(calculateCurrentCount());

    const interval = setInterval(() => {
      setVisitorCount(calculateCurrentCount());
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, [baseCount, startDate]);

  return (
    <div className="flex justify-center items-center py-4">
      <div className="bg-slate-900 text-white rounded-full px-6 py-3 flex items-center gap-3 shadow-lg">
        <Users className="w-5 h-5 text-emerald-400" />
        <span className="font-semibold text-slate-300">Total Visitors:</span>
        <span className="font-bold text-lg text-emerald-400 tracking-wider">
          {(visitorCount || 0).toLocaleString('en-US')}
        </span>
      </div>
    </div>
  );
};