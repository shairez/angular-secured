(function () {

  angular
    .module('ngSecured')
    .provider('ngSecured.loginDao', provider);


  var loginConfig = {
    loginUrl: '',
    tokenJsonPath: '',
    tokenAgeJsonPath: '',
    defaultTokenAge: 60 * 60 * 1000
  };

  provider.$inject = [];

  function provider() {

    this.setup = setup;
    this.$get = factory;

    function setup(config) {
      angular.extend(loginConfig, config);
    }
  }


  factory.$inject =
    ['$http',
     'ngSecured.cacheKeys',
     'localStorageService',
     '$parse',
     '$q',
     'ngSecured.errorMessages',
     '$log'
    ];
  function factory($http,
                   cacheKeys,
                   localStorageService,
                   $parse,
                   $q,
                   errorMessages,
                   $log) {

    var inMemoryToken,
      wrongPathMsg = errorMessages.WRONG_JSON_PATH;

    var loginDao = {};
    loginDao.login = login;
    loginDao.isLoggedIn = isLoggedIn;
    loginDao.logout = logout;
    loginDao.getToken = getToken;
    loginDao.setToken = setToken;

    return loginDao;


    function login(credentials) {
      return $http
        .post(loginConfig.loginUrl, credentials)
        .then(success);

      function success(response) {
        var maxAge;

        if (loginConfig.tokenAgeJsonPath) {
          maxAge = $parse(loginConfig.tokenAgeJsonPath)(response.data);
          if (!maxAge) {
            $log.warn(wrongPathMsg +
                         ' tokenAge , using the default instead');
          }
        }

        var token = $parse(loginConfig.tokenJsonPath)(response.data);
        if (!token) {
          var errorMsg = 'Token ' + wrongPathMsg + '"' + loginConfig.tokenJsonPath + '"';
          $log.error(errorMsg);
          return $q.reject(new Error(errorMsg));
        }
        logout();

        setToken(token, maxAge);

        return response.data;
      }
    }


    function isLoggedIn() {
      return !!getToken();
    }

    function logout() {
      inMemoryToken = null;
      localStorageService.remove(cacheKeys.TOKEN);
    }

    function setToken(token, maxAge) {

      if (!maxAge) {
        maxAge = loginConfig.defaultTokenAge;
      }
      inMemoryToken = token;
      localStorageService.set(cacheKeys.TOKEN, token);
    }

    function getToken() {
      if (inMemoryToken) return inMemoryToken;

      return localStorageService.get(cacheKeys.TOKEN);
    }

  }

})();
