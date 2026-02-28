module.exports = {
	root: true,
	parser: '@typescript-eslint/parser',
	parserOptions: {
		sourceType: 'module',
	},
	env: {
		es6: true,
		node: true,
	},
	plugins: ['n8n-nodes-base'],
	rules: {
		...require('eslint-plugin-n8n-nodes-base').configs.community.rules,
	},
	overrides: [
		{
			files: ['**/*.node.ts'],
			rules: {
				...require('eslint-plugin-n8n-nodes-base').configs.nodes.rules,
			},
		},
		{
			files: ['**/*.credentials.ts'],
			rules: {
				...require('eslint-plugin-n8n-nodes-base').configs.credentials.rules,
			},
		},
		{
			files: ['package.json'],
			plugins: ['eslint-plugin-n8n-nodes-base'],
			rules: {
				...require('eslint-plugin-n8n-nodes-base').configs.community.rules,
			},
		},
	],
};
