import React, { useEffect, useState } from "react";
import "./Popup.css";

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}m ${secs}s`;
}

const Popup = () => {

  const [stats, setStats] = useState({
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
  });

  useEffect(() => {

    const today = new Date().toISOString().split("T")[0];

    chrome.storage.local.get(today, (result) => {

      const sessions = result[today] || [];

      let totalCodingTime = 0;

      let platformTime = {
        leetcode: 0,
        geeksforgeeks: 0
      };

      let problemPlatform = {
        leetcode: 0,
        geeksforgeeks: 0
      };

      let totalProblems = 0;

      const difficulty = {
        Easy: 0,
        Medium: 0,
        Hard: 0
      };

      const topics = {};

      sessions.forEach(record => {

        // Platform session tracking
        if (record.type === "platform") {

          totalCodingTime += record.duration;

          if (record.platform === "leetcode") {
            platformTime.leetcode += record.duration;
          }

          if (record.platform === "geeksforgeeks") {
            platformTime.geeksforgeeks += record.duration;
          }

        }

        // Problem session analytics
        if (record.type === "problem") {

          totalProblems++;

          if (record.platform === "leetcode") {
            problemPlatform.leetcode++;
          }

          if (record.platform === "geeksforgeeks") {
            problemPlatform.geeksforgeeks++;
          }

          const diff = record.problem?.difficulty;

          if (difficulty[diff] !== undefined) {
            difficulty[diff]++;
          }

          (record.problem?.topics || []).forEach(topic => {
            topics[topic] = (topics[topic] || 0) + 1;
          });

        }

      });

      setStats({
        totalCodingTime,
        platformTime,
        problemPlatform,
        totalProblems,
        difficulty,
        topics
      });

    });

  }, []);

  return (
    <div className="popup-container">

      <h2>DSA Coding Intelligence</h2>

      <h3>Coding Time</h3>
      <p><strong>Total:</strong> {formatTime(stats.totalCodingTime)}</p>
      <p><strong>LeetCode:</strong> {formatTime(stats.platformTime.leetcode)}</p>
      <p><strong>GeeksforGeeks:</strong> {formatTime(stats.platformTime.geeksforgeeks)}</p>


      <h3>Problems Solved</h3>
      <p><strong>Total:</strong> {stats.totalProblems}</p>
      <p><strong>LeetCode:</strong> {stats.problemPlatform.leetcode}</p>
      <p><strong>GeeksforGeeks:</strong> {stats.problemPlatform.geeksforgeeks}</p>


      <h3>Difficulty Distribution</h3>
      <p>Easy: {stats.difficulty.Easy}</p>
      <p>Medium: {stats.difficulty.Medium}</p>
      <p>Hard: {stats.difficulty.Hard}</p>


      <h3>Top Topics</h3>

      {Object.entries(stats.topics).length === 0 ? (
        <p>No topics detected yet</p>
      ) : (
        Object.entries(stats.topics).map(([topic, count]) => (
          <p key={topic}>
            {topic}: {count}
          </p>
        ))
      )}

    </div>
  );
};

export default Popup;