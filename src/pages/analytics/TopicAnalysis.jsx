import React, { useState } from "react";

// Props:
//   topicStats  Object<string, { time: number, count: number }>

export default function TopicChart({ topicStats }) {
  const [showAll, setShowAll] = useState(false);

  const sorted = Object.entries(topicStats)
    .map(([name, s]) => ({ name, count: s.count }))
    .sort((a, b) => b.count - a.count);

  const max = sorted[0]?.count || 1;
  const displayed = showAll ? sorted : sorted.slice(0, 12);

  // Color gradient: brightest for top, dimmer as it goes down
  const barColors = [
    "#3b82f6", // blue
    "#10b981", // green
    "#f59e0b", // yellow
    "#ef4444", // red
    "#8b5cf6"  // purple
  ];
  return (
    <div className="card topic-card">
      <h2 className="card-title">DSA Topic Analysis</h2>

      {sorted.length === 0 ? (
        <p className="empty-msg">No topic data yet. Keep solving!</p>
      ) : (
        <>
          <div className="topic-list">
            {displayed.map((t, i) => (
              <div key={t.name} className="topic-row">
                <span className="topic-name">{t.name}</span>
                <div className="topic-bar-track">
                  <div
                    className="topic-bar-fill"
                    style={{
                      width: `${(t.count / max) * 100}%`,
                      background: barColors[Math.min(i, barColors.length - 1)],
                    }}
                  >
                    <span className="topic-bar-val">{t.count}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {sorted.length > 12 && (
            <button className="show-more-btn" onClick={() => setShowAll(!showAll)}>
              {showAll ? "show less" : "show more"}
            </button>
          )}
        </>
      )}
    </div>
  );
}