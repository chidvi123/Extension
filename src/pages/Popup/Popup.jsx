import React, { useEffect, useState, useRef } from "react";
import "./Popup.css";

/* ---------------------------------------------------------
   Utility: Convert seconds into readable time
---------------------------------------------------------- */
function formatTime(sec) {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;

  return h > 0 ? `${h}h ${m}m` : `${m}m ${s}s`;
}

/* ---------------------------------------------------------
   Compute streak
---------------------------------------------------------- */
function computeStreak(data) {
  const keys = Object.keys(data);

  const today = new Date();
  const todayKey = today.toISOString().split("T")[0];

  let count = 0;
  let startOffset = 0;

  if (!keys.includes(todayKey)) {
    startOffset = 1;
  }

  for (let i = startOffset; i < 365; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);

    const key = date.toISOString().split("T")[0];

    if (keys.includes(key)) {
      count++;
    } else {
      break;
    }
  }

  return count;
}

/* ---------------------------------------------------------
   Empty analytics structure
---------------------------------------------------------- */
const EMPTY = {
  totalCodingTime: 0,

  platformTime: {
    leetcode: 0,
    geeksforgeeks: 0
  },

  problemPlatform: {
    leetcode: 0,
    geeksforgeeks: 0
  },

  totalProblems: 0,

  difficulty: {
    Easy: 0,
    Medium: 0,
    Hard: 0
  },

  topics: {}
};

export default function Popup() {

  const [stats, setStats] = useState(EMPTY);
  const [animated, setAnimated] = useState(false);
  const [dark, setDark] = useState(true);
  const [range, setRange] = useState("day");
  const [streak, setStreak] = useState(0);

  const hasAnimated = useRef(false);

  // 🔽 ADD THIS EXACTLY HERE
function loadDataFromStorage() {

  chrome.storage.local.get(null, (data) => {

    const currentStreak = computeStreak(data);
    setStreak(currentStreak);

    const now = new Date();
    const sessions = [];

    Object.keys(data).forEach((dateKey) => {

      const date = new Date(dateKey);
      const diffDays = (now - date) / (1000 * 60 * 60 * 24);

      if (range === "day") {

        const todayKey = now.toISOString().split("T")[0];

        if (dateKey === todayKey) {
          sessions.push(...data[dateKey]);
        }

      } else if (range === "week") {

        if (diffDays <= 7) {
          sessions.push(...data[dateKey]);
        }

      } else if (range === "month") {

        if (diffDays <= 30) {
          sessions.push(...data[dateKey]);
        }

      }

    });

    const s = structuredClone(EMPTY);

    sessions.forEach((record) => {

      if (record.type === "platform") {

        s.totalCodingTime += record.duration;

        if (record.platform === "leetcode") {
          s.platformTime.leetcode += record.duration;
        }

        if (record.platform === "geeksforgeeks") {
          s.platformTime.geeksforgeeks += record.duration;
        }

      }

      if (record.type === "problem" && record.solved) {

        s.totalProblems++;

        if (record.platform === "leetcode") {
          s.problemPlatform.leetcode++;
        }

        if (record.platform === "geeksforgeeks") {
          s.problemPlatform.geeksforgeeks++;
        }

        const diff = record.problem?.difficulty;

        if (diff in s.difficulty) {
          s.difficulty[diff]++;
        }

        (record.problem?.topics || []).forEach((t) => {
          s.topics[t] = (s.topics[t] || 0) + 1;
        });

      }

    });

    setStats(s);

  });
}

  /* ---------------------------------------------------------
     Load saved theme
  ---------------------------------------------------------- */
  useEffect(() => {
    chrome.storage.local.get("theme", (res) => {
      if (res.theme === "light") {
        setDark(false);
      }
    });
  }, []);

  /* ---------------------------------------------------------
     Load analytics data
  ---------------------------------------------------------- */
  useEffect(() => {

    chrome.storage.local.get(null, (data) => {

      const currentStreak = computeStreak(data);
      setStreak(currentStreak);

      const now = new Date();
      const sessions = [];

      Object.keys(data).forEach((dateKey) => {

        const date = new Date(dateKey);
        const diffDays = (now - date) / (1000 * 60 * 60 * 24);

        if (range === "day") {

          const todayKey = now.toISOString().split("T")[0];

          if (dateKey === todayKey) {
            sessions.push(...data[dateKey]);
          }

        } else if (range === "week") {

          if (diffDays <= 7) {
            sessions.push(...data[dateKey]);
          }

        } else if (range === "month") {

          if (diffDays <= 30) {
            sessions.push(...data[dateKey]);
          }

        }

      });

      const s = structuredClone(EMPTY);

      sessions.forEach((record) => {

        if (record.type === "platform") {

          s.totalCodingTime += record.duration;

          if (record.platform === "leetcode") {
            s.platformTime.leetcode += record.duration;
          }

          if (record.platform === "geeksforgeeks") {
            s.platformTime.geeksforgeeks += record.duration;
          }

        }

        if (record.type === "problem" && record.solved) {

          s.totalProblems++;

          if (record.platform === "leetcode") {
            s.problemPlatform.leetcode++;
          }

          if (record.platform === "geeksforgeeks") {
            s.problemPlatform.geeksforgeeks++;
          }

          const diff = record.problem?.difficulty;

          if (diff in s.difficulty) {
            s.difficulty[diff]++;
          }

          (record.problem?.topics || []).forEach((t) => {
            s.topics[t] = (s.topics[t] || 0) + 1;
          });

        }

      });

      setStats(s);

      if (!hasAnimated.current) {
        hasAnimated.current = true;

        setTimeout(() => {
          setAnimated(true);
        }, 100);
      }

    });

  }, [range]);

  // 🔽 ADD THIS EXACTLY HERE
useEffect(() => {

  function handleUpdate(message) {
    if (message.type === "DATA_UPDATED") {
      loadDataFromStorage();
    }
  }

  chrome.runtime.onMessage.addListener(handleUpdate);

  return () => {
    chrome.runtime.onMessage.removeListener(handleUpdate);
  };

}, [range]);

  /* ---------------------------------------------------------
     Toggle theme
  ---------------------------------------------------------- */
  function toggleTheme() {

    const next = !dark;

    setDark(next);

    chrome.storage.local.set({
      theme: next ? "dark" : "light"
    });

  }

  /* ---------------------------------------------------------
     Derived values
  ---------------------------------------------------------- */

  const totalPlatform =
    stats.platformTime.leetcode +
    stats.platformTime.geeksforgeeks || 1;

  const maxDiff =
    Math.max(...Object.values(stats.difficulty), 1);

  const topicList =
    Object.entries(stats.topics)
      .sort((a, b) => b[1] - a[1])
      .slice(0,5);

  const dateStr =
    range === "day"
      ? new Date().toLocaleDateString("en-US", {
          weekday: "long",
          month: "short",
          day: "numeric"
        })
      : range === "week"
      ? "Last 7 Days"
      : "Last 30 Days";

  const lcPct = animated
    ? `${(stats.platformTime.leetcode / totalPlatform) * 100}%`
    : "0%";

  const gfgPct = animated
    ? `${(stats.platformTime.geeksforgeeks / totalPlatform) * 100}%`
    : "0%";

  function diffPct(key) {
    return animated
      ? `${(stats.difficulty[key] / maxDiff) * 100}%`
      : "0%";
  }

  /* ---------------------------------------------------------
     UI
  ---------------------------------------------------------- */

  return (
    <div className={`popup ${dark ? "dark" : "light"}`}>

      {/* HEADER */}
      <div className="header">

        <div className="header-left">
          <div>
            <h1 className="title">Coding Tracker</h1>
            <p className="subtitle">
              Track your daily coding productivity
            </p>
          </div>
        </div>

        <div className="header-right">

            <button
              className="theme-btn"
              onClick={loadDataFromStorage}
            >
            🔄
            </button>

          <div className="streak">
            <span>🔥</span>
            <span className="streak-num">{streak}d</span>
          </div>

          <button
            className="theme-btn"
            onClick={toggleTheme}
          >
            {dark ? "☀️" : "🌙"}
          </button>

        </div>

      </div>

      {/* DATE */}
      <p className="date">{dateStr}</p>

      {/* RANGE SELECTOR */}
      <div className="range-selector">

        <button
          className={range === "day" ? "active" : ""}
          onClick={() => setRange("day")}
        >
          Day
        </button>

        <button
          className={range === "week" ? "active" : ""}
          onClick={() => setRange("week")}
        >
          Week
        </button>

        <button
          className={range === "month" ? "active" : ""}
          onClick={() => setRange("month")}
        >
          Month
        </button>

      </div>

      {/* CODING TIME */}
      <div className="card">

        <h2 className="card-title">🕐 Coding Time</h2>

        <div className="big-time">

          <div className="big-time-val">
            {formatTime(stats.totalCodingTime)}
          </div>

          <div className="big-time-lbl">
            Total coding time {range}
          </div>

        </div>

        <div className="platform-row">
          <span className="dot orange" />
          LeetCode
          <span className="time-right">
            {formatTime(stats.platformTime.leetcode)}
          </span>
        </div>

        <div className="bar-track">
          <div
            className="bar-fill orange"
            style={{ width: lcPct }}
          />
        </div>

        <div className="platform-row top-gap">
          <span className="dot green" />
          GeeksforGeeks
          <span className="time-right">
            {formatTime(stats.platformTime.geeksforgeeks)}
          </span>
        </div>

        <div className="bar-track">
          <div
            className="bar-fill green"
            style={{ width: gfgPct }}
          />
        </div>

      </div>

      {/* PROBLEMS */}
      <div className="card">

        <h2 className="card-title">📖 Problems Solved</h2>

        <div className="prob-grid">

          <div className="prob-box blue">
            <div className="prob-num">
              {stats.totalProblems}
            </div>
            <div className="prob-lbl">Total</div>
          </div>

          <div className="prob-box orange">
            <div className="prob-num">
              {stats.problemPlatform.leetcode}
            </div>
            <div className="prob-lbl">LeetCode</div>
          </div>

          <div className="prob-box green">
            <div className="prob-num">
              {stats.problemPlatform.geeksforgeeks}
            </div>
            <div className="prob-lbl">GFG</div>
          </div>

        </div>

      </div>

      {/* DIFFICULTY */}
      <div className="card">

        <h2 className="card-title">
          📈 Difficulty Distribution
        </h2>

        <div className="chart">

          <div className="y-axis">

            {[maxDiff,
              Math.ceil(maxDiff * 0.75),
              Math.ceil(maxDiff * 0.5),
              Math.ceil(maxDiff * 0.25),
              0
            ].map((v, i) => (
              <span key={i} className="y-label">
                {v}
              </span>
            ))}

          </div>

          <div className="chart-bars">

            {[["Easy","green"],
              ["Medium","orange"],
              ["Hard","red"]
            ].map(([key,color]) => (

              <div className="chart-col" key={key}>

                <div className="chart-bar-wrap">
                  <div
                    className={`chart-bar ${color}`}
                    style={{ height: diffPct(key) }}
                  />
                </div>

                <span className="chart-lbl">{key}</span>

              </div>

            ))}

          </div>

        </div>

      </div>

      {/* TOPICS */}
      <div className="card">

        <h2 className="card-title">
          Top Topics Practiced
        </h2>

        {topicList.length === 0
          ? <p className="empty">No topics detected yet</p>
          : topicList.map(([topic,count],i)=>(
              <div className="topic-row" key={topic}>
                <span className="topic-num">{i+1}</span>
                <span className="topic-name">{topic}</span>
                <span className="topic-count">
                  {count} {count===1?"problem":"problems"}
                </span>
              </div>
          ))
        }

      </div>

      {/*Analytics Button*/}
      <button className="analytics-btn"
      onClick={() =>
        chrome.tabs.create({
          url:chrome.runtime.getURL("analytics.html")
        })
      }>
       📊 View Full Analytics
      </button>

    </div>
  );
}