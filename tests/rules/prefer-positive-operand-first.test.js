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
    { code: "if (!isDeleted && isActive) {}", errors: [error] },
    { code: "if (!isDeleted || isActive) {}", errors: [error] },
    { code: "if (isVisible && !isDeleted && isActive) {}", errors: [error] },
    { code: "if (!user.isDeleted && user.isActive) {}", errors: [error] },
    { code: "if (!this.isDeleted && this.isActive) {}", errors: [error] },
    { code: "if (!isDeleted && isActive || isAdmin) {}", errors: [error] },
    { code: "if (isAdmin || !isDeleted && isActive) {}", errors: [error] },
    { code: "if (!(!isDeleted && isActive)) {}", errors: [error] },
    { code: "while (!isDone && isRunning) {}", errors: [error] },
    { code: "const value = !isDeleted && isActive ? 1 : 2;", errors: [error] },
  ],
});

typeScriptRuleTester.run("prefer-positive-operand-first (TypeScript)", rule, {
  valid: ["if (isActive && !isDeleted) {}"],
  invalid: [{ code: "if (!user.isDeleted && user.isActive) {}", errors: [error] }],
});
