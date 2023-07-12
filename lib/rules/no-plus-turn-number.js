module.exports = {
  meta: {
    type: 'problem',
    schema: [],
    docs: {
      description: 'vue模板中不能使用+号转换字符串',
    },
    fixable: 'code',
    messages: {
      error: 'Do not use plus symbol to transfer string',
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
        if (node.value && node.value.type === 'VExpressionContainer' && node.value.expression) {
          const { operator } = node.value.expression;
          const { argument } = node.value.expression;

          // console.log('operator',operator)
          // console.log('argument',argument && argument.type)

          if (operator === '+' && argument && argument.type === 'Identifier') {
            const { name } = node.value.expression.argument;
            context.report({
              node,
              messageId: 'error',
              fix(fixer) {
                return fixer.replaceTextRange(node.value.expression.range, `parseInt(${name},10)`);
              },
            });
          }
        }
      },
    });
  },
};
