/** 個数を数える対象の論理演算子。 */
const COUNTED_OPERATORS = new Set(["&&", "||"]);

/** 説明変数に格納せずに使える論理演算子の最大個数。 */
const MAX_OPERATORS_WITHOUT_VARIABLE = 1;

/**
 * 個数を数える対象の論理式かを判定する。
 * @param {import("estree").Node} node
 * @returns {boolean}
 */
function isCountedLogicalExpression(node) {
  return node.type === "LogicalExpression" && COUNTED_OPERATORS.has(node.operator);
}

/**
 * 否定演算子の式かを判定する。
 * @param {import("estree").Node} node
 * @returns {boolean}
 */
function isNegation(node) {
  return node.type === "UnaryExpression" && node.operator === "!";
}

/**
 * 否定や論理演算子でつながった式に含まれる && と || の個数を数える。
 * @param {import("estree").Node} node
 * @returns {number}
 */
function countOperators(node) {
  if (isCountedLogicalExpression(node)) {
    return 1 + countOperators(node.left) + countOperators(node.right);
  }

  if (isNegation(node)) {
    return countOperators(node.argument);
  }

  return 0;
}

/**
 * 式がそのまま変数やプロパティに格納されているかを判定する。
 * @param {import("estree").Node} node
 * @returns {boolean}
 */
function isStoredInVariable(node) {
  const { parent } = node;

  switch (parent.type) {
    case "VariableDeclarator":
      return parent.init === node;
    case "AssignmentExpression":
      return parent.right === node;
    case "PropertyDefinition":
      return parent.value === node;
    default:
      return false;
  }
}

/**
 * && と || を合わせて2つ以上含む論理式を、説明変数に格納せずに使うことを禁止するルール。
 * @type {import("eslint").Rule.RuleModule}
 */
export default {
  meta: {
    type: "suggestion",
    docs: {
      description: "&& と || を合わせて2つ以上含む論理式を説明変数に格納させる",
    },
    schema: [],
    messages: {
      requireVariable:
        "&& と || を合わせて2つ以上含む論理式は、意味のある名前の変数に格納してから使ってください。",
    },
  },
  create(context) {
    return {
      LogicalExpression(node) {
        if (!isCountedLogicalExpression(node)) {
          return;
        }

        let outermost = node;

        while (isNegation(outermost.parent)) {
          outermost = outermost.parent;
        }

        if (isCountedLogicalExpression(outermost.parent)) {
          return;
        }

        const isWithinLimit = countOperators(node) <= MAX_OPERATORS_WITHOUT_VARIABLE;

        if (isWithinLimit || isStoredInVariable(outermost)) {
          return;
        }

        context.report({ node, messageId: "requireVariable" });
      },
    };
  },
};
