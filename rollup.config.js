// rollup.config.js
import path from 'path';
import glob from 'glob';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import postcss from 'rollup-plugin-postcss';
import copy from 'rollup-plugin-copy';
import terser from '@rollup/plugin-terser';
import { dts } from 'rollup-plugin-dts';

// Define core entry and plugin entries separately
const coreInput = 'src/index.ts';
const pluginInputs = glob
	.sync('src/plugins/*/index.ts')
	.reduce((out, file) => {
		const name = path.basename(path.dirname(file));
		out[name] = file;
		return out;
	}, {});
// For declarations, include both core and plugins
const allEntries = { index: coreInput, ...pluginInputs };

const plugins = [
	typescript({
		tsconfig: './tsconfig.json',
		declaration: false,
		declarationMap: false,
	}),
	nodeResolve(),
	commonjs({ include: 'node_modules/**' }),
	postcss({
		extract: 'overflow-slider.css',
		plugins: [ require('autoprefixer'), require('cssnano')({ preset: 'default' }) ],
		minimize: true,
		sourceMap: false,
		extensions: ['.scss', '.css'],
	}),
	copy({ targets: [{ src: 'dist/*', dest: 'docs/dist' }], hook: 'writeBundle' }),
	copy({
		targets: [
			{ src: 'src/mixins.scss', dest: 'dist' },
			{ src: 'dist/*', dest: 'docs/dist' },
		],
	}),
];

// Helper for plugin file naming
function entryFmt(ext, isMin) {
	return chunk => {
		const id = chunk.facadeModuleId;
		const pluginName = path.basename(path.dirname(id));
		return `plugins/${pluginName}/index.${ext}.js`;
	};
}

export default [
	// —— Flat core ESM build (no internal imports) ——
	{
		input: coreInput,
		output: { file: 'dist/index.esm.js', format: 'es', sourcemap: true, inlineDynamicImports: true },
		plugins,
	},

	// —— Flat core CJS build (minified) ——
	{
		input: coreInput,
		output: { file: 'dist/index.min.js', format: 'cjs', sourcemap: true, inlineDynamicImports: true, exports: 'auto' },
		plugins: [...plugins, terser()],
	},

	// —— Per-plugin ESM build ——
	{
		input: pluginInputs,
		output: { dir: 'dist', format: 'es', entryFileNames: entryFmt('esm', false) },
		plugins,
	},

	// —— Per-plugin minified build ——
	{
		input: pluginInputs,
		output: { dir: 'dist', format: 'es', entryFileNames: entryFmt('min', true) },
		plugins: [...plugins, terser()],
	},

	// —— Declarations bundle (multi-entry) ——
	{
		input: allEntries,
		external: [/\.scss$/],
		output: {
			dir: 'dist',
			format: 'es',
			preserveModules: true,
			preserveModulesRoot: 'src',
			entryFileNames: chunk => {
				if (chunk.name === 'index') return 'index.d.ts';
				const pluginName = path.basename(path.dirname(chunk.facadeModuleId));
				return `plugins/${pluginName}/index.d.ts`;
			},
		},
		plugins: [dts()],
	},
];
