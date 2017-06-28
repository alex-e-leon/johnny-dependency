// @flow

export type PackageAtVersion = {
  name: string,
  version: string
};

export type NormalizedDependencies = {
  [string]: string
};

export type PackageWithDeps = {
  name: string,
  version: string,
  deps: NormalizedDependencies,
  devDeps: NormalizedDependencies,
  peerDeps: NormalizedDependencies,
};

export type Manifest = {
  version: string,
  dependencies: NormalizedDependencies,
  devDependencies: NormalizedDependencies,
  peerDependencies: NormalizedDependencies,
};
