// @flow

import test from 'ava';
import packageJson from 'print-tree/package.json';
import jd from '../src/index';

test('should retrive a list of dependencies from npm', async (t) => {
  t.snapshot(await jd({
    name: packageJson.name,
    version: packageJson.version,
  }));
});

test('should build a deeply nested list of dependencies from npm', async (t) => {
  t.snapshot(await jd({
    name: 'pacote',
    version: '6.0.0',
  }));
});
