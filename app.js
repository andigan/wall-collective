// wall-collective
//
// Version: 0.7.0
// Requires: jQuery v1.7+
//           jquery-ui
//           jquery.form
//           jquery.mobile-events
//           jquery.ui.touch-punch
//           socket.io v1.3.7+
//           interact.js
//
// Copyright (c) 2018 Andrew Nease (andrew.nease.code@gmail.com)

var config = require('./config/config'),
    port = process.env.PORT || config.port,

    // create the server using express framework
    express = require('express'),
    app = express(),

    cookieParser = require('cookie-parser'),

    // MongoDB; functions to connect to database, create models
    db = require('./db/db'),

    // igram authorization middleware
    igramAuth = require('./i-gram/auth/igram-auth.js'),

    // oauth and sessions; set up passport serialization; manage sessions; save sessions to db
//    passport = require('passport'),
//    passportInit = require('./auth/passport-init'),
//    session = require('express-session'),
//    MongoStore = require('connect-mongo')(session),

    // templating engine
    handlebars = require('express-handlebars'),
    hbHelpers = require('./views/helpers'),

    // express router
    router = require('./routes/router'),

    // utility modules
    path = require('path'),

    server = {},
    io = {};

// express method to set 'views' directory
app.set('views', path.join(__dirname, 'views'));

// set up templating engine
app.engine('handlebars', handlebars(
  { defaultLayout: 'main',
    helpers: hbHelpers,
    partialsDir: [ 'shared/templates/', 'views/partials/' ]
  }));
app.set('view engine', 'handlebars');

// app.use mounts the middleware
// express.static middleware serves static files, such as .js, .img, .css files
app.use(express.static(path.join(__dirname, 'public')));

// cookie Parser
app.use(cookieParser());

// set up database
db.init();

// --Initialize server
server = app.listen(port, function () {
  console.log('\nListening on port %d \n', server.address().port);
});

// --Socket.io
io = require('socket.io').listen(server);
require('./socketio/connection')(io);

// attach socket connection to response object
app.use(function (req, res, next) {
  res.io = io;
  next();
});

// routing

// middleware for igram authorization
if (config.useIGram) {
  app.use(igramAuth);
};

app.use('/', router);

module.exports = app;
