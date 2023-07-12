
'use strict';

/** @type {import('eslint').Rule.RuleModule} */
module.exports = {
  meta: {
    type: 'problem',
    schema: [],
    docs: {
      description: '不能使用this.tip_uid',
    },
    fixable: null, // Or `code` or `whitespace`,
    messages: {
      noUseTipUidId: '不能使用this.tip_uid',
    },
  },

  create(context) {
    return {
      MemberExpression: (node) => {
        if (node.object.type === 'ThisExpression'
        && node.property.type === 'Identifier'
        && node.property.name === 'tip_uid') {
          context.report({
            node,
            messageId: 'noUseTipUidId',
          });
        }
      },
      // visitor functions for different types of nodes
    };
  },
};
