import commonjs from 'rollup-plugin-commonjs';
import minify from 'rollup-plugin-minify-es';

export default {
  input: 'src/trex.js',
  output: {
    file: 'dist/firmware.js',
    format: 'cjs',
  },
  external: ['Flash', 'NRF52LL'],
  intro: 'const module={}',
  plugins: [
    commonjs(),
    minify({
      output: {
        max_line_len: true,
        semicolons: false,
      }
    }),
  ],
}
