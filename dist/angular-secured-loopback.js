(function(){
    angular
      .module('ngSecured.loopback', ['ngSecured']);
})();
;(function () {
  angular
    .module('ngSecured.loopback')
    .provider('ngSecured.authAdapter', provider);

  var adapterConfig = {
    loginUrl: '',
    logoutUrl: '',
    tokenJsonPath: '',
    tokenAgeJsonPath: '',
    defaultTokenAge: 60 * 60 * 1000
  };

  provider.$inject = [
  ];

  function provider() {

    this.setup = setup;
    this.$get = srv;

    function setup(config) {
      angular.extend(adapterConfig, config);
    }
  }

   srv.$inject = [
    '$http',
    'ngSecured.cacheKeys',
    'localStorageService',
    '$parse',
    '$q',
    'ngSecured.errorMessages',
    '$log'
  ];
  function srv($http,
               cacheKeys,
               localStorageService,
               $parse,
               $q,
               errorMessages,
               $log) {

    var inMemoryToken,
      wrongPathMsg = errorMessages.WRONG_JSON_PATH;

    init();

    var adapter = {};
    adapter.login = login;
    adapter.isLoggedIn = isLoggedIn;
    adapter.logout = logout;
    adapter.getToken = getToken;
    adapter.setToken = setToken;

    return adapter;


    function init(){
      if (!inMemoryToken){
        inMemoryToken = getToken();
      }
    }

    function login(credentials) {

      return $http
        .post(adapterConfig.loginUrl, credentials)
        .then(success);

      function success(response) {
        var maxAge;

        if (adapterConfig.tokenAgeJsonPath) {
          maxAge = $parse(adapterConfig.tokenAgeJsonPath)(response.data);
          if (!maxAge) {
            $log.warn(wrongPathMsg +
                      ' tokenAge , using the default instead');
          }
        }

        var token = $parse(adapterConfig.tokenJsonPath)(response.data);
        if (!token) {
          var errorMsg = 'Token ' + wrongPathMsg + '"' + adapterConfig.tokenJsonPath + '"';
          $log.error(errorMsg);
          return $q.reject(new Error(errorMsg));
        }

        setToken(token, maxAge);

        return response.data;
      }
    }

    function isLoggedIn() {
      return !!getToken();
    }

    function logout() {
      var token = getToken();
      var logoutUrl = adapterConfig.logoutUrl;
      if (logoutUrl) {
        $http.post(logoutUrl, null, {
          headers: {
            Authorization: token
          }
        })
          .catch(function (error) {
                   $log.error(error.data);
                 });
      }
      inMemoryToken = null;
      localStorageService.remove(cacheKeys.TOKEN);
    }

    function setToken(token, maxAge) {

      if (!maxAge) {
        maxAge = adapterConfig.defaultTokenAge;
      }
      inMemoryToken = token;
      localStorageService.set(cacheKeys.TOKEN, token);
    }

    function getToken() {
      if (inMemoryToken) return inMemoryToken;

      return localStorageService.get(cacheKeys.TOKEN);
    }

  }


})
();
;(function(){
    angular
      .module('ngSecured.loopback')
      .provider('ngSecuredLoopback', provider);

  provider.$inject = [
    'ngSecured.authAdapterProvider',
    '$httpProvider'
  ];
  function provider(authAdapterProvider,
                    $httpProvider){

    this.setup = setup;

    function setup(config){
      authAdapterProvider.setup(config);
      $httpProvider.interceptors.push('ngSecured.tokenInterceptor');
    }

    this.$get = function(){

    }

  }
})();
;(function(){
    angular
      .module('ngSecured.loopback')
      .factory('ngSecured.tokenInterceptor', factory);

  factory.$inject = [
    '$injector'
  ];
  function factory($injector){

    var interceptor = {};

    interceptor.request = request;

    function request(config){
      var authAdapter = $injector.get('ngSecured.authAdapter');
      var token = authAdapter.getToken();
      if (token){
        config.headers['Authorization'] = token;
      }
      return config;
    }

    return interceptor;
  }

})();
