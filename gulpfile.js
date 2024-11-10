import gulp from 'gulp';
import plumber from 'gulp-plumber';
import less from 'gulp-less';
import postcss from 'gulp-postcss';
import csso from 'postcss-csso';
import autoprefixer from 'autoprefixer';
import browser from 'browser-sync';
import rename from 'gulp-rename';
import htmlmin from 'gulp-htmlmin';
import imagemin, { optipng, mozjpeg, svgo } from "gulp-imagemin";
import { deleteAsync } from 'del';
import webp from 'gulp-webp';
import svgstore from 'gulp-svgstore';

export const clean = async () => {
  return await deleteAsync("build", { force: true });
}

// Styles
export const styles = () => {
  return gulp.src('source/less/style.less', { sourcemaps: true })
    .pipe(plumber())
    .pipe(less())
    .pipe(postcss([
      autoprefixer(),
      csso()
    ]))
    .pipe(rename('style.min.css'))
    .pipe(gulp.dest('build/css', { sourcemaps: '.' }))
    .pipe(browser.stream());
}

// Html
export const html = () => {
  return gulp.src('source/*.html')
    .pipe(htmlmin({ collapseWhitespace: true }))
    .pipe(gulp.dest('build'))
}


// Images
export const optimizeImages = () => {
  return gulp.src('source/img/**/*.{png,jpg,svg}')
    .pipe(imagemin([
      optipng({ optimizationLevel: 3 }),
      mozjpeg({ progressive: true }),
      svgo()
    ]))
    .pipe(gulp.dest('build/img'))
}
export const copyImages = () => {
  return gulp.src('source/img/**/*.{png,jpg,svg}')
    .pipe(gulp.dest('build/img'))
}

// Sprite
export const sprite = () => {
  return gulp.src('source/img/icon/*.svg')
    .pipe(imagemin([
      svgo()
    ]))
    .pipe(svgstore({ inlineSvg: true }))
    .pipe(rename('sprite.svg'))
    .pipe(gulp.dest('build/img'))
}

// CopyFonts
export const copyFonts = () => {
  return gulp.src(
    [
      'source/fonts/**/*.{woff,woff2}',
      'source/favicon.ico',
      'source/manifest.webmanifest'
    ],
    { base: 'source' })
    .pipe(gulp.dest('build'))
}

// Webp
export const createWebp = () => {
  return gulp.src("source/img/**/*.{jpg,png}")
    .pipe(webp({ quality: 90 }))
    .pipe(gulp.dest("build/img"));
}

// Server
const server = (done) => {
  browser.init({
    server: {
      baseDir: 'build'
    },
    cors: true,
    notify: false,
    ui: false,
  });
  done();
}

// Watcher

const watcher = () => {
  gulp.watch('source/less/**/*.less', gulp.series(styles));
  gulp.watch('source/*.html').on('change', gulp.series(html, browser.reload));
}

export const build =
  gulp.series(
    clean,
    gulp.parallel(
      html, copyFonts, optimizeImages, sprite, createWebp, styles
    )
  )

export default gulp.series(
  clean,
  gulp.parallel(
    html, copyFonts, copyImages, sprite, createWebp, styles
  ),
  gulp.series(
    server, watcher
  )
);
