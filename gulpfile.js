const gulp = require("gulp");
const plumber = require("gulp-plumber");
const sourcemap = require("gulp-sourcemaps");
const postcss = require("gulp-postcss");
const sass = require('gulp-sass')(require('sass'));
const autoprefixer = require("autoprefixer");
const csso = require("postcss-csso");
const rename = require("gulp-rename");
const htmlmin = require("gulp-htmlmin");
const terser = require("gulp-terser");
const squoosh = require("gulp-libsquoosh");
const webp = require("gulp-webp");
const del = require("delete");
const sync = require("browser-sync").create();

// Styles

const styles = () => {
  return gulp.src("source/sass/style.scss")
    .pipe(plumber())
    .pipe(sourcemap.init())
    .pipe(sass())
    .pipe(postcss([
      autoprefixer(),
      csso()
    ]))
    .pipe(rename("style.min.css"))
    .pipe(sourcemap.write("."))
    .pipe(gulp.dest("build/css"))
    .pipe(sync.stream());
}

exports.styles = styles;

// Html

const html = () => {
  return gulp.src("source/*.html")
    .pipe(htmlmin({ collapseWhitespace: true }))
    .pipe(gulp.dest("build"));
}

exports.html = html;

// Scripts

// const script = () => {
//   return gulp.src(
//     "source/js/script.js", {
//       allowEmpty: true
//     })
//     .pipe(terser())
//     .pipe(rename("script.min.js"))
//     .pipe(gulp.dest("build/js"))
//     .pipe(synk.stream());
// }

// exports.script = script;

// Images

const minImages = () => {
  return gulp.src("source/img/**/*.{png,jpg,svg}")
    .pipe(squoosh())
    .pipe(gulp.dest("build/img"));
}

exports.minImages = minImages;

const copyImages = () => {
  return gulp.src("source/img/**/*.{png,jpg,svg}")
  .pipe(gulp.dest("build/img"));
}

exports.copyImages = copyImages;

// Webp

const convertWebp = () => {
  return(gulp.src([
    "source/img/*.{jpg,png}",
    "source/img/catalog/*.{jpg,png}"
    ], {
      base: "source"
    }))
    .pipe(webp({quality: 90}))
    .pipe(gulp.dest("build"));
}

exports.convertWebp = convertWebp;

// Copy

const copy = (done) => {
  gulp.src([
    "source/fonts/*.{woff,woff2}",
    "source/*.ico",
    "source/*.webmanifest",
    "source/*.js",
    "source/img/**/*.svg",
    "!source/img/icon/*.svg"
  ], {
    base: "source"
  })
    .pipe(gulp.dest("build"))
  done();
}

exports.copy = copy;

// Clean

const clean = () => {
  return del("build");
};

exports.clean = clean;

// Server

const server = (done) => {
  sync.init({
    server: {
      baseDir: 'build'
    },
    cors: true,
    notify: false,
    ui: false,
  });
  done();
}

exports.server = server;

// Watcher

const watcher = () => {
  gulp.watch("source/sass/**/*.scss", gulp.series("styles"));
  gulp.watch("source/*.html").on("change", sync.reload);
}

// Build

const build = gulp.series(
  clean,
  copy,
  minImages,
  gulp.parallel(
    styles,
    html,
    convertWebp
  ),
);

exports.build = build;

//

exports.default = gulp.series(
  clean,
  copy,
  copyImages,
  gulp.parallel(
    styles,
    html,
    convertWebp
  ),
  gulp.series(
    server,
    watcher
  )
);

