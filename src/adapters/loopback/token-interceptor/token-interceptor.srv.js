(function(){
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
