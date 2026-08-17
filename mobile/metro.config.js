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
  // shared/はmobileとは別のnpm packageのため、shared/node_modulesに
  // react / @tanstack/react-query の別インスタンスが解決され得る（実際にpeer解決で発生する）。
  // React Hookやcontextの同一性が壊れるのを防ぐため、shared/src配下から参照される場合も
  // mobile自身の実体に強制的に寄せる。
  react: path.resolve(projectRoot, 'node_modules/react'),
  '@tanstack/react-query': path.resolve(projectRoot, 'node_modules/@tanstack/react-query'),
}

module.exports = config
