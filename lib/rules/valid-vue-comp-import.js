const path = require('path');
const fs = require('fs');
const jsParser = require('@babel/eslint-parser');

const ROOT_PATH = process.cwd();

const VALID_FILES = ['js', 'ts', 'vue'];

/**
 * 获取引入文件的真实位置，如果是目录，返回目录，如果是文件，返回带后缀的文件
 */
function findCompDir(source = '', dirname = '') {
  let compFile;
  if (source.startsWith('.')) {
    compFile = path.resolve(dirname, source);
  } else if (source.startsWith('src')) {
    compFile = path.resolve(process.cwd(), source);
  }

  if (fs.existsSync(compFile)) {
    return compFile;
  }

  for (let i = 0; i < VALID_FILES.length; i++) {
    const postfix = VALID_FILES[i];
    const wholeFileName = `${compFile}.${postfix}`;
    if (fs.existsSync(wholeFileName)) {
      return wholeFileName;
    }
  }
  console.log('\x1B[31m%s\x1B[0m', '未找到引入文件');
  return compFile;
}

function getSourceAST(sourceFile) {
  const jsData = fs.readFileSync(sourceFile, {
    encoding: 'utf-8',
  });

  let scriptAST = undefined;

  const opts = {
    sourceType: 'module',
    requireConfigFile: false,
    babelOptions: {
      configFile: false,
    },
  };

  try {
    scriptAST = jsParser.parse(jsData, opts);
    delete scriptAST.tokens;
  } catch (e) {
    console.log('出错了：', e);
  }
  return scriptAST;
}


function getDefaultExportComp(ast) {
  if (!ast) return '';


  const namedDeclarationNodes = ast.body.filter(item => item.type === 'ExportNamedDeclaration');

  const namedObj = {};
  // console.log('namedDeclarationNodes',namedDeclarationNodes.length)
  for (let i = 0;i < namedDeclarationNodes.length;i++) {
    const node = namedDeclarationNodes[i];
    // console.log('node',node)
    if (!node.specifiers || !node.specifiers.length) {
      continue;
    }
    // console.log('i',node)
    const { value } = node.source;
    const { name } = node.specifiers[0].exported;
    namedObj[name] = value;
  }

  // console.log('namedObj', namedObj);

  if (namedObj.default) {
    return namedObj;
  }

  const nodes = ast.body.filter(item => item.type === 'ExportDefaultDeclaration') || [];
  if (nodes[0] && nodes[0].declaration.type === 'Identifier') {
    // 是一个变量，代表从上面导入的
    const { name } = nodes[0].declaration;
    const importAst = ast.body.filter(item => item.type === 'ImportDeclaration' && !!item.specifiers.find(it => it.local.name === name));
    // console.log('importAst', importAst)
    namedObj.default =  importAst[0].source.value;
  }

  return namedObj;
}

function getRelativePath(originPath = '') {
  return originPath.replace(`${path.resolve(ROOT_PATH)}/`, '');
}

function getDefaultExportPathFromSouceFile(sourceFile) {
  const scriptAST = getSourceAST(sourceFile);
  // console.log('scriptAST', scriptAST)

  const defaultExportComp = getDefaultExportComp(scriptAST);
  // console.log('defaultExportComp',defaultExportComp)
  if (!defaultExportComp) return;

  const obj = {};
  const keys = Object.keys(defaultExportComp);
  for (let i = 0;i < keys.length;i++) {
    const name = keys[i];
    const value = defaultExportComp[name];
    const defaultFilePath = findCompDir(value, path.dirname(sourceFile));
    const relativePath = getRelativePath(defaultFilePath);
    obj[name] = relativePath;
  }
  // console.log('defaultFilePath',defaultFilePath)

  // console.log('relativePath',relativePath)
  return obj;
}


function handleError({
  specifiers,
  sourceFile,
  context,
  node: one,
}) {
  if (!specifiers || !specifiers.length) return;
  const componentList = [];
  let statementString = '\n';
  const relativePath = getDefaultExportPathFromSouceFile(sourceFile);

  const isJSError = sourceFile.endsWith('.js');

  for (let i = 0;i < specifiers.length;i++) {
    const specifier = specifiers[i];
    const componentName = specifier.local.name;
    // console.log('componentName', componentName);
    componentList.push(componentName);
    if (relativePath[componentName]) {
      statementString += `import ${componentName} from '${relativePath[componentName]}';\n`;
    }
  }

  // console.log('relativePath', relativePath);
  context.report({
    node: one,
    messageId: isJSError ? 'jsError' : 'tsError',
    fix(fixer) {
      /**
         * 默认导入，比如：
         *
         * import BottomTipBarComp from 'xxx';
         *
         */
      const defaultCompStr = relativePath.default;
      if (defaultCompStr && specifiers.length === 1 && specifiers[0].type === 'ImportDefaultSpecifier') {
        return fixer.replaceTextRange(one.source.range, `'${defaultCompStr}'`);
      }

      /**
         * 具名导入，比如：
         * import { xx, yy } from 'xxx';
         */
      return [
        fixer.insertTextBeforeRange(one.range, statementString),
        fixer.removeRange(one.range),
      ];
    },
  });
}

module.exports = {
  meta: {
    type: 'problem',
    schema: [],
    docs: {
      description: '不能从js/ts文件中引入组件',
    },
    fixable: 'code',
    messages: {
      jsError: 'Do not import component from JS file',
      tsError: 'Do not import component from TS file',
    },
  },

  create(context) {
    // const sourceCode = context.getSourceCode();
    // const cwd = context.getCwd();
    const fileName = context.getFilename();

    // console.log('cwd', cwd)
    // console.log('fileName', fileName)
    const dirname = path.dirname(fileName);
    // console.log('dirname', dirname);
    if (!fileName.endsWith('.vue')) {
      return {};
    }

    return {
      Program: (node) => {
        const exportAst = node.body.find(item => item.type === 'ExportDefaultDeclaration');
        if (!exportAst || !exportAst.declaration) return;

        const properties = exportAst.declaration.properties || [];
        const componentsNode = properties.find(item => item.key && item.key.name === 'components');

        // console.log('componentsNode',componentsNode)
        if (!componentsNode || !componentsNode.value
            || !componentsNode.value.properties
            || !componentsNode.value.properties.length
        ) return;
        const components = componentsNode.value.properties.map(item => ((item.value && item.value.name) || ''));

        // console.log('components', components);

        if (!components || !components.length) return;

        const importAst = node.body.filter(item => item.type === 'ImportDeclaration');
        const realImport = importAst.filter(item => !!item.specifiers.find((it) => {
          const name = (it.imported && it.imported.name) || (it.local && it.local.name);
          return components.includes(name);
        }));
        // console.log('realImport',realImport, realImport.length)

        for (let i = 0;i < realImport.length;i++) {
          const one = realImport[i];
          const { specifiers } = one;
          const source = one.source.value;

          if (source.endsWith('.vue')) {
            continue;
          }

          if (source.endsWith('.js') || source.endsWith('.ts')) {
            const compFile = findCompDir(source, dirname);

            handleError({
              specifiers,
              sourceFile: compFile,
              node: one,
              context,
            });
            continue;
          }

          const compFile = findCompDir(source, dirname);

          if (fs.existsSync(compFile)) {
            const stat = fs.lstatSync(compFile);
            if (stat.isDirectory()) {
              const indexJs = path.resolve(compFile, 'index.js');
              const indexTs = path.resolve(compFile, 'index.ts');
              if (fs.existsSync(indexJs)) {
                handleError({
                  specifiers,
                  sourceFile: indexJs,
                  node: one,
                  context,
                });
                continue;
              }
              if (fs.existsSync(indexTs)) {
                handleError({
                  specifiers,
                  sourceFile: indexTs,
                  node: one,
                  context,
                });
              }
            }
          }
        }
      },
    };
  },
};
