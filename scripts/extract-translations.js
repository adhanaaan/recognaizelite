const readline = require("readline/promises");
const fs = require("fs");
const csv = require("csvtojson/v2");

const Languages = ["ENGLISH", "MANDARIN", "BAHASA", "MALAY", "TAGALOG", "MALAYALAM"];
const term = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});
async function main() {
  const path = await term.question("\nEnter translation file path(.csv)\n");

  const data = await csv().fromFile(path);
  const results = {};
  for (const item of data) {
    const category = item["CATEGORY"];
    const description = item["ENGLISH"];
    const result = {};
    if (category && description) {
      for (const lang of Languages) {
        result[lang] = item[lang];
      }
      if (category in results) {
        results[category][description] = result;
      } else {
        results[category] = { [description]: result };
      }
    } else {
      console.log("Skipping:", { category, description });
    }
  }
  for (const category in results) {
    fs.writeFileSync(`./src/locales/${category.replaceAll(" ", "_")}.json`, JSON.stringify(results[category], null, 2));
  }
  console.log("\nThank you\n");
}
main().catch(console.error).finally(term.close.bind(term));
