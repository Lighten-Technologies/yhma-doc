import ejs from "ejs";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import yaml from "yaml";

// 현재 모듈의 URL을 파일 경로로 변환
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 템플릿 파일 읽기
const moduleInfoTemplate = path.join(__dirname, "moduleInfo.ejs");
const versionInfoTemplate = path.join(__dirname, "versionInfoTemplate.ejs");
const apiDocTemplate = path.join(__dirname, "apiDocTemplate.ejs");
const schemaTemplate = path.join(__dirname, "schemaTemplate.ejs");

const basePath = path.join(__dirname, "../", "knowledge-base");
const outputBasePath = path.join(__dirname, "../", "api-doc");

// sidebarOutput
const sidebarOutput = [];

function makeVersionDirToDoc(moduleName, versionDir) {
  const items = [];

  const version = path.basename(versionDir);
  const files = fs.readdirSync(versionDir);

  const versionInfo = yaml.parse(fs.readFileSync(path.join(versionDir, "info.yml"), "utf-8"));

  items.push({
    module: moduleName,
    version: version,
    method: [],
    todo: false,
    text: version,
    link: `/api-doc/${moduleName}/${version}`,
  });

  const docFiles = fs.readdirSync(path.join(versionDir, "doc"));
  const docEndPoints = docFiles.reduce((acc, curr, index, array) => {
    const docFilePath = path.join(versionDir, "doc", curr);
    const docContent = fs.readFileSync(docFilePath, "utf-8");

    try {
      const docData = yaml.parse(docContent).endpoints;
      acc.push(...docData);
      return acc;
    } catch (e) {
      console.error(e);
    }
  }, []);

  // 스키마 정리
  let schemaEndPoints = [];
  if (fs.existsSync(path.join(versionDir, "schema"))) {
    const schemaFiles = fs.readdirSync(path.join(versionDir, "schema"));
    schemaEndPoints = schemaFiles.reduce((acc, curr, index, array) => {
      const schemaFilePath = path.join(versionDir, "schema", curr);
      const schemaContent = fs.readFileSync(schemaFilePath, "utf-8");

      try {
        const schemaData = schemaContent;
        acc.push({
          schemaName: curr,
          schemaData,
        });
      } catch (e) {
        console.error(e);
      }
      return acc;
    }, []);
  }

  // write apiDoc
  try {
    // version Info write
    try {
      fs.mkdirSync(path.join(outputBasePath, moduleName, version), { recursive: true });
      ejs.renderFile(versionInfoTemplate, { versionInfo }, (err, str) => {
        if (err) {
          console.error(err);
        } else {
          fs.writeFileSync(
            path.join(outputBasePath, moduleName, version, "index.md"),
            str,
            "utf-8"
          );
        }
      });
    } catch (e) {
      console.error(e);
    }

    // schema write
    try {
      fs.mkdirSync(path.join(outputBasePath, moduleName, version, "schema"), {
        recursive: true,
      });

      ejs.renderFile(schemaTemplate, { moduleName, version, schemaEndPoints }, (err, str) => {
        if (err) {
          console.error(err);
        } else {
          fs.writeFileSync(
            path.join(outputBasePath, moduleName, version, "schema", "index.md"),
            str,
            "utf-8"
          );
        }
      });
    } catch (e) {
      console.error(e);
    }

    // documents write
    const docEndPointsByPath = docEndPoints.reduce((acc, curr, index, array) => {
      if (acc[curr.path]) {
        acc[curr.path][curr.method] = curr;
      } else {
        acc[curr.path] = {
          [curr.method]: curr,
        };
      }
      return acc;
    }, {});

    Object.keys(docEndPointsByPath).forEach((apiPath) => {
      console.log(moduleName + " | " + version + " | " + apiPath);

      const endPoint = docEndPointsByPath[apiPath];
      try {
        fs.mkdirSync(path.join(outputBasePath, moduleName, version, apiPath), {
          recursive: true,
        });

        ejs.renderFile(apiDocTemplate, { moduleName, version, apiPath, endPoint }, (err, str) => {
          if (err) {
            console.error(err);
          } else {
            fs.writeFileSync(
              path.join(outputBasePath, moduleName, version, apiPath, "index.md"),
              str,
              "utf-8"
            );
          }
        });
      } catch (e) {
        console.error(e);
      }
      // make items
      items.push({
        module: moduleName,
        version: version,
        method: Object.keys(endPoint),
        todo:
          (endPoint?.GET?.todo ?? false) ||
          (endPoint?.POST?.todo ?? false) ||
          (endPoint?.PUT?.todo ?? false) ||
          (endPoint?.DELETE?.todo ?? false),
        text: apiPath,
        link: `/api-doc/${moduleName}/${version}${apiPath}`,
      });
    });
  } catch (e) {
    console.error(e);
  }

  return items;
}

function makeVersionInfo(moduleName, versionDir) {}

function makeModuleInfo(moduleName, modulePath, versionList) {
  const moduleInfo = yaml.parse(fs.readFileSync(path.join(modulePath, "moduleInfo.yml"), "utf-8"));
  ejs.renderFile(moduleInfoTemplate, { moduleName, moduleInfo, versionList }, (err, str) => {
    if (err) {
      console.error(err);
    } else {
      //touch dir
      fs.mkdirSync(path.join(outputBasePath, moduleName), { recursive: true });
      fs.writeFileSync(path.join(outputBasePath, moduleName, "index.md"), str, "utf-8");
    }
  });

  return {
    text: moduleName,
    module: moduleName,
    versionList: versionList,
    items: [],
  };
}

const removeAllDir = (dir) => {
  if (fs.existsSync(dir)) {
    const files = fs.readdirSync(dir);
    files.forEach((file) => {
      const curPath = path.join(dir, file);
      if (fs.lstatSync(curPath).isDirectory()) {
        removeAllDir(curPath);
      } else {
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(dir);
  }
};

const processDirectory = (dir, cb) => {
  const modules = fs.readdirSync(dir);

  modules.forEach((module) => {
    const modulePath = path.join(dir, module);
    const stat = fs.statSync(modulePath);

    const moduleName = module;
    console.log(moduleName);

    // read inside directory
    if (stat.isDirectory()) {
      const files = fs.readdirSync(modulePath);
      const versionList = files.filter((file) => {
        return fs.statSync(path.join(modulePath, file)).isDirectory();
      });

      // make moduleInfo
      const moduleInfo = makeModuleInfo(moduleName, modulePath, versionList);
      versionList.forEach((versionDir) => {
        const versionPath = path.join(modulePath, versionDir);
        const stat = fs.statSync(versionPath);
        if (stat.isDirectory()) {
          moduleInfo.items.push(...makeVersionDirToDoc(moduleName, versionPath));
        }
      });
      sidebarOutput.push(moduleInfo);
    }
  });
  cb();
};

// 스크립트 실행
removeAllDir(outputBasePath);
processDirectory(basePath, () => {
  fs.writeFileSync(
    path.join(outputBasePath, "sidebar.json"),
    JSON.stringify(sidebarOutput, null, 2),
    "utf-8"
  );
});
