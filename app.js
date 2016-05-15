
/**
 * Module dependencies.
 */

var express = require('express'),
    routes = require('./routes'),
    user = require('./routes/user'),
    http = require('http'),
    path = require('path'),
    socketio = require('socket.io'),
    game = require('./lib/game.js'),
    app = express(),
    options = getCommandLineOptions();

//console.log(options);
// all environments
app.set('port', options.port || process.env.PORT || 80);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.favicon());
//app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);
app.use(require('stylus').middleware(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/theme', express.static(path.join(__dirname, 'public/img/themes/' + (options.theme || 'city'))));


// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);
app.get('/menu', routes.menu);
app.get('/player', routes.player);
app.get('/game', routes.game);
app.get('/highscores', routes.highscores);
app.get('/raffle', routes.raffle);
app.get('/users', user.list);

var server = http.createServer(app);
var io = socketio.listen(server);
io.set( 'origins', '*:*' );
server.listen(app.get('port'), function(){
	console.log('Express server listening on port ' + app.get('port'));
});


game.init(io, options);
io.sockets.on('connection', game.connect);
//io.set('log level', 1);

function getCommandLineOptions(){
    var result = {}, i, args;
    for (i = 0; i < process.argv.length; i++) {
        keyval = process.argv[i].split('=');
        if (keyval.length == 2) {
            result[keyval[0]] = keyval[1];
        }
    }
    return result;
}