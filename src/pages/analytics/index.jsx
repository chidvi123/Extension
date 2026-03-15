import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import "./analytics.css";

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  return `${mins} min`;
}

function Analytics() {

  const [weakTopic, setWeakTopic] = useState(null);
  const [activity, setActivity] = useState([]);

  useEffect(() => {

    chrome.storage.local.get(null, (data) => {

      const sessions = Object.values(data).flat();

      /* =========================
         WEAK TOPIC DETECTION
      ========================= */

      const topicStats = {};

      let totalSolveTime = 0;
      let solvedCount = 0;

      sessions.forEach((record) => {

        if (record.type === "problem" && record.solved) {

          totalSolveTime += record.timeSpent;
          solvedCount++;

          const topics = record.problem?.topics || [];

          topics.forEach((topic) => {

            if (!topicStats[topic]) {
              topicStats[topic] = { time: 0, count: 0 };
            }

            topicStats[topic].time += record.timeSpent;
            topicStats[topic].count++;

          });

        }

      });

      const overallAvg = totalSolveTime / (solvedCount || 1);

      let worstTopic = null;
      let worstScore = 0;

      Object.entries(topicStats).forEach(([topic, stats]) => {

        const avgTime = stats.time / stats.count;

        if (avgTime > overallAvg && stats.count <= 3) {

          if (avgTime > worstScore) {

            worstScore = avgTime;

            worstTopic = {
              name: topic,
              avg: avgTime,
              solved: stats.count
            };

          }

        }

      });

      setWeakTopic(worstTopic);

      /* =========================
         CODING ACTIVITY (30 DAYS)
      ========================= */

      const today = new Date();
      const activityData = [];

      for (let i = 29; i >= 0; i--) {

        const date = new Date(today);
        date.setDate(today.getDate() - i);

        const key = date.toISOString().split("T")[0];

        const daySessions = data[key] || [];

        let totalTime = 0;

        daySessions.forEach((record) => {

          if (record.type === "platform") {
            totalTime += record.duration;
          }

        });

        activityData.push({
          date: key,
          time: totalTime
        });

      }

      setActivity(activityData);

    });

  }, []);

  return (

    <div className="analytics">

      <h1>📊 Coding Analytics</h1>

      {/* Weak Topic Card */}

      <div className="card">

        <h2>Weak Topic</h2>

        {weakTopic ? (

          <div className="weak-topic">

            <p>⚠ <strong>{weakTopic.name}</strong></p>

            <p>Average solve time: {formatTime(weakTopic.avg)}</p>

            <p>Solved problems: {weakTopic.solved}</p>

          </div>

        ) : (

          <p>No weak topics detected yet</p>

        )}

      </div>

      {/* Coding Activity */}

      <div className="card">

        <h2>📈 Coding Activity (Last 30 Days)</h2>

        <div className="activity-chart">

          {activity.map((day, index) => {

            const height = Math.min(day.time / 60, 100);

            return (
              <div
                key={index}
                className="activity-bar"
                style={{ height: `${height}px` }}
                title={`${day.date} : ${Math.floor(day.time / 60)} min`}
              />
            );

          })}

        </div>

      </div>

    </div>

  );

}

/* =========================
   CONNECT REACT TO HTML
========================= */

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<Analytics />);