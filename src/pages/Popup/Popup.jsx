import React, { useEffect, useState, useRef } from "react";
import "./Popup.css";

// Convert seconds → "2h 30m" or "45m 10s"
function formatTime(sec) {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m ${s}s`;
}

// Empty stats shape — used on first load and after reset
const EMPTY = {
  totalCodingTime: 0,
  platformTime:    { leetcode: 0, geeksforgeeks: 0 },
  problemPlatform: { leetcode: 0, geeksforgeeks: 0 },
  totalProblems:   0,
  difficulty:      { Easy: 0, Medium: 0, Hard: 0 },
  topics:          {},
};

export default function Popup() {
  const [stats,    setStats]    = useState(EMPTY);
  const [animated, setAnimated] = useState(false);
  const [dark,     setDark]     = useState(true);
  const hasAnimated = useRef(false);

  // ── Load saved theme preference ──────────────────────────
  useEffect(() => {
    chrome.storage.local.get("theme", (res) => {
      if (res.theme === "light") setDark(false);
    });
  }, []);

  // ── Load today's data from chrome storage ────────────────
  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];

    chrome.storage.local.get(today, (result) => {
      const sessions = result[today] || [];
      const s = structuredClone(EMPTY); // fresh copy so we don't mutate EMPTY

      sessions.forEach((record) => {

        // Count time spent on each platform
        if (record.type === "platform") {
          s.totalCodingTime += record.duration;
          if (record.platform === "leetcode")      s.platformTime.leetcode      += record.duration;
          if (record.platform === "geeksforgeeks") s.platformTime.geeksforgeeks += record.duration;
        }

        // Count solved problems
        if (record.type === "problem" && record.solved) {
          s.totalProblems++;
          if (record.platform === "leetcode")      s.problemPlatform.leetcode++;
          if (record.platform === "geeksforgeeks") s.problemPlatform.geeksforgeeks++;

          // Difficulty tally
          const diff = record.problem?.difficulty;
          if (diff in s.difficulty) s.difficulty[diff]++;

          // Topic tally
          (record.problem?.topics || []).forEach((t) => {
            s.topics[t] = (s.topics[t] || 0) + 1;
          });
        }
      });

      setStats(s);

      // Trigger bar animations once after data loads
      if (!hasAnimated.current) {
        hasAnimated.current = true;
        setTimeout(() => setAnimated(true), 100);
      }
    });
  }, []);

  // ── Helpers ───────────────────────────────────────────────
  function toggleTheme() {
    const next = !dark;
    setDark(next);
    chrome.storage.local.set({ theme: next ? "dark" : "light" });
  }

  function resetData() {
    chrome.storage.local.clear(() => {
      setStats(EMPTY);
      setAnimated(false);
      setTimeout(() => setAnimated(true), 100);
    });
  }

  // Derived values used in the UI
  const totalPlatform = stats.platformTime.leetcode + stats.platformTime.geeksforgeeks || 1;
  const maxDiff       = Math.max(...Object.values(stats.difficulty), 1);
  const topicList     = Object.entries(stats.topics).sort((a, b) => b[1] - a[1]);
  const dateStr       = new Date().toLocaleDateString("en-US", {
    weekday: "long", month: "short", day: "numeric",
  });

  // Bar width % for platform bars
  const lcPct  = animated ? `${(stats.platformTime.leetcode      / totalPlatform) * 100}%` : "0%";
  const gfgPct = animated ? `${(stats.platformTime.geeksforgeeks / totalPlatform) * 100}%` : "0%";

  // Bar height % for difficulty chart
  function diffPct(key) {
    return animated ? `${(stats.difficulty[key] / maxDiff) * 100}%` : "0%";
  }

  // ── Render ────────────────────────────────────────────────
  return (
    <div className={`popup ${dark ? "dark" : "light"}`}>

      {/* HEADER */}
      <div className="header">
        <div className="header-left">
          <div>
            <h1 className="title">Coding Tracker</h1>
            <p className="subtitle">Track your daily coding productivity</p>
          </div>
        </div>
        <div className="header-right">
          <div className="streak"><span>🔥</span><span className="streak-num">3d</span></div>
          <button className="theme-btn" onClick={toggleTheme}>{dark ? "☀️" : "🌙"}</button>
        </div>
      </div>
      <p className="date">{dateStr}</p>

      {/* CODING TIME */}
      <div className="card">
        <h2 className="card-title">🕐 Coding Time</h2>

        <div className="big-time">
          <div className="big-time-val">{formatTime(stats.totalCodingTime)}</div>
          <div className="big-time-lbl">Total coding time today</div>
        </div>

        <div className="platform-row">
          <span className="dot orange" /> LeetCode
          <span className="time-right">{formatTime(stats.platformTime.leetcode)}</span>
        </div>
        <div className="bar-track"><div className="bar-fill orange" style={{ width: lcPct }} /></div>

        <div className="platform-row top-gap">
          <span className="dot green" /> GeeksforGeeks
          <span className="time-right">{formatTime(stats.platformTime.geeksforgeeks)}</span>
        </div>
        <div className="bar-track"><div className="bar-fill green" style={{ width: gfgPct }} /></div>
      </div>

      {/* PROBLEMS SOLVED */}
      <div className="card">
        <h2 className="card-title">📖 Problems Solved</h2>
        <div className="prob-grid">
          <div className="prob-box blue">
            <div className="prob-num">{stats.totalProblems}</div>
            <div className="prob-lbl">Total</div>
          </div>
          <div className="prob-box orange">
            <div className="prob-num">{stats.problemPlatform.leetcode}</div>
            <div className="prob-lbl">LeetCode</div>
          </div>
          <div className="prob-box green">
            <div className="prob-num">{stats.problemPlatform.geeksforgeeks}</div>
            <div className="prob-lbl">GFG</div>
          </div>
        </div>
      </div>

      {/* DIFFICULTY DISTRIBUTION */}
      <div className="card">
        <h2 className="card-title">📈 Difficulty Distribution</h2>
        <div className="chart">
          {/* Y-axis */}
          <div className="y-axis">
            {[maxDiff, Math.ceil(maxDiff * 0.75), Math.ceil(maxDiff * 0.5), Math.ceil(maxDiff * 0.25), 0].map((v, i) => (
              <span key={i} className="y-label">{v}</span>
            ))}
          </div>
          {/* Bars */}
          <div className="chart-bars">
            {[["Easy", "green"], ["Medium", "orange"], ["Hard", "red"]].map(([key, color]) => (
              <div className="chart-col" key={key}>
                <div className="chart-bar-wrap">
                  <div className={`chart-bar ${color}`} style={{ height: diffPct(key) }} />
                </div>
                <span className="chart-lbl">{key}</span>
              </div>
            ))}
          </div>
        </div>
        {/* Legend */}
        <div className="legend">
          {[["Easy", "green", stats.difficulty.Easy], ["Medium", "orange", stats.difficulty.Medium], ["Hard", "red", stats.difficulty.Hard]].map(([label, color, val]) => (
            <span key={label} className="legend-item">
              <span className={`dot ${color}`} /> {label} <strong>{val}</strong>
            </span>
          ))}
        </div>
      </div>

      {/* TOP TOPICS */}
      <div className="card">
        <h2 className="card-title">Top Topics Practiced</h2>
        {topicList.length === 0
          ? <p className="empty">No topics detected yet</p>
          : topicList.map(([topic, count], i) => (
            <div className="topic-row" key={topic}>
              <span className="topic-num">{i + 1}</span>
              <span className="topic-name">{topic}</span>
              <span className="topic-count">{count} {count === 1 ? "problem" : "problems"}</span>
            </div>
          ))
        }
      </div>

      {/* RESET */}
      <div className="footer">
        <button className="reset-btn" onClick={resetData}>↺ Reset Data</button>
      </div>

    </div>
  );
}