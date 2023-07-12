const rule = require('../../../lib/rules/valid-vue-comp-import');
const   { RuleTester } = require('eslint');
const { testConfig } = require('../config.js');

const ruleTester = new RuleTester(testConfig);
ruleTester.run('valid-vue-comp-import', rule, {
  valid: [{ code: 'import xx from \'./index.vue\'' }],
  invalid: [
    // {
    //   code: 'import xx from \'./index.js\'',
    //   filename: 'a.vue',
    //   errors: [
    //     {
    //       message: 'Do not import files from JS files',
    //     },
    //   ],
    // },
  ],
});

