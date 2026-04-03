import React from "react";
import { formatTime } from "./helpers";

// Props:
//   weakTopics  Array<{ name: string, avg: number, solved: number }>

export default function WeakTopics({ weakTopics }) {
  return (
    <div className="card weak-inner">
      <h2 className="card-title" >⚠️ Weak Topics</h2>

      {weakTopics.length === 0 ? (
        <p className="empty-msg">No weak topics detected yet. Keep solving!</p>
      ) : (
        <ul className="weak-list">
          {weakTopics.map((t) => (
            <li key={t.name} className="weak-item">
              <div className="weak-name">{t.name}</div>
              <div className="weak-meta">
                Avg: {formatTime(t.avg)} · {t.solved} solved
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}