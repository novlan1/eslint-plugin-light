module.exports = {
  meta: {
    type: 'problem',
    schema: [],
    docs: {
      description: 'vue模板中不要使用复杂的key',
    },
    messages: {
      error: 'Do not use complex key',
      funcError: 'Do not use function as key',
      stringError: 'Do not use string concatenation as key',
      tplError: 'Do not use template string as key',
    },
  },

  create(context) {
    const fileName = context.getFilename();
    if (!fileName.endsWith('.vue')) {
      return {};
    }
    if (!context.parserServices?.defineTemplateBodyVisitor) {
      return {
      };
    }

    return context.parserServices.defineTemplateBodyVisitor({
      VAttribute(node) {
        if (!node.key
          || node.key.type !== 'VDirectiveKey'
          || node.key?.argument?.type !== 'VIdentifier'
          || node.key?.argument?.name !== 'key'
        ) {
          return;
        }

        if (node?.value?.type === 'VExpressionContainer') {
          if (node.value.expression?.type === 'CallExpression') {
            // :key="getHoldKey(item)"
            context.report({
              node,
              messageId: 'funcError',
            });
          } else if (node.value.expression?.type === 'BinaryExpression') {
            // :key="index + 'hold'"
            context.report({
              node,
              messageId: 'stringError',
            });
          } else if (node.value.expression?.type === 'TemplateLiteral') {
          // :key="`${index}hold`"
            context.report({
              node,
              messageId: 'tplError',
            });
          }

          // 合法的是MemberExpression，比如item.key
        }
      },
    });
  },
};
