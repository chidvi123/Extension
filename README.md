<h1 align="center">DSA Productivity Tracker</h1>

<p align="center">
A Chrome Extension that automatically tracks your DSA problem-solving activity across LeetCode and GeeksforGeeks, providing real-time insights, analytics, and goal-based productivity tracking.
</p>

<p align="center">
  <a href="#project-structure">Project Structure</a> •
  <a href="#preview">Preview</a> •
  <a href="#author">Contact</a>
</p>

---

## 🚀 Overview

DSA Productivity Tracker is a full-featured Chrome Extension designed to help developers track and analyze their coding practice.

It automatically detects problems solved on platforms like **LeetCode** and **GeeksforGeeks**, tracks time spent, and provides meaningful analytics such as streaks, weak topics, difficulty distribution, and productivity trends.

The system is built with a real-time tracking engine using Chrome APIs and a modern React-based UI for both popup and analytics dashboards.

---

## ✨ Key Features

### 📊 Tracking Engine
- Automatic problem detection (LeetCode & GFG)
- Real-time coding session tracking
- Tracks time spent per platform
- Detects problem completion (Accepted submissions)
- Handles dynamic sites (SPA navigation like LeetCode)

---

### 📈 Analytics Dashboard
- Total coding time (day/week/month)
- Problems solved tracking
- Difficulty distribution (Easy / Medium / Hard)
- Weak topics identification
- Activity trends with visual charts
- Recent activity tracking
- Active days & streak tracking

---

### 🎯 Productivity Features
- Daily / Weekly / Monthly goal setting
- Time-based and problem-based targets
- Real-time progress tracking
- Streak system to maintain consistency

---

### ⚡ Popup Dashboard
- Live coding stats
- Quick overview of activity
- Goal progress visualization
- Activity trend graph
- Direct navigation to full analytics

---

## 🧠 System Architecture

The extension follows a modular architecture with clear separation of responsibilities:

---

### 🔹 Background Script (Core Engine)
- Manages tracking sessions
- Handles time tracking
- Stores structured data in Chrome storage
- Emits updates to UI components

---

### 🔹 Content Script (Data Capture Layer)
- Extracts problem details (title, difficulty, topics)
- Detects problem changes (SPA handling)
- Tracks submissions and accepted solutions

---

### 🔹 Popup (Real-time UI)
- Displays live stats and quick insights
- Handles user goals and progress
- Provides compact analytics view

---

### 🔹 Analytics Page (Detailed Insights)
- Processes stored session data
- Generates charts and insights
- Displays trends and performance metrics

---

## 🛠️ Technology Stack

- **Frontend**: React  
- **Extension APIs**: Chrome Extensions API  
- **Storage**: Chrome Local Storage  
- **Charts**: Recharts  
- **Platforms Supported**:  
  - LeetCode  
  - GeeksforGeeks  

---

## 📂 Project Structure

```text
extension/
│
├── background/             # Core tracking engine
│   └── index.js
│
├── content/                # Content scripts (data extraction)
│   └── index.js
│
├── popup/                  # Popup UI (React)
│   ├── Popup.jsx
│   ├── Popup.css
│
├── analytics/              # Full analytics dashboard
│   ├── index.jsx
│   ├── styles.css
│
├── assets/                 # Icons and images
├── manifest.json           # Extension configuration
└── README.md

## ⚙️ How It Works

1. User opens a coding platform (LeetCode or GeeksforGeeks)

2. Content Script injects into the page and:
   - Extracts problem details (title, difficulty, topics, URL)
   - Detects problem changes (SPA navigation handling)

3. Background Script:
   - Starts tracking time for the session
   - Stores platform activity continuously
   - Tracks problem-level sessions

4. When user submits solution:
   - Content script detects submission
   - Checks for "Accepted" result
   - Sends `PROBLEM_SOLVED` event

5. Background Script:
   - Marks problem as solved
   - Saves session with duration and metadata

6. Data Storage:
   - Stored in Chrome Local Storage
   - Organized day-wise using date keys
   - Each day contains platform + problem sessions

7. Popup:
   - Reads live data from storage
   - Displays current stats, streak, and goals

8. Analytics Page:
   - Processes stored data
   - Generates insights, charts, and trends


## 📊 Data Model

Data is stored in Chrome Local Storage in a structured format:

```json
{
  "2026-04-08": [
    {
      "type": "platform",
      "platform": "leetcode",
      "start": 1712570000000,
      "end": 1712570300000,
      "duration": 300
    },
    {
      "type": "problem",
      "platform": "leetcode",
      "problem": {
        "name": "Two Sum",
        "difficulty": "Easy",
        "topics": ["Array", "Hash Table"]
      },
      "start": 1712570000000,
      "end": 1712570200000,
      "duration": 200,
      "solved": true
    }
  ]
}


---

# 🧠 System Flow (Optional Add – VERY GOOD)

```md

## 🔄 System Flow
User Action → Content Script → Background Script → Storage → UI (Popup / Analytics)
- Content Script captures problem and submission events
- Background Script handles tracking and persistence
- Storage acts as the central data source
- UI components read and visualize the data

