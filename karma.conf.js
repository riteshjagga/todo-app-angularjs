//jshint strict: false
module.exports = function (config) {
    config.set({

        basePath: './app',

        files: [
            'lib/angular/angular.js',
            'lib/angular-animate/angular-animate.js',
            'lib/angular-messages/angular-messages.js',
            'lib/@uirouter/angularjs/release/angular-ui-router.js',
            'lib/angular-ui-bootstrap/dist/ui-bootstrap*.js',
            'lib/angular-toastr/dist/angular-toastr.tpls.js',
            '../node_modules/angular-mocks/angular-mocks.js',
            'app.js',
            '**/*.module.js',
            'core/**/*.js',
            'main/**/*.js',
            'tags/**/*.js',
            'todos/**/*.js'
            //'view*/**/*.js'
        ],

        autoWatch: true,

        frameworks: ['jasmine'],

        browsers: ['Chrome'],

        reporters: ['progress', 'coverage'],
        preprocessors: {
            '*.js': 'coverage',
            '**/core/**/!(*spec).js': 'coverage',
            '**/main/**/!(*spec).js': 'coverage',
            '**/tags/**/!(*spec).js': 'coverage',
            '**/todos/**/!(*spec).js': 'coverage'
        },
        // optionally, configure the reporter
        coverageReporter: {
            type: 'html',
            dir: '../coverage/'
        },
        plugins: [
            'karma-chrome-launcher',
            'karma-firefox-launcher',
            'karma-jasmine',
            'karma-coverage'
        ]

    });
};
