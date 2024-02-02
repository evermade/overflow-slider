import { terser } from 'rollup-plugin-terser';
import pkg from './package.json';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import postcss from 'rollup-plugin-postcss';
import copy from 'rollup-plugin-copy';

const umd = { format: 'umd', name: 'OverflowSlider', exports: 'named' };
const es = { format: 'es' };
const minify = {
	plugins: [terser()],
	banner: () => `/*!  ${pkg.name} ${pkg.version} */`,
};

export default {
	input: 'src/index.ts',
	output: [
		// Main files
		{ file: 'dist/index.js', ...umd },
		{ file: 'dist/index.esm.js', ...es },
		{ file: 'docs/dist/overflow-slider.esm.js', ...es },
		// Minified versions
		{ file: 'dist/index.min.js', ...umd, ...minify },
		{ file: 'dist/index.esm.min.js', ...es, ...minify },
	],
	plugins: [
		typescript(),
		nodeResolve(),
		commonjs({ include: 'node_modules/**' }),
		postcss({
			extract: true,
			extract: 'overflow-slider.css',
			plugins: [
					require('autoprefixer'),
					require('cssnano')({
							preset: 'default',
					}),
			],
			minimize: true,
			sourceMap: false,
			extensions: ['.scss', '.css'],
		}),
	],
};
