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