
// Initialize modules
// Importing specific gulp API functions lets us write them below as series() instead of gulp.series()
const { src, dest, watch, series, parallel } = require('gulp');
// Importing all the Gulp-related packages we want to use
const sass = require('gulp-sass')(require('sass'));
const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const cssnano = require('cssnano');
const babel = require('gulp-babel');
const terser = require('gulp-terser');
const replace = require('gulp-replace');
const browsersync = require('browser-sync').create();

// File paths
const files = {
	scssPath: './scss/**/*.scss',
	jsPath: './js/**/*.js',
};

// Sass Task
function scssTask() {
  return src(files.scssPath, { sourcemaps: true }) //taking main sass file & perform cleanup tasks
    .pipe(sass())  // compile SCSS to CSS
    .pipe(postcss([autoprefixer(), cssnano()])) // PostCSS plugins,  autoprefixer() - add prefixs to support all browser(most), cssnano to minify cssfiles
    .pipe(dest('dist', { sourcemaps: '.' })); // put final CSS in dist folder with sourcemap, saving in 'dist' folder
}

// JavaScript Task
function jsTask() {
  return src(files.jsPath, { sourcemaps: true })
    .pipe(babel({ presets: ['@babel/preset-env'] })) //make ES6 javascript supporting older browser
    .pipe(terser()) // minifying js file
    .pipe(dest('dist', { sourcemaps: '.' })); //saving in 'dist' folder
}

// Cachebust
function cacheBustTask() {
	var cbString = new Date().getTime();
	return src(['index.html'])
		.pipe(replace(/cb=\d+/g, 'cb=' + cbString))
		.pipe(dest('.'));
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

// Watch Task

function watchTask() {
  // Watch task: watch SCSS and JS files for changes
  // If any change, run scss and js tasks simultaneously
  watch(
    ['app/scss/**/*.scss', 'app/**/*.js'],
    series(parallel(scssTask, jsTask), cacheBustTask)
  );
}

// Browsersync Watch task
function bsWatchTask() {
  // Watch HTML file for change and reload browsersync server
  // watch SCSS and JS files for changes, run scss and js tasks simultaneously and update browsersync

	watch('index.html', browserSyncReload);
	watch(
		['app/scss/**/*.scss', 'app/**/*.js'],
		{ interval: 1000, usePolling: true }, //Makes docker work
		series(parallel(scssTask, jsTask), cacheBustTask, browserSyncReload)
	);
}

// Export the default Gulp task so it can be run
// Runs the scss and js tasks simultaneously
// then runs cacheBust, then watch task
exports.default = series(parallel(scssTask, jsTask), cacheBustTask, browserSyncServe, watchTask);

// Build Gulp Task
exports.build = series(
  parallel(scssTask, jsTask),
  cacheBustTask,
  browserSyncServe,
  bsWatchTask);