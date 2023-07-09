import typescript from '@rollup/plugin-typescript';
import terser from '@rollup/plugin-terser';

export default {
  input: 'src/manager.ts',
  output: [
    {
      dir: 'dist/cjs',
      format: 'cjs'
    },
    {
      dir: 'dist/esm',
      format: 'esm'
    },
    {
      dir: 'dist/web',
      format: 'iife',
      name: "iocaptcha_client",
      plugins: [terser()]
    }
  ],
  plugins: [typescript()]
};