import rule from "../../src/rules/no-inline-svg.js";
import { jsxRuleTester, tsxRuleTester } from "../rule-tester.js";

const error = { messageId: "inlineSvg" };

jsxRuleTester.run("no-inline-svg", rule, {
  valid: [
    'const icon = <img src="./icon.svg" alt="" />;',
    "const icon = <img src={iconUrl} />;",
    "const icon = <Svg />;",
    "const icon = <Svg><path /></Svg>;",
    "const icon = <icons.svg />;",
    "const icon = <path />;",
    'const svg = "<svg></svg>";',
  ],
  invalid: [
    { code: "const icon = <svg />;", errors: [error] },
    {
      code: 'const icon = <svg viewBox="0 0 24 24"><path d="M0 0" /></svg>;',
      errors: [error],
    },
    {
      code: 'const icon = <svg><g><path d="M0 0" /></g><svg><circle r="1" /></svg></svg>;',
      errors: [error],
    },
    {
      code: "const button = <button><svg /><span>保存</span><svg /></button>;",
      errors: [error, error],
    },
    {
      code: "function Icon() { return isOpen ? <svg /> : null; }",
      errors: [error],
    },
  ],
});

tsxRuleTester.run("no-inline-svg (TypeScript)", rule, {
  valid: ['const icon: JSX.Element = <img src="./icon.svg" alt="" />;'],
  invalid: [{ code: "const icon: JSX.Element = <svg />;", errors: [error] }],
});
