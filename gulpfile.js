
// Initialize modules
const { src, dest, watch, series } = require('gulp');
const sass = require('gulp-sass')(require('sass'));
const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const cssnano = require('cssnano');
const babel = require('gulp-babel');
const terser = require('gulp-terser');
const browsersync = require('browser-sync').create();

// Use dart-sass for @use

// Sass Task
function scssTask() {
  return src('app/scss/style.scss', { sourcemaps: true }) //taking main sass file & perform cleanup tasks
    .pipe(sass()) 
    .pipe(postcss([autoprefixer(), cssnano()])) // autoprefixer() - add prefixs to support all browser(most), cssnano to minify cssfiles
    .pipe(dest('dist', { sourcemaps: '.' })); // saving in 'dist' folder
}

// JavaScript Task
function jsTask() {
  return src('app/js/script.js', { sourcemaps: true })
    .pipe(babel({ presets: ['@babel/preset-env'] })) //make ES6 javascript supporting older browser
    .pipe(terser()) // minifying js file
    .pipe(dest('dist', { sourcemaps: '.' })); //saving in 'dist' folder
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
     //spinning up local server, watching & auto save changes
  watch('*.html', browserSyncReload);
  watch(
    ['app/scss/**/*.scss', 'app/**/*.js'],
    series(scssTask, jsTask, browserSyncReload)
  );
}

// Default Gulp Task
exports.default = series(scssTask, jsTask, browserSyncServe, watchTask);

// Build Gulp Task
exports.build = series(scssTask, jsTask);