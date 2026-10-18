import rule from "../../src/rules/require-logical-expression-variable.js";
import { ruleTester, typeScriptRuleTester } from "../rule-tester.js";

const error = { messageId: "requireVariable" };

ruleTester.run("require-logical-expression-variable", rule, {
  valid: [
    "if (isLoggedIn && hasPermission) {}",
    "if (isLoggedIn || hasPermission) {}",
    "const canExecute = isLoggedIn && hasPermission && isActive;",
    "let canExecute; canExecute = isLoggedIn && hasPermission && isActive;",
    "const canExecute = !(isLoggedIn && hasPermission && isActive);",
    "class A { canExecute = isLoggedIn && hasPermission && isActive; }",
    "if (a ?? b ?? c) {}",
    "if (a && (b ?? c)) {}",
    "if (a && check(b && c)) {}",
    "if ((a && b) ?? (c || d)) {}",
  ],
  invalid: [
    { code: "if (isLoggedIn && hasPermission && isActive) {}", errors: [error] },
    { code: "if (a || b && c) {}", errors: [error] },
    { code: "if (a && (b || c)) {}", errors: [error] },
    { code: "if (a && !(b || c)) {}", errors: [error] },
    { code: "if (!(a && b && c)) {}", errors: [error] },
    { code: "while (a && b && c) {}", errors: [error] },
    { code: "do {} while (a && b && c);", errors: [error] },
    { code: "for (; a && b && c;) {}", errors: [error] },
    { code: "const value = a && b || c ? 1 : 2;", errors: [error] },
    { code: "function f() { return a && b && c; }", errors: [error] },
    { code: "execute(a && b && c);", errors: [error] },
    { code: "if (a && check(b && c && d)) {}", errors: [error] },
    { code: "if ((a && b && c) ?? d) {}", errors: [error] },
  ],
});

typeScriptRuleTester.run("require-logical-expression-variable (TypeScript)", rule, {
  valid: ["const canExecute: boolean = a && b && c;"],
  invalid: [{ code: "if ((a as boolean) && b && c) {}", errors: [error] }],
});
