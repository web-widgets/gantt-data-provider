/* global require, module */
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import replace from '@rollup/plugin-replace';

const typescript = require("@rollup/plugin-typescript");
const terser = require("rollup-plugin-terser").terser;
const watch = !!process.env.ROLLUP_WATCH;

const base = (output, tsConfig) => ({
	input: "src/data.ts",
	output,
	plugins: [
		replace({
			COMMERCIAL:true,
			EXPIRATION:0,
			ZOOM:1,
			delimiters: ['', '']
		}),
		typescript(tsConfig),
		resolve(),
		commonjs(),
	],
});

const config = cfg => {
	let out = base({
		dir: "dist",
		name: "data",
		format: "cjs",
		sourcemap: true,
	},{
		declaration: true,
		declarationDir: "dist/types",
		rootDir: "src",
	});

	let outES5 = base({
		file: "dist/data.es5.js",
		name: "data",
		format: "iife",
		sourcemap: true,
	},{
		target: "es5",
	});

	let outES6 = base({
		file: "dist/data.es6.js",
		format: "esm",
		sourcemap: true,
	},{
		target: "es6",
	});

	if (watch) {
		out = outES5;
	} else if (typeof cfg["config-dist"] !== "undefined") {
		out = [out, outES6, outES5];
	}

	if (typeof cfg["config-compressed"] !== "undefined")
		out.forEach(a => a.plugins.push(terser()));

	return out;
};

module.exports = config;
