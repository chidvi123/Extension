import React, { useEffect, useState } from "react";
import "./Popup.css";

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}m ${secs}s`;
}

const Popup = () => {

  const [stats, setStats] = useState({
    total: 0,
    leetcode: 0,
    geeksforgeeks: 0
  });

  useEffect(() => {

    const today = new Date().toISOString().split("T")[0];

    chrome.storage.local.get(today, (result) => {

      const sessions = result[today] || [];

      let total = 0;
      let leetcode = 0;
      let geeksforgeeks = 0;

      sessions.forEach(session => {

        total += session.duration;

        if (session.platform === "leetcode") {
          leetcode += session.duration;
        }

        if (session.platform === "geeksforgeeks") {
          geeksforgeeks += session.duration;
        }

      });

      setStats({
        total,
        leetcode,
        geeksforgeeks
      });

    });

  }, []);

  return (
    <div className="popup-container">

      <h2>Today's Coding Time</h2>

      <p><strong>Total:</strong> {formatTime(stats.total)}</p>

      <p><strong>LeetCode:</strong> {formatTime(stats.leetcode)}</p>

      <p><strong>GeeksforGeeks:</strong> {formatTime(stats.geeksforgeeks)}</p>

    </div>
  );
};

export default Popup;