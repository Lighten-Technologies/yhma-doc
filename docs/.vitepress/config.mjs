import fs from "fs";
import { defineConfig } from "vitepress";

await import("./generateDocs.mjs");

const sideBar = JSON.parse(fs.readFileSync("docs/api-doc/sidebar.json", "utf-8"));

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "YHMA API",
  description: "A YHMA Documentaion",
  base: "/yhma-doc",
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    search: {
      provider: "local",
    },
    sidebar: sideBar,

    socialLinks: [
      { icon: "github", link: "https://github.com/Lighten-Technologies" },
      { icon: "homepage", link: "http://lighten-tech.co.kr/" },
    ],
  },
  ignoreDeadLinks: true,
});
