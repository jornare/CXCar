(function(angular, RGBColor, cxcar){
 

    angular.module('app')
        .directive('cxcar', function() {
            return {
                    restrict:'E',
                    scope: {
                        game:'='
                    },
                    link: function(scope, element, attrs){
                        //var playerImg = document.createElement('img');
                        //playerImg.src = '../../img/computasLogo.png';
                        var canvas = document.createElement('canvas');
                        canvas.setAttribute('id','canvas');
                        canvas.setAttribute('width','100%');
                        canvas.setAttribute('height','100%');
                        canvas.width="1000";
                        canvas.height="600";
                        element[0].appendChild(canvas);
                        scope.cxcar = new cxcar.Game(canvas.getContext('2d'), scope.game);
                       // new GameObjectManager().startupGameObjectManager();
                        scope.cxcar.start();

                        scope.$on('$destroy', function() {
                            scope.cxcar.stop();
                            delete scope.cxcar;
                        });
                    }
                };
            });

}(angular, RGBColor, window.cxcar));










