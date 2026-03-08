console.log("Content script loaded");

// Detect which platform the page belongs to
function detectPlatform() {

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


// Extract difficulty from the page
function extractDifficulty() {

  const difficultyMatch = document.body.innerText.match(/\b(Easy|Medium|Hard)\b/);

  return difficultyMatch ? difficultyMatch[0] : null;
}


// Extract LeetCode problem information
function extractLeetCodeProblem() {

  const url = window.location.href;

  // Extract slug from URL
  const slug = url.split("/problems/")[1]?.split("/")[0];

  if (!slug) {
    console.log("Problem slug not found");
    return null;
  }

  // Convert slug → readable title
  const title = slug
    .split("-")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  const difficulty = extractDifficulty();

  console.log("Problem Title:", title);
  console.log("Difficulty:", difficulty);

  return {
    title: title,
    difficulty: difficulty,
    platform: "leetcode",
    url: url
  };
}


// Main logic
const platform = detectPlatform();

if (platform === "leetcode") {

  // Wait for LeetCode page to fully render
  setTimeout(() => {

    const problemData = extractLeetCodeProblem();

    console.log("Extracted Problem Data:", problemData);

  }, 2000);
}