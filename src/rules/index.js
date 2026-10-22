import noInlineSvg from "./no-inline-svg.js";
import noSingleLineIf from "./no-single-line-if.js";
import preferPositiveOperandFirst from "./prefer-positive-operand-first.js";
import requireLogicalExpressionVariable from "./require-logical-expression-variable.js";
import requireNamedArguments from "./require-named-arguments.js";

/**
 * プラグインが提供する独自ルール。キーがルール名になる。
 * @type {Record<string, import("eslint").Rule.RuleModule>}
 */
export const rules = {
  "no-inline-svg": noInlineSvg,
  "no-single-line-if": noSingleLineIf,
  "prefer-positive-operand-first": preferPositiveOperandFirst,
  "require-logical-expression-variable": requireLogicalExpressionVariable,
  "require-named-arguments": requireNamedArguments,
};
