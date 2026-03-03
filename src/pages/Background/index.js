console.log("🔥 Background script loaded");

let isTracking = false;
let startTime = null;
let currentTabId = null;



function isAllowedDomain(url) {
  if (!url) return false;

  return (
    url.includes("leetcode.com") ||
    url.includes("geeksforgeeks.org")
  );
}

function startTracking(tabId) {
  if (isTracking) return;

  isTracking = true;
  currentTabId = tabId;
  startTime = Date.now();

  console.log("🟢 Tracking started");
}

function stopTracking() {
  if (!isTracking) return;

  const timeSpent = Math.floor((Date.now() - startTime) / 1000);

  console.log("🔴 Tracking stopped");
  console.log("Session time (seconds):", timeSpent);

  isTracking = false;
  startTime = null;
  currentTabId = null;
}


async function handleTabChange(tabId) {
  try {
    const tab = await chrome.tabs.get(tabId);

    if (!tab || !tab.url) return;

    if (isAllowedDomain(tab.url)) {
      startTracking(tabId);
    } else {
      stopTracking();
    }

  } catch (error) {
    console.error("Error:", error);
  }
}

// 🔹 1. When user switches tabs
chrome.tabs.onActivated.addListener((activeInfo) => {
  handleTabChange(activeInfo.tabId);
});

// 🔹 2. When URL updates inside a tab
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete") {
    handleTabChange(tabId);
  }
});

setTimeout(async () => {
  try {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });

    if (tab?.id) {
      handleTabChange(tab.id);
    }
  } catch (error) {
    console.warn("Startup tab check skipped:", error.message);
  }
}, 300);