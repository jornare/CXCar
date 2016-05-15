(function(angular, io){
     angular.module('app')
        .service('$socket', function(){

            return io.connect('http://' + location.host);

            });

}(angular, io));