(function () {

  angular
    .module('ngSecured.services')
    .provider('ngSecured.permissionsDao', provider);

  provider.$inject = [];

  function provider() {

    var permissionsConfig = {
      permissionsUrl: ''
    };

    this.setup = setup;
    this.$get = factory;

    function setup(config) {
      angular.extend(permissionsConfig, config);
    }


    factory.$inject = [
      '$http',
      'localStorageService',
      'ngSecured.cacheKeys',
      '$q'
    ];
    function factory($http,
                     localStorageService,
                     cacheKeys,
                     $q) {

      var cachedPermissions;

      var permissionsDao = {};

      permissionsDao.getPermissions = getPermissions;

      function getPermissions(shouldRefresh) {
        if (!shouldRefresh) {
          cachedPermissions = getCachedPermissions();
          if (cachedPermissions) {
            return $q.when(cachedPermissions);
          }
        }

        return $http.get(permissionsConfig.permissionsUrl)
          .then(success);

        function success(response) {
          var permissions = response.data;
          localStorageService.set(cacheKeys.PERMISSIONS, permissions);
          cachedPermissions = permissions;
          return permissions;
        }
      }

      function getCachedPermissions() {
        if (cachedPermissions){
          return cachedPermissions;
        }
        cachedPermissions = localStorageService.get(cacheKeys.PERMISSIONS);
        return cachedPermissions;
      }


      return permissionsDao;

    }
  }

})();
