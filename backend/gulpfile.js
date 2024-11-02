var gulp = require('gulp')
var ts = require('gulp-typescript')
var tsProject = ts.createProject('tsconfig.json')

gulp.task('tsc', function() {
    return tsProject.src().pipe(tsProject()).js.pipe(gulp.dest('dist'))
    //return gulp.src(['./node_modules/**/*.*']).pipe(gulp.dest('./dist/node_modules'))
})

gulp.task('copy-project', function() {
    return gulp.src(['./package.json']).pipe(gulp.dest('./dist/'))
})

gulp.task('copy-pdf-form-fills', function(done) {
    return gulp.src(['./pdf-form-fills/**/*.*']).pipe(gulp.dest('./dist/pdf-form-fills'))
})

gulp.task('default', gulp.series(
        'tsc',
        'copy-project',
        'copy-pdf-form-fills'
    ))