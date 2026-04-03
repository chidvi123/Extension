import React from "react";

export default function StatCards({ totalSolved, activeDays }) {
  return (
    <>
      <div className="card stat-card">
        <div className="stat-lbl">TOTAL<br />QUESTIONS</div>
        <div className="stat-val">{totalSolved}</div>
        <div className="stat-sub">Problems solved</div>
      </div>
      <div className="card stat-card">
        <div className="stat-lbl">TOTAL<br />ACTIVE DAYS</div>
        <div className="stat-val">{activeDays}</div>
        <div className="stat-sub">Days with activity</div>
      </div>
    </>
  );
}