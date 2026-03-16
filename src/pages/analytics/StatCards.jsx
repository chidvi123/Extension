import React from "react";

// Props:
//   totalSolved {number}
//   activeDays  {number}

export default function StatCards({ totalSolved, activeDays }) {
  return (
    <>
      <div className="card stat-card">
        <div className="stat-info-icon">ⓘ</div>
        <div className="stat-lbl">Total Questions</div>
        <div className="stat-val">{totalSolved}</div>
      </div>

      <div className="card stat-card">
        <div className="stat-info-icon">ⓘ</div>
        <div className="stat-lbl">Total Active Days</div>
        <div className="stat-val">{activeDays}</div>
      </div>
    </>
  );
}