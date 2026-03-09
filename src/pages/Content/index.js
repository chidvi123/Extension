console.log("Content script loaded");

/* =========================
   PLATFORM DETECTION
========================= */

function getCurrentPlatform() {

  const url = window.location.href;

  if (url.includes("leetcode.com/problems/")) {
    console.log("LeetCode problem page detected");
    return "leetcode";
  }

  if (url.includes("geeksforgeeks.org/problems/")) {
    console.log("GeeksforGeeks problem page detected");
    return "geeksforgeeks";
  }

  return null;
}


/* =========================
   TITLE FROM URL
========================= */

function getProblemTitleFromURL() {

  const url = window.location.href;

  let slug = url.split("/problems/")[1]?.split("/")[0];

  if (!slug) return null;

  // remove trailing numbers (GFG issue)
  slug = slug.replace(/[0-9]+$/, "");

  const title = slug
    .split("-")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  return title;
}


/* =========================
   DIFFICULTY
========================= */

function getLeetCodeDifficulty() {

  const match = document.body.innerText.match(/\b(Easy|Medium|Hard)\b/);

  return match ? match[0] : null;
}

function getGFGDifficulty() {

  const text = document.body.innerText;

  const match = text.match(/Difficulty\s*:\s*(Easy|Medium|Hard|Basic|Moderate)/i);

  return match ? match[1] : null;
}


/* =========================
   LEETCODE TOPICS
========================= */

function getLeetCodeTopics() {

  const topicLinks = document.querySelectorAll('a[href*="/tag/"]');

  const topics = [];

  topicLinks.forEach(link => {

    const topic = link.innerText.trim();

    if (topic && !topics.includes(topic)) {
      topics.push(topic);
    }

  });

  console.log("Topics:", topics);

  return topics;
}


/* =========================
   GFG TOPICS (OPEN DROPDOWN)
========================= */

function getGFGTopics() {

  const topics = [];

  // find the "Topic Tags" header
  const headers = document.querySelectorAll("strong");

  let topicHeader = null;

  headers.forEach(h => {
    if (h.innerText.trim() === "Topic Tags") {
      topicHeader = h;
    }
  });

  if (!topicHeader) return topics;

  // find the accordion container
  const accordion = topicHeader.closest('[class*="accordion"]');

  if (!accordion) return topics;

  // open dropdown if closed
  const dropdownBtn = accordion.querySelector("button");

  if (dropdownBtn) {
    dropdownBtn.click();
  }

  // wait for tags to render
  const tagElements = accordion.querySelectorAll("a, span");

  tagElements.forEach(el => {

    const text = el.innerText.trim();

    if (
      text &&
      text !== "Topic Tags" &&
      text.length < 30 &&
      !topics.includes(text)
    ) {
      topics.push(text);
    }

  });

  console.log("Topics:", topics);

  return topics;
}

/* =========================
   LEETCODE DATA
========================= */

function extractLeetCodeProblemData() {

  const title = getProblemTitleFromURL();
  const difficulty = getLeetCodeDifficulty();
  const topics = getLeetCodeTopics();
  const url = window.location.href;

  console.log("Problem Title:", title);
  console.log("Difficulty:", difficulty);

  return {
    title,
    difficulty,
    topics,
    platform: "leetcode",
    url
  };
}


/* =========================
   GFG DATA
========================= */

function extractGFGProblemData() {

  const title = getProblemTitleFromURL();
  const difficulty = getGFGDifficulty();
  const topics = getGFGTopics();
  const url = window.location.href;

  console.log("Problem Title:", title);
  console.log("Difficulty:", difficulty);

  return {
    title,
    difficulty,
    topics,
    platform: "geeksforgeeks",
    url
  };
}


/* =========================
   MAIN LOGIC
========================= */

const platform = getCurrentPlatform();

if (platform === "leetcode") {

  setTimeout(() => {

    const problemData = extractLeetCodeProblemData();

    if (problemData) {
      chrome.runtime.sendMessage({
        type: "PROBLEM_DETECTED",
        data: problemData
      });
    }

  }, 4000);
}


if (platform === "geeksforgeeks") {

  setTimeout(() => {

    const problemData = extractGFGProblemData();

    if (problemData) {
      chrome.runtime.sendMessage({
        type: "PROBLEM_DETECTED",
        data: problemData
      });
    }

  }, 4000);
}