// generated on 2015-09-04 using generator-gulp-webapp 1.0.3
import gulp from 'gulp';
import nodemon from 'gulp-nodemon';
import concat from 'gulp-concat';
import sourcemaps from 'gulp-sourcemaps';
import autoprefixer from 'gulp-autoprefixer';
import uglify from 'gulp-uglify';
import babel from 'gulp-babel';
import less from 'gulp-less';

var bowerDir = 'bower_components';
var nodeDir = 'node_modules';
var fontSource = [
    bowerDir + '/simple-line-icons/fonts/**/*',
    bowerDir + '/bootstrap-sass/assets/fonts/bootstrap/**/*'
];
var jsSource = [
    bowerDir + '/jquery/dist/jquery.js',
    bowerDir + '/angular/angular.min.js',
    // bowerDir + '/bootstrap-sass/assets/javascripts/bootstrap/*.js',
    bowerDir + '/angular-ui-router/release/angular-ui-router.min.js',
    bowerDir + '/angular-resource/angular-resource.min.js',
    bowerDir + '/angular-cookies/angular-cookies.js',
    bowerDir + '/angular-sanitize/angular-sanitize.js',
    bowerDir + '/angular-animate/angular-animate.min.js',
    bowerDir + '/angular-bootstrap/ui-bootstrap-tpls.min.js',
    bowerDir + '/angular-xeditable/dist/js/xeditable.js',
    bowerDir + '/blueimp-file-upload/js/vendor/jquery.ui.widget.js',
    bowerDir + '/blueimp-file-upload/js/jquery.fileupload.js',
    bowerDir + '/blueimp-file-upload/js/jquery.iframe-transport.js',
    bowerDir + '/blueimp-file-upload/js/jquery.fileupload-process.js',
    // bowerDir + '/blueimp-file-upload/js/jquery.fileupload-image.js',
    // bowerDir + '/blueimp-file-upload/js/jquery.fileupload-audio.js',
    // bowerDir + '/blueimp-file-upload/js/jquery.fileupload-video.js',
    bowerDir + '/blueimp-file-upload/js/jquery.fileupload-validate.js',
    bowerDir + '/blueimp-file-upload/js/jquery.fileupload-angular.js',
    bowerDir + '/sweetalert/dist/sweetalert.min.js',
    bowerDir + '/iCheck/icheck.min.js'
];
var headJsSource = [
    bowerDir + '/modernizr/modernizr.js',
];
var cssSource = {
    iCheck: bowerDir + '/iCheck/**/*',
};

var vendorStyleSource = [
    bowerDir + '/blueimp-file-upload/css/jquery.fileupload.css',
    bowerDir + '/blueimp-file-upload/css/jquery.fileupload-ui.css',
    bowerDir + '/sweetalert/dist/**/*.css',
    bowerDir + '/animate.css/animate.css',
    bowerDir + '/malihu-custom-scrollbar-plugin/jquery.mCustomScrollbar.css',
    bowerDir + '/select2/dist/css/select2.css',
    bowerDir + '/slick-carousel/slick/slick.css',
    bowerDir + '/angular-xeditable/dist/css/xeditable.css'
];
// Start server
gulp.task('start-server', () => {
    nodemon({
        script: 'server.js',
        ext: 'js',
        ignore: ['./node_modules/**']
    })
    .on('restart', () => {
        console.log('Restarting...');
    });
});

gulp.task('vendorStyles', () => {
    gulp.src(vendorStyleSource)
    .pipe(concat('vendors.css'))
    .pipe(gulp.dest('app/public/styles/vendors/'));
});


// // compile SASS
// gulp.task('sass', () => {
//     return gulp.src('app/public/sass/*.scss')
//     .pipe(sourcemaps.init())
//     .pipe(sass.sync({
//         outputStyle: 'expanded',
//         precision: 10,
//         includePaths: ['.']
//     }).on('error', sass.logError))
//     .pipe(autoprefixer({browsers: ['last 1 version']}))
//     .pipe(sourcemaps.write())
//     .pipe(gulp.dest('app/public/styles'));
// });
//
// // compile all style sheets on change
// gulp.task('sass:watch', () => {
//     gulp.watch('app/public/sass/**/*.scss', ['styles']);
// });

gulp.task('less', () => {
    return gulp.src('app/public/less/*.less')
    .pipe(less({
        compress: true          // Minify CSS output
    }))
    // .pipe(autoprefixer({browsers: ['last 1 version']}))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('app/public/styles'));
});

gulp.task('less:watch', () => {
    gulp.watch('app/public/less/**/*.less', ['less']);
});

// concat and uglify all vendor scripts
gulp.task('vendorScripts', () => {
    gulp.src(jsSource)
    .pipe(concat('vendors.js'))
    .pipe(uglify())
    .pipe(gulp.dest('app/public/scripts/'));
});
// concat and uglify scripts with be added to head
gulp.task('headScripts', function() {
    gulp.src(headJsSource)
    .pipe(concat('head.js'))
    .pipe(uglify())
    .pipe(gulp.dest('app/public/scripts/'));
});
// compile babel
gulp.task('babel', () => {
    return gulp.src('app/public/babel/**/*.js')
    .pipe(sourcemaps.init())
    .pipe(babel())
    .pipe(concat('main.js'))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('app/public/scripts'));
});

// compile babel files on change
gulp.task('babel:watch', () => {
    gulp.watch('app/public/babel/**/*.js', ['babel']);
});

gulp.task('babel-admin', () => {
    return gulp.src('app/public/babel-admin/**/*.js')
    .pipe(sourcemaps.init())
    .pipe(babel())
    .pipe(concat('admin.js'))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('app/public/scripts'));
});

// compile babel files on change
gulp.task('babel-admin:watch', () => {
    gulp.watch('app/public/babel-admin/**/*.js', ['babel-admin']);
});
// copy all css which cannot be included or minified
gulp.task('copyCss', () => {
    gulp
    .src(cssSource.iCheck)
    .pipe(gulp.dest('app/public/styles/vendors/iCheck'));
    // gulp
    // .src(cssSource.sweetalert)
    // .pipe(gulp.dest('app/public/styles/vendors/sweetalert'));
});
// copy fonts to app/public/fonts
gulp.task('fonts', () => {
    return gulp.src(fontSource)
    .pipe(gulp.dest('app/public/fonts/'));
});

gulp.task('server:watch', () => {
    gulp.watch('app/logics/**/*.js', ['start-server']);
});

gulp.task('dev', ['vendorStyles', 'vendorScripts', 'headScripts', 'less', 'less:watch', 'babel', 'babel:watch', 'babel-admin', 'babel-admin:watch', 'copyCss', 'fonts'], () => {
    // gulp.start();
});

gulp.task('build', ['vendorStyles', 'vendorScripts', 'headScripts', 'less', 'babel', 'copyCss', 'fonts'], () => {

});

gulp.task('default', [], () => {
    gulp.start('start-server');
});
