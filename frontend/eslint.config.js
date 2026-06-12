import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import prettierConfig from 'eslint-config-prettier';
import prettierPlugin from 'eslint-plugin-prettier';
import { defineConfig, globalIgnores } from 'eslint/config';

export default defineConfig([
	globalIgnores(['dist', 'node_modules']),
	prettierConfig,
	{
		files: ['**/*.{js,jsx}'],
		extends: [
			js.configs.recommended,
			reactHooks.configs.flat.recommended,
			reactRefresh.configs.vite,
		],
		languageOptions: {
			globals: globals.browser,
			parserOptions: {
				ecmaVersion: 'latest',
				ecmaFeatures: { jsx: true },
				sourceType: 'module',
			},
		},
		plugins: {
			prettier: prettierPlugin,
		},
		rules: {
			'no-unused-vars': [
				'warn',
				{ varsIgnorePattern: '^[A-Z_]', argsIgnorePattern: '^_' },
			], // warn -> error로 변경 필요
			'no-console': 'warn', // console.log()를 경고로 warn -> error로 변경 필요
			'comma-dangle': 'off',
			'prettier/prettier': 'error',
			'react-hooks/set-state-in-effect': 'off',
		},
	},
]);
