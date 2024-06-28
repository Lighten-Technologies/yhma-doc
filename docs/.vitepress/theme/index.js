// .vitepress/theme/index.js
import DefaultTheme from "vitepress/theme";
import MyLayout from "./theme-default/Layout.vue";

import RestfulTester from "./restful-tester/RestfulTester.vue";

export default {
  extends: DefaultTheme,
  // override the Layout with a wrapper component that
  // injects the slots
  Layout: MyLayout,
  enhanceApp({ app, router, siteData }) {
    // app is an instance of Vue
    app.component("RestfulTester", RestfulTester);
  },
};
