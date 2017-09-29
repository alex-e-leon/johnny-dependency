// @flow

import path from 'path';
import test from 'ava';
import execa from 'execa';
import packageJson from '../package.json';

const cwd = path.dirname(__dirname);
const cli = (args, opts) => execa(path.join(cwd, 'lib', 'cli', 'index.js'), args, opts);

test('runs cli', async (t) => {
  const { stdout } = await cli([`${packageJson.name}@${packageJson.version}`], { cwd });
  t.snapshot(stdout);
});

test('cli error', async (t) => {
  const err = await t.throws(cli([], { cwd }));
  t.is(err.stderr.trim(), 'An argument (package@version) is required. Run johnny-dependency --help for more info');
});
