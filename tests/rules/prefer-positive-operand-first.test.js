import rule from "../../src/rules/prefer-positive-operand-first.js";
import { ruleTester, typeScriptRuleTester } from "../rule-tester.js";

const error = { messageId: "negatedFirst" };

ruleTester.run("prefer-positive-operand-first", rule, {
  valid: [
    "if (isActive && !isDeleted) {}",
    "if (isActive || !isDeleted) {}",
    "if (!isDeleted) {}",
    "if (!isDeleted && !isArchived) {}",
    "if (isActive && isVisible) {}",
    "if (!user || user.isAdmin) {}",
    "if (!user?.profile || user.profile.isPublic) {}",
    "if (!items[0] || items[0].isEmpty) {}",
    "if (!isDeleted && isActive()) {}",
    "if (!isDeleted && items[index]) {}",
    "const canExecute = !isDeleted && isActive;",
    "execute(!isDeleted && isActive);",
    "if ((!isDeleted && isActive) ?? fallback) {}",
    "if (!user && isGuest && user.name) {}",
  ],
  invalid: [
    { code: "if (!isDeleted && isActive) {}", output: "if (isActive && !isDeleted) {}", errors: [error] },
    { code: "if (!isDeleted || isActive) {}", output: "if (isActive || !isDeleted) {}", errors: [error] },
    {
      code: "if (isVisible && !isDeleted && isActive) {}",
      output: "if (isVisible && isActive && !isDeleted) {}",
      errors: [error],
    },
    {
      code: "if (!user.isDeleted && user.isActive) {}",
      output: "if (user.isActive && !user.isDeleted) {}",
      errors: [error],
    },
    {
      code: "if (!this.isDeleted && this.isActive) {}",
      output: "if (this.isActive && !this.isDeleted) {}",
      errors: [error],
    },
    {
      code: "if (!isDeleted && isActive || isAdmin) {}",
      output: "if (isActive && !isDeleted || isAdmin) {}",
      errors: [error],
    },
    {
      code: "if (isAdmin || !isDeleted && isActive) {}",
      output: "if (isAdmin || isActive && !isDeleted) {}",
      errors: [error],
    },
    { code: "if (!(!isDeleted && isActive)) {}", output: "if (!(isActive && !isDeleted)) {}", errors: [error] },
    { code: "while (!isDone && isRunning) {}", output: "while (isRunning && !isDone) {}", errors: [error] },
    {
      code: "const value = !isDeleted && isActive ? 1 : 2;",
      output: "const value = isActive && !isDeleted ? 1 : 2;",
      errors: [error],
    },
    { code: "if (!a && b && !c && d) {}", output: "if (b && d && !a && !c) {}", errors: [error] },
    { code: "if (!a || b || !c || d) {}", output: "if (b || d || !a || !c) {}", errors: [error] },
    { code: "if (a && (!b && c)) {}", output: "if (a && c && !b) {}", errors: [error] },
    {
      code: "if (!user?.isDeleted && user?.isActive) {}",
      output: "if (user?.isActive && !user?.isDeleted) {}",
      errors: [error],
    },
    {
      code: "const value = !isDone && isRunning || isForced ? 1 : 2;",
      output: "const value = isRunning && !isDone || isForced ? 1 : 2;",
      errors: [error],
    },
    { code: "if (!isDeleted /* 削除済み */ && isActive) {}", output: null, errors: [error] },
    { code: "if (!isDeleted &&\n  // 有効なもの\n  isActive) {}", output: null, errors: [error] },
    { code: "if (a && (/* 補足 */ !b && c)) {}", output: null, errors: [error] },
  ],
});

typeScriptRuleTester.run("prefer-positive-operand-first (TypeScript)", rule, {
  valid: ["if (isActive && !isDeleted) {}"],
  invalid: [
    {
      code: "if (!user.isDeleted && user.isActive) {}",
      output: "if (user.isActive && !user.isDeleted) {}",
      errors: [error],
    },
    {
      code: "function check(user: User): void { if (!user?.isDeleted && user?.isActive) {} }",
      output: "function check(user: User): void { if (user?.isActive && !user?.isDeleted) {} }",
      errors: [error],
    },
    {
      code: "const value: number = !isDeleted && isActive && !isArchived && isVisible ? 1 : 2;",
      output: "const value: number = isActive && isVisible && !isDeleted && !isArchived ? 1 : 2;",
      errors: [error],
    },
  ],
});
