(function(angular){

    angular.module('app')
        .service('$player', ['$socket', function($socket) {
            function move(){

                }
            return {
                    handle: '',
                    highscore: 0,
                    move: move
                }
            }]);

}(angular));