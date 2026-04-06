import React, { useEffect, useState, useRef } from "react";
import "./Popup.css";
import { LineChart,Line,XAxis,YAxis,Tooltip,Area,ResponsiveContainer } from "recharts";

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

//BUILD GRAPH DATA
function buildGraphData(data,range){
  const now = new Date();

  if(range==="day"){
    const hours=Array(24).fill(0);
    
    const todayKey=now.toISOString().split("T")[0];
    const sessions=data[todayKey] || [];
    
      sessions.forEach((rec)=>{
        if(rec.type==="platform"){
          const hour=new Date(rec.start).getHours();
          hours[hour]+=rec.duration;
        }
      });

    return hours.map((v,i)=>({
      hour:i,
      time:v
    }));
  }

  if(range==="week"){
    const days=Array(7).fill(0);
    Object.entries(data).forEach(([dateKey,sessions])=>{
      const d=new Date(dateKey);
      const diff=(now-d)/(1000*60*60*24);

      if(diff<=7){
        const day=d.getDay();
        sessions.forEach((rec)=>{
          if(rec.type==="platform"){
             days[day]+=rec.duration;
          }
        });
      }
    });

    return ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map((d, i) => ({
      day: d,
      time: days[i]
    }));
  }

  if(range==="month"){
    const result=[];

    Object.entries(data).forEach(([dateKey,sessions])=>{
      const d= new Date(dateKey);
      const diff=(now-d)/(1000*60*60*24);

      if(diff<=30){
        let total=0;

        sessions.forEach((rec)=>{
          if(rec.type==="platform"){
            total+=rec.duration;
          }
        });

        result.push({
          date:dateKey,
          time:total
        });
      }
    });

    return result.sort((a,b)=>new Date(a.date)-new Date(b.date));
  }
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

//org code
export default function Popup() {

  const [stats, setStats] = useState(EMPTY);
  const [animated, setAnimated] = useState(false);
  const [dark, setDark] = useState(true);
  const [range, setRange] = useState("day");
  const [streak, setStreak] = useState(0);
  const [graphData,setGraphData]=useState([]);

  const hasAnimated = useRef(false);


  // 🎯 TARGET SYSTEM
  const [target, setTarget] = useState({
    time: {
      h:"",
      m:"",
      s:""
    },
    problems: ""
  });

  const [progress, setProgress] = useState({
    time: 0,
    problems: 0
  });

const [saveMessage, setSaveMessage] = useState("");
const [isEditing,setIsEditing]=useState(true);

  // 🔽 ADD THIS EXACTLY HERE
function loadDataFromStorage() {

  chrome.storage.local.get(null, (data) => {

    const currentStreak = computeStreak(data);
    setStreak(currentStreak);
    setGraphData(buildGraphData(data,range));

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


//SAVE TARGET

function saveTarget() {

  chrome.storage.local.get("targets", (res) => {

    const existing = res.targets || {};
    
    const h = Number(target.time.h || 0);
    const m = Number(target.time.m || 0);
    const s = Number(target.time.s || 0);

    const totalSeconds = h * 3600 + m * 60 + s;

    const updated = {
      ...existing,
      [range]: {
        time: totalSeconds || null,
        problems: target.problems ? Number(target.problems) : null
      }
    };

    chrome.storage.local.set({ targets: updated });

    setSaveMessage("✅ Target saved!");
    setTimeout(() => setSaveMessage(""), 2000);
    
    setIsEditing(false);
    loadDataFromStorage();

  });
}

/* ---------------------------------------------------------
     Delete Target
  ---------------------------------------------------------- */

  function deleteTarget() {

  chrome.storage.local.get("targets", (res) => {

    const existing = res.targets || {};

    delete existing[range]; // remove current range target

    chrome.storage.local.set({ targets: existing });

    setTarget({
      time: { h: "", m: "", s: "" },
      problems: ""
    });

    setIsEditing(true); // back to edit mode

    loadDataFromStorage();

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
      setGraphData(buildGraphData(data,range));

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
//target 
    chrome.storage.local.get("targets", (res) => {
      if (res.targets && res.targets[range]) {

      const t = res.targets[range].time || 0;

      setTarget({
        time: {
          h: Math.floor(t / 3600),
          m: Math.floor((t % 3600) / 60),
          s: t % 60
        },
        problems: res.targets[range].problems || ""
      });
      setIsEditing(false);

      }
      else{
        setTarget({
          time:{h:"",m:"",s:""},
          problems:""
        });

        setIsEditing(true);
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


//Progress UseEffect

useEffect(() => {

  chrome.storage.local.get("targets", (res) => {

    const current = res.targets?.[range];

    if (!current) return;

    let timeProgress = 0;
    let problemProgress = 0;

    if (current.time) {
      timeProgress = Math.min(
        (stats.totalCodingTime / current.time) * 100,
        100
      );
    }

    if (current.problems) {
      problemProgress = Math.min(
        (stats.totalProblems / current.problems) * 100,
        100
      );
    }

    setProgress({
      time: timeProgress,
      problems: problemProgress
    });

  });

}, [stats, range]);


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

      {/* 🎯 GOAL TRACKER CARD */}
      <div className="card" style={{ padding: "14px" }}>

        {/* HEADER */}
        <div className="goal-card-header">
          <div className="goal-card-title">
            <div className="goal-dot" />
            Goal Tracker
          </div>
          <div className="goal-header-right">
            <span className="goal-badge">
              {range.charAt(0).toUpperCase() + range.slice(1)} target
            </span>
            {!isEditing && (
              <>
              <button className="goal-edit-btn" onClick={() => setIsEditing(true)}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
                Edit
              </button>

              <button className="goal-delete-btn" onClick={deleteTarget}>
                🗑
              </button>
              </>
            )}
          </div>
        </div>

        {isEditing ? (

          <div className="goal-edit-form">
            <div className="goal-edit-inputs">
              <input
                type="number" max="23" placeholder="HH"
                value={target.time.h}
                onChange={(e) => setTarget({ ...target, time: { ...target.time, h: e.target.value } })}
                className="goal-input"
              />
              <span className="goal-edit-sep">:</span>
              <input
                type="number" max="59" placeholder="MM"
                value={target.time.m}
                onChange={(e) => setTarget({ ...target, time: { ...target.time, m: e.target.value } })}
                className="goal-input"
              />
              <span className="goal-edit-sep">:</span>
              <input
                type="number" max="59" placeholder="SS"
                value={target.time.s}
                onChange={(e) => setTarget({ ...target, time: { ...target.time, s: e.target.value } })}
                className="goal-input"
              />
              <input
                type="number" placeholder="Problems"
                value={target.problems || ""}
                onChange={(e) => setTarget({ ...target, problems: e.target.value })}
                className="goal-input wide"
                style={{ flex: 2 }}
              />
            </div>
            <button
              className="goal-save-btn"
              onClick={saveTarget}
              disabled={!target.time.h && !target.time.m && !target.time.s && !target.problems}
            >
              Save Target
            </button>
            {saveMessage && (
              <div style={{ color: "#4ade80", fontSize: "11px", textAlign: "center" }}>
                {saveMessage}
              </div>
            )}
          </div>

        ) : (

          <>
            {/* TODAY ROW */}
            <div className="goal-today-row">
              <span className="goal-today-label">Today</span>
              <div className="goal-today-right">
                <span className="goal-today-time">
                  {target.time.h || 0}h {target.time.m || 0}m {target.time.s || 0}s
                </span>

                <span className="goal-prob-badge">
                  {target.problems || 0} problems
                </span>
              </div>
            </div>

            {/* TIME GOAL */}
            {(target.time.h || target.time.m || target.time.s) && (
              <div className="goal-row">
                <div className="goal-row-top">
                  <div className="goal-row-name">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                      <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                    </svg>
                    Time goal
                  </div>
                  <span className="goal-row-pct green">{Math.round(progress.time)}%</span>
                </div>
                <div className="goal-bar">
                  <div className="goal-bar-fill green" style={{ width: `${progress.time}%` }} />
                </div>
              </div>
            )}

            {/* PROBLEM GOAL */}
            {target.problems && (
              <div className="goal-row">
                <div className="goal-row-top">
                  <div className="goal-row-name">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                      <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
                      <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
                    </svg>
                    Problem goal
                  </div>
                  <span className="goal-row-pct amber">{Math.round(progress.problems)}%</span>
                </div>
                <div className="goal-bar">
                  <div className="goal-bar-fill amber" style={{ width: `${progress.problems}%` }} />
                </div>
              </div>
            )}
          </>

        )}

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

      {/* 🔥 ACTIVITY TREND GRAPH */}
      <div className="card">

        <h2 className="card-title">📊 Activity Trend</h2>

        <ResponsiveContainer width="100%" height={220}>
          <LineChart
            data={graphData}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
          >

            {/* 🔥 Gradient Definition */}
            <defs>
              <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#4ade80" stopOpacity={0.9}/>
                <stop offset="100%" stopColor="#4ade80" stopOpacity={0.05}/>
              </linearGradient>
            </defs>

            {/* 🔥 X Axis */}
            <XAxis
              dataKey={
                range === "day"
                  ? "hour"
                  : range === "week"
                  ? "day"
                  : "date"
              }
              tickFormatter={(val) => {
                if (range === "day") return `${val}:00`;
                if (range === "week") return val;
                return val.slice(5); // MM-DD
              }}
              stroke="#94a3b8"
              tick={{ fontSize: 11 }}
            />

            <YAxis
              stroke="#475569"
              tick={{ fontSize: 10 }}
              width={30}
            />

            {/* 🔥 Tooltip */}
            <Tooltip
              formatter={(v) => formatTime(v)}
              contentStyle={{
                background: "#0f172a",
                border: "none",
                borderRadius: "10px",
                color: "#fff",
                fontSize: "12px",
                padding: "8px 10px"
              }}
              labelStyle={{ color: "#94a3b8" }}
            />

            {/* 🔥 Area Fill */}
            <Area
              type="monotone"
              dataKey="time"
              stroke="none"
              fill="url(#gradient)"
            />

            {/* 🔥 Smooth Line */}
            <Line
              type="monotone"
              dataKey="time"
              stroke="#4ade80"
              strokeWidth={3}
              dot={false}
              activeDot={{
                r: 5,
                stroke: "#4ade80",
                strokeWidth: 2,
                fill: "#0f172a"
              }}
            />

          </LineChart>
        </ResponsiveContainer>

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