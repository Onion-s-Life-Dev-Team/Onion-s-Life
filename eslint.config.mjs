import globals from "globals";
import pluginJs from "@eslint/js";


export default [
  {
    // Generated output and vendored packages are not source code.
    ignores: ["dist/**", ".npm-cache/**", "node_modules/**", "pwabuilder-sw.js"],
  },
  {languageOptions: { globals: globals.browser }},
  pluginJs.configs.recommended,

    {
        rules: {
            "no-undef": "off"
        }
    }
];
