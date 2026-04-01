import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import "./analytics.css";

import { buildDayArray } from "./helpers";
import StatCards from "./StatCards";
import PieChart from "./PieChart";
import WeakTopics from "./WeakTopics";
import Heatmap from "./Heatmap";

function Analytics() {
  const [dark, setDark] = useState(true);
  const [totalSolved, setTotalSolved] = useState(0);
  const [activeDays, setActiveDays] = useState(0);
  const [platformUsage, setPlatformUsage] = useState({ leetcode: 0, geeksforgeeks: 0 });
  const [diffStats, setDiffStats] = useState({ Easy: 0, Medium: 0, Hard: 0 });
  const [weakTopics, setWeakTopics] = useState([]);
  const [yearData, setYearData] = useState([]);
  const [animated, setAnimated] = useState(false);

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
      const topicStats = {};

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
            if (!topicStats[t]) topicStats[t] = { time: 0, count: 0 };
            topicStats[t].time += r.timeSpent || 0;
            topicStats[t].count += 1;
          });
        }
      });

      const days365 = buildDayArray(sessionData, 365);
      const active = days365.filter((d) => d.time > 0).length;
      const overallAvg = totalSolveTime / (solved || 1);

      // Top 5 weak topics only
      const weak = Object.entries(topicStats)
        .filter(([, s]) => s.time / s.count > overallAvg && s.count <= 3)
        .sort((a, b) => (b[1].time / b[1].count) - (a[1].time / a[1].count))
        .slice(0, 5)
        .map(([name, s]) => ({ name, avg: s.time / s.count, solved: s.count }));

      setTotalSolved(solved);
      setActiveDays(active);
      setPlatformUsage({ leetcode: lcTime, geeksforgeeks: gfgTime });
      setDiffStats(diff);
      setWeakTopics(weak);
      setYearData(days365);
      setTimeout(() => setAnimated(true), 100);
    });
  }, []);

  const totalPlatform = platformUsage.leetcode + platformUsage.geeksforgeeks || 1;
  const lcPct = animated ? `${(platformUsage.leetcode / totalPlatform) * 100}%` : "0%";
  const gfgPct = animated ? `${(platformUsage.geeksforgeeks / totalPlatform) * 100}%` : "0%";

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

        {/* ROW 1 — stat cards (col 1-2) + heatmap (col 3-4) */}
        <div className="stat-pair">
          <StatCards totalSolved={totalSolved} activeDays={activeDays} />
        </div>

        <div className="card heatmap-card">
          {yearData.length > 0
            ? <Heatmap yearData={yearData} />
            : <p className="empty-msg">Loading heatmap…</p>
          }
        </div>

        {/* ROW 2 — platform (col 1-2) + pie (col 3) + weak topics (col 4) */}
        <div className="card platform-card">
          <h2 className="card-title">Platform Usage</h2>

          <div className="platform-row">
            <span className="p-name">LeetCode</span>
            <span className="p-pct">{Math.round((platformUsage.leetcode / totalPlatform) * 100)}%</span>
          </div>
          <div className="bar-track">
            <div className="bar-fill lc" style={{ width: lcPct }} />
          </div>

          <div className="platform-row top-gap">
            <span className="p-name">GeeksforGeeks</span>
            <span className="p-pct">{Math.round((platformUsage.geeksforgeeks / totalPlatform) * 100)}%</span>
          </div>
          <div className="bar-track">
            <div className="bar-fill gfg" style={{ width: gfgPct }} />
          </div>
        </div>

        <div className="card pie-card">
          <h2 className="card-title">Difficulty</h2>
          <PieChart easy={diffStats.Easy} medium={diffStats.Medium} hard={diffStats.Hard} />
        </div>

        <div className="weak-card">
          <WeakTopics weakTopics={weakTopics} />
        </div>

      </div>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<Analytics />);