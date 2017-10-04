// @flow

export type PackageAtVersion = {
  name: string,
  version: string
};

export type Node = PackageAtVersion & {
  latestVersion: string,
  children: Array<Node>,
};

export type PackageVersionMap = {
  [string]: string
};

export type PackageWithDeps = {
  name: string,
  version: string,
  deps: PackageVersionMap,
  devDeps: PackageVersionMap,
  peerDeps: PackageVersionMap,
};

export type Manifest = {
  version: string,
  dependencies: PackageVersionMap,
  devDependencies: PackageVersionMap,
  peerDependencies: PackageVersionMap,
};

export type PacoteOptions = {
};
