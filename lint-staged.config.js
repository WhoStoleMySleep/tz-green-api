export default {
  "*.{js,ts,tsx}": ["eslint --fix", "prettier --write", "vitest related --run --passWithNoTests"],
  "src/**/*.css": "stylelint --fix --allow-empty-input",
  "!(*.{js,ts,tsx})": "prettier --write --ignore-unknown",
};
