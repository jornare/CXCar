(function(angular){

    angular.module('app')
        .service('$player', ['$socket', function($socket) {
            function fly(){

                }
            return {
                    handle: '',
                    highscore: 0,
                    fly: fly
                }
            }]);

}(angular));