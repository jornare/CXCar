(function(angular){

    angular.module('app', ['ngTouch', 'ngRoute', 'ngAnimate'])
    .config(['$routeProvider',
        function($routeProvider){
            $routeProvider.
              when('/', {
                templateUrl: '/menu',
                controller: 'MenuCtrl'
              }).
              when('/menu', {
                templateUrl: '/menu',
                controller: 'MenuCtrl'
              }).
              when('/highscores', {
                templateUrl: '/highscores',
                controller: 'HighscoresCtrl'
              }).
              when('/game', {
                templateUrl: '/game',
                controller: 'GameCtrl'
              }).
              when('/player', {
                templateUrl: '/player',
                controller: 'PlayerCtrl'
              }).
              when('/raffle', {
                  templateUrl: '/raffle',
                  controller: 'RaffleCtrl'
              }).
              otherwise({
                redirectTo: '/'
              });
        }]);


    if (document.addEventListener) {
        document.addEventListener('contextmenu', function (e) {
            e.preventDefault();
        }, false);
    } else {
        document.attachEvent('oncontextmenu', function () {
            window.event.returnValue = false;
        });
    }

    //we need to set the background color
    var bg3Img = new Image();
    bg3Img.onload = function () { //find the bottom left pixel of the background image to make a smooth transition. 
        var canvas = document.createElement('canvas'), ctx, px;
        canvas.width = this.width;
        canvas.height = this.height;
        ctx = canvas.getContext('2d');
        ctx.drawImage(this, 0, 0, this.width, this.height);
        px = ctx.getImageData(0, this.height - 1, 1, 1).data;
        setTimeout(function(){
          document.body.style.backgroundColor = 'rgb(' + px[0] + ',' + px[1] + ',' + px[2] + ')';         
        }, 50);

    };
    //start loading backgrounds, must be after onload event handler
    bg3Img.src = '/theme/bg3.png';

}(angular));



