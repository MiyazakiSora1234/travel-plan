// mobile/はExpoのdefault Metro configに依存していたが、shared/を解決するために
// getDefaultConfigをラップする形で最小限のカスタマイズを追加する。
const { getDefaultConfig } = require('expo/metro-config')
const path = require('path')

const projectRoot = __dirname
const sharedRoot = path.resolve(projectRoot, '../shared')

const config = getDefaultConfig(projectRoot)

// shared/はmobile/の外にあるため、明示的にwatchFoldersへ追加しないとMetroから不可視になる
config.watchFolders = [...config.watchFolders, sharedRoot]

// このMetroバージョンにはresolver.aliasが無いため、extraNodeModulesでエイリアスする
config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
  '@shared': path.resolve(sharedRoot, 'src'),
}

module.exports = config
