import gulp from 'gulp';
import plumber from 'gulp-plumber';
import pug from 'gulp-pug';
import browserSync from 'browser-sync';
import sass from 'gulp-sass';
import postcss from 'gulp-postcss';
import cssnano from 'cssnano';
import watch from 'gulp-watch';
import browserify from 'browserify';
import babelify from 'babelify';
import source from 'vinyl-source-stream';
import sourcemaps from 'gulp-sourcemaps';
import buffer from 'vinyl-buffer';
import imagemin from 'gulp-imagemin';
import pngcrush from 'imagemin-pngcrush';
import notify from 'gulp-notify';

const server = browserSync.create();

const postcssPlugins = [
  cssnano({
    core: false,
    autoprefixer: {
      add: true,
      browsers: '> 1%, last 2 versions, Firefox ESR, Opera 12.1'
    }
  })
];

const sassOptions = {
  outputStyle: 'expanded',
  includePaths: ['node_modules']
};

gulp.task('styles', () =>
  gulp.src('./dev/scss/styles.scss')
    .pipe(sourcemaps.init({ loadMaps: true }))
    .pipe(plumber())
    .pipe(sass(sassOptions))
    .pipe(postcss(postcssPlugins))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('./public/css'))
    .pipe(server.stream({match: '**/*.css'}))
);

gulp.task('pug', () =>
  gulp.src('./dev/pug/pages/*.pug')
    .pipe(plumber())
    .pipe(pug())
    .pipe(gulp.dest('./public'))
);

gulp.task('scripts', () =>
  browserify('./dev/js/index.js')
    .transform(babelify)
    .bundle()
    .on('error', function(err){
      console.error(err);
      this.emit('end')
    })
    .pipe(source('scripts.js'))
    .pipe(buffer())
    .pipe(sourcemaps.init({ loadMaps: true }))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('./public/js'))
);

gulp.task('images', function() {
 gulp.src('./dev/images/**/*.{png,jpg,jpeg,gif}')//Ruta a la carpeta images a puntando a las imágenes 
  .pipe(imagemin({
    progressive: true,
    svgoPlugins: [{removeViewBox: false}],
    use: [pngcrush()]
  }))
  .pipe(gulp.dest('./public/images')) //Carpeta donde se guardaran las imágenes comprimidas
  .pipe(notify("La tarea images a culminado!"));//Mensaje gracias a `gulp-notify`
});

//Vuelve a ejecutar la tarea cuando se modifica algún archivo 
gulp.task('watch', function(){
  gulp.watch('./dev/images/**/*', ['images']);
});


gulp.task('copy', function() {
 gulp.src('./dev/images/**/*.svg')
  .pipe(gulp.dest('./public/images'))
});

gulp.task('copy', function(){
  gulp.watch('./dev/images/**/*.svg', ['copy']);
});

gulp.task('default', () => {
  server.init({
    server: {
      baseDir: './public'
    },
  },);

  watch('./dev/scss/**/*.scss', () => gulp.start('styles'));
  watch('./dev/js/**/*.js', () => gulp.start('scripts',server.reload) );
  watch('./dev/pug/**/*.pug', () => gulp.start('pug', server.reload) );
  watch('./dev/images/**/*.{png,jpg,jpeg,gif}', () => gulp.start('images') );
  watch('./dev/images/**/*.svg', () => gulp.start('copy') );
});
