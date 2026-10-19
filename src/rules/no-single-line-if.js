/** 自動修正で本体を字下げする1段分のインデント。 */
const INDENT_UNIT = "  ";

/**
 * if 文を1行で記述することを禁止するルール。
 * @type {import("eslint").Rule.RuleModule}
 */
export default {
  meta: {
    type: "layout",
    docs: {
      description: "if 文を1行で記述することを禁止する",
    },
    fixable: "code",
    schema: [],
    messages: {
      singleLine: "if 文は複数行で記述してください。",
    },
  },
  create(context) {
    const { sourceCode } = context;

    /**
     * 分岐の本体が直前のトークンと同じ行に収まっているかを判定する。
     * @param {import("estree").Statement} body if または else の本体
     * @returns {boolean}
     */
    function isSingleLineBody(body) {
      if (body.type === "BlockStatement") {
        return body.loc.start.line === body.loc.end.line;
      }

      const precedingToken = sourceCode.getTokenBefore(body);

      return precedingToken.loc.end.line === body.loc.start.line;
    }

    /**
     * 指定した行の先頭の空白を取得する。
     * @param {number} line 1 始まりの行番号
     * @returns {string}
     */
    function getLineIndent(line) {
      return /^[ \t]*/.exec(sourceCode.lines[line - 1])[0];
    }

    /**
     * 分岐の本体を波括弧で囲んだ複数行に展開する修正関数を生成する。コメントを含む場合は修正しない。
     * @param {import("estree").Statement} body if または else の本体
     * @returns {import("eslint").Rule.ReportFixer | null}
     */
    function createFix(body) {
      const precedingToken = sourceCode.getTokenBefore(body);

      if (sourceCode.commentsExistBetween(precedingToken, body)) {
        return null;
      }

      const baseIndent = getLineIndent(precedingToken.loc.end.line);
      const bodyIndent = baseIndent + INDENT_UNIT;

      if (body.type !== "BlockStatement") {
        const bracedText = ` {\n${bodyIndent}${sourceCode.getText(body)}\n${baseIndent}}`;

        return (fixer) => fixer.replaceTextRange([precedingToken.range[1], body.range[1]], bracedText);
      }

      if (sourceCode.getCommentsInside(body).length > 0) {
        return null;
      }

      const statementLines = body.body.map(
        (statement) => `\n${bodyIndent}${sourceCode.getText(statement)}`,
      );
      const innerText = `${statementLines.join("")}\n${baseIndent}`;

      return (fixer) => fixer.replaceTextRange([body.range[0] + 1, body.range[1] - 1], innerText);
    }

    return {
      IfStatement(node) {
        if (isSingleLineBody(node.consequent)) {
          context.report({ node, messageId: "singleLine", fix: createFix(node.consequent) });
        }

        const hasElseBody = node.alternate !== null && node.alternate.type !== "IfStatement";

        if (hasElseBody && isSingleLineBody(node.alternate)) {
          context.report({
            node: node.alternate,
            messageId: "singleLine",
            fix: createFix(node.alternate),
          });
        }
      },
    };
  },
};
