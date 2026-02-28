const { src, dest } = require('gulp');

function buildAssets() {
	return src('nodes/**/*.{png,svg,json}')
		.pipe(dest('dist/nodes'));
}

exports.default = buildAssets;
exports['build:icons'] = buildAssets;
