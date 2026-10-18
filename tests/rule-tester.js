import { describe, it } from "node:test";
import typeScriptParser from "@typescript-eslint/parser";
import { RuleTester } from "eslint";

RuleTester.describe = describe;
RuleTester.it = it;
RuleTester.itOnly = it.only;

/** JavaScript のコードでルールを検査する RuleTester。 */
export const ruleTester = new RuleTester();

/** TypeScript のコードでルールを検査する RuleTester。 */
export const typeScriptRuleTester = new RuleTester({
  languageOptions: {
    parser: typeScriptParser,
  },
});
