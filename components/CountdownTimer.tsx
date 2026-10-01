'use client';

import React, { useState, useEffect } from 'react';

export default function CountdownTimer() {
  const [timeLeft, setTimeLeft] = useState({
    hours: 12,
    minutes: 34,
    seconds: 56,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return { hours: 12, minutes: 0, seconds: 0 };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatNumber = (num: number) => num.toString().padStart(2, '0');

  return (
    <div className="flex items-center gap-1.5 sm:gap-2">
      <span className="text-xs sm:text-sm font-medium text-valuecart-text-muted mr-1">
        Ends in
      </span>

      {/* Hours */}
      <div className="flex items-center gap-1 bg-[#EEF2F6] px-2 py-1 rounded-md text-valuecart-navy font-bold text-xs sm:text-sm">
        <span>{formatNumber(timeLeft.hours)}</span>
        <span className="text-[10px] font-normal text-valuecart-text-muted">Hrs</span>
      </div>

      <span className="text-valuecart-text-muted font-bold text-xs">:</span>

      {/* Minutes */}
      <div className="flex items-center gap-1 bg-[#EEF2F6] px-2 py-1 rounded-md text-valuecart-navy font-bold text-xs sm:text-sm">
        <span>{formatNumber(timeLeft.minutes)}</span>
        <span className="text-[10px] font-normal text-valuecart-text-muted">Mins</span>
      </div>

      <span className="text-valuecart-text-muted font-bold text-xs">:</span>

      {/* Seconds */}
      <div className="flex items-center gap-1 bg-[#EEF2F6] px-2 py-1 rounded-md text-valuecart-navy font-bold text-xs sm:text-sm">
        <span>{formatNumber(timeLeft.seconds)}</span>
        <span className="text-[10px] font-normal text-valuecart-text-muted">Secs</span>
      </div>
    </div>
  );
}
