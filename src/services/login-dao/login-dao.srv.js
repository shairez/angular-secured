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


  factory.$inject = ['$http',
                     'ngSecured.cacheKeys',
                     'CacheFactory',
                     '$parse',
                     '$q'];
  function factory($http,
                   cacheKeys,
                   CacheFactory,
                   $parse,
                   $q) {

    var inMemoryToken;

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
            console.warn("Can't find maxAgeResponsePath '" +
                         loginConfig.tokenAgeJsonPath +
                         "', just so you know")
          }
        }

        var token = $parse(loginConfig.tokenJsonPath)(response.data);
        if (!token) {
          return $q.reject("Couldn't find the token on the response in the path - '"+
                           loginConfig.tokenJsonPath
                           +"', check your configuration");
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
      var loginCache = getLoginCache();
      if (loginCache) loginCache.remove(cacheKeys.TOKEN);
    }

    function setToken(token, maxAge){

      if (!maxAge){
        maxAge = loginConfig.defaultTokenAge;
      }
      inMemoryToken = token;

      var loginCache = CacheFactory(cacheKeys.LOGIN_CACHE, {maxAge: maxAge});
      loginCache.put(cacheKeys.TOKEN, token);
    }

    function getToken(){
      if (inMemoryToken) return inMemoryToken;

      var loginCache = getLoginCache();
      if (loginCache){
        return loginCache.get(cacheKeys.TOKEN);
      }
    }

    function getLoginCache() {
      return CacheFactory.get(cacheKeys.LOGIN_CACHE);
    }

  }

})();
