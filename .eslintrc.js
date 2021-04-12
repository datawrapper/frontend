module.exports = {
	parser: 'babel-eslint',
	plugins: ['svelte3'],
	overrides: [
		{
			files: ['**/*.svelte'],
			processor: 'svelte3/svelte3'
		}
	],
	rules: {
		'no-console': [
			'error',
			{
				allow: ['warn', 'error']
			}
		],
		camelcase: [
			'warn',
			{
				ignoreDestructuring: true,
				properties: 'never'
			}
		]
	},
	settings: {
		'svelte3/ignore-styles': attrs => attrs.lang === 'less'
	}
};
