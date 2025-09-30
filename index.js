import fetch from "node-fetch";
import jsonfile from "jsonfile";
import moment from "moment";
import simpleGit from "simple-git";
import random from "random";
// change the userbname to your own tchange just User-x-dev to your github username
const badgeURL = "https://visitor-badge.laobi.icu/badge?page_id=User-x-dev.User-x-dev&left_color=darkgoldenrod&right_color=darkgoldenrod&left_text=%20";

const visitsNeeded = 100;
const visitsLogPath = "./visitor.json";

const commitsCount = 5000;
const commitDataPath = "./commit.json";

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

async function simulateVisits(n) {
  let logData = [];
  try {
    logData = await jsonfile.readFile(visitsLogPath);
    if (!Array.isArray(logData)) logData = [];
  } catch {
    logData = [];
  }

  for (let i = 0; i < n; i++) {
    let visitLog = {
      visitNumber: i + 1,
      timestamp: new Date().toISOString(),
    };

    try {
      const res = await fetch(badgeURL);
      visitLog.status = res.status;
      if (res.ok) {
        visitLog.success = true;
        console.log(`✅ Visit ${i + 1}/${n} successful`);
      } else {
        visitLog.success = false;
        console.error(`❌ Visit ${i + 1} failed with status ${res.status}`);
      }
    } catch (err) {
      visitLog.success = false;
      visitLog.status = err.message;
      console.error(`❌ Visit ${i + 1} error:`, err);
    }

    logData.push(visitLog);

    await jsonfile.writeFile(visitsLogPath, logData, { spaces: 2 });

    await delay(100);
  }

  console.log("🎉 All visits done!");
}

async function makeCommits(n) {
  if (n <= 0) {
    await simpleGit().push();
    console.log("🎉 All commits pushed!");
    return;
  }

  const x = random.int(0, 54);
  const y = random.int(0, 6);
  const date = moment()
    .subtract(1, "y")
    .add(1, "d")
    .add(x, "w")
    .add(y, "d")
    .format();

  const data = { date };

  console.log(`Commit #${n}: ${date}`);

  await jsonfile.writeFile(commitDataPath, data);

  await simpleGit()
    .add([commitDataPath])
    .commit(date, { "--date": date });

  await makeCommits(n - 1);
}

async function run() {
  await simulateVisits(visitsNeeded);
  await makeCommits(commitsCount);
}

run();
