'use strict';
var players = require('./players'),
    obstacles = [],
    obstacleId = 1,
    io,
    time,
    emitCounter = 0,
    g = 0.00015,
    playerWidth = 10,
    playerHeight = 10,
    playerRad = 5,
    floor = 92,
    turnDirection = 0, // 0=up,1=right,2=down,3=back
    turnMoves = [-1, 0, 1, 0],
    totalLanes = 9,
    laneWidth = 5,
    lanesStartY = 40,
    obstacleSpeed = 0.015,
    obstacleWidth = 10,
    moveToFrontTime = 120 * 1000;


exports.init = function (socketio) {
    players.init(socketio);
    players.loadPlayers();
    io = socketio;
    setInterval(heartBeat, 40);
    setInterval(addObstacle, 1000);
    setInterval(changeDirection, 1000);
    setInterval(updateScores, 1000);
};

exports.connect = function (socket) {
    socket.on('login', function (data) {
        players.login(socket, data);
    });

    socket.on('play', function (data) {
        socket.player.startPlaying();
        io.sockets.emit('updatePlayer', socket.player);
    });

    socket.on('stopPlay', function (data) {
        socket.player.stopPlaying();
        io.sockets.emit('updatePlayer', socket.player);
    });

    socket.on('move', function (data) {
        //socket.player.ys = -0.08;
        socket.player.lane = (socket.player.lane + turnMoves[turnDirection]);
        if (socket.player.lane < 0 || socket.player.lane >= totalLanes) {
            socket.player.die();
        }
        heartBeat(true);
        //console.log(socket.player);
    });

    socket.on('watch', function (data) {
        socket.join('watch');
        socket.emit('join', players.players);
    });

    socket.on('stopwatch', function (data) {
        socket.leave('watch');
    });

    socket.on('disconnect', function () {
        console.log('disconnected');
        players.leave(socket);
        //io.sockets.emit('leave', {id: socket.player.id});
    });

    socket.on('setHandle', function (handle) {
        var oldplayer = players.getByHandle(handle);

        if (oldplayer == socket.player) {
            console.log('same player');
            socket.player.handle = handle;
        }
        else if (oldplayer && !oldplayer.online) {
            console.log('oldplayer, not online');
            oldplayer.online = true;
            oldplayer.id = socket.player.id;
            players.remove(socket.player);
            socket.player = oldplayer;
        }
        else if (oldplayer && oldplayer.online) {
            console.log('highjackingattempt?');
            console.log(oldplayer);
            console.log(socket.player);
            // This should not be allowed.
            // Trying to hijack online user.
            socket.emit('handleInUse', { error: 'Handle already in use!' });
        }
        else {
            console.log('setting handle ' + handle);
            socket.player.handle = handle;
        }
        io.emit('updatePlayer', socket.player);
    });

    players.join(socket);
    socket.emit('highscores', players.highscores());
};

function heartBeat(emit) {
    var now = Date.now(), dTime = now - time;
    time = now;
    if (dTime <= 0 && !emit) {
        return;
    }
    emitCounter += dTime;
    if (move(dTime) || emit || emitCounter > 1000) {
        emitCounter = 0;
        io.to('watch').emit('move', { p: players.getPlayMoves(), b: obstacles });
    }
}

function changeDirection() {
    turnDirection = turnDirection == 0 ? 2 : 0;
    io.to('watch').emit('direction', turnDirection);
}

function move(dTime) {
    var i, pList = players.playing, p, result = false;
    for (i = 0; i < obstacles.length; i++) {
        obstacles[i].x -= dTime * obstacleSpeed;
    }
    for (i = 0; i < pList.length; i++) {
        p = pList[i];
        p.life += dTime;
        p.y = p.lane * laneWidth + lanesStartY;
        if (p.life <= 0) {
            p.x = 5 + p.life / 60;
        } else {
            p.x = 5 + Math.min(70, 70 * ((p.life / moveToFrontTime) + (1.0 / (p.life * moveToFrontTime))));
            result = result || crashDetect(p);
        }
    }

    if (obstacles.length > 0 && obstacles[0].x + obstacles[0].w < -10) {
        obstacles.splice(0, 1);
    }
    return result;
}

function updateScores() {
    var i;
    for (i = 0; i < players.playing.length; i++) {
        players.playing[i].updateScore();
    }
}

function crashDetect(p) {
    var i, o;
    for (i = 0; i < obstacles.length; i++) { //obstacles are sorted after x value from left to right
        o = obstacles[i];
        if (o.x > p.x + playerWidth) {  //in front of player, nothing more to crash with
            return false;
        }
        if (p.x > o.x + obstacleWidth) { //behind player, not interresting

        } else {
            if (p.y == o.y) { //todo: better testing
                p.die();
                return true;
            }
        }
    }


    return false;
}

function addObstacle() {
    var lane = Math.floor(Math.random() * totalLanes);
    obstacles.push({
        id: obstacleId,
        x: 100,
        y: lane * laneWidth + lanesStartY
    });
    obstacleId++;
}
