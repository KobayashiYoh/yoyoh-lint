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
    {
      code: "if (isValid) { execute(); }",
      output: "if (isValid) {\n  execute();\n}",
      errors: [error],
    },
    { code: "if (isValid) {}", output: "if (isValid) {\n}", errors: [error] },
    {
      code: "if (isValid) execute();",
      output: "if (isValid)\n  execute();",
      errors: [error],
    },
    {
      code: "if (\n  isValid\n) execute();",
      output: "if (\n  isValid\n)\n  execute();",
      errors: [error],
    },
    {
      code: "if (isValid) {\n  execute();\n} else { handle(); }",
      output: "if (isValid) {\n  execute();\n} else {\n  handle();\n}",
      errors: [error],
    },
    {
      code: "if (isValid) {\n  execute();\n} else handle();",
      output: "if (isValid) {\n  execute();\n} else\n  handle();",
      errors: [error],
    },
    {
      code: "if (isValid) { execute(); } else { handle(); }",
      output: "if (isValid) {\n  execute();\n} else {\n  handle();\n}",
      errors: [error, error],
    },
    {
      code: "if (isValid) execute(); else handle();",
      output: "if (isValid)\n  execute(); else\n  handle();",
      errors: [error, error],
    },
    {
      code: "if (isValid) {\n  execute();\n} else if (isOther) { handle(); }",
      output: "if (isValid) {\n  execute();\n} else if (isOther) {\n  handle();\n}",
      errors: [error],
    },
    {
      code: "if (isValid) { execute(); } else if (isOther) { handle(); } else { fallback(); }",
      output:
        "if (isValid) {\n  execute();\n} else if (isOther) {\n  handle();\n} else {\n  fallback();\n}",
      errors: [error, error, error],
    },
    {
      code: "if (a) { b(); c(); }",
      output: "if (a) {\n  b();\n  c();\n}",
      errors: [error],
    },
    {
      code: "function run() {\n  if (a) { b(); c(); }\n}",
      output: "function run() {\n  if (a) {\n    b();\n    c();\n  }\n}",
      errors: [error],
    },
    {
      code: "function run() {\n  if (a) b();\n}",
      output: "function run() {\n  if (a)\n    b();\n}",
      errors: [error],
    },
    {
      code: "function run() {\n  if (a) {}\n}",
      output: "function run() {\n  if (a) {\n  }\n}",
      errors: [error],
    },
    {
      code: "function run() {\n  if (a) {\n    b();\n  } else { c(); }\n}",
      output: "function run() {\n  if (a) {\n    b();\n  } else {\n    c();\n  }\n}",
      errors: [error],
    },
    {
      code: "if (isValid) execute({\n  a: 1,\n});",
      output: "if (isValid)\n  execute({\n  a: 1,\n});",
      errors: [error],
    },
    {
      code: "if (isValid) { /* 説明 */ execute(); }",
      output: null,
      errors: [error],
    },
    { code: "if (isValid) { /* 空 */ }", output: null, errors: [error] },
    {
      code: "if (isValid) /* 説明 */ execute();",
      output: null,
      errors: [error],
    },
    {
      code: "if (isValid) { /* 説明 */ execute(); } else { handle(); }",
      output: "if (isValid) { /* 説明 */ execute(); } else {\n  handle();\n}",
      errors: [error, error],
    },
  ],
});

typeScriptRuleTester.run("no-single-line-if (TypeScript)", rule, {
  valid: ["if (value as boolean) {\n  execute();\n}"],
  invalid: [
    {
      code: "if (value as boolean) { execute(); }",
      output: "if (value as boolean) {\n  execute();\n}",
      errors: [error],
    },
    {
      code: "if (value as boolean) execute<string>();",
      output: "if (value as boolean)\n  execute<string>();",
      errors: [error],
    },
    {
      code: "if (value as boolean) { const result: number = execute(); } else { handle(); }",
      output:
        "if (value as boolean) {\n  const result: number = execute();\n} else {\n  handle();\n}",
      errors: [error, error],
    },
  ],
});
