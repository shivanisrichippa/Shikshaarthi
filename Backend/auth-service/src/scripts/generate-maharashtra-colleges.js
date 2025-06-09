//auth-service/src/scripts/generate-maharashtra-colleges.js
const fs = require("fs");
const path = require("path");
const indianColleges = require("indian-colleges");

const colleges = indianColleges.getCollegesByState("Maharashtra");

const dataDir = path.join(__dirname, "data");

// Create directory if it doesn't exist
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const filePath = path.join(dataDir, "maharashtra-colleges.json");

fs.writeFileSync(filePath, JSON.stringify(colleges, null, 2));

console.log(` Maharashtra colleges saved to ${filePath}`);
