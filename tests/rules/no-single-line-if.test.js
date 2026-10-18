import rule from "../../src/rules/no-single-line-if.js";
import { ruleTester, typeScriptRuleTester } from "../rule-tester.js";

const error = { messageId: "singleLine" };

ruleTester.run("no-single-line-if", rule, {
  valid: [
    "if (isValid) {\n  execute();\n}",
    "if (isValid) {\n}",
    "if (isValid) {\n  execute();\n} else {\n  handle();\n}",
    "if (isValid) {\n  execute();\n} else if (isOther) {\n  handle();\n}",
    "if (isValid)\n  execute();",
    "if (\n  isValid\n)\n  execute();",
  ],
  invalid: [
    { code: "if (isValid) { execute(); }", errors: [error] },
    { code: "if (isValid) {}", errors: [error] },
    { code: "if (isValid) execute();", errors: [error] },
    { code: "if (\n  isValid\n) execute();", errors: [error] },
    { code: "if (isValid) {\n  execute();\n} else { handle(); }", errors: [error] },
    { code: "if (isValid) {\n  execute();\n} else handle();", errors: [error] },
    { code: "if (isValid) { execute(); } else { handle(); }", errors: [error, error] },
    {
      code: "if (isValid) {\n  execute();\n} else if (isOther) { handle(); }",
      errors: [error],
    },
  ],
});

typeScriptRuleTester.run("no-single-line-if (TypeScript)", rule, {
  valid: ["if (value as boolean) {\n  execute();\n}"],
  invalid: [{ code: "if (value as boolean) { execute(); }", errors: [error] }],
});
