const path = require('node:path')
const { getDefaultConfig } = require('expo/metro-config')
const config = getDefaultConfig(__dirname)
const domain = path.resolve(__dirname, '../lib/interviews')
const allowed = new Set(['interview-setup-input.ts', 'interview-session-state.ts', 'interview-completion-state.ts'])
config.watchFolders = [domain]
// Keep Expo's default hierarchical lookup. The result allowlist below rejects all
// root dependency fallback; approved external helpers have no runtime imports.
config.resolver.nodeModulesPaths = [path.join(__dirname, 'node_modules')]
config.resolver.resolveRequest = (context, moduleName, platform) => {
  const result = context.resolveRequest(context, moduleName, platform)
  const files = result.type === 'sourceFile' ? [result.filePath] : result.type === 'assetFiles' ? result.filePaths : []
  for (const file of files) {
    const absolute = path.resolve(file)
    const relative = path.relative(__dirname, absolute)
    const inMobile = relative !== '..' && !relative.startsWith(`..${path.sep}`) && !path.isAbsolute(relative)
    if (!inMobile && !(path.dirname(absolute) === domain && allowed.has(path.basename(absolute)))) {
      throw new Error('Native graph attempted an unapproved external import')
    }
  }
  return result
}
module.exports = config
