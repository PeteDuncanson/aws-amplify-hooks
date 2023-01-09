const fs = require("fs");
var path = require("path");

// Original source: https://github.com/PeteDuncanson/aws-amplify-hook

// WARNING: We do early exits in our script for various reasons, keep an eye out for those, we also need to make sure we exit with a non-zero code if we fail

const pathToDirectory = "amplify/backend/function";

// This needs to come from the args
const parameters = JSON.parse(fs.readFileSync(0, { encoding: "utf8" }));
const projectRootDir = parameters.data.amplify.environment.projectPath; // = "C:\\work\\preenandclean\\Franchise-Manager";

// Get all the functions in the directory sorted by newest first
const functionDirectories = fs
  .readdirSync(pathToDirectory, { withFileTypes: true })
  .filter((item) => item.isDirectory())
  .map((item) => {
    const filepath = path.join(pathToDirectory, item.name);
    return {
      name: item.name,
      filepath: filepath,
      meta: fs.statSync(filepath),
    };
  })
  .sort((a, b) => b.meta.birthtimeMs - a.meta.birthtimeMs)
  .map((item) => item);

if (functionDirectories.length === 0) {
  console.log("No functions found.");
  process.exit(1);
}

const latestFunction = functionDirectories[0];

// Only run if we are a JS function
const isNode = fs.existsSync(
  path.join(latestFunction.filepath, "src", "index.js")
);

if (!isNode) {
  console.log(
    "This hook only works with JS files so skipping as we can't find a src/index.js file"
  );
  process.exit(0);
}

// Don't setup a function twice!
const hasTypescript = fs.existsSync(
  path.join(latestFunction.filepath, "tsconfig.json")
);

if (hasTypescript) {
  console.log(
    "Function already has typescript so skipping setup of TS via this hook."
  );
  process.exit(0);
}

// Setup TypeScript

// Rename our index to make it ts friendly
const indexJsPath = path.join(latestFunction.filepath, "src", "index.js");
const indexTsPath = path.join(latestFunction.filepath, "src", "index.ts");
fs.renameSync(indexJsPath, indexTsPath);
console.info("Renamed index.js to index.ts");

// Copy the file over
const tsconfigPath = path.join(__dirname, "typescriptFiles", "tsconfig.json");
const tsconfigDestination = path.join(latestFunction.filepath, "tsconfig.json");
fs.copyFileSync(tsconfigPath, tsconfigDestination);
console.info(
  "Copied over default TypeScript config file to " + tsconfigDestination
);

// Add a new scripts entry to package.json in the applications root
const packageJsonPath = path.join(projectRootDir, "package.json");
const packageJson = JSON.parse(
  fs.readFileSync(packageJsonPath, { encoding: "utf8" })
);
const scriptsKey = "amplify:" + latestFunction.name;
const scriptCmd =
  "cd amplify/backend/function/" +
  latestFunction.name +
  " && tsc -p ./tsconfig.json";

if (packageJson.scripts === undefined) {
  package.scripts = {};
}
packageJson.scripts[scriptsKey] = scriptCmd;
fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
console.info("Added a new script to package.json: " + scriptsKey);

// Everything is done and good
process.exit(0);
