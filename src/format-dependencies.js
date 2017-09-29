// @flow

import type { PackageWithDeps, PackageAtVersion, PackageVersionMap } from './types';

function resolveDependencies({
  dependencies, resolvedDependencies }: {
  dependencies: Array<PackageWithDeps>,
  resolvedDependencies: { [string]: string },
}) {
  return dependencies.map((dependency) => {
    // eslint-disable-next-line no-param-reassign
    dependency.deps = Object.keys(dependency.deps).reduce((acc, name) => {
      const version = dependency.deps[name];
      acc[name] = resolvedDependencies[`${name}@${version}`];
      return acc;
    }, {});
    return dependency;
  });
}

function matchPackageNameAndVersion(a: PackageAtVersion, b: PackageAtVersion): boolean {
  return (a.name === b.name && a.version === b.version);
}

function formatGraphWithoutCircularDeps(
  initialRoot: PackageAtVersion,
  resolvedDependencies: Array<PackageWithDeps>,
  latestVersions: PackageVersionMap,
) {
  const hits = [];

  function buildGraph(root: PackageAtVersion) {
    if (!hits.find(name => name === root.name)) {
      hits.push(root.name);

      const rootPackage = (resolvedDependencies.find(npmPackage => (
        matchPackageNameAndVersion(npmPackage, root)
      )));

      return {
        name: root.name,
        version: root.version,
        latestVersion: latestVersions[root.name],
        children: rootPackage && Object.keys(rootPackage.deps).map(dependency => buildGraph({
          name: dependency,
          version: rootPackage.deps[dependency],
        })),
      };
    }
    return Object.assign({}, { latestVersion: latestVersions[root.name] }, root);
  }

  return buildGraph(initialRoot);
}

module.exports = {
  resolveDependencies,
  formatGraphWithoutCircularDeps,
};
