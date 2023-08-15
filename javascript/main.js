const fs = require("fs");

function init() {
  console.log("Parsing Tyler Report...\n");

  const tylerReport = parseTylerReport();

  console.log("Parsing Master Sheet...\n");

  const masterSheet = parseMasterSheet();

  console.log("Mapping tyler report to an object...");

  const tylerObj = mapTylerReport(tylerReport);

  console.log("Comparing...");
  compareReports(tylerObj, masterSheet);
}

// Function purpose: Converts the tyler TXT report into an array of arrays with data that can be compared in JS.
// Params: N/A
// Return: string[][]
//Output format
// [User(0), Location(1), Role(2), Effective(3), Obsolete(4), Right Type(5), Right Group(6), Right Action(7), Access(8)]
function parseTylerReport() {
  let results;
  try {
    // const data = fs.readFileSync("./input/testTyler.txt", "utf-8");
    const data = fs.readFileSync("./input/cmBApRightsTyler.txt", "utf-8");

    const parentArr = data.split("\r\n");

    const childArr = parentArr.map(function (el) {
      const quotesRemoved = el.replace(/["]+/g, "");

      return quotesRemoved.split(",");
    });

    results = childArr;
  } catch (error) {
    console.log(error);
  }
  return results;
}

// Function purpose: Converts the AOC Master Rights and Roles csv report into an array of arrays with data that can be compared in JS.
// Params: N/A
// Return: string[][]
function parseMasterSheet() {
  let results;
  try {
    // const data = fs.readFileSync("./input/test.csv", "utf-8");
    const data = fs.readFileSync("./input/cmRightsRoles.csv", "utf-8");

    //create array by seperating new lines
    const parentArr = data.split("\r\n");

    const childArr = parentArr.map(function (el) {
      return el.split(",");
    });

    results = childArr;
  } catch (error) {
    console.log(error);
  }
  return results;
}

// Function purpose: Converts the tyler array into an object.
// Interface: resultObj {
//   rightDescType: string,
// }
// Params: string[][]
// Return: resultObj
function mapTylerReport(arr) {
  let tylerObj = {};
  for (let i = 0; i < arr.length; i++) {
    const currentRight = arr[i];
    const rightDesc = currentRight[6]?.toLowerCase().trim();
    const rightAction = currentRight[7]?.toLowerCase().trim();
    const rightAccess = currentRight[9]?.trim();
    const tylerObjKey = rightDesc + rightAction;
    tylerObj[tylerObjKey] = rightAccess;
  }
  return tylerObj;
}

// Function purpose: Compares the mapped tyler object to the masterReport array to simplify complexity.
// Interface: paramTyler {
//   rightDescType: string,
// }
// Params: tylerObj: paramTyler, masterReport: string[][]
// Return: Void (some time in future I think it will generate a readme with the report)
//Currently built to test fixed role, will be refactored to support user choice of role.
function compareReports(tylerObj, masterReport) {
  const selectedRoleIndex = 4;
  let rightsCompared = 0;
  let discrepanciesFound = 0;
  let untrackedRights = 0;
  let currentDescription;

  for (let i = 0; i < masterReport.length; i++) {
    const currentMasterRight = masterReport[i];
    const masterRightAction = currentMasterRight[2]?.trim();
    const masterRightAccess = currentMasterRight[selectedRoleIndex];
    let masterRightDescription;
    if (currentMasterRight[1]) {
      masterRightDescription = currentMasterRight[1].trim();
      currentDescription = currentMasterRight[1].trim();
    } else if (masterRightAction) {
      masterRightDescription = currentDescription;
    } else {
      masterRightDescription = "";
    }

    //Only run comparison if the current line of the report has content
    if (masterRightDescription || masterRightAction) {
      const masterRightKey =
        masterRightDescription.toLowerCase() + masterRightAction?.toLowerCase();

      if (masterRightAccess === "x" && tylerObj[masterRightKey] === "Granted") {
        rightsCompared++;
      } else if (
        masterRightAccess !== "x" &&
        tylerObj[masterRightKey] === "Not Granted"
      ) {
        rightsCompared++;
      } else if (!tylerObj[masterRightKey]) {
        untrackedRights++;
        if (untrackedRights < 2) {
          console.log(`UNTRACKED RIGHT:
          The Master right "${masterRightDescription}, ${masterRightAction}" was not found in Tyler's report.`);
        }
      } else {
        rightsCompared++;
        discrepanciesFound++;
        if (discrepanciesFound < 20) {
          console.log(`DISCREPANCY:
        Master Right: ${masterRightDescription}
        Master Action: ${masterRightAction}
        Master Access: ${masterRightAccess === "x" ? "Granted" : "Not Granted"}
        Tyler Report Access: ${tylerObj[masterRightKey]}`);
        }
      }
    }
  }

  console.log("\r\nRights Compared: " + rightsCompared);
  console.log("Discrepancies Found: " + discrepanciesFound);
  console.log("Untracked Rights: " + untrackedRights);
}

init();
