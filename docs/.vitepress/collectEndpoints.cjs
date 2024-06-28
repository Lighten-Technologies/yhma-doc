const fs = require("fs");
const path = require("path");
const yaml = require("yaml");

const basePath = path.join(__dirname, "docs", "knowledge-base");
const outputFilePath = path.join(__dirname, "docs", "collectedExamples.yml");

const collectExamples = (basePath) => {
  const result = [];

  const walkDirectory = (dir) => {
    const files = fs.readdirSync(dir);

    files.forEach((file) => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);

      if (stat.isDirectory()) {
        walkDirectory(filePath);
      } else if (file === "examples.yml") {
        const content = fs.readFileSync(filePath, "utf-8");
        const data = yaml.parse(content);
        result.push({
          version: path.basename(path.dirname(filePath)),
          filePath: filePath.replace(__dirname, ""),
          examples: data.examples,
        });
      }
    });
  };

  walkDirectory(basePath);

  return result;
};

const saveCollectedExamples = (data, outputPath) => {
  const yamlContent = yaml.stringify(data);
  fs.writeFileSync(outputPath, yamlContent, "utf-8");
};

const examples = collectExamples(basePath);
saveCollectedExamples(examples, outputFilePath);

console.log("Examples collected successfully:", outputFilePath);
