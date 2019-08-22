import commonjs from 'rollup-plugin-commonjs';
import { terser } from "rollup-plugin-terser";

export default {
  input: 'src/trex.js',
  output: {
    file: 'dist/firmware.js',
    format: 'cjs',
    banner: 'const module={}',
    interop: false,
  },
  plugins: [
    commonjs({
      ignore: ['NRF52LL', 'Storage']
    }),
    terser({
      output: {
        max_line_len: true,
        semicolons: false,
      }
    }),
  ],
}
