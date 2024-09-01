import typescript from '@rollup/plugin-typescript';
import dts from "rollup-plugin-dts";
const config = [
  {
    input: 'dist/index.js',
    output: {
      file: 'dist/bundles/omni-cloud.js',
      format: 'cjs',
      sourcemap: true,
    },
    external: ['axios', 'node:crypto', 'node:util', 'node:fs'],
    plugins: [typescript()]
  }, {
    input: 'dist/index.d.ts',
    output: {
      file: 'dist/bundles/omni-cloud.d.ts',
      format: 'es'
    },
    plugins: [dts()]
  }
];
export default config;
