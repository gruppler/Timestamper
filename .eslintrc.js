module.exports = {
  "env": {
    "browser": true
  },
  "extends": "eslint:recommended",
  "globals": {
    "require": false,
    "define": false,
    "saveAs": false
  },
  "rules": {
    "indent": [
      "error",
      2,
      {
        "SwitchCase": 1
      }
    ],
    "keyword-spacing": [
      "error"
    ],
    "linebreak-style": [
      "error",
      "unix"
    ],
    "no-unused-vars": "warn",
    "quotes": [
      "error",
      "single"
    ],
    "semi": [
      "error",
      "always"
    ],
    "space-in-parens": [
      "error",
      "never"
    ],
    "no-console": "off"
  }
};
