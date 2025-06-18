# Rspack incremental bug

## 复现步骤

pnpm run dev

## 预期结果

dist/main.js 包含 foo 模块的代码

## 实际结果

dist/main.js 不包含 foo 模块的代码

## 原因

compilation 进行了两次构建：

1. 第一次构建时，`foo` 模块被 `index.js` 导入，但由于 foo 模块的 sideEffects 为 true，故不会加入到 chunk graph 中。
2. 第二次构建时，`foo` 模块再次被 `addInclude()` 函数加入到 main 入口的 `includeDependencies` 中，但由于模块图本身无修改，故导致 build chunk graph 时没有重新计算。

第二次构建无以下增量变化

- Mutation::ModuleRemove
- Mutation::ModuleUpdate
- Mutation::ModuleAdd
