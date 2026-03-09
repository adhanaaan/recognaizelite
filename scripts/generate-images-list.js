const fs = require("fs");
const path = require("path");

function isImage(file) {
  const ext = path.extname(file);
  return ext === ".jpg" || ext === ".png" || ext === ".gif";
}

function getAllImages(dirPath) {
  const files = fs.readdirSync(dirPath);
  const images = [];

  for (const file of files) {
    const filePath = path.join(dirPath, file);
    const stats = fs.statSync(filePath);

    if (stats.isDirectory()) {
      images.push(...getAllImages(filePath));
    } else if (stats.isFile() && isImage(file)) {
      images.push(filePath);
    }
  }

  return images;
}

const Languages = ["ENGLISH", "BAHASA", "MANDARIN"];
const Images = {};
const imagesDir = path.join(__dirname, "..", "public", "images");
const dir = fs.readdirSync(imagesDir);
for (const folder of dir) {
  const folderPath = path.join(imagesDir, folder);
  Images[folder] = getAllImages(folderPath)
    .map((filePath) =>
      filePath
        .replace(folderPath, "")
        .replace(new RegExp(Languages.join("|"), "g"), "$lang")
        .replaceAll("\\", "/")
    )
    .filter((item, pos, a) => {
      return a.indexOf(item) == pos;
    });
}

fs.writeFileSync("./src/constants/IMAGES.json", JSON.stringify(Images));
