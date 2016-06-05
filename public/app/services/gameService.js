(function (angular) {
    Array.prototype.getById = function (id) {
        var i;
        for (i = 0; i < this.length; i++) {
            if (this[i].id == id) {
                return this[i];
            }
        }
        return null;
    };
    Array.prototype.removeById = function (id) {
        var i;
        for (i = 0; i < this.length; i++) {
            if (this[i].id == id) {
                this.splice(i, 1);
                return;
            }
        }
    };

    angular.module('app')
        .service('$game', ['$socket', '$rootScope', function ($socket, $rootScope) {

            var sessionid = null,
                game = {
                    me: null,
                    turnDirection: 0,
                    players: {
                        all: [],
                        online: [],
                        playing: [],
                        count: 0,
                    },
                    theme: 'default',
                    highscores: [],
                    obstacles: [],
                    interpolate: false,
                    watchGame: function () {
                        $socket.emit('watch');
                    },
                    stopWatchGame: function () {
                        $socket.emit('stopwatch');
                    },
                    play: function() {
                        $socket.emit('play', {});
                    },
                    stopPlay: function() {
                        $socket.emit('stopPlay', {});
                    },
                    move: function () {
                        $socket.emit('move', {});
                    },

                    setHandle: function(handle) {
                        $socket.emit('setHandle', handle);
                        if(window.localStorage) {
                            window.localStorage.handle = handle;
                        }
                    }
                };

            window.onunload = function () {
                $socket.emit('disconnect');
                $socket.disconnect();
            };

            //cleanup
            setTimeout(function () {
                var i = 0, p = game.players.playing;
                for (i = 0; i < p.length; i++) {
                    if(!p[i].playing) {
                        game.players.playing.splice(i,1);
                        i--;
                    }
                }
            }, 10000);

            $socket.on('connect', function () {
                sessionid = $socket.io.engine.id;
                game.players.all.length = 0;
                game.players.online.length = 0;
                game.players.playing.length = 0;
                game.players.count = 0;
            });

            $socket.on('join', function (users) {
                var i, u, players = game.players;
                for (i = 0; i < users.length; i++) {
                    u = players.all.getById(users[i].id);
                    if (u) {
                        u.online = true;
                        if (!players.online.getById(users[i].id)) {
                            players.online.push(users[i]);
                        }
                        if (users[i].playing && !players.playing.getById(users[i].id)) {
                            players.online.push(users[i]);
                        }
                    } else {
                        players.all.push(users[i]);
                        if (users[i].online) {
                            players.online.push(users[i]);
                        }
                        if (users[i].playing) {
                            players.playing.push(users[i]);
                        }
                    }
                }
                if (!game.me) {
                    u = players.all.getById(sessionid);
                    game.me = u;
                    /*if (window.localStorage) {
                        var handle = window.localStorage.handle;
                        if (handle) {
                            game.setHandle(handle);
                        }
                    }*/
                    $rootScope.$apply();
                }
            });

            $socket.on('leave', function (users) {
                var i, u, players = game.players;
                $rootScope.$apply(function () {
                    for (i = 0; i < users.length; i++) {
                        u = players.all.getById(users[i].id);
                        if (u) {
                            u.online = false;
                            players.online.removeById(users[i].id);
                            players.playing.removeById(users[i].id);
                        }
                    }
                });
            });

            $socket.on('updatePlayer', function (user) {
                var players = game.players,
                    u = players.all.getById(user.id);
                if (u) {
                    $rootScope.$apply(function () {
                        u.handle = user.handle;
                        u.highscore = user.highscore;
                        u.color = user.color;
                        u.rank = user.rank;
                        u.score = user.score;
                        //u.img = user.img;
                        if (!u.playing && user.playing) {
                            players.playing.push(u);
                            u.playing = user.playing;
                        } else if (u.playing && !user.playing) {
                            players.playing.removeById(u.id);
                            u.playing = user.playing;
                        }
                    });
                } else {
                    console.log('user not found');
                }
            });
            $socket.on('move', function (data) {
                var i, u, players = game.players,
                    users = data.p,
                    obstacles = data.b;
                for (i = 0; i < users.length; i++) {
                    u = players.playing.getById(users[i].id);
                    if (u) {
                        u.x = users[i].x;
                        u.y = users[i].y;
                        u.ys = users[i].ys;
                        u.score = users[i].score;
                        u.life = users[i].life;
                    }
                }
                game.obstacles = obstacles;
                game.interpolate = false; //we got real values, do not interpolate before draw
            });

            $socket.on('direction', function(data) {
                game.turnDirection = data;
            });
            
            $socket.on('highscores', function (data) {
                $rootScope.$apply(function () {
                    var i;
                    game.highscores.length = 0;

                    for (i = 0; i < data.length; i++) {
                        game.highscores.push(data[i]);
                    }
                });
            });

            return game;
        }]);

}(angular));