console.log("🔥 Background script loaded");

// Idle detection (15 minutes)
chrome.idle.setDetectionInterval(900);

let isTracking = false;
let startTime = null;
let currentTabId = null;
let currentPlatform = null;

let currentProblem = null;
let problemStartTime = null;


// 🔽 RESTORE STATE
chrome.storage.local.get("trackingState", (res) => {
  const state = res?.trackingState;

  if (state && state.isTracking) {
    console.log("♻️ Restoring tracking state");

    isTracking = state.isTracking;
    startTime = state.startTime;
    currentPlatform = state.currentPlatform;
    currentTabId = state.currentTabId;
  }
});


// 🔹 Get today's date key
function getTodayKey(){
  const today = new Date();
  return today.toISOString().split("T")[0];
}

function notifyDataUpdated() {
  chrome.runtime.sendMessage(
    { type: "DATA_UPDATED" },
    () => chrome.runtime.lastError
  );
}


// 🔽 ALARM
chrome.alarms.create("trackProgress", {
  periodInMinutes: 0.1
});


// 🔹 Detect platform
function getPlatform(url) {
  if (!url) return null;

  if (url.includes("leetcode.com")) return "leetcode";
  if (url.includes("geeksforgeeks.org")) return "geeksforgeeks";

  return null;
}


// 🔹 Save problem time
async function saveProblemTime() {

  if (!currentProblem || !problemStartTime) return;

  const problemTime = Math.floor((Date.now() - problemStartTime) / 1000);

  if (problemTime < 10){
    console.log("Ignored short problem visit");

    currentProblem = null;
    problemStartTime = null;
    return;
  }

  console.log("🧩 Problem session ended:", problemTime);

  const todayKey = getTodayKey();

  const result = await chrome.storage.local.get(todayKey);
  const sessions = result[todayKey] || [];

  sessions.push({
    type: "problem",
    platform: currentPlatform,
    problem: currentProblem,
    timeSpent: problemTime,
    solved: currentProblem?.solved || false,
    timestamp: Date.now()
  });

  await chrome.storage.local.set({ [todayKey]: sessions });

  notifyDataUpdated();

  currentProblem = null;
  problemStartTime = null;
}


// 🔹 Start tracking
function startTracking(tabId, platform) {

  if (isTracking && currentTabId === tabId && currentPlatform === platform) {
    return;
  }

  isTracking = true;
  currentTabId = tabId;
  currentPlatform = platform;
  startTime = Date.now();

  chrome.storage.local.set({
    trackingState: {
      isTracking: true,
      startTime,
      currentPlatform,
      currentTabId
    }
  });

  console.log("🟢 Tracking started on", platform);
}


// 🔹 Stop tracking
async function stopTracking() {

  if (!isTracking) return;

  const endTime = Date.now();
  const duration = Math.floor((endTime - startTime) / 1000);

  if(duration < 5){
    console.log("Ignored short session");

    isTracking = false;
    startTime = null;
    currentTabId = null;
    currentPlatform = null;
    return;
  }

  console.log("🔴 Tracking stopped 🔴");

  await saveProblemTime();

  const todayKey = getTodayKey();

  const result = await chrome.storage.local.get(todayKey);
  const sessions = result[todayKey] || [];

  sessions.push({
    type: "platform",
    platform: currentPlatform,
    start: startTime,
    end: endTime,
    duration: duration
  });

  await chrome.storage.local.set({ [todayKey]: sessions });

  notifyDataUpdated();

  isTracking = false;
  startTime = null;
  currentTabId = null;
  currentPlatform = null;

  chrome.storage.local.remove("trackingState");
}


// 🔹 Handle tab change
async function handleTabChange(tabId) {

  const tab = await chrome.tabs.get(tabId);

  if (!tab || tab.url?.startsWith("chrome://")){
    await stopTracking();
    return;
  }

  const platform = getPlatform(tab.url);

  if (platform) {

    if (!isTracking) {
      startTracking(tabId, platform);
    }

    else if (currentTabId !== tabId || currentPlatform !== platform) {
      await stopTracking();
      startTracking(tabId, platform);
    }

  } else {
    await stopTracking();
  }
}


// 🔹 Tab switch
chrome.tabs.onActivated.addListener((activeInfo) => {
  handleTabChange(activeInfo.tabId);
});


// 🔹 URL change
chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
  if (changeInfo.url) {
    handleTabChange(tabId);
  }
});


// 🔹 Idle
chrome.idle.onStateChanged.addListener(async (state) => {
  if (state === "idle" || state === "locked") {
    await stopTracking();
  }
});


// 🔹 Content script messages
chrome.runtime.onMessage.addListener(async (message) => {

  if (message.type === "PROBLEM_DETECTED") {

    await saveProblemTime();

    currentProblem = {
      ...message.data,
      solved: false
    };

    problemStartTime = Date.now();
  }

  if (message.type === "PROBLEM_SOLVED") {

    if (currentProblem) {
      currentProblem.solved = true;
    }

    await saveProblemTime();
  }

});


// 🔹 STARTUP
setTimeout(async () => {

  const [tab] = await chrome.tabs.query({
    active: true,
    currentWindow: true
  });
  

  //optinal chaining tab?.id
  if (tab?.id) {
    handleTabChange(tab.id);
  }

}, 300);


// 🔥 ALARM HANDLER (FIXED)
chrome.alarms.onAlarm.addListener(async (alarm) => {

  if (alarm.name !== "trackProgress") return;

  const res = await chrome.storage.local.get("trackingState");
  const state = res?.trackingState;

  if (!state || !state.isTracking) return;

  const [activeTab] = await chrome.tabs.query({
  active: true,
  currentWindow: true
  });

  const platform = getPlatform(activeTab?.url);
  if (!platform) return;

  isTracking = true;
  startTime = state.startTime;
  currentPlatform = state.currentPlatform;
  currentTabId = state.currentTabId;

  const now = Date.now();
  let duration = Math.floor((now - startTime) / 1000);

  // 🔥 FIX: prevent jumps
  duration = Math.min(duration, 8);

  if (duration < 2) return;

  const todayKey = getTodayKey();

  const result = await chrome.storage.local.get(todayKey);
  const sessions = result[todayKey] || [];

  sessions.push({
    type: "platform",
    platform: currentPlatform,
    start: startTime,
    end: now,
    duration: duration
  });

  await chrome.storage.local.set({ [todayKey]: sessions });

  console.log("⏱️ Auto progress saved");

  startTime = now;

  // 🔥 UPDATE STORAGE STATE
  chrome.storage.local.set({
    trackingState: {
      isTracking: true,
      startTime,
      currentPlatform,
      currentTabId
    }
  });

  notifyDataUpdated();
});