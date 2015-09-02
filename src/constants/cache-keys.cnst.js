(function () {

  angular.module('ngSecured.services')
    .constant('ngSecured.cacheKeys', {
      TOKEN: 'token',
      LAST_STATE: 'lastState',
      PERMISSIONS_CACHE: 'permissionsCache',
      PERMISSIONS: 'permissions'
    });

})();
