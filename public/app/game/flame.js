window.cx = window.cx || {};
if (typeof Audio === undefined) {
    var Audio = { play: function () { }, canPlayType: function () { return false }};
}
(function (ns) {
    var TWOPI = Math.PI * 2;
    //var tss = new Audio("");
    ns.Flame = function (x, y, r) {
        var self = this;
        var scene = {gravx: 2, gravy: 3, height:900};
        this.r = r;
        this.x = x;
        this.y = y;
        this.particles = [];
        this.colors = [];
        //this.flare = new Image();
        //this.flare.src = 'img/flare.png';
        this.flareWidth = 1;
        this.flareHeight = 1;
        this.heatCenterY = 1;
        this.dead = false;
       /* this.flare.onload = function () {
            self.flareWidth = self.flare.width * scene.scale.x;
            self.flareHeight = self.flare.height * scene.scale.y;
            self.heatCenterY = self.y - self.flareHeight * 0.2;
        };*/
        // prepare palette function
        this.preparePalette = function () {
            for (var i = 0; i < 64; ++i) {
                //	    	self.colors[i] = {r: 255, g: 255, b: 63-i << 1, a: 255-i};
                //	    	self.colors[i+64] = {r: 0, g: 0, b: 0, a: 192-i};

                //fin gul flamme
                //self.colors[i] = { r: 255, g: 255, b: (63 - i) << 2, a: 128 - i };
                //self.colors[i + 64] = { r: 255, g: 255 - i, b: 0, a: 64 - i };

                self.colors[i] = { r: 255, g: 255, b: (63 - i) << 2, a: 128 - i };
                self.colors[i + 64] = { r: 255, g: 255 - i, b: 0, a: 64 - i };



                /* self.colors[i + 0] = {r: 0, g: 0, b: i << 1, a: i};
                self.colors[i + 64] = {r: i << 3, g: 0, b: 128 - (i << 2), a: i+64};
                self.colors[i + 128] = {r: 255, g: i << 1, b: 0, a: i+128};
                self.colors[i + 192] = {r: 255, g: 255, b: i << 2, a: i+192};*/
            }
        }

        this.create = function () {
            self.preparePalette();
            for (var i = 0; i < 15; i++) {
                this.particles.push(new Particle(self.x, self.y, self.r));
            }
        };

        this.update = function (elapsed) {
            var numParticles = self.particles.length,
                p;
            for (i = 0; i < numParticles; i++) {
                p = self.particles[i];
                //lets move the particles
                p.remaining_life -= elapsed;
                p.radius -= elapsed * 0.002;


                p.location.x += p.speed.x * elapsed;////p.speed.x*(scene.gravx+1.0)*5;
                p.location.y += p.speed.y * elapsed;//p.speed.y*(scene.gravy+1.0)*5;

                //regenerate particles
                if (p.remaining_life < 0 || p.radius < 0) {
                    //a brand new particle replacing the dead one
                    self.particles[i] = new Particle(self.x, self.y, self.r);
                }


            }

        };

     

        this.draw = function (ctx) {
            if (this.dead) {
                return;
            }
            var numParticles = self.particles.length,
                xavg = 0.0,
                colors = self.colors,
                numcolors = colors.length,
                i;

            ctx.fillStyle = "black";
            ctx.globalCompositeOperation = "lighter";

            for (i = 0; i < numParticles; i++) {
                xavg += self.x - self.particles[i].location.x;
            }
            xavg /= numParticles;

            //ctx.drawImage(self.flare, self.x - self.flareWidth / 2 - xavg, self.y - self.flareHeight / 2, self.flareWidth, self.flareHeight);
            ctx.globalCompositeOperation = "source-over";
            for (i = 0; i < numParticles; i++) {
                var p = self.particles[i],
                    index = Math.min((10 + self.y - p.location.y) << 0, numcolors - 1);
                if (p.remaining_life == 0) {
                    continue;
                }
                if (index < 0) {
                    index = 0;
                } else if (index > 40) {
                    index = 40;
                }
                var c = colors[index];
                ctx.beginPath();
                //changing opacity according to the life.
                //opacity goes to 0 at the end of life of a particle
                p.opacity = Math.round(p.remaining_life / p.life * 100) / 200 * c.a;
                //a gradient instead of white fill
                var gradient = ctx.createRadialGradient(p.location.x, p.location.y, 0, p.location.x, p.location.y, p.radius);
                gradient.addColorStop(0, "rgba(" + c.r + ", " + c.g + ", " + c.b + ", " + p.opacity + ")");
                gradient.addColorStop(1, "rgba(" + c.r + ", " + c.g + ", " + c.b + ", 0)");
                ctx.fillStyle = gradient;
                ctx.arc(p.location.x, p.location.y, p.radius, TWOPI, false);
                ctx.fill();
            }

        };

        this.touch = function (x, y) {
            if (x - 10 < this.x && x + 10 > this.x && y - 10 < this.y && y + 10 > this.y) {
                this.dead = true;
            } else if (this.dead) {
                var self = this;
                setTimeout(function () {
                    self.dead = false;
                }, 3000);
            }
        }

        function Particle(x, y, r) {
            this.speed = { x: -(scene.gravx * 2 + Math.random()) * 0.05, y: -(scene.gravy * 2 + Math.random()) * 0.05 };
            this.location = { x: x, y: y };
            //radius range = 10-30
            this.radius = r/2 + Math.random() * r;
            //life range = 20-30
            this.life = (r + Math.random() * r) ;
            this.remaining_life = this.life;
        };
        this.create();
    }



}(window.cxcar));

