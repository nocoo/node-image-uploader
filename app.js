/*
    t-mac
    @author  Zheng Li <lizheng@lizheng.me>
    @license MIT
    @version 0.1.0
*/

var express = require('express')
  , pages   = require('./routes/pages')
  , http    = require('http')
  , conf    = require('./config').conf();

var app = module.exports = express.createServer();

app.enable("jsonp callback");

app.configure(function() {
    app.set('port', process.env.PORT || conf.run.port);
    app.set('view engine', 'ejs');
    app.set('views', __dirname + '/views');
    app.use(express.bodyParser({ uploadDir: './tmp' }));
    app.use(express.methodOverride());
    app.use(app.router);
    app.use(express.static(__dirname + '/public'));

    //app.use(express.logger('dev'));
    //app.use(express.cookieParser());
    //app.use(express.session({ secret: "YouKnowWhat", maxAge: conf.timeout }));
});

app.configure('development', function() {
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function() {
    app.use(express.errorHandler());
});

// Routes.
app.get('/', pages.index);
app.get('/upload', pages.upload);
app.get('/api/images/timeline/:category/:lastid/:time?/:module?', pages.imagestimeline);
app.post('/api/hide', pages.apihide);
app.post('/api/upload', pages.apiupload);

app.listen(conf.run.port);
pages.log('T-MAC server is listening on port ' + conf.run.port + ' in ' + app.settings.env + ' mode.');