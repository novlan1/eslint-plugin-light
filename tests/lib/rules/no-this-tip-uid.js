'use strict';


const rule = require('../../../lib/rules/no-this-tip-uid');
const { RuleTester } = require('eslint');


const ruleTester = new RuleTester();
ruleTester.run('no-this-tip-uid', rule, {
  valid: [
    {
      code: 'tipUid = UserInfo.tip_uid;',
    },
  ],

  invalid: [
    {
      code: 'this.tip_uid',
      errors: [{ message: '不能使用this.tip_uid', type: 'MemberExpression' }],
    },
  ],
});
