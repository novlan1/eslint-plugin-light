# eslint-plugin-light

Eslint plugin.


## 1. Installation

You'll first need to install [ESLint](https://eslint.org/):

```sh
npm i eslint --save-dev
```

Next, install `eslint-plugin-light`:

```sh
npm install eslint-plugin-light --save-dev
```

## 2. Usage

Add `light` to the plugins section of your `.eslintrc` configuration file. You can omit the `eslint-plugin-` prefix:

```json
{
    "plugins": [
        "light"
    ]
}
```


Then configure the rules you want to use under the rules section.

```json
{
    "rules": {
        "light/rule-name": 2
    }
}
```

or use extends：

```json
{
  "extends": ["plugin:light/recommended"],
}
```


## 3. Supported Rules

### 3.1. light/valid-vue-comp-import

禁止从`js`文件中加载`Vue`组件

比如，


1. 导入地址是`js/ts`文件

```js
import SomeComp from 'src/local-component/ui/pages/user/account-manage/index.js';

// 或者省略了js/ts文件后缀
import SomeComp from 'src/local-component/ui/pages/user/account-manage/index';
```

如果加了`--fix`，会被转换为：

```js
import SomeComp from 'src/local-component/ui/pages/user/account-manage/xxx.vue';
```

注意上面的`xxx.vue`是从`index.js`中分析得到的原始文件路径。



2. 导入一个目录，但目录存在`index.js`，这时候不管存不存在`index.vue`，`uni-app`转换都会失败

```js
import SomeComp from 'src/local-component/ui/pages/user/account-manage';
```

可转换为：

```js
import SomeComp from 'src/local-component/ui/pages/user/account-manage/xxx.vue';
```

3. 具名导入

```js
import {
  AComp,
  BComp,
  CComp,
  DComp,
} from './comp';
```

可转换为：

```js
import AComp from 'src/local-component/module/tip-match/tip-match-schedule-tree-new/comp/a.vue';
import BComp from 'src/local-component/module/tip-match/tip-match-schedule-tree-new/comp/b.vue';
import CComp from 'src/local-component/module/tip-match/tip-match-schedule-tree-new/comp/c.vue';
import DComp from 'src/local-component/module/tip-match/tip-match-schedule-tree-new/comp/d.vue';
```

### 3.2. light/no-plus-turn-number

禁止在`vue`的`template`中用`+`号转换字符串为数字

比如：

```html
<ScheduleItem
  :child-id="+childId"
/>
```

如果加了`--fix`，会被转化成：

```html
<ScheduleItem
  :child-id="parseInt(childId, 10)"
/>
```

### 3.3 no-complex-key

不要在`vue`模板中使用复杂的`key`。包括：

1. 字符串拼接，如：
  
```vue
:key="`hold` + index"`
```

2. 模板字符串，如：

```vue
:key="`hold-${index}`"
```

3. 将`key`提到一个函数中，如：

```vue
:key="getHoldKey(index)"

getHoldKey(index) {
  return `hold${index}`
}
```

最佳方式其实是提前处理好数据，这样性能会更好，也避免了`key`重复。

```ts
getData() {
  items = items.map((item,index) => ({
    ...item,
    key: `hold-${index}`
  }))
}
```

`uni-app`中，`key`重复的话，会造成挂载在组件上面的事件参数为`undefined`，从而不成功。
