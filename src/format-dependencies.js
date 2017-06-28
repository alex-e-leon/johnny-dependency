// @flow

import type { PackageWithDeps, PackageAtVersion } from './types';

function resolveDependencies({ dependencies, resolvedDependencies }: {
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

function matchPackageName(a: PackageAtVersion, b: PackageAtVersion): boolean {
  return (a.name === b.name);
}

function formatGraphWithoutCircularDeps(
  ...args: *
) {
  const hits = [];

  function buildGraph(
    root: PackageAtVersion,
    resolvedDependencies: Array<PackageWithDeps>,
    latestVersions: Array<PackageWithDeps>,
  ) {
    if (!hits.find(name => name === root.name)) {
      hits.push(root.name);

      const rootPackage = (resolvedDependencies.find(npmPackage => (
        matchPackageNameAndVersion(npmPackage, root)
      )));

      const latestVersion = latestVersions.find(npmPackage => (
        matchPackageName(npmPackage, { name: root.name, version: 'latest' })
      ));

      return {
        name: root.name,
        version: root.version,
        latestVersion: latestVersion && latestVersion.version,
        children: rootPackage && Object.keys(rootPackage.deps).map(
          dependency => buildGraph(
            { name: dependency, version: rootPackage.deps[dependency] },
            resolvedDependencies,
            latestVersions,
          ),
        ),
      };
    }
    return root;
  }

  return buildGraph(...args);
}

module.exports = {
  resolveDependencies,
  formatGraphWithoutCircularDeps,
};
