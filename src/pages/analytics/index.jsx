import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import "./analytics.css";
import { formatTime } from "./helpers";

import { buildDayArray } from "./helpers";
import StatCards from "./StatCards";
import PieChart from "./PieChart";
import WeakTopics from "./WeakTopics";
import Heatmap from "./Heatmap";
import TopicChart from "./TopicAnalysis";

// Difficulty badge color helper
function difficultyColor(difficulty) {
  switch ((difficulty || "").toLowerCase()) {
    case "easy":   return { bg: "#dcfce7", text: "#166534", border: "#86efac" };
    case "medium": return { bg: "#fef9c3", text: "#854d0e", border: "#fde047" };
    case "hard":   return { bg: "#fee2e2", text: "#991b1b", border: "#fca5a5" };
    default:       return { bg: "var(--card2)", text: "var(--text2)", border: "var(--border)" };
  }
}

// Format a date string to a readable short form
function formatDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d)) return "";
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function Analytics() {
  const [dark, setDark] = useState(true);
  const [totalSolved, setTotalSolved] = useState(0);
  const [activeDays, setActiveDays] = useState(0);
  const [platformUsage, setPlatformUsage] = useState({ leetcode: 0, geeksforgeeks: 0 });
  const [diffStats, setDiffStats] = useState({ Easy: 0, Medium: 0, Hard: 0 });
  const [weakTopics, setWeakTopics] = useState([]);
  const [topicStats, setTopicStats] = useState({});
  const [yearData, setYearData] = useState([]);

  const [recent, setRecent] = useState([]);
  const [insights, setInsights] = useState({ avg: 0, fastest: 0, slowest: 0, total: 0 });

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

  function processData(data) {
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

    // ── RECENT PROBLEMS ──────────────────────────────────────
    const solvedProblems = [];
    allSessions.forEach((r) => {
      if (r.type === "problem" && r.solved) {
        solvedProblems.push({
          name:       r.problem?.name || r.problem?.title || "Unknown",
          difficulty: r.problem?.difficulty || "Unknown",
          platform:   r.platform || "",
          time:       r.timeSpent || 0,
          date:       r.timestamp || r.end || r.start || null,
        });
      }
    });

    // Sort newest first
    solvedProblems.sort((a, b) => new Date(b.date) - new Date(a.date));

    const recentList = solvedProblems.slice(0, 5);

    // ── INSIGHTS ─────────────────────────────────────────────
    // Guard: only compute when there's at least one solved problem
    let avgTime = 0, fastestTime = 0, slowestTime = 0;
    if (solvedProblems.length > 0) {
      const totalTime = solvedProblems.reduce((s, p) => s + p.time, 0);
      avgTime     = totalTime / solvedProblems.length;
      fastestTime = Math.min(...solvedProblems.map((p) => p.time));
      slowestTime = Math.max(...solvedProblems.map((p) => p.time));
    }

    setRecent(recentList);
    setInsights({
      avg:     avgTime,
      fastest: fastestTime,
      slowest: slowestTime,
      total:   solvedProblems.length,
    });

    // ── REST OF STATS ─────────────────────────────────────────
    const days365  = buildDayArray(sessionData, 365);
    const active   = days365.filter((d) =>( d.count || 0) > 0).length;
    const overallAvg = solved >0 ? totalSolveTime/solved :0;

    const weak = Object.entries(topics)
      .filter(([, s]) => s.time / s.count > overallAvg && s.count <= 3)
      .sort((a, b) => b[1].time / b[1].count - a[1].time / a[1].count)
      .slice(0, 10)
      .map(([name, s]) => ({ name, avg: s.time / s.count, solved: s.count }));

    setTotalSolved(solved);
    setActiveDays(active);
    setPlatformUsage({ leetcode: lcTime, geeksforgeeks: gfgTime });
    setDiffStats(diff);
    setWeakTopics(weak);
    setTopicStats(topics);
    setYearData(days365);
  }

  useEffect(() => {
    chrome.storage.local.get(null, (data) => { processData(data); });
  }, []);

  useEffect(() => {
    function handleUpdate(message) {
      if (message.type === "DATA_UPDATED") {
        chrome.storage.local.get(null, (data) => { processData(data); });
      }
    }
    chrome.runtime.onMessage.addListener(handleUpdate);
    return () => chrome.runtime.onMessage.removeListener(handleUpdate);
  }, []);

  const hasData = recent.length > 0;

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

        {/* ROW 1 */}
        <div className="stat-pair">
          <StatCards totalSolved={totalSolved} activeDays={activeDays} />
        </div>

        <div className="card heatmap-card">
          {yearData.length > 0
            ? <Heatmap yearData={yearData} />
            : <p className="empty-msg">Loading heatmap…</p>
          }
        </div>

        {/* ROW 2 */}
        <div className="left-col">
          <div className="card platform-card">
            <h2 className="card-title">Platform Usage</h2>
            <PieChart
              data={[
                { label: "LeetCode",      value: platformUsage.leetcode,      color: "#f89f1b" },
                { label: "GeeksforGeeks", value: platformUsage.geeksforgeeks, color: "#10b981" },
              ]}
            />
          </div>
          <div className="card diff-card">
            <h2 className="card-title">Difficulty</h2>
            <PieChart
              data={[
                { label: "Easy",   value: diffStats.Easy,   color: "#10b981" },
                { label: "Medium", value: diffStats.Medium, color: "#f59e0b" },
                { label: "Hard",   value: diffStats.Hard,   color: "#ef4444" },
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

        {/* ── ROW 3: Recent Activity & Insights ── */}
        <div className="recent-row">
          <div className="card recent-card">

            <div className="recent-header">
              <h2 className="card-title" style={{ margin: 0 }}>Recent Activity</h2>
              {hasData && (
                <span className="recent-count-badge">
                  {recent.length} of {insights.total}
                </span>
              )}
            </div>

            {!hasData ? (
              <div className="recent-empty">
                <div className="recent-empty-icon">📭</div>
                <p className="recent-empty-text">Solve some problems to see activity</p>
              </div>
            ) : (
              <div className="recent-body">

                {/* LEFT: Problem list */}
                <div className="recent-list-col">
                  <div className="recent-list">
                    {recent.map((p, i) => {
                      const dc = difficultyColor(p.difficulty);
                      return (
                        <div key={i} className="recent-item">
                          <div className="recent-item-left">
                            <span className="recent-rank">#{i + 1}</span>
                            <div className="recent-info">
                              <div className="recent-name" title={p.name}>{p.name}</div>
                              <div className="recent-meta">
                                <span className="recent-date">{formatDate(p.date)}</span>
                                {p.platform && (
                                  <span className="recent-platform">
                                    {p.platform === "leetcode" ? "LC" : "GFG"}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="recent-item-right">
                            <span
                              className="diff-badge"
                              style={{
                                background:   dc.bg,
                                color:        dc.text,
                                borderColor:  dc.border,
                              }}
                            >
                              {p.difficulty}
                            </span>
                            <span className="recent-time">{formatTime(p.time)}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* DIVIDER */}
                <div className="recent-divider" />

                {/* RIGHT: Insight stat cards */}
                <div className="insights-col">
                  <h2 className="card-title" style={{ marginBottom: 10 }}>Insights</h2>
                  <div className="insight-cards">

                    <div className="insight-card">
                      <div className="insight-icon insight-icon--avg">⌀</div>
                      <div className="insight-label">Avg time</div>
                      <div className="insight-value">{formatTime(insights.avg)}</div>
                    </div>

                    <div className="insight-card insight-card--fast">
                      <div className="insight-icon insight-icon--fast">↑</div>
                      <div className="insight-label">Fastest</div>
                      <div className="insight-value">{formatTime(insights.fastest)}</div>
                    </div>

                    <div className="insight-card insight-card--slow">
                      <div className="insight-icon insight-icon--slow">↓</div>
                      <div className="insight-label">Slowest</div>
                      <div className="insight-value">{formatTime(insights.slowest)}</div>
                    </div>

                  </div>

                  {/* Pace bar: fastest → slowest, avg marker */}
                  {insights.slowest > 0 && insights.fastest !== insights.slowest && (
                    <div className="pace-bar-wrap">
                      <div className="pace-bar-label">
                        <span>Pace range</span>
                      </div>
                      <div className="pace-bar-track">
                        <div
                          className="pace-bar-avg"
                          style={{
                            left: `${((insights.avg - insights.fastest) /
                              (insights.slowest - insights.fastest)) * 100}%`,
                          }}
                          title={`Avg: ${formatTime(insights.avg)}`}
                        />
                      </div>
                      <div className="pace-bar-ends">
                        <span>{formatTime(insights.fastest)}</span>
                        <span>{formatTime(insights.slowest)}</span>
                      </div>
                    </div>
                  )}
                </div>

              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<Analytics />);