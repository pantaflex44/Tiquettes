import pluginReact from "eslint-plugin-react";
import eslint from "@eslint/js";
import { defineConfig, globalIgnores } from "eslint/config";
import oxlint from 'eslint-plugin-oxlint';

export default defineConfig([
    eslint.configs.recommended,
    {
        env: { browser: true, es2022: true },
        extends: [
            'eslint:recommended',
            'plugin:react/recommended',
            'plugin:react/jsx-runtime',
            'plugin:react-hooks/recommended',
        ],
        ignorePatterns: ['node_modules', 'dist', '.eslint.config.js'],
        parserOptions: { ecmaVersion: 'latest', sourceType: 'module' },
        settings: { react: { version: '19.2.6' } },
        plugins: ['react-refresh'],
        rules: {
            'react/prop-types': 0,
            'react/jsx-no-target-blank': 'off',
            'react-refresh/only-export-components': [
                'warn',
                { allowConstantExport: true },
            ],
        },
    },
    globalIgnores(["**/dist/", "**/node_modules/", "**/.eslint.config.js"]),
    pluginReact.configs.flat.recommended,
    pluginReact.configs.flat["jsx-runtime"],
    {
        settings: {
            react: {
                version: "detect",
            },
        },
    },
    ...oxlint.configs['flat/recommended']
]);


