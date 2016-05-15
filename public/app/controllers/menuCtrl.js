(function (angular) {

    angular.module('app')
        .controller('MenuCtrl', ['$scope', '$game', '$timeout', '$socket',
            function ($scope, $game, $timeout, $socket) {
                $scope.username = '';
                $scope.players = $game.players;
                $scope.player = $game.me;
                $scope.$game = $game;
                // $scope.$watch('username', function () {
                //     if ($scope.username) {
                //         $scope.player.online = true;
                //     }
                // });

                $scope.resetHandleError = function() {
                    $scope.handleError = '';
                }

                $scope.setHandle = function () {
                    $game.setHandle($scope.username);
                };

                $scope.$watch('$game.me', function () {
                    $scope.player = $game.me;
                    if ($scope.player && $scope.player.handle) {
                        $scope.handleError = null;
                    }
                });

                $socket.on('handleInUse', function(data) {
                    console.log(data);
                    $scope.handleError = data.error;
                });

                $timeout(function () {
                    $scope.$apply();
                }, 5000);
            }]);

}(angular));