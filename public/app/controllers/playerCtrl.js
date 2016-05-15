(function(angular){


    angular.module('app')
        .controller('PlayerCtrl',
            ['$scope', '$game', '$socket', '$location',
            function ($scope, $game, $socket, $location) {
                $scope.$game = $game;
                $scope.fly = $game.fly;
                $scope.color = 'gray';
                $scope.me = $game.me;
                $scope.$watch('$game.me', function (me) {
                    if (me) {
                        $scope.me = me;
                        if (!me.handle) {
                            $location.url('/');
                            return;
                        }
                        $scope.color = me.color;
                        $scope.$watch('me.color', function (color) {
                            if (color) {
                                $scope.color = me.color;
                            }
                        });
                        $scope.$watch('me.playing', function (playing) {
                            if (!playing) {
                                $game.play();
                            }

                        });
                    }
                });


                $scope.$on('$destroy', function () {
                    $game.stopPlay();
                });

        }]);

}(angular));