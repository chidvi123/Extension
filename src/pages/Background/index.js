console.log("🔥 Background script loaded");

// Idle detection (15 minutes)
chrome.idle.setDetectionInterval(900);

let isTracking = false;
let startTime = null;
let currentTabId = null;
let currentPlatform = null;

//getting today date

function getTodayKey(){
  const today=new Date();
  return today.toISOString().split("T")[0]
}

// Detect platform
function getPlatform(url) {
  if (!url) return null;

  if (url.includes("leetcode.com")) return "leetcode";
  if (url.includes("geeksforgeeks.org")) return "geeksforgeeks";

  return null;
}


// Start tracking
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


// Stop tracking
async function stopTracking() {
  if (!isTracking) return;

  const endTime=Date.now();
  const duration = Math.floor((endTime - startTime) / 1000);

  if(duration < 5){
    console.log("Ignored short session")

    isTracking=false;
    startTime=null;
    currentTabId=null;
    currentPlatform=null;
    return;
  }

  console.log("🔴 Tracking stopped");
  console.log("Platform:", currentPlatform);
  console.log("Session time (seconds):", duration);
  
  //get todays date
  const todayKey=getTodayKey();

  try{
    const result=await chrome.storage.local.get(todayKey);

    const sessions=result[todayKey] || [];

    sessions.push({
      platform:currentPlatform,
      start:startTime,
      end:endTime,
      duration:duration
    });

    await chrome.storage.local.set({
      [todayKey]:sessions
    });

    console.log("Session stored",sessions);
  }
  catch(error){
    console.error("Storage error",error);
  }

  isTracking = false;
  startTime = null;
  currentTabId = null;
  currentPlatform = null;
}


// Handle tab change
async function handleTabChange(tabId) {
  try {
    const tab = await chrome.tabs.get(tabId);

   if (!tab || tab.url?.startsWith("chrome://")){
    await stopTracking();
    return;
   }

    const platform = getPlatform(tab.url);

    if (platform) {

      // Start new tracking
      if (!isTracking) {
        startTracking(tabId, platform);
      }

      // Switch tab or platform
      else if (currentTabId !== tabId || currentPlatform !== platform) {
        await stopTracking();
        startTracking(tabId, platform);
      }

    } else {
      await stopTracking();
    }

  } catch (error) {
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


// 🔹 Startup check (when extension loads)
setTimeout(async () => {
  try {
    console.log("Checking active tab on startup...");

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