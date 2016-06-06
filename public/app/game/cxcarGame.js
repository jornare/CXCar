window.cxcar = window.cxcar || {};

//RequestAnimationFrame polyfill
(function (window) {
    var lastTime = 0,
        vendors = ['webkit', 'moz'];
    for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
        window.cancelAnimationFrame =
          window[vendors[x] + 'CancelAnimationFrame'] || window[vendors[x] + 'CancelRequestAnimationFrame'];
    }

    if (!window.requestAnimationFrame)
        window.requestAnimationFrame = function (callback, element) {
            var currTime = new Date().getTime(),
                timeToCall = Math.max(0, 16 - (currTime - lastTime)),
                id = window.setTimeout(function () { callback(currTime + timeToCall); },
              timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };

    if (!window.cancelAnimationFrame)
        window.cancelAnimationFrame = function (id) {
            clearTimeout(id);
        };
}(window));
//end polyfill

(function (cxcar, window) {
    var floor = 92,
        playerWidth = 10,//must match server size of player for correct crash-detection
        playerHeight = 10,
        playerImg = new Image(),
        playerLeadImg = new Image(),
        playerImgMask = new Image(),
        turnsignRightImg = new Image(),
        turnsignLeftImg = new Image(),
        turnsignNoturnImg = new Image(),
        opponentImg = new Image(),
        //wheelImg = new Image(),
        obstaclesSpeed = 0.015,
        layeredRenderObjects = [],
        moveToFrontTime = 120 * 1000;// in ms 
    playerImg.src = '../../img/cxcarplayer1.png';
    playerLeadImg.src = '../../img/cxcarplayerLead.png';
    playerImgMask.src = '../../img/cxcarplayer1Mask.png';
    opponentImg.src = '../../img/opponent.png';
    turnsignRightImg.src = '../../img/turnsignRight.png';
    turnsignLeftImg.src = '../../img/turnsignLeft.png';
    //turnsignNoturnImg.src = '../../img/turnsign.png';

    //constructor
    cxcar.Game = function (ctx, gameService) {
        this.ctx = ctx;
        this.width = ctx.canvas.width;
        this.height = ctx.canvas.height;
        this.timer = null;
        this.gameService = gameService;
        this.background = new cxcar.Background(gameService.theme);
        this.xScale = 10.0;
        this.yScale = 6.0;
        this.time = Date.now();
        this.leader = null;
    };

    cxcar.Game.prototype.start = function () {
        var self = this;
        this.render();
        setInterval(function () { 
            var i,
                players = self.gameService.players.playing,
                p;

            for(i = 0; i < players.length; i++) {
                p = players[i];
                if (p.rank == 1 && self.leader !== p) {
                    if(self.leader) {
                        self.leader.rank = 2; //hack, in kase not updated from server
                        self.addPlayerBlob(self.leader); //turn off yellow 'shirt'
                    }
                    self.addPlayerBlob(p); //turn on yellow 'shirt'
                    self.leader = p;
                }
            }
        }, 5000);
    };

    cxcar.Game.prototype.stop = function () {
        window.cancelAnimationFrame(this.timer);
        //clearInterval(this.timer);
    };

    cxcar.Game.prototype.move = function () {
        var now = Date.now(),
            dt = now - this.time,
            pl = this.gameService.players.playing,
            p,
            obstacles = this.gameService.obstacles,
            self = this;
        this.layeredRenderObjects = [];
        this.time = now;
        this.timer = window.requestAnimationFrame(function(){self.render()});
        this.background.update(dt);

        
        for (i = 0; i < pl.length; i++) {
            if(this.gameService.interpolate) { //must be in sync with server movements
                p = pl[i];
                p.life += dt;
                if(p.life < 0) {
                    p.x = 5 + p.life / 60;
                } else {
                    p.x = 5 + Math.min(70, 70 * ((p.life  / moveToFrontTime) + (1.0/(p.life * moveToFrontTime))));
                }
            }
            this.layeredRenderObjects.push({
                obj: pl[i],
                z: pl[i].y,
                render: this.renderPlayer
            });
        }    
        for (i = 0; i < obstacles.length; i++) {
            if(this.gameService.interpolate) {
                obstacles[i].x -= dt * obstaclesSpeed;
            }
            this.layeredRenderObjects.push({
                obj: obstacles[i],
                z: obstacles[i].y,
                render: this.renderObstacle
            });
        } 
        this.layeredRenderObjects.sort(function(a, b) {
            return a.z - b.z;
        });
        this.gameService.interpolate = true;
    }

    cxcar.Game.prototype.render = function () {
        this.move();
        var ctx = this.ctx,//.getContext('2d');
            i,
            p, 
            pl = this.gameService.players.playing,
            obstacles = this.gameService.obstacles;


        this.background.draw(ctx);
        
        for(i=0; i<this.layeredRenderObjects.length; i++) {
            this.layeredRenderObjects[i].render.call(this, this.layeredRenderObjects[i].obj, ctx);
        }

        //temporary turn- direction text
        if(this.gameService.turnDirection == 0){ //left
            ctx.drawImage(turnsignLeftImg, 0,0);
        } else if(this.gameService.turnDirection == 2){ //right
            ctx.drawImage(turnsignRightImg, 0,0);
        } else {
            ctx.drawImage(turnsignNoturnImg, 0,0);
        }
        
    };


    cxcar.Game.prototype.renderPlayer = function (p, ctx) {
        var x = p.x * this.xScale,
            y = p.y * this.yScale,
            w = playerWidth * this.xScale,
            h = playerHeight * this.yScale;
        ctx.fillStyle = p.color;
        if (p.life < 0) {
            ctx.globalAlpha = 1.0 + (p.life % 500) * 0.0025;
        } else {
            ctx.globalAlpha = 1;
        }

        if (!p.canvas) {
            this.addPlayerBlob(p);
        }


        // if(p.score > 29) {
        //     if(!p.flame) {
        //         p.flame = new cxcar.Flame(x, y, w/2);
        //     }
        //     p.flame.x = x+w/2;
        //     p.flame.y = y+h/2;
        //     p.flame.update(dt);
        //     p.flame.draw(ctx);
        // }
        ctx.drawImage(p.canvas, x, y);

        ctx.globalAlpha = 1;
    };

    cxcar.Game.prototype.addPlayerBlob = function (player) {
        console.log('addPlayerBlob', player.color);
        if(!player.canvas) {
            player.canvas = document.createElement('canvas');
        }
        var maskCanvas = document.createElement('canvas'),
            maskCtx = maskCanvas.getContext('2d'),
            i,
            img = player.rank == 1 ? playerLeadImg: playerImg;

        maskCanvas.width = player.canvas.width = playerWidth * this.xScale;
        maskCanvas.height = player.canvas.height = playerHeight * this.yScale;
        maskCtx.drawImage(playerImgMask, 0, 0, player.canvas.width, player.canvas.height);
        
        var ctx = player.canvas.getContext('2d'),
            a = ctx.drawImage(img, 0, 0, player.canvas.width, player.canvas.height),
            c = ctx.getImageData(0, 0, player.canvas.width, player.canvas.height),
            cMask = maskCtx.getImageData(0, 0, player.canvas.width, player.canvas.height);
            l = playerWidth * this.xScale * playerHeight * this.yScale * 4,
            rgb = new RGBColor(player.color);
//color the player

        for (var i = 0; i < l; i += 4) {
            if(cMask.data[i+3] > 100) {
                c.data[i] = Math.floor(cMask.data[i] * cMask.data[i + 3] * rgb.r / (255 * 255));
                c.data[i + 1] = Math.floor(cMask.data[i + 1] * cMask.data[i + 3] * rgb.g / (255 * 255));
                c.data[i + 2] = Math.floor(cMask.data[i + 2] * cMask.data[i + 3] * rgb.b / (255 * 255));    
            }
        }
        ctx.putImageData(c, 0, 0);
    }
    
    cxcar.Game.prototype.renderObstacle = function (o, ctx) {
        var posX = 0,
            posY = 0;
            //ctx.fillRect(o.x * this.xScale, o.y * this.yScale, 10 * this.xScale, 10 * this.yScale);
            ctx.drawImage(opponentImg, o.x * this.xScale, o.y * this.yScale, 10 * this.xScale, 10 * this.yScale);
        // ctx.shadowOffsetX = posX + 2;
        // ctx.shadowBlur = blur;
        // ctx.font = "70px Georgia";
        // //ctx.fillRect(b.x * this.xScale, 0, b.w * this.yScale, b.hy1 * this.yScale);
        // //ctx.fillRect(b.x * this.xScale, b.hy2 * this.yScale, b.w * this.yScale, 100 * this.yScale);

        // //
        // ctx.save();
        // ctx.translate(b.x * this.xScale + 48, b.hy1 * this.yScale + 5);
        // ctx.rotate(-Math.PI/2);

        // ctx.restore();

        // ctx.save();
        // ctx.translate(b.x * this.xScale + 10, b.hy2 * this.yScale - 5);
        // ctx.rotate(Math.PI/2);

        ctx.restore();
    };


    function CXPlayer() {
        this.x = 0;
        this.y = 0;
    }

}(window.cxcar, window));