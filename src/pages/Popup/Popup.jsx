import React, { useEffect, useState, useRef } from "react";
import "./Popup.css";

/* ---------------------------------------------------------
   Utility: Convert seconds into readable time
   Example:
   3660 → "1h 1m"
   120  → "2m 0s"
---------------------------------------------------------- */
function formatTime(sec) {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;

  return h > 0 ? `${h}h ${m}m` : `${m}m ${s}s`;
}

/*-----------------------------------------------------------*/
function computeStreak(data){
  const keys=Object.keys(data);

  const today=new Date();

  let count=0;

  for(let i=0;i<365;i++){
    const date=new Date(today);

    date.setDate(today.getDate()-i);

    const key=date.toISOString().split("T")[0];

    if(keys.includes(key)){
      count++;
    }
    else{
      break;
    }
  }

  return count;
}

/* ---------------------------------------------------------
   Empty analytics structure
   Used:
   - initial state
   - after reset
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

  /* ---------------------------------------------------------
     STATES
  ---------------------------------------------------------- */

  const [stats, setStats] = useState(EMPTY);

  const [animated, setAnimated] = useState(false);

  const [dark, setDark] = useState(true);

  /* NEW: Range filter (day | week | month) */
  const [range, setRange] = useState("day");

  const [streak,setStreak]=useState(0);

  /* Prevent animation running multiple times */
  const hasAnimated = useRef(false);



  /* ---------------------------------------------------------
     Load saved theme from chrome storage
  ---------------------------------------------------------- */

  useEffect(() => {

    chrome.storage.local.get("theme", (res) => {

      if (res.theme === "light") {
        setDark(false);
      }

    });

  }, []);



  /* ---------------------------------------------------------
     LOAD ANALYTICS DATA
     This recomputes analytics whenever range changes
  ---------------------------------------------------------- */

  useEffect(() => {

    /* Get ALL stored keys */
    chrome.storage.local.get(null, (data) => {

      const currentStreak=computeStreak(data);
      setStreak(currentStreak);

      const now = new Date();

      const sessions = [];

      
      /* ---------------------------------------------------
         Filter sessions depending on selected range
      ---------------------------------------------------- */

      Object.keys(data).forEach((dateKey) => {

        const date = new Date(dateKey);

        const diffDays =
          (now - date) / (1000 * 60 * 60 * 24);

        if (range === "day") {

          const todayKey =
            now.toISOString().split("T")[0];

          if (dateKey === todayKey) {
            sessions.push(...data[dateKey]);
          }

        }

        else if (range === "week") {

          if (diffDays <= 7) {
            sessions.push(...data[dateKey]);
          }

        }

        else if (range === "month") {

          if (diffDays <= 30) {
            sessions.push(...data[dateKey]);
          }

        }

      });



      /* ---------------------------------------------------
         Recompute analytics from filtered sessions
      ---------------------------------------------------- */

      const s = structuredClone(EMPTY);

      sessions.forEach((record) => {

        /* PLATFORM TIME */
        if (record.type === "platform") {

          s.totalCodingTime += record.duration;

          if (record.platform === "leetcode") {
            s.platformTime.leetcode += record.duration;
          }

          if (record.platform === "geeksforgeeks") {
            s.platformTime.geeksforgeeks += record.duration;
          }

        }

        /* SOLVED PROBLEMS */
        if (record.type === "problem" && record.solved) {

          s.totalProblems++;

          if (record.platform === "leetcode") {
            s.problemPlatform.leetcode++;
          }

          if (record.platform === "geeksforgeeks") {
            s.problemPlatform.geeksforgeeks++;
          }

          /* Difficulty Distribution */
          const diff = record.problem?.difficulty;

          if (diff in s.difficulty) {
            s.difficulty[diff]++;
          }

          /* Topic Counting */
          (record.problem?.topics || []).forEach((t) => {
            s.topics[t] = (s.topics[t] || 0) + 1;
          });

        }

      });



      /* Save computed analytics to state */
      setStats(s);



      /* Run chart animation once */
      if (!hasAnimated.current) {

        hasAnimated.current = true;

        setTimeout(() => {
          setAnimated(true);
        }, 100);

      }

    });

  }, [range]);   // IMPORTANT: recompute when range changes



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
     Reset all stored analytics
  ---------------------------------------------------------- */

  function resetData() {

    chrome.storage.local.clear(() => {

      setStats(EMPTY);

      setAnimated(false);

      setTimeout(() => setAnimated(true), 100);

    });

  }



  /* ---------------------------------------------------------
     Derived values used in charts
  ---------------------------------------------------------- */

  const totalPlatform =
    stats.platformTime.leetcode +
    stats.platformTime.geeksforgeeks || 1;

  const maxDiff =
    Math.max(...Object.values(stats.difficulty), 1);

  const topicList =
    Object.entries(stats.topics)
      .sort((a, b) => b[1] - a[1]);



  /* Date label */
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



  /* Platform bar percentages */
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
     RENDER UI
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



      {/* CODING TIME CARD */}
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



        {/* LEETCODE */}
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



        {/* GFG */}
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



      {/* PROBLEMS SOLVED */}
      <div className="card">

        <h2 className="card-title">
          📖 Problems Solved
        </h2>

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



      {/* DIFFICULTY CHART */}
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



      {/* TOP TOPICS */}
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



      {/* RESET */}
      <div className="footer">

        <button
          className="reset-btn"
          onClick={resetData}
        >
          ↺ Reset Data
        </button>

      </div>



    </div>
  );
}