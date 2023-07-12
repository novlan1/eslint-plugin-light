module.exports = {
  meta: {
    type: 'problem',
    schema: [],
    docs: {
      description: '不要直接引用vant',
    },
    fixable: 'code',
    messages: {
      error: 'Do not import vant',
    },
  },

  create(context) {
    const fileName = context.getFilename();
    if (!fileName.endsWith('.vue')) {
      return {};
    }
    return {
      ImportDeclaration: (node) => {
        if (node.source.value === 'vant') {
          context.report({
            node,
            messageId: 'error',
          });
        }
      },
    };
    // if (!context.parserServices?.defineTemplateBodyVisitor) {
    //   return {
    //   };
    // }

    // return context.parserServices.defineTemplateBodyVisitor({
    //   VAttribute(node) {
    //     if (!node.key
    //       || node.key.type !== 'VDirectiveKey'
    //       || node.key?.argument?.type !== 'VIdentifier'
    //       || node.key?.argument?.name !== 'key'
    //     ) {
    //       return;
    //     }

    //     if (node?.value?.type === 'VExpressionContainer') {
    //       if (node.value.expression?.type === 'CallExpression') {
    //         // :key="getHoldKey(item)"
    //         context.report({
    //           node,
    //           messageId: 'funcError',
    //         });
    //       } else if (node.value.expression?.type === 'BinaryExpression') {
    //         // :key="index + 'hold'"
    //         context.report({
    //           node,
    //           messageId: 'stringError',
    //         });
    //       } else if (node.value.expression?.type === 'TemplateLiteral') {
    //       // :key="`${index}hold`"
    //         context.report({
    //           node,
    //           messageId: 'tplError',
    //         });
    //       }

    //       // 合法的是MemberExpression，比如item.key
    //     }
    //   },
    // });
  },
};
