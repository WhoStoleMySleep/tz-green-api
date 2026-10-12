/** @type {import("stylelint").Config} */
export default {
  extends: ["stylelint-config-standard", "stylelint-config-recess-order"],
  rules: {
    "order/order": ["custom-properties", "declarations", "rules", "at-rules"],
    "selector-class-pattern": null,
    "no-descending-specificity": null,
    "import-notation": null,
  },
};
