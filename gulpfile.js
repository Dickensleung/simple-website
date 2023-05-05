// Initialize modules
const { src, dest, watch, series, parallel } = require('gulp');
const sass = require('gulp-sass')(require('sass'));
const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const cssnano = require('cssnano');
const babel = require('gulp-babel');
const terser = require('gulp-terser');
const browsersync = require('browser-sync').create();


// Sass Task
function scssTask() {
  return src('app/scss/**/*.scss', { sourcemaps: true })
    .pipe(sass())
    .pipe(postcss([autoprefixer(), cssnano()]))
    .pipe(dest('dist/styles', { sourcemaps: '.' }))
}


// JavaScript Task
function jsTask() {
	return src('app/js/**/*.js', { sourcemaps: true })
		.pipe(babel({ presets: ['@babel/preset-env'] }))
		.pipe(terser())
		.pipe(dest('dist/js', { sourcemaps: '.' }))
}


// Browsersync
function browserSyncServe(cb) {
	browsersync.init({
		server: {
			baseDir: '.',
		},
		notify: {
			styles: {
				top: 'auto',
				bottom: '0',
			},
		},
	});
	cb();
}

function browserSyncReload(cb) {
	browsersync.reload();
	cb();
}



// Watch task: watch SCSS and JS files for changes
// If any change, run scss and js tasks simultaneously
function watchTask() {
	watch('*.html',browserSyncReload);
	watch(
		['app/scss/**/*.scss', 'app/js/**/*.js'], 
		series(scssTask, jsTask, browserSyncReload)
		)
}


// Export the default Gulp task so it can be run
// Runs the scss and js tasks simultaneously
// then runs cacheBust, then watch task
exports.default = series(parallel(scssTask, jsTask), browserSyncServe, watchTask);
// Build Gulp Task
exports.build = series(scssTask, jsTask);
