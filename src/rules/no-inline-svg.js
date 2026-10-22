/** インラインで記述することを禁止する JSX の要素名。 */
const SVG_ELEMENT_NAME = "svg";

/**
 * JSX 要素が組み込みの svg 要素かを判定する。
 * @param {import("estree").Node} node 判定するノード
 * @returns {boolean}
 */
function isSvgElement(node) {
  if (node.type !== "JSXElement") {
    return false;
  }

  const { name } = node.openingElement;

  return name.type === "JSXIdentifier" && name.name === SVG_ELEMENT_NAME;
}

/**
 * JSX で svg 要素をインラインで記述することを禁止するルール。
 * @type {import("eslint").Rule.RuleModule}
 */
export default {
  meta: {
    type: "suggestion",
    docs: {
      description: "JSX で svg 要素をインラインで記述することを禁止する",
    },
    schema: [],
    messages: {
      inlineSvg: "SVG は .svg ファイルに切り出し、<img src> で読み込んでください。",
    },
  },
  create(context) {
    const { sourceCode } = context;

    return {
      JSXElement(node) {
        if (!isSvgElement(node)) {
          return;
        }

        const isNestedInSvg = sourceCode.getAncestors(node).some(isSvgElement);

        if (isNestedInSvg) {
          return;
        }

        context.report({ node, messageId: "inlineSvg" });
      },
    };
  },
};
