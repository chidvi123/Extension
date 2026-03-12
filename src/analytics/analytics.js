// Total Problems Detected

async function getTotalProblems() {
  const data = await chrome.storage.local.get(null)

  let total = 0

  Object.values(data).forEach(day => {
    day.forEach(session => {
      if (session.type === "problem") {
        total++
      }
    })
  })

  return total
}

//Total Coding Time
async function getTotalCodingTime() {

  const data = await chrome.storage.local.get(null)

  let totalTime = 0

  Object.values(data).forEach(day => {

    day.forEach(record => {

      if (record.type === "platform") {
        totalTime += record.duration
      }

    })

  })

  return totalTime
}


//Difficulty Distribution
async function getDifficultyStats() {

  const stats = {
    Easy: 0,
    Medium: 0,
    Hard: 0
  }

  const data = await chrome.storage.local.get(null)

  Object.values(data).forEach(day => {

    day.forEach(record => {

      if (record.type === "problem") {

        const difficulty = record.problem.difficulty

        if (stats[difficulty] !== undefined) {
          stats[difficulty]++
        }

      }

    })

  })

  return stats
}

//Topic Distribution

async function getTopicStats() {

  const topicCount = {}

  const data = await chrome.storage.local.get(null)

  Object.values(data).forEach(day => {

    day.forEach(record => {

      if (record.type === "problem") {

        record.problem.topics.forEach(topic => {

          topicCount[topic] = (topicCount[topic] || 0) + 1

        })

      }

    })

  })

  return topicCount
}

//Average Solve Time

async function getAverageSolveTime() {

  const data = await chrome.storage.local.get(null)

  let totalTime = 0
  let problemCount = 0

  Object.values(data).forEach(day => {

    day.forEach(record => {

      if (record.type === "problem") {
        totalTime += record.timeSpent
        problemCount++
      }

    })

  })

  return problemCount ? totalTime / problemCount : 0
}