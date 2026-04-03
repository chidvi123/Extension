import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import "./analytics.css";

import { buildDayArray } from "./helpers";
import StatCards from "./StatCards";
import PieChart from "./PieChart";
import WeakTopics from "./WeakTopics";
import Heatmap from "./Heatmap";
import TopicChart from "./TopicAnalysis";

function Analytics() {
  const [dark, setDark] = useState(true);
  const [totalSolved, setTotalSolved] = useState(0);
  const [activeDays, setActiveDays] = useState(0);
  const [platformUsage, setPlatformUsage] = useState({ leetcode: 0, geeksforgeeks: 0 });
  const [diffStats, setDiffStats] = useState({ Easy: 0, Medium: 0, Hard: 0 });
  const [weakTopics, setWeakTopics] = useState([]);
  const [topicStats, setTopicStats] = useState({});
  const [yearData, setYearData] = useState([]);

  useEffect(() => {
    chrome.storage.local.get("theme", (res) => {
      if (res.theme === "light") setDark(false);
    });
  }, []);

  function toggleTheme() {
    const next = !dark;
    setDark(next);
    chrome.storage.local.set({ theme: next ? "dark" : "light" });
  }

  useEffect(() => {
    chrome.storage.local.get(null, (data) => {
      const { theme, __tracking__, __problem__, ...sessionData } = data;
      const allSessions = Object.values(sessionData).flat();

      let solved = 0;
      let lcTime = 0;
      let gfgTime = 0;
      let totalSolveTime = 0;
      const diff = { Easy: 0, Medium: 0, Hard: 0 };
      const topics = {};

      allSessions.forEach((r) => {
        if (r.type === "platform") {
          if (r.platform === "leetcode") lcTime += r.duration;
          if (r.platform === "geeksforgeeks") gfgTime += r.duration;
        }
        if (r.type === "problem" && r.solved) {
          solved++;
          totalSolveTime += r.timeSpent || 0;
          if (r.problem?.difficulty in diff) diff[r.problem.difficulty]++;
          (r.problem?.topics || []).forEach((t) => {
            if (!topics[t]) topics[t] = { time: 0, count: 0 };
            topics[t].time += r.timeSpent || 0;
            topics[t].count += 1;
          });
        }
      });

      const days365 = buildDayArray(sessionData, 365);
      const active = days365.filter((d) => d.time > 0).length;
      const overallAvg = totalSolveTime / (solved || 1);

      const weak = Object.entries(topics)
        .filter(([, s]) => s.time / s.count > overallAvg && s.count <= 3)
        .sort((a, b) => (b[1].time / b[1].count) - (a[1].time / a[1].count))
        .slice(0, 10)
        .map(([name, s]) => ({ name, avg: s.time / s.count, solved: s.count }));

      setTotalSolved(solved);
      setActiveDays(active);
      setPlatformUsage({ leetcode: lcTime, geeksforgeeks: gfgTime });
      setDiffStats(diff);
      setWeakTopics(weak);
      setTopicStats(topics);
      setYearData(days365);
    });
  }, []);

  return (
    <div className={`analytics ${dark ? "dark" : "light"}`}>

      {/* ── HEADER ── */}
      <div className="page-header">
        <div className="page-title">
          <span className="title-icon">⬡</span>
          Coding Analytics
        </div>
        <button className="theme-toggle" onClick={toggleTheme}>
          {dark ? "☀️ Light Mode" : "🌙 Dark Mode"}
        </button>
      </div>

      {/* ── MAIN GRID ── */}
      <div className="dashboard-grid">

        {/* ── ROW 1: stat-pair (col 1) + heatmap (col 2-3) ── */}
        <div className="stat-pair">
          <StatCards totalSolved={totalSolved} activeDays={activeDays} />
        </div>

        <div className="card heatmap-card">
          {yearData.length > 0
            ? <Heatmap yearData={yearData} />
            : <p className="empty-msg">Loading heatmap…</p>
          }
        </div>

        {/* ── ROW 2: left-col (platform + difficulty stacked) | topic | weak ── */}
        <div className="left-col">
          <div className="card platform-card">
            <h2 className="card-title">Platform Usage</h2>
            <PieChart
              data={[
                { label: "LeetCode", value: platformUsage.leetcode, color: "#f89f1b" },
                { label: "GeeksforGeeks", value: platformUsage.geeksforgeeks, color: "#10b981" },
              ]}
            />
          </div>
          <div className="card diff-card">
            <h2 className="card-title">Difficulty</h2>
            <PieChart
              data={[
                { label: "Easy", value: diffStats.Easy, color: "#10b981" },
                { label: "Medium", value: diffStats.Medium, color: "#f59e0b" },
                { label: "Hard", value: diffStats.Hard, color: "#ef4444" },
              ]}
              showTotal
            />
          </div>
        </div>

        <div className="topic-col">
          <TopicChart topicStats={topicStats} />
        </div>

        <div className="weak-col">
          <WeakTopics weakTopics={weakTopics} />
        </div>

      </div>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<Analytics />);