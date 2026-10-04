import js from "@eslint/js";
import globals from "globals";

export default [
  { ignores: ["node_modules/**", "worker/**"] },
  js.configs.recommended,
  {
    files: ["**/*.js"],
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: "script",
      globals: { ...globals.browser, gsap: "readonly", confetti: "readonly" },
    },
    rules: {
      // Projekt sdílí globály mezi soubory (klasické <script>), proto tato pravidla vypnuta:
      "no-undef": "off",
      "no-unused-vars": "off",
      "no-empty": "off",
      "no-useless-escape": "off",
      "no-inner-declarations": "off",
      "no-prototype-builtins": "off",
      "no-cond-assign": "off",
      "no-sequences": "off",
      "no-unsafe-optional-chaining": "off",
      "no-self-assign": "off",
      "no-constant-condition": "off",
      "no-extra-boolean-cast": "off",
      "no-redeclare": "error",
      "no-dupe-keys": "error",
      "no-unreachable": "error",
      "eqeqeq": ["warn", "smart"],
    },
  },
  { files: ["eslint.config.js", "tests/**"], languageOptions: { sourceType: "module", globals: { ...globals.node } }, rules: { "no-undef": "off" } },
];
