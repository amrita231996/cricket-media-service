const gulp = require('gulp');
const babel = require('gulp-babel');
// const uglify = require('gulp-uglify');
const del = require('del');
const zip = require('gulp-zip');

const buildFilesPaths = {
  root_path: ['*.js', '!gulpfile.js'],
  auth_path: ['./auth/**/*.js'],
  helper_path: ['./helper/*.js'],
  public_js_path: ['./public/**/*.js'],
  public_image_path: ['./public/*'],
  nonJs: ['package.json'],
  config: ['./config/*'],
  envCopy: ['./config/.env.development'],
  feed_path: ['./feed/**/*'],
};

gulp.task('clean', () => del('dist/**', { force: true }));

gulp.task('copynojs', () =>
  gulp.src(buildFilesPaths.nonJs).pipe(gulp.dest('dist'))
);

gulp.task('copyimage', () =>
  gulp.src(buildFilesPaths.public_image_path).pipe(gulp.dest('dist/public'))
);

gulp.task('minifypublicjs', () =>
  gulp
    .src(buildFilesPaths.public_js_path)
    // .pipe(uglify())
    .pipe(gulp.dest('dist/public'))
);

gulp.task('minifyauth', () =>
  gulp
    .src(buildFilesPaths.auth_path)
    .pipe(
      babel({
        presets: ['@babel/preset-env'],
      })
    )
    // .pipe(uglify())
    .pipe(gulp.dest('dist/auth'))
);

gulp.task('minifyhelper', () =>
  gulp
    .src(buildFilesPaths.helper_path)
    .pipe(
      babel({
        presets: ['@babel/preset-env'],
      })
    )
    // .pipe(uglify())
    .pipe(gulp.dest('dist/helper'))
);

gulp.task('minifyroot', () =>
  gulp
    .src(buildFilesPaths.root_path)
    .pipe(
      babel({
        presets: ['@babel/preset-env'],
      })
    )
    // .pipe(uglify())
    .pipe(gulp.dest('dist'))
);

gulp.task('copyEnv', () =>
  gulp.src(buildFilesPaths.envCopy).pipe(gulp.dest('dist/config'))
);

gulp.task('minifyconfig', () =>
  gulp
    .src(buildFilesPaths.config)
    .pipe(
      babel({
        presets: ['@babel/preset-env'],
      })
    )
    // .pipe(uglify())
    .pipe(gulp.dest('dist/config'))
);

gulp.task('zip', () =>
  gulp.src('dist/**').pipe(zip('artifact.zip')).pipe(gulp.dest('dist'))
);

gulp.task('minifyfeed', () =>
  gulp
    .src(buildFilesPaths.feed_path)
    .pipe(
      babel({
        presets: ['@babel/preset-env'],
      })
    )
    // .pipe(uglify())
    .pipe(gulp.dest('dist/feed'))
);


gulp.task(
  'build',
  gulp.series(
    'clean',
    'copynojs',
    'copyimage',
    'minifypublicjs',
    'minifyauth',
    'minifyhelper',
    'minifyfeed',
    'minifyroot',
    'minifyconfig',
    'copyEnv',
  )
);
