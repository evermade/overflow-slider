import { terser } from 'rollup-plugin-terser';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import postcss from 'rollup-plugin-postcss';
import copy from 'rollup-plugin-copy';
import glob from 'glob';

const plugins = [
		typescript(),
		nodeResolve(),
		commonjs({ include: 'node_modules/**' }),
		postcss({
				extract: 'overflow-slider.css',
				plugins: [
						require('autoprefixer'),
						require('cssnano')({ preset: 'default', }),
				],
				minimize: true,
				sourceMap: false,
				extensions: ['.scss', '.css'],
		}),
		copy({
				targets: [
						{
							src: 'dist/*',
							dest: 'docs/dist',
						},
				],
				hook: 'writeBundle'
		})
];

// Adjusting here to include the core file
const pluginEntries = {
		index: 'src/index.ts', // Adding the core file
		...glob.sync('src/plugins/**/*.ts').reduce((entries, path) => {

			const name = path.replace(/^src\/plugins\//, '').replace(/\.ts$/, '');
			const nameWithoutIndex = name.replace(/\/index/, '');
				// entries[nameWithoutIndex] = path;
				entries['index'] = path;
				return entries;
		}, {}),
};

const baseOutput = {
		preserveModules: true,
		preserveModulesRoot: 'src',
};

export default [
		{
				input: pluginEntries,
				output: {
						...baseOutput,
						dir: 'dist',
						format: 'es',
						entryFileNames: '[name].esm.js',
				},
				plugins,
		},
		{
				input: pluginEntries,
				output: {
						...baseOutput,
						dir: 'dist',
						format: 'es',
						entryFileNames: '[name].min.js',
						plugins: [terser()],
				},
				plugins,
		},
];
