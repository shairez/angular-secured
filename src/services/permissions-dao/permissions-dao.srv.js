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
      'CacheFactory',
      'ngSecured.cacheKeys',
      '$q'
    ];
    function factory($http,
                     CacheFactory,
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
          var permissionsCache = getPermissionsCache();
          permissionsCache.put(cacheKeys.PERMISSIONS, permissions);
          cachedPermissions = permissions;
          return permissions;
        }
      }

      function getPermissionsCache() {
        var permissionsCache = CacheFactory.get(cacheKeys.PERMISSIONS_CACHE);
        if (!permissionsCache) {
          permissionsCache = CacheFactory(cacheKeys.PERMISSIONS_CACHE);
        }
        return permissionsCache;
      }

      function getCachedPermissions() {
        if (cachedPermissions){
          return cachedPermissions;
        }
        var permissionsCache = getPermissionsCache();
        cachedPermissions = permissionsCache.get(cacheKeys.PERMISSIONS);
        return cachedPermissions;
      }


      return permissionsDao;

    }
  }

})();
