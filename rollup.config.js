import * as path from 'path';
import dts from 'rollup-plugin-dts';
import { terser } from 'rollup-plugin-terser';
import typescript from 'rollup-plugin-typescript2';
import pkg from './package.json';

const resolve = (...args) => path.resolve(__dirname, ...args);

const banner = `\
/*!
 * ${pkg.name} - ${pkg.description}
 *
 * @version v${pkg.version}
 * @link ${pkg.homepage}
 * @license ${pkg.license}
 * @copyright 2018-${new Date().getFullYear()} meteorlxy
 */
`;

let hasTSChecked = false;

export default [
  {
    input: 'index.ts',
    output: 'vue-showdown.cjs.js',
    format: 'cjs',
  },
  {
    input: 'index.ts',
    output: 'vue-showdown.esm.js',
    format: 'es',
  },
  {
    input: 'index.ts',
    output: 'vue-showdown.esm.min.js',
    format: 'es',
  },
  {
    input: 'index.umd.ts',
    output: 'vue-showdown.js',
    format: 'umd',
    globals: {
      showdown: 'showdown',
      vue: 'Vue',
    },
  },
  {
    input: 'index.umd.ts',
    output: 'vue-showdown.min.js',
    format: 'umd',
    globals: {
      showdown: 'showdown',
      vue: 'Vue',
    },
  },
]
  .map((opts) => {
    const config = {
      input: resolve('src', opts.input),
      output: {
        file: resolve('dist', opts.output),
        format: opts.format,
        name: 'VueShowdown',
        globals: opts.globals,
        banner,
        exports: 'named',
      },
      external: ['showdown', 'vue'],
      plugins: [
        typescript({
          check: !hasTSChecked,
          tsconfig: resolve('tsconfig.base.json'),
          tsconfigOverride: {
            compilerOptions: {
              declaration: !hasTSChecked,
              declarationDir: hasTSChecked ? undefined : resolve('dist/types'),
            },
            include: [resolve('src/index.ts')],
          },
          useTsconfigDeclarationDir: !hasTSChecked,
        }),
      ],
    };

    hasTSChecked = true;

    if (/min\.js$/.test(opts.output)) {
      config.plugins.push(terser());
    }

    return config;
  })
  .concat({
    input: resolve('dist/types/index.d.ts'),
    output: {
      file: resolve('dist/vue-showdown.d.ts'),
      format: 'es',
    },
    plugins: [dts()],
  });
