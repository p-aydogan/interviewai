const fs = require('node:fs')
const path = require('node:path')
const ts = require('typescript')
function load(file, overrides = {}) {
  const absolute = path.resolve(file)
  const code = ts.transpileModule(fs.readFileSync(absolute, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText
  const module = { exports: {} }
  const localRequire = name => Object.hasOwn(overrides, name) ? overrides[name] :
    name.startsWith('.') ? load(path.resolve(path.dirname(absolute), name + '.ts'), overrides) : require(name)
  new Function('require', 'module', 'exports', code)(localRequire, module, module.exports)
  return module.exports
}
module.exports = { load }
