(function (angular) {

    angular.module('app')
        .filter('truncateHandle', function () {
            return function (handle) {
                if (handle.length > 20) {
                    return handle.substring(0, 17) + '...';
                }
                else {
                    return handle;
                }
            };
        });

}(angular));