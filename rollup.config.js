import typescript from '@rollup/plugin-typescript';
import terser from '@rollup/plugin-terser';

export default {
  input: 'src/manager.ts',
  output: [
    {
      format: 'cjs',
      file: "dist/client.cjs"
    },
    {
      format: 'esm',
      file: "dist/client.mjs"
    },
    {
      format: 'iife',
      name: "client",
      file: "dist/client.min.js",
      plugins: [terser()]
    }
  ],
  plugins: [typescript()]
};