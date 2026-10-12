module.exports = {
  disableEmoji: true,
  format: "{type}{scope}: {subject}",
  list: ["feat", "fix", "test", "refactor", "style", "perf", "docs", "chore"],
  maxMessageLength: 64,
  minMessageLength: 3,
  questions: ["type", "scope", "subject"],
  scopes: [],
  types: {
    feat: { description: "Новая функциональность", value: "feat" },
    fix: { description: "Исправление ошибки", value: "fix" },
    test: { description: "Тесты", value: "test" },
    refactor: { description: "Рефакторинг без изменения поведения", value: "refactor" },
    style: { description: "Форматирование, стили кода", value: "style" },
    perf: { description: "Производительность", value: "perf" },
    docs: { description: "Документация", value: "docs" },
    chore: { description: "Сборка, зависимости, инфраструктура", value: "chore" },
  },
};
