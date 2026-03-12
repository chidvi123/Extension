console.log("🔥 Background script loaded");

// Idle detection (15 minutes)
chrome.idle.setDetectionInterval(900);

let isTracking = false;
let startTime = null;
let currentTabId = null;
let currentPlatform = null;

let currentProblem = null;
let problemStartTime = null;


// 🔹 Get today's date key
function getTodayKey(){
  const today = new Date();
  return today.toISOString().split("T")[0];
}


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
    solved:currentProblem?.solved || false,
    timestamp: Date.now()
  });

  await chrome.storage.local.set({
    [todayKey]: sessions
  });

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

  console.log("🔴 Tracking stopped");
  console.log("Platform:", currentPlatform);
  console.log("Session time (seconds):", duration);

  // save problem time
  await saveProblemTime();

  const todayKey = getTodayKey();

  try{

    const result = await chrome.storage.local.get(todayKey);
    const sessions = result[todayKey] || [];

    sessions.push({
      type: "platform",
      platform: currentPlatform,
      start: startTime,
      end: endTime,
      duration: duration
    });

    await chrome.storage.local.set({
      [todayKey]: sessions
    });

    console.log("Session stored", sessions);

  }
  catch(error){
    console.error("Storage error", error);
  }

  isTracking = false;
  startTime = null;
  currentTabId = null;
  currentPlatform = null;
}


// 🔹 Handle tab change
async function handleTabChange(tabId) {

  try {

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

    } 
    else {
      await stopTracking();
    }

  } 
  catch (error) {
    console.error("Error:", error);
  }

}


// 🔹 When user switches tabs
chrome.tabs.onActivated.addListener((activeInfo) => {

  console.log("Tab activated:", activeInfo.tabId);
  handleTabChange(activeInfo.tabId);

});


// 🔹 When page URL updates
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {

  if (changeInfo.url) {
    handleTabChange(tabId);
  }

});


// 🔹 Idle detection
chrome.idle.onStateChanged.addListener(async (state) => {

  console.log("Idle state:", state);

  if (state === "idle" || state === "locked") {

    console.log("🛑 User idle for 15 minutes");
    await stopTracking();

  }

});


// 🔹 Listen for messages from content script
chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {

  if (message.type === "PROBLEM_DETECTED") {

    console.log("📌 Problem detected:", message.data);

    // save previous problem
    await saveProblemTime();

    // start new problem timer
    currentProblem ={
      ...message.data,
      solved:false
    };
    problemStartTime = Date.now();

    if(message.type==="PROBLEM_SOLVED"){
      console.log("✅ Problem solved");
    }

    if(currentProblem){
      currentProblem.solved=true;
    }

  }

});


// 🔹 Startup check
setTimeout(async () => {

  try {

    console.log("Checking active tab on startup...");

    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true
    });

    if (tab?.id) {
      handleTabChange(tab.id);
    }

  }
  catch (error) {
    console.warn("Startup tab check skipped:", error.message);
  }

}, 300);