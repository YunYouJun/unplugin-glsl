export type GlobPattern = string | string[]

export interface Options {
  // define your plugin options here
  include?: GlobPattern
  exclude?: GlobPattern
}
