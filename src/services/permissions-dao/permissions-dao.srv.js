(function () {

  angular
    .module('ngSecured.services')
    .provider('ngSecured.permissionsDao', provider);

  provider.$inject = [];

  function provider() {

    var permissionsConfig = {
      url: '',
      permissionsJsonPath: ''
    };

    this.setup = setup;
    this.$get = factory;

    function setup(config) {
      angular.extend(permissionsConfig, config);
    }


    factory.$inject = [
      '$http',
      '$parse',
      '$log',
      'localStorageService',
      'ngSecured.cacheKeys',
      'ngSecured.errorMessages',
      '$q'
    ];
    function factory($http,
                     $parse,
                     $log,
                     localStorageService,
                     cacheKeys,
                     errorMessages,
                     $q) {

      var cachedPermissions;

      var permissionsDao = {};

      permissionsDao.find = find;
      permissionsDao.clear = clear;

      function find(shouldRefresh) {
        if (!shouldRefresh) {
          cachedPermissions = getCachedPermissions();
          if (cachedPermissions) {
            return $q.when(cachedPermissions);
          }
        }
        if (!permissionsConfig.url){
          return $q.reject(errorMessages.NO_PERMISSIONS_URL);
        }

        return $http.get(permissionsConfig.url)
          .then(success);

        function success(response) {
          var permissions = response.data;
          var jsonPath = permissionsConfig.permissionsJsonPath;
          if (jsonPath){
            permissions = $parse(jsonPath)(permissions)
            if (!permissions){
              var errorMsg = 'Permission url' + errorMessages.WRONG_JSON_PATH + '"'+ jsonPath + '"';
              $log.error(errorMsg);
              return $q.reject(new Error(errorMsg));

            }
          }

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

      function clear(){
        cachedPermissions = null;
        localStorageService.remove(cacheKeys.PERMISSIONS);
      }

      return permissionsDao;

    }
  }

})();
