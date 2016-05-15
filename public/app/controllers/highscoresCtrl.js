(function (angular) {

    angular.module('app')
        .controller('HighscoresCtrl', ['$scope', '$game', function ($scope, $game) {
            $scope.title = 'Hallo';
            $scope.highscores = $game.highscores;
            $scope.$game = $game;

        }]);

}(angular));