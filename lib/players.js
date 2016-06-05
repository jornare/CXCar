var fs = require('fs'),
    io,
    players = [],
    playing = [],
    colors = [  'purple', 'blue', 'yellow', 'green', 'red','black', 'brown', 'darkblue', 'lightblue',
                'darkgreen', 'blueviolet', 'coral', 'crimson', 'magenta', 'orange', 'orangered', 'cyan'],
    colorId = 0;

Array.prototype.remove = function (obj) {
    var i = this.indexOf(obj);
    if (i >= 0) {
        this.splice(i, 1);
    }
}

function Player(p) {
    this.id = p.id || 0;
    this.handle = p.handle || '';
    this.img = p.img || '';
    this.score = p.score || 0;
    this.highscore = p.highscore || 0;
    this.online = false;
    this.playing = false; //if player is currently playing/in game
    this.color = p.color || 'red';
    this.rank = 0;
    this.reset();
}

Player.prototype.reset = function () {
    this.life = -1800;
    this.x = -10;
    this.lane = Math.floor(Math.random() * 9); //9 == number of lanes
    this.y = this.lane * 10 + 40;
}

//score is calculated based on lifetime
Player.prototype.updateScore = function () {
    var newScore = Math.floor(Math.max(this.life * 0.0001, 0));
    if(newScore == this.score) {
        return;
    }
    this.score = newScore;
    if (newScore > this.highscore) {
        this.highscore = newScore;
        exports.savePlayers();
        checkHighscores();
    }
    io.emit('updatePlayer', this);
}

Player.prototype.startPlaying = function () {
    this.reset();
    this.playing = true;
    this.score = 0;
    this.color = colors[colorId++ % colors.length];
    playing.push(this);
};

Player.prototype.stopPlaying = function () {
    this.playing = false;
    this.score = 0;
    this.life = -1800;
    var i = playing.indexOf(this);
    if (i >= 0) {
        playing.splice(i, 1);
    }
};


Player.prototype.die = function () {
    this.reset();
    this.updateScore();
};

Player.prototype.getPlayMove = function () {
    return {
        id: this.id,
        x: this.x,
        y: this.y,
       // ys: this.ys,
        score: this.score,
        life: this.life
    };
}

/*
 Player.prototype.join = function (socket) {
 this.socket = socket;
 io.sockets.emit('join', players);
 }*/

Player.prototype.leave = function () {

}

exports.init = function (socketsio) {
    io = socketsio;
}

exports.join = function (socket) {
    var id = socket.id;
    console.log('join ', id);
    if(id.substr(0, 2) === '/#') {
        id = id.substr(2);
    }
    var p = new Player({
        id: id
    });
    p.online = true;
    socket.player = p;
    players.push(p);
    io.emit('join', players);
    return p;
}

exports.login = function (socket, data) {

};


exports.remove = function (player) {
    players.remove(player);
    playing.remove(player);
};

exports.leave = function (socket) {
    socket.player.online = false;
    socket.player.playing = false;
    playing.remove(socket.player);
    io.emit('leave', [socket.player]);
}

exports.getByHandle = function (handle) {
    var i;
    for (i = 0; i < players.length; i++) {
        if (players[i].handle == handle) {
            return players[i];
        }
    }
    return null;
}

exports.getPlayMoves = function () {
    var i, moves = [];
    for (i = 0; i < playing.length; i++) {
        moves.push(playing[i].getPlayMove());
    }
    return moves;
}

exports.savePlayers = function () {
    var i, playersToSave = [];
    for (i = 0; i < players.length; i++) {//only save players with highscore >1
        if (players[i].highscore > 1) {
            playersToSave.push(players[i]);
        }
    }
    fs.writeFile('players.txt', JSON.stringify(playersToSave), function (err) {
        if (err) {
            console.log(err);
        }
        else {
            console.log('Players saved');
        }
    });
}

exports.loadPlayers = function () {
    fs.readFile('players.txt', 'utf8', function (err, data) {
        if (err) {
            console.log(err);
            return;
        }
        try {
            var json = JSON.parse(data), i;
            for (i = 0; i < json.length; i++) {
                players.push(new Player(json[i]));
            }
        } catch (ex) {
            console.log('failed loading');
        }
    });
}

exports.highscores = function () {
    var h = players.sort(function (player1, player2) {
        return  player2.highscore - player1.highscore;
    });
    h = h.filter(function (element) {
        if (element.highscore == 0) {
            return false;
        }
        else {
            return true;
        }
    });
    for (i = 0; i < players.length; i++) {
        players[i].rank = i + 1;
    }
    return h.slice(0, 10);
};

exports.players = players;
exports.playing = playing;

function checkHighscores() {
    var highscores = exports.highscores();
    io.emit('highscores', highscores);
}