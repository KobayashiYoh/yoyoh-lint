/** 並べ替えの対象にする論理演算子。 */
const TARGET_OPERATORS = new Set(["&&", "||"]);

/** 式の真偽値だけが使われる文の種類と、条件式を持つプロパティ名。 */
const TEST_PROPERTY_BY_PARENT_TYPE = {
  IfStatement: "test",
  WhileStatement: "test",
  DoWhileStatement: "test",
  ForStatement: "test",
  ConditionalExpression: "test",
};

/**
 * 並べ替えの対象になる論理式かを判定する。
 * @param {import("estree").Node} node
 * @returns {boolean}
 */
function isTargetLogicalExpression(node) {
  return node.type === "LogicalExpression" && TARGET_OPERATORS.has(node.operator);
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
 * 評価しても副作用が起きない、識別子またはプロパティ参照かを判定する。
 * @param {import("estree").Node} node
 * @returns {boolean}
 */
function isReference(node) {
  switch (node.type) {
    case "Identifier":
    case "ThisExpression":
      return true;
    case "ChainExpression":
      return isReference(node.expression);
    case "MemberExpression": {
      const isSimpleProperty = !node.computed || node.property.type === "Literal";

      return isSimpleProperty && isReference(node.object);
    }
    default:
      return false;
  }
}

/**
 * 並べ替えの判定に使える、参照またはその否定かを判定する。
 * @param {import("estree").Node} node
 * @returns {boolean}
 */
function isSimpleOperand(node) {
  if (isNegation(node)) {
    return isReference(node.argument);
  }

  return isReference(node);
}

/**
 * 同じ演算子でつながった論理式を、評価順の被演算子の配列に展開する。
 * @param {import("estree").LogicalExpression} node
 * @returns {import("estree").Expression[]}
 */
function flattenOperands(node) {
  return [node.left, node.right].flatMap((operand) => {
    const isSameOperator = operand.type === "LogicalExpression" && operand.operator === node.operator;

    return isSameOperator ? flattenOperands(operand) : [operand];
  });
}

/**
 * 論理式の値ではなく真偽値だけが使われる位置にあるかを判定する。
 * @param {import("estree").Node} node
 * @returns {boolean}
 */
function isInBooleanContext(node) {
  const { parent } = node;

  if (isTargetLogicalExpression(parent)) {
    return isInBooleanContext(parent);
  }

  if (isNegation(parent)) {
    return true;
  }

  const testProperty = TEST_PROPERTY_BY_PARENT_TYPE[parent.type];

  return testProperty !== undefined && parent[testProperty] === node;
}

/**
 * 被演算子を比較用の文字列に正規化する。
 * @param {import("eslint").SourceCode} sourceCode
 * @param {import("estree").Node} node
 * @returns {string}
 */
function normalizeText(sourceCode, node) {
  return sourceCode.getText(node).replaceAll("?.", ".").replaceAll(/\s/g, "");
}

/**
 * 参照がプロパティアクセスの土台として使っている式を、内側から順に列挙する。
 * @param {import("estree").Node} node
 * @returns {import("estree").Node[]}
 */
function collectBaseObjects(node) {
  const target = node.type === "ChainExpression" ? node.expression : node;

  if (target.type !== "MemberExpression") {
    return [];
  }

  return [target.object, ...collectBaseObjects(target.object)];
}

/**
 * 複合条件の中で、否定条件を肯定条件より先に記述することを禁止するルール。
 * @type {import("eslint").Rule.RuleModule}
 */
export default {
  meta: {
    type: "suggestion",
    fixable: "code",
    docs: {
      description: "複合条件の中で、否定条件を肯定条件より先に記述することを禁止する",
    },
    schema: [],
    messages: {
      negatedFirst: "否定条件は肯定条件より後ろに記述してください。",
    },
  },
  create(context) {
    const { sourceCode } = context;

    /**
     * 肯定条件を否定条件より前に移動しても評価結果が変わらないかを判定する。
     * @param {import("estree").Expression[]} operands
     * @returns {boolean}
     */
    function canReorder(operands) {
      return operands.every((negated, negatedIndex) => {
        if (!isNegation(negated)) {
          return true;
        }

        const negatedText = normalizeText(sourceCode, negated.argument);
        const laterPositiveOperands = operands.slice(negatedIndex + 1).filter((operand) => !isNegation(operand));

        return laterPositiveOperands.every((operand) => {
          const baseTexts = collectBaseObjects(operand).map((base) => normalizeText(sourceCode, base));

          return !baseTexts.includes(negatedText);
        });
      });
    }

    /**
     * 肯定条件を元の順序のまま先頭に、否定条件を元の順序のまま後ろに並べ替える修正を作る。
     * @param {import("estree").LogicalExpression} node
     * @param {import("estree").Expression[]} operands
     * @returns {import("eslint").Rule.ReportFixer | null}
     */
    function createFix(node, operands) {
      if (sourceCode.getCommentsInside(node).length > 0) {
        return null;
      }

      const positiveOperands = operands.filter((operand) => !isNegation(operand));
      const negatedOperands = operands.filter(isNegation);
      const reorderedText = [...positiveOperands, ...negatedOperands]
        .map((operand) => sourceCode.getText(operand))
        .join(` ${node.operator} `);

      return (fixer) => fixer.replaceText(node, reorderedText);
    }

    return {
      LogicalExpression(node) {
        if (!isTargetLogicalExpression(node)) {
          return;
        }

        const isNestedInSameOperator =
          node.parent.type === "LogicalExpression" && node.parent.operator === node.operator;

        if (isNestedInSameOperator) {
          return;
        }

        const operands = flattenOperands(node);

        if (!operands.every(isSimpleOperand)) {
          return;
        }

        const firstNegatedIndex = operands.findIndex(isNegation);
        const lastPositiveIndex = operands.findLastIndex((operand) => !isNegation(operand));
        const hasPositiveAfterNegated = firstNegatedIndex !== -1 && firstNegatedIndex < lastPositiveIndex;

        if (!hasPositiveAfterNegated) {
          return;
        }

        if (!isInBooleanContext(node) || !canReorder(operands)) {
          return;
        }

        context.report({
          node: operands[firstNegatedIndex],
          messageId: "negatedFirst",
          fix: createFix(node, operands),
        });
      },
    };
  },
};
